import type { Place } from '@/lib/place';

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  return (
    <div className="flex flex-1 flex-row justify-between">
      <h2>{place.name}</h2>
      <p>{place.level}</p>
    </div>
  );
}
