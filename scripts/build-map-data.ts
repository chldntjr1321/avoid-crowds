import { readFileSync } from 'node:fs';
import mapshaper from 'mapshaper';

interface DongFeature {
  type: 'Feature';
  properties: { sido: string; sggnm: string; adm_nm: string };
  geometry: unknown;
}

const raw = readFileSync('data/raw/HangJeongDong_ver20261001.geojson', 'utf8');
const korea: { features: DongFeature[] } = JSON.parse(raw);

const seoulDongs = korea.features.filter((f) => f.properties.sido === '11');
const seoulGeoJson = { type: 'FeatureCollection', features: seoulDongs };

const output = await mapshaper.applyCommands(
  '-i seoul.json -dissolve sggnm -o gu.json',
  { 'seoul.json': seoulGeoJson },
);
const guGeoJson = JSON.parse(output['gu.json'].toString());

console.log(`서울 동: ${seoulDongs.length}`);
console.log(
  `서울 구: ${new Set(seoulDongs.map((f) => f.properties.sggnm)).size}`,
);
console.log('합친 구:', guGeoJson.features.length);
console.log('첫 번째 구:', guGeoJson.features[0].properties);
