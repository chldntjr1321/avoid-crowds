# BFF로 서울시 실시간 인구 데이터 받기 (2026-11-03)

서울시 실시간 인구 API(`citydata_ppltn`)를 서버에서 대신 부르고, 앱 공통 타입 `Place`로 바꿔서 `/api/places`로 내려주는 BFF를 만들었다. 오늘은 장소 1곳(광화문·덕수궁)으로 처음부터 끝까지 연결했고, 121곳 확장은 `places.json`을 만든 뒤 한다.

## 한 일

| 커밋 | 내용 |
| --- | --- |
| `f856ebc` | 광화문·덕수궁 실제 응답을 `api-samples/`에 저장 |
| `1179d92` | 서울시 응답 모양 그대로의 타입 (`SeoulPlaceRaw` 등) |
| `ab52cf0` | 앱 공통 타입 `Place`, `Forecast`, `PopulationRange`, `CongestLevel` |
| `ebc9179` | `guCode` → `guName` (값이 코드가 아니라 구 이름이라서) |
| `96d0d99` | 어댑터 `toPlace`: 서울시 응답 → `Place`, 혼잡도 글자 검사 |
| `8d0fc16` | `fetchPlace`: 인증키로 서울시 API 호출, 실패 응답 타입 추가 |
| `aa8b928` | `/api/places` Route Handler, `getPlaces`에 5분 캐싱 |

요청 흐름:

```
브라우저 GET /api/places
  → Next가 route.ts의 GET() 호출
  → getPlaces()            'use cache' (5분 / 10분)
      캐시 있음 → 저장된 Place[] 반환
      캐시 없음 → fetchPlace(code)   서울시 API 호출, 실패 확인
                → toPlace(raw, guName)  Place로 변환
  → Response.json(places)
  → Next가 브라우저로 보냄
```

파일별 역할:

| 파일 | 하는 일 |
| --- | --- |
| `src/lib/seoul-api/types.ts` | 서울시가 보내는 모양 (성공 / 실패) |
| `src/lib/place.ts` | 우리 앱이 약속한 모양. 서버와 화면이 같이 씀 |
| `src/lib/seoul-api/adapter.ts` | 서울시 모양 → `Place`. 순수 함수 |
| `src/lib/seoul-api/fetch-place.ts` | 장소 하나 호출. `server-only` |
| `src/lib/seoul-api/get-places.ts` | 장소 목록 모으기 + 캐싱. `server-only` |
| `src/app/api/places/route.ts` | 주소 창구. `getPlaces()` 결과를 `Response`로 |

## 결정과 이유

### 왜 BFF인가

요청은 두 구간으로 나뉜다.

```
[구간 A]  브라우저 ──→ 우리 서버(/api/places)
[구간 B]              우리 서버 ──→ 서울시 API
```

- **인증키 숨기기**: 키가 URL 안에 들어간다(`/{인증키}/json/citydata_ppltn/...`). 브라우저에서 부르면 Network 탭에 그대로 보이므로 서버에서만 부른다.
- **121번 → 1번 (구간 A)**: 서울시 API는 한 번에 장소 하나만 준다. 121번 호출은 서버가 구간 B에서 대신 하고, 브라우저는 `/api/places` 한 번으로 121곳을 받는다. 느릴 수 있는 사용자 인터넷 구간을 한 번만 지나간다. 이 효과는 캐시가 없어도 생긴다.
- **공유 캐시 (구간 B)**: 서버에 저장한 결과를 모든 사용자가 같이 쓴다. 5분 동안 100명이 오면 캐시 없이는 서울시를 100 × 121 = 12,100번 부르고, 캐시가 있으면 121번만 부른다. 캐시가 있으면 응답도 빠르다(0.354초 → 0.007초).
- **서버에서 가공**: 클라이언트에서 가공해도 동작은 하지만 서버에서 하는 이유가 있다.
  - 화면에 필요한 필드만 보낸다(장소 1곳 기준 2,030 B → 1,190 B).
  - 가공은 5분에 한 번만 하고 결과를 캐시한다.
  - 모르는 혼잡도 글자 같은 잘못된 값을 서버에서 막는다.
  - 화면 코드는 서울시 응답 모양을 모르고 `Place`만 안다.
- **아직 남은 것**: 지금은 잘못된 값이 오면 `/api/places` 전체가 500으로 실패한다. 이상한 값은 안 보이지만 화면은 아무 데이터도 못 받는다. 다음 두 작업까지 해야 "화면에는 항상 정상 데이터"가 된다.
  - 121곳 중 일부가 실패해도 나머지는 살리기
  - 실패하면 마지막 성공 데이터 쓰기

