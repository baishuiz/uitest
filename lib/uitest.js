var
    socket = require('socket.io'),
    events = require('./events'),
    browser = require("./browser");
var logger = require('./logger');
var log = logger.create("UITest");

var _ = require('lodash');


var _currentEnv;

function Env () {
    this.runner = new Runner(this);
    this.browser = "";

    this.results = { failedSpecs: 0, totalSpecs: 0, totalErrors: 0, urls: []};
    this.configs = {
        autoClose: true,
        timeout: 1000 * 60 //1min
    };
    this.data = {};
    this.reset = function () {
        this.runner = new Runner(this);
        this.results = { failedSpecs: 0, totalSpecs: 0, totalErrors: 0, urls: [], errors: []};
    }
}

function getEnv() {
    _currentEnv = _currentEnv || new Env();
    return _currentEnv;
}

function newEnv() {
    _currentEnv = new Env();
    return _currentEnv;
}

function config(key, value) {
    var env = getEnv();
    switch (arguments.length) {
        case 2:
            env.configs[key] = value;
            break;
        case 1:
            return env.configs[key]
    }
}

function Runner(env) {
    var self = this;
    self.env = env;

    self.queue = new Queue(this);
    self.before_ = [];
    self.after_ = [];
    self.suites_ = [];
}

Runner.prototype.execute = function (finishCallback) {
    var self = this;
    this.queue.start(function () {
        finishCallback && finishCallback(self);
    });
};


Runner.prototype.add = function (block) {

    this.queue.add(block);
};
Runner.prototype.addReadyFunc = function (func) {

    var lastBlock = this.queue.blocks[this.queue.blocks.length - 1];
    lastBlock.readyFunc = func;
};

Runner.prototype.insertNext = function (block) {
    this.queue.insertNext(block);
};

Runner.prototype.results = function () {
    return this.queue.results();
};

var Queue = function (runner) {
    this.runner = runner;
    this.blocks = [];
    this.running = false;
    this.index = 0;
    this.abort = false;
};

Queue.prototype.addBefore = function (block) {
    this.blocks.unshift(block);
};

Queue.prototype.add = function (block) {
    this.blocks.push(block);
};

Queue.prototype.insertNext = function (block) {

    this.blocks.splice((this.index + 1), 0, block);
};

Queue.prototype.start = function (onComplete) {
    this.running = true;
    this.onComplete = onComplete;
    this.next_();
};

Queue.prototype.isRunning = function () {
    return this.running;
};

Queue.LOOP_DONT_RECURSE = true;

Queue.prototype.next_ = function () {
    var self = this;

    log.debug('Running %s block',self.index);

    if (self.index < self.blocks.length) {
        var onComplete = function () {
            self.index++;
            self.next_();
        };

        self.blocks[self.index].execute(onComplete);
    } else {
        self.running = false;
        if (self.onComplete) {
            self.onComplete();
        }
    }

};

Queue.prototype.results = function () {
    var results = new jasmine.NestedResults();
    for (var i = 0; i < this.blocks.length; i++) {
        if (this.blocks[i].results) {
            results.addResult(this.blocks[i].results());
        }
    }
    return results;
};

var Block = function (runner, configs) {
    this.runner = runner;

    for (var p in configs) this[p] = configs[p];
};


Block.prototype.execute = function (onComplete) {
    var host = this, runner = this.runner, env = runner.env;
    var hasOpen = false;

    if (!runner.browser) {
        //
        // bugfix ,引起浏览器命名冲突
        // var currentBrowser = env.browser.replace(/\d*/ig,'');
        runner.browser = browser.createBrowser(env.browser, host.url, getEnv().configs.timeout);
        runner.browser.data = getEnv().data;
        hasOpen = true;
    }

    if (host.url && !hasOpen) {
        runner.browser.navigator(host.url);
    }

    var complete = function (datas) {
        /*
         * {
         *     failedSpecs:
         *     totalSpecs:
         *     totalErrors:
         *     urls:[],
         *     errors:[]
         * }
         * */

        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];

            var results = env.results;

            results.browser = runner.browser.name;
            results.browserFullName = runner.browser.fullName;
            results.urls.push(data);
            results.failedSpecs += data.failedSpecs;
            results.totalSpecs += data.totalSpecs;
            results.totalErrors += data.totalErrors;
        }

        onComplete();
    };
    runner.browser.start(host.func, host.readyFunc);
    runner.browser.once("complete", complete);
    runner.browser.once("error", complete)
};


