'use strict'

var DBObject = require('./DBObjectClass')

class Zones extends DBObject {
	constructor(opts) {
		super(opts)
		this.path = 'zones'
	}
}

module.exports = Zones