const { v4: uuidv4 } = require('uuid');
// http
const express = require('express');
const httpServer = express();
// osc
const {Server} = require('node-osc');
// hubsbot
const {HubsBot} = require('HubsBot');

const config = require('./config/config.json');

// start web server
httpServer.listen(config.http_port, function() {
	console.log('Http server started on port %s', config.http_port);
});
httpServer.use(express.static('public'));

// start osc server
var OSCserver = new Server(config.osc_port, '0.0.0.0');
console.log('OSC server started on port %s', config.osc_port);

var bots = [];
var my_bot = null;
var retryCount = 5;
var backoff = 1000;

/**
 * utils
 */

// Return the length of an associative array or object
function objectLength(obj) {
	return Object.keys(obj).length;
}
// Return the first element of an associative array or object
function getFirstItem(obj) {
	return obj[Object.keys(obj)[0]];
}
// Return the last element of an associative array or object
function getLastItem(obj) {
	return obj[Object.keys(obj)[objectLength(obj)-1]];
}
// Get the bot uuid
function getBotUuid(bot_uuid) {
	if (bot_uuid == "first") {
		return getFirstItem(bots).uuid;
	} else if (bot_uuid == "last") {
		return getLastItem(bots).uuid;
	}
	if (bots[bot_uuid] === undefined) {
		return null;
	}
	return bot_uuid;
}
// get bot by uuid
function getBotByUuid(bot_uuid) {
	bot_uuid = getBotUuid(bot_uuid);
	if (!bot_uuid) {
		return null;
	}
	for (const uuid in bots) {
		if (uuid == bot_uuid) {
			return bots[uuid];
		}
	}
	return null;
}

/**
 * Main function
 */
