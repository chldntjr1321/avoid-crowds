import { CONGEST_LEVELS, type CongestLevel, type Place } from './place';

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
