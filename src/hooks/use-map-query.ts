import { useSearchParams } from 'next/navigation';

export default function useMapQuery() {
  const searchParams = useSearchParams();
  const gu = searchParams.get('gu');
  const place = searchParams.get('place');

  return { gu, place };
}
