import { getDirectusImageUrl, getMapPlaces } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";

// Luoghi con coordinate, nel formato che si aspetta il componente HomeMap.
export async function getHomeMapPlaces() {
  const [mapPlaces, allPlaces] = await Promise.all([getMapPlaces(), getEditorialList("places")]);
  const editorialById = new Map(allPlaces.map((place) => [place.id, place]));

  return mapPlaces
    .filter((place) => place.latitude != null && place.longitude != null)
    .map((place) => {
      const editorial = editorialById.get(place.id);
      return {
        id: place.id,
        title: place.title,
        slug: place.slug,
        summary: place.summary,
        imageUrl: getDirectusImageUrl(place.image, 800),
        latitude: place.latitude as number,
        longitude: place.longitude as number,
        mapLabel: place.map_label,
        mapIcon: place.map_icon,
        placeType: editorial?.place_type,
        detailMode: editorial?.detail_mode,
        canonicalPath: editorial?.canonical_path,
        externalDetailUrl: editorial?.external_detail_url,
      };
    });
}
