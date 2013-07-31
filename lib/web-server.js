var http = require("http"),
	path = require("path"),
	https = require("https"),
	fs = require("fs"),
	url = require("url");

var log = require('./logger').create('web-server');

exports.createServer = function () {
	var serverPort = 8080;
	//create server
	var server = http.createServer(function (req, res) {
		var pathname = url.parse(req.url).pathname;
		fs.readFile(path.resolve(__dirname, '..' + pathname), function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + path.resolve(__dirname, '..' + pathname));
			}
			res.writeHead(200);
			res.end(data);
		})
	});

	server.listen(serverPort);
	log.info('web server start at %s', serverPort);

};