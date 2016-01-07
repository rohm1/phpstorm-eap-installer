var argv = require('yargs')
        .boolean(['v', 'renew', 'h'])
        .demand('home')
        .nargs('home', 1)
        .describe('home', 'the home directory to install to')
        .default('v', false)
        .alias('v', 'verbose')
        .default('renew', false)
        .describe('renew', 'renew the license')
        .help('h')
        .alias('h', 'help')
        .argv,
    home = argv.home,
    cheerio = require('cheerio'),
    fs = require('fs'),
    mustache = require('mustache'),
    chalk = require('chalk'),
    child_process = require('child_process'),
    http = require('http'),
    https = require('https'),
    logs = {
        error: {color: 'red', method: null},
        success: {color: 'green', method: null}
    },
    log;

function modLogger(log) {
    logs[log].method = console[log] || console.log;
    console[log] = function(msg) {
        logs[log].method(chalk[logs[log].color](msg));
    }
}

for (log in logs) {
    modLogger(log);
}

function die(msg) {
    console.error(msg);
    process.exit(1);
}

function execute(cmd) {
    console.info('executing ' + chalk.cyan(cmd) + ' ..');

    child_process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            die(err.toString());
        }

        if (argv.v) {
            console.log('> ' + chalk.gray(stdout.trim()));
        }
    });
}

function renew() {
    execute('rm -rf ' + home + '/.WebIde*/config/eval');
    execute('sed -i \'/evlsprt/d\' ' + home + '/.WebIde*/config/options/options.xml');
    console.success("\n" + 'license renewed');
}

if (argv.renew) {
    renew();
    process.exit(0);
}

function dl(path) {
    var url = require('url'),
        ProgressBar = require('progress'),
        parsedPath = url.parse(path),
        req = (parsedPath.protocol === 'http:' ? http : https).request({
            hostname: parsedPath.hostname,
            path: parsedPath.pathname,
        }),
        defer;

    defer = new Promise((resolve, reject) => {

        req.on('response', function(res) {
            var len = parseInt(res.headers['content-length'], 10),
                file;

            if (res.headers['location']) {
                return dl(res.headers['location']).then(() => {
                    resolve();
                });
            }

            file = fs.createWriteStream(home + '/phpstorm.tar.gz');

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

function createLauncher(v) {
    console.info('creating launcher for PhpStorm EAP ' + v + ' ..');
    fs.writeFileSync(home + '/Desktop/PhpStorm.desktop',
        mustache.render(fs.readFileSync('launcher.template', 'utf8'), {
            home: home,
            v: v
        })
    , {
        mode: 0o775
    });
}

https.get('https://confluence.jetbrains.com/display/PhpStorm/PhpStorm+Early+Access+Program', (res) => {
    var body = '';

    if (res.statusCode != 200) {
        die('something wrong happened..');
    }

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        var $,
            $a,
            bar,
            v;

        $ = cheerio.load(body);

        if (!($a = $('a[href$=".tar.gz"]')).length) {
            die('element not found..');
        }

        v = $a.html().match(/EAP\-([0-9]+\.[0-9]+)/)[1];

        execute('rm -rf ' + home + '/PhpStorm-*');
        dl($a.attr('href'))
            .then(() => {
                execute('tar -xzf ' + home + '/phpstorm.tar.gz -C ' + home);
                execute('rm -f ' + home + '/phpstorm.tar.gz');
                execute('rm -f ' + home + '/Desktop/PhpStorm.desktop');
                renew();
                createLauncher(v);

                console.success("\n" + 'finished!');
            });
    });

}).on('error', (e) => {
    die(e);
});
