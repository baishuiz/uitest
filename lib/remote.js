var io = require('socket.io');
var http = require('http');
var net = require('net');
var cfg = require('./config');

var logger = require('./logger');

var events = require('./events');

var constant = require('./constants');
var runner = require('./runner');
var renderResult = require("./result").renderResult;


var path = require('path');
var fs = require('fs');


var log = logger.create("remote");


var io_client = require('socket.io-client');
exports.start = function (cliOptions) {
//建立浏览器链接服务

    var configFile = path.resolve(__dirname, "../uitest.conf.js");
    var config = cfg.parseConfig(configFile, cliOptions);

    var done = function (results) {
        console.log(renderResult(results));
    };

    var complete = function () {
        process.exit(0);
    };


    var run = function (fileData) {
        var socket = io_client.connect(config.server, {port: config.remoteServerPort});

        socket.on("connect", function () {
            log.info("测试中心连接成功");
            var task = {
                script: fileData
            };

            socket.emit('run', task);
            socket.on('complete', function (data) {

                done(data)
            });
            socket.on('allcomplete', function () {
                complete()
            });
            socket.on("error", function (data) {
                log.error(data);
                complete()
            });
            socket.on("message", function (data) {
                log.info(data)

            });
            socket.on("disconnect", function () {
                log.error("disconnect");
                complete()
            })
        })


    };

    run(cliOptions.data);

};

