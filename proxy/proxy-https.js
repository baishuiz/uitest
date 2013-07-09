var http = require('http');
var https = require('https');
var net = require('net');
var zlib = require('zlib');
var fs = require('fs');
var path = require('path');
var url = require("url");
var log = require('../lib/logger').create('proxy');
var forward = require("./forward");


var DEFAULT_PORT = 8989;
var INTERNAL_HTTPS_PORT = 8000;
var app;
var httpServer;
var httpsServer;
var privateKeyFile = path.join(__dirname, './', 'keys', 'CA.key');
var certificateFile = path.join(__dirname, './', 'keys', 'CA.crt');

/**
 * Start up nproxy server on the specified port
 * and combine the processors defined as connect middlewares into it.
 *
 * @param {String} port the port proxy server will listen on
 * @param {Object} options options for the middlewares
 */
function proxy() {


    httpServer = http.createServer(function (req, res) {
        req.type = 'http';
        res.writeHead(200);
        res.end("hello world\n");
    }).listen(DEFAULT_PORT);

    httpsServer = https.createServer({
        key:fs.readFileSync(privateKeyFile),
        cert:fs.readFileSync(certificateFile)
    },function (req, res) {

        res.writeHead(200);
        res.end("hello world\n");
    }).listen(INTERNAL_HTTPS_PORT);

    proxyHttps();


    return {
        httpServer:httpServer,
        httpsServer:httpsServer
    }
}


/**
 * Listen the CONNECTION method and forward the https request to internal https server
 */
function proxyHttps() {
    httpServer.on('connect', function (req, socket, upgradeHead) {
        var netClient = net.createConnection(INTERNAL_HTTPS_PORT);

        netClient.on('connect', function () {

            socket.write("HTTP/1.1 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n");
        });

        socket.on('data', function (chunk) {
            netClient.write(chunk);
        });
        socket.on('end', function () {
            netClient.end();
        });
        socket.on('close', function () {
            netClient.end();
        });
        socket.on('error', function (err) {
            log.error('socket error ' + err.message);
            netClient.end();
        });

        netClient.on('data', function (chunk) {
            socket.write(chunk);
        });
        netClient.on('end', function () {
            socket.end();
        });
        netClient.on('close', function () {
            socket.end();
        });
        netClient.on('error', function (err) {

            socket.end();
        });

    });
};


proxy();

module.exports = proxy;