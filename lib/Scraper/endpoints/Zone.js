'use strict'
var EndpointClass = require('./EndpointClass'),
	parser = require('relaxed-json')

module.exports = class Zone extends EndpointClass {
	static parse(html) {
		var regex = new RegExp(/var mapShower = new ShowOnMap\((.*?)\);\/\/\]\]>/g),
			match = regex.exec(html.replace(/\n|\r/g, ''))

		try {
			return parser.parse(match[1])
		} catch (e) {
			throw new Error(e)
		}
	}

	static url(baseURL, params) {
		return `${baseURL}zone=${params.id}`
	}
}