# GeoJSON으로 서울 지도 그리기 (2026-11-02)

행정동 경계 GeoJSON을 서울 25개 구로 합치고, SVG path로 바꿔서 브라우저에 서울 지도(구 경계 + 한강)를 그렸다.

## 한 일

| 커밋 | 내용 |
| --- | --- |
| `29d76d5` | 원본 데이터를 `data/raw/`에 정리하고 출처를 README에 기록 |
| `af72eda` | `scripts/build-map-data.ts` 생성, d3-geo·mapshaper 설치, `pnpm build:map` 등록 |
| `9a5a232` | 서울 행정동 427개를 mapshaper `-dissolve`로 25개 구로 합침 |
| `ae2c3b5` | d3-geo로 투영해서 구마다 SVG path 문자열을 만듦 |
| `293c4bd` | 구 이름·path·확대 범위(bbox)를 `src/data/generated/districts.json`으로 저장 |
| `62b7f73` | `districts.json` 크기를 출력하고 단순화 전 크기를 `docs/07`에 기록 |
| `17f7630` | `page.tsx`에서 `<path>` 25개로 서울 구 경계를 그림 |
| `105486b` | 강북·강남이 맞닿은 선으로 한강을 뽑아 `background.json`에 저장하고 화면에 그림 |

스크립트 흐름:

```
전국 행정동 GeoJSON (34MB)
  → 서울만 고르기 (sido === '11')       동 427개
  → 같은 구끼리 합치기 (-dissolve sggnm)  구 25개
  → 투영 (geoMercator.fitSize 1000×1000)
  → 구마다 { name, d, bbox }            → districts.json
  → 강북/강남 표시 → 맞닿은 선 뽑기     → background.json { river }
```

주요 변수 (2026-11-02 기준 `scripts/build-map-data.ts`):

| 이름 | 무엇 |
| --- | --- |
| `korea` | 전국 행정동 원본을 파싱한 객체 (동 3,559개) |
| `seoulDongs` | 서울 행정동만 고른 배열 (427개) |
| `seoulGeoJson` | `seoulDongs`에 FeatureCollection 표지를 씌운 것. mapshaper 입력용 |
| `guGeoJson` | 같은 구끼리 합친 결과 (구 25개, properties는 `sggnm`만) |
| `SOUTH_OF_RIVER` | 한강 남쪽 구 이름 11개. 지도 데이터에 없어서 직접 정한 값 |
| `guWithRiverSide` | `guGeoJson`에 `riverSide`(north/south) 꼬리표를 붙인 복사본. 한강 추출용 |
| `river` | 강북·강남이 맞닿은 선 (GeometryCollection, 선 1개) |
| `projection` | 서울 전체를 1000×1000에 맞춘 투영 규칙 |
| `toPath` | 도형 → SVG path 문자열 변환기. `toPath.bounds`로 범위도 잰다 |
| `districts` | 앱이 쓰는 구 데이터 `{ name, d, bbox }` 25개 → `districts.json` |
| `riverPath` | 한강 path 문자열 → `background.json`의 `river` |

원본 GeoJSON의 칸 이름: `sido` 시도 코드(서울 `'11'`, 문자열), `sggnm` 시군구 이름(`'종로구'`). 나머지 칸은 [data/raw/README.md](../../data/raw/README.md) 참고.

## 결정과 이유

