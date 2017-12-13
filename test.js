const ec2Info = require('./index')
const { expect } = require('chai')
const http = require('http')
const { parse } = require('url')
const SOURCE_INFO = {
	'/made-up': 'bar',
	'/meta-data/ami-id': 'foo',
	'/meta-data/public-ipv4': '1.2.3.4',
	'/meta-data/instance-id': '123'
}

const port = 3003
const dataURL = 'http://localhost:' + port
const testOptions = { dataURL, testIsEc2Machine: false }

describe('ec2-info', () => {
	let server

	it('fetches properties', (done) => {
		let properties = ['meta-data/ami-id', '/meta-data/instance-id', 'made-up']
		ec2Info(properties, (err, info) => {
			if (err) return done(err)
			expect(info.size).to.equal(3)
			expect(info.get('meta-data/ami-id')).to.equal('foo')
			expect(info.get('/meta-data/instance-id')).to.equal('123')
			expect(info.get('made-up')).to.equal('bar')
			done()
		}, testOptions)
	})

	it('on a machine that is not an ec2 machine, dont fail and dont fetch anything', () => {
		let properties = ['meta-data/ami-id', 'meta-data/instance-id']
		ec2Info(properties, (err, info) => {
			if (err) return done(err)
			expect(info.size).to.equal(2)
			for (let [property, value] of info) {
				expect(value).to.equal('not an ec2 machine')
			}
		})
	})

	beforeEach((done) => {
		server = startHttpTestServer(SOURCE_INFO, port, done)
	})

	afterEach((done) => {
		if (server) {
			return server.close(done)
		}

		done()
	})
})

describe.skip('integration test', () => {
	it('fetches properties on a real ec2-machine', (done) => {
		let properties = ['meta-data/services/partition', '/meta-data/services/domain']
		ec2Info(properties, (err, info) => {
			if (err) return done(err)
			expect(info.size).to.equal(2)
			expect(info.get('meta-data/services/partition')).to.equal('aws')
			expect(info.get('/meta-data/services/domain')).to.equal('amazonaws.com')
			done()
		}, { dataURL: 'http://localhost:8080/latest/' })
	})
})

function startHttpTestServer(info, port, callback) {
	let server = http.createServer((req, res) => {

		let url = parse(req.url)
		let value = info[url.path]
		if (!value) {
			res.statusCode = 404
			value = 'error'
		}

		res.end(value)
	})

	server.listen(port, callback)
	return server
}