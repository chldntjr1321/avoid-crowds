import districts from '@/data/generated/districts.json';
import placeList from '@/data/generated/places.json';

export interface MapQuery {
  gu: string | null;
  place: string | null;
}

const guNames = new Set(districts.map((district) => district.name));
export const SEOUL_GRAND_PARK_CODE = 'POI100';

export function getValidMapQuery({ gu, place }: MapQuery): MapQuery {
  // 서울대공원은 과천시라 자치구 없이 장소만 있는 주소를 허용
  if (!gu && place === SEOUL_GRAND_PARK_CODE) {
    return { gu: null, place };
  }
  // 자치구 이름이 없거나 목록에 없을 때
  if (!gu || !guNames.has(gu)) {
    return { gu: null, place: null };
  }
  // 장소 코드가 없거나 그 자치구 소속이 아닐 때
  const isValidPlaceCode = placeList.some(
    (p) => p.code === place && p.guName === gu,
  );
  if (!isValidPlaceCode) {
    return { gu, place: null };
  }

  return { gu, place };
}

export function getMapHref({ gu, place }: MapQuery): string {
  const params = new URLSearchParams();
  if (gu) {
    params.set('gu', gu);
  }
  if (place) {
    params.set('place', place);
  }
  const queryString = params.toString();

  return queryString ? `/?${queryString}` : '/';
}
