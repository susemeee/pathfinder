---
name: pathfinder
description: 한국 내 길찾기가 필요할 때 사용합니다. 자동차(카카오 모빌리티)와 대중교통(ODsay) 길찾기를 지원하며, 실시간/미래 교통 상황 기반의 경로 탐색, 소요 시간, 거리, 요금 정보를 제공합니다. 주소, 장소명, 좌표 모두 지원합니다.
---

## 설치

글로벌 설치:
```
npm install -g @unlimiting/pathfinder
pnpm add -g @unlimiting/pathfinder
yarn global add @unlimiting/pathfinder
```

설치 없이 바로 실행:
```
npx @unlimiting/pathfinder <command>
pnpm dlx @unlimiting/pathfinder <command>
```

리포지토리: https://github.com/unlimiting-studio/pathfinder

---

Usage: pathfinder [options] [command]

한국 길찾기 CLI (자동차 + 대중교통)

Options:
  -V, --version             버전 출력
  -h, --help                도움말 표시

Commands:
  login [service]           API 키를 등록합니다 (kakao 또는 odsay)
  status                    현재 로그인 상태를 확인합니다
  logout [service]          저장된 API 키를 삭제합니다
  car [options]             자동차 길찾기 (출발지 → 도착지, 최대 5개 경유지)
  waypoint|wp [options]     다중 경유지 길찾기 (최대 30개 경유지)
  future|ft [options]       미래 운행정보 길찾기 (출발 시간 지정)
  transit|ts [options]      대중교통 길찾기 (출발지 → 도착지)
  help [command]            명령어별 도움말 표시

## 인증

두 개의 API 키가 필요합니다:
- **카카오 REST API 키**: 자동차 길찾기 + 주소/장소 검색에 사용 (모든 명령에 필요)
- **ODsay API 키**: 대중교통 길찾기에 사용 (`transit` 명령에만 필요)

API 키 발급 방법은 별도 가이드를 참고하세요:
- 카카오: `./guides/kakao-api-setup.md`
- ODsay: `./guides/odsay-api-setup.md`

**키 등록:**
```
pathfinder login kakao
pathfinder login odsay
pathfinder login kakao -k YOUR_KAKAO_REST_API_KEY
pathfinder login odsay -k YOUR_ODSAY_API_KEY
```

키는 `~/.pathfinder/config.json`에 저장됩니다.

## 위치 지정 방식

모든 출발지/도착지/경유지는 3가지 방식으로 지정할 수 있습니다:

1. **주소** (지번/도로명): `"서울특별시 강남구 역삼동 858"`, `"테헤란로 152"`
2. **장소명**: `"강남역"`, `"서울역"`, `"카카오 판교오피스"`
3. **좌표** (경도,위도): `127.1086228,37.4012191`

주소/장소명 입력 시 카카오맵 API로 자동 검색 → 검색 결과가 여러 개면 선택 프롬프트 표시 → 좌표 변환 → 길찾기로 연결됩니다.

## 자동차 길찾기 (`car`)

출발지에서 도착지까지의 경로를 탐색합니다. 경유지 최대 5개.

```
pathfinder car -o "강남역" -d "서울역"
pathfinder car -o "판교역" -d "삼성동 코엑스" --alternatives
pathfinder car -o 127.0281573,37.4979462 -d 126.9726378,37.5546788 -p TIME
```

**응답 샘플** (`--summary`):
```
📍 경로 정보
──────────────────────────────────────────────────
  출발: 127.02815611393076, 37.49794557906234
  도착: 126.97263036819892, 37.55467419488663
──────────────────────────────────────────────────
  거리: 11.1km    시간: 19분
  택시비: 14,300원    통행료: -
  우선순위: RECOMMEND
```

## 다중 경유지 길찾기 (`waypoint`, 별칭 `wp`)

최대 30개의 경유지를 지정하여 경로를 탐색합니다.

```
pathfinder waypoint -o "강남역" -d "인천공항" -w "홍대입구역|여의도역|영등포역"
pathfinder wp -o "강남역" -d "서울역" -w "홍대입구역"
```

**응답 샘플** (`--summary`):
```
📍 경로 정보
──────────────────────────────────────────────────
  출발: 127.02815611393076, 37.49794557906234
  도착: 126.97263036819892, 37.55467419488663
  경유지: 127.00169170469677,37.56421326043136
──────────────────────────────────────────────────
  거리: 12.6km    시간: 22분
  택시비: 15,500원    통행료: -
  우선순위: RECOMMEND
```

