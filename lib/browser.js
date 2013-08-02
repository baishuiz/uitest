var Launcher = require('./launcher').Launcher,
	util = require('util'),
	webServer = require("./web-server"),
	helper = require("./helper"),
	events = require('./events'),
	logger = require('./logger'),
	path = require('path');

var UglifyJS = require('uglify-js');
//var proxy = require('./pageproxy');
var log = logger.create("Browser");
//var proxy = require('../proxy/proxy-https');

//var proxyServer = new proxy({
//    keyPath: path.resolve(__dirname, '../')
//});

//代理
var browsersPooling;
//var proxyServer = proxy.createProxy();
var server = webServer.createServer();
//开启socket，等待浏览器链接

var Browser;

Browser = function (name, url, timeout) {

	var host = this;
	this.name = name;
	this.data = {};
	this.fullName = null;
	this.isReady = true;
	this.timeout = timeout;
	this.launcher = new Launcher(this);

	this.url = url;
	host._canRun = false;
	host._canNav = false;
	this.results = [];

	this.defaultResult = function () {
		return {
			url        : host.url,
			failedSpecs: 0,
			totalSpecs : 0,
			totalErrors: 0,
			suites     : [],
			errors     : []
		}
	};

//	this.register = function (info) {
//		log.debug("connect to browser");
//		var host = this;
//		host._canRun = true;
//		this.fullName = helper.browserFullNameToShort(info.name);
//
//		this.socket = info.socket;
//		this.launcher.markCaptured();
//
//		this.socket.on("set_data", function (data) {
//			_.merge(host.data, data);
//		});
//
//		this.socket.on("get_data", function () {
//			host.socket.emit("push_data", host.data)
//		});
//
//		this.socket.on("complete", function (result) {
//			host.onComplete(result);
//		});
//
//		this.socket.on("disconnect", function () {
//			host.emit("disconnect");
//			//  log.warn('Disconnected');
//		});
//
//		this.socket.on("close", function () {
//			host.emit("disconnect");
//		});
//		// emitter.emit('browser_register', this);
//		// emitter.emit('browsers_change', collection);
//
//
//	};

	this.on('run_complete',function(result){
		console.log(result);
		host.onComplete(result);
	});

	this.register = function (info) {
		log.debug("connect to browser");
		var host = this;
		host._canRun = true;
		this.fullName = helper.browserFullNameToShort(info.name);
		this.launcher.markCaptured();
	};

	this.navigator = function (url) {
		var host = this;
		host.url = null;
		if (url) {
			host.url = url
		}
		this.startBrowser();

		this.isComplete = false;

		if (/\?/.test(url)) {
			url += "&_ut_=" + this.id
		}
		else {
			url += "?_ut_=" + this.id
		}

		host.canNav(function () {
			log.info(host.name + " navigator to " + url);
			try {
				host.socket && host.socket.emit("navigator", {
					url: url
				})
			} catch (e) {
				log.error(e)
			}

		})
	};

	this.startBrowser = function () {
		var host = this;
		if (!host.scriptBrowser) {

			var name = host.name.replace(/\d*/ig, "");
			host.scriptBrowser = this.launcher.launch(name, host.timeout, 1);
//            host.scriptBrowser.on("browser_process_failure", function () {
//                host.scriptBrowser.kill();
//                log.error("Can not open browser,Please close the browser first");
//            });
			host.id = host.scriptBrowser.id;
		}
	};

	this.start = function (func, readyFunc) {

		var host = this;

		host.isComplete = false;

		this.startBrowser();

		if (readyFunc) this.readyFunc = readyFunc;

//        host.canRun(function () {
		log.info(host.name + " start run");

//		host.scriptBrowser.start(host.url, "with(window.UT){(" + func.toString() + ")()};");

		host.scriptBrowser.start(host.url, "" + func);

//            host._canRun = false;
//        });

		if (host.runTimeout) {
			clearTimeout(host.runTimeout);
			host.runTimeout = null;
		}

		host.runTimeout = setTimeout(function () {
			host.onError("uitest", "timeout");
		}, host.timeout * 1.5)

	};

	this.canRun = function (callback) {
		var host = this;
		var timeout = 0;
		var t = 50;
		var timer;

		(function () {

			if (timer) {
				clearTimeout(timer);
				timer = null;
			}

			if (!host._canRun) {
				if (timeout >= host.timeout) {
					log.error("can not connect to the browser %s", host.scriptBrowser.name);
					//  应该重新启动浏览器
					host.scriptBrowser.kill();
					//   delete host.scriptBrowser;
				}
				else {
					timeout += t;
					timer = setTimeout(arguments.callee, t);
				}
			} else {
				host._canRun = false;
				callback && callback();
			}
		})();

	};

	this.canNav = function (callback) {
		var host = this;

		var timeout = 0;
		var t = 50;
		var timer;

		(function () {
			if (!host._canNav) {
				if (timeout >= host.timeout) {
					log.error("无法和被测页面建立连接，可能是页面加载异常导致");
					host.scriptBrowser.kill();

					//   host.emit("failure", {type:"timeout", message:host.url + "无法建立链接"})
				}
				else {
					timer = setTimeout(arguments.callee, t);
				}
			} else {
				host._canNav = false;
				callback && callback();
			}

		})()

	};

	this.onError = function (errorType, message) {

		if (!this.isComplete) {

			this.isComplete = true;
			this._canRun = false;
			this._canNav = true;
			var result = this.defaultResult();
			result.errors.push({type: errorType, message: message});
			result.totalErrors = result.errors.length;

			log.error(result.errors[0].message);

			this.results.push(result);
			this.emit("error", this.results);
			this.results = [];
		}
	};

	this.onComplete = function (result) {
		if (!this.isComplete) {
			//修改url和浏览器名称
			result.url = result.url || host.url;

			result.totalErrors = result.totalErrors
				? result.totalErrors
				: 0;
			result.errors = result.errors
				? result.errors
				: [];
			this.results.push(result);
			if (host.readyFunc) {
				//name
				host.start(host.readyFunc);
				delete  host.readyFunc;
			} else {
				log.info(host.name + " is completed");

				this.isComplete = true;
				this._canRun = false;
				this._canNav = true;

				this.emit("complete", this.results);
				this.results = [];
			}

		}
	};

	this.onDisconnect = function () {
		if (!this.isReady) {
			this.isReady = true;
			this.lastResult.totalTimeEnd();
			this.lastResult.disconnected = true;
			emitter.emit('browser_complete', this);
		}
	};

	this.serialize = function () {
		return {
			id     : this.id,
			name   : this.name,
			isReady: this.isReady
		};
	};

	this.toString = function () {
		return this.name;
	};

	this.close = function () {

		browsersPooling.remove(this);
		this.launcher.kill();
	}

};

