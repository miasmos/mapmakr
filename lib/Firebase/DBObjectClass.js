'use strict'

class DBObject {
	constructor(opts) {
		this.baseURL = 'url' in opts ? opts.url : undefined
		this.path = 'path' in opts ? opts.path : undefined
		this.ref = opts.database.ref(this.path)
	}

	url() {
		return this.baseURL + this.path
	}

	_create(data) {
		return new Promise((resolve, reject) => {
			this.ref.set(data, (err) => {
				if (!!err) reject(err)
				else resolve()
			})
		})
	}

	_read() {
		return new Promise((resolve, reject) => {
			this.ref.once('value').then((snapshot) => {
				resolve(snapshot.val())
			}, function(err) {
				reject(err)
			})
		})
	}

	_update(data) {
		return new Promise((resolve, reject) => {
			this.ref.update(obj, (err) => {
				if (!!err) reject(err)
				else resolve()
			})
		})
	}

	_delete(key) {
		return this._update(null)
	}
}

module.exports = DBObject