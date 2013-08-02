var spawn = require('child_process').spawn;
var path = require('path');
var http = require('http');
var fs = require('fs');
var util = require("util");
var events = require('../events');
var log = require('../logger').create('driver');
var uitest = require('../uitest');

var env = process.env;

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;

var Driver = function (id, emitter, captureTimeout) {

	var self = this;
	var capturingUrl;

	this.id = id;
	this.state = null;
	this.emitter = emitter;
	var exitCallback = function () {

	};

	this.hostname = '127.0.0.1';

	this.getPort = function () {
		return this.DEFAULT_PORT;
	};

	this.getStatus = function () {
		var options = {
			port    : this.getPort(),
			hostname: this.hostname,
			method  : 'GET',
			path    : '/status',
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": 0
			}
		};

		var req = http.request(options, function (res) {

			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('BODY: ' + chunk);
			});
		});
		req.end()
	};

	this.timeout = function (sessionId, callback) {
		var self = this;
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + sessionId + '/timeouts/async_script',
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": 0
			}
		};
		var body = JSON.stringify({ms: 1000 * 30});
		options.headers['Content-Length'] = body.length;
		var req = http.request(options, function (res) {

			if (res.statusCode == 200) {
				callback && callback();

			}
		});
		req.write(body);
		req.end()
	};

	this.close = function (sessionId) {
		var self = this;
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'DELETE',
			path    : '/session/' + sessionId + "/window",
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": 0
			}
		};

		var req = http.request(options);
		req.end()
	};

	this.url = function (sessionId, url, callback) {
		var self = this;
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + sessionId + "/url",
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": 0
			}
		};
		// prepare body & options for the "/url" goto post request (here, goes to denkwerk.com)
		var body = JSON.stringify({url: url});

		options.headers['Content-Length'] = body.length;

		var req = new http.request(options, function (res) {

			if (res.statusCode === 200) {

				callback && callback();

			}

		});
		req.write(body);
		req.end();
	};

	this.executeAsync = function (sessionId, scripts, callback) {
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + sessionId + "/execute_async",
			headers : {
				"Content-Type": "application/json"
			}
		};

		var uitestJs = fs.readFileSync(path.resolve(__dirname, './uitest-min.js')).toString();

//		console.log(scripts);

		var userScripts = uitestJs.replace('{{func}}', scripts || function () {}).replace('{{data}}', JSON.stringify(uitest.getData()).replace(/'|"/ig, '\\"'));

		var injectjs = ";" + userScripts;

		var body = JSON.stringify({script: injectjs, args: []});

		//中文字符字数问题。。。
		//thanks to http://snoopyxdy.blog.163.com/blog/static/601174402012723103030678/
		options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');

		var req = new http.request(options, function (response) {
			var incoming = '';

			log.debug('execute code:%s', response.statusCode);

			if (response.statusCode == 200) {

				response.on('data', function (chunk) {
					incoming += chunk;
					callback && callback(JSON.parse(incoming.toString()).value);
				});
			}

		});
		req.write(body);
		req.end();
	};

	this.session = function (callback) {
		var self = this;
		var data = {
			desiredCapabilities: {
				browserName      : this.name.toLowerCase(),
				version          : '',
				platform         : 'ANY',
				javascriptEnabled: true,
				acceptSslCerts   : true
			}
		};

		var body = JSON.stringify(data);

		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session',
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": body.length
			}
		};

		var req = http.request(options, function (response) {
			if (response.statusCode === 303 || response.statusCode === 200) {
				var sessionid = response.headers.location.replace('/session/', '');

				callback && callback(sessionid)
			}
		});

		req.write(body);
		req.end()

	};

	this.start = function (url, func) {
		var self = this;

		this.capturingUrl = url + /\?/.test(capturingUrl)
			? "&_ut_=" + self.id
			: "?_ut_=" + self.id;
		this.func = func;

		self._start();

//        if (captureTimeout) setTimeout(self._onTimeout, captureTimeout);
	};

	this._start = function () {
		var cmd = self._getCommand();

		self._execCommand(cmd);
	};

	this._bind = function () {
		self._process.stderr.on('data', function (data) {
			log.error('stderr:' + data);
		})

		self._process.stdout.on('data', function (data) {
			log.info('stdout:' + data);
			self.session(function (sessionId) {
				self.url(sessionId, self.capturingUrl, function () {
					self.timeout(sessionId, function () {
						log.debug('timeout OK');

						var func = "(" + self.func.replace(/\r|\n/ig, '\\n').replace(/'|"/ig, '\\"') + ")()";

						self.executeAsync(sessionId, func, function (result) {
							var data = JSON.parse(result.data);
							uitest.setData(data);
							log.debug("result", result);
							self.emitter.emit("run_complete", result.result);
							self.close(sessionId);
						})
					});
					// close(sessionId)
				})

			})
			self.state = BEING_CAPTURED;
		})
	}

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
		var cmd = path.normalize(self.DEFAULT_CMD[process.platform]);

		if (!cmd) {
			log.error('No driver for %s browser on your platform.\n\t' +
				'Please, set "%s" env variable.', self.name, self.ENV_CMD);
		}

		return cmd;
	};

	this._execCommand = function (cmd) {

		this._process = _progress = spawn(cmd);
		this._bind();

	};

};

util.inherits(Driver, events.EventEmitter);

module.exports = Driver;