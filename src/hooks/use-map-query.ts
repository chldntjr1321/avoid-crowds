import { getValidMapQuery } from '@/lib/map-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function useMapQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gu = searchParams.get('gu');
  const place = searchParams.get('place');

  const validQuery = getValidMapQuery({ gu, place });

  const isInvalid = gu !== validQuery.gu || place !== validQuery.place;

  useEffect(() => {
    if (!isInvalid) {
      return;
    }

    const params = new URLSearchParams();

    if (validQuery.gu) {
      params.set('gu', validQuery.gu);
    }
    if (validQuery.place) {
      params.set('place', validQuery.place);
    }

    const queryString = params.toString();
    const href = queryString ? `/?${queryString}` : '/';
    router.replace(href);
  }, [isInvalid, validQuery.gu, validQuery.place, router]);

  return validQuery;
}
