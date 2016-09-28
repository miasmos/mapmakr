'use strict'
var request = require('request-promise'),
	Promise = require('bluebird')

module.exports = class Endpoint {
	static get(baseURL, params, options) {
		var url = this.url(baseURL, params)
		console.log(url)
		return new Promise((resolve, reject) => {
			request(url)
				.then((html) => {
					var obj = this.parse(html)

					if (obj instanceof Error) {
						reject(obj)
					} else {
						resolve(this.format(obj, options))
					}
				})
				.catch((err) => {
					if ('statusCode' in err) {
						reject(err.statusCode)
					} else {
						reject(err)
					}
				})
		})
	}

	static url(baseURL, params) {
		return `${baseURL}${this.stringify(params)}`
	}

	static stringify(p) {
		var str = ''
		Object.keys(p).map((item, index) => {
			str += item + '=' + p[item] + '&'
		})
		return str.substring(0,str.length-1)
	}

	static format(json, options) {
		return json
	}

	static parse(html) {
		return Error('Parse not implemented')
	}
}