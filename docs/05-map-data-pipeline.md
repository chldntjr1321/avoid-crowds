# 05. 지도 데이터 변환 (빌드 스크립트)

## 이 작업이 왜 필요한가
SVG로 지도를 그리려면 브라우저에 `<path d="M10 20 L30 40 …">` 같은 **그리기 명령**을 줘야 한다. 그런데 서울시가 주는 경계 파일(shapefile)은 **위도·경도 좌표 목록**이다.
그래서 좌표를 화면 좌표로 바꾸고 SVG path 문자열로 만드는 변환을 **미리 한 번** 해 둔다. 경계는 매일 바뀌지 않으니 앱은 결과물만 가져다 쓴다. (요리로 치면 재료 손질을 미리 해두는 것)

## 변환 단계
1. **읽기**: 행정동 경계(`HangJeongDong_ver20261001.geojson`, 이미 WGS84 위경도)와 121장소 영역 shapefile(WGS84)을 읽는다. shapefile은 mapshaper로 GeoJSON으로 바꾸면 편하다.
2. **구로 합치기**: 행정동은 동 단위라서, 같은 구(`sggnm`)의 동들을 하나로 합친다(mapshaper `-dissolve`). 서울(`sido` 11)은 25개 구, 경기(41)·인천(28)은 배경용 시군구.
3. **구 배정**: 장소 영역이 **가장 많이 겹치는 구**로 정한다(후보: 서울 25개 구 + 과천시). 중심점 방식은 경계에 걸친 역·공원이 옆 구로 가서 쓰지 않는다. **단순화하기 전에** 계산해야 정확하다. mapshaper `-join 구레이어 largest-overlap`으로 한다.
   - 수동 보정은 하지 않는다 (11/4 결정). `POI023 대림역`은 구로구·영등포구 경계에 걸쳐 있고 역 주소는 구로구지만, 면적은 영등포가 더 크고(56:44) 역 이름도 영등포구 대림동에서 왔다. 정답이 없는 경우라 예외 없이 면적 규칙 하나로 **영등포구**에 둔다.
4. **단순화**: mapshaper로 경계선의 점 개수를 줄여 파일 크기를 줄인다. **전후 파일 크기를 기록**한다 (측정 항목).
5. **한강 뽑기**: 강북 구(마포·용산·성동·광진)와 강남 구(강서·영등포·동작·서초·강남·송파·강동)가 맞닿은 선이 한강 한가운데다. 두 묶음의 공유 경계선을 뽑아 `background.json`에 넣는다. 서울 밖 구간은 경기 시군구 경계에서 같은 방식으로 이어 붙이거나 생략한다.
6. **투영**: d3-geo로 위경도를 화면 좌표로 바꾼다. 구·장소·배경은 **반드시 같은 투영 설정**으로 바꿔야 겹쳤을 때 딱 맞는다. 결과인 SVG path 문자열과 구마다의 확대 범위(bbox)를 JSON으로 저장한다. 브라우저는 계산 없이 그리기만 한다.

## 파일 위치 (2026-11-01 확정)
- `data/raw/`: 받은 원본. 출처·받은 날짜는 `data/raw/README.md`에 적는다.
  - `places-121-area/`(shapefile 5개, 압축 푼 폴더), `places-121-list.xlsx`: 서울 열린데이터광장 (사용자가 받음, 작아서 **커밋**)
  - `HangJeongDong_ver20261001.geojson`: 전국 행정동 경계 2026-10-01 기준 ([vuski/admdongkor](https://github.com/vuski/admdongkor), 통계청 SGIS 가공, CC BY 4.0). 34MB라 **커밋하지 않음**: `.gitignore`에 `data/raw/*.geojson` 추가, README에 받는 주소 `https://raw.githubusercontent.com/vuski/admdongkor/master/ver20261001/HangJeongDong_ver20261001.geojson` 기록. 서울(sido 11)은 구 경계, 경기(41)·인천(28)은 배경으로 쓴다. 동 단위라 스크립트에서 같은 구(`sggnm`)끼리 합친다
  - 앱 하단 또는 README에 출처 표기: "행정구역 경계: 통계청 SGIS, vuski/admdongkor (CC BY 4.0)"
- `scripts/build-map-data.ts`: 변환 스크립트. 데이터 작업 때 만든다. `package.json`에 `"build:map"`으로 등록해 `pnpm build:map`으로 실행. d3-geo·mapshaper는 `pnpm add -D`(개발용).
  - Node 22.18 이상이면 `node scripts/build-map-data.ts`로 TS를 바로 실행 가능. 낮으면 `tsx`를 개발용으로 설치.
- `src/data/generated/`: 결과물 `districts.json`(25개 구), `places.json`(121곳), `background.json`(경기 배경·한강). "손으로 고치지 말고 스크립트로 다시 만든다"는 뜻. 결과물도 커밋해서 Vercel 배포 때 스크립트를 다시 돌리지 않게 한다.

## 아직 확인할 것
- (해결) 경계 출처: 2013년 southkorea/seoul-maps 대신 2026년 admdongkor로 결정 (11/1)

## 확인한 사실 (2026-11-01, 최신 경계 + 면적 겹침 규칙으로 다시 확인)
- 121장소 영역 shapefile: **WGS84 위경도**(좌표계 변환 불필요), 인코딩 UTF-8, 속성 `AREA_CD`·`CATEGORY`·`AREA_NM`, 121개 폴리곤(북서울꿈의숲만 2조각)
- `121장소 목록.xlsx`: 열은 `CATEGORY, NO, AREA_CD, AREA_NM, ENG_NM`뿐. **자치구 열 없음**
- 배정 결과: 종로 14, 중구·용산·송파 10, 강남·마포 8, 서초 7, … **중랑구 0곳**(지도에서 "데이터 없음" 회색), **과천시 1곳(서울대공원)**
- 서울대공원: 과천시로 따로 표시. 서울 구 평균에서는 빼고, 지도에서는 옅은 경기 위에 그 장소만 칠하고, 목록·TOP 5에는 "과천시"로 보여준다
- 장소별 비교표: 프로젝트 폴더 `data-notes/place-gu-assignment.csv`
