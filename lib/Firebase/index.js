'use strict'

var firebase = require('firebase'),
	auth = require('./auth.json'),
	itemEnum = require('./ItemEnum')

class Firebase {
	constructor() {
		this.baseURL = 'https://mapmaker-1c7ac.firebaseio.com/'
		this.ready = false
		this.firebase = firebase.initializeApp({
			databaseURL: this.baseURL,
			serviceAccount: auth,
			databaseAuthVariableOverride: auth.UID
		})
		this.database = this.firebase.database()

		var opts = {
			url: this.baseURL,
			database: this.database
		}
		this.items = new itemEnum(opts).enum()
	}
}

module.exports = Firebase