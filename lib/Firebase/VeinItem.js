'use strict'

var DBObject = require('./DBObjectClass')

class VeinItem extends DBObject {
	constructor(opts) {
		super(opts)
		this.path = 'items/vein'
	}
}

module.exports = VeinItem