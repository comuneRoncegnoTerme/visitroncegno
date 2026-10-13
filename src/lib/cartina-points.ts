// Punti cliccabili della cartina illustrata di Fabio Vettori (edizione 2026).
// x e y sono percentuali sull'immagine /images/cartina/cartina-roncegno-1.webp
// e cadono accanto alle scritte già disegnate sull'illustrazione.
// L'ordine è quello del giro guidato.
// I testi `note` vengono dal retro della cartina stampata (edizione 2026).
// `match` serve a trovare la scheda corrispondente tra luoghi e percorsi di Directus.

export type CartinaGroup = "paese" | "montagna" | "dintorni";

export type CartinaPoint = {
  id: string;
  title: string;
  group: CartinaGroup;
  x: number;
  y: number;
  match?: string[];
  href?: string;
  /** Testo della guida ufficiale (retro della cartina), usato se Directus non ha una descrizione. */
  note?: string;
  /** Altitudine o dettaglio breve mostrato accanto al gruppo. */
  meta?: string;
};

export const CARTINA_GROUPS: Record<CartinaGroup, string> = {
  paese: "In paese",
  montagna: "In montagna",
  dintorni: "Nei dintorni",
};

export const CARTINA_POINTS: CartinaPoint[] = [
  { id: "mulino-angeli", title: "Mulino Angeli", group: "paese", x: 8.3, y: 65.4, href: "/musei/mulino-angeli", note: "Il vecchio mulino ospita la casa museo degli spaventapasseri, tra arte e tradizione contadina." },
  { id: "tor-tonda", title: "Tor Tonda", group: "paese", x: 14.5, y: 67.0, match: ["tor tonda", "torre tonda"] },
  { id: "marter", title: "Marter", group: "paese", x: 14.5, y: 57.4, match: ["marter"] },
  { id: "stazione", title: "Stazione di Roncegno Bagni-Marter", group: "paese", x: 16.5, y: 80.5, match: ["stazione"] },
  { id: "ciclabile", title: "Ciclabile della Valsugana", group: "dintorni", x: 32.5, y: 86.8, match: ["ciclabile"] },
  { id: "chiesa-santi-pietro-paolo", title: "Chiesa dei Santi Pietro e Paolo", group: "paese", x: 34.5, y: 45.0, match: ["pietro e paolo", "chiesa parrocchiale", "arcipretale"] },
  { id: "parco-terme", title: "Parco delle Terme", group: "paese", x: 30.0, y: 70.0, match: ["parco delle terme"], note: "Il parco storico delle terme, in centro al paese: alberi secolari e viali per una passeggiata tranquilla." },
  { id: "centro", title: "Il centro e il municipio", group: "paese", x: 58.8, y: 67.2, match: ["municipio", "centro storico", "piazza montebello"], href: "/luoghi" },
  { id: "centro-sportivo", title: "Centro sportivo comunale", group: "paese", x: 44.0, y: 82.6, match: ["centro sportivo", "campo sportivo"] },
  { id: "museo-musica", title: "Museo degli Strumenti Musicali Popolari", group: "paese", x: 79.5, y: 60.2, href: "/musei/museo-della-musica", note: "Strumenti musicali della tradizione popolare da tutto il mondo, accanto alla chiesetta di Santa Brigida." },
  { id: "chiesa-santa-brigida", title: "Chiesa di Santa Brigida", group: "paese", x: 85.8, y: 61.6, match: ["santa brigida", "s. brigida"] },
  { id: "arte-sella", title: "Arte Sella", group: "dintorni", x: 90.5, y: 84.7, match: ["arte sella"] },
  { id: "chiesa-sant-osvaldo", title: "Chiesa di Sant’Osvaldo", group: "montagna", x: 25.0, y: 40.2, match: ["osvaldo"], note: "Una delle chiese più antiche di Roncegno, in posizione panoramica sopra la valle." },
  { id: "cinque-valli", title: "Cinque Valli", group: "montagna", x: 27.3, y: 35.0, match: ["cinque valli", "5 valli"], note: "Una cascata in una gola nel bosco, che si raggiunge a piedi passando accanto alle vecchie miniere." },
  { id: "rifugio-erterle", title: "Rifugio Erterle", group: "montagna", x: 33.5, y: 32.9, match: ["erterle"], note: "Rifugio in una radura a Cinque Valli, comodo anche con i bambini. Cucina trentina." },
  { id: "rifugio-serot", title: "Rifugio Serot", group: "montagna", x: 44.5, y: 32.5, match: ["serot"], note: "Rifugio a 1.566 metri con cucina del posto e vista sulla valle; da qui partono le escursioni verso le cime del Lagorai.", meta: "1.566 m" },
  { id: "laghetto-prese", title: "Lago delle Prese", group: "montagna", x: 43.5, y: 29.0, match: ["prese"], note: "Piccolo lago alpino tra i boschi, adatto per un picnic. Molto bello in autunno, quando cambiano i colori." },
  { id: "monte-fravort", title: "Monte Fravort", group: "montagna", x: 35.5, y: 21.0, match: ["fravort"], note: "Escursione di media-alta difficoltà, con un’ampia vista sulla Valsugana e sulle Dolomiti di Brenta.", meta: "2.347 m" },
  { id: "gronlait", title: "Monte Gronlait", group: "montagna", x: 48.0, y: 16.8, match: ["gronlait"], note: "Itinerario lungo le creste, per escursionisti esperti. Spesso si sale insieme al Fravort.", meta: "2.383 m" },
  { id: "malga-trenca", title: "Malga Trenca", group: "montagna", x: 56.5, y: 28.0, match: ["trenca"], note: "Malga dell’alpeggio estivo: qui si possono comprare e assaggiare i formaggi della malga." },
  { id: "monte-cola", title: "Monte Cola", group: "montagna", x: 62.8, y: 14.3, match: ["monte cola"], note: "Una camminata classica del Lagorai, tra ampi prati, con vista in tutte le direzioni.", meta: "2.222 m" },
  { id: "panchina-gigante", title: "Panchina gigante della Trenca", group: "montagna", x: 67.0, y: 26.6, match: ["panchina"], note: "Una grande panchina vicino a Malga Trenca, con vista dall’alto sulla Valsugana. Molti si fermano per una foto." },
  { id: "lago-colo", title: "Lago Colo", group: "montagna", x: 76.0, y: 32.9, match: ["lago colo"] },
];
