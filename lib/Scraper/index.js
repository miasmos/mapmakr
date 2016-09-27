var request = require('request-promise'),
	Promise = require('bluebird')

class Scraper {
	constructor() {
		this.baseURL = 'http://wowhead.com'
	}

	get(id) {
		return new Promise((resolve, reject) => {
			request(`${this.baseURL}/object=${id}`)
				.then((html) => {
					resolve(this.parse(html))
				})
				.catch((err) => {
					reject(Error(err))
				})
		})
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