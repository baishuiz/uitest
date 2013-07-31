var fs = require('fs');
var path = require('path');

var BaseBrowser = require('./Base');
var util = require("util");
var helper = require("../helper");
var _ = require('lodash');
var http = require("http");

var chromeDriver = function () {
	BaseBrowser.apply(this, arguments);
	var self = this;

	this._getOptions = function (url) {
		// IE CLI options
		// http://msdn.microsoft.com/en-us/library/hh826025(v=vs.85).aspx
		return [];
	};

};
util.inherits(chromeDriver, BaseBrowser);

_.merge(chromeDriver.prototype, {
	name: 'chromeDriver',

	DEFAULT_CMD: {
		win32 : path.resolve(__dirname, "../../driver/chromedriver"),
		darwin: path.resolve(__dirname, "../../driver/chromedriver")
	},

	DEFAULT_PORT: 9515

});

var driver = new chromeDriver();

driver.start('http://www.taobao.com');

var port = 9515;
var hostname = '127.0.0.1';
var jasmine = fs.readFileSync(path.resolve(__dirname, "../../static/lib/jasmine.min.js")).toString();
var jasmineHtml = fs.readFileSync(path.resolve(__dirname, "../../static/lib/jasmine-html.min.js")).toString();
var status = function () {
	var options = {
		port    : port,
		hostname: hostname,
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
var timeout = function (sessionId, callback) {
	var options = {
		port    : port,
		hostname: hostname,
		method  : 'POST',
		path    : '/session/' + sessionId + '/timeouts/async_script',
		headers : {
			"Content-Type"  : "application/json",
			"Content-Length": 0
		}
	};
	var body = JSON.stringify({ms: 1000 * 120})
	options.headers['Content-Length'] = body.length;
	var req = http.request(options, function (res) {

		if (res.statusCode == 200) {
			callback && callback();

		}
	});
	req.write(body)
	req.end()

}
var close = function (sessionId) {
	var options = {
		port    : port,
		hostname: hostname,
		method  : 'DELETE',
		path    : '/session/' + sessionId + "/window",
		headers : {
			"Content-Type"  : "application/json",
			"Content-Length": 0
		}
	};

	var req = http.request(options, function (res) {

	});
	req.end()

}

var executeAsync = function (sessionId, script, callback) {
	var options = {
		port    : port,
		hostname: hostname,
		method  : 'POST',
		path    : '/session/' + sessionId + "/execute_async",
		headers : {
			"Content-Type"  : "application/json",
			"Content-Length": 0
		}
	};

	var injectScript = jasmine + ";" + jasmineHtml + ";" + script + ";console.log(arguments[arguments.length-1]);console.log(1);arguments[arguments.length-1](document.title);"
	console.log(injectScript);
	var body = JSON.stringify({script: injectScript, args: []});
	console.log(arguments);
	options.headers['Content-Length'] = body.length;
	var req = new http.request(options, function (response) {
		var incoming = '';

		if (response.statusCode == 200) {

			response.on('data', function (chunk) {
				incoming += chunk;
				callback && callback(JSON.parse(incoming.toString()).value);
			});
		}

	});
	req.write(body);
	req.end();

}
var url = function (sessionId, url, callback) {
	var options = {
		port    : port,
		hostname: hostname,
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

}
var session = function (callback) {
	var data = {
		desiredCapabilities: {
			browserName      : "chrome",
			version          : '',
			platform         : 'ANY',
			javascriptEnabled: true,
			acceptSslCerts   : true
		}
	}

	var body = JSON.stringify(data);

	var options = {
		port    : port,
		hostname: hostname,
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

}

session(function (sessionId) {

	url(sessionId, "http://www.baidu.com", function () {
		timeout(sessionId, function () {

			var script = "window.name=1234213123;";
			executeAsync(sessionId, script, function (result) {
				console.log("result", result)
//                close(sessionId);
			})
		})
		// close(sessionId)

	})

})

// PUBLISH
module.exports = chromeDriver;
