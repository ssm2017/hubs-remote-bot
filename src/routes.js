// uuid
const { v4: uuidv4 } = require('uuid');
const { validate: uuidValidate } = require('uuid');
// utils
const utils = require('./utils.js');
// bots
const BotsList = require('./BotsList.js');
var botsList = new BotsList();

module.exports = function(httpServer) {
	// home
	httpServer.get('/', function(req, res) {
		res.send('Ok');
	});
	// status
	httpServer.get('/api/bots', function(req, res) {
		let status = botsList.getBotsList();
		res.json(status);
	});
	// get bot infos
	httpServer.get('/api/bots/:uuid', async(req, res) => {
		// get uuid
		const uuid = req.params.uuid;
		if (!uuidValidate(uuid)) {
			res.status(400).json({
				command: "getBot",
				success: false,
				message: "Wrong uuid",
				values: []
			});
			return;
		}
		let status = botsList.getBotInfos(uuid);
		res.json(status);
	});
	// new bot
	httpServer.post('/api/bots', async(req, res) => {
		try {
			let params = {
				spawn_point: 	req.query.spawn_point || null,
				name: 			req.query.name || "bot-" + Date.now(),
				room_url: 		req.query.room_url || "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
				audio_volume:	process.env.AUDIO_VOLUME || 1,
				userDataDir:	process.env.USER_DATA_DIR || "./assets/chrome-profile/User Data/",
				uuid:		uuidv4()
			};
			console.log("params", params);
			let response = await botsList.newBot(params);
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
	// delete bot
	httpServer.delete('/api/bots/:uuid', async(req, res) => {
		try {
			// get uuid
			let bot_uuid = req.params.uuid || null;
			// check uuid
			if (!['first', 'last', 'all'].includes(bot_uuid)) {
				if (!uuidValidate(bot_uuid)) {
					res.status(400).json({
						command: "delete bot",
						success: false,
						message: "Wrong uuid",
						values: []
					});
					return;
				}
			}
			const result = await botsList.deleteBot(bot_uuid);
			res.json(result);
		} catch (e) {
			res.status(500).json({
				command: "delete bot",
				success: false,
				message: e.message
			});
			return;
		}
	});

	// update bot
	httpServer.patch('/api/bots/:uuid', async(req, res) => {
		// get the uuid
		let bot_uuid = req.query.bot_uuid || null;
		if (!bot_uuid) {
			res.json(utils.buildJsonResponse({
				command: "bot",
				success: false,
				message: "Bot uuid needed"
			}));
			return;
		}
		// get the name
		let bot_name = req.query.bot_name || null;
		if (!bot_name) {
			res.json(utils.buildJsonResponse({
				command: "renameBot",
				success: false,
				message: "Bot name needed"
			}));
			return;
		}
		let status = await setBotName(bot_name);
		res.json(status);
	});

	// play file
	httpServer.get('/api/motion/play-file', async(req, res) => {
		let default_audio_file = process.env.AUDIO_FILE || "bot-recording.mp3";
		let response = await playFile({
			filename: req.query.filename || default_audio_file
		});
		res.json(response);
	});

	// spawn object
	httpServer.get('/api/media/spawn-object', async(req, res) => {
		let default_object_url = process.env.DEFAULT_OBJECT_URL || "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb";
		let params = {
			url: 		req.query.url || default_object_url,
			position: 	req.query.position || null,
			rotation: 	req.query.rotation || "0 0 0",
			scale: 		req.query.scale || "1 1 1",
			pinned: 	req.query.pinned || true,
			dynamic: 	req.query.dynamic || false,
			projection: req.query.projection || null
		};
		let response = await spawnObject(params);
		res.json(response);
	});
	httpServer.get('/api/media/spawn-multiple-objects', async(req, res) => {
		let default_object_url = process.env.DEFAULT_OBJECT_URL || "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb";
		let params = {
			url: 		req.query.url || default_object_url,
			position: 	req.query.position || null,
			rotation: 	req.query.rotation || "0 0 0",
			scale: 		req.query.scale || "1 1 1",
			pinned: 	req.query.pinned || false,
			dynamic: 	req.query.dynamic || false,
			pause: 		req.query.pause || 5000
		};
		let response = await spawnMultipleObjects(params);
		res.json(response);
	});
	httpServer.get('/api/media/stop-spawn-multiple-objects', async(req, res) => {
		let response = await stopSpawnMultipleObjects();
		res.json(response);
	});
	httpServer.get('/api/media/delete-all-objects', async(req, res) => {
		let response = await deleteAllObjects({});
		res.json(response);
	});

	// move
	httpServer.get('/api/move/goto', async(req, res) => {
		let params = {
			x: req.query.x || 0,
			y: req.query.y || 0,
			z: req.query.z || 0
		};
		let response = await goTo(params);
		res.json(response);
	});
	httpServer.get('/api/move/jump-to', async(req, res) => {
		let params = {
			sp: req.query.sp || ""
		};
		let response = await jumpTo(params);
		res.json(response);
	});

	// say
	httpServer.get('/api/chat/say', async(req, res) => {
		await say({
			message: req.query.message || "coucou",
			bot_uuid: req.query.bot_uuid || null
		});
		res.send("Saying");
	});
	// listen to
	httpServer.get('/api/chat/listen-to', async(req, res) => {
		let response = await listenTo({text: "tutu"});
		res.json(response);
	});
}