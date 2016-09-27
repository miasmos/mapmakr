'use strict'
var express = require('express'),
	app = express(),
	TSP = require('./lib/TSP'),
	Scraper = require('./lib/Scraper'),
	async = require('async'),
	Promise = require('bluebird')

var debug = true

//config
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
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
//end config

//endpoints
app.get('/generate/:objectID', (req, res) => {
	var mapID = 'mapID' in req.params ? req.params.mapID : undefined,
		objectID = 'objectID' in req.params ? req.params.objectID : undefined

	generate(objectID, mapID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.error((err) => {
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
		.error((err) => {
			complete(req, res, err, undefined)
		})
})
//end endpoints

function generate(objectID, mapID) {
	return new Promise((resolve, reject) => {
		Scraper.get(objectID, mapID)
			.then((json) => {
				//get coordinate data
				return json
			})
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
							limit: debug ? 50 : undefined,
							complete: (opts) => {
								var obj = {
									object: item.object,
									map: item.map
								}

								if (debug) {
									obj.coords = opts.map
									obj.clusters = opts.clusters
									obj.path = opts.optimal
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
		ret.message = err
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