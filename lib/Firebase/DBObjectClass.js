'use strict'

class DBObject {
	constructor(opts) {
		this.baseURL = 'url' in opts ? opts.url : undefined
		this.path = 'path' in opts ? opts.path : undefined
		this.ref = opts.database.ref(this.path)
		this.exists = undefined
	}

	url() {
		return this.baseURL + this.path
	}

	getPath(key) {
		return typeof key === 'undefined' || !key ? this.path : this.path + '/' + key
	}

	get(key) {
		return new Promise((resolve, reject) => {
			this._read(key)
				.then((data) => {
					this.data = !!data ? data : undefined
					if (typeof id === 'undefined') {
						resolve(data)
					} else {
						if (id in data) {
							resolve(data[id])
						} else {
							resolve()
						}
					}
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	set(data, key) {
		return new Promise((resolve, reject) => {
			this._update(data, key)
				.then(() => {
					if (typeof id === 'undefined') {
						this.data = data
					} else {
						if (!this.data) this.data = {}
						this.data[id] = data
					}
					resolve()
				})
				.catch((err) => {
					resolve(err)
				})
		})
	}

	_create(data) {
		return new Promise((resolve, reject) => {
			this.ref.set(data, (err) => {
				if (!!err) reject(err)
				else resolve()
			})
		})
	}

	_read(key) {
		return new Promise((resolve, reject) => {
			this.ref.child(this.getPath(key)).once('value').then((snapshot) => {
				resolve(snapshot.val())
			}, function(err) {
				reject(err)
			})
		})
	}

	_update(data, key) {
		return new Promise((resolve, reject) => {
			if (typeof this.exists === 'undefined' || this.exists === false) {
				this.ref.once('value', (snapshot) => {
					this.exists = snapshot.val() !== null

					if (!this.exists) {
						this.ref.child(this.getPath(key)).set(data, (err) => {
							if (!!err) reject(err)
							else resolve()
						})
					} else {
						this.ref.child(this.getPath(key)).update(data, (err) => {
							if (!!err) reject(err)
							else resolve()
						})
					}
				})
			} else {
				this.ref.child(this.getPath(key)).update(data, (err) => {
					if (!!err) reject(err)
					else resolve()
				})
			}
		})
	}

	_delete(key) {
		return this._update(null)
	}
}

module.exports = DBObject