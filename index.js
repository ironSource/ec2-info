'use strict'

const debug = require('debug')('ec2-info')
const async = require('async')
const http = require('http')
const concatStream = require('concat-stream')
const isEC2 = require('is-ec2-machine')
const { resolve } = require('url')

/**
 *	fetch the data
 *
 *	@param {array} properties - names of properties to fetch
 *	@param {object} options - tweaking options
 *	@param {string} [options.dataURL='http://169.254.169.254/latest/'] - change the url to fetch data from
 *	@param {boolean} [options.testIsEc2Machine=true] - disabled is-ec2-machine test
 *	@param {function} callback - callback function for results, `(err, info) => { // info is an es6 map }`
 *
 *	@public
 */
module.exports = (properties, options, callback) => {

	if (typeof(options) === 'function') {
		callback = options
		options = undefined
	}

	options = options || {}

	if (!properties || properties.length === 0) {
		return callback(new Error('missing properties to fetch'))
	}

	let dataURL

	if (typeof(options.dataURL) === 'string') {
		dataURL = options.dataURL
	} else {
		dataURL = 'http://169.254.169.254/latest/'
	}

	debug('properties: %o', properties)
	debug('dataURL: %s', dataURL)
	debug('options: %o', options)

	if (options.testIsEc2Machine && !isEC2()) {
		debug('not an ec2 machine')
		return callback(null, dummyData(properties))
	}

	let state = new Map()
	let work = []

	for (let property of properties) {
		work.push(fetchProperty(dataURL, state, property))
	}

	debug('executing...')

	async.parallel(work, (err) => {
		if (err) return callback(err)

		debug('done, result: %o', state)
		// not read only, need to convert to a class with readonly properties
		callback(null, state)
	})
}

function dummyData(properties) {
	let data = {}
	for (let p of properties) {
		data[p] = 'not an ec2 machine'
	}
	return data
}

function fetchProperty(dataURL, state, property) {
	let url = concatUrlPath(dataURL, property)

	return callback => {
		let onFetch = (err, res, body) => {
			if (err) {
				return callback(err)
			}

			if (res.statusCode === 301) {
				return fetch(res.headers.location, onFetch)
			}

			if (res.statusCode !== 200) {
				return callback(new Error(`unexpected status code ${res.statusCode} for ${url}`))
			}

			state.set(property, body)
			callback()
		}

		fetch(url, onFetch)
	}
}

function fetch(url, callback) {
	debug('[%s] fetching...', url)

	let error
	let request = http.get(url)

	request.once('response', (res) => {
		debug('[%s] fetched.', url)

		if (error) {
			return callback(error)
		}

		return bufferResponse(res, (err, body) => {
			if (err) return callback(err)
			callback(null, res, body)
		})
	})

	request.once('error', (err) => {
		error = err
	})

	function bufferResponse(res, cb) {
		let concat = concatStream((value) => {
			cb(null, value.toString('utf8'))
		})

		res.pipe(concat)
	}
}

function concatUrlPath(p1, p2) {
	if (p1.endsWith('/')) {
		if (p2.startsWith('/')) {
			return p1 + p2.substr(1)
		}

		return p1 + p2
	}

	if (p2.startsWith('/')) {
		return p1 + p2
	}

	return p1 + '/' + p2
}