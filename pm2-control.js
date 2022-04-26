/**
 * 
 */
const { spawn } = require('child_process');
const path = require('path');

const pm2 = require('pm2');
const _ = require('lodash');
const moment = require('moment');

const SERVICES = require('./ecosystem.config.js');
const SERVICES_NAMES = _.map(SERVICES, 'name');

const PM2_START = spawn('pm2', ['logs', '--lines', '1']);

const LOG_NAME = ['application.', moment().format('YYYY-MM-DD'), '_0.log'].join('');

const ESSENTIAL_APP = ['brick', 'meta'];
const START_SERVICE_LOG = [
    'JVM running for', // spring-boot
    'server listening on port 18087', // hdfs-browser
    'server Listening on port 18093' // data-import
];

let serviceList = ['brick', 'meta'];
let isStartLastService = false;
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

    // brick, meta는 무조건 식행하게 변경 해야 함.
    for(let i = 0, l = execApps.length; i < l; i++) {
        var serviceName = execApps[i];

        if (!_.includes(ESSENTIAL_APP, serviceName) && _.includes(SERVICES_NAMES, serviceName)) {
            serviceList.push(serviceName);
        }
    }

    let services = _.filter(SERVICES.apps, function (app) {
        return _.includes(serviceList, app.name);
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
        pm2.delete('brick', (error, apps) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function reloadBrick() {
    return new Promise((resolve, reject) => {
        pm2.reload('brick', (error, apps) => {
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
console.log('serviceList = ', serviceList);
console.log('process.argv = ', process.argv);
        // 처음 모든 서비스 구동시 마지막에 구동된 서비스때 brick restart 처리.
        if (!isStartLastService) {
            startCount++;

            // brick은 채크 대상 제외
            if (startCount === (serviceList.length - 1)) {
                isStartLastService = true;
            } else {
                return;
            }
        }

        connectPm2()
            // .then(() => {
            //     // 기존 restart를 사용했지만 API 동작에서 watch 옵션이 풀려 stop, start로 변경됨.
            //     return stopBrick();
            // })
            // .then((list) => {
            //     console.log('restart brick');
            //     return startBrick();
            // })
            .then(() => {
                // stop, start 로 했더니 8080 포트로 계속 프로세스를 생성해서 brick이 에러가 남.
                // watch 풀리는 문제는 나중에 따로 처리.
                console.log('restart brick');
                return reloadBrick();
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

function execSpringLog(logPath) {
    const TAIL_STUDIO_LOG = spawn('tail', ['-f', '-n', '1', logPath]);

    TAIL_STUDIO_LOG.stdout.on('data', (data) => {
        let log = data.toString('utf-8');

        if (_.includes(log, START_SERVICE_LOG[0])) {
            setTimeout(() => {
                reloadBrick().then(() => {
                    console.log('restart brick success');
                }).catch((error) => {
                    console.log('restart brick error = ', error);
                });
            }, 500);
        }
    });
}

// 서비스 별로 만들어야 함...ㅠㅠ
if (_.includes(process.argv, 'db-browser')) {
    const logPath = path.join('..', 'cluster', 'logs', LOG_NAME);
    execSpringLog(logPath);
}

if (_.includes(process.argv, 'meta-watch')) {
    const logPath = path.join('..', 'meta', 'logs', LOG_NAME);
    execSpringLog(logPath);
}

if (_.includes(process.argv, 'sherman')) {
    const logPath = path.join('..', 'sherman', 'logs', LOG_NAME);
    execSpringLog(logPath);
}

if (_.includes(process.argv, 'studio-watch')) {
    const logPath = path.join('..', 'studio', 'logs', LOG_NAME);
    execSpringLog(logPath);
}

if (_.includes(process.argv, 'studio2-watch')) {
    const logPath = path.join('..', 'studio2', 'logs', LOG_NAME);
    execSpringLog(logPath);
}
