import type { Place } from '@/lib/place';
import { useQuery } from '@tanstack/react-query';

export default function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async (): Promise<Place[]> => {
      const res = await fetch('/api/places');
      if (!res.ok) {
        throw new Error(`${res.status} 에러`);
      }
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // 5분
  });
}
