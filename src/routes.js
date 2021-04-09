const fs = require('fs');
const path = require('path');
// utils
const utils = require('./utils.js');
// bots
const BotsList = require('./BotsList.js');
const { buildJsonResponse } = require('./utils.js');

var botsList = new BotsList();

module.exports = function(httpServer) {

	// home
	httpServer.get('/', function(req, res) {
		res.send('Ok');
	});

	// new bot
	httpServer.post('/api/bots', async(req, res) => {
		try {
			let params = {
				spawn_point: 	req.body.spawn_point || null,
				name: 			req.body.name || Date.now(),
				room_url: 		req.body.room_url || "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
				audio_volume:	process.env.AUDIO_VOLUME || 1,
				userDataDir:	process.env.USER_DATA_DIR || "./assets/chrome-profile/User Data/",
				autoLog:		process.env.AUTOLOG || true
			};
			console.log("params", params);
			console.log("req query", req.query);
			console.log("req body", req.body);
			let response = await botsList.newBot(params);
			res.status(200).json(response);
		} catch(e) {
			res.status(500).json(buildJsonResponse({
				command: "new bot",
				success: false,
				message: e.message
			}));
		}
	});

	// get bots list
	httpServer.get('/api/bots', function(req, res) {
		try {
			const result = botsList.getBotsList();
			// const result = [
			// 	{
			// 		uuid: "abcd",
			// 		name: "a"
			// 	},
			// 	{
			// 		uuid: "abcde",
			// 		name: "aa"
			// 	},
			// 	{
			// 		uuid: "abcdf",
			// 		name: "aaa"
			// 	},
			// 	{
			// 		uuid: "abcdg",
			// 		name: "aaaa"
			// 	},
			// 	{
			// 		uuid: "abcdh",
			// 		name: "aaaaa"
			// 	},
			// ];
			res.json(result);
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "get bots list",
				success: false,
				message: e.message
			}));
		}
	});

	// get bot infos
	httpServer.get('/api/bots/:uuid', function(req, res) {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "get bot infos",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			console.log("bots", botsList.bots);
			const result = botsList.getBotInfos(uuid);
			res.json(result);
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "get bot infos",
				success: false,
				message: e.message
			}));
		}
	});

	// delete bot
	httpServer.delete('/api/bots/:uuid', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "get bot infos",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			const result = await botsList.deleteBot(uuid);
			res.json(result);
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "delete bot",
				success: false,
				message: e.message
			}));
		}
	});

	// update bot
	httpServer.patch('/api/bots/:uuid', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "update bot",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get the name
			let name = req.body.name || null;
			if (!name) {
				res.status(400).json(buildJsonResponse({
					command: "update bot",
					success: false,
					message: "Name needed"
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "update bot",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			await bot.changeName(name);
			res.json(buildJsonResponse({
				command: "update bot",
				success: true,
				message: "Bot renamed.",
				data: {
					uuid: bot.uuid,
					name: bot.name
				}
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "update bot",
				success: false,
				message: e.message
			}));
		}
	});

	// play file
	httpServer.post('/api/bots/:uuid/play', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "play file",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "play file",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			// get file
			let default_audio_file = process.env.AUDIO_FILE || "bot-recording.mp3";
			let filename = req.body.filename || default_audio_file;
			let assets_folder = process.env.ASSETS_FOLDER || "./assets";
			let file_to_play = assets_folder + '/' + filename;
			// play the file
			await bot.playFile(file_to_play);
			res.json(buildJsonResponse({
				command: "play file",
				success: true,
				message: 'File playing.',
				data: {
					file: file_to_play
				}
			}));
		} catch(e) {
			res.status(500).json(buildJsonResponse({
				command: "play file",
				success: false,
				message: e.message
			}));
		}
	});

	// spawn object
	httpServer.post('/api/bots/:uuid/objects', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "play file",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "play file",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			let default_object_url = process.env.DEFAULT_OBJECT_URL || "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb";
			let params = {
				url: 		req.query.url || default_object_url,
				position: 	req.query.position || `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`,
				rotation: 	req.query.rotation || "0 0 0",
				scale: 		req.query.scale || "1 1 1",
				pinned: 	req.query.pinned || true,
				dynamic: 	req.query.dynamic || false,
				projection: req.query.projection || null,
				interval:	req.query.interval || null
			};
			// loop ?
			if (params.interval) {
				if (params.interval > 0) {
					if (!bot.interval) {
						bot.interval = setInterval(() => {
							params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
							bot.spawnObject(params);
						}, params.interval);
					}
				} else {
					clearInterval(bot.interval);
					bot.interval = null;
				}
					
			} else {
				await bot.spawnObject(params);
			}
			res.json(buildJsonResponse({
				command: "spawn",
				success: true,
				message: 'Spawn.',
				data: params
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "spawn",
				success: false,
				message: e.message
			}));
		}
	});

	// delete all objects
	httpServer.delete('/api/bots/:uuid/objects', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "delete all",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "delete all",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			await bot.deleteAllObjects();
			res.json(buildJsonResponse({
				command: "delete all",
				success: true,
				message: 'Deleting.'
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "delete all",
				success: false,
				message: e.message
			}));
		}
	});

	// move to
	httpServer.post('/api/bots/:uuid/goto', async(req, res) => {
		try {
			// get uuid
			/*let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "goto",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "goto",
					success: false,
					message: "Bot not found."
				}));
				return;
			}*/
			let params = {
				x: req.body.x || 0,
				y: req.body.y || 0,
				z: req.body.z || 0
			};
			// check values
			if (isNaN(params.x) || isNaN(params.y) || isNaN(params.z)) {
				res.status(400).json({
					error: {
						status: 400,
						message: "x, y or z must be a number."
					}
				});
				return;
			}
			
			// await bot.goTo(params);
			res.status(200).json({
				status: 200,
				message: `The bot has gone to: "${params.x} ${params.y} ${params.z}"`
			});
		} catch (e) {
			res.status(500).json({
				error: {
					status: 500,
					message: e.message
				}
			});
		}
	});

	// get waypoints
	httpServer.get('/api/bots/:uuid/waypoints', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "get waypoints",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "get waypoints",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			const result = await bot.getWaypoints();
			res.json(buildJsonResponse({
				command: "get waypoints",
				success: true,
				message: "waypoints found",
				data: result
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "get waypoints",
				success: false,
				message: e.message
			}));
		}
	});

	// jumpt to
	httpServer.post('/api/bots/:uuid/jumpto', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "jump to",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "jump to",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			await bot.jumpTo(req.body.waypoint || "");
			res.json(buildJsonResponse({
				command: "jump to",
				success: true,
				message: 'Jump to.'
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "jump to",
				success: false,
				message: e.message
			}));
		}
	});

	// say in chat
	httpServer.post('/api/bots/:uuid/say', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "say",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "say",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			let message = req.query.message || "Hello";
			await bot.say(message);
			res.json(buildJsonResponse({
				command: "say",
				success: true,
				message: 'say.',
				data: {
					message: message
				}
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "say",
				success: false,
				message: e.message
			}));
		}
	});

	httpServer.get('/api/system/assets', async(req, res) => {
		try {
			let assets_folder = process.env.ASSETS_FOLDER + '/' || "./assets/";
			let filenames = {
				mp3: [],
				json: []
			};
			const files = fs.readdirSync(assets_folder)
			if (files.length) {
				for (const file of files) {
					if (file.indexOf(".mp3") == file.length - 4) {
						filenames.mp3.push(file);
					} else if (file.indexOf(".json") == file.length - 5) {
						filenames.json.push(file);
					}
				}
			}
			res.json(buildJsonResponse({
				command: "get assets",
				success: true,
				message: 'Assets list.',
				data: {
					files: filenames
				}
			}));

		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "get assets",
				success: false,
				message: e.message
			}));
		}
	});
	httpServer.get('/api/bots/:uuid/audiocontext', async(req, res) => {
		try {
			// get uuid
			let uuid = req.params.uuid || null;
			// check uuid
			if (!botsList.checkUuid(uuid)) {
				res.status(400).json(buildJsonResponse({
					command: "say",
					success: false,
					message: "Wrong uuid.",
					data: [{
						uuid: uuid
					}]
				}));
				return;
			}
			// get bot
			const bot = botsList.getBotByUuid(uuid);
			if (!bot) {
				res.status(404).json(buildJsonResponse({
					command: "say",
					success: false,
					message: "Bot not found."
				}));
				return;
			}
			let message = req.query.message || "Hello";
			let response = await bot.getAudioContext();
			res.json(buildJsonResponse({
				command: "say",
				success: true,
				message: 'say.',
				data: {
					message: response
				}
			}));
		} catch (e) {
			res.status(500).json(buildJsonResponse({
				command: "say",
				success: false,
				message: e.message
			}));
		}
	});
	// httpServer.get('/client', (req, res) => {
	// 	res.sendFile(path.join(__dirname, '../client/build/index.html'));
	// })
	httpServer.get('/*', (req, res) => {
		res.sendFile(path.join(__dirname, '../client/build/index.html'));
	})
	// listen to the chat
	// httpServer.get('/api/todo', async(req, res) => {
	// 	let response = await listenTo({text: "tutu"});
	// 	res.json(response);
	// });
}