> 면접용: "서울시 API는 인증키가 URL에 들어가고 장소를 하나씩만 줘서, Next Route Handler로 BFF를 두었습니다. 키는 서버에 숨기고, 121곳을 서버가 대신 불러 한 번의 응답으로 묶고, 화면에 필요한 모양으로 가공한 결과를 5분간 캐시해서 모든 사용자가 같이 쓰게 했습니다."

### 그 밖의 결정

- **서울시 타입과 앱 타입을 나눴다.** 서울시가 필드 이름을 바꿔도 `types.ts`와 어댑터만 고치면 되고, 화면 코드는 `Place`만 안다.
- **`place.ts`는 `seoul-api/` 밖에 뒀다.** `Place`는 화면(브라우저)에서도 쓰는데 `seoul-api/`는 서버 전용 폴더다. 파일 이름은 `types.ts`가 두 개 생기지 않게 내용대로 `place.ts`로 지었다.
- **`min`, `max`를 `PopulationRange`로 묶고 `Forecast`는 `extends`로 확장했다.** 현재 인구와 예측 인구가 같은 뜻(추정 인구 범위)이라서.
- **혼잡도 단계는 배열 하나에서 타입을 뽑았다.** `CONGEST_LEVELS = [...] as const`, `CongestLevel = (typeof CONGEST_LEVELS)[number]`. 4개 글자를 타입과 검사 코드 두 곳에 따로 적지 않으려고.
- **모르는 혼잡도 글자가 오면 기본값 대신 오류를 던진다.** 틀린 정보를 조용히 보여 주는 것보다 "실패"로 처리해서 04 문서의 "실패하면 마지막 성공 데이터" 규칙을 따르는 게 맞다.
- **부르기(`fetchPlace`)와 바꾸기(`toPlace`)를 나눴다.** `toPlace`는 인터넷 없이 샘플 JSON으로 시험할 수 있고, 실패 원인이 호출인지 변환인지 바로 갈린다.
- **`fetchPlace`는 응답 전체가 아니라 장소 하나(`SeoulPlaceRaw`)를 돌려준다.** `RESULT` 확인과 `['SeoulRtd.citydata_ppltn'][0]` 꺼내기를 이 함수 한 곳에서만 한다.
- **가드 절로 실패를 먼저 거른다.** 키 없음 → HTTP 실패 → 서울시 실패 순서로 `if … throw`, 성공 `return`은 맨 끝에 하나.
- **오류 메시지에 장소코드와 결과 코드를 넣는다.** 121곳을 부를 때 로그만 보고 어느 장소가 왜 실패했는지 알 수 있게.
- **`getPlaces`는 `Place[]`까지만 만들고 `Response`는 `route.ts`가 만든다.** `Response`는 내용을 한 번만 읽을 수 있어서 캐시해 두고 여러 요청에 줄 수 없다. 배열은 몇 번이든 꺼내 쓸 수 있다.
- **`cacheLife({ revalidate: 300, expire: 600 })`**
  - `revalidate` 5분: 서울시 갱신 주기와 같게.
  - `expire` 10분: 한동안 요청이 없었으면 10분 넘은 값은 주지 않고 새로 받는다. 캐시 지연은 서울시 자체 지연(약 30분) **위에 더해지므로** 짧게 잡았다. 30분으로 두면 최악일 때 약 60분 전 값을 보여 준다. 대신 그때 첫 방문자는 서울시 응답을 기다린다. 121곳 호출 시간을 잰 뒤 다시 조정한다.

## 문제와 해결

### 없는 장소코드에서 `Cannot read properties of undefined (reading '0')`

- **원인**: 서울시는 실패해도 **HTTP 200**을 보내고, 실패 응답은 모양이 다르다. `RESULT` 객체도 장소 배열도 없이 `"RESULT.CODE"`가 맨 바깥에 온다.
  ```json
  { "RESULT.CODE": "ERROR-500", "RESULT.MESSAGE": "서버 오류입니다. ..." }
  ```
- **해결**: 실패 모양을 `SeoulApiError`로 타입에 추가하고 `SeoulApiResponse = SeoulApiSuccess | SeoulApiError`로 바꿨다. `'RESULT' in data`로 어느 쪽인지 좁힌 뒤 각각 오류를 던진다. 이제 `POI999 서울시 API 오류: ERROR-500 서버 오류입니다. ...`가 나온다.

