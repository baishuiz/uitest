var BaseBrowser = require('./Base');
var util = require("util");
var helper = require("../helper");
var _ = require('lodash');


var ChromeBrowser = function () {
    BaseBrowser.apply(this, arguments);

    this._getOptions = function (url) {
        // Chrome CLI options
        // http://peter.sh/experiments/chromium-command-line-switches/
        return [
            '--no-default-browser-check',
            '--allow-legacy-extension-manifests',
            '--no-first-run',
            '--start-maximized',
            '--allow-running-insecure-content',
            '--ignore-certificate-errors',
            '--new-window',
            url
        ];
    };
};
util.inherits(ChromeBrowser, BaseBrowser);

_.merge(ChromeBrowser.prototype, {
    name: 'Chrome',

    DEFAULT_CMD: {
        linux: 'google-chrome',
        darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        win32: (process.env.LOCALAPPDATA || process.env.APPDATA) + '\\Google\\Chrome\\Application\\chrome.exe'
    },
    ENV_CMD: 'CHROME_BIN'
});


// PUBLISH
module.exports = ChromeBrowser;
