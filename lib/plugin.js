var logger = require('./logger');
var log = logger.create('plugin');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var chromeBrowser = {
    name: 'Chrome',

    DEFAULT_CMD: {
        linux: 'google-chrome',
        darwin: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome',
        win32: (process.env.LOCALAPPDATA || process.env.APPDATA) + '\\Google\\Chrome\\Application\\chrome.exe'
    },
    ENV_CMD: 'CHROME_BIN',
    PARAMS: ['–enable-easy-off-store-extension-install'],
    PLUGIN_PATH: path.resolve(__dirname, '../plugin/chrome/uitest.crx')
}

var firefoxBrowser = {
    name: 'Firefox',

    DEFAULT_CMD: {
        linux: 'firefox',
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        win32: process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe'
    },
    ENV_CMD: 'FIREFOX_BIN',
    PARAMS: [],
    PLUGIN_PATH: path.resolve(__dirname, '../plugin/firefox/uitest.xpi')
}

//TODO：safari会自动删除安装完的插件，需要解决下。
var safariBrowser = {
    name: 'Safari',

    DEFAULT_CMD: {
        darwin: '/Applications/Safari.app/Contents/MacOS/Safari'
    },
    ENV_CMD: 'SAFARI_BIN',
    PARAMS: [],
    PLUGIN_PATH: path.resolve(__dirname, '../plugin/safari/uitest.safariextz')
}

var ieBrowser = {
    name: 'IE',
    DEFAULT_CMD: {
        win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
    },
    PARAMS: [],
    ENV_CMD: 'IE_BIN',
    PLUGIN_PATH: path.resolve(__dirname, '../plugin/ie/setup/setup.bat')
}


var browserPool = [safariBrowser, firefoxBrowser, chromeBrowser];

var _getCommand = function (browser) {
    var cmd = path.normalize(process['env']['ENV_CMD'] || browser['DEFAULT_CMD'][process.platform]);

    if (!cmd) {
        log.error('没有找到%s的浏览器BIN文件\n\t' +
            '请设置 "%s" 环境变量.', browser.name, browser.ENV_CMD);
    }

    return cmd;
};

//TODO: kill Browser
var _killBrowser = function (browser) {
    ps.stdout.on('data', function (data) {
        grep.stdin.write(data);
    });

    ps.stderr.on('data', function (data) {
        console.log('ps stderr: ' + data);
    });

    ps.on('close', function (code) {
        if (code !== 0) {
            console.log('ps process exited with code ' + code);
        }
        grep.stdin.end();
    });

    grep.stdout.on('data', function (data) {
        console.log('' + data);
    });

    grep.stderr.on('data', function (data) {
        console.log('grep stderr: ' + data);
    });

    grep.on('close', function (code) {
        if (code !== 0) {
            console.log('grep process exited with code ' + code);
        }
    });
}

exports.install = function () {
    browserPool.forEach(function (browser) {
        var cmd = _getCommand(browser);
        if (cmd) {
            if (browser.name === 'IE') {
                exec(browser['PLUGIN_PATH']);
            } else {
                exec(cmd + ' ' + browser['PLUGIN_PATH']);
            }
        }
    })
}