// uuid
const { v4: uuidv4 } = require('uuid');
const { validate: uuidValidate } = require('uuid');
// utils
const utils = require('./utils.js');
// hubsbot
const {HubsBot} = require('HubsBot');

class BotsList {
	bots = [];

	/**
	 * Start the bot.
	 * @param {object} params 
	 * @returns {object} json response
	 */
	 async newBot(params) {
		try {
			let new_bot = new HubsBot({
				userDataDir:params.userDataDir
			});
			new_bot.uuid = uuidv4();
			await new_bot.enterRoom(params.room_url, {
				name: params.name,
				spawnPoint: params.spawn_point,
				audioVolume: params.audio_volume
			});
			new_bot.name = await new_bot.getName();
			this.bots.push(new_bot);
			// build response
			return utils.buildJsonResponse({
				command: "new bot",
				success: true,
				message: "Bot created",
				data: [{
					uuid: new_bot.uuid,
					name: new_bot.name,
					room_url: params.room_url
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
	 * @param {uuid} uuid 
	 * @returns 
	 */
	async deleteBot(uuid) {
		try {
			if (!this.bots.length) {
				return utils.buildJsonResponse({
					command: "delete bot",
					success: false,
					message: 'No bot to delete'
				});
			}
			if (uuid == "all") {
				let bots_stopped = [];
				for (var i=0; i< this.bots.length; i++) {
					await this.bots[i].page.close();
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
				const bot = this.getBotByUuid(uuid);
				if (!bot) {
					return utils.buildJsonResponse({
						command: "delete bot",
						success: false,
						message: 'Bot not found'
					});
				}
				await bot.page.close();
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

	checkUuid(uuid) {
		if (['first', 'last', 'all'].includes(uuid)) {
			return true;
		}
		return uuidValidate(uuid);
	}

	/**
	 * Get the bot uuid.
	 * @param {uuid} uuid 
	 * @returns {uuid}
	 */
	getBotUuid(uuid) {
		if (uuid == "first") {
			return this.bots[0].uuid;
		} else if (uuid == "last") {
			return this.bots[this.bots.length - 1].uuid;
		}
		if (this.bots.findIndex(x => x.uuid === uuid) < 0) {
			return null;
		}
		return uuid;
	}

	/**
	 * Get bot by uuid.
	 * @param {uuid} uuid 
	 * @returns {object}
	 */
	getBotByUuid(uuid) {
		if (!this.bots.length) {
			return null;
		}
		uuid = this.getBotUuid(uuid);
		if (!uuid) {
			return null;
		}
		let index = this.bots.findIndex(x => x.uuid === uuid)
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
		for (const idx in this.bots) {
			let url = new URL(this.bots[idx].page.url());
			let room_url = url.origin + url.pathname;
			bots_list.push({
				uuid: this.bots[idx].uuid,
				name: this.bots[idx].name,
				room_url: room_url
			});
		}
		bot_status.bots = bots_list;
		return utils.buildJsonResponse({
			command: "bots list",
			success: true,
			message: "Ok",
			data: bots_list
		});
	}

	getBotInfos(uuid) {
		if (!this.bots.length) {
			return utils.buildJsonResponse({
				command: "get bot infos",
				success: false,
				message: 'No bot to get infos from.'
			});
		}
		if (uuid == "all") {
			return this.getBotsList();
		}
		let bot = this.getBotByUuid(uuid);
		if (!bot) {
			return utils.buildJsonResponse({
				command: "get bot infos",
				success: false,
				message: 'Bot not found.'
			});
		}
		let url = new URL(bot.page.url());
		let room_url = url.origin + url.pathname;
		return utils.buildJsonResponse({
			command: "get bot infos",
			success: true,
			message: 'Bot found.',
			data: {
				uuid: bot.uuid,
				name: bot.name,
				room_url: room_url
			}
		});
	}
}
module.exports = BotsList;