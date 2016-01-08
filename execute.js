var chalk = require('chalk'),
    child_process = require('child_process'),
    argv = require('./argv'),
    die = require('or-die');

module.exports = (cmd, reject) => {
    var o;

    console.info('executing ' + chalk.cyan(cmd) + ' ..');

    try {
        o = child_process.execSync(cmd, {
            stdio: [
                '/dev/null'
            ]
        });
    } catch (err) {
        die(err.toString());
    }

    if (argv.v) {
        console.log('> ' + chalk.gray(o.toString()));
    }
};