- **변환은 미리 한 번, 결과 JSON은 커밋한다.** 원본이 34MB라 브라우저에서 계산할 수 없고, 원본은 `.gitignore`라 배포 서버에 없다. 서울 경계는 거의 바뀌지 않으니 방문자마다 같은 계산을 반복할 이유도 없다.
- **`fitSize`의 기준은 서울 전체(구 25개 묶음)로 한다.** 서울 전체가 1000×1000에 맞춰지고, 구 하나는 그 안의 제자리·제 크기로 그려진다. 구·장소·배경이 모두 같은 `toPath`를 써야 겹쳤을 때 딱 맞는다.
- **구마다 bbox를 미리 저장한다.** 구 확대 화면에서 `viewBox`를 그 범위로 바꾸면 되므로 브라우저에서 계산하지 않아도 된다.
- **path가 `null`이면 스크립트를 멈춘다 (fail fast).** 조용히 넘어가면 빈 구가 화면에 안 그려지는 버그를 배포 뒤에야 알게 된다.
- **한강 = 강북 묶음과 강남 묶음이 맞닿은 선.** 구마다 `riverSide`(north/south) 꼬리표를 붙이고 `-dissolve riverSide -innerlines`로 뽑았다. `riverSide`는 작업용 꼬리표라 `districts.json`에는 넣지 않는다.
- **`background.json`은 `{ river }` 객체로 저장한다.** 나중에 경기·인천 배경을 `outside` 칸으로 추가해도 파일 모양과 화면 코드가 바뀌지 않는다.
- **`package.json`에 `"type": "module"`을 넣었다.** Node가 `.ts` 스크립트를 ES Module로 다시 읽느라 띄우던 경고를 없앴다. `pnpm dev`, `pnpm lint`, `pnpm build`에 문제가 없는 것을 확인했다.
- **mapshaper는 `declare module 'mapshaper'`로 쓴다.** 패키지에 타입이 없고 `@types/mapshaper`도 npm에 없다.

### mapshaper를 고른 이유

**1. 주된 이유: 공유 경계선(토폴로지)을 다룬다**

행정동 GeoJSON으로 지도를 만들려면 세 가지가 필요했다.

- 동 427개를 구 25개로 합치기 (`-dissolve`)
- 강북과 강남이 맞닿은 선을 뽑아서 한강 그리기 (`-innerlines`)
- 이웃한 구 사이에 틈이 생기지 않게 점 줄이기 (`-simplify`, 앞으로 할 일)

세 가지 모두 "이웃한 도형이 어느 선을 공유하는지"를 알아야 정확하게 할 수 있다.

**2. 다른 도구와 비교한 결과**

- **Turf.js**: 공유 경계선을 몰라서 한강 뽑기와 틈 없는 단순화가 안 된다. 그래서 뺐다.
- **GDAL**: 같은 이유로 한강 뽑기와 틈 없는 단순화가 어렵다. 게다가 프로젝트 밖(brew)에 설치해야 한다. 그래서 뺐다.
- **TopoJSON 도구**: 기능은 되지만 패키지가 셋이고, GeoJSON ↔ TopoJSON 변환을 거쳐야 하고, shapefile 읽기와 자르기가 없다.

**3. 덧붙는 이유: 패키지 하나로 끝난다**

121장소 shapefile 읽기와 경기·인천 배경 자르기(`-clip`)까지 mapshaper 하나로 할 수 있다. 그래서 원본을 넣으면 `pnpm build:map` 한 번으로 결과가 나온다.

**4. 감수한 단점**

타입이 없다. `declare module 'mapshaper'`로 선언하고 `any`로 쓴다.

**면접용 한 문장**

> 행정동을 구로 합치고, 구끼리 맞닿은 선으로 한강을 뽑고, 이웃 구 사이에 틈 없이 단순화하려면 공유 경계선을 다루는 도구가 필요했습니다. 그중 shapefile 읽기와 자르기까지 패키지 하나로 해결되는 mapshaper를 골랐고, 타입이 없다는 단점은 모듈 선언으로 감수했습니다.

### d3-geo를 고른 이유

**1. 주된 이유: 필요한 계산을 라이브러리 하나로 한다**

- 투영: 위경도를 평평한 화면 좌표로 바꾼다 (`geoMercator`). `fitSize`로 서울 전체가 1000×1000에 꽉 차도록 배율과 위치도 맞춘다.
- SVG path 문자열 만들기: 투영한 좌표를 `<path d="…">`에 넣을 문자열로 만든다 (`toPath`).
- 화면 범위 계산: 구마다 화면에서 차지하는 범위를 구한다 (`toPath.bounds` → `bbox`, 구 확대용).

