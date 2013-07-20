var http = require('http');
var https = require('https');

var server = http.createServer(function (req, res) {
    var request = http.request({
        hostname: 'www.taobao.com',
        port: 80,
        path: '/',
        method: 'GET'
    }, function (response) {
        var buffers = [];
        response.setEncoding('binary');
        response.on('data', function (chunk) {
            buffers.push(chunk)
        });
        response.on('end', function () {
            var buffer_all = Buffer.concat(buffers);
            res.writeHead(response.statusCode, response.headers);
            res.write(buffer_all.toString());
            res.end();
        });

    });

    request.end();
}).listen(1337, '127.0.0.1');