'use client';

import districts from '@/data/generated/districts.json';
import background from '@/data/generated/background.json';
import usePlaces from '@/hooks/use-places';
import { getGuLevels } from '@/lib/congestion';
import type { CongestLevel } from '@/lib/place';

const LEVEL_COLOR: Record<CongestLevel, string> = {
  여유: 'fill-congestion-free',
  보통: 'fill-congestion-normal',
  '약간 붐빔': 'fill-congestion-busyish',
  붐빔: 'fill-congestion-busy',
};

export default function SeoulMap() {
  const { data, isError } = usePlaces();

  let message: string;
  if (data) {
    message = `${data.length}곳`;
  } else if (isError) {
    message = '불러오지 못했어요.';
  } else {
    message = '불러오는 중..';
  }

  const guLevels = data ? getGuLevels(data) : undefined;

  return (
    <>
      <p>{message}</p>
      <svg viewBox="0 0 1000 1000" className="h-screen w-full">
        {districts.map((district) => {
          const level = guLevels?.[district.name];
          const fillColor = level
            ? LEVEL_COLOR[level]
            : guLevels
              ? 'fill-congestion-none'
              : 'fill-map-empty';

          return (
            <path
              key={district.name}
              d={district.d}
              className={`${fillColor} stroke-map-line`}
            />
          );
        })}
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
