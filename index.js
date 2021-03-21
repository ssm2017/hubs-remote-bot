const puppeteer = require('puppeteer');
const querystring = require("query-string");

const express = require('express');
const httpServer = express();
const {Server} = require('node-osc');

const config = require('./config/config.json');

var params = {
	bot: true,
	allow_multi: true
};

var retryCount = 5;
var backoff = 1000;
var bot_name = "bot-" + Date.now();
var spawnPoint = "";
var dropped_object_url = config.dropped_object_url;
var phys = false;
var pinned = true;
var position="0 0 0";
var rotation="0 0 0";
var scale="1 1 1";

// web server
httpServer.listen(config.http_port, function() {
	console.log('Http server started on port 7000.');
});
httpServer.use(express.static('public'));

// osc server
var OSCserver = new Server(config.osc_port, '0.0.0.0');
console.log('OSC server started on port 3333');

// utils
function log(...objs) {
	console.log.call(null, [new Date().toISOString()].concat(objs).join(" "));
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// main
(async () => {
	const browser = await puppeteer.launch({
	  ignoreHTTPSErrors: true,
	  args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blacklist", "--ignore-certificate-errors"],
	  userDataDir: './assets/chrome-profile/User Data/',
	  headless: true
	});

	var page = {};
	const createPage = async () => {
		try {
			log("creating page");
			page = await browser.newPage();
			await page.setBypassCSP(true);
			page.on("console", msg => log("PAGE: ", msg.text()));
			page.on("error", err => log("ERROR: ", err.toString().split("\n")[0]));
			page.on("pageerror", err => log("PAGE ERROR: ", err.toString().split("\n")[0]));
		} catch (e) {
			log("Error creating page", e.message);
		}
	}

	var baseUrl = '';
	var url = '';
	// spawn the bot
	const navigate = async () => {
	  try {
		let pages = await browser.pages();
		if (pages.length < 2) {
		//if ((typeof page.url !== "function")) {
			await createPage();
		}
		log(page);
		log("Spawning bot...");
		let host = config.host;
		let room = config.room;
		baseUrl = `https://${host}/${room}` || `https://${host}/hub.html`;
		url = `${baseUrl}?${querystring.stringify(params)}${spawnPoint}`;
		log(url);

		await page.goto(url);
		await page.evaluate(() => console.log(navigator.userAgent));
		await page.evaluate((bot_name) => {
		  window.APP.store.update({
			activity: {
			  hasChangedName: true,
			  hasAcceptedProfile: true
			},
			profile: {
			  // Prepend (bot) to the name so other users know it's a bot
			  displayName: bot_name
		  }})
		}, bot_name);

		// Do a periodic sanity check of the state of the bots.
		setInterval(async function() {
		  let avatarCounts;
		  try {
			avatarCounts = await page.evaluate(() => ({
			  connectionCount: Object.keys(NAF.connection.adapter.occupants).length,
			  avatarCount: document.querySelectorAll("[networked-avatar]").length - 1
			}));
			log(JSON.stringify(avatarCounts));
  
		  } catch (e) {
			// Ignore errors. This usually happens when the page is shutting down.
		  }
		  // Check for more than two connections to allow for a margin where we have a connection but the a-frame
		  // entity has not initialized yet.
		  if (avatarCounts && avatarCounts.connectionCount > 2 && avatarCounts.avatarCount === 0) {
			// It seems the bots have dog-piled on to a restarting server, so we're going to shut things down and
			// let the hubs-ops bash script restart us.
			log("Detected avatar dog-pile. Restarting.");
			process.exit(1);
		  }
		}, 60 * 1000);
	  } catch (e) {
		log("Navigation error", e.message);
		setTimeout(navigate, 1000);
	  }
	};

	// make it speak
	const speak = async () => {
		try {
			// Interact with the page so that audio can play.
			await page.mouse.click(100, 100);
			if (config.use_audio) {
				const audioInput = await page.waitForSelector("#bot-audio-input");
				audioInput.uploadFile(config.assets_folder + '/' + config.audio_file);
				log("Uploaded audio file : "+config.audio_file);
			}
		} catch (e) {
			log("Interaction error", e.message);
			if (retryCount-- < 0) {
				// If retries failed, throw and restart navigation.
				throw new Error("Retries failed");
			}
			log("Retrying...");
			backoff *= 2;
			// Retry interaction to start audio playback
			setTimeout(speak, backoff);
		}
	};

	// make it move
	const motion = async () => {
		try {
			// Interact with the page so that audio can play.
			await page.mouse.click(100, 100);
			if (config.use_data) {
				const dataInput = await page.waitForSelector("#bot-data-input");
				dataInput.uploadFile(config.assets_folder + '/' + config.data_file);
				log("Uploaded data file : "+ config.data_file);
			}
		} catch (e) {
			log("Interaction error", e.message);
			if (retryCount-- < 0) {
				// If retries failed, throw and restart navigation.
				throw new Error("Retries failed");
			}
			log("Retrying...");
			backoff *= 2;
			// Retry interaction to start audio playback
			setTimeout(motion, backoff);
		}
	};

	// dropObject
	const dropObject = async () => {
		try {
			await page.evaluate(async (dropped_object_url, phys, pinned, position, rotation, scale) => {
				window.APP.hubChannel.sendMessage("create object");
				let el = document.createElement("a-entity");
				let loaded = new Promise((r, e) => { el.addEventListener('loaded', r, {once: true})});
				el.setAttribute('scale', scale);
				//el.setAttribute('position', `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`);
				el.setAttribute('position', position);
				el.setAttribute('rotation', rotation);
				el.setAttribute('media-loader', {src: dropped_object_url, resolve: true});
				el.setAttribute('networked', {template: '#interactable-media'});
				//el.setAttribute('pinnable', {pinned: true});
				//el.setAttribute('pinnable', true);
				document.querySelector('a-scene').append(el);
				await loaded;
				let netEl = await NAF.utils.getNetworkedEntity(el);
				if (!NAF.utils.isMine(netEl)) await NAF.utils.takeOwnership(netEl)
				await new Promise((r,e) => window.setTimeout(r, 1000))
				netEl.setAttribute("pinnable", {pinned: pinned});

				if (phys) {

					// phys
					//await new Promise((r,e) => window.setTimeout(r, 200));
					//const drop = async () => {
						window.APP.hubChannel.sendMessage("phys");

						netEl.setAttribute('floaty-object', {
							autoLockOnLoad: false,
							gravitySpeedLimit: 0,
							modifyGravityOnRelease: false
						});
	
						const DEFAULT_INTERACTABLE = 1 | 2 | 4 | 8
						netEl.setAttribute("body-helper", {
							type: 'dynamic',
							gravity: { x: 0, y: -9.8, z: 0 },
							angularDamping: 0.01,
							linearDamping: 0.01,
							linearSleepingThreshold: 1.6,
							angularSleepingThreshold: 2.5,
							collisionFilterMask: DEFAULT_INTERACTABLE
						});
	
						const physicsSystem = document.querySelector('a-scene').systems["hubs-systems"].physicsSystem;
	
						if (netEl.components["body-helper"].uuid) {
							physicsSystem.activateBody(netEl.components["body-helper"].uuid);
						}
					//}
				}

				//await drop()
			}, dropped_object_url, phys, pinned, position, rotation, scale);

			log("create object");
		} catch (e) {
			console.error("Error trying to drop object : ", e);
		}
	}

	var dropObjectsLoop = null;
	const dropMultipleObjects = async () => {
		try {
			dropObjectsLoop = setInterval(async function() {
				dropObject();
			}, 2000);

		} catch(e) {
			console.error("Error trying to multiple drop", e.message);
		}
	}

	const StopDropMultipleObjects = async () => {
		try {
			clearInterval(dropObjectsLoop);

		} catch(e) {
			console.error("Error trying to stop multiple drop", e.message);
		}
	}

	const createForest = async () => {
		try {
			for (let i=0; i<20; i++) {
				dropped_object_url = "https://uploads-prod.reticulum.io/files/c78a69a1-7d1b-4ff4-b36c-30d3e435d7d0.glb";
				phys = false;
				pinned = false;
				position = ""+ (getRandomInt(50) + 10) + " 0.2 " + (getRandomInt(50) + 5);
				console.log("position : ",position);
				rotation = "0 " + getRandomInt(90) + " 0";
				let rdm_size = (getRandomInt(2)+0.2);
				scale = ""+ rdm_size + " " + rdm_size + " " + rdm_size;
				dropObject();
			}

		} catch(e) {
			console.error("Error trying to create a forest", e.message);
		}
	}

	// dropImage
	const dropImage = async () => {
		try {
			await page.evaluate(async () => {
				window.APP.hubChannel.sendMessage("create image");
				let el = document.createElement("a-entity");
				let loaded = new Promise((r, e) => { el.addEventListener('loaded', r, {once: true})});
				el.setAttribute('scale', '8 2 8');

				await loaded;

				let netEl = await NAF.utils.getNetworkedEntity(el);

			});

			log("create image");
		} catch (e) {
		}
	}

	const jumpTo = async () => {
		try {
			url = `${baseUrl}?${querystring.stringify(params)}${spawnPoint}`;
			await page.goto(url);
			//await page.goto(spawnPoint);
		} catch (e) {
			console.error("Error trying to jump to", e.message);
		}
		
	}

	const listenTo = async () => {
		try {
			await page.evaluate(async () => {
				const watchedNode = document.querySelector('[class^="ChatSidebar__message-list"]');
				var observer = new MutationObserver(function(mutations) {
					let output = {
						serviceMsg: null,
						msg: null
					};
					mutations.forEach(function(mutation) {
						if (mutation.addedNodes) {
						for (var n of mutation.addedNodes) {
							if (n.className.startsWith('ChatSidebar__message-group')) {
							output.serviceMsg = n.firstChild.innerText;
							}
							output.msg = n.lastChild.innerText;
							if (output.serviceMsg) {
							console.log("service: ", output.serviceMsg);
							}
							if (output.msg && output.msg != output.serviceMsg) {
								console.log("msg:", output.msg);
							}
						}
						}
					});
				});
				// start to observe
				observer.observe(watchedNode, {
				childList: true,
				subtree: true
				});
			});
		} catch (e) {
			console.error("Error trying to listen to ...", e.message);
		}
	}

	const disconnect = async () => {
		try {
			console.log('closing page');
			if ((typeof page.url === "function")) {
				await page.close();
			}
		} catch (e) {
			console.error("error happened trying to close the page", e)
		}
	}
  
	const getStatus = async () => {
		try {
			console.log('reading pages');
			const pages = await browser.pages();
			console.log(pages.map(page => page.url()));
		} catch (e) {
			console.error("error happened trying to get the status", e)
		}
	}

	const testLocalStorage = async () => {
		try {
			let pages = await browser.pages();
			console.log("debut", pages.map(page => page.url()));
			if (pages.length < 2) {
				page = await browser.newPage();
			}
			await page.goto('http://sebmas.com');
			console.log("milieu", pages.map(page => page.url()));
			pages = await browser.pages();
			console.log("fin", pages.map(page => page.url()));
			console.log(page.url());
			await page.evaluate(() => {
				console.log("pourquoi");
				const myObj = {
					a: "abcd",
					b: "efgh",
				};
				// write to localStorage
				window.localStorage.setItem('myVar', JSON.stringify(myObj));
				console.log("stored");
			});
			await page.evaluate(() => {
				// read localStorage
				let value = window.localStorage.getItem('myVar');
				console.log("myObj" + value);
			});
		} catch (e) {
			console.error("error happened", e)
		}
	}

	const experiences = async () => {
		/*

		notes pupeeter :
		await page.goto(url, {waitUntil: 'networkidle'})
		const url = await page.evaluate('location.href');

		const getLocation = async (page) => page.evaluate(() => location)
		const getLocationProp = async (page, prop) => (await getLocation(page))[prop]


		*/
		try {
			const urls = [
				'http://sebmas.com',
				'http://lehublot.net'
			];
			await createPage();
			/*for (let i = 0; i < urls.length; i++) {
				const url = urls[i];
				await page.goto(`${url}`);
				await page.waitForNavigation({ waitUntil: 'networkidle2' });
			}*/

		} catch (e) {
			console.error("error happened", e)
		}
	}

	// -----------
	// express
	// -----------
	httpServer.get('/', function(req, res) {
		res.send('Test');
	});

	httpServer.get('/start', function(req, res) {
		spawnPoint = req.query.sp ? `#${req.query.sp}` : "";
		params.hub_id = req.query.hub_id ? `#${req.query.hub_id}` : "";
		bot_name = req.query.bot_name ? `${req.query.bot_name}` : "bot-" + Date.now();
		res.send('Starting process...' + params.sp);
		navigate();
	});

	httpServer.get('/stop', function(req, res) {
		res.send('Stopping process...');
		disconnect();
		getStatus();
	});

	httpServer.get('/status', function(req, res) {
		//experiences();
		testLocalStorage();
		//res.send('url : ' + getStatus());
		res.send('ok');
		
	});

	httpServer.get('/poweroff', function(req, res) {
		log("PowerOff.");
		process.exit(0);
		
	});

	httpServer.get('/speak', function(req, res) {
		res.send('Starting to speak...');
		speak();
	});

	httpServer.get('/motion', function(req, res) {
		config.data_file = req.query.file ? req.query.file : config.data_file;
		res.send('Starting to move... file = '+config.data_file);
		motion();
	});

	httpServer.get('/drop', function(req, res) {
		res.send('Starting to drop...');
		dropObject();
	});

	httpServer.get('/drop-multiple', function(req, res) {
		res.send('Starting to drop...');
		dropMultipleObjects();
	});

	httpServer.get('/stop-drop-multiple', function(req, res) {
		res.send('Stopping to drop...');
		StopDropMultipleObjects();
	});

	httpServer.get('/create-forest', function(req, res) {
		res.send('Starting the forest...');
		createForest();
	});

	httpServer.get('/jump-to', function(req, res) {
		res.send('Jumping to...');
		spawnPoint = req.query.sp ? `#${req.query.sp}` : "";
		jumpTo();
	});

	httpServer.get('/listen-to', function(req, res) {
		res.send('Listening to...');
		listenTo();
	});

	httpServer.get('/dropimage', function(req, res) {
		res.send('Starting to drop an image...');
		dropImage();
	});

	// -----------
	// osc
	// -----------
	OSCserver.on('listening', () => {
		console.log('OSC Server is listening.');
	});

	OSCserver.on('message', (msg) => {
		console.log(`Message: ${msg}`);
		//OSCserver.close();
	});

  })();

