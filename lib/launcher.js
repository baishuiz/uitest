var log = require('./logger').create('launcher');
var BaseBrowser = require('./launchers/Base');
var events = require('./events');
var util = require("util");

var ScriptBrowser = function (id, emitter, timeout, retry, script) {
	BaseBrowser.apply(this, arguments);

	this.name = script;

	this._getCommand = function () {
		return script;
	};
	this.on = function () {
	};
	this.emit = function () {
	};
};

var Launcher = function (emitter) {

	this.launch = function (name, timeout, retryLimit) {
		var Browser = exports[name + 'Browser'] || ScriptBrowser;
		this.browser = new Browser(Launcher.generateId(), emitter, timeout, retryLimit, name);
		//run driver
		return this.browser;
	};

	this.kill = function (callback) {

		log.debug('Disconnecting all browsers');
		var finish = function () {

			callback && callback();

		};

		if (!this.browser) {
			return process.nextTick(callback);
		}
//		this.browser.kill(finish);
	};

	this.markCaptured = function () {
		//   log.info('Captured browser %s', this.browser.name);
		this.browser.markCaptured();
	};

	Launcher.generateId = function () {
		return Math.floor(Math.random() * 100000000);
	};

};

util.inherits(Launcher, events.EventEmitter);
// PUBLISH
exports.Launcher = Launcher;

exports.ChromeBrowser = require('./launchers/Chrome');
exports.FirefoxBrowser = require('./launchers/Firefox');
exports.IEBrowser = require('./launchers/IE');
exports.OperaBrowser = require('./launchers/Opera');
exports.PhantomJSBrowser = require('./launchers/PhantomJS');
exports.SafariBrowser = require('./launchers/Safari');


