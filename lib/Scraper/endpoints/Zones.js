'use strict'
var EndpointClass = require('./EndpointClass')

module.exports = class Zones extends EndpointClass {
	static parse(html) {
		var regex = new RegExp(/zonedata.zones = (.*?]);new Listview/g),
			match = regex.exec(html.replace(/\n|\r/g, ''))
console.log(match)
		try {
			return JSON.parse(match[1])
		} catch (e) {
			return Error(e)
		}
	}

	static format(json) {
		// for (var key in json) {
		// 	var obj = {}
		// 	if (json[key].quality == 0) {
		// 		delete json[key]
		// 		continue
		// 	}
		// 	delete json[key].quality
		// 	delete json[key].jsonequip
		// 	delete json[key].attainable
		// 	delete json[key].flags2
		// 	delete json[key].screenshot
		// }
		return json
	}

	static url(baseURL, params) {
		return `${baseURL}zones`
	}
}