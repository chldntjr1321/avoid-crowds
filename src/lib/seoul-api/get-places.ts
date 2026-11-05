import 'server-only';
import { cacheLife } from 'next/cache';
import { toPlace } from '@/lib/seoul-api/adapter';
import { fetchPlace } from '@/lib/seoul-api/fetch-place';
import type { Place } from '@/lib/place';
import placeList from '@/data/generated/places.json';

export async function getPlaces(): Promise<Place[]> {
  'use cache';

  // revalidate 5분: 서울시 데이터 갱신 주기와 같게 맞춤
  // expire 10분: 서울시에서 보내줄 때의 지연 시간(약 30분)에 더해지는 지연을 줄이려고 짧게 잡음
  cacheLife({ revalidate: 300, expire: 600 });

  const start = performance.now();

  const results = await Promise.allSettled(
    placeList.map(async (p) => {
      const raw = await fetchPlace(p.code);
      const place = toPlace(raw, p.guName);

      return place;
    }),
  );
  const successResults = results
    .filter((result) => result.status === 'fulfilled')
    .map((r) => r.value);

  const failReasons = results
    .filter((result) => result.status === 'rejected')
    .map((r) => r.reason);

  // 서울시 api 호출에 걸리는 시간 측정 로그
  const ms = Math.round(performance.now() - start);
  console.log(
    `${placeList.length}곳 호출 ${ms}ms, 성공: ${successResults.length} 실패: ${failReasons.length}`,
  );

  if (failReasons.length > 0) {
    console.error(`실패 ${failReasons.length}곳`);
    for (const reason of failReasons) {
      console.error(reason);
    }
  }

  if (successResults.length === 0) {
    throw new Error(`서울시 API: 장소 ${placeList.length}곳 모두 실패`);
  }

  return successResults;
}
