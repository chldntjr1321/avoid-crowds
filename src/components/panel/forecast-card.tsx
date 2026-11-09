import { getForecastSummary } from '@/lib/congestion';
import type { Forecast, Place } from '@/lib/place';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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

  return (
    <div className="flex flex-col gap-3 border-t border-border-soft pt-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] leading-tight text-muted-foreground tabular-nums">
          12시간 예측
        </span>
        <span className="text-base leading-tight font-bold">
          {getForecastSummary(forecastData)}
        </span>
        <span className="text-xs text-muted-foreground">
          점 색 = 해당 시각 혼잡도
        </span>
      </div>

      {/* 실제 차트 */}
      <ComposedChart
        data={chartData}
        responsive
        style={{ width: '100%', height: 214 }}
      >
        <CartesianGrid vertical={false} /> {/* 배경 가로선 */}
        <XAxis dataKey="time" /> {/* 가로축: 각 칸의 time 값을 라벨로 */}
        <YAxis /> {/* 세로축: 숫자 눈금은 자동 계산 */}
        <Area dataKey="range" /> {/* 회색 띠 */}
        <Line dataKey="population" /> {/* 선 + 점 */}
      </ComposedChart>
    </div>
  );
}
