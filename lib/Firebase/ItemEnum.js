'use strict'
var Herbs = require('./HerbsItem'),
	Ore = require('./OreItem')

module.exports = class ItemEnum {
	constructor(opts) {
		this.Herbs = new Herbs(opts)
		this.Ore = new Ore(opts)
	}

	enum() {
		return {
			Herbs: this.Herbs,
			Ore: this.Ore
		}
	}
}