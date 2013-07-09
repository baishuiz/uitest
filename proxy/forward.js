var utils = require('./utils');
var log = require('../lib/logger').create('proxy');
var Buffer = require('buffer').Buffer;

/**
 * Forward the request directly
 */

function forward(req, res) {
    var url = utils.processUrl(req);
    var options = {
        url:url,
        method:req.method,
        headers:req.headers
    }
    var buffers = [];


    console.log(url)
    if (req.method === 'POST') {
        req.on('data', function (chunk) {
            buffers.push(chunk);
        });

        req.on('end', function () {
            options.data = Buffer.concat(buffers);
            utils.request(options, function (err, data, proxyRes) {
                _forwardHandler(err, data, proxyRes, res);
            });
        });
    } else {

        utils.request(options, function (err, data, proxyRes) {
            _forwardHandler(err, data, proxyRes, res)
        });
    }
};


function _forwardHandler(err, data, proxyRes, res) {
    if (err) {
        res.writeHead(404);
        res.end();
        return;
    }
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    res.write(data);
    res.end();
}

module.exports = forward;