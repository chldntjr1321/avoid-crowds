import {
  formatHour,
  getBadgeVariant,
  getForecastSummary,
} from '@/lib/congestion';
import type { Forecast, Place } from '@/lib/place';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

interface ForecastCardProps {
  place: Place;
}

export default function ForecastCard({ place }: ForecastCardProps) {
  const currentData: Forecast = {
    time: place.measuredAt,
    level: place.level,
    min: place.population.min,
    max: place.population.max,
  };
  const forecastData = [currentData, ...place.forecast];
  const chartData = forecastData.map((item) => {
    return {
      ...item,
      range: [item.min, item.max],
      population: (item.min + item.max) / 2,
    };
  });
  const tomorrow = forecastData.find(
    (data) => data.time.split(' ')[0] !== place.measuredAt.split(' ')[0],
  );

  return (
    <div className="flex flex-col gap-3 border-t border-border-soft pt-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] leading-tight text-muted-foreground tabular-nums">
          12시간 예측
        </span>
        <span className="text-lg leading-tight font-bold">
          {getForecastSummary(forecastData)}
        </span>
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="flex gap-px" aria-hidden>
              <span className="size-1.5 rounded-full border border-foreground bg-congestion-free" />
              <span className="size-1.5 rounded-full border border-foreground bg-congestion-normal" />
              <span className="size-1.5 rounded-full border border-foreground bg-congestion-busy" />
            </span>
            그 시각 예측 혼잡도
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 bg-border-soft/80" aria-hidden />
            예측 인구 범위
          </span>
        </p>
      </div>

      {/* 실제 차트 */}
      <ComposedChart
        data={chartData}
        responsive
        style={{ width: '100%', height: 214 }}
        margin={{ right: 12 }}
      >
        {/* 배경 가로선 */}
        <CartesianGrid vertical={false} stroke="var(--color-skeleton)" />
        {/* 가로축: 각 칸의 time 값을 라벨로 */}
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          interval={2}
          tickFormatter={(value) =>
            value === place.measuredAt ? '지금' : formatHour(value)
          }
          tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }}
        />
        {/* 세로축: 숫자 눈금은 자동 계산 */}
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) =>
            value < 10000
              ? value.toLocaleString('ko-KR')
              : `${Number((value / 10000).toFixed(1))}만`
          }
          tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }}
        />
        {/* 회색 띠 */}
        <Area
          dataKey="range"
          stroke="none"
          fill="var(--color-border-soft)"
          fillOpacity={0.8}
        />
        {tomorrow && (
          <ReferenceLine
            x={tomorrow.time}
            stroke="var(--color-map-line)"
            strokeDasharray="3 3"
            label={{
              value: '내일',
              position: 'insideTopLeft',
              fontSize: 10,
              fill: 'var(--color-text-subtle)',
            }}
          />
        )}
        {/* 선 + 점 */}
        <Line
          dataKey="population"
          stroke="var(--color-foreground)"
          strokeWidth={1.4}
          dot={(props) => (
            <circle
              cx={props.cx}
              cy={props.cy}
              r={props.index === 0 ? 4.5 : 3.2}
              fill={
                props.index === 0
                  ? 'var(--color-surface-white)'
                  : `var(--color-congestion-${getBadgeVariant(props.payload.level)})`
              }
              stroke="var(--color-foreground)"
              strokeWidth={props.index === 0 ? 1.4 : 0.9}
            />
          )}
        />
      </ComposedChart>
    </div>
  );
}
