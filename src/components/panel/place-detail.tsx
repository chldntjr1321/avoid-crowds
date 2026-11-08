import type { Place } from '@/lib/place';

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  return (
    <div className="flex flex-1 flex-row justify-between">
      <p>{place.name}</p>
      <p>{place.level}</p>
    </div>
  );
}
