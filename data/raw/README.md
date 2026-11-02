# data/raw

지도 변환 스크립트(`scripts/build-map-data.ts`)가 읽는 원본 데이터. 손으로 고치지 않는다.
변환 과정은 `docs/05-map-data-pipeline.md` 참고.

| 파일 | 내용 | 출처 | 받은 날짜 |
| --- | --- | --- | --- |
| `places-121-area/` | 서울시 주요 121장소 영역 shapefile (`.shp` `.shx` `.dbf` `.prj` `.cpg`) | 서울 열린데이터광장, [서울시 실시간 인구데이터 (OA-21778)](https://data.seoul.go.kr/dataList/OA-21778/S/1/datasetView.do) | 2026-10-31 |
| `places-121-list.xlsx` | 서울시 주요 121장소 목록 | 서울 열린데이터광장, 위와 같음 | 2026-10-31 |
| `HangJeongDong_ver20261001.geojson` | 전국 행정동 경계 (2026-10-01 기준) | [vuski/admdongkor](https://github.com/vuski/admdongkor) (통계청 SGIS 가공) | 2026-11-02 |

## places-121-area/

- 좌표계: WGS84 위경도 (`.prj`), 인코딩: UTF-8 (`.cpg`)
- 속성: `AREA_CD`(장소 코드, 예: `POI009`), `CATEGORY`, `AREA_NM`
- 폴리곤 121개 (북서울꿈의숲만 2조각)
- 원본 파일 이름은 `서울시 주요 121장소 영역.*`. 경로 실수를 막으려고 영어로 바꿨다. 다섯 파일은 이름이 같아야 한 묶음으로 읽힌다

## places-121-list.xlsx

- 열: `CATEGORY`, `NO`, `AREA_CD`, `AREA_NM`, `ENG_NM`
- 자치구 열이 없다. 장소의 소속 구는 변환 스크립트가 면적 겹침으로 정한다

## HangJeongDong_ver20261001.geojson

- 좌표계: WGS84 위경도 (CRS84)
- 주요 속성: `sido`(시도 코드, 문자열. 서울 `"11"`, 인천 `"28"`, 경기 `"41"`), `sidonm`, `sgg`, `sggnm`(시군구 이름), `adm_nm`, `adm_cd`
- 라이선스: CC BY 4.0. 앱 또는 README에 출처를 적는다: "행정구역 경계: 통계청 SGIS, vuski/admdongkor (CC BY 4.0)"
- 용량이 커서 커밋하지 않는다 (`.gitignore`). 프로젝트 폴더에서 아래 명령으로 받는다

```bash
curl -L -o data/raw/HangJeongDong_ver20261001.geojson https://raw.githubusercontent.com/vuski/admdongkor/master/ver20261001/HangJeongDong_ver20261001.geojson
```
