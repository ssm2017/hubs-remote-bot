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

var my_bot = null;
var retryCount = 5;
var backoff = 1000;

// main
(async () => {
	/*
		start the bot
	*/
	async function runBot(params) {
		console.log("new bot");
		my_bot = new HubsBot({
			userDataDir: config.user_data_dir
		})
		await my_bot.enterRoom(params.room_url, {name: params.bot_name, spawnPoint: params.spawn_point, audioVolume: 1});
	}
	/*
		stop the bot
	*/
	async function stopBot() {
		console.log("Stopping bot");
		await my_bot.page.close();
	}

	/*
		plays an audio file or json file
	*/
	async function playFile(params) {
		let file_to_play = config.assets_folder + '/' + params.filename;
		my_bot.playFile(file_to_play);
		console.log("Playing started... %s", file_to_play);
	};

	/*
		spawn object
	*/
	async function spawnObject(params) {
		console.log("spawn");
		if (!params.position) {
			params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
		}
		my_bot.spawnObject(params)
	}

	var spawnObjectsLoop = null;
	const spawnMultipleObjects = async (params) => {
		let randomize = false;
		try {
			spawnObjectsLoop = setInterval(() => {
				if (!params.position) {
					randomize = true;
				}
				if (randomize) {
					params.position = null;
				}
				spawnObject(params);
			}, params.pause);

		} catch(e) {
			console.error("Error trying to multiple spawn", e.message);
		}
	}

	const stopSpawnMultipleObjects = async () => {
		try {
			clearInterval(spawnObjectsLoop);

		} catch(e) {
			console.error("Error trying to stop multiple spawn", e.message);
		}
	}

	const deleteAllObjects = async () => {
		try {
			my_bot.deleteAllObjects();
		} catch (e) {
			console.log("Error deleting all objects", e.message);
		}
	}
	/*
		move
	*/
	const goTo = async (params) => {
		try {
			my_bot.goTo(params);
		} catch(e) {
			console.log("Error trying to go to", e);
		}
	}
	const jumpTo = async (params) => {
		try {
			my_bot.jumpTo(params.sp);
		} catch(e) {
			console.log("Error trying to jump to", e);
		}
	}

	/*
		say in chat
	*/
	async function say(params) {
		console.log("say");
		my_bot.say(params.message);
	}
	/*
		listen to the chat
	*/
	async function listenTo(params) {
		my_bot.page.evaluate(async () => {
			window.APP.hubChannel.channel.on('message', () => {
				window.APP.hubChannel.sendMessage("arrggg");
			})
		});
	}
	// -----------
	// express
	// -----------
	
	// home
	httpServer.get('/', function(req, res) {
		res.send('Ok');
	});
	// status
	httpServer.get('/status', function(req, res) {
		console.log(my_bot);
		res.send('Test');
	});
	// start
	httpServer.get('/start', function(req, res) {
		runBot({
			spawn_point: req.query.spawn_point ? req.query.spawn_point : null,
			bot_name: req.query.bot_name ? req.query.bot_name : "bot-" + Date.now(),
			room_url: req.query.room_url ? req.query.room_url : "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture"
		});
		res.send("Starting");
	});
	// stop
	httpServer.get('/stop', function(req, res) {
		stopBot();
		res.send('Test');
	});

	// say
	httpServer.get('/say', function(req, res) {
		say({
			message: req.query.message ? req.query.message : "coucou"
		});
		res.send("Saying");
	});

	// play file
	httpServer.get('/play-file', function(req, res) {
		playFile({
			filename: req.query.filename ? req.query.filename : config.audio_file
		});
		res.send('Starting to speak...');
	});

	// spawn object
	httpServer.get('/spawn-object', function(req, res) {
		let params = {
			url: req.query.url ? req.query.url : config.spawnped_object_url,
			position: req.query.position ? req.query.position : null,
			rotation: req.query.rotation ? req.query.rotation : "0 0 0",
			scale: req.query.scale ? req.query.scale : "1 1 1",
			pinned: req.query.pinned ? req.query.pinned : true,
			dynamic: req.query.dynamic ? req.query.dynamic : false,
			projection: req.query.projection ? req.query.projection : null
		};
		spawnObject(params);
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
		deleteAllObjects();
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