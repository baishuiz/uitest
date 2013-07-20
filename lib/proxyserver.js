var path = require('path');
var fs = require('fs');

var proxy = require('./pageproxy');
new proxy({
    keyPath: path.resolve(__dirname, '../')

})