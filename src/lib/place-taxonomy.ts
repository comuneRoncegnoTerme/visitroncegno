export type PlaceCategory = "places" | "food" | "sleep" | "services";

type PlaceTaxonomyInput = {
  map_icon?: string | null;
  map_label?: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("it-IT");
}

export function placeCategory(place: PlaceTaxonomyInput): PlaceCategory {
  const icon = normalize(place.map_icon);

  if (icon === "food") return "food";
  if (icon === "sleep") return "sleep";
  if (icon === "parking" || icon === "service") return "services";

  const label = normalize(place.map_label);

  if (["ristor", "pizzer", "bar", "oster", "trattor", "enotec", "mangiare", "locale"].some((term) => label.includes(term))) {
    return "food";
  }

  if (["hotel", "b&b", "bed", "agritur", "allogg", "ospital", "dormire", "appartament"].some((term) => label.includes(term))) {
    return "sleep";
  }

  if (["parchegg", "servizio", "info", "farmacia", "stazione"].some((term) => label.includes(term))) {
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
