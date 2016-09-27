var express = require('express'),
	app = express(),
	TSP = require('./lib/TSP'),
	Scraper = require('./lib/Scraper'),
	async = require('async'),
	Promise = require('bluebird')

//config
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next()
})
app.set('json spaces', 10)

app.param('objectID', function(req, res, next, id) {
	next()
})

app.param('mapID', function(req, res, next, id) {
	next()
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
		Scraper.get(objectID)
			.then((json) => {
				//get coordinate data
				if (!!json && Object.keys(json).length) {
					if (!!mapID && mapID in json) {
						var obj = json[mapID][0]
						return [{
							count: obj.count,
							map: mapID,
							object: objectID,
							coords: obj.coords
						}]
					} else {
						return Object.keys(json).map((item, index) => {
							var obj = json[item][0]
							return {
								count: obj.count,
								map: item,
								object: objectID,
								coords: obj.coords
							}
						})
					}
				}
			})
			.then((array) => {
				//generate optimal path via TSP
				var ret = []
				return new Promise((resolve, reject) => {
					async.eachSeries(array, (item, callback) => {
						var tsp = new TSP({
							map: item.coords,
							cycles: 100,
							gain: 50,
							alpha: 0.05,
							complete: (opts) => {
								ret.push({
									object: item.object,
									coords: opts.optimal,
									map: item.map
								})
								callback()
							}
						})
					}, () => {
						resolve(ret)
					})
				})
			})
			.then((array) => {
				resolve(array)
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