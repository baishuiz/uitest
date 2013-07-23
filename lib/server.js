var io = require('socket.io')
var http = require('http')
var net = require('net')
var cfg = require('./config')

var logger = require('./logger')
var events = require('./events')
var constant = require('./constants')
var runner = require('./runner')
var renderResult = require("./result").renderResult
var path = require('path')
var fs = require('fs')
var log = logger.create("server")
var io_client = require('socket.io-client')
exports.start = function (cliOptions) {
//建立浏览器链接服务
    var configFile = path.resolve(__dirname, "../uitest.conf.js")
    var config = cfg.parseConfig(configFile, cliOptions)

    logger.setup(config.logLevel, config.colors, config.loggers)


    //tools
    var handleReport = function (data, result) {

        var reportResult = {id: data.id, result: result}

        return reportResult
    }
    console.log(config.server)
    var socket = io_client.connect(config.server, {port: config.serverPort})
    socket.on("connect", function () {
        log.info("connect success ");
        for (var i = 0; i < config.browsers.length; i++) {
            var registerName = config.browsers[i];

            socket.emit('console:register', {
                'name': registerName
            })
        }

    })

    socket.on('console:task_start', function (data) {

        var complete = function (result) {
            log.info("task complete")
            log.info(renderResult(result))
            //此处的reportResult为最终传给服务器的report
            socket.emit('console:task_finish', handleReport(data, result))
        }
        if (data.url) {
            log.info("task start " + data.url + " in " + data.browser)
            runner.run({file: data.url, singleRun: false, browser: data.browser}, complete)
        } else if (data.script) {
            log.info("task start in " + data.browser);
            runner.run({script: data.script, singleRun: false, browser: data.browser}, complete)
        } else if (data.html) {
            log.info("task start html " + data.html + ' ' + data.browser);
            runner.run({html: data.html, singleRun: false, browser: data.browser}, complete)
        }
    })
    socket.on("disconnect", function () {
        log.error("disconnect")
    })
}

