// utils
const utils = require('./utils.js');
// bot
const Bot = require('./Bot.js');

class BotsList {
	bots = [];

	/**
	 * Start the bot.
	 * @param {object} params 
	 * @returns {object} json response
	 */
	 async newBot(params) {
		try {
			let new_bot = new Bot({
				userDataDir:params.userDataDir,
				uuid: params.uuid,
				name: params.name
			});
			await new_bot.hubsBot.enterRoom(params.room_url, {
				name: this.name,
				spawnPoint: params.spawn_point,
				audioVolume: params.audio_volume
			});
			this.bots.push(new_bot);
			console.log(this.bots);
			// build response
			return utils.buildJsonResponse({
				command: "new bot",
				success: true,
				message: "Bot created",
				data: [{
					uuid: new_bot.uuid,
					name: new_bot.name
				}]
			});
		} catch(e) {
			console.error("Error creating bot", e);
			return utils.buildJsonResponse({
				command: "new bot",
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
	async deleteBot(bot_uuid) {
		try {
			if (!this.bots.length) {
				return utils.buildJsonResponse({
					command: "delete bot",
					success: false,
					message: 'No bot to delete'
				});
			}
			if (bot_uuid == "all") {
				let bots_stopped = [];
				for (var i=0; i< this.bots.length; i++) {
					await this.bots[i].hubsBot.page.close();
					bots_stopped.push({
						uuid: this.bots[i].uuid,
						name: this.bots[i].name
					});
				}
				this.bots = [];
				return utils.buildJsonResponse({
					command: "delete bot",
					success: true,
					message: 'All bots deleted',
					data: bots_stopped
				});
			} else {
				const bot = this.getBotByUuid(bot_uuid);
				if (!bot) {
					return utils.buildJsonResponse({
						command: "delete bot",
						success: false,
						message: 'Bot not found'
					});
				}
				await bot.hubsBot.page.close();
				this.bots.splice(bot.idx, 1);
				return utils.buildJsonResponse({
					command: "delete bot",
					success: true,
					message: 'Bot deleted',
					data: [{
						uuid: bot.uuid,
						name: bot.name
					}]
				});
			}
		} catch(e) {
			return utils.buildJsonResponse({
				command: "stop",
				success: false,
				message: e.message
			});
		}
	}

	/**
	 * Get the bot uuid.
	 * @param {uuid} bot_uuid 
	 * @returns {uuid}
	 */
	getBotUuid(bot_uuid) {
		if (bot_uuid == "first") {
			return this.bots[0].uuid;
		} else if (bot_uuid == "last") {
			return this.bots[this.bots.length - 1].uuid;
		}
		if (this.bots.findIndex(x => x.uuid === bot_uuid) < 0) {
			return null;
		}
		return bot_uuid;
	}

	/**
	 * Get bot by uuid.
	 * @param {uuid} bot_uuid 
	 * @returns {object}
	 */
	getBotByUuid(bot_uuid) {
		if (!this.bots.length) {
			return null;
		}
		bot_uuid = this.getBotUuid(bot_uuid);
		if (!bot_uuid) {
			return null;
		}
		let index = this.bots.findIndex(x => x.uuid === bot_uuid)
		if (index >= 0) {
			const bot = this.bots[index];
			bot.idx = index;
			return bot;
		}
		return null;
	}

	/**
	 * Get list of the bots.
	 * @returns 
	 */
	getBotsList() {
		let bot_status = {};
		bot_status.count = utils.objectLength(this.bots);
		let bots_list = [];
		for (const bot in this.bots) {
			bots_list.push({
				uuid: this.bots[bot].uuid,
				name: this.bots[bot].name
			});
		}
		bot_status.bots = bots_list;
		return utils.buildJsonResponse({
			command: "status",
			success: true,
			message: "Ok",
			data: bot_status
		});
	}

	getBotInfos(uuid) {
		if (!this.bots.length) {
			return utils.buildJsonResponse({
				command: "get bot infos",
				success: false,
				message: 'No bot to get infos for'
			});
		}
		let bot = this.getBotByUuid(uuid);
		if (!bot) {
			return utils.buildJsonResponse({
				command: "get bot infos",
				success: false,
				message: 'Bot not found'
			});
		}
		return utils.buildJsonResponse({
			command: "get bot infos",
			success: true,
			message: 'Bot found',
			data: {
				uuid: uuid,
				name: bot.name
			}
		});
	}
}
module.exports = BotsList;