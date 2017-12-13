# ec2-info

**Extract ec2 metadata information from the local http interface on an ec2 instance**

[![npm status](http://img.shields.io/npm/v/ec2-info.svg?style=flat-square)](https://www.npmjs.org/package/ec2-info) 
[![Build Status](https://secure.travis-ci.org/ironSource/ec2-info.png?branch=master)](http://travis-ci.org/ironSource/ec2-info)

This module can be consumed programmatically or as a command line tool

Click [here](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html#instancedata-data-categories) for complete reference about ec2 metadata information or better yet, use this module's cli to get an index of properties.

Beware, though, when traversing the ec2 metadata information tree! There are some "traps" one is ought to know of in advance, if one is to save precious time... this is discussed [here](rant.md)

## example

`npm i ec2-info`

```js
const ec2Info = require('ec2-info')

ec2Info((err, info) => {
    if (err) return console.error(err)
    // prints: Map { 'instance-id' => 'foofoofoo', 'public-ipv4' => '1.2.3.4' }
    console.log(info) 
})

// custom properties
ec2Info(['meta-data/instance-id', 'meta-data/instance-type'], (err, info) => {
    if (err) return console.error(err)
    // prints: Map { 'instance-id' => 'foofoofoo', 'instance-type' => 'm4-large' }
    console.log(info) 
})

// custom data url
ec2Info(['meta-data/instance-id', 'meta-data/instance-type'], { dataURL: 'http://localhost:8080/latest/' }, (err, info) => {
    if (err) return console.error(err)
    // prints: Map { 'instance-id' => 'foofoofoo', 'instance-type' => 'm4-large' }
    console.log(info) 
})
```

## api

### `ec2Info(properties, callback [, options])`
Fetch the specified set of properties and return them in the callback inside an ES6 Map object.

If used on anything other than an ec2 instance as determined by [is-ec2-machine](https://github.com/ironsource/is-ec2-machine) the module will still work without an error but all the property values will be `not an ec2 machine`.

You can disable that check by specifying the option `{ testIsEc2Machine: false }`

You can also change the default url `http://169.254.169.254/latest/` to something else by specifying the option `{ dataURL: 'http://localhost:8080/latest' }`. This is helpful in testing or if you're using the package on your machine but want to port foward to an ec2 instance, e.g: `ssh -f ec2-user@<ec2 host address> -L 8080:169.254.169.254:80 -N`'

## command line tool
`npm i -g ec2-info`

`ec2-info --help`

### fetch some values:
`ec2-info fetch --help`

`ec2-info fetch meta-data/public-ipv4 meta-data/instance-id --format=json`

### list some known keys
`ec2-info index`

## debug
uses [debug](https://github.com/visionmedia/debug) with namespace `ec2-info`

## license

[MIT](http://opensource.org/licenses/MIT) © ironSource ltd
