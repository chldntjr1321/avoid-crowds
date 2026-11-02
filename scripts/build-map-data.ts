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
const korea: { features: DongFeature[] } = JSON.parse(raw);

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

// 앱이 실제로 import해서 쓰는 결과물. 원본은 배포 서버에 없으니 이 파일을 커밋한다
mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/districts.json', JSON.stringify(districts));
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
