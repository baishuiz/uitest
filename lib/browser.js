var Launcher = require('./launcher').Launcher,
    util = require('util'),
    socket = require('socket.io'),
    ws = require("./web-server"),
    helper = require("./helper"),

    events = require('./events'),
    logger = require('./logger'),

    proxy = require("./proxy");
var log = logger.create("Browser");

//代理
var capturedBrowsers;
var proxyServer = proxy.createProxy();
var server = ws.createServer();
//开启socket，等待浏览器链接
var io = socket.listen(server, {"log level":1});
io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);


io.sockets.on('connection', function (socket) {
    socket.on('register', function (info) {

        if (capturedBrowsers) {
            info.socket = socket;
            capturedBrowsers.register(info)
        }
    });
});


var defaultResult = function () {
    return {

        failedSpecs:[],
        totalSpecs:[],
        suites:[],
        errors:[]
    }
};

var Browser = function (name, url, timeout, emitter) {
    var host = this;
    this.name = name;
    this.data = {};
    this.fullName = null;
    this.isReady = true;
    this.timeout = timeout;
    this.launcher = new Launcher(emitter);


    this.toString = function () {
        return this.name;
    };
    this.url = url;

    this.close = function () {

        capturedBrowsers.remove(this);
        this.launcher.kill();

    }

    this.register = function (info) {
        log.info("register")
        var host = this;
        host._canRun = true;
        host._canNav = true;
        this.fullName = helper.browserFullNameToShort(info.name);

        this.socket = info.socket;
        // log.info('Connected on socket id ' + host.id);
        this.launcher.markCaptured();


        this.socket.on("set_data", function (data) {
            _.merge(host.data, data);
        })
        this.socket.on("get_data", function (data) {

                host.socket.emit("push_data", host.data)

        })
        this.socket.on("complete", function (result) {

            if (!host.isComplete) {
                host.isComplete = true;
                log.info(host.name + " is completed");
                if (host.url) result.url = host.url;
                result.browser = host.fullName;

                host.emit("complete", result);
                host.url = null;
            }

        })
        this.socket.on("disconnect", function () {
            host.emit("disconnect");
            //  log.warn('Disconnected');


        })

        this.socket.on("close", function () {
            host.emit("discconnect");
        })
        // emitter.emit('browser_register', this);
        // emitter.emit('browsers_change', collection);


    };

    this.navigator = function (cmd, url) {
        var host = this;
        host.url = null;
        if (url) {
            host.url = url

        }
        this.startBrowser();

        this.isComplete = false;

        if (cmd === "go") {
            if (/\?/.test(url)) {
                url += "&_ut_=" + this.id
            }
            else {
                url += "?_ut_=" + this.id
            }
        }

        host.canNav(function () {
            log.info(host.name + " navigator to " + (url || cmd));
            try {

                host.socket && host.socket.emit("navigator", {
                    cmd:cmd,
                    url:url
                })
                host._canNav = false;
            } catch (e) {
                log.error(e)
            }
            setTimeout(function () {
                host.emit("complete");
            }, 1000)
        })

    };
    this.startBrowser = function () {
        var host = this;
        if (!host.scriptBrowser) {
            host.scriptBrowser = this.launcher.launch(host.name, host.url||"http://www.baidu.com", host.timeout, 1);
            host.scriptBrowser.on("browser_process_failure", function () {

                host.scriptBrowser.kill();
                delete host.scriptBrowser ;

                if (!host.isComplete) {

                    host.emit("browser_process_failure");


                    log.error(host.name + " browser_process_failure")
                    host.isComplete = true;
                    var result = defaultResult();
                    result.browser = host.fullName;
                    if (host.url)result.url = host.url;
                    if (!result.url) result.url = "unknow url"
                    result.errors.push({type:"timeout", message:(host.url || "unknow url") + "browser_process_failure"})
                    host.emit("complete", result);
                    host.url = null;

                }
            })
            host.id = host.scriptBrowser.id;
        }
    }
    this.start = function (func, ready) {


        var host = this;
        host.isComplete = false;
        var tryNum = 1;
        var runTimeout;
        this.startBrowser();

        if (ready) {
            log.info(host.name + " ready run");
            host.url = null;
        }
        else {
            log.info(host.name + " start run");
        }
        host.canRun(function () {
            host.socket.emit("start", {
                func:"with(window.UT){(" + func.toString() + ")()};"
            })
            host._canRun = false;
        }, ready);

        if (host.runTimeout) {
            clearTimeout(host.runTimeout)
            host.runTimeout = null;
        }


        host.runTimeout = setTimeout(function () {
            if (!host.isComplete) {
                log.error(host.name + " timeout")
                host.isComplete = true;
                var result = defaultResult();
                result.browser = host.fullName;
                if (!ready) {
                    if (host.url)result.url = host.url;
                    if (!result.url) result.url = "unknow url"
                    result.errors.push({type:"timeout", message:(host.url || "unknow url") + "运行超时"})
                }
                else {
                    result.url = "等待页面跳转"
                    result.errors.push({type:"timeout", message:"页面示正常跳转"})
                }

                host.emit("complete", result);
                host.url = null;

            }
        }, host.timeout)

    };
    this.canRun = function (callback, ready) {
        var host = this;
        var timeout = 0;
        var t = 50;
        var timer;

        (function () {

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            if (host._canRun) {

                callback & callback();

            }
            else if (timeout > host.timeout) {
                if (!ready) {
                    log.error("无法和被测页面建立连接，可能是页面加载异常导致")
                    //  应该重新启动浏览器
                    host.scriptBrowser.kill();
                    delete host.scriptBrowser ;

                }
                //  host.emit("failure", {type:"timeout", message:host.url + "无法建立链接"})
            }
            else {
                timeout += t;

                timer = setTimeout(arguments.callee, t);
            }

        })();


    };
    this.canNav = function (callback) {
        var host = this;

        var timeout = 0;
        var t = 50;
        var timer;

        (function () {
            if (host._canNav) {
                callback & callback();
            }
            else if (timeout > host.timeout) {
                log.error("无法和被测页面建立连接，可能是页面加载异常导致")
                //   host.emit("failure", {type:"timeout", message:host.url + "无法建立链接"})
            }
            else {
                timer = setTimeout(arguments.callee, t);
            }

        })()

    };

    this.onError = function (error) {
        if (this.isReady) {
            return;
        }
        this.lastResult.error = true;
        emitter.emit('browser_error', this, error);
    };

    this.onComplete = function (result) {
        if (this.isReady) {
            return;
        }
        this.isReady = true;
        this.lastResult.totalTimeEnd();
        emitter.emit('browsers_change', this);
        emitter.emit('browser_complete', this, result);
    };

    this.onDisconnect = function () {
        if (!this.isReady) {
            this.isReady = true;
            this.lastResult.totalTimeEnd();
            this.lastResult.disconnected = true;
            emitter.emit('browser_complete', this);
        }

    };

    this.serialize = function () {
        return {
            id:this.id,
            name:this.name,
            isReady:this.isReady
        };
    };

};
util.inherits(Browser, events.EventEmitter);


