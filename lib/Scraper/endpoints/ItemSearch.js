'use strict'
var EndpointClass = require('./EndpointClass')

//@return
//{
//	id: {
//		icon
//		name_enus
//	}
//}

module.exports = class ItemSearch extends EndpointClass {
	static parse(html) {
		try {
			var regex = new RegExp(/_\[([0-9]*)\]=({.*?"flags2":-{0,1}[0-9]*?})/g),
				match = regex.exec(html),
				string = '{'

			while (match != null) {
				string += '"' + match[1] + '":' + match[2] + ','
				match = regex.exec(html)
			}
			string = string.substring(0, string.length-1) + '}'
			string = string.replace(/\r|\n|\s/g, '')

			return JSON.parse(string)
		} catch (e) {
			throw new Error(e)
		}
	}

	static format(json) {
		for (var key in json) {
			var obj = {}
			if (json[key].quality == 0) {
				delete json[key]
				continue
			}
			delete json[key].quality
			delete json[key].jsonequip
			delete json[key].attainable
			delete json[key].flags2
			delete json[key].screenshot
		}
		return json
	}

	static url(baseURL, params) {
		return `${baseURL}items?${this.stringify(params)}`
	}
}