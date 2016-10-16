#!/usr/bin/env node

var uuid = require('node-uuid')
var path = require('path')
var utils = require('./utils')
var endOfLine = require('os').EOL

var output = process.argv[2] || 'uuids'

var UUID = '0000' + uuid.v4().replace(/-/g, '').substring(4, 16)
console.log('UUID: '+UUID)

utils.pass()
.then(utils.readFile(path.resolve(__dirname, 'base.ino')))
.then(function (data) {
	var codeString = ''
	codeString += 'Bot::forceSaveUuid=true;' + endOfLine
	for (var i = 4; i < UUID.length; i++) {
		codeString += 'Bot::uuid['+i+']=\''+UUID[i]+'\';' + endOfLine
	}
	var code = data.replace('/** GENERATED UUID **/', codeString)
	//console.log('Compiling and uploading, please wait...')
	return utils.pass()
	.then(utils.writeFile(path.resolve(__dirname, 'firmware', 'firmware.ino'), code))
})
// Create (if needed) temp folder
.then(function () {
	return new Promise(function(resolve, reject) {
		//console.log('Creating temp folder...')
		utils.pass()
		.then(utils.readDir(path.resolve(__dirname, '.tmp-build')))
		.then(resolve)
		.catch(function() {
			utils.pass()
			.then(utils.mkdir(path.resolve(__dirname, '.tmp-build')))
			.then(resolve)
			.catch(reject)
		})
	})
})
// Compile sketch
.then(function functionName() {
	//console.log('Trying to compile...')
	return utils.pass()
	.then(utils.execute(
		path.resolve(utils.modulePath('quirkbot-arduino-builder'), 'tools', 'arduino-builder') + ' ' +
		'-hardware="' + path.resolve('node_modules') + '" ' +
		'-hardware="' + path.resolve(utils.modulePath('quirkbot-arduino-builder'), 'tools', 'hardware') + '" ' +
		'-libraries="' + path.resolve('node_modules') + '" ' +
		'-tools="' + path.resolve(utils.modulePath('quirkbot-avr-gcc'), 'tools') + '" ' +
		'-tools="' + path.resolve(utils.modulePath('quirkbot-arduino-builder'), 'tools', 'tools') + '" ' +
		'-fqbn="quirkbot-arduino-hardware:avr:quirkbot" ' +
		'-ide-version=10607 ' +
		'-build-path="' + path.resolve(__dirname, '.tmp-build') + '" ' +
		'-verbose ' +
		path.resolve(__dirname, 'firmware', 'firmware.ino')
	))
})
// Create (if needed) out folder
.then(function () {
	return new Promise(function(resolve, reject) {
		utils.pass()
		.then(utils.readDir(path.resolve(output)))
		.then(resolve)
		.catch(function() {
			utils.pass()
			.then(utils.mkdir(path.resolve(output)))
			.then(resolve)
			.catch(reject)
		})
	})
})
// Move hex to output
.then(utils.copyDir(path.resolve(__dirname, '.tmp-build', 'firmware.ino.hex'), path.resolve(output, `${UUID}.hex`)))
// Register in the UUID direcotry
.then(utils.appendFile(path.resolve( 'UUIDs.txt'), new Date() + ',' +UUID.substring(0, 16)+endOfLine))
.then(process.exit)

