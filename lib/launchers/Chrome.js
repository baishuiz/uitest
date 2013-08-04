var util = require("util");
var helper = require("../helper");
var _ = require('lodash');
var path = require('path');
var Driver = require('./Driver');

var ChromeBrowser = function () {
	Driver.apply(this, arguments);
};

//util.inherits(ChromeBrowser, Driver);

_.merge(ChromeBrowser.prototype, {
	name: 'Chrome',

	CMD : {
		linux : 'google-chrome',
		darwin: path.resolve(__dirname, "../../driver/chromedriver"),
		win32 : (process.env.LOCALAPPDATA || process.env.APPDATA) + '\\Google\\Chrome\\Application\\chrome.exe'
	},
	PORT: 9515

});

// PUBLISH
module.exports = ChromeBrowser;