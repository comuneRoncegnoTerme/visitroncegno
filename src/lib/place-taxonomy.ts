import type { PlaceType } from "@/lib/place-detail";

export type PlaceCategory = "places" | "food" | "sleep" | "services";

type PlaceTaxonomyInput = {
  place_type?: PlaceType | null;
  map_icon?: string | null;
  map_label?: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("it-IT");
}

export function placeCategory(place: PlaceTaxonomyInput): PlaceCategory {
  if (place.place_type === "food") return "food";
  if (place.place_type === "sleep") return "sleep";
  if (["parking", "station", "service", "institution"].includes(place.place_type ?? "")) return "services";

  const icon = normalize(place.map_icon);

  if (icon === "food") return "food";
  if (icon === "sleep") return "sleep";
  if (icon === "parking" || icon === "service") return "services";

  const label = normalize(place.map_label);

  if (["ristor", "pizzer", "bar", "oster", "trattor", "enotec", "mangiare", "locale"].some((term) => label.includes(term))) {
    return "food";
  }

  if (["hotel", "b&b", "bed", "agritur", "allogg", "ospital", "dormire", "appartament", "campegg"].some((term) => label.includes(term))) {
    return "sleep";
  }

  if (["parchegg", "servizio", "info", "farmacia", "stazione", "municip", "ufficio", "trasporto"].some((term) => label.includes(term))) {
    return "services";
  }

  return "places";
}

export function isEatingPlace(place: PlaceTaxonomyInput) {
  return placeCategory(place) === "food";
}

export function isSleepingPlace(place: PlaceTaxonomyInput) {
  return placeCategory(place) === "sleep";
}

export function isServicePlace(place: PlaceTaxonomyInput) {
  return placeCategory(place) === "services";
}
