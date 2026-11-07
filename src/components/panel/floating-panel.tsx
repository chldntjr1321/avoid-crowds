'use client';

import usePlaces from '@/hooks/use-places';
import ErrorState from '@/components/panel/error-state';
import useMapQuery from '@/hooks/use-map-query';
import PlaceList from '@/components/panel/place-list';
import { sortByMostCrowded } from '@/lib/congestion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FloatingPanel() {
  const { data, errorUpdateCount, isFetching, refetch } = usePlaces();
  const { gu } = useMapQuery();

  let content: React.ReactNode;
  if (data) {
    if (gu) {
      const selectedGuPlaces = data.filter((d) => d.guName === gu);
      const sortedGuPlaces = sortByMostCrowded(selectedGuPlaces);
      content = <PlaceList places={sortedGuPlaces} />;
    } else {
      content = null;
    }
  } else if (errorUpdateCount > 0) {
    content = <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />;
  } else {
    content = '불러오는 중';
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
