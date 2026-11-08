import { getMapHref } from '@/lib/map-query';
import type { Place } from '@/lib/place';
import Link from 'next/link';

interface PlaceListProps {
  places: Place[];
}

export default function PlaceList({ places }: PlaceListProps) {
  return (
    <ul className="flex-1">
      {places.map((p) => {
        const placeHref = getMapHref({ gu: p.guName, place: p.code });

        return (
          <li key={p.code}>
            <Link href={placeHref} className="flex justify-between">
              <span>{p.name}</span>
              <span>{p.level}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