var Collection = function (browsers) {
    browsers = browsers || [];
    this.results = {};

    // Use ecma5 style to make jshint happy
    Object.defineProperty(this, 'length', {
        get:function () {
            return browsers.length;
        }
    });
    this.register = function (info) {
        browsers.forEach(function (browser) {
            if (info.id == browser.id) {
                browser.register(info);
            }
        })
    };


    this.add = function (browser) {
        browsers.push(browser);
        this.emit('browsers_change', this);
    };
    this.close = function () {
        browsers.forEach(function (browser) {
            browser.close();
        })
    };

    this.remove = function (browser) {
        var host = this;
        var index = browsers.indexOf(browser);
        if (index === -1) {
            return false;
        }
        browsers.splice(index, 1);
        if (browsers.length == 0) {
            if (!host.isComplete) {
                host.emit("complete", host.results);
                host.isComplete = true;
            }
        }
        this.emit('browsers_change', this);
        return true;
    };

    this.serialize = function () {
        return browsers.map(function (browser) {
            return browser.serialize();
        });
    };


    this.clone = function () {
        return new Collection(browsers.slice());
    };

    // Array APIs
    this.map = function (callback, context) {
        return browsers.map(callback, context);
    };

    this.forEach = function (callback, context) {
        return browsers.forEach(callback, context);
    };
};
util.inherits(Collection, events.EventEmitter);

capturedBrowsers = new Collection();


exports.Browser = Browser;
exports.Collection = Collection;
exports.createBrowser = function (type, url, timeout) {

    var newBrowser = new Browser(type, url, timeout);

    capturedBrowsers.add(newBrowser);

    newBrowser.on("no_cmd", function () {
        capturedBrowsers.remove(newBrowser)
    })
    newBrowser.on("browser_process_failure", function () {
        capturedBrowsers.remove(newBrowser)
    })
    return newBrowser;
};

/*

 exports.createBrowser = function (types, url, timeout) {
 capturedBrowsers = new Collection();

 types.forEach(function (type) {


 var newBrowser = new Browser(type, url, timeout);

 capturedBrowsers.add(newBrowser);
 newBrowser.on("no_cmd", function () {
 capturedBrowsers.remove(newBrowser)
 })
 newBrowser.on("browser_process_failure", function () {
 capturedBrowsers.remove(newBrowser)
 })


 })

 return capturedBrowsers;
 };


 */

