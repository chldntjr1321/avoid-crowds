import 'server-only';
import type { SeoulApiResponse, SeoulPlaceRaw } from './types';

export async function fetchPlace(code: string): Promise<SeoulPlaceRaw> {
  const apiKey = process.env.SEOUL_API_KEY;
  if (!apiKey) {
    throw new Error(`환경변수 SEOUL_API_KEY가 설정되지 않았습니다.`);
  }

  const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata_ppltn/1/5/${code}`;
  let res: Response;

  try {
    res = await fetch(url);
  } catch (error) {
    throw new Error(`${code} 서울시 API 연결 실패`, { cause: error });
  }

  if (!res.ok) {
    throw new Error(`${code}에 대한 HTTP 오류: ${res.status}`);
  }

  const data: SeoulApiResponse = await res.json();
  // API 응답 실패 시
  if (!('RESULT' in data)) {
    throw new Error(
      `${code} 서울시 API 오류: ${data['RESULT.CODE']} ${data['RESULT.MESSAGE']}`,
    );
  }

  // API 응답 모양 자체는 성공이지만 결과 코드가 INFO-000이 아닌 경우
  if (data.RESULT['RESULT.CODE'] !== 'INFO-000') {
    throw new Error(
      `${code} 서울시 API 오류: ${data.RESULT['RESULT.CODE']} ${data.RESULT['RESULT.MESSAGE']}`,
    );
  }

  return data['SeoulRtd.citydata_ppltn'][0];
}
