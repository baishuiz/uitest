var util = require("util");
var helper = require("../helper");
var _ = require('lodash');
var path = require('path');
var Driver = require('./Driver');

var ChromeBrowser = function () {
	Driver.apply(this, arguments);
};

util.inherits(ChromeBrowser, Driver);

_.merge(ChromeBrowser.prototype, {
	name: 'IE',

	CMD : {
		win32 : path.resolve(__dirname, "../../driver/IEDriverServer.exe")
	},

	PORT: 5555
});

// PUBLISH
module.exports = ChromeBrowser;