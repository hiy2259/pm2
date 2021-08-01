/**
 * pm2 v5.1.0
 * 
 * PM2 버전 -> pm2 -v
 * 모두 실행 -> pm2 start ecosystem.config.js
 * 한개 실행 -> pm2 start ecosystem.config.js --only brick
 * 특정 다수 실행 -> pm2 start ecosystem.config.js --only "hdfs-browser,brick"
 * 모든 프로세스 멈추기 -> pm2 stop all
 * 모든 프로세스 재시작 -> pm2 restart all
 * 모든 프로세스의 다운타임을 0으로 설정후 다시로드 -> pm2 reload all
 * 프로세스 전부 삭제 -> pm2 delete all # 
 * pm2 업데이트 -> pm2 update
 * 리셋 후 메타데이터 리로드 -> pm2 reset <process>
 * 모든 로그 출력 -> pm2 logs
 * 모니터링 - > pm2 monit
 */

const path = require('path');

// 현재 파일 기준으로 프로젝트 폴더 서버 경로
/**
 * spring path
 */
const CLUSTER_PATH = '../cluster';
const CLUSTER_SERVER_CLASS_PATH = path.join(CLUSTER_PATH, 'target/classes');
const CLUSTER_STATIC_PATH = path.join(CLUSTER_SERVER_CLASS_PATH, 'target/classes');
const DASHBOARD_PATH = '../dashboard';
const DASHBOARD_SERVER_CLASS_PATH = path.join(DASHBOARD_PATH, 'target/classes');
const DASHBOARD_STATIC_PATH = path.join(DASHBOARD_SERVER_CLASS_PATH, 'target/classes');
const DB_BROWSER_PATH = '../db-browser';
const DB_BROWSER_SERVER_CLASS_PATH = path.join(DB_BROWSER_PATH, 'target/classes');
const DB_BROWSER_STATIC_PATH = path.join(DB_BROWSER_SERVER_CLASS_PATH, 'target/classes');
const META_PATH = '../meta';
const META_SERVER_CLASS_PATH = path.join(META_PATH, 'target/classes');
const META_SERVER_STATIC_PATH = path.join(META_SERVER_CLASS_PATH, 'target/classes');
const SHERMAN_PATH = '../sherman';
const SHERMAN_SERVER_CLASS_PATH = path.join(SHERMAN_PATH, 'target/classes');
const SHERMAN_STATIC_PATH = path.join(SHERMAN_SERVER_CLASS_PATH, 'static');
const STUDIO_PATH = '../studio';
const STUDIO_SERVER_CLASS_PATH = path.join(STUDIO_PATH, 'target/classes');
const STUDIO_STATIC_PATH = path.join(STUDIO_SERVER_CLASS_PATH, 'static');
const STUDIO2_PATH = '../studio2/source';
const STUDIO2_SERVER_CLASS_PATH = path.join(STUDIO2_PATH, 'target/classes');
const STUDIO2_STATIC_PATH = path.join(STUDIO2_SERVER_CLASS_PATH, 'static');

/**
 * node path
 */
const HDFS_SERVER_PATH = '../hdfs/src/server';
const DATA_IMPORT_SERVER_PATH = '../data-import/src/server';
const BRICK_SERVER_PATH = '../brick/src/server';

/**
 * maven
 */
const MAVEN_PATH = '/opt/homebrew/Cellar/maven/3.8.1/libexec/bin/mvn';

module.exports = {
    apps: [{
        name: 'cluster',
        cwd: CLUSTER_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [CLUSTER_SERVER_CLASS_PATH],
        ignore_watch: [CLUSTER_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'dashboard',
        cwd: DASHBOARD_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [DASHBOARD_SERVER_CLASS_PATH],
        ignore_watch: [DASHBOARD_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'db-browser',
        cwd: DB_BROWSER_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [DB_BROWSER_SERVER_CLASS_PATH],
        ignore_watch: [DB_BROWSER_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'meta',
        cwd: META_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [META_SERVER_CLASS_PATH],
        ignore_watch: [META_SERVER_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'sherman',
        cwd: SHERMAN_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [SHERMAN_SERVER_CLASS_PATH],
        ignore_watch: [SHERMAN_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'studio',
        cwd: STUDIO_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [STUDIO_SERVER_CLASS_PATH],
        ignore_watch: [STUDIO_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'studio2',
        cwd: STUDIO2_PATH,
        script: MAVEN_PATH,
        args: [
            'spring-boot:run'
        ],
        watch: [STUDIO2_SERVER_CLASS_PATH],
        ignore_watch: [STUDIO2_STATIC_PATH],
        node_args: [],
        interpreter: 'none',
        exec_mode: 'fork'
    }, {
        name: 'hdfs-browser',
        cwd: HDFS_SERVER_PATH,
        script: './index.js',
        watch: ['.'],
        ignore_watch: [
            './node_modules'
        ],
        // max_memory_restart: '500M',
    }, {
        name: 'data-import',
        cwd: DATA_IMPORT_SERVER_PATH,
        script: './bin/www',
        watch: ['.'],
        ignore_watch: [
            './node_modules'
        ],
        // max_memory_restart: '500M'
    }, {
        name: 'brick',
        cwd: BRICK_SERVER_PATH,
        script: './index.js',
        watch: ['.'],
        ignore_watch: [
            './node_modules',
            './logs'
        ],
        // max_memory_restart: '500M'
    }]
};
