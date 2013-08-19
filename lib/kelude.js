//专为taobao-kelude接入提供的接口
var cfg = require("./config");
var http = require("http");
var path = require("path");
var vm = require('vm');
var fs = require("fs");
var UT = require("./uitest");
var errors = require('./error');
var helper = require("./helper");
var mkdirp = require("mkdirp");

var newEnv = UT.newEnv;
var renderResult = require("./result").renderResult;
var logger = require('./logger');
var log = logger.create('kelude');

function eval(script) {
	var sandbox = {};
	helper.merge(sandbox, global);
	sandbox.global = sandbox;
	sandbox.UT = UT;
	//不建议使用，为了兼容以前API
	sandbox.UT.configs = {};
	try {
		vm.runInNewContext(script, sandbox)
	} catch (e) {
		throw  e
	}
}

process.on("uncaughtException", function (e) {
	log.error(e);
//    process.exit(0);
});

exports.run = function (cliOptions, next) {

	var structureObj = {"paths": [
		{"path_name"  : "path_name",
			"svn_path": "表示脚本存放在svn 上的地址",
			"methods" : [
				{
					"method_name": "默认选中一个Tab校验",
					"identifier" : "path_name/method_name1",
					"doc"        : "方法的描述",
					"step"       : "tc的步骤",
					"priority"   : "优先级",
					"tc_id"      : "tc编号",
					"group_by"   : "分组"
				},
				{
					"method_name": "默认选中一个Tab校验1",
					"identifier" : "path_name/method_name2",
					"doc"        : "方法的描述",
					"step"       : "tc的步骤",
					"priority"   : "优先级",
					"tc_id"      : "tc编号",
					"group_by"   : "分组"
				}
			]
		}
	]
	};

	var defaultResult = {

		failedSpecs: 0,
		totalSpecs : 0,
		totalErrors: 0,
		suites     : [],
		urls       : [],
		errors     : []

	};

	var configFile = path.resolve(__dirname, "../uitest.conf.js");
	var config = cfg.parseConfig(configFile, cliOptions);

	log.debug('singleRun:%s', config.singleRun);

	if (config.browsers) {
		config.browsers = config.browsers.split(",")
	}

	config.browsers.forEach(function (browser, i) {
		switch (browser) {
			case 'chrome':
				config.browsers[i] = 'Chrome';
				break;
			case 'ff':
				config.browsers[i] = 'Firefox';
				break;
			default:
				break;
		}
	});

	logger.setup(config.logLevel, config.colors, config.loggers);

	if (!helper.isFunction(next)) {
		next = function (result) {
			if (result) {
				var msg = renderResult(result)
				var resultObj = {"results": []};
				resultObj.results.push({
					"identifier": 'hello',
					"log"       : msg,
					"result"    : result.failedSpecs ? 'fail' : 'pass',
					"browser"   : result.browser && result.browser.toLowerCase()
				});
				fs.writeFile(config.structure_file, JSON.stringify(structureObj), function (err) {
					if (err) throw err;
					log.info('create %s file', config.structure_file);
				});
				fs.writeFile(config.results_file, JSON.stringify(resultObj), function (err) {
					if (err) throw err;
					log.info('create %s file', config.results_file);
				});
				console.log(msg)
			}

			if (config.singleRun !== false) {

			}
		}
	}

	if (config.file) {
		var file = config.file;
		//the file on the server
		//local file
		file = path.resolve(process.cwd(), config.file);
		fs.readFile(file, function (err, data) {
			if (err) {
//				log.error("open '" + file + "' failed: ");
				defaultResult.errors.push({type: "E404", message: '无法打开' + file + ' 可能是路径错误'});
				defaultResult.totalErrors += 1;
				next(defaultResult);
				throw err;
			}
			var content = data.toString();
			try {
				eval(content);
			} catch (e) {
				throw e;
			}
			finally {
				run(content)
			}
		})

	}

	function run(content) {

		config.browsers.forEach(function (name) {
			var env = newEnv();
			env.singleRun = true;
			env.browser = name;

			if (config.singleRun === false) {
				env.singleRun = false
			}

			try {
				eval(content)
			} catch (e) {
				defaultResult.errors.push({type: "uitest", message: e.message, stack: e.stack});
			}
			finally {
				UT.execute(function (result) {

					next && next(result)
				})
			}

		})
	}
}


