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
  { id: "mulino-angeli", title: "Mulino Angeli", group: "paese", x: 8.3, y: 65.4, href: "/musei/mulino-angeli", note: "Ospitato nel Mulino Angeli, un percorso unico che celebra lo spaventapasseri tra arte, creatività e memoria della tradizione contadina." },
  { id: "tor-tonda", title: "Tor Tonda", group: "paese", x: 14.5, y: 67.0, match: ["tor tonda", "torre tonda"] },
  { id: "marter", title: "Marter", group: "paese", x: 14.5, y: 57.4, match: ["marter"] },
  { id: "stazione", title: "Stazione di Roncegno Bagni-Marter", group: "paese", x: 16.5, y: 80.5, match: ["stazione"] },
  { id: "ciclabile", title: "Ciclabile della Valsugana", group: "dintorni", x: 32.5, y: 86.8, match: ["ciclabile"] },
  { id: "chiesa-santi-pietro-paolo", title: "Chiesa dei Santi Pietro e Paolo", group: "paese", x: 34.5, y: 45.0, match: ["pietro e paolo", "chiesa parrocchiale", "arcipretale"] },
  { id: "parco-terme", title: "Parco delle Terme", group: "paese", x: 30.0, y: 70.0, match: ["parco delle terme"], note: "Oasi secolare nel cuore del paese, ideale per passeggiate rilassanti e percorsi legati al benessere termale." },
  { id: "centro", title: "Il centro e il municipio", group: "paese", x: 58.8, y: 67.2, match: ["municipio", "centro storico", "piazza montebello"], href: "/luoghi" },
  { id: "centro-sportivo", title: "Centro sportivo comunale", group: "paese", x: 44.0, y: 82.6, match: ["centro sportivo", "campo sportivo"] },
  { id: "museo-musica", title: "Museo degli Strumenti Musicali Popolari", group: "paese", x: 79.5, y: 60.2, href: "/musei/museo-della-musica", note: "Suggestiva collezione nei pressi dell’antica chiesetta, con affascinanti strumenti musicali della tradizione popolare da tutto il mondo." },
  { id: "chiesa-santa-brigida", title: "Chiesa di Santa Brigida", group: "paese", x: 85.8, y: 61.6, match: ["santa brigida", "s. brigida"] },
  { id: "arte-sella", title: "Arte Sella", group: "dintorni", x: 90.5, y: 84.7, match: ["arte sella"] },
  { id: "chiesa-sant-osvaldo", title: "Chiesa di Sant’Osvaldo", group: "montagna", x: 25.0, y: 40.2, match: ["osvaldo"], note: "Anima storica e spirituale del paese, merita una visita per l’architettura e la posizione dominante sulla valle." },
  { id: "cinque-valli", title: "Cinque Valli", group: "montagna", x: 27.3, y: 35.0, match: ["cinque valli", "5 valli"], note: "Suggestivo salto d’acqua in una gola selvaggia, raggiungibile nel bosco costeggiando antiche aree minerarie." },
  { id: "rifugio-erterle", title: "Rifugio Erterle", group: "montagna", x: 33.5, y: 32.9, match: ["erterle"], note: "Situato in una splendida radura in località Cinque Valli, è ideale per famiglie e amanti della cucina tipica trentina." },
  { id: "rifugio-serot", title: "Rifugio Serot", group: "montagna", x: 44.5, y: 32.5, match: ["serot"], note: "Terrazza panoramica a 1.566 metri con ottima cucina locale, base perfetta per le alte vette del Lagorai.", meta: "1.566 m" },
  { id: "laghetto-prese", title: "Lago delle Prese", group: "montagna", x: 43.5, y: 29.0, match: ["prese"], note: "“Lo smeraldo del Lagorai”, un incantevole specchio d’acqua alpino ideale per picnic, relax e foliage autunnale." },
  { id: "monte-fravort", title: "Monte Fravort", group: "montagna", x: 35.5, y: 21.0, match: ["fravort"], note: "Escursione panoramica di medio-alta difficoltà con vista idilliaca sulla Valsugana e sulle Dolomiti di Brenta.", meta: "2.347 m" },
  { id: "gronlait", title: "Monte Gronlait", group: "montagna", x: 48.0, y: 16.8, match: ["gronlait"], note: "Trekking selvaggio lungo creste d’alta quota, per escursionisti esperti (spesso concatenato al Fravort).", meta: "2.383 m" },
  { id: "malga-trenca", title: "Malga Trenca", group: "montagna", x: 56.5, y: 28.0, match: ["trenca"], note: "Il cuore dell’alpeggio estivo, dove acquistare e gustare prodotti caseari genuini fatti al momento." },
  { id: "monte-cola", title: "Monte Cola", group: "montagna", x: 62.8, y: 14.3, match: ["monte cola"], note: "Camminata classica e appagante nel cuore del Lagorai, tra ampi prati e panorami a 360 gradi.", meta: "2.222 m" },
  { id: "panchina-gigante", title: "Panchina gigante della Trenca", group: "montagna", x: 67.0, y: 26.6, match: ["panchina"], note: "Sosta d’obbligo super panoramica vicino a Malga Trenca per foto divertenti e una vista dall’alto sulla Valsugana." },
  { id: "lago-colo", title: "Lago Colo", group: "montagna", x: 76.0, y: 32.9, match: ["lago colo"] },
];
