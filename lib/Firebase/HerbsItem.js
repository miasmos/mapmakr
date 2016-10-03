'use strict'

var DBObject = require('./DBObjectClass')

class HerbsItem extends DBObject {
	constructor(opts) {
		super(opts)
		this.path = 'items/herbs'
	}
}

module.exports = HerbsItem