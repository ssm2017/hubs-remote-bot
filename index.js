const express = require('express'); // Adding Express
const app = express(); // Initializing Express
const puppeteer = require('puppeteer'); // Adding Puppeteer
const querystring = require("query-string");
const {Server} = require('node-osc');

var params = {
	bot: true,
	allow_multi: true
};

var settings = {
	assets_folder: "./assets",
	use_audio: true,
	audio_file: "bot-recording.mp3",
	use_data: true,
	//data_file: "bot-recording.json",
	data_file: "dev-recording.json",
	audio_level: 1
};

var retryCount = 5;
var backoff = 1000;
var host = "hubs.mozilla.com";
var room = "jtbhYFh/adorable-cultured-venture";
var spawnPoint = "";
var bot_name = "bot-" + Math.random();

// web server
app.listen(7000, function() {
	console.log('Http server started on port 7000.');
});

// osc server
var server = new Server(3333, '0.0.0.0');
console.log('OSC server started on port 3333');

function log(...objs) {
	console.log.call(null, [new Date().toISOString()].concat(objs).join(" "));
}

(async () => {
	const browser = await puppeteer.launch({
	  ignoreHTTPSErrors: true,
	  args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blacklist", "--ignore-certificate-errors"],
	  userDataDir: './assets/chrome-profile/User Data/',
	  headless: true
	});

	var page = {};
	const createPage = async () => {
		page = await browser.newPage();
		await page.setBypassCSP(true);
		page.on("console", msg => log("PAGE: ", msg.text()));
		page.on("error", err => log("ERROR: ", err.toString().split("\n")[0]));
		page.on("pageerror", err => log("PAGE ERROR: ", err.toString().split("\n")[0]));
	}
	
	// spawn the bot
	const navigate = async () => {
		if ((typeof page.url !== "function")) {
			await createPage();
		}
		log(page);
	  try {
		log("Spawning bot...");
		var baseUrl = `https://${host}/${room}` || `https://${host}/hub.html`;
		var url = `${baseUrl}?${querystring.stringify(params)}${spawnPoint}`;
		log(url);
		await page.goto(url);
		await page.evaluate(() => console.log(navigator.userAgent));
		/*await page.evaluate(() => {
		  window.APP.store.update({
			activity: {
			  hasChangedName: true,
			  hasAcceptedProfile: true
			},
			profile: {
			  // Prepend (bot) to the name so other users know it's a bot
			  displayName: "bot-a"
		  }})
		});*/
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
			if (settings.use_audio) {
				const audioInput = await page.waitForSelector("#bot-audio-input");
				audioInput.uploadFile(settings.assets_folder + '/' + settings.audio_file);
				log("Uploaded audio file.");
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
			if (settings.use_data) {
				const dataInput = await page.waitForSelector("#bot-data-input");
				dataInput.uploadFile(settings.assets_folder + '/' + settings.data_file);
				log("Uploaded data file.");
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
			await page.evaluate(async () => {
				window.APP.hubChannel.sendMessage("create object");
				let el = document.createElement("a-entity");
				let loaded = new Promise((r, e) => { el.addEventListener('loaded', r, {once: true})});
				el.setAttribute('scale', '1 1 1');
				el.setAttribute('position', `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`);
				el.setAttribute('rotation', '0 0 0');
				el.setAttribute('media-loader', {src: 'https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb', resolve: true});
				el.setAttribute('networked', {template: '#interactable-media'});

				document.querySelector('a-scene').append(el);
				await loaded;

				let netEl = await NAF.utils.getNetworkedEntity(el);

				// phys
				await new Promise((r,e) => window.setTimeout(r, 200))
				async function drop() {
				window.APP.hubChannel.sendMessage("phys");

				if (!NAF.utils.isMine(netEl)) await NAF.utils.takeOwnership(netEl)

				netEl.setAttribute('floaty-object', {
					autoLockOnLoad: false,
					gravitySpeedLimit: 0,
					modifyGravityOnRelease: false
				})

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
			}

			await drop()
		});
			

		log("create object");
		} catch (e) {
		// Ignore errors. This usually happens when the page is shutting down.
		}
	}

	// dropImage
	const dropImage = async () => {
		try {
			await page.evaluate(async () => {
				window.APP.hubChannel.sendMessage("create object");
				let el = document.createElement("a-entity");
				let loaded = new Promise((r, e) => { el.addEventListener('loaded', r, {once: true})});
				el.setAttribute('scale', '1 1 1');
				el.setAttribute('position', `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`);
				el.setAttribute('rotation', '0 0 0');
				el.setAttribute('media-loader', {src: 'http://www.lehublot.net/wp-content/themes/discovery-child/img/bandeau_social_lab.gif', resolve: true});
				el.setAttribute('networked', {template: '#interactable-media'});
				el.setAttribute('data', {projection: '360-equirectangular'});

				document.querySelector('a-scene').append(el);
				await loaded;

				let netEl = await NAF.utils.getNetworkedEntity(el);

		});
			

		log("create image");
		} catch (e) {
		// Ignore errors. This usually happens when the page is shutting down.
		}
	}

	const disconnect = async () => {
		console.log('closing page');
		if ((typeof page.url === "function")) {
			await page.close();
		}
	}
  
	const getStatus = async () => {
		console.log('reading pages');
		const pages = await browser.pages();
		console.log(pages.map(page => page.url()));
	}

	const experiences = async () => {
		try {
			await createPage();
			await page.goto("http://sebmas.com");
			await page.evaluate(() => console.log(navigator.userAgent));
			await page.evaluate(async () => {
				const person = {
					name: "Obaseki Nosa",
					location: "dd",
				};
				
				window.localStorage.setItem('user', JSON.stringify(person));
			});
			await page.evaluate(async () => {
				let value = window.localStorage.getItem('user');
				console.log("iii" + value);
			});
		} catch (e) {
			// Ignore errors. This usually happens when the page is shutting down.
		}
	}
	// express
	app.get('/', function(req, res) {
		res.send('Test');
	});

	app.get('/start', function(req, res) {
		spawnPoint = req.query.sp ? `#${req.query.sp}` : "";
		params.hub_id = req.query.hub_id ? `#${req.query.hub_id}` : "";
		bot_name = req.query.bot_name ? `${req.query.bot_name}` : "bot-" + Math.random();
		res.send('Starting process...' + params.sp);
		navigate();
	});

	app.get('/stop', function(req, res) {
		res.send('Stopping process...');
		disconnect();
		getStatus();
	});

	app.get('/status', function(req, res) {
		experiences();
		res.send('url : ' + getStatus());
		
	});

	app.get('/poweroff', function(req, res) {
		log("PowerOff.");
		process.exit(0);
		
	});

	app.get('/speak', function(req, res) {
		res.send('Starting to speak...');
		speak();
	});

	app.get('/motion', function(req, res) {
		settings.data_file = req.query.file ? req.query.file : settings.data_file;
		res.send('Starting to move... file = '+settings.data_file);
		motion();
	});

	app.get('/drop', function(req, res) {
		res.send('Starting to drop...');
		dropObject();
	});

	app.get('/dropimage', function(req, res) {
		res.send('Starting to drop an image...');
		dropImage();
	});

	// osc
	server.on('listening', () => {
		console.log('OSC Server is listening.');
	});

	server.on('message', (msg) => {
		console.log(`Message: ${msg}`);
	//server.close();
	});

  })();

