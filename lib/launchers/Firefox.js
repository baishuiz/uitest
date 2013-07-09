var spawn = require('child_process').spawn;

var fs = require('fs');

var BaseBrowser = require('./Base');
var util = require("util");
var helper = require("../helper");
var _ = require('lodash');
var log = require('../logger').create();

// http://kb.mozillazine.org/About:config_entries
// about:config
var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
        'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n' +
        'user_pref("network.websocket.enabled", true);\n' +
        'user_pref("network.websocket.allowInsecureFromHTTPS", true);\n';

// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var FirefoxBrowser = function (id) {
    BaseBrowser.apply(this, arguments);

    this._start = function (url) {
        var self = this;
        var command = this._getCommand();
        var profilePath;
        var errorOutput = '';

        var p = spawn(command, ['-CreateProfile', 'uitest', '-no-remote']);

        p.stderr.on('data', function (data) {
            errorOutput += data.toString();
        });

        p.on('close', function () {
            var match = /at\s'(.*)[\/\\]prefs\.js'/.exec(errorOutput);

            if (match) {
                profilePath = match[1];
            }

            log.debug('profilePath is %s', profilePath);
            log.debug('tempDir is %s', self._tempDir);
            fs.createWriteStream(profilePath + '/prefs.js', {flags: 'a'}).write(PREFS);

            self._execCommand(command, [url, '-P', 'uitest', '-no-remote']);
        });
    };
};
util.inherits(FirefoxBrowser, BaseBrowser);
_.merge(FirefoxBrowser.prototype, {
    name: 'Firefox',

    DEFAULT_CMD: {
        linux: 'firefox',
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        win32: process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe'
    },
    ENV_CMD: 'FIREFOX_BIN'
});


// PUBLISH
module.exports = FirefoxBrowser;
