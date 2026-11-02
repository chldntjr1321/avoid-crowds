import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import mapshaper from 'mapshaper';
import { geoMercator, geoPath } from 'd3-geo';
import type {
  ExtendedFeature,
  ExtendedFeatureCollection,
  GeoGeometryObjects,
} from 'd3-geo';

interface DongFeature {
  type: 'Feature';
  properties: { sido: string; sggnm: string; adm_nm: string };
  geometry: unknown;
}

type GuFeature = ExtendedFeature<GeoGeometryObjects, { sggnm: string }>;

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

const projection = geoMercator().fitSize([1000, 1000], guGeoJson);
const toPath = geoPath(projection);
const districts = guGeoJson.features.map((f) => {
  const d = toPath(f);
  if (d === null) {
    throw new Error(`${f.properties.sggnm}의 svg path가 null입니다.`);
  }
  return { name: f.properties.sggnm, d, bbox: toPath.bounds(f) };
});

// 앱이 실제로 import해서 쓰는 결과물. 원본은 배포 서버에 없으니 이 파일을 커밋한다
mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/districts.json', JSON.stringify(districts));

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
