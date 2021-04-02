// hubsbot
const {HubsBot} = require('HubsBot');

var retryCount = 5;
var backoff = 1000;

class Bot {

	constructor({
		uuid = null,
		name = null,
		hubsBot = null,
		spawnObjectsLoop = null,
		userDataDir = null
	  } = {} ) {
		this.uuid = uuid;
		this.name = name;
		this.userDataDir = userDataDir;
		this.hubsBot = new HubsBot({
			userDataDir: this.userDataDir
		})
		this.spawnObjectsLoop = spawnObjectsLoop
	  }

	/**
	 * Rename the bot
	 * @param {object} params 
	 * @returns {object} json response
	 */
	async setBotName(params) {
		try {
			// get the bot
			if (!utils.objectLength(bots)) {
				return utils.buildJsonResponse({
					command: "setBotName",
					success: false,
					message: 'No bot to rename'
				});
			}
			const bot = utils.getBotByUuid(bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "setBotName",
					success: false,
					message: 'Bot not found'
				});
			}
			// rename the bot
			await bot.setName(params.bot_name);
			return utils.buildJsonResponse({
				command: "setBotName",
				success: true,
				message: 'Bot renamed',
				data: [{
					bot_uuid: bot.uuid,
					bot_name: bot.name
				}]
			});
		} catch (e) {
			console.error("Error renaming bot", e);
			return utils.buildJsonResponse({
				command: "setBotName",
				success: false,
				message: e.message
			});
		}
	}


	/**
	 * Plays an audio file or json file.
	 * @param {object} params 
	 * @returns 
	 */
	async playFile(params) {
		try {
			let asset_folder = process.env.ASSETS_FOLDER || "./assets";
			let file_to_play = asset_folder + '/' + params.filename;
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "play-file",
					success: false,
					message: "Bot not found"
				});
			}
			await bot.playFile(file_to_play);
			return utils.buildJsonResponse({
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
			return utils.buildJsonResponse({
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
	async spawnObject(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "spawn-object",
					success: false,
					message: "Bot not found"
				});
			}
			if (!params.position) {
				params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
			}
			await bot.spawnObject(params)
			return utils.buildJsonResponse({
				command: "spawn-object",
				success: true
			});
		} catch (e) {
			return utils.buildJsonResponse({
				command: "spawn-object",
				success: false,
				message: e.message
			});
		}
	}

	/**
	 * Spawn multiple objects in a loop.
	 */
	async spawnMultipleObjects(params) {
		let randomize = false;
		try {
			if (!utils.objectLength(bots)) {
				return utils.buildJsonResponse({
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
				return utils.buildJsonResponse({
					command: "spawn-multiple-objects",
					success: false,
					message: "Already spawning"
				});
			}
			return utils.buildJsonResponse({
				command: "spawn-multiple-objects",
				success: true,
				message: "Starting to spawn multiple"
			})

		} catch(e) {
			return utils.buildJsonResponse({
				command: "spawn-multiple-objects",
				success: false,
				message: e.message
			});
		}
	}
	/**
	 * Stop the multiple objects spawn.
	 */
	async stopSpawnMultipleObjects() {
		try {
			clearInterval(spawnObjectsLoop);
			spawnObjectsLoop = null;
			return utils.buildJsonResponse({
				command: "stop-spawn-multiple-objects",
				success: true,
				message: "Multiple spawning stopped"
			});
		} catch(e) {
			return utils.buildJsonResponse({
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
	async deleteAllObjects(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "delete-all-objects",
					success: false,
					message: "Bot not found"
				});
			}
			await bot.deleteAllObjects();
			return utils.buildJsonResponse({
				command: "delete-all-objects",
				success: true,
				message: "Deleting all objects"
			});
		} catch (e) {
			return utils.buildJsonResponse({
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
	async goTo (params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "goto",
					success: false,
					message: "Bot not found"
				});
			}
			await bot.goTo(params);
			return utils.buildJsonResponse({
				command: "goto",
				success: true,
				message: "Bot moved"
			});
		} catch(e) {
			return utils.buildJsonResponse({
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
	async jumpTo(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
			if (!bot) {
				return utils.buildJsonResponse({
					command: "jump-to",
					success: false,
					message: "Bot not found"
				});
			}
			await bot.jumpTo(params.sp);
			return utils.buildJsonResponse({
				command: "jump-to",
				success: true,
				message: "Bot jumped"
			});
		} catch(e) {
			return utils.buildJsonResponse({
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
	async say(params) {
		try {
			if (!params.bot_uuid) {
				params.bot_uuid = "first";
			}
			let bot = utils.getBotByUuid(params.bot_uuid);
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
	async listenTo(params) {
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
}
module.exports = Bot;