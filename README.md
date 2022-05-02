# pm2

## 개요
Process Manager를 이용해 node 및 maven을 실행 시켜서 모든 마이크로 서비스의 log를 통합 및 특정 서비스를 재시작할 용도로 개발 됨.

## 참고
* pm2-control.js 이용하면 특정 서비스가 재시작 될때 마다 brick 서비스가 재시작 된다.
* pm2-control.js 이용하면 brick과 meta는 항상 실행되기 때문에 서비스명은 안적어도 된다.
* brick만 실행하고 싶을때는 config를 이용한 사용법으로 실행한다.
* 서비스 명에 `-watch`를 붙이면 Intellij에서 띄운 서비스가 재시작 될때 마다 brick을 재시작 해준다.

## 사전 작업
* ecosystem.config.js 에 각종 프로젝트의 경로를 설정한다.
    * spring path
    * node path
* 로컬 환경에 설치된 메이븐 경로를 설정한다.
* 서비스 목록
    * cluster
    * dashboard
    * db-browser
    * meta (생략가능)
    * sherman
    * studio-editor
    * studio-browser
    * hdfs-browser
    * data-import
    * brick (생략가능)

* watch 목록
    * db-browser-watch
    * meta-watch
    * sherman-watch
    * studio-editor-watch
    * studio-browser-watch

## 사용법
### config를 이용한 사용법
```shell
# config에 등록된 모든 서비스 실행
$ pm2 start ecosystem.config.js

# config에 등록된 특정 서비스 한개 실행
$ pm2 start ecosystem.config.js --only brick

# config에 등록된 다수 서비스 실행
$ pm2 start ecosystem.config.js --only "brick,meta"
```

### pm2-control.js를 이용한 사용법
```shell
# config에 등록된 모든 서비스 실행
$  node pm2-control.js

# config에 등록된 brick, meta만 실행
$  node pm2-control.js ""

# config에 등록된 특정 서비스 한개 실행
$  node pm2-control.js studio-editor

# config에 등록된 다수 서비스 실행
$  node pm2-control.js studio-editor sherman

# 다른 에디터에서 띄운 서버가 재시작 시 brick 자동 재시작 (Spring Boot만 적용)
$  node pm2-control.js studio-editor-watch meta-watch
```