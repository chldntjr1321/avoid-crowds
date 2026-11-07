import { getValidMapQuery } from '@/lib/map-query';
import { useSearchParams } from 'next/navigation';

export default function useMapQuery() {
  const searchParams = useSearchParams();
  const gu = searchParams.get('gu');
  const place = searchParams.get('place');

  const validQuery = getValidMapQuery({ gu, place });

  return validQuery;
}
