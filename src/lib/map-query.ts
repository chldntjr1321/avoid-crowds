import districts from '@/data/generated/districts.json';
import placeList from '@/data/generated/places.json';

interface MapQuery {
  gu: string | null;
  place: string | null;
}

const guNames = new Set(districts.map((district) => district.name));

export function getValidMapQuery({ gu, place }: MapQuery): MapQuery {
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
