import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

export default function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div role="alert">
      <p>혼잡도 데이터를 불러오지 못했어요.</p>
      <p>잠시 후 다시 시도해 주세요.</p>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        <RotateCw />
        {isRetrying ? '다시 불러오는 중' : '다시 시도'}
      </Button>
    </div>
  );
}
