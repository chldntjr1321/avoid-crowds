export type CongestLevel = '여유' | '보통' | '약간 붐빔' | '붐빔';

export interface PopulationRange {
  min: number;
  max: number;
}

export interface Forecast extends PopulationRange {
  time: string;
  level: CongestLevel;
}

export interface Place {
  code: string; // AREA_CD, 예: POI009
  name: string; // AREA_NM
  guName: string; // 변환 스크립트가 정한 소속 구 (서울대공원만 '과천시')
  level: CongestLevel; // AREA_CONGEST_LVL
  message: string; // AREA_CONGEST_MSG
  population: PopulationRange; // AREA_PPLTN_MIN, AREA_PPLTN_MAX
  measuredAt: string; // PPLTN_TIME, 화면에 "14:05 기준"으로 표시
  forecast: Forecast[]; // 12개
}
