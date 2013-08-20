var cfg = require("./config");
var http = require("http");
var path = require("path");
var vm = require('vm');
var fs = require("fs");
var UT = require("./uitest");
var errors = require('./error');
var remote = require("./remote");
var helper = require("./helper");

var newEnv = UT.newEnv;
var renderResult = require("./result").renderResult;
var logger = require('./logger');
var log = logger.create('runner');

process.on("uncaughtException", function (e) {
//    log.error(e);
//    process.exit(0);
});

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

exports.run = function (cliOptions, next) {

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
	if (config.browser) {
		config.browsers = [config.browser]
	}

	logger.setup(config.logLevel, config.colors, config.loggers);

	if (!helper.isFunction(next)) {
		next = function (result) {

			if (result) {
				console.log(renderResult(result))
			}

			if (config.singleRun !== false) {
				setTimeout(function(){
					process.exit(0);
				},1000);
			}
		}
	}

	var run = function (content) {
		if (config.remote) {
			remote.start({data: content})
		}
		else {
			config.browsers.forEach(function (name) {
				var env = newEnv();
				env.singleRun = true;
				env.browser = name;

				if (config.singleRun === false) {
					env.singleRun = false
				}

				try {
					// console.log(buffers_all.toString())
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
	};

	if (config.file) {
		var file = config.file;
		//the file on the server
		if (file.indexOf('http') != -1 && file.indexOf('.js') == -1) {
			http.get(file,function (res) {
				var buffers = [];
				res.on('data', function (chunk) {
					buffers.push(chunk)
				});
				res.on("end", function () {
					var buffers_all = Buffer.concat(buffers).toString();
					//如果文件为空，抛出错误，直接返回结果
					if (buffers_all.replace(/\n|\s|\r/ig, '') == '') {
						log.error('文件内容为空！');
						defaultResult.errors.push({type: "E001", message: file + '为空'});
						defaultResult.totalErrors += 1;
						next(defaultResult);
						return;
					}
					try {
						eval(buffers_all);
					} catch (e) {
						throw e;
					}
					finally {
						run(buffers_all)
					}
				})
			}).on('error', function (e) {
					log.error("Got error: " + e.message);
					defaultResult.errors.push({type: "E002", message: e.message, stack: e.stack});
					next && next({"unknown browser": defaultResult})
				})
		} else {
			//local file
			file = path.resolve(process.cwd(), config.file);
			fs.readFile(file, function (err, data) {
				if (err) {
					log.error("open '" + file + "' failed: ");
					defaultResult.errors.push({type: "E404", message: '无法打开' + file + ' 可能是路径错误'});
					defaultResult.totalErrors += 1;
					next(defaultResult);
					throw err
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

	} else if (config.script) {
		var content = config.script.toString();
		run(content)
	} else if (config.html) {
		run("UT.open('" + config.html + "',function(){});")
	}

};


