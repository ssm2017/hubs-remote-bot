const { v4: uuidv4 } = require('uuid');
// http
const express = require('express');
const httpServer = express();
// osc
var osc = require("osc");
// hubsbot
const {HubsBot} = require('HubsBot');

const config = require('./config/config.json');
const { response } = require('express');

var bots = [];
var retryCount = 5;
var backoff = 1000;

/**
 * ====================
 *  Start http server
 * ====================
 */
httpServer.listen(config.http_port, function() {
	console.log('Http server started on port %s', config.http_port);
});
httpServer.use(express.static('public'));

/**
 * =====================
 *  Start osc server
 * =====================
 * 
 */
var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var OSCserver = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: config.osc_port
});

OSCserver.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", OSCserver.options.localPort);
    });
});

/**
 * ===============
 * 		utils
 * ===============
 */

/**
 * Return the length of an associative array or object.
 * @param {Object} obj Any object/associative array
 * @returns {int}
 */
function objectLength(obj) {
	return Object.keys(obj).length;
}
/**
 * Return the first element of an associative array or object.
 * @param {object} obj Any object/associative array
 * @returns {int}
 */
function getFirstItem(obj) {
	return obj[Object.keys(obj)[0]];
}
/**
 * Return the last element of an associative array or object.
 * @param {object} obj Any object/associative array
 * @returns {object}
 */
function getLastItem(obj) {
	return obj[Object.keys(obj)[objectLength(obj)-1]];
}
/**
 * Get the bot uuid.
 * @param {uuid} bot_uuid 
 * @returns {uuid}
 */
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
/**
 * Get bot by uuid.
 * @param {uuid} bot_uuid 
 * @returns {object}
 */
