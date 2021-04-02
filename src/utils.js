class Utils {
	constructor() {
		if (this instanceof StaticClass) {
		  throw Error('A static class cannot be instantiated.');
		}
	  }
	/**
	 * Return the length of an associative array or object.
	 * @param {Object} obj Any object/associative array
	 * @returns {int}
	 */
	static objectLength(obj) {
		return Object.keys(obj).length;
	}
	/**
	 * Return the first element of an associative array or object.
	 * @param {object} obj Any object/associative array
	 * @returns {int}
	 */
	static getFirstItem(obj) {
		return obj[Object.keys(obj)[0]];
	}
	/**
	 * Return the last element of an associative array or object.
	 * @param {object} obj Any object/associative array
	 * @returns {object}
	 */
	 static getLastItem(obj) {
		return obj[Object.keys(obj)[this.objectLength(obj)-1]];
	}

	// build json response
	static buildJsonResponse(params) {
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
}
module.exports = Utils;