'use strict'
var request = require('request-promise'),
	Promise = require('bluebird')

class Scraper {
	constructor() {
		this.baseURL = 'http://wowhead.com'
	}

	get(objectID, mapID) {
		return new Promise((resolve, reject) => {
			request(`${this.baseURL}/object=${objectID}`)
				.then((html) => {
					resolve(this.format(this.parse(html), objectID, mapID))
				})
				.catch((err) => {
					reject(Error(err))
				})
		})
	}

	format(json, objectID, mapID) {
		if (!!mapID) {
			var obj = json[mapID][0],
				ret = {}

			ret[mapID] = {
				count: obj.count,
				map: mapID,
				object: objectID,
				coords: obj.coords
			}
			return ret
		} else {
			var ret = {}
			for (var key in json) {
				var obj = json[key][0]
				ret[key] = {
					count: obj.count,
					map: key,
					object: objectID,
					coords: obj.coords
				}
			}
			return ret
		}
	}

	parse(html) {
		let regex = /var g_mapperData? =? ([\s\S]*?});/g,
			match = regex.exec(html),
			string = match[1].replace(/\r|\n|\s/g, '').replace(/({|,)([0-9a-zA-Z]*?)(:)/g, '$1"$2"$3')

		try {
			return JSON.parse(string)
		} catch (e) {
			return false
		}
	}
}

module.exports = new Scraper()