## 미래 운행정보 길찾기 (`future`, 별칭 `ft`)

미래 특정 시각의 교통 상황을 기반으로 경로를 탐색합니다.
출발 시간은 YYYYMMDDHHMM 형식 (예: 202603170900 = 2026년 3월 17일 오전 9시).

```
pathfinder future -o "강남역" -d "인천공항" -t 202603170900
pathfinder ft -o "강남역" -d "서울역" -t 202603170900
```

**응답 샘플** (`--summary`):
```
📍 경로 정보
──────────────────────────────────────────────────
  출발: 127.02815611393076, 37.49794557906234
  도착: 126.97263036819892, 37.55467419488663
──────────────────────────────────────────────────
  거리: 11.8km    시간: 23분
  택시비: 14,900원    통행료: 2,000원
  우선순위: RECOMMEND
```

## 대중교통 길찾기 (`transit`, 별칭 `ts`)

ODsay API를 사용한 대중교통 (버스+지하철) 경로 탐색입니다.

```
pathfinder transit -o "다산순환로 171" -d "강남대로 465"
pathfinder ts -o "강남역" -d "서울역" -m subway
pathfinder ts -o "판교역" -d "홍대입구역" --opt 1
```

**응답 샘플** (상위 2개 경로):
```
  총 18개 경로 (버스 4, 지하철 4, 환승 10)

🚍 경로 1/18 🚇 지하철
──────────────────────────────────────────────────
  출발: 강남  →  도착: 서울역
──────────────────────────────────────────────────
  소요시간: 34분    요금: 1,650원
  거리: 15.0km    도보: 176m
  환승: 지하철 2회

  🗺️  상세 경로:
    🚶 도보 47m (1분)
    🚇 수도권 2호선: 강남 → 사당 (4역, 9분)
    🚶 도보 0m (3분)
    🚇 수도권 4호선: 사당 → 서울역 (7역, 16분)
    🚶 도보 129m (2분)

🚍 경로 2/18 🚌 버스
──────────────────────────────────────────────────
  출발: 지하철2호선강남역  →  도착: 서울스퀘어앞
──────────────────────────────────────────────────
  소요시간: 42분    요금: 1,500원
  거리: 10.4km    도보: 472m
  환승: 버스 1회

  🗺️  상세 경로:
    🚶 도보 368m (6분)
    🚌 421: 지하철2호선강남역 → 서울스퀘어앞 (18정거장, 34분)
    🚶 도보 104m (2분)
```

**transit 전용 옵션:**
- `-m, --mode <mode>`: 교통수단 필터 (`all`, `subway`, `bus`) (기본: all)
- `--opt <opt>`: 정렬 기준 (0=추천, 1=최소환승, 2=최소도보, 3=무환승) (기본: 0)

## 자동차 길찾기 공통 옵션

`car`, `waypoint`, `future` 명령에서 공통으로 사용할 수 있는 옵션입니다.

- `-o, --origin <origin>`: 출발지 (필수)
- `-d, --destination <dest>`: 도착지 (필수)
- `-w, --waypoints <wp>`: 경유지 (파이프 `|`로 구분)
- `-p, --priority <priority>`: 경로 우선순위: RECOMMEND, TIME, DISTANCE (기본: RECOMMEND)
- `--avoid <avoid>`: 회피: ferries, toll, motorway, schoolzone, uturn (파이프로 구분)
- `--alternatives`: 대안 경로 포함
- `--road-details`: 상세 도로 정보 포함
- `--car-type <type>`: 차량 종류 (기본: 1)
- `--car-fuel <fuel>`: 연료 종류: GASOLINE, DIESEL, LPG (기본: GASOLINE)
- `--car-hipass`: 하이패스 장착 여부
- `--summary`: 요약만 반환
- `--json`: JSON 원본 출력

## JSON 출력

모든 길찾기 명령에 `--json` 플래그를 추가하면 API 원본 응답을 JSON으로 출력합니다.

```
pathfinder car -o "강남역" -d "서울역" --json | jq '.routes[0].summary'
pathfinder ts -o "강남역" -d "서울역" --json | jq '.result.path[0].info'
```
