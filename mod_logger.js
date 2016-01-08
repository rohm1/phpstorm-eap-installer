var chalk = require('chalk'),
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
