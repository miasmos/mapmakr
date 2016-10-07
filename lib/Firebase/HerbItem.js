'use strict'

var DBObject = require('./DBObjectClass')

class HerbItem extends DBObject {
	constructor(opts) {
		super(opts)
		this.path = 'items/herbs'
	}
}

module.exports = HerbItem