(async () => {
	/*
		start the bot
	*/
	async function runBot(params) {
		try {
			console.log("new bot");
			let new_bot = new HubsBot({
				userDataDir: config.user_data_dir
			})
			await new_bot.enterRoom(params.room_url, {name: params.bot_name, spawnPoint: params.spawn_point, audioVolume: 1});
			new_bot.uuid = uuidv4();
			bots[new_bot.uuid] = new_bot;
			return new_bot.uuid;
		} catch(e) {
			console.error("Error creating bot", e);
		}
	}
	/*
		stop the bot
	*/
	async function stopBot(bot_uuid) {
		try {
			if (!objectLength(bots)) {
				return "{'No bot to stop'}";
			}
			if (bot_uuid) {
				const bot = getBotByUuid(bot_uuid);
				if (!bot) {
					return "{'Bot not found'}";
				}
				await bot.page.close();
				console.log("Stopped bot", bot.uuid);
				delete bots[bot.uuid];
				return '{"bot_uuid":'+bot.uuid + '}';
				
			} else {
				let bots_stopped = [];
				for (const uuid in bots) {
					await bots[uuid].page.close();
					console.log("Stopped bot", uuid);
					bots_stopped.push('"bot_uuid:"' + uuid);
					delete bots[uuid];
				}
				return '{' + bots_stopped.join() + '}';
			}
		} catch(e) {
			console.error("Error stopping bot", e);
		}
	}

	/*
		stop the bot
	*/
	async function getStatus() {
		let bot_status = {};
		bot_status.count = objectLength(bots);
		let bots_list = [];
		for (const bot in bots) {
			bots_list.push({
				uuid: bots[bot].uuid,
				name: bots[bot].name
			});
		}
		bot_status.bots = bots_list;
		console.log('Status', bot_status);
		return bot_status;
	}

	/*
		plays an audio file or json file
	*/
	async function playFile(params) {
		try {
			let file_to_play = config.assets_folder + '/' + params.filename;
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.playFile(file_to_play);
			console.log("Playing started... %s", file_to_play);
		} catch(e) {
			console.error("Error playing file", e);
		}
		
	};

	/*
		spawn object
	*/
	async function spawnObject(params) {
		try {
			console.log("spawn");
			if (!params.position) {
				params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
			}
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.spawnObject(params)
		} catch (e) {
			console.error("Error spawning object", e);
		}
	}

	var spawnObjectsLoop = null;
	async function spawnMultipleObjects(params) {
		let randomize = false;
		try {
			if (!spawnObjectsLoop) {
				spawnObjectsLoop = setInterval(() => {
					if (!params.position) {
						randomize = true;
					}
					if (randomize) {
						params.position = null;
					}
					spawnObject(params);
				}, params.pause);
			} else {
				console.log("Multiple spawn already set");
			}

		} catch(e) {
			console.error("Error trying to multiple spawn", e.message);
		}
	}

	async function stopSpawnMultipleObjects() {
		try {
			clearInterval(spawnObjectsLoop);
			spawnObjectsLoop = null;
		} catch(e) {
			console.error("Error trying to stop multiple spawn", e.message);
		}
	}

	async function deleteAllObjects(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.deleteAllObjects();
			console.log("Deleting all");
		} catch (e) {
			console.error("Error deleting all objects:", e.message);
		}
	}
	/*
		move
	*/
	async function goTo (params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.goTo(params);
		} catch(e) {
			console.error("Error trying to go to", e);
		}
	}
	async function jumpTo(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.jumpTo(params.sp);
		} catch(e) {
			console.error("Error trying to jump to", e);
		}
	}

	/*
		say in chat
	*/
	async function say(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = getBotByUuid(params.bot_uuid);
			if (!bot) {
				return "{'Bot not found'}";
			}
			await bot.say(params.message);
			console.log("Bot %s said %s", bot.uuid, params.message);
		} catch (e) {
			console.error("Error trying to say in chat", e);
		}
		
	}
	/*
		listen to the chat
	*/
	async function listenTo(params) {
		try {
			my_bot.page.evaluate(async () => {
				window.APP.hubChannel.channel.on('message', () => {
					window.APP.hubChannel.sendMessage("arrggg");
				})
			});
		} catch (e) {
			console.error("Error trying to listen to the chat", e);
		}
		
	}

	// -----------
	// express
	// -----------
	
	// home
	httpServer.get('/', function(req, res) {
		res.send('Ok');
	});
	// status
	httpServer.get('/status', async(req, res) => {
		let status = await getStatus();
		res.json(status);
	});
	// start
	httpServer.get('/start', async(req, res) => {
		try {
			let params = {
				spawn_point: req.query.spawn_point ? req.query.spawn_point : null,
				bot_name: req.query.bot_name ? req.query.bot_name : "bot-" + Date.now(),
				room_url: req.query.room_url ? req.query.room_url : "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture"
			};
			params.bot_id = await runBot(params);
			res.json(params);
		} catch(e) {
			console.error("Error calling runBot", e);
		}
		
	});
	// stop
	httpServer.get('/stop', async(req, res) => {
		try {
			let bot_uuid = req.query.bot_uuid ? req.query.bot_uuid : null;
			const result = await stopBot(bot_uuid);
			res.json(result);
		} catch (e) {
			console.error("Error stopping bot", e);
		}
	});

	// say
	httpServer.get('/say', async(req, res) => {
		await say({
			message: req.query.message ? req.query.message : "coucou",
			bot_uuid: req.query.bot_uuid ? req.query.bot_uuid : null
		});
		res.send("Saying");
	});

	// play file
	httpServer.get('/play-file', async(req, res) => {
		await playFile({
			filename: req.query.filename ? req.query.filename : config.audio_file
		});
		res.send('Starting to speak...');
	});

	// spawn object
	httpServer.get('/spawn-object', async(req, res) => {
		let params = {
			url: req.query.url ? req.query.url : config.spawnped_object_url,
			position: req.query.position ? req.query.position : null,
			rotation: req.query.rotation ? req.query.rotation : "0 0 0",
			scale: req.query.scale ? req.query.scale : "1 1 1",
			pinned: req.query.pinned ? req.query.pinned : true,
			dynamic: req.query.dynamic ? req.query.dynamic : false,
			projection: req.query.projection ? req.query.projection : null
		};
		await spawnObject(params);
		res.send('Test');
	});
	httpServer.get('/spawn-multiple-objects', function(req, res) {
		let params = {
			url: req.query.url ? req.query.url : config.spawnped_object_url,
			position: req.query.position ? req.query.position : null,
			rotation: req.query.rotation ? req.query.rotation : "0 0 0",
			scale: req.query.scale ? req.query.scale : "1 1 1",
			pinned: req.query.pinned ? req.query.pinned : false,
			dynamic: req.query.dynamic ? req.query.dynamic : false,
			pause: req.query.pause ? req.query.pause : 5000
		};
		spawnMultipleObjects(params);
		res.send('Test');
	});
	httpServer.get('/stop-spawn-multiple-objects', function(req, res) {
		stopSpawnMultipleObjects();
		res.send('Stopping multiple spawning');
	});
	httpServer.get('/delete-all-objects', function(req, res) {
		deleteAllObjects({});
		res.send('Delete all');
	});

	// move
	httpServer.get('/goto', function(req, res) {
		let params = {
			x: req.query.x ? req.query.x : 0,
			y: req.query.y ? req.query.y : 0,
			z: req.query.z ? req.query.z : 0
		};
		goTo(params);
		res.send('Goto');
	});
	httpServer.get('/jump-to', function(req, res) {
		let params = {
			sp: req.query.sp ? req.query.sp : ""
		};
		jumpTo(params);
		res.send('Jumping to...');
	});

	// listen to
	httpServer.get('/listen-to', function(req, res) {
		listenTo({text: "tutu"});
		res.send('toto');
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