**2. 다른 도구와 비교한 결과**

- **proj4js, Turf.js `toMercator`**: 좌표 변환만 한다. 1000×1000에 맞추기, path 문자열, bbox는 직접 짜야 한다.
- **mapshaper `-proj` + SVG 내보내기**: 결과가 SVG 파일 하나라서, 구마다 `{ name, d, bbox }` JSON을 만들려면 다시 파싱해야 한다.
- **react-simple-maps**: 안에서 d3-geo를 쓰지만, 투영을 방문자 브라우저에서 매번 계산한다.
- **Leaflet, MapLibre GL, 카카오·네이버 지도**: 배경 지도 타일 위에 그리는 방식이라 용량이 크고 API 키가 필요하다. 도안의 단순한 SVG 지도와 맞지 않는다.
- **직접 구현**: 메르카토르 공식은 짧지만 맞추기·path·bbox를 모두 직접 짜야 해서 버그가 생길 곳이 늘어난다.

**3. 덧붙는 이유: 빌드 스크립트에서 한 번만 계산한다**

d3-geo는 함수만 제공하는 라이브러리라서 빌드 스크립트에서 계산하고 결과를 문자열 JSON으로 저장할 수 있다. 그래서 브라우저(클라이언트)의 부담이 줄어든다.

- 내려받을 코드가 줄어든다. d3-geo가 브라우저로 가지 않는다.
- 방문할 때마다 좌표 수만 개를 투영하는 계산을 반복하지 않는다. 성능이 낮은 휴대폰에서 특히 차이가 크다.
- 받자마자 그릴 수 있어서 첫 화면이 빨리 뜬다.

**4. 감수한 단점**

- 원본 경계가 바뀌면 `pnpm build:map`을 다시 돌리고 결과를 다시 커밋해야 한다.
- 화면에서 투영을 바꾸거나 지도를 돌리는 기능은 만들기 어렵다. 우리 서비스에는 필요 없다.

**면접용 한 문장**

> 투영, SVG path 문자열 생성, 구별 화면 범위 계산을 라이브러리 하나로 할 수 있어서 d3-geo를 골랐습니다. 이 계산을 빌드 스크립트에서 한 번만 하고 결과 문자열만 커밋해서, 브라우저는 라이브러리 없이 그리기만 하도록 했습니다.

## 문제와 해결

### 지도가 지구 전체로 그려짐 (d3-geo와 mapshaper의 방향 차이)

- **증상**: 투영 배율이 `159.15…`로 나오고, path 좌표가 0.002px 간격으로 붙어 종로구가 점 하나 크기가 됐다.
- **어떻게 찾았나**: 서울을 1000px에 맞추면 배율은 십만 단위여야 한다. 159.15는 `1000 ÷ 2π`, 즉 지구 한 바퀴를 1000px에 넣는 배율이었다. 면적을 재 보니 원본 동은 0.00000003인데 mapshaper를 거친 구는 12.566(= 4π, 구 전체 면적)이었다.
- **원인**: 공 위의 닫힌 선은 두 영역(안쪽과 나머지 전부)을 나누기 때문에, 어느 쪽이 도형인지 점의 순서(도는 방향)로 정한다. d3-geo는 시계 방향을 안쪽으로 보는데, mapshaper는 최신 GeoJSON 표준(RFC 7946)대로 반시계 방향으로 내보낸다. 그래서 d3가 구를 "지구에서 그 구를 뺀 나머지"로 이해했다.
- **해결**: mapshaper 출력에 `gj2008` 옵션을 붙여 옛 규칙(시계 방향)으로 내보냈다. 배율이 `136789.37…`로 정상이 됐다. 점의 위치는 그대로이고, 목록 순서만 반대로 적힌다.

### 한강 추출에서 `Missing a field named: riverSide`

