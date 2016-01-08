var dl = (path, targetFile) => {
    var http = require('./http'),
        chalk = require('chalk'),
        ProgressBar = require('progress'),
        fs = require('fs'),
        url = require('url'),
        parsedPath = url.parse(path),
        req = http(path).request({
            hostname: parsedPath.hostname,
            path: parsedPath.pathname,
        }),
        defer;

    defer = new Promise((resolve, reject) => {

        req.on('response', function(res) {
            var len = parseInt(res.headers['content-length'], 10),
                file;

            if (res.headers['location']) {
                return dl(res.headers['location'], targetFile).then(() => {
                    resolve();
                });
            }

            file = fs.createWriteStream(targetFile);

            console.log('downloading ' + chalk.cyan(path) + ' ..');
            var bar = new ProgressBar(' :percent [:bar]  eta :etas', {
                width: 40,
                total: len
            });

            res.on('data', function (chunk) {
                file.write(chunk);
                bar.tick(chunk.length);
            });

            res.on('end', function () {
                file.end();
                console.log('\n');
                resolve();
            });
        });

        req.end();
    });

    return defer;
}

module.exports = dl;
