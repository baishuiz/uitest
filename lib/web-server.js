var http = require("http"),
    path = require("path"),
    fs = require("fs"),
    url = require("url");


var log = require('./logger').create('web-server');

exports.createServer = function (emitter) {
    var server = http.createServer(function (req, res) {
        var pathname = url.parse(req.url).pathname;
        if (/^\/static/.test(pathname)) {
            var p = path.resolve(__dirname, '..' + pathname);
        }
        if (/^\/test/.test(pathname)) {
            var p = path.resolve(__dirname, '..' + pathname);
        }
        fs.readFile(p, function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + p);
            }
            res.writeHead(200);
            res.end(data);
        })
    })
    //  io = socket.listen(server, { 'log level':2 });

    server.listen(8080);


    return server;


}
