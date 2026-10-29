// Punti di ricarica e-bike dell'opuscolo InfoRoncegno 2026 ("Scopri Roncegno con la tua e-bike!").
// I numeri sono quelli della mappa stampata (public/images/inforoncegno/mappa-ricarica-e-bike.jpg).
// Coordinate da OpenStreetMap; per Via San Giuseppe è il punto della via, non della colonnina.
export type EbikePoint = {
  number: number;
  title: string;
  /** Scheda del luogo in Directus: il link compare solo se la scheda è pubblicata. */
  placeSlug: string;
  note: string;
  latitude: number;
  longitude: number;
};

export const EBIKE_POINTS: EbikePoint[] = [
  {
    number: 1,
    title: "Malga Trenca",
    placeSlug: "malga-trenca",
    note: "In quota, a 10 minuti a piedi dalla Panchina Gigante.",
    latitude: 46.078144,
    longitude: 11.391479,
  },
  {
    number: 2,
    title: "Ristorante Bar alle Pozze",
    placeSlug: "ristorante-bar-alle-pozze",
    note: "In località Pozze, dove parte il sentiero 372B per il Lago delle Prese.",
    latitude: 46.068395,
    longitude: 11.380604,
  },
  {
    number: 3,
    title: "Rifugio Erterle",
    placeSlug: "rifugio-erterle",
    note: "Partenza del Sentiero Cinque Valli e del trekking al Monte Fravort.",
    latitude: 46.05263,
    longitude: 11.3596,
  },
  {
    number: 4,
    title: "Mulino Angeli",
    placeSlug: "mulino-angeli-casa-degli-spaventapasseri",
    note: "A Marter, lungo la ciclabile della Valsugana: una sosta al museo mentre la batteria si ricarica.",
    latitude: 46.03318,
    longitude: 11.39301,
  },
  {
    number: 5,
    title: "Via San Giuseppe",
    placeSlug: "ricarica-e-bike-via-san-giuseppe",
    note: "Nel centro di Roncegno Terme.",
    latitude: 46.05162,
    longitude: 11.409851,
  },
];
