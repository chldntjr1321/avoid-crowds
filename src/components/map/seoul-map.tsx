'use client';

import districts from '@/data/generated/districts.json';
import background from '@/data/generated/background.json';
import usePlaces from '@/hooks/use-places';
import { getGuLevels } from '@/lib/congestion';
import type { CongestLevel } from '@/lib/place';
import placeList from '@/data/generated/places.json';
import ErrorState from '@/components/panel/error-state';

const LEVEL_COLOR: Record<CongestLevel, string> = {
  여유: 'fill-congestion-free',
  보통: 'fill-congestion-normal',
  '약간 붐빔': 'fill-congestion-busyish',
  붐빔: 'fill-congestion-busy',
};
const seoulGrandPark = placeList.find((place) => place.code === 'POI100');

function getFillColor(
  guLevels: Record<string, CongestLevel> | undefined,
  guName: string,
): string {
  const level = guLevels?.[guName];
  const fillColor = level
    ? LEVEL_COLOR[level]
    : guLevels
      ? 'fill-congestion-none'
      : 'fill-map-empty';
  return fillColor;
}

export default function SeoulMap() {
  const { data, errorUpdateCount, isFetching, refetch } = usePlaces();
  let message: React.ReactNode;
  if (data) {
    message = `${data.length}곳`;
  } else if (errorUpdateCount > 0) {
    message = <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />;
  } else {
    message = '불러오는 중';
  }
  const guLevels = data ? getGuLevels(data) : undefined;

  return (
    <>
      {message}
      <svg viewBox="0 0 1000 1000" className="h-screen w-full">
        {districts.map((district) => {
          const fillColor = getFillColor(guLevels, district.name);
          return (
            <path
              key={district.name}
              d={district.d}
              className={`${fillColor} stroke-map-line`}
            />
          );
        })}
        {seoulGrandPark && (
          <path
            d={seoulGrandPark.d}
            className={`${getFillColor(guLevels, seoulGrandPark.guName)} stroke-map-line`}
          />
        )}

        {/* TODO: 한강 색을 토큰(map-river)으로 */}
        <path
          d={background.river}
          fill="none"
          className="stroke-blue-400"
          strokeWidth={6}
        />
      </svg>
    </>
  );
}
