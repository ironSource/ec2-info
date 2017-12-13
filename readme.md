# ec2-info

**Extract ec2 metadata information from the local http interface on an ec2 instance**

[![npm status](http://img.shields.io/npm/v/ec2-info.svg?style=flat-square)](https://www.npmjs.org/package/ec2-info) 
[![Build Status](https://secure.travis-ci.org/ironSource/ec2-info.png?branch=master)](http://travis-ci.org/ironSource/ec2-info)

This module can be consumed programmatically or as a command line tool

Click [here](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html#instancedata-data-categories) for complete reference about ec2 metadata information

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
ec2Info(['instance-id', 'instance-type'], (err, info) => {
    if (err) return console.error(err)
    // prints: Map { 'instance-id' => 'foofoofoo', 'instance-type' => 'm4-large' }
    console.log(info) 
})
```

## api

### `ec2Info([properties,] callback)`
Fetch the default set of properties or the one specified in properties and return them in the callback inside an ES6 Map object.

If used on anything other than an ec2 instance as determined by [is-ec2-machine](https://github.com/ironsource/is-ec2-machine) the module will still work without an error but all the property values will be `not an ec2 machine`.

## command line tool
`npm i -g ec2-info`

`ec2-info --help`

### fetch some values:
`ec2-info fetch --help`

`ec2-info fetch meta-data/public-ipv4 meta-data/instance-id --format=json`

### list some known keys
`ec2-info index`

## license

[MIT](http://opensource.org/licenses/MIT) © ironSource ltd