### `toPlace`의 `level`에 `Type 'string' is not assignable to type 'CongestLevel'`

- **원인**: 서울시가 보낸 글자(`string`)가 4단계 중 하나라는 보장이 없다.
- **해결**: `as CongestLevel`로 우기지 않고 `isCongestLevel`(타입 술어)로 실제로 검사한 뒤 좁혔다. `includes`는 매개변수가 배열 칸 타입이어야 해서 `string`을 넣을 수 없으므로, 검사하는 줄에서만 `as readonly string[]`로 넓혔다(넓히기는 항상 사실이라 안전하다).

### `route.ts`의 `GET(code: string)`

- **원인**: `GET`은 Next가 부르고, 첫 번째 인자는 장소코드가 아니라 `Request` 객체다.
- **해결**: 매개변수를 없애고 장소 목록은 서버 안에서 정한다.

## 측정

| 무엇 | 값 | 비고 |
| --- | --- | --- |
| `/api/places` 첫 요청 | 0.354초 | 서울시 호출 포함 (장소 1곳, 개발 서버) |
| 캐시된 요청 | 0.006 ~ 0.007초 | 약 50배 빠름 |
| `pnpm build` 결과 | `○ /api/places  5m  10m` | 빌드 때 미리 만들어 둠(Static) |

## 확인한 사실

- 실패해도 HTTP 200이다. `res.ok`만으로는 실패를 알 수 없고 `RESULT.CODE`를 봐야 한다.
- 예측(`FCST_PPLTN`)에는 새벽 03:00 ~ 06:00 값도 온다. 실시간 값이 새벽에도 오는지는 아직 모른다.
- `use cache`를 쓴 Route Handler는 **빌드할 때 서울시 API를 부른다.** Vercel 빌드에도 `SEOUL_API_KEY`가 필요하고, 그 순간 서울시가 실패하면 빌드가 실패할 수 있다.
- Next 16에서는 `server-only`를 설치하지 않아도 된다. Next가 직접 처리하고 타입도 들어 있다.

## 새로 배운 것

- **타입과 어댑터는 다르다.** 타입은 실행할 때 사라지는 약속이고, 데이터를 실제로 그 모양으로 바꾸는 코드는 따로 있어야 한다.
- **`as`는 검사가 아니라 우기기다.** 좁은 쪽으로 우기면(`string` → `CongestLevel`) 틀릴 수 있고, 넓은 쪽으로 보는 것(`'여유'` 배열 → `string` 배열)은 항상 사실이다.
- **타입 좁히기 세 가지**: `=== null` 같은 비교, 타입 술어(`text is CongestLevel`), `in`(`'RESULT' in data`).
- **`as const`, `typeof 배열[number]`**: 배열에서 유니언 타입을 뽑는다.
- **키에 점이나 띄어쓰기가 있으면 따옴표로 감싼다**: `'RESULT.CODE': string`, 꺼낼 때는 `data['RESULT.CODE']`.
- **화살표 함수가 객체를 바로 돌려줄 때는 `({ ... })`로 감싼다.**
- **긴 TypeScript 오류는 맨 아래 줄이 진짜 원인이다.**
- **`fetch`는 404·500에서도 오류를 던지지 않는다.** 응답을 아예 못 받았을 때만 던진다. 그래서 `res.ok`를 직접 확인한다.
- **`res`는 JSON이 아니라 `Response` 객체다.** 내용은 `res.json()`으로 꺼내고, 그 결과(`any`)에 타입을 붙인다.
- **`Response`는 내용을 한 번만 읽을 수 있다.** 변수에 담아도 같은 객체를 가리킬 뿐이라 두 번째 요청에서 `Body has already been read`가 난다.
- **`res.json()`과 `Response.json()`**: 받은 응답을 여는 것과 새 응답을 만드는 것.
- **Route Handler**: `app/api/places/route.ts` → `/api/places`. 메서드 이름(`GET`)으로 export하고 `Response`를 return하면 Next가 브라우저로 보낸다. `use cache`는 본문에 못 쓰고 도우미 함수로 빼야 한다.
- **캐시가 서버 한 곳에 있으면 모든 사용자가 같은 결과를 나눠 쓴다.** 5분 동안 100명이 와도 서울시 호출은 장소 수만큼만 한다.
- **가드 절**: 실패를 먼저 `if … throw`로 거르고 성공 경로는 맨 끝에 둔다.
