/**
 * 
 */
const { spawn } = require('child_process');

const pm2 = require('pm2');
const _ = require('lodash');

const SERVICES = require('./ecosystem.config.js');

const PM2_START = spawn('pm2', ['logs', '--lines', '1']);

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

function startBrick() {
    let foundBrick = _.find(SERVICES.apps, { name: 'brick' });

    return new Promise((resolve, reject) => {
        pm2.start([foundBrick], (error, apps) => {
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
            // startCount에서 brick은 빼야 한다.
            if (startCount === (process.argv.length - 1)) {
                isLastService = false;
            } else {
                return;
            }
        }

        // 기존 restart를 사용했지만 API 동작에서 watch 옵션이 풀려 start로 변경됨.
        connectPm2()
            .then(() => {
                return stopBrick();
            })
            .then((list) => {
                console.log('restart brick');
                return startBrick();
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
