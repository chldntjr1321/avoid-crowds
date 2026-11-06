'use client';

import usePlaces from '@/hooks/use-places';
import ErrorState from '@/components/panel/error-state';

export default function FloatingPanel() {
  const { data, errorUpdateCount, isFetching, refetch } = usePlaces();

  let message: React.ReactNode;
  if (data) {
    message = null; // 추후에 TOP5 표시 예정
  } else if (errorUpdateCount > 0) {
    message = <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />;
  } else {
    message = '불러오는 중';
  }

  return (
    <aside className="absolute top-5 right-5 bottom-5 flex w-85 flex-col gap-4 overflow-auto rounded-lg border border-border-soft bg-card p-5 shadow-panel">
      <h2 className="text-lg font-bold">서울 전체</h2>
      <div className="flex flex-1">{message}</div>
    </aside>
  );
}
