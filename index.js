'use strict'
var express = require('express'),
	app = express(),
	cors = require('cors'),
	async = require('async'),
	Scraper = require('./lib/Scraper'),
	async = require('async'),
	Promise = require('bluebird'),
	filters = require('./lib/Scraper/filters.json'),
	db = new (require('./lib/Firebase/index'))(),
	ProfileGenerator = require('./lib/ProfileGenerator')({db: db})

var debug = false,
	whitelist = [
		undefined,
		/^(https?:\/\/)?localhost/,
		'https://mapmakr.me',
		'https://api.mapmakr.me'
	],
	corsOptions = {
		origin: whitelist,
		methods: 'GET',
		headers: 'Content-Type'
	}

//config
app.set('json spaces', 10)
app.use(function(req, res, next) {
	res.header('Content-Type', 'application/json')

	//deny unknown hosts
	var valid = false, host = req.headers.host
	for (var key in whitelist) {
		var origin = whitelist[key]
		switch(typeof origin) {
			case 'string':
			case 'undefined':
				valid = host === origin
				break
			case 'object':
				if (!!host.match(/^(https?:\/\/)?localhost/)) debug = true
				valid = !!host.match(origin)
				break
		}
		if (valid) break
	}
	if (!valid) {
		complete(req, res, 'Forbidden', undefined, 403)
	} else {
		next()
	}
})

app.param('objectID', function(req, res, next, id) {
	if (req.params.objectID.length > 6 || Number(req.params.objectID) == NaN) complete(req, res, 'objectID parameter is invalid', undefined, 400)
	else next()
})

app.param('zoneID', function(req, res, next, id) {
	if (req.params.zoneID.length > 4 || Number(req.params.zoneID) == NaN) complete(req, res, 'zoneID parameter is invalid', undefined, 400)
	else next()
})

app.param('filter', function(req, res, next, id) {
	var match = req.params.filter.match(/[0-9]*?;[0-9]*?;[0-9]*/)
	if (!!match && match.length || req.params.filter in filters) next()
	else complete(req, res, 'Filter parameter is invalid', undefined, 400)
})
//end config

//endpoints
app.get('/generate/:objectID', cors(corsOptions), (req, res) => {
	var zoneID = 'zoneID' in req.params ? req.params.zoneID : undefined,
		objectID = 'objectID' in req.params ? req.params.objectID : undefined

	generate(objectID, zoneID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/generate/:objectID/:zoneID', cors(corsOptions), (req, res) => {
	var zoneID = 'zoneID' in req.params ? req.params.zoneID : undefined,
		objectID = 'objectID' in req.params ? req.params.objectID : undefined

	generate(objectID, zoneID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/scrape/coordinates/:objectID', cors(corsOptions), (req, res) => {
	Scraper.getObjectCoordinates(req.params.objectID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/scrape/coordinates/:objectID/:zoneID', cors(corsOptions), (req, res) => {
	Scraper.getObjectCoordinates(req.params.objectID, req.params.zoneID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/scrape/search/:filter', cors(corsOptions), (req, res) => {
	Scraper.getItems(req.params.filter)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/scrape/zones', cors(corsOptions), (req, res) => {
	Scraper.getZones()
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/scrape/zone/:zoneID', cors(corsOptions), (req, res) => {
	Scraper.getZone(req.params.zoneID)
		.then((json) => {
			complete(req, res, undefined, json)
		})
		.catch((err) => {
			complete(req, res, err, undefined)
		})
})

app.get('/update/profiles', cors(corsOptions), (req, res) => {
	
})

app.get('/update/data', cors(corsOptions), (req, res) => {
	var q = [], qCnt = 0
	for (var filter in filters) {
		q.push({name: filter, filter: filters[filter]})
	}

	async.waterfall([
		(callback) => {
			async.forEachSeries(q, (task, callback1) => {
				Scraper.getItems(task.filter)
						.then((json) => {
							var key = task.name.charAt(0).toUpperCase() + task.name.slice(1)
							if (task.name.charAt(0).toUpperCase() + task.name.slice(1) in db.items) {
								db.items[key].set(json)
									.then(() => {
										callback1()
									})
							} else {
								console.log(`Skipping ${key} because it does not exist in Firebase object!`)
								callback1()
							}
						})
						.error((err) => {
							if (err) console.error(err)
							callback1(err)
						})
			}, (err) => {
				callback(err)
			})
		},
		(callback) => {
			Scraper.getZones()
				.then((json) => {
					db.zones.set(json)
						.then(() => {
							callback(undefined, json)
						})
						.catch((err) => {
							callback(err)
						})
				})
				.catch((err) => {
					callback(err)
				})
		},
		(zones, callback) => {
			async.forEachSeries(zones, (task, callback1) => {
				Scraper.getZone(task.id)
					.then((json) => {
						if (!!json) {
							for (var key in task) {
								json[key] = task[key]
							}

							db.zones.set(json, task.id)
								.then(() => {
									callback1()
								})
								.catch((err) => {
									callback1(err)
								})
						} else {
							callback1()
						}
					})
					.catch((err) => {
						callback1(err)
					})
			}, (err) => {
				callback(err)
			})
		}
	],
	(err) => {
		complete(req, res, !!err ? err : undefined, undefined)
	})
})

app.get('*', function(req, res) {
	complete(req, res, 'Not Found', undefined, 404)
})
//end endpoints

function complete(req, res, err, json, status) {
	var send = !!req && !!res
	var ret = {}
	if (err) {
		switch(typeof err) {
			case 'string':
				setStatus(status || 500)
				ret.message = err.message || err || getMessage(err)
				break
			case 'number':
				setStatus(err)
				ret.message = getMessage(err)
				break
			default:
				setStatus(status)
				ret.message = getMessage(status)
		}
	} else {
		setStatus(200)
	}
	ret.data = !!json ? json : {}

	if (send) {
		res.json(ret)
		res.end()
	} else {
		return ret
	}

	function setStatus(status) {
		ret.status = status
		if (!!res) res.status(status)
	}

	function getMessage(code) {
		switch(Number(code)) {
			case 400:
				return 'Malformed Request'
			case 200:
				return 'OK'
			case 403:
				return 'Forbidden'
			case 404:
				return 'Not Found'
			default:
				return 'Internal Server Error'
		}
	}
}

process.on('unhandledRejection', (reason, promise) => {
	console.error(reason)
});

app.listen(3000)