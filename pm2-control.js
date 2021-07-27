/**
 * 
 */
const { spawn } = require('child_process');

const pm2 = require('pm2');
const _ = require('lodash');

const SERVICES = require('./ecosystem.config.js');

const PM2_START = spawn('pm2', ['logs']);

const ESSENTIAL_APP = ['brick', 'meta'];
const START_SERVICE_LOG = [
    ': Started', // spring--boot
    'server listening on port 18087', // hdfs-browser
    'server Listening on port 18093' // data-import
];

let isLastService = true;
let startCount = 0;

function connectPm2() {
    return new Promise((resolve, reject) => {
        pm2.connect(error => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function startPm2() {
    const argv = process.argv;
    const execApps = argv.slice(2, argv.length);

    let services = _.filter(SERVICES.apps, function (app) {
        if (_.isEmpty(execApps) || execApps.length === SERVICES.apps.length) {
            return true;
        }

        if (_.includes(ESSENTIAL_APP, app.name)) {
            return true;
        } else if (!_.isEmpty(execApps)) {
            return (_.includes(execApps, app.name));
        } else {
            return false;
        }
    });

    console.log('services = ', services);
    return new Promise((resolve, reject) => {
        pm2.start(services, (error, apps) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getPm2List() {
    return new Promise((resolve, reject) => {
        pm2.list((error, list) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(list);
        });
    });
}

function restartBrick() {
    return new Promise((resolve, reject) => {
        pm2.restart('brick', (error, apps) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function stopBrick() {
    return new Promise((resolve, reject) => {
        pm2.stop('brick', (error, apps) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

connectPm2()
    .then(() => {
        return startPm2();
    })
    .then(() => {
        pm2.disconnect();
    })
    .catch((error) => {
        console.error(error);
        pm2.disconnect();
    });


PM2_START.stdout.on('data', (data) => {
    let log = data.toString('utf-8');

    if (
        _.includes(log, START_SERVICE_LOG[0]) ||
        _.includes(log, START_SERVICE_LOG[1]) ||
        _.includes(log, START_SERVICE_LOG[2])) {

        // 처음 모든 서비스 구동시 마지막에 구동된 서비스때 brick restart 처리.
        if (isLastService) {
            startCount++;

            if (startCount === process.argv.length) {
                isLastService = false;
            } else {
                return;
            }            
        }

        connectPm2()
            .then(() => {
                return getPm2List();
            })
            .then((list) => {
                var foundBrick = _.find(list, { name: 'brick' });

                if (foundBrick) {
                    // console.log('stop brick');
                    // console.log('brick status1 = ', foundBrick.pm2_env.status);
                    if (foundBrick.pm2_env.status === 'online') {
                        return stopBrick();
                    } else {
                        return;
                    }
                }

                pm2.disconnect();
            })
            .then(() => {
                return getPm2List();
            })
            .then((list) => {
                var foundBrick = _.find(list, { name: 'brick' });

                if (foundBrick) {
                    // console.log('resatart brick');
                    // console.log('brick status2 = ', foundBrick.pm2_env.status);
                    if (foundBrick.pm2_env.status !== 'online') {
                        return restartBrick();
                    }
                }

                pm2.disconnect();
            })
            .then(() => {
                pm2.disconnect();
            })
            .catch((error) => {
                console.error('pm2 error = ', error);
                pm2.disconnect();
            });
    }
});
