import { CONGEST_LEVELS, type CongestLevel, type Place } from '../place';
import type { SeoulPlaceRaw } from './types';

// text가 CongestLevel 타입인지 확인하는 함수
function isCongestLevel(text: string): text is CongestLevel {
  return (CONGEST_LEVELS as readonly string[]).includes(text);
}

// isCongestLevel 함수의 결과를 바탕으로 text가 CongestLevel 타입이면 그대로 반환
function toCongestLevel(text: string): CongestLevel {
  if (isCongestLevel(text)) {
    return text;
  }
  throw new Error(`올바르지 않은 혼잡도 레벨: ${text}`);
}

export function toPlace(raw: SeoulPlaceRaw, guName: string): Place {
  return {
    code: raw.AREA_CD,
    name: raw.AREA_NM,
    guName: guName,
    level: toCongestLevel(raw.AREA_CONGEST_LVL),
    message: raw.AREA_CONGEST_MSG,
    population: {
      min: Number(raw.AREA_PPLTN_MIN),
      max: Number(raw.AREA_PPLTN_MAX),
    },
    measuredAt: raw.PPLTN_TIME,
    forecast: raw.FCST_PPLTN.map((item) => ({
      time: item.FCST_TIME,
      level: toCongestLevel(item.FCST_CONGEST_LVL),
      min: Number(item.FCST_PPLTN_MIN),
      max: Number(item.FCST_PPLTN_MAX),
    })),
  };
}
