import { getUpcomingEvents, type EventItem } from "@/lib/directus";
import { getEditorialList, type EditorialItem } from "@/lib/editorial";
import { getHomeMapPlaces } from "@/lib/map-places";

// I due musei hanno pagine proprie, ma i dati pratici (orari, contatti, coordinate, accesso)
// vengono dalla loro scheda nella collection `places`, modificabile dal Content Hub.
// I valori qui sotto valgono solo finché il campo corrispondente in Directus è vuoto.

export type MuseumId = "mulino-angeli" | "museo-della-musica";

type MuseumFallback = {
  id: MuseumId;
  path: string;
  title: string;
  area: string;
  matches: RegExp;
  address: string;
  phones: string[];
  email: string;
  website: string | null;
  openingHours: string;
  ticketInfo: string;
  visitDuration: string | null;
  servicesNotes: string | null;
  image: string;
};

const FALLBACKS: Record<MuseumId, MuseumFallback> = {
  "mulino-angeli": {
    id: "mulino-angeli",
    path: "/musei/mulino-angeli",
    title: "Mulino Angeli",
    area: "Marter",
    matches: /mulino\s+angeli|spaventapasseri/i,
    address: "Via San Silvestro 2, Marter · Roncegno Terme",
    phones: ["+39 345 871 4426"],
    email: "polomusealeroncegno@gmail.com",
    website: null,
    // Orari 2026 pubblicati dal museo.
    openingHours: [
      "18/04/2026 – 14/06/2026: sab, dom 09:00–12:00",
      "16/06/2026 – 13/09/2026: mar, gio 15:30–18:30; sab, dom 09:00–12:00",
      "19/09/2026 – 25/10/2026: sab, dom 09:00–12:00",
      "Per gruppi e visite speciali verificare disponibilità e aperture prima della visita.",
    ].join("\n"),
    ticketInfo: "Offerta libera",
    visitDuration: "Circa un’ora",
    servicesNotes: null,
    image: "/images/musei/mulino-angeli/hero.jpg",
  },
  "museo-della-musica": {
    id: "museo-della-musica",
    path: "/musei/museo-della-musica",
    title: "Museo degli Strumenti Musicali Popolari",
    area: "Santa Brigida",
    matches: /strumenti\s+musicali|museo\s+della\s+musica/i,
    address: "Località Santa Brigida · Roncegno Terme",
    phones: ["+39 345 871 4426", "+39 340 770 1815"],
    email: "museodellamusicaroncegno@gmail.com",
    website: "https://www.museodellamusicaroncegno.it/",
    openingHours:
      "Le aperture variano durante l’anno e in inverno il museo apre su prenotazione: prima della visita conviene verificare il calendario aggiornato.",
    ticketInfo: "Ingresso libero · visite guidate su prenotazione con un piccolo contributo",
    visitDuration: null,
    servicesNotes: null,
    image: "/images/musei/museo-della-musica/hero.jpg",
  },
};

export type Museum = {
  id: MuseumId;
  path: string;
  title: string;
  area: string;
  image: string;
  /** Id della scheda in Directus, se esiste. */
  placeId: number | null;
  address: string;
  phones: string[];
  email: string | null;
  website: string | null;
  bookingUrl: string | null;
  openingHours: string;
  ticketInfo: string;
  visitDuration: string | null;
  servicesNotes: string | null;
  restrictionsNotes: string | null;
  accessNotes: string | null;
  parkingNotes: string | null;
  publicTransportNotes: string | null;
  latitude: number | null;
  longitude: number | null;
};

function text(value: string | null | undefined) {
  const trimmed = value?.replace(/<[^>]+>/g, "").trim();
  return trimmed ? trimmed : null;
}

function splitPhones(value: string | null | undefined) {
  const phones = text(value)?.split(/\s*(?:[,;/]|\so\s)\s*/).map((phone) => phone.trim()).filter(Boolean);
  return phones?.length ? phones : null;
}

