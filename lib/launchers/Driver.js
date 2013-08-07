var path = require('path');
var http = require('http');
var fs = require('fs');
var util = require("util");
var spawn = require('child_process').spawn;
var _ = require('lodash');
var PS = require('ps-node');
var events = require('../events');
var uitest = require('../uitest');
var log = require('../logger').create('driver');
var env = process.env;

var uitestJs = fs.readFileSync(path.resolve(__dirname, './uitest-min.js')).toString();

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;

var Driver = function (id, emitter, captureTimeout) {

	var self = this;
	this.sessionId = null;
	this.id = id;
	this.state = null;
	this.emitter = emitter;
	this.canRun = false;

	this.hostname = '127.0.0.1';

	this.getPort = function () {
		return this.PORT;
	};

	this.status = function () {
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'GET',
			path    : '/status',
			headers : {
				"Content-Type": "application/json"
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

	this.timeout = function (callback) {
		var body = JSON.stringify({ms: 1000 * 30});
		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + self.sessionId + '/timeouts/async_script',
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": Buffer.byteLength(body, 'utf8')
			}
		};

		var req = http.request(options, function (res) {

			if (res.statusCode == 200) {
				callback && callback();
			}
		});
		req.write(body);
		req.end()
	};

	this.closeWindow = function (callback) {

		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'DELETE',
			path    : '/session/' + self.sessionId + "/window",
			headers : {
				"Content-Type"  : "application/json",
			}
		};

		var req = http.request(options,function(res){
			res.on('data',function(){

			})
			callback && callback();
		});

		req.end();
	};

	this.url = function (url, callback) {

		log.debug('url :%s', url);

		var body = JSON.stringify({url: url});

		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + self.sessionId + "/url",
			headers : {
				"Content-Type"  : "application/json",
				"Content-Length": Buffer.byteLength(body, 'utf8')
			}
		};

		var req = http.request(options, function (res) {

			if (res.statusCode === 200) {

				callback && callback();

			}

		});
		req.write(body);
		req.end();
	};

	this.executeAsync = function (scripts, callback) {

		var options = {
			port    : self.getPort(),
			hostname: self.hostname,
			method  : 'POST',
			path    : '/session/' + self.sessionId + "/execute_async",
			headers : {
				"Content-Type": "application/json"
			}
		};

		var userScripts = uitestJs
			.replace('{{func}}', scripts || function () {})
			.replace('{{data}}', JSON.stringify(uitest.getData()).replace(/'|"/ig, '\\"'))
			.replace('{{id}}', self.id);

		var injectjs = ";" + userScripts;

		log.debug('Scripts', scripts);

		var body = JSON.stringify({script: injectjs, args: []});

		//中文字符字数问题。。。
		//thanks to http://snoopyxdy.blog.163.com/blog/static/601174402012723103030678/
		options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');

		var req = http.request(options, function (response) {
			var incoming = '';

			log.debug('execute code:%s', response.statusCode);

			if (response.statusCode == 200) {

				response.on('data', function (chunk) {
					incoming += chunk;
					callback && callback(JSON.parse(incoming.toString()).value);
				});
			} else {
				response.on('data', function (chunk) {
					incoming += chunk;
					log.error(JSON.parse(incoming.toString()).value)
				});
			}
		});
		req.write(body);
		req.end();
	};
	/**
	 * get session Id
	 * @param callback
	 */

	this.session = function (callback) {
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
				"Content-Length": Buffer.byteLength(body, 'utf8')
			}
		};

		var req = http.request(options, function (response) {
			if (response.statusCode === 303 || response.statusCode === 200) {
				var sessionid = response.headers.location.replace('/session/', '');

				callback && callback(sessionid)
			} else {
				log.error('get session id error');
			}
		});

		req.write(body);
		req.end()

	};

	this.normalizeFunc = function (func) {
		return "("
			+ func
			.replace(/\r|\n/ig, '\\n')
			.replace(/'|"/ig, '\\"')
			+ ")()";
	};

	this.navigator = function (url, func) {
		this.func = func;
		log.debug('running %s', url);

		var runFunc = function () {
			self.timeout(function () {
				self.url(self.capturingUrl, function () {
					log.debug('timeout OK');

					self.executeAsync(self.normalizeFunc(func), function (result) {
						log.debug(result);
						var data = result;
						if (!_.isObject(data)) {
							data = JSON.parse(data);
						}

						uitest.setData(data);

						self.emitter.emit("run_complete", result);
					});
				});

			}, self._onTimeout)
		};
		if (!self.sessionId) {
			self.session(function (sessionId) {
				self.sessionId = sessionId;
				runFunc();
			});
		} else {
			runFunc()
		}

		self.state = BEING_CAPTURED;
	};

	this.start = function (url, func) {
		this.capturingUrl = url;
		var cmd = self._getCommand();

		PS.lookup({command:cmd},function(err,result){
			if(err){
				this._process = spawn(cmd);
				log.debug('driver pid:%s', this._process.pid);

				this._process.stderr.on('data', function (data) {
					log.error('stderr:' + data);
				});

				this._process.stdout.on('data', function (data) {
					log.info('stdout:' + data);
					self.navigator(url, func);
				})
			}else{
				self.navigator(url, func);
			}
		});

	};

	this.markCaptured = function () {
		self.state = CAPTURED;
	};

	this.kill = function (callback) {

		log.debug('kill %s', self.name);

		self.state = BEING_KILLED;
		self.closeWindow(callback);
	};

	this._onTimeout = function () {
		if (BEING_CAPTURED !== self.state) {
			return;
		}

		log.warn('%s have not captured in %d ms, killing.', self.name, captureTimeout);

		self.state = BEING_TIMEOUTED;
		self.closeWindow();
	};

	this.toString = function () {
		return self.name;
	};

	this._getCommand = function () {

		var cmd = path.normalize(self.CMD[process.platform]);

		if (!cmd) {
			log.error('No driver for %s on your platform.\n\t' +
				'Please, set "%s" env variable.', self.name, self.ENV_CMD);
		}

		return cmd;
	};

};

util.inherits(Driver, events.EventEmitter);

module.exports = Driver;