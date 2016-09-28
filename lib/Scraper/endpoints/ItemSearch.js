'use strict'
var EndpointClass = require('./EndpointClass')

module.exports = class ItemSearch extends EndpointClass {
	static parse(html) {
		console.log('wut')
		var regex = new RegExp(/_\[([0-9]*)\]=({.*?"flags2":-{0,1}[0-9]*?})/g),
			match = regex.exec(html),
			string = '{'

		while (match != null) {
			// console.log(match[1],match[2]);process.exit()
			string += '"' + match[1] + '":' + match[2] + ','
			match = regex.exec(html)
		}
		string = string.substring(0, string.length-1) + '}'
		string = string.replace(/\r|\n|\s/g, '')

		try {
			return JSON.parse(string)
		} catch (e) {
			return Error(e)
		}
	}

	static url(baseURL, params) {
		return `${baseURL}items?${this.stringify(params)}`
	}
}