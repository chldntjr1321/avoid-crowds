import 'server-only';
import { cacheLife } from 'next/cache';
import { toPlace } from '@/lib/seoul-api/adapter';
import { fetchPlace } from '@/lib/seoul-api/fetch-place';
import type { Place } from '@/lib/place';

export async function getPlaces(): Promise<Place[]> {
  'use cache';

  // revalidate 5분: 서울시 데이터 갱신 주기와 같게 맞춤
  // expire 10분: 서울시에서 보내줄 때의 지연 시간(약 30분)에 더해지는 지연을 줄이려고 짧게 잡음
  cacheLife({ revalidate: 300, expire: 600 });

  // TODO: places.json으로 교체 예정. 지금은 테스트용 하드코딩
  const raw = await fetchPlace('POI009');
  const place = toPlace(raw, '종로구');

  return [place];
}
