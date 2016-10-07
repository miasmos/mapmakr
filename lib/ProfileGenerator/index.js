var TSP = require('./lib/TSP'),
	async = require('async'),
	bluebird = require('bluebird'),
	lerp = require('lerp')

class ProfileGenerator {
	constructor(opts) {
		this.db = opts.db
	}

	generate(json) {
		var ret = transformData(json)
		// for (var )
	}

	staticData(json) {
		var ret = {
			"horde": {},
			"alliance": {}
		}


	}

	transformData(json) {
		ret = {}
		return ret
	}

	getPath(nodes) {
		return new Promise((resolve, reject) => {
			var tsp = new TSP({
				map: item.coords,
				cycles: 100,
				gain: 50,
				alpha: 0.05,
				clusterMinNeighbours: 1,
				clusterRadius: 1.2,
				limit: debug ? 1000 : undefined,
				complete: (opts) => {
					var obj = {
						object: item.object,
						map: item.map,
						path: opts.optimal
					}

					if (debug) {
						obj.coords = opts.map
					}

					ret[item.map] = obj
					resolve(ret)
				}
			})
		})
	}

	generate(objectID, zoneID) {
		return new Promise((resolve, reject) => {
			Scraper.getObjectCoordinates(objectID, zoneID)
				.then((json) => {
					//generate optimal path via TSP
					var ret = {}
					return new Promise((resolve, reject) => {
						async.eachSeries(json, (item, callback) => {
							var tsp = new TSP({
								map: item.coords,
								cycles: 100,
								gain: 50,
								alpha: 0.05,
								clusterMinNeighbours: 1,
								clusterRadius: 1.2,
								limit: debug ? 1000 : undefined,
								complete: (opts) => {
									var obj = {
										object: item.object,
										map: item.map,
										path: opts.optimal
									}

									if (debug) {
										obj.coords = opts.map
									}

									ret[item.map] = obj
									callback()
								}
							})
						}, () => {
							resolve(ret)
						})
					})
				})
				.then((json) => {
					resolve(json)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}
}

module.exports = new ProfileGenerator()