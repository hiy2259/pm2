# pm2

## 개요
Process Manager를 이용해 node 및 maven을 실행 시켜서 모든 마이크로 서비스의 log를 통합 및 특정 서비스를 재시작할 용도로 개발 됨.

## 참고
* pm2-control.js 이용하면 특정 서비스가 재시작 될때 마다 brick 서비스가 재시작 된다.
* pm2-control.js 이용하면 brick과 meta는 항상 실행된다.
* brick만 실행하고 싶을때는 config를 이용한 사용법으로 실행한다.
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
$  node pm2-control.js studio

# config에 등록된 다수 서비스 실행
$  node pm2-control.js studio sherman
```