function findPlace(places: EditorialItem[], fallback: MuseumFallback) {
  return (
    places.find((place) => place.canonical_path?.trim() === fallback.path) ??
    places.find((place) => fallback.matches.test(place.title) && (place.place_type ?? "museum") === "museum") ??
    null
  );
}

function resolve(fallback: MuseumFallback, place: EditorialItem | null): Museum {
  return {
    id: fallback.id,
    path: fallback.path,
    title: fallback.title,
    area: fallback.area,
    image: fallback.image,
    placeId: place?.id ?? null,
    address: text(place?.address) ?? fallback.address,
    phones: splitPhones(place?.phone) ?? fallback.phones,
    email: text(place?.email) ?? fallback.email,
    website: text(place?.website_url) ?? fallback.website,
    bookingUrl: text(place?.booking_url),
    openingHours: text(place?.opening_hours) ?? fallback.openingHours,
    ticketInfo: text(place?.ticket_info) ?? fallback.ticketInfo,
    visitDuration: text(place?.visit_duration) ?? fallback.visitDuration,
    servicesNotes: text(place?.services_notes) ?? fallback.servicesNotes,
    restrictionsNotes: text(place?.restrictions_notes),
    accessNotes: text(place?.access_notes),
    parkingNotes: text(place?.parking_notes),
    publicTransportNotes: text(place?.public_transport_notes),
    latitude: typeof place?.latitude === "number" ? place.latitude : null,
    longitude: typeof place?.longitude === "number" ? place.longitude : null,
  };
}

export async function getMuseums(): Promise<Record<MuseumId, Museum>> {
  const places = await getEditorialList("places");
  return {
    "mulino-angeli": resolve(FALLBACKS["mulino-angeli"], findPlace(places, FALLBACKS["mulino-angeli"])),
    "museo-della-musica": resolve(FALLBACKS["museo-della-musica"], findPlace(places, FALLBACKS["museo-della-musica"])),
  };
}

export async function getMuseum(id: MuseumId) {
  return (await getMuseums())[id];
}

/** Prossimi eventi che si svolgono al museo (luogo collegato o nome del luogo). */
export async function getMuseumEvents(museum: Museum): Promise<EventItem[]> {
  const matches = FALLBACKS[museum.id].matches;
  const events = await getUpcomingEvents(60);
  return events
    .filter((event) => matches.test(event.place?.title ?? "") || matches.test(event.location_name ?? ""))
    .slice(0, 4);
}

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const NEARBY_KM = 1.5;

/** Il museo e i luoghi della mappa a breve distanza, per la mappa "Nei dintorni". */
export async function getMuseumNearby(museum: Museum) {
  if (museum.latitude === null || museum.longitude === null) return [];
  const origin = { latitude: museum.latitude, longitude: museum.longitude };
  const places = await getHomeMapPlaces();
  return places
    .map((place) => ({ place, distance: distanceKm(origin, place) }))
    .filter(({ place, distance }) => place.id === museum.placeId || distance <= NEARBY_KM)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 12)
    .map(({ place }) => place);
}

export function museumJsonLd(museum: Museum, description: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Museum",
    name: museum.title,
    description,
    url: `${siteUrl}${museum.path}`,
    image: [`${siteUrl}${museum.image}`],
    address: {
      "@type": "PostalAddress",
      streetAddress: museum.address,
      addressLocality: "Roncegno Terme",
      addressRegion: "TN",
      postalCode: "38050",
      addressCountry: "IT",
    },
    telephone: museum.phones[0],
    email: museum.email ?? undefined,
    sameAs: museum.website ? [museum.website] : undefined,
    geo:
      museum.latitude !== null && museum.longitude !== null
        ? { "@type": "GeoCoordinates", latitude: museum.latitude, longitude: museum.longitude }
        : undefined,
  };
}
