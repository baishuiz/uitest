/*
 * author : 王一
 */
var extend = require('xtend'),
    net = require('net'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    zlib = require('zlib'),
    path = require('path'),
    crypto = require("crypto"),
    exec = require('child_process').exec;

http.globalAgent.maxSockets=99999;
https.globalAgent.maxSockets=99999;

var HttpFilter = require('./httpfilter');

//颜色列表
var colors = {
    black: '\x1b[0;30m',
    dkgray: '\x1b[1;30m',
    brick: '\x1b[0;31m',
    red: '\x1b[1;31m',
    green: '\x1b[0;32m',
    lime: '\x1b[1;32m',
    brown: '\x1b[0;33m',
    yellow: '\x1b[1;33m',
    navy: '\x1b[0;34m',
    blue: '\x1b[1;34m',
    violet: '\x1b[0;35m',
    magenta: '\x1b[1;35m',
    teal: '\x1b[0;36m',
    cyan: '\x1b[1;36m',
    ltgray: '\x1b[0;37m',
    white: '\x1b[1;37m',
    reset: '\x1b[0m'
};

var defaultConfig = {
    'port': 1234,
    'logMode': 'all'
};

var PageProxy = function(){
    var self = this;
    return self._init.apply(self, arguments);
}

PageProxy.prototype = {

    _init: function(options){

        var self = this;
        var config = extend({}, defaultConfig, options);
        self._keyPath = path.resolve(config.keyPath) + '/';
        self._mapCerts = {};

        self._defaultFilters = config.defaultFilters;
        self._httpPort = config.port;
        self._httpsPort = config.port + 1;
        self._logMode = config.logMode;

        self._httpServer = null;
        self._httpsServer = null;

        HttpFilter.loadFilters(config.filterPath);

        self.start();

    },

    log: function(message, content){

        var self = this,
            logMode = self._logMode;
        if(logMode === 'all' || (logMode === 'error' && /error/i.test(message))){
            var dateString = (new Date()).toString().match(/\d\d:\d\d:\d\d/)[0];
            if (content !== undefined)
            {
                console.log(colors.dkgray +'[' + dateString + ']: ' + colors.reset, message, '\t', content);
            }
            else
            {
                console.log(colors.dkgray + '[' + dateString + ']: ' + colors.reset, message);
            }
        }
        return self;

    },

    start: function(){

        var self = this;

        self._startHttp();
        self._startHttps();
        self._proxyHttps();

        return self;

    },

    _startHttp: function(){

        var self = this,
            httpPort = self._httpPort;

        if(self._httpServer === null){
            var httpServer = http.createServer(function(req, res){
                self._doResponse(req, res);
            }).listen(httpPort, function () {
                    console.log('pageProxy listening on port ' + colors.green + '%d' + colors.reset + '.', httpPort);
                });
            httpServer.on('error', function(err){
                self.log(colors.red + 'HTTP ERROR' + colors.reset, err);
            })
            self._httpServer = httpServer;
        }

    },

    _startHttps: function(){

        var self = this,
            httpsPort = self._httpsPort,
            keyPath = self._keyPath;

        if(self._httpsServer === null){
            var httpsServer = https.createServer({
                key: fs.readFileSync(keyPath + 'cakey.pem'),
                cert: fs.readFileSync(keyPath + 'cacert.crt'),
                SNICallback: function(hostname){
                    return self._getCert(hostname);
                }
            },function(req, res){
                req.url = 'https://' + req.headers['host'] + req.url;
                self._doResponse(req, res);
            }).listen(httpsPort);
            httpsServer.on('error', function(err){
                self.log(colors.red + 'HTTPS ERROR' + colors.reset, err);
            })
            self._httpsServer = httpsServer;
        }

    },

    _getCert: function(hostname){
        var self =this,
            mapCerts = self._mapCerts,
            keyPath = self._keyPath;
        var cert = mapCerts[hostname];
        if(cert === undefined){
            var certFile = keyPath + hostname + '.crt';
            if(!fs.existsSync(certFile)){
                var testFile = keyPath + hostname + '-test.tmp';
                sleepFile = keyPath + '_sleep.tmp',
                    serial = '0x' + crypto.createHash('md5').update(hostname, 'utf8').digest('hex'),
                    makeCertCmd = 'makecert.bat ' + ' ' + hostname + ' ' + serial;
                exec(makeCertCmd, {cwd : keyPath});
                while (!fs.existsSync(testFile)) { fs.writeFileSync(sleepFile, 'a'); };
                try{
                    fs.unlinkSync(testFile);
                }
                catch(e){
                }
            }
            cert = crypto.createCredentials({
                'key': fs.readFileSync(keyPath + 'cakey.pem'),
                'cert': fs.readFileSync(certFile)
            }).context;
            mapCerts[hostname] = cert;
        }
        return cert;
    },

    _proxyHttps: function(){

        var self = this,
            httpServer = self._httpServer,
            httpsPort = self._httpsPort;

        if(httpServer){
            httpServer.on('connect', function(req, reqSocket, upgradeHead) {

                var resSocket = net.createConnection(httpsPort);

                resSocket.on('connect', function() {
                    reqSocket.write("HTTP/1.1 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n");
                });

                reqSocket.on('data', function(chunk) {
                    resSocket.write(chunk);
                });
                reqSocket.on('end', function() {
                    resSocket.end();
                });
                reqSocket.on('close', function() {
                    resSocket.end();
                });
                reqSocket.on('error', function(err) {
                    self.log(colors.red + 'SOCKET ERROR' + colors.reset, err.message);
                    resSocket.end();
                });

                resSocket.on('data', function(chunk) {
                    reqSocket.write(chunk);
                });
                resSocket.on('end', function() {
                    reqSocket.end();
                });
                resSocket.on('close', function() {
                    reqSocket.end();
                });
                resSocket.on('error', function(err) {
                    self.log(colors.red + 'socket error' + colors.reset, err.message);
                    reqSocket.end();
                });

            });
        }

    },

    //响应请求
    _doResponse: function(clientRequest, clientResponse){

        var self = this;

        var arrRequestBuffers = [], requestBufferSize = 0;
        clientRequest.on('data', function (data) {
            arrRequestBuffers.push(data);
            requestBufferSize += data.length;
        });
        clientRequest.on('end', function () {
            var requestBuffer = new Buffer(requestBufferSize), pos = 0;
            for(var i = 0, c = arrRequestBuffers.length; i < c; i++) {
                arrRequestBuffers[i].copy(requestBuffer, pos);
                pos += arrRequestBuffers[i].length;
            }
            self.log('Request Url', clientRequest.url);
            var httpData = {
                'method': clientRequest.method,
                'url': clientRequest.url,
                'requestHeaders': clientRequest.headers,
                'requestData': requestBuffer
            };
            var defaultFilters = self._defaultFilters;
            new HttpFilter(defaultFilters, httpData, function(httpData){
                var responseCode = httpData.responseCode,
                    responseHeaders = httpData.responseHeaders,
                    responseData = httpData.responseData;
                if(responseCode !== undefined){
                    clientResponse.writeHeader(responseCode, responseHeaders);
                    clientResponse.write(responseData);
                    clientResponse.end();
                }
                else{
                    var requestOptions = {
                        'method' : httpData.method,
                        'protocol': httpData.protocol,
                        'hostname' : httpData.hostname,
                        'port' : httpData.port,
                        'path' : httpData.path,
                        'headers' : httpData.requestHeaders
                    };
                    self._getRequest(requestOptions, httpData.requestData, function(responseCode, responseHeaders, responseData, responseTimes){
                        httpData.responseCode = responseCode;
                        httpData.responseHeaders = responseHeaders;
                        httpData.responseData = responseData;
                        httpData.responseTimes = responseTimes;
                        new HttpFilter(defaultFilters, httpData, function(httpData){
                            //修复https某些情况下会出现数据没发送完就断开的问题
                            delete httpData.responseHeaders['connection'];
                            clientResponse.writeHeader(httpData.responseCode, httpData.responseHeaders);
                            clientResponse.write(httpData.responseData);
                            clientResponse.end();
                        });
                    }, function(e){
                        self.log('REMOTE ERROR', e);
                        httpData.responseCode = '001';
                        httpData.responseError = e.code;
                        new HttpFilter(defaultFilters, httpData, function(httpData){
                            clientResponse.end();
                        });
                    });
                }
            });
        });
        clientRequest.on('error', function (e) {
            self.log(colors.red + 'REQUEST DATA ERROR' + colors.reset, e);
        });

    },

    //获取远程数据
    _getRequest: function(requestOptions, requestData, endCallback, errorCallback){

        var sendEndTime, responseStartTime, responseEndTime;

        var remoteRequest = (requestOptions.protocol==='https:'?https:http).request(requestOptions);

        remoteRequest.setTimeout(60000, function(){
            errorCallback({code:'ConnectionTimedOut.'});
        });

        remoteRequest.on('response', function (remoteResponse) {
            responseStartTime = new Date().getTime();//响应开始时间
            var arrResponseBuffers = [], responseBufferSize = 0;
            remoteResponse.on('data', function (data) {
                arrResponseBuffers.push(data);
                responseBufferSize += data.length;
            });
            remoteResponse.on('end', function () {
                responseEndTime = new Date().getTime();//响应结束时间
                var responseBuffer = new Buffer(responseBufferSize), pos = 0;
                for(var i = 0, c = arrResponseBuffers.length; i < c; i++) {
                    arrResponseBuffers[i].copy(responseBuffer, pos);
                    pos += arrResponseBuffers[i].length;
                }
                if(endCallback){
                    delete remoteResponse.headers['transfer-encoding'];
                    if(/^gzip$/i.test(remoteResponse.headers['content-encoding']) === true){
                        zlib.gunzip(responseBuffer, function(err, gunzip){
                            delete remoteResponse.headers['content-encoding'];
                            endCallback(remoteResponse.statusCode, remoteResponse.headers, gunzip, {
                                'wait': responseStartTime - sendEndTime,
                                'receive': responseEndTime - responseStartTime
                            });
                        });
                    }
                    else{
                        endCallback(remoteResponse.statusCode, remoteResponse.headers, responseBuffer, {
                            'wait': responseStartTime - sendEndTime,
                            'receive': responseEndTime - responseStartTime
                        });
                    }
                }
            });
            remoteResponse.on('error', function (e) {
                if(errorCallback){
                    errorCallback(e);
                }
            });
        });
        remoteRequest.on('error', function (e) {
            if(errorCallback){
                errorCallback(e);
            }
        });
        remoteRequest.write(requestData);
        remoteRequest.end();
        sendEndTime = new Date().getTime();//发送结束时间
    },

    close: function(){

        var self = this,
            httpServer = self._httpServer,
            httpsServer = self._httpsServer;

        if(httpServer){
            httpServer.close();
            self._httpServer = null;
        }

        if(httpsServer){
            httpsServer.close();
            self._httpsServer = null;
        }

        self.log('pageProxy closed');

        return self;

    }

}

module.exports = PageProxy;