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

export default function FloatingPanel() {
  const { data, errorUpdateCount, isFetching, refetch } = usePlaces();
  const { gu, place } = useMapQuery();

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
    const selectedPlace = data.find((d) => d.code === place);
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

  return (
    <aside className="absolute top-5 right-5 bottom-5 flex w-85 flex-col gap-4 overflow-auto rounded-lg border border-border-soft bg-card p-5 shadow-panel">
      {gu && (
        <Button
          variant="outline"
          className="self-start rounded-sm border-input bg-surface-white px-2.5 py-1.5 text-[13px]"
          asChild
        >
          <Link href="/">
            <ArrowLeft />
            <span>서울 전체</span>
          </Link>
        </Button>
      )}
      <h2 className="text-lg font-bold">{gu ?? '서울 전체'}</h2>
      <div className="flex flex-1">{content}</div>
    </aside>
  );
}
