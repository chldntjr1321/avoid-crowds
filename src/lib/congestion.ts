import {
  CONGEST_LEVELS,
  type PopulationRange,
  type CongestLevel,
  type Place,
  type Forecast,
} from '@/lib/place';

// '여유','붐빔' 등의 혼잡도를 인덱스를 활용해 숫자(score)로 변환하는 함수
export function levelToScore(level: CongestLevel): number {
  return CONGEST_LEVELS.indexOf(level) + 1;
}

// 혼잡도를 숫자로 변환한 것을 다시 '여유', '붐빔' 등으로 변환하는 함수
function scoreToLevel(score: number): CongestLevel {
  if (!Number.isInteger(score) || score >= 5 || score <= 0) {
    throw new Error(`${score} 혼잡도 레벨은 지원하지 않습니다.`);
  }

  return CONGEST_LEVELS[score - 1];
}

// 서울시의 지역구에 따른 장소를 모아서 객체 하나로 반환하는 함수
export function groupByGu(places: Place[]): Record<string, Place[]> {
  const groups: Record<string, Place[]> = {};

  for (const place of places) {
    groups[place.guName] = groups[place.guName] ?? [];
    groups[place.guName].push(place);
  }

  return groups;
}

// 각 지역구의 장소들의 혼잡도 평균을 구하는 함수
export function getGuLevels(places: Place[]): Record<string, CongestLevel> {
  const groups = groupByGu(places);
  const averageGroups: Record<string, CongestLevel> = {};

  for (const [guName, guPlaces] of Object.entries(groups)) {
    let total = 0;
    for (const guPlace of guPlaces) {
      total += levelToScore(guPlace.level);
    }
    const levelAverage = Math.round(total / guPlaces.length);
    averageGroups[guName] = scoreToLevel(levelAverage);
  }
  return averageGroups;
}

export function sortByMostCrowded(places: Place[]): Place[] {
  return [...places].sort((a, b) => {
    const scoreA = levelToScore(a.level);
    const scoreB = levelToScore(b.level);

    return scoreB - scoreA
      ? scoreB - scoreA
      : b.population.max - a.population.max;
  });
}

type BadgeVariant = 'free' | 'normal' | 'busyish' | 'busy';
const LEVEL_BADGE_VARIANT: Record<CongestLevel, BadgeVariant> = {
  여유: 'free',
  보통: 'normal',
  '약간 붐빔': 'busyish',
  붐빔: 'busy',
};

// 혼잡도 단계 -> Badge variant 이름 변환 함수
export function getBadgeVariant(level: CongestLevel): BadgeVariant {
  return LEVEL_BADGE_VARIANT[level];
}

// 인구수 범위를 받아서 가독성 좋게 리턴해주는 함수
export function formatPopulation({ min, max }: PopulationRange): string {
  if (min < 10000) {
    const formattedMin = min.toLocaleString('ko-KR');
    const formattedMax = max.toLocaleString('ko-KR');

    return `약 ${formattedMin}~${formattedMax}명`;
  }
  const formattedMin = (min / 10000).toFixed(1);
  const formattedMax = (max / 10000).toFixed(1);

  return `약 ${formattedMin}~${formattedMax}만명`;
}

// 시각 변환 함수 (2026-11-09 02:00 형태의 시각을 대상으로)
export function formatTime(currentTime: string, targetTime: string): string {
  let timeText = '';
  if (targetTime.split(' ')[0] !== currentTime.split(' ')[0]) {
    timeText += '내일 ';
  }
  const splitTime = targetTime.split(' ')[1];
  timeText += Number(splitTime.split(':')[0]);

  return `${timeText}시`;
}

// 예측 요약 문장을 반환해주는 함수
export function getForecastSummary(forecastData: Forecast[]): string {
  const current = forecastData[0];
  const changedForecast = forecastData.find((d) => d.level !== current.level);
  if (!changedForecast) {
    return '당분간은 지금과 비슷해요';
  }
  if (levelToScore(current.level) > levelToScore(changedForecast.level)) {
    return `${formatTime(current.time, changedForecast.time)}부터 한산해져요`;
  }

  return `${formatTime(current.time, changedForecast.time)}부터 혼잡해져요`;
}
