'use strict'
var Herb = require('./HerbItem'),
	Vein = require('./VeinItem')

module.exports = class ItemEnum {
	constructor(opts) {
		this.Herb = new Herb(opts)
		this.Vein = new Vein(opts)
	}

	enum() {
		return {
			Herb: this.Herb,
			Vein: this.Vein
		}
	}
}