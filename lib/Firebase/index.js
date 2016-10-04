'use strict'

var firebase = require('firebase'),
	auth = require('./auth.json'),
	itemEnum = require('./ItemEnum'),
	Zones = require('./Zones')

class Firebase {
	constructor() {
		this.baseURL = 'https://mapmaker-1c7ac.firebaseio.com/'
		this.ready = false
		this.firebase = firebase.initializeApp({
			databaseURL: this.baseURL,
			serviceAccount: auth
		})
		this.database = this.firebase.database()

		var opts = {
			url: this.baseURL,
			database: this.database
		}
		this.items = new itemEnum(opts).enum()
		this.zones = new Zones(opts)
	}
}

module.exports = Firebase