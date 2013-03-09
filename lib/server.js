var io = require('socket.io');
var http = require('http');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');

var events = require('./events');

var constant = require('./constants');
var runner = require('./runner');
var renderResult = require("./result")


var path = require('path');
var fs = require('fs');


var log = logger.create("server");



var io_client = require('socket.io-client');
exports.start = function (cliOptions) {
//建立浏览器链接服务

    var config = cfg.parseConfig(cliOptions.configFile, cliOptions);
    logger.setup(config.logLevel, config.colors, config.loggers);



    var registerName = config.browsers[0];
    config.browsers[0] = config.browsers[0].replace(/\d/ig, "");

    var socket = io_client.connect("localhost", {port:3031});
    socket.on("connect", function () {
        log.info("connect success");
        socket.emit('console:register', {
            'name':registerName
        });
    })

    socket.on('console:task_start', function (data) {
        log.info("task start " + data.url)
        var complete = function (report) {
            log.info("task complete")
            log.info(renderResult.renderResult(report))
             var datasetReport ;
            for(var p in report){
                datasetReport =report[p];
            }

            var reportResult =  {id:data.id, report:datasetReport}
            console.log(reportResult);
            socket.emit('console:task_finish', reportResult);
        }
        runner.run({url:data.url,singleRun:false}, complete)
    })
    socket.on("disconnect", function () {
        log.error("disconnect")
    })

}





