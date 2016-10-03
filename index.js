'use strict'
var express = require('express'),
	app = express(),
	async = require('async'),
	TSP = require('./lib/TSP'),
	Scraper = require('./lib/Scraper'),
	async = require('async'),
	Promise = require('bluebird'),
	filters = require('./lib/Scraper/filters.json'),
	db = new (require('./lib/Firebase/index'))()

var debug = true

//config
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next()
})
app.set('json spaces', 10)

app.param('objectID', function(req, res, next, id) {
	if (req.params.objectID.length !== 6 || Number(req.params.objectID) == NaN) complete(req, res, 'objectID is invalid', undefined)
	else next()
})

app.param('mapID', function(req, res, next, id) {
	if (req.params.mapID.length !== 4 || Number(req.params.objectID) == NaN) complete(req, res, 'mapID is invalid', undefined)
	else next()
})

app.param('filter', function(req, res, next, id) {
	var match = req.params.filter.match(/[0-9]*?;[0-9]*?;[0-9]*/)
	if (!!match && match.length || req.params.filter in filters) next()
	else complete(req, res, 'filter is invalid', undefined)
})
//end config

//endpoints
app.get('/generate/:objectID', (req, res) => {
	var mapID = 'mapID' in req.params ? req.params.mapID : undefined,
		objectID = 'objectID' in req.params ? req.params.objectID : undefined

	generate(objectID, mapID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/generate/:objectID/:mapID', (req, res) => {
	var mapID = 'mapID' in req.params ? req.params.mapID : undefined,
		objectID = 'objectID' in req.params ? req.params.objectID : undefined

	generate(objectID, mapID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/coordinates/:objectID', (req, res) => {
	Scraper.getObjectCoordinates(req.params.objectID)
			.then((json) => {
				complete(req, res, undefined, json)
			})
			.catch((err) => {
				complete(req, res, err, undefined)
			})
})

app.get('/coordinates/:objectID/:mapID', (req, res) => {
	Scraper.getObjectCoordinates(req.params.objectID, req.params.mapID)
			.then((json) => {
				complete(req, res, undefined, json)
			})
			.catch((err) => {
				complete(req, res, err, undefined)
			})
})

app.get('/item/:filter', (req, res) => {
	Scraper.getItems(req.params.filter)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/zones', (req, res) => {
	Scraper.getZones()
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/update', (req, res) => {
	var q = []
	for (var filter in filters) {
		q.push({name: filter, filter: filters[filter]})
	}

	async.series([
		(callback) => {
			async.forEachSeries(q, (task, callback1) => {
				Scraper.getItems(task.filter)
						.then((json) => {
							if (task.name in db.items) {
								db.items[task.name].set(json)
									.then(() => {
										callback1()
									})
									.catch((err) => {
										callback1(err)
									})
							} else {
								console.log(`Skipping ${task.name} because it does not exist in Firebase object!`)
							}
						})
						.error((err) => {
							callback1(err)
						})
			}, (err) => {

				callback(err)
			})
		},
		(callback) => {
			Scraper.zones()
				.then((json) => {
					console.log('Updated zones')
					callback()
				})
				.catch((err) => {
					callback(err)
				})
		}
	],
	(err) => {
		complete(req, res, !!err ? err : undefined, undefined)
	})
})
//end endpoints

function generate(objectID, mapID) {
	return new Promise((resolve, reject) => {
		Scraper.getObjectCoordinates(objectID, mapID)
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

function complete(req, res, err, json) {
	var ret = {}
	if (err) {
		ret.status = "error"
		if (!err.message) {
			console.log(err.stack)
			ret.message = 'Generic error'
		} else {
			ret.message = err.message
		}
	} else {
		console.log('success')
		ret.status = "ok"
		ret.message = ""
	}
	ret.data = json ? json : {}
	res.send(ret)
	res.end()
}

app.listen(3000)