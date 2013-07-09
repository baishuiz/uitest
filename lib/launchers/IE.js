var BaseBrowser = require('./Base');
var util = require("util");
var helper = require("../helper");
var _ = require('lodash');

var IEBrowser = function () {

    BaseBrowser.apply(this, arguments);
    this._getOptions = function (url) {
        // IE CLI options
        // http://msdn.microsoft.com/en-us/library/hh826025(v=vs.85).aspx
        return [
            '-new',
            url
        ];
    };
};

util.inherits(IEBrowser, BaseBrowser);
_.merge(IEBrowser.prototype, {
    name: 'IE',
    DEFAULT_CMD: {
        win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
    },
    ENV_CMD: 'IE_BIN'
});


// PUBLISH
module.exports = IEBrowser;
