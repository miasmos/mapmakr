'use strict'
var EndpointClass = require('./EndpointClass')

module.exports = class ObjectCoordinates extends EndpointClass {
	static format(json, options) {
		if (!!options.mapID) {
			var obj = json[options.mapID][0],
				ret = {}

			ret[options.mapID] = {
				count: obj.count,
				map: options.mapID,
				object: options.objectID,
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
					object: options.objectID,
					coords: obj.coords
				}
			}
			return ret
		}
	}

	static parse(html) {
		let regex = /var g_mapperData? =? ([\s\S]*?});/g,
			match = regex.exec(html),
			string = match[1].replace(/\r|\n|\s/g, '').replace(/({|,)([0-9a-zA-Z]*?)(:)/g, '$1"$2"$3')

		try {
			return JSON.parse(string)
		} catch (e) {
			return Error(e)
		}
	}
}