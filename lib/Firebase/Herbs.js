'use strict'

var DBObject = require('./DBObjectClass')

class Herbs extends DBObject {
	constructor(opts) {
		super(opts)
		this.data = undefined
		this.path = 'herbs'
	}

	get(id) {
		return new Promise((resolve, reject) => {
			this._read()
				.then((data) => {
					console.log('read')
					this.data = !!data ? data : undefined
					if (typeof id === 'undefined') {
						resolve(data)
					} else {
						if (id in data) {
							resolve(data[id])
						} else {
							resolve({})
						}
					}
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	set(data, id) {
		return new Promise((resolve, reject) => {
			if (!this.data) {
				this.get()
					.then(() => {
						setPromise.call(this).then(() => {
							resolve()
						})
						.catch((err) => {
							reject(err)
						})
					})
					.catch((err) => {
						reject(err)
					})
			} else {
				setPromise.call(this).then(() => {
					resolve()
				})
				.catch((err) => {
					reject(err)
				})
			}
		})

		function setPromise() {
			return new Promise((resolve, reject) => {
				this._update()
					.then(() => {
						console.log('updated')
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
	}
}

module.exports = Herbs