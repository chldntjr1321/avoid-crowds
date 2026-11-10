'use client';

import districts from '@/data/generated/districts.json';
import background from '@/data/generated/background.json';
import usePlaces from '@/hooks/use-places';
import { getGuLevels } from '@/lib/congestion';
import type { CongestLevel } from '@/lib/place';
import placeList from '@/data/generated/places.json';
import { useRouter } from 'next/navigation';
import { getMapHref, SEOUL_GRAND_PARK_CODE } from '@/lib/map-query';
import { cn } from '@/lib/utils';
import useMapQuery from '@/hooks/use-map-query';

const LEVEL_COLOR: Record<CongestLevel, string> = {
  여유: 'fill-congestion-free',
  보통: 'fill-congestion-normal',
  '약간 붐빔': 'fill-congestion-busyish',
  붐빔: 'fill-congestion-busy',
};
const LEVEL_HOVER_COLOR: Record<CongestLevel, string> = {
  여유: 'hover:fill-congestion-free-hover',
  보통: 'hover:fill-congestion-normal-hover',
  '약간 붐빔': 'hover:fill-congestion-busyish-hover',
  붐빔: 'hover:fill-congestion-busy-hover',
};
const seoulGrandPark = placeList.find(
  (place) => place.code === SEOUL_GRAND_PARK_CODE,
);
const SEOUL_VIEW_BOX = `0 0 1000 1000`;

const AMOUNT_OF_GU = 25;
const SHUFFLE_STEP = 7;
const MAX_FILL_DELAY_MS = 400;

function getDelayTime(index: number) {
  const order = (index * SHUFFLE_STEP) % AMOUNT_OF_GU;
  return order * (MAX_FILL_DELAY_MS / (AMOUNT_OF_GU - 1));
}

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

function getViewBox(gu: string | null): string {
  if (!gu) {
    return SEOUL_VIEW_BOX;
  }
  const targetGu = districts.find((district) => district.name === gu);
  if (!targetGu) {
    return SEOUL_VIEW_BOX;
  }
  const [[left, top], [right, bottom]] = targetGu.bbox;
  const width = right - left;
  const height = bottom - top;
  const pad = Math.max(width, height) * 0.3; // 자치구 및 장소 선택 시 여백 크기

  return `${left - pad} ${top - pad} ${width + pad * 2} ${height + pad * 2}`;
}

export default function SeoulMap() {
  const router = useRouter();
  const { data } = usePlaces();
  const { gu, place } = useMapQuery();

  const guLevels = data ? getGuLevels(data) : undefined;
  const selectedGu = districts.find((district) => district.name === gu);
  const selectedGuPlaces = placeList.filter((p) => p.guName === gu);
  const selectedPlace = selectedGuPlaces.find((p) => p.code === place);

  return (
    <svg viewBox={getViewBox(gu)} className="h-screen w-[calc(100%-360px)]">
      {/* 선택한 자치구 모양대로 자르기 위한 틀 등록 */}
      <defs>
        <clipPath id="selected-gu-clip">
          {selectedGu && <path d={selectedGu.d} />}
        </clipPath>
        {/* 선택한 장소 모양대로 자르기 위한 틀 (장소 안쪽의 자치구 경계선만 남길 때 씀) */}
        <clipPath id="selected-place-clip">
          {selectedPlace && <path d={selectedPlace.d} />}
        </clipPath>
      </defs>

      {/* 서울 전체 그리기 + 선택하지 않은 지역 처리 로직 */}
      {districts.map((district, index) => {
        const isSelected = gu === district.name;
        if (isSelected) {
          return null;
        }
        const isFaded = Boolean(gu && !isSelected);
        const href = isFaded
          ? getMapHref({ gu: null, place: null }) // 서울 전체로
          : getMapHref({ gu: district.name, place: null }); // 선택한 자치구로
        const fillColor = isFaded
          ? 'fill-map-outside'
          : getFillColor(guLevels, district.name);
        const isClickable = Boolean(guLevels?.[district.name] || isFaded);
        const delay = getDelayTime(index);

        return (
          <path
            key={district.name}
            d={district.d}
            onClick={isClickable ? () => router.push(href) : undefined}
            style={{ transitionDelay: `${gu ? 0 : delay}ms` }}
            className={cn(
              fillColor,
              isClickable && 'cursor-pointer',
              isFaded ? 'stroke-map-outside-line' : 'stroke-map-line',
              'transition-colors',
              'duration-600',
              'motion-reduce:transition-none',
            )}
          />
        );
      })}

      {/* 선택한 자치구 그리기 */}
      {selectedGu && <path d={selectedGu.d} className={'fill-map-zoom-wall'} />}

      {/* 선택한 자치구 내의 장소 그리기 (자치구를 넘어가는 부분은 자름) */}
      <g clipPath="url(#selected-gu-clip)">
        {selectedGuPlaces.map((p) => {
          const targetPlace = data?.find((d) => d.code === p.code);
          const href = getMapHref({ gu, place: p.code });

          return (
            <path
              key={p.code}
              d={p.d}
              onClick={() => router.push(href)}
              className={cn(
                targetPlace
                  ? LEVEL_COLOR[targetPlace.level]
                  : 'fill-congestion-none',
                targetPlace && LEVEL_HOVER_COLOR[targetPlace.level],
                'stroke-map-line',
                'cursor-pointer',
              )}
            />
          );
        })}
      </g>
      {/* 장소에 덮여 얇아진 자치구 경계선을 맨 위에 다시 그리기 */}
      {selectedGu && (
        <path d={selectedGu.d} fill="none" className="stroke-map-line" />
      )}

      {/* 선택한 장소 테두리 (옆 장소·경계선에 가리지 않게 맨 위에)
          보이는 모양은 "장소 ∩ 자치구"라서 테두리도 두 조각을 합쳐 그림 */}
      {selectedPlace && selectedGu && (
        <>
          {/* ① 장소 경계 중 자치구 안에 있는 부분 */}
          <g clipPath="url(#selected-gu-clip)">
            <path
              d={selectedPlace.d}
              className="stroke-selected"
              fill="none"
              strokeWidth={2}
            />
          </g>
          {/* ② 자치구 경계 중 장소 안에 있는 부분 (장소가 자치구 밖으로 나간 쪽) */}
          <g clipPath="url(#selected-place-clip)">
            <path
              d={selectedGu.d}
              className="stroke-selected"
              fill="none"
              strokeWidth={2}
            />
          </g>
        </>
      )}

      {/* 서울대공원 그리기 */}
      {seoulGrandPark && (
        <path
          d={seoulGrandPark.d}
          style={{ transitionDelay: `${gu ? 0 : MAX_FILL_DELAY_MS}ms` }}
          onClick={() =>
            router.push(getMapHref({ gu: null, place: SEOUL_GRAND_PARK_CODE }))
          }
          className={cn(
            getFillColor(guLevels, seoulGrandPark.guName),
            'stroke-map-line',
            place === SEOUL_GRAND_PARK_CODE && 'stroke-selected',
            'transition-[fill]',
            'duration-600',
            'motion-reduce:transition-none',
            'cursor-pointer',
          )}
          strokeWidth={place === SEOUL_GRAND_PARK_CODE ? 2 : undefined}
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
  );
}
