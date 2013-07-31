;(function () {
    if (window != top) return;
    function ready(fn) {
        fn && fn();
    }

    if (window.UT) {
        return;
    }

    function getScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        // node.charset = "utf-8";
        script.async = true;

        if (script.attachEvent) {
            script.attachEvent("onreadystatechange", function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    callback && callback();
                }
            });
        } else {
            script.addEventListener("load", callback, false);
            script.addEventListener("error", callback, false);
        }
        script.src = url;
        document.body.appendChild(script)

    }


    function getScripts(srcs, cb) {
        var i = 0, l = srcs.length;
        var f = function () {
            getScript(srcs[i], function () {
                i++;

                if (i == l) {

                    cb && cb();
                }
                else {
                    f();
                }
            })
        };
        f();
    }

    function log() {
        if (window.console) {
            window.console.log(arguments[0])
        }
    }

    log("注入脚本成功");
    ready(function () {


        log("页面加载成功");
        //避免iframe


        var stamp = location.href.match(/_ut_=(\d*)/) || window.name.match(/_ut_=(\d*)/);

        var etaoStamp = location.href.indexOf('jstest') != -1;

        //检查id标识
        if (!stamp) {
            return;
        }
        //使用window.name来保存id信息。window.name页面刷新后不会改变
        window.name = stamp[0];

        var varname = '_ut_json_report';

        var id = stamp[1];


        getScript("http://localhost:8080/socket.io/socket.io.js", function () {
            if (!etaoStamp) {

                log("准备建立连接");
                var socket = io.connect('http://localhost:8080');
                socket.on('connect', function () {
                    socket.emit('register', {name: navigator.userAgent, id: id});
                    log("连接已经建立")
                });
                socket.on("navigator", function (data) {
                    log("导航到 ", data.url);
                    location.href = data.url;
                });

                socket.on("start", function (data) {

                    //新开一个环境

                    log("开始执行");
                    var error;

                    getScripts(data.files, function () {
                        log("加载依赖脚本完成");
                        try {
                            UT._socket = socket;
                            jasmine._newEnv = true;
                            if (window.alert)window.alert = function () {
                            };
                            if (window.confirm)window.confirm = function () {
                                return true
                            };

                            eval(data.func);
                        } catch (e) {
                            log("error" + e);
                            error = {};
                            error.message = e.message;
                            error.type = e.type;
                            error.stack = e.stack;

                        } finally {
                            UT.execute(function (result) {
                                if (error) {
                                    result.errors = result.errors || [];
                                    result.errors.push(error);
                                    result.totalErrors = result.errors.length;
                                    result.url = location.href;
                                }
                                log("complete");

                                socket.emit('complete', result);
                            });
                        }
                    });
                    // show reports();
                })

            } else {
                //etao的页面测试
                log("准备建立连接");
                var socket = io.connect('http://localhost:8080');
                socket.on('connect', function () {
                    socket.emit('register', {name: navigator.userAgent, id: id});
                    log("连接已经建立")
                });
                socket.on("navigator", function (data) {
                    log("导航到 ", data.url);
                    location.href = data.url;
                });

                socket.on("start", function (data) {
                    var complete = function () {
                        if (window[varname]) {
                            socket.emit('complete', window[varname]);
                            window[varname].url  = location.href;
                            clearInterval(timer);
                        }
                    };
                    var timer = setInterval(complete, 1000);

                    // show reports();
                })

            }


        })
    })

})();