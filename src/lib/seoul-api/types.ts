export interface SeoulForecastRaw {
  FCST_TIME: string;
  FCST_CONGEST_LVL: string;
  FCST_PPLTN_MIN: string;
  FCST_PPLTN_MAX: string;
}

export interface SeoulPlaceRaw {
  AREA_NM: string;
  AREA_CD: string;
  AREA_CONGEST_LVL: string;
  AREA_CONGEST_MSG: string;
  AREA_PPLTN_MIN: string;
  AREA_PPLTN_MAX: string;
  MALE_PPLTN_RATE: string;
  FEMALE_PPLTN_RATE: string;
  PPLTN_RATE_0: string;
  PPLTN_RATE_10: string;
  PPLTN_RATE_20: string;
  PPLTN_RATE_30: string;
  PPLTN_RATE_40: string;
  PPLTN_RATE_50: string;
  PPLTN_RATE_60: string;
  PPLTN_RATE_70: string;
  RESNT_PPLTN_RATE: string;
  NON_RESNT_PPLTN_RATE: string;
  REPLACE_YN: string;
  PPLTN_TIME: string;
  FCST_YN: string;
  FCST_PPLTN: SeoulForecastRaw[];
}

export interface SeoulApiResponse {
  'SeoulRtd.citydata_ppltn': SeoulPlaceRaw[];
  RESULT: {
    'RESULT.CODE': string;
    'RESULT.MESSAGE': string;
  };
}
