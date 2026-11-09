import type { Place } from '@/lib/place';
import { Badge } from '@/components/ui/badge';
import { getBadgeVariant, formatPopulation } from '@/lib/congestion';
import ForecastCard from '@/components/panel/forecast-card';

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <time
          className="text-xs text-muted-foreground tabular-nums"
          dateTime={place.measuredAt}
        >{`${place.measuredAt} 기준`}</time>
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-xl font-extrabold">{place.name}</h2>
          <Badge variant={getBadgeVariant(place.level)} className="text-[13px]">
            {place.level}
          </Badge>
        </div>
      </div>
      <dl className="flex flex-col gap-1.5 text-[13px]">
        <div className="flex items-center gap-3.5">
          <dt className="text-muted-foreground">현재 인구</dt>
          <dd className="text-base font-bold">
            {formatPopulation(place.population)}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-1 rounded-sm border border-border-soft bg-card px-3 py-2.5 text-[13px] text-text-body">
        <span className="text-[11px] text-text-faint">서울시 안내 문구</span>
        <p>{place.message}</p>
      </div>
      <ForecastCard place={place} />
    </div>
  );
}
