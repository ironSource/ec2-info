const ec2Info = require('./index')
const program = require('commander')
const version = require('./package.json').version

program.version(version)

program
	.command('fetch <keys...>')
	.description('fetch values of specified keys')
	.option('-u, --url <url>', 'change the default ec2 metadata url (http://169.254.169.254/latest/)')
	.option('-f, --format [csv|pretty|json]', 'format of the output, defaults to pretty', /^(csv|pretty|json)$/i, 'pretty')
	.action(fetch)

program
	.command('index')
	.description('list known keys in ec2 metadata information store')
	.action(printIndex)

program.parse(process.argv)

function fetch(keys, options) {
	let ec2InfoOptions

	if (options.url) {
		ec2InfoOptions = { dataURL: options.url }
	}

	ec2Info(keys, ec2InfoOptions, (err, info) => {
		if (err) {
			return console.error(err)
		}

		if (options.format === 'pretty') {
			return printPretty(info)
		}

		if (options.format === 'csv') {
			return printCSV(info)
		}

		if (options.format === 'json') {
			return printJSON(info)
		}

		throw new Error('invalid format')
	})
}

function printCSV(info) {
	if (info.size > 0) {
		console.log('"key"', '"value"')
	}

	for (let [key, value] of info) {
		console.log(`"${key}", ${JSON.stringify(value)}`)
	}
}

function printPretty(info) {
	if (info.size > 0) {
		console.log('')
	}

	for (let [key, value] of info) {
		console.log(`${key} => ${JSON.stringify(value)}\n`)
	}
}

function printJSON(info) {
	let result = {}
	for (let [key, value] of info) {
		result[key] = value
	}

	console.log(JSON.stringify(result))
}

function printIndex() {
	const index = require('./keys.json')
	console.log('key index extract from version: 2016-09-02 and below\n')

	for (let category in index) {

		console.log(category)
		console.log('---------------------------------------------------------------------\n')

		if (category === 'user-data') {
			console.log('user-data is only accessible when actual user data was configured for the instance')
			console.log('for more information see: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html#instancedata-add-user-data')
		}

		let categoryKeys = index[category]

		for (let key of categoryKeys) {
			console.log(`${category}/${key}`)
		}

		console.log('\n')
	}
}