import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

export default function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-2.5 pb-8.5 text-center"
    >
      <p className="text-base font-bold">혼잡도 데이터를 불러오지 못했어요.</p>
      <p className="max-w-60 text-[13px] leading-[1.6] text-text-secondary">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button
        variant="outline"
        className="mt-1.5 rounded-sm border-input bg-surface-white px-4 py-2.25 text-sm font-medium"
        onClick={onRetry}
        disabled={isRetrying}
      >
        <RotateCw />
        {isRetrying ? '다시 불러오는 중' : '다시 시도'}
      </Button>
    </div>
  );
}
