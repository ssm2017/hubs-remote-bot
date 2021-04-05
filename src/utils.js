const fs = require('fs');
const path = require('path');
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

	// source : https://stackoverflow.com/a/49601340
	static readFiles(dir, processFile) {
		// read directory
		fs.readdir(dir, (error, fileNames) => {
		  if (error) throw error;
	  
		  fileNames.forEach(filename => {
			// get current file name
			const name = path.parse(filename).name;
			// get current file extension
			const ext = path.parse(filename).ext;
			// get current file path
			const filepath = path.resolve(dir, filename);
	  
			// get information about the file
			fs.stat(filepath, function(error, stat) {
			  if (error) throw error;
	  
			  // check if the current path is a file or a folder
			  const isFile = stat.isFile();
	  
			  // exclude folders
			  if (isFile) {
				// callback, do something with the file
				processFile(filepath, name, ext, stat);
			  }
			});
		  });
		});
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