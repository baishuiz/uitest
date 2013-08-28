//专为taobao-kelude接入提供的接口
var cfg = require("./config");
var http = require("http");
var path = require("path");
var vm = require('vm');
var fs = require("fs");
var UT = require("./uitest");
var errors = require('./error');
var helper = require("./helper");
var mkdirp = require('mkdirp');
var readdirp = require('readdirp');

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
    process.exit(0);
});

exports.run = function (cliOptions, next) {

	var currentRunJsIndex = 0;
	var jscount = 1;

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

	if (config.browsers) {
		config.browsers = config.browsers.split(",")
	}

	var appPath = config.app_path;

	var rp = fs.readdirSync(appPath);

	console.log(rp);

//	config.browsers.forEach(function (browser, i) {
//		switch (browser) {
//			case 'chrome':
//				config.browsers[i] = 'Chrome';
//				break;
//			case 'ff':
//				config.browsers[i] = 'Firefox';
//				break;
//			case 'ie':
//				config.browsers[i] = 'IE';
//				break;
//			default:
//				break;
//		}
//	});

	logger.setup(config.logLevel, config.colors, config.loggers);
	var resultObj = {"results": []};

	if (!helper.isFunction(next)) {
		next = function (result) {
			currentRunJsIndex++;
			if (result) {

				var msg = renderResult(result);

				resultObj.results.push({
					"log"    : msg,
					"result" : result.failedSpecs ? 'fail' : 'pass',
					"browser": result.browser && result.browser.toLowerCase()
				});

				console.log(msg)
			}
			console.log("当前已经获得第%s个运行结果", currentRunJsIndex);
			console.log("总共需要获得的运行结果数:%s", jscount);

			if (currentRunJsIndex >= jscount) {
				done();
			}
		}
	}

	function done() {
		fs.writeFileSync(config.structure_file, JSON.stringify(structureObj));
		log.info('create %s file', config.structure_file);
		fs.writeFileSync(config.results_file, JSON.stringify(resultObj));
		log.info('create %s file', config.results_file);
		setTimeout(function () {process.exit(0);}, 1000);

	}

	readdirp({ root: path.resolve(appPath, './test'), depth: 1, fileFilter: ["*.js"]},
		function (stat) {
			execute(stat.fullPath);
		},
		function (err, data) {
			if (err) throw err;
			jscount = (data.files && data.files.length) || 1;
		});

	function execute(file) {
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
			switch (name) {
				case 'chrome':
					name = 'Chrome';
					break;
				case 'ff':
					name = 'Firefox';
					break;
				case 'ie':
					name = 'IE';
					break;
				default:
					break;
			}
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


