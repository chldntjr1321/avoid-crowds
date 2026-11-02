import { readFileSync } from 'node:fs';

interface DongFeature {
  type: 'Feature';
  properties: { sido: string; sggnm: string; adm_nm: string };
  geometry: unknown;
}

const raw = readFileSync('data/raw/HangJeongDong_ver20261001.geojson', 'utf8');
const korea: { features: DongFeature[] } = JSON.parse(raw);

const seoulDongs = korea.features.filter((f) => f.properties.sido === '11');

console.log(`서울 동: ${seoulDongs.length}`);
console.log(
  `서울 구: ${new Set(seoulDongs.map((f) => f.properties.sggnm)).size}`,
);
