var util = require('util');

var helper = require('./helper');

var colors = require('colors');

var log = require('./logger').create('result');
exports.renderResult = function (result) {

	var msg = "\n";

	if (result.browser == null) {
		result.browserFullName = 'UITEST';
	}
	msg += "\n\n";
	msg += "-------------------------------------------------------------------------------------------\n";
	var s = util.format("测试结果: 浏览器:%s | 用例总数: %s | 失败用例总数: %s | 错误数：%s\n", result.browserFullName, result.totalSpecs, result.failedSpecs, result.totalErrors);
	if (result.failedSpecs) {
		msg += colors.red(s);
	}
	else if (result.totalErrors) {
		msg += colors.yellow(s);
	}
	else {
		msg += colors.green(s);
	}
	msg += "-------------------------------------------------------------------------------------------\n";
	if (result.errors && result.errors.length) {
		result.errors.forEach(function (e) {
			msg += colors.yellow(util.format("JS错误：%s", e.message)) + "\n";
			if (e.stack) {
				msg += "" + colors.grey(e.stack) + "\n"
			}
		})
	}
	result.urls.forEach(function (url) {
		if (!url)return;
		msg += "\n" + util.format("%s", url.url) + "\n";
		if (url.errors) {

			url.errors.forEach(function (e) {
				if (e.type = 'env') {
					result.envError = 1;
				}
				msg += '  ' + colors.yellow(util.format("%s", e.type)) + "\n";
				msg += '      ' + colors.yellow(util.format("%s", e.message)) + "\n";
				if (e.stack) {
					msg += '  ' + colors.grey(e.stack) + "\n"
				}

			})
		}
		if (url.suites) url.suites.forEach(function (suite) {
			msg += '  ' + util.format("%s", suite.description) + "\n";
			suite.specs.forEach(function (spec) {
				msg += '    ' + spec.description + "\n";
				spec.results_.forEach(function (result) {
					result.items_.forEach(function (item) {
						var s = util.format("      expect %s %s %s %s", item.actual, item.matcherName, item.expected, item.passed_ == true
							? item.message
							: "failed") + "\n";
						msg += !item.passed_
							? colors.red(s)
							: colors.green(s);
						if (item.trace && item.trace.stack && item.trace.stack != "undefined") {
							msg += "      " + colors.grey(item.trace.stack) + "\n"
						}
					})

				})

			})
		})

	});

	msg += "\n\n";
	msg += "-------------------------------------------------------------------------------------------\n";
	return msg;

};

