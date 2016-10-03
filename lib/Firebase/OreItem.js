'use strict'

var DBObject = require('./DBObjectClass')

class OreItem extends DBObject {
	constructor(opts) {
		super(opts)
		this.path = 'items/ore'
	}
}

module.exports = OreItem