var addQueue = function (cfg) {
    log.debug('add queue:%s',cfg);
    var env = getEnv(),
        runner = env.runner,
        navBlock;
    if (cfg.url) {
        navBlock = new Block(runner, {
            url: cfg.url,
            func: cfg.func
        });
        runner.add(navBlock);
    }

    else if (cfg.readyFunc) {
        runner.addReadyFunc(cfg.readyFunc);
    }
};

var open = function (url, func) {
    var win = {};
    addQueue({
        url: url,
        func: func
    });

    win.go = function (url, func) {
        addQueue({
            url: url,
            func: func
        });
    };

    win.ready = function (func) {
        addQueue({
            readyFunc: func
        });
    };
    return win;
};

//共享数据API

var mixData = function (data) {
    for (var p in data) {
        getEnv().data[p] = data[p];
    }
};


var setData = function (data) {
    mixData(data);
};

var getData = function () {
    return getEnv().data;
};

var execute = function (callback) {
    var env = getEnv();
    var runner = env.runner;
    runner.execute(function (runner) {
        if (env.configs.autoClose && runner.browser) {
            runner.browser.close();
        }
        callback && callback(env.results);
    })
};


var domain = 'taobao.com';
var taobao = {};

var login = function (username, password, isDaily) {
    if (isDaily) {
        domain = "daily.taobao.net";
    }
    else {
        domain = "taobao.com";
    }


    _login(username, password);
};

var logout = function (isDaily) {
    if (isDaily) {
        domain = "daily.taobao.net";
    }
    else {
        domain = "taobao.com";
    }


    _logout();
};


function _login(username, password) {
    var src = 'http://login.' + domain + '/member/login.jhtml?from=buy' +
        '&full_redirect=false&redirect_url=http://www.' + domain + '/go/act/uitest/login.php?t=' + new Date().getTime();

    setData({
        username: username,
        password: password
    });

    var win = open(src, function () {
        describe("登录", function () {
            it("获取数据并提交登录", function () {
                var info;

                getData(function (data) {
                    info = data;
                });

                waitsMathers(function () {

                    expect(info).toBeDefined();
                });

                runs(function () {


                    if (jQuery("#J_QuickLogin").css("display") != "none") {
                        var quick = jQuery("#J_Quick2Static");
                        if (quick[0])quick[0].click();
                    }
                    var safeInput = jQuery("#J_SafeLoginCheck");
                    if (safeInput[0] && safeInput[0].checked) {
                        safeInput[0].click();
                        safeInput[0].checked = false;
                    }


                    var form = jQuery('form')[0];

                    form['TPL_username'].value = info.username;
                    form['TPL_password'].value = info.password;
                    var button = jQuery("#J_SubmitStatic")[0];
                    button.click();
                    //  forms[0].submit();

                })


            })
        })


    });

    win.ready(function () {
        describe("登录", function () {
            it("判断登录跳转成功", function () {
                waitsMathers(function () {
                    expect(window.loginsuccess).toBeDefined();
                })
            })
        })
    })


}

function _logout() {
    var src = 'http://login.' + domain + '/member/login.jhtml?style=minisimple&from=buy' +
        '&full_redirect=false&redirect_url=' + encodeURI('http://www.' + domain + '/go/act/uitest/login.php?t=' + new Date().getTime());

    setData({
        src: 'http://login.' + domain + '/member/logout.jhtml?f=top&t=' + (+new Date())
    });


    open(src, function () {
        describe("淘宝帐号登出", function () {
            it("测试淘宝帐号登出", function () {
                var info;
                getData(function (data) {
                    info = data;
                });
                waitsMatchers(function () {

                    expect(info).toBeDefined();
                });
                runs(function () {
                    try {
                        var img = new Image();
                        img.src = info.src;

                    } catch (e) {

                    }
                });
                waits(2000);
                expect(1).toBe(1);
            })
        })
    })
}

exports.open = open;
exports.run = open;
exports.getData = getData;
exports.setData = setData;
exports.execute = execute;
exports.config = config;
exports.newEnv = newEnv;
exports.getEnv = getEnv;
exports.taobao = {
    login: login,
    logout: logout
};

