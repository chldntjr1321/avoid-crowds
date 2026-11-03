import { getPlaces } from '@/lib/seoul-api/get-places';

export async function GET() {
  const places = await getPlaces();

  return Response.json(places);
}