- **원인**: `riverSide` 꼬리표가 없는 `guGeoJson`을 mapshaper에 넘겼다. 또 한강 추출 코드가 `guWithRiverSide`를 만드는 코드보다 위에 있었다.
- **해결**: 입력을 `guWithRiverSide`로 바꾸고, 그 아래로 코드를 옮겼다.

### `f`에 밑줄 (TS7006: implicitly has an 'any' type)

- **원인**: `JSON.parse` 결과가 `any`라서 `.map` 콜백의 `f` 타입을 알 수 없었다.
- **해결**: `f`가 아니라 데이터가 처음 들어오는 `guGeoJson`에 `ExtendedFeatureCollection<GuFeature>` 타입을 붙였다. 그러자 `f`, `districts`까지 타입이 이어졌고, 숨어 있던 `toPath`의 `string | null`이 드러나 `null` 처리를 추가했다.

## 측정

| 무엇 | 크기 | 비고 |
| --- | --- | --- |
| 전국 행정동 원본 | 34,652,038 B | 동 3,559개, 점 750,857개 |
| 서울만 고른 동 | 약 843 KB | 동 427개, 점 18,817개 |
| `districts.json` | **87,235 B** | 구 25개, 단순화 전, 소수점 3자리. 이력서용 "전" 값 |
| `background.json` | 1,353 B | 한강 선 하나 (점 85개) |

- 이력서에는 34MB → 87KB가 아니라, 같은 `districts.json`의 단순화 전 → 후를 비교해서 쓴다. 전국 데이터에서 서울만 고른 효과까지 단순화 덕분처럼 보이면 과장이 된다.

## 새로 배운 것

- **GeoJSON 구조**: `FeatureCollection` → `features`(Feature 배열) → 각 Feature의 `properties`(정보)와 `geometry`(모양). `-innerlines` 결과처럼 정보 없이 모양만 모은 묶음은 `GeometryCollection` → `geometries`.
- **`readFileSync` → `JSON.parse`**: 파일 → 문자열 → JS 객체. 반대는 `JSON.stringify` → `writeFileSync`.
- **타입 붙이기는 약속이다**: `JSON.parse` 결과에 붙인 타입은 실행할 때 검사되지 않는다. 그래서 `console.log`로 실제 값을 확인해야 한다.
- **데이터가 처음 들어오는 곳에 타입을 붙이면 아래로 전해진다.** `any`의 메서드 결과는 계속 `any`라서, 중간(`f`)에만 붙이면 그 아래는 검사되지 않는다.
- **타입 좁히기**: `if (d === null) throw …` 아래에서는 `d`가 `string`이 된다.
- **함수를 만들어 주는 함수**: `geoPath(projection)`은 규칙을 받아 변환기 함수(`toPath`)를 돌려준다. 함수도 객체라 `toPath.bounds`처럼 메서드를 가질 수 있다.
- **dissolve**: 같은 칸 값을 가진 도형끼리 안쪽 선을 지워 하나로 합친다. 기준 칸만 남고 나머지 칸은 버려진다(`copy-fields`로 남길 수 있음).
- **mapshaper `applyCommands`**: 실제 파일 대신 `{ '이름.json': 내용 }` 객체를 주고받는다. 이름은 꼬리표일 뿐이고, 결과는 Buffer라 `.toString()`이 필요하다.
- **`@types/…`**: JavaScript로 만든 패키지의 타입을 커뮤니티가 따로 올려 둔 것. 개발 때만 쓰니 `-D`로 설치한다.
- **`.length`와 바이트 수는 다르다**: 한글은 UTF-8에서 한 글자가 3바이트라, 파일 크기는 `statSync(경로).size`로 잰다.
- **SVG**: `viewBox`는 좌표의 단위이고 화면 크기는 CSS가 정한다. 나중에 쓴 요소가 위에 그려진다. JSX에서는 `stroke-width`를 `strokeWidth`로 쓴다.
- **`const`는 만들기 전에 쓸 수 없다.** 서로의 결과를 쓰지 않는 코드끼리는 순서를 바꿔도 결과가 같고, 순서는 읽기 흐름으로 정한다.
