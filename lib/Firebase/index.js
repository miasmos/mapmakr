'use strict'

var firebase = require('firebase'),
	auth = require('./auth.json'),
	Herbs = require('./Herbs')

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

		this.Herbs = new Herbs({
			url: this.baseURL,
			database: this.database
		})
	}
}

module.exports = Firebase