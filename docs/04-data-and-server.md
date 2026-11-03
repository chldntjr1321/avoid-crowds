# 04. 데이터와 서버 설계

## 사용하는 API
서울시 실시간 인구데이터 **`citydata_ppltn`** ([OA-21778](https://data.seoul.go.kr/dataList/OA-21778/S/1/datasetView.do), 공공데이터포털 15146211).

- 도시데이터(`citydata`)보다 응답이 약 70배 작다 (2.4 kB vs 174 kB, Network 탭 측정). 지도와 예측 모두 이것 하나로 충분하다.
- 요청 한 번에 **장소 하나**. 121곳이면 121번 호출.
- 데이터 갱신 주기 5분. 실제 측정 시각과 약 30분 차이.
- 새벽 시간대 미제공 여부는 매뉴얼에서 확인 필요 (`07` 문서). 예측(`FCST_PPLTN`)에는 03:00 ~ 06:00 값도 오는 것을 확인했다(11/3). 실시간 값은 아직 모른다.
- 장소명 또는 장소코드 중 하나로 호출한다. **장소코드(`POI009` 등)로 부르는 것을 추천**: 이름의 가운뎃점(·)이나 띄어쓰기 때문에 생기는 실수가 없다.
- 샘플 키는 광화문·덕수궁만 된다. 인증키는 발급 완료(11/1), `.env.local`에 있음.

### 응답 구조에서 쓰는 필드
- 최상위 키는 `"SeoulRtd.citydata_ppltn"` (배열). 키에 점(.)이 있어서 `data['SeoulRtd.citydata_ppltn']`로 꺼내야 한다.
- **숫자도 문자열로 온다** (`"23000"`). 반드시 `Number()`로 변환.

| 필드 | 뜻 |
| --- | --- |
| `AREA_NM`, `AREA_CD` | 장소 이름, 코드 (예: `POI009`) |
| `AREA_CONGEST_LVL` | 혼잡도 `여유` / `보통` / `약간 붐빔` / `붐빔` |
| `AREA_CONGEST_MSG` | 혼잡도 안내 문장 |
| `AREA_PPLTN_MIN`, `AREA_PPLTN_MAX` | 현재 추정 인구 범위 |
| `PPLTN_TIME` | 데이터 기준 시각 |
| `FCST_PPLTN` | 12시간 예측 배열. 각 항목에 `FCST_TIME`, `FCST_CONGEST_LVL`, `FCST_PPLTN_MIN`, `FCST_PPLTN_MAX` |

샘플 응답: 프로젝트 폴더의 `api-samples/citydata_ppltn_광화문덕수궁_sample.json`

## 실시간 데이터 흐름 (BFF)
브라우저는 서울시 API를 직접 부르지 않는다. Next.js 서버가 대신 모아서 한 번에 내려준다. 이런 "프론트엔드를 위한 서버"를 **BFF(Backend For Frontend)** 라고 부른다.

1. Route Handler(`/api/places`)가 121곳의 `citydata_ppltn`을 호출한다. 인증키는 서버 환경변수에만 있다. 121개를 한꺼번에 보내지 말고 **10개 정도씩 나눠** 보낸다 (서버에 요청이 몰려 거절되는 것을 막기 위해).
2. **어댑터** 함수가 응답을 앱 공통 타입으로 바꾼다. 문자열 숫자는 `Number()`로 변환하고, 쓰지 않는 필드는 버린다. → 서울시가 응답 형식을 바꿔도 어댑터만 고치면 된다.
3. 결과를 **5분 캐싱**한다 (`'use cache'` + `cacheLife({ revalidate: 300, expire: 600 })`). 서울시 갱신 주기가 5분이라 더 짧게 할 이유가 없다. `expire`를 10분으로 짧게 둔 이유: 캐시 지연은 서울시 자체 지연(약 30분) 위에 더해진다. 121곳 호출 시간을 잰 뒤 다시 조정한다.
4. 브라우저는 TanStack Query로 `/api/places`를 **한 번** 불러 121곳을 받는다.

### 파일 (2026-11-03, 지금은 POI009 한 곳만 하드코딩)
| 파일 | 하는 일 |
| --- | --- |
| `src/lib/seoul-api/types.ts` | 서울시 응답 모양 (성공 `SeoulApiSuccess` / 실패 `SeoulApiError`) |
| `src/lib/seoul-api/fetch-place.ts` | 장소 하나 호출, 실패 확인 후 `SeoulPlaceRaw` 반환 (`server-only`) |
| `src/lib/seoul-api/adapter.ts` | `toPlace(raw, guName)`: `SeoulPlaceRaw` → `Place` |
| `src/lib/seoul-api/get-places.ts` | 장소 목록 모으기 + `'use cache'` (`server-only`). `Place[]`를 반환한다 |
| `src/app/api/places/route.ts` | `GET`: `getPlaces()` 결과를 `Response.json`으로 |

- `use cache`는 Route Handler 본문에 쓸 수 없어서 `getPlaces`로 뺐다.
- 캐시에는 `Response`가 아니라 `Place[]`를 저장한다. `Response`는 내용을 한 번만 읽을 수 있어서 여러 요청에 나눠 줄 수 없다.
- **빌드할 때 서울시 API를 부른다** (`pnpm build`에서 `/api/places`가 Static으로 미리 만들어짐). 그래서 Vercel 빌드에도 `SEOUL_API_KEY`가 필요하고, 그 순간 서울시가 실패하면 빌드가 실패할 수 있다.

### 캐시와 실패 처리
- 요청이 올 때만, 캐시가 5분 지났으면 갱신한다 (아무도 안 보면 호출하지 않음).
- 서울시 API 호출 횟수를 기록한다 (측정과 한도 확인용).
- 응답의 `RESULT.CODE`가 **`INFO-000`이면 성공**, 그 밖의 코드는 종류와 상관없이 실패로 본다. 호출 한도 초과·서버 오류 코드를 일일이 알 필요가 없다. 실패한 코드는 로그에 남긴다.
- **실패해도 HTTP 200이 온다.** `res.ok`만으로는 모르고 `RESULT.CODE`를 봐야 한다. 실패 응답은 모양도 다르다. `RESULT` 객체와 장소 배열 없이 맨 바깥에 온다 (없는 장소코드 `POI999`로 확인).
  ```json
  { "RESULT.CODE": "ERROR-500", "RESULT.MESSAGE": "서버 오류입니다. ..." }
  ```
  그래서 `'RESULT' in data`로 성공/실패 모양을 먼저 가른 뒤 코드를 확인한다.
- 혼잡도 글자가 4단계 중 하나가 아니면 어댑터가 오류를 던진다 (틀린 값을 보여 주는 대신 실패로 처리).
- 일부 장소 호출이 실패하면 그 장소는 **마지막 성공 데이터**를 쓰고 화면에 안내한다.

## 앱 공통 타입 (`src/lib/place.ts`)
서버와 화면이 같이 쓰므로 `seoul-api/`(서버 전용) 밖에 둔다.

```ts
export const CONGEST_LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'] as const;
export type CongestLevel = (typeof CONGEST_LEVELS)[number];

export interface PopulationRange {
  min: number;
  max: number;
}

export interface Forecast extends PopulationRange {
  time: string;
  level: CongestLevel;
}

export interface Place {
  code: string; // AREA_CD, 예: POI009
  name: string; // AREA_NM
  guName: string; // 변환 스크립트가 정한 소속 구 (서울대공원만 '과천시')
  level: CongestLevel; // AREA_CONGEST_LVL
  message: string; // AREA_CONGEST_MSG
  population: PopulationRange; // AREA_PPLTN_MIN, AREA_PPLTN_MAX
  measuredAt: string; // PPLTN_TIME, 화면에 "14:05 기준"으로 표시
  forecast: Forecast[]; // 12개
}
```
- 혼잡도 단계는 `CONGEST_LEVELS` 배열 하나에서 타입을 뽑는다. 어댑터의 글자 검사도 같은 배열을 쓴다.
혼잡도 단계 ↔ 숫자(여유 1 ~ 붐빔 4) 변환, 구 평균 계산 같은 공통 로직은 `src/lib/congestion.ts`에 둔다.

## 호출 한도 (2026-11-01 열린데이터광장 안내문으로 확인)
- 일반 Open API는 **호출 횟수 제한이 없다.** 한 번 호출에 최대 1,000건(줄)까지 받을 수 있다는 제한만 있는데, 우리는 한 번에 장소 1곳이라 해당 없음.
- 하루 1,000회 제한은 **실시간 지하철 API에만** 있다. 우리 API와 무관.
- 그래도 5분 캐시로 호출을 줄인다. 최대 호출 수: 121곳 × 288번(하루 5분 단위 수) = **하루 34,848번** (측정 항목).
