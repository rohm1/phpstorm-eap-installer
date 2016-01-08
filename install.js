'use strict';

var cheerio = require('cheerio'),
    fs = require('fs'),
    mustache = require('mustache'),
    chalk = require('chalk'),
    die = require('or-die'),
    argv = require('./argv'),
    dl = require('./dl'),
    execute = require('./execute'),
    http = require('./http'),
    config = require('./config'),
    i;

require('./mod_logger');

function renew() {
    execute('rm -rf ' + argv.home + '/.WebIde*/config/eval');
    execute('sed -i \'/evlsprt/d\' ' + argv.home + '/.WebIde*/config/options/options.xml');
    console.success("\n" + 'license renewed');
}

if (argv.renew) {
    renew();
    process.exit(0);
}

function createLauncher(v) {
    console.info('creating launcher for PhpStorm EAP ' + v + ' ..');
    fs.writeFileSync(argv.home + '/Desktop/PhpStorm.desktop',
        mustache.render(fs.readFileSync('launcher.template', 'utf8'), {
            home: argv.home,
            v: v
        })
    , {
        mode: 0o775
    });
}

function dlFromUrl(url, resolve, reject) {

    http(url).get(url, (res) => {
        var body = '';

        if (res.statusCode != 200) {
            return reject('something wrong happened..');
        }

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            var $,
                $a,
                bar,
                v,
                targetFile = argv.home + '/phpstorm.tar.gz';

            $ = cheerio.load(body);

            if (!($a = $('a[href$=".tar.gz"]')).length) {
                return reject('element not found..');
            }

            v = $a.html().match(/EAP\-([0-9]+\.[0-9]+)/)[1];

            dl($a.attr('href'), targetFile)
                .then(() => {
                    execute('rm -rf ' + argv.home + '/PhpStorm-*');
                    execute('tar -xzf ' + targetFile + ' -C ' + argv.home);
                    execute('rm -f ' + targetFile);
                    execute('rm -f ' + argv.home + '/Desktop/PhpStorm.desktop');
                    renew();
                    createLauncher(v);

                    resolve();
                });
        });

    }).on('error', (e) => {
        reject(e);
    });
}

function dlIndex(i) {
    var defer;

    if (i >= config.urls.length) {
        die('could not found a valid download source');
    }

    console.log('Downloading from ' + chalk.cyan(config.urls[i]) + ' ..');

    defer = new Promise((resolve, reject) => {
        dlFromUrl(config.urls[i], resolve, reject);
    });

    defer
        .then(() => {
            console.success("\n" + 'finished!');
        })
        .catch((msg) => {
            if (msg) {
                console.error(msg);
            }

            dlIndex(i + 1);
        });
}

dlIndex(0);
