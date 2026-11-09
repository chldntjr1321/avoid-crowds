'use client';

import usePlaces from '@/hooks/use-places';
import ErrorState from '@/components/panel/error-state';
import useMapQuery from '@/hooks/use-map-query';
import PlaceList from '@/components/panel/place-list';
import { sortByMostCrowded } from '@/lib/congestion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PlaceDetail from '@/components/panel/place-detail';
import { getMapHref } from '@/lib/map-query';

export default function FloatingPanel() {
  const { data, errorUpdateCount, isFetching, refetch } = usePlaces();
  const { gu, place } = useMapQuery();
  const selectedPlace = data?.find((d) => d.code === place);
  let content: React.ReactNode;

  if (!data) {
    content =
      errorUpdateCount > 0 ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <p className="text-[13px] text-text-secondary" role="status">
          불러오는 중
        </p>
      );
  } else if (place) {
    // getValidMapQuery를 통과한 place는 항상 gu가 있음
    content = selectedPlace ? (
      <PlaceDetail place={selectedPlace} />
    ) : (
      <p className="text-[13px] text-text-secondary" role="alert">
        정보를 불러오지 못했어요
      </p>
    );
  } else if (gu) {
    const selectedGuPlaces = data.filter((d) => d.guName === gu);
    const sortedGuPlaces = sortByMostCrowded(selectedGuPlaces);
    content = <PlaceList places={sortedGuPlaces} />;
  } else {
    content = null;
  }

  const backHref = place
    ? getMapHref({ gu, place: null })
    : getMapHref({ gu: null, place: null });
  const backLabel = gu && place ? `${gu} 장소 목록` : '서울 전체';
  const panelTitle = place ? '' : (gu ?? '서울 전체');

  return (
    <aside className="absolute top-5 right-5 bottom-5 flex w-85 flex-col gap-4 overflow-auto rounded-lg border border-border-soft bg-card p-5 shadow-panel">
      {/* 뒤로 가기 버튼 */}
      {(gu || place) && (
        <Button
          variant="outline"
          className="self-start rounded-sm border-input bg-surface-white px-2.5 py-1.5 text-[13px]"
          asChild
        >
          <Link href={backHref}>
            <ArrowLeft />
            <span>{backLabel}</span>
          </Link>
        </Button>
      )}
      {panelTitle && (
        <h2 className={gu ? 'text-xl font-extrabold' : 'text-lg font-bold'}>
          {panelTitle}
        </h2>
      )}
      <div className="flex flex-1">{content}</div>
    </aside>
  );
}
