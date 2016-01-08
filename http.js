var url = require('url'),
    http = require('http'),
    https = require('https');

module.exports = function(path) {
    return url.parse(path).protocol === 'http:' ? http : https;
}
