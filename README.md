# pathfinder

카카오 모빌리티 내비게이션 API를 CLI에서 호출하는 도구입니다.

## 설치

```bash
# 글로벌 설치
npm install -g pathfinder-cli

# 또는 소스에서 빌드
git clone https://github.com/Variel/pathfinder.git
cd pathfinder
npm install
npm run build
```

## 시작하기

```bash
# API 키 등록 (카카오 디벨로퍼스에서 REST API 키 발급)
pathfinder login

# 상태 확인
pathfinder status
```

## 사용법

### 자동차 길찾기

```bash
pathfinder directions -o 127.1086228,37.4012191 -d 127.10820,37.40262
pathfinder dir -o 127.1086228,37.4012191,name=출발지 -d 127.10820,37.40262,name=도착지 --alternatives
```

### 다중 경유지 길찾기 (최대 30개)

```bash
pathfinder waypoints -o 127.1086228,37.4012191 -d 127.10820,37.40262 \
  -w "127.110,37.402|127.112,37.403|127.114,37.404"
```

### 미래 운행정보 길찾기

```bash
pathfinder future -o 127.1086228,37.4012191 -d 127.10820,37.40262 -t 202603170900
```

### 공통 옵션

| 옵션 | 설명 |
|------|------|
| `-p, --priority` | 경로 우선순위: `RECOMMEND`, `TIME`, `DISTANCE` |
| `--avoid` | 회피: `ferries\|toll\|motorway\|schoolzone\|uturn` |
| `--alternatives` | 대안 경로 포함 |
| `--car-fuel` | 연료: `GASOLINE`, `DIESEL`, `LPG` |
| `--car-hipass` | 하이패스 장착 |
| `--summary` | 요약만 반환 |
| `--json` | JSON 원본 출력 |

## 좌표 형식

`경도,위도[,name=이름][,angle=각도]`

- 경도(x): `127.1086228`
- 위도(y): `37.4012191`
- 이름(선택): `name=서울역`
- 각도(선택, 출발지만): `angle=90`

## API 키 발급

[카카오 디벨로퍼스](https://developers.kakao.com/)에서 앱을 생성하고 REST API 키를 발급받으세요.
