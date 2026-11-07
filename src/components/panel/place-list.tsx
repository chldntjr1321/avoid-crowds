import type { Place } from '@/lib/place';

interface PlaceListProps {
  places: Place[];
}

export default function PlaceList({ places }: PlaceListProps) {
  return (
    <ul className="flex-1">
      {places.map((p) => {
        return (
          <li key={p.code} className="flex justify-between">
            <span>{p.name}</span>
            <span>{p.level}</span>
          </li>
        );
      })}
    </ul>
  );
}