function getBotByUuid(bot_uuid) {
	if (!objectLength(bots)) {
		return null;
	}
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

// build json response
function buildJsonResponse(params) {
	let {
		command = "none",
		success = false,
		message = "",
		data = []
	} = params;
	let response = {
		command: command,
		success: success,
		message: message,
		data: data
	};
	console.log(response);
	return response;
}
/**
 * =========================
 * 			Main
 * =========================
 */

/**
 * Start the bot.
 * @param {object} params 
 * @returns {object} json response
 */
async function runBot(params) {
	try {
		let new_bot = new HubsBot({
			userDataDir: config.user_data_dir
		})
		await new_bot.enterRoom(params.room_url, {name: params.bot_name, spawnPoint: params.spawn_point, audioVolume: 1});
		new_bot.uuid = uuidv4();
		bots[new_bot.uuid] = new_bot;
		// build response
		return buildJsonResponse({
			command: "start",
			success: true,
			message: "Bot created",
			data: [{
				bot_uuid: new_bot.uuid,
				bot_name: params.bot_name
			}]
		});
	} catch(e) {
		console.error("Error creating bot", e);
		return buildJsonResponse({
			command: "start",
			success: false,
			message: e.message
		});
	}
}
/**
 * Stop the bot.
 * @param {uuid} bot_uuid 
 * @returns 
 */
async function stopBot(bot_uuid) {
	try {
		if (!objectLength(bots)) {
			return buildJsonResponse({
				command: "stop",
				success: false,
				message: 'No bot to stop'
			});
		}
		if (bot_uuid) {
			const bot = getBotByUuid(bot_uuid);
			if (!bot) {
				return buildJsonResponse({
					command: "stop",
					success: false,
					message: 'Bot not found'
				});
			}
			await bot.page.close();
			delete bots[bot.uuid];
			console.log("Stopped bot", bot.uuid);
			return buildJsonResponse({
				command: "stop",
				success: true,
				message: 'Bot stopped',
				data: [{
					bot_uuid: bot.uuid,
					bot_name: bot.name
				}]
			});
		} else {
			let bots_stopped = [];
			for (const uuid in bots) {
				await bots[uuid].page.close();
				console.log("Stopped bot", uuid);
				bots_stopped.push({
					bot_uuid: uuid,
					bot_name: bots[uuid].name
				});
				delete bots[uuid];
			}
			return buildJsonResponse({
				command: "stop",
				success: true,
				message: 'Bots stopped',
				data: bots_stopped
			});
		}
	} catch(e) {
		console.error("Error stopping bot", e);
		return buildJsonResponse({
			command: "stop",
			success: false,
			message: e.message
		});
	}
}

/**
 * Get status of the bots.
 * @returns 
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
	return buildJsonResponse({
		command: "status",
		success: true,
		message: "Ok",
		data: bot_status
	});
}

/**
 * Plays an audio file or json file.
 * @param {object} params 
 * @returns 
 */
async function playFile(params) {
	try {
		let file_to_play = config.assets_folder + '/' + params.filename;
		if (!params.bot_uuid) {
			params.bot_uuid = "first";
		}
		let bot = getBotByUuid(params.bot_uuid);
		if (!bot) {
			return buildJsonResponse({
				command: "play-file",
				success: false,
				message: "Bot not found"
			});
		}
		await bot.playFile(file_to_play);
		return buildJsonResponse({
			command: "play-file",
			success: true,
			message: "Playing file",
			data: [{
				file: file_to_play,
				bot: {
					bot_uuid: bot.uuid,
					bot_name: bot.name
				}
			}]
		});
	} catch(e) {
		return buildJsonResponse({
			command: "play-file",
			success: false,
			message: e.message
		});
	}
	
};

/**
 * Spawn object.
 * @param {object} params 
 * @returns 
 */
async function spawnObject(params) {
	try {
		if (!params.bot_uuid) {
			params.bot_uuid = "first";
		}
		let bot = getBotByUuid(params.bot_uuid);
		if (!bot) {
			return buildJsonResponse({
				command: "spawn-object",
				success: false,
				message: "Bot not found"
			});
		}
		if (!params.position) {
			params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
		}
		await bot.spawnObject(params)
		return buildJsonResponse({
			command: "spawn-object",
			success: true
		});
	} catch (e) {
		return buildJsonResponse({
			command: "spawn-object",
			success: false,
			message: e.message
		});
	}
}

/**
 * Spawn multiple objects in a loop.
 */
var spawnObjectsLoop = null;
async function spawnMultipleObjects(params) {
	let randomize = false;
	try {
		if (!objectLength(bots)) {
			return buildJsonResponse({
				command: "spawn-multiple-objects",
				success: false,
				message: 'No bot to operate'
			});
		}
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
			return buildJsonResponse({
				command: "spawn-multiple-objects",
				success: false,
				message: "Already spawning"
			});
		}
		return buildJsonResponse({
			command: "spawn-multiple-objects",
			success: true,
			message: "Starting to spawn multiple"
		})

	} catch(e) {
		return buildJsonResponse({
			command: "spawn-multiple-objects",
			success: false,
			message: e.message
		});
	}
}
/**
 * Stop the multiple objects spawn.
 */
async function stopSpawnMultipleObjects() {
	try {
		clearInterval(spawnObjectsLoop);
		spawnObjectsLoop = null;
		return buildJsonResponse({
			command: "stop-spawn-multiple-objects",
			success: true,
			message: "Multiple spawning stopped"
		});
	} catch(e) {
		return buildJsonResponse({
			command: "stop-spawn-multiple-objects",
			success: false,
			message: e.message
		});
	}
}
/**
 * Delete all the objects in the scene. (note : the bot only sees the objects spawn after its entry in the room).
 * @param {object} params 
 * @returns 
 */
