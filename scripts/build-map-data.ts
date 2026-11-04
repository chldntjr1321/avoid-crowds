import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import mapshaper from 'mapshaper';
import { geoMercator, geoPath } from 'd3-geo';
import type {
  ExtendedFeature,
  ExtendedFeatureCollection,
  ExtendedGeometryCollection,
  GeoGeometryObjects,
} from 'd3-geo';

interface DongFeature {
  type: 'Feature';
  properties: { sido: string; sggnm: string; adm_nm: string };
  geometry: unknown;
}

type GuFeature = ExtendedFeature<GeoGeometryObjects, { sggnm: string }>;
type PlaceFeature = ExtendedFeature<
  GeoGeometryObjects,
  { AREA_CD: string; CATEGORY: string; AREA_NM: string; sggnm: string }
>;

const SOUTH_OF_RIVER = [
  '강서구',
  '양천구',
  '구로구',
  '금천구',
  '영등포구',
  '동작구',
  '관악구',
  '서초구',
  '강남구',
  '송파구',
  '강동구',
];

const raw = readFileSync('data/raw/HangJeongDong_ver20261001.geojson', 'utf8');
const korea: { features: DongFeature[] } = JSON.parse(raw); // korea.features는 전국 동 3559개가 들어있는 배열

// 서울특별시 sido 코드가 11
const seoulDongs = korea.features.filter((f) => f.properties.sido === '11');
const seoulGeoJson = { type: 'FeatureCollection', features: seoulDongs };

// d3-geo는 시계 방향을 안쪽으로 봐서, 반시계(RFC 7946) 기본 출력 대신 gj2008로 내보낸다.
const output = await mapshaper.applyCommands(
  '-i seoul.json -dissolve sggnm -o gu.json gj2008',
  { 'seoul.json': seoulGeoJson },
);
const guGeoJson: ExtendedFeatureCollection<GuFeature> = JSON.parse(
  output['gu.json'].toString(),
);

const guWithRiverSide = {
  type: 'FeatureCollection',
  features: guGeoJson.features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      riverSide: SOUTH_OF_RIVER.includes(f.properties.sggnm)
        ? 'south'
        : 'north',
    },
  })),
};

// 강북, 강남 맞닿은 부분(선) 추출
const riverOutput = await mapshaper.applyCommands(
  '-i gu.json -dissolve riverSide -innerlines -o river.json',
  { 'gu.json': guWithRiverSide },
);
const river: ExtendedGeometryCollection = JSON.parse(
  riverOutput['river.json'].toString(),
);

const projection = geoMercator().fitSize([1000, 1000], guGeoJson);
const toPath = geoPath(projection);
const districts = guGeoJson.features.map((f) => {
  const d = toPath(f);
  if (d === null) {
    throw new Error(`${f.properties.sggnm}의 svg path가 null입니다.`);
  }
  return {
    name: f.properties.sggnm,
    d,
    bbox: toPath.bounds(f),
  };
});
const riverPath = toPath(river);
if (riverPath === null) {
  throw new Error('한강 path가 null입니다.');
}

// 장소 -> 구 배정용 후보: 서울 25개 구 + 과천시(서울대공원). 지도용 guGeoJson과 따로 둔다 (과천시의 sido 코드는 41)

const extendedDongs = korea.features.filter(
  (f) =>
    f.properties.sido === '11' ||
    (f.properties.sido === '41' && f.properties.sggnm === '과천시'),
);
const extendedGeoJson = {
  type: 'FeatureCollection',
  features: extendedDongs,
};

const extendedOutput = await mapshaper.applyCommands(
  '-i extended.json -dissolve sggnm -o extended-gu.json',
  { 'extended.json': extendedGeoJson },
);
const extendedGuGeoJson: ExtendedFeatureCollection<GuFeature> = JSON.parse(
  extendedOutput['extended-gu.json'].toString(),
);

// 장소 121곳을 읽고, 가장 많이 겹치는 구 이름(sggnm)을 붙인다
const placesOutput = await mapshaper.applyCommands(
  '-i data/raw/places-121-area/places-121-area.shp -join extended-gu.json largest-overlap -o places.json gj2008',
  { 'extended-gu.json': extendedGuGeoJson },
);
const placesGeoJson: ExtendedFeatureCollection<PlaceFeature> = JSON.parse(
  placesOutput['places.json'].toString(),
);

const places = placesGeoJson.features.map((f) => {
  const d = toPath(f);
  if (d === null) {
    throw new Error(`${f.properties.AREA_NM}의 svg path가 null입니다.`);
  }
  return {
    name: f.properties.AREA_NM,
    d,
    code: f.properties.AREA_CD,
    guName: f.properties.sggnm,
  };
});

// 앱이 실제로 import해서 쓰는 결과물. 원본은 배포 서버에 없으니 이 파일을 커밋한다
mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/districts.json', JSON.stringify(districts));
writeFileSync('src/data/generated/places.json', JSON.stringify(places));
writeFileSync(
  'src/data/generated/background.json',
  JSON.stringify({ river: riverPath }),
);

// 디버깅용
console.log(`서울 동: ${seoulDongs.length}`);
console.log(
  `서울 구: ${new Set(seoulDongs.map((f) => f.properties.sggnm)).size}`,
);

console.log('합친 구:', guGeoJson.features.length);
console.log('첫 번째 구:', guGeoJson.features[0].properties);

console.log('투영 배율:', projection.scale());
console.log(districts[0].name, districts[0].d.slice(0, 80));

console.log(districts[0].name, districts[0].bbox);

console.log(
  'districts.json 크기:',
  statSync('src/data/generated/districts.json').size,
  'bytes',
);

console.log(
  '한강 남쪽 지역 개수:',
  guWithRiverSide.features.filter((f) => f.properties.riverSide === 'south')
    .length,
);
console.log(river.type, river.geometries.length);
console.log('한강 path:', riverPath.slice(0, 80));

console.log('구 배정 후보:', extendedGuGeoJson.features.length);
console.log('장소 수:', places.length);
console.log(
  '첫 번째 장소:',
  places[0].name,
  places[0].guName,
  places[0].d.slice(0, 80),
);
console.log(
  'places.json 크기:',
  statSync('src/data/generated/places.json').size,
  'bytes',
);
