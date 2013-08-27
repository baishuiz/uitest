var util = require("util");
var helper = require("../helper");
var _ = require('lodash');
var path = require('path');
var Driver = require('./Driver');

var FirefoxBrowser = function () {
	Driver.apply(this, arguments);
};

util.inherits(FirefoxBrowser, Driver);

_.merge(FirefoxBrowser.prototype, {
	name: 'Firefox',

	CMD : {
		linux : path.resolve(__dirname, "../../driver/selenium-server-standalone-2.34.0.jar"),
		darwin: path.resolve(__dirname, "../../driver/selenium-server-standalone-2.34.0.jar"),
		win32 : path.resolve(__dirname, "../../driver/selenium-server-standalone-2.34.0.jar")
	},
	PORT: 9515

});

// PUBLISH
module.exports = FirefoxBrowser;