export type PlaceType = "heritage" | "museum" | "institution" | "parking" | "station" | "food" | "sleep" | "service" | "nature" | "other";

export type PlaceDetailMode = "internal" | "compact" | "redirect" | "external";

export type PlaceDetailInput = {
  slug: string;
  title?: string | null;
  place_type?: PlaceType | null;
  detail_mode?: PlaceDetailMode | null;
  canonical_path?: string | null;
  external_detail_url?: string | null;
};

export function placeHref(place: PlaceDetailInput) {
  const canonicalPath = place.canonical_path?.trim();
  const externalUrl = place.external_detail_url?.trim();

  if (place.detail_mode === "redirect" && canonicalPath?.startsWith("/")) return canonicalPath;
  if (place.detail_mode === "external" && /^https?:\/\//i.test(externalUrl ?? "")) return externalUrl as string;

  const title = place.title ?? "";
  if (/mulino\s+angeli/i.test(title)) return "/musei/mulino-angeli";
  if (/strumenti\s+musicali|museo\s+della\s+musica/i.test(title)) return "/musei/museo-della-musica";

  return `/luoghi/${place.slug}`;
}

export function isCompactPlace(place: PlaceDetailInput) {
  return place.detail_mode === "compact" || place.place_type === "parking" || place.place_type === "station";
}

export function placeEditorialHeading(place: PlaceDetailInput) {
  switch (place.place_type) {
    case "museum": return "Cosa c’è da vedere";
    case "institution": return "Il luogo";
    case "parking": return "Informazioni per la sosta";
    case "station": return "Informazioni per il viaggio";
    case "food": return "La cucina";
    case "sleep": return "La struttura";
    case "heritage": return "Storia e cosa vedere";
    case "nature": return "Il luogo";
    case "service": return "Informazioni utili";
    default: return "Il luogo";
  }
}
