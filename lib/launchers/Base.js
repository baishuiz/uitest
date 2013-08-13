var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var util = require("util");
var events = require('../events');
var rimraf = require('rimraf');
var log = require('../logger').create('launcher');

var env = process.env;

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;

var BaseBrowser = function (id, emitter, captureTimeout) {

	var self = this;
	var capturingUrl;
	var exitCallback = function () {

	};

	this.id = id;
	this.state = null;
	this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/uitest');

	this.start = function (url) {

		capturingUrl = url;

		try {
			fs.mkdirSync(self._tempDir);
		} catch (e) {

		}

		log.debug('Creating temp dir at ' + self._tempDir);

		capturingUrl += /\?/.test(capturingUrl)
			? "&_ut_=" + self.id
			: "?_ut_=" + self.id;

		self._start(capturingUrl);
		self.state = BEING_CAPTURED;

		if (captureTimeout) setTimeout(self._onTimeout, captureTimeout);
	};

	this._start = function (url) {
		var cmd = self._getCommand();

		self._execCommand(cmd, self._getOptions(url));
	};

	this.markCaptured = function () {
		self.state = CAPTURED;
	};

	this.kill = function (callback) {

		exitCallback = callback || function () {
		};

		log.debug('Killing %s', self.name);

		if (self.state === FINISHED) {
			process.nextTick(exitCallback);
		} else {
			self.state = BEING_KILLED;

			self._process.kill();
		}
	};

	this._onTimeout = function () {
		if (BEING_CAPTURED !== self.state) {
			return;
		}

		log.warn('%s have not captured in %d ms, killing.', self.name, captureTimeout);

		self.state = BEING_TIMEOUTED;
		self._process && self._process.kill && self._process.kill();
	};

	this.toString = function () {
		return self.name;
	};

	this._getCommand = function () {
		var cmd = path.normalize(env[self.ENV_CMD] || self.CMD[process.platform]);

		if (!cmd) {
			log.error('No binary for %s browser on your platform.\n\t' +
				'Please, set "%s" env variable.', self.name, self.ENV_CMD);
		}

		return cmd;
	};

	this._execCommand = function (cmd, args) {
		log.debug(cmd + ' ' + args.join(' '));

		self._process = spawn(cmd, args);

		var errorOutput = '';
		self._process.stderr.on('data', function (data) {

			errorOutput += data.toString();
		});

		self._process.on('close', function (code) {

			self._onProcessExit(code, errorOutput);
		});

	};

	this._onProcessExit = function (code, errorOutput) {
		log.debug('Process %s exitted with code %d', self.name, code);

		if (code) {
			log.error('Cannot start %s\n\t%s', self.name, errorOutput);
			self.emit('browser_process_failure', self);
			self.state = FINISHED;
			self._cleanUpTmp(exitCallback);
		}
	};

	this._cleanUpTmp = function (done) {
		log.debug('Cleaning temp dir %s', self._tempDir);
		rimraf(self._tempDir, done);
	};

	this._getOptions = function (url) {
		return [url];
	};

};

util.inherits(BaseBrowser, events.EventEmitter);

// PUBLISH
module.exports = BaseBrowser;