async function deleteAllObjects(params) {
	try {
		if (!params.bot_uuid) {
			params.bot_uuid = "first";
		}
		let bot = getBotByUuid(params.bot_uuid);
		if (!bot) {
			return buildJsonResponse({
				command: "delete-all-objects",
				success: false,
				message: "Bot not found"
			});
		}
		await bot.deleteAllObjects();
		return buildJsonResponse({
			command: "delete-all-objects",
			success: true,
			message: "Deleting all objects"
		});
	} catch (e) {
		return buildJsonResponse({
			command: "delete-all-objects",
			success: false,
			message: e.message
		});
	}
}
/**
 * Move the bot to a x,y,z location.
 * @param {object} params 
 * @returns 
 */
async function goTo (params) {
	try {
		if (!params.bot_uuid) {
			params.bot_uuid = "first";
		}
		let bot = getBotByUuid(params.bot_uuid);
		if (!bot) {
			return buildJsonResponse({
				command: "goto",
				success: false,
				message: "Bot not found"
			});
		}
		await bot.goTo(params);
		return buildJsonResponse({
			command: "goto",
			success: true,
			message: "Bot moved"
		});
	} catch(e) {
		return buildJsonResponse({
			command: "goto",
			success: false,
			message: e.message
		});
	}
}
/**
 * Move the bot to a way/spawn point.
 * @param {object} params 
 * @returns 
 */
async function jumpTo(params) {
	try {
		if (!params.bot_uuid) {
			params.bot_uuid = "first";
		}
		let bot = getBotByUuid(params.bot_uuid);
		if (!bot) {
			return buildJsonResponse({
				command: "jump-to",
				success: false,
				message: "Bot not found"
			});
		}
		await bot.jumpTo(params.sp);
		return buildJsonResponse({
			command: "jump-to",
			success: true,
			message: "Bot jumped"
		});
	} catch(e) {
		return buildJsonResponse({
			command: "jump-to",
			success: false,
			message: e.message
		});
	}
}

/**
 * Make the bot speak in the chat.
 * @param {object} params 
 * @returns 
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
		let response = await runBot(params);
		res.json(response);
	} catch(e) {
		console.error("Error calling runBot", e);
		res.json({
			command: "start",
			success: false,
			message: e.message,
			values: []
		})
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
	let response = await playFile({
		filename: req.query.filename ? req.query.filename : config.audio_file
	});
	res.json(response);
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
	let response = await spawnObject(params);
	res.json(response);
});
httpServer.get('/spawn-multiple-objects', async(req, res) => {
	let params = {
		url: req.query.url ? req.query.url : config.spawnped_object_url,
		position: req.query.position ? req.query.position : null,
		rotation: req.query.rotation ? req.query.rotation : "0 0 0",
		scale: req.query.scale ? req.query.scale : "1 1 1",
		pinned: req.query.pinned ? req.query.pinned : false,
		dynamic: req.query.dynamic ? req.query.dynamic : false,
		pause: req.query.pause ? req.query.pause : 5000
	};
	let response = await spawnMultipleObjects(params);
	res.json(response);
});
httpServer.get('/stop-spawn-multiple-objects', async(req, res) => {
	let response = await stopSpawnMultipleObjects();
	res.json(response);
});
httpServer.get('/delete-all-objects', async(req, res) => {
	let response = await deleteAllObjects({});
	res.json(response);
});

// move
httpServer.get('/goto', async(req, res) => {
	let params = {
		x: req.query.x ? req.query.x : 0,
		y: req.query.y ? req.query.y : 0,
		z: req.query.z ? req.query.z : 0
	};
	let response = await goTo(params);
	res.json(response);
});
httpServer.get('/jump-to', async(req, res) => {
	let params = {
		sp: req.query.sp ? req.query.sp : ""
	};
	let response = await jumpTo(params);
	res.json(response);
});

// listen to
httpServer.get('/listen-to', async(req, res) => {
	let response = await listenTo({text: "tutu"});
	res.json(response);
});

// -----------
// osc
// -----------
OSCserver.on("message", function (oscMessage) {
    console.log(oscMessage);
});

OSCserver.open();