util.inherits(Browser, events.EventEmitter);

var Collection = function (browsers) {
	browsers = browsers || [];
	this.results = {};

	// Use ecma5 style to make jshint happy
	Object.defineProperty(this, 'length', {
		get: function () {
			return browsers.length;
		}
	});

	this.register = function (info) {
		browsers.forEach(function (browser) {
			if (info.id == browser.id) {
				browser.register(info);
			}
		})
	};

	this.add = function (browser) {
		browsers.push(browser);
		this.emit('browsers_change', this);
	};

	this.close = function () {
		browsers.forEach(function (browser) {
			browser.close();
		})
	};

	this.remove = function (browser) {
		var host = this;
		var index = browsers.indexOf(browser);
		if (index === -1) {
			return false;
		}
		browsers.splice(index, 1);
		if (browsers.length == 0) {
			if (!host.isComplete) {
				host.emit("complete", host.results);
				host.isComplete = true;
			}
		}
		this.emit('browsers_change', this);
		return true;
	};

	this.serialize = function () {
		return browsers.map(function (browser) {
			return browser.serialize();
		});
	};

	this.clone = function () {
		return new Collection(browsers.slice());
	};

	// Array APIs
	this.map = function (callback, context) {
		return browsers.map(callback, context);
	};

	this.forEach = function (callback, context) {
		return browsers.forEach(callback, context);
	};
};

util.inherits(Collection, events.EventEmitter);

browsersPooling = new Collection();

exports.Browser = Browser;
exports.Collection = Collection;
exports.createBrowser = function (type, url, timeout) {

	var newBrowser = new Browser(type, url, timeout);

	browsersPooling.add(newBrowser);

	newBrowser.on("no_cmd", function () {
		browsersPooling.remove(newBrowser)
	});

	newBrowser.on("browser_process_failure", function () {
		browsersPooling.remove(newBrowser)
	});

	return newBrowser;
};