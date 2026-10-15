// Progetto "I Sentieri di Roncegno tra storia e tradizione" (PSR 2014–2020, GAL Trentino Orientale, Azione 7.5).
// Due itinerari con pannelli e QR sul territorio. Numeri e indirizzi dei pannelli dal gestionale QR (data/qr-codes.json).

export type ProjectPanel = { numbers: string; title: string; href: string };

export type ProjectItinerary = {
  id: string;
  title: string;
  routeHref: string;
  summary: string;
  facts: string[];
  panels: ProjectPanel[];
};

const panel = (numbers: string, title: string, slug: string): ProjectPanel => ({
  numbers,
  title,
  href: `/it/sentieri/${slug}`,
});

export const SENTIERI_ITINERARIES: ProjectItinerary[] = [
  {
    id: "castagno",
    title: "Circuito del Castagno",
    routeHref: "/percorsi/circuito-del-castagno",
    summary:
      "Lungo i sentieri e le stradine sopra l’abitato di Roncegno: la coltura dei castagneti, le tradizioni legate ai masi e la storia delle acque termali.",
    facts: ["Circa 11 km", "Tre anelli"],
    panels: [
      { numbers: "01–03", title: "Il circuito del Castagno", href: "/percorsi/circuito-del-castagno" },
      panel("04", "Le fonti", "le-fonti-2-1"),
      panel("05", "Le acque termali", "acque-termali-2-2"),
      panel("06–08", "Il castagno nella storia e nelle tradizioni locali", "il-castagno-nella-storia-3-1"),
      panel("09–10", "Aspetti botanici ed ecosistema", "aspetti-botanici-3-2"),
      panel("11–13", "Utilizzo delle castagne nell’alimentazione", "utilizzo-delle-castagne-3-3"),
      panel("14–15", "La conservazione dei castagneti", "conservazione-castagneti-3-4"),
      panel("17", "Maso Ròneri", "maso-roneri-5-1"),
      panel("18", "Maso Bèbberi", "maso-bebberi-5-2"),
      panel("19", "Maso Rozza", "maso-rozza-5-3"),
      panel("20", "Maso Postai", "maso-postai-5-4"),
      panel("21", "Maso Montibèlleri", "maso-montibelleri-5-5"),
      panel("23", "Storia delle terme di Roncegno", "storia-terme-roncegno-6"),
    ],
  },
  {
    id: "cinque-valli",
    title: "Sentiero Cinque Valli",
    routeHref: "/percorsi/sentiero-cinque-valli",
    summary:
      "In quota, con partenza e arrivo a Erterle: gli ambienti naturali, le vecchie miniere, la Grande Guerra e i segni della tempesta Vaia.",
    facts: ["Anello di circa 6,5 km", "Partenza da Erterle, 1.442 m"],
    panels: [
      panel("16", "La torbiera di Cinque Valli", "torbiera-di-cinque-valli-4"),
      panel("24", "La flora", "flora-7-1"),
      panel("25", "La fauna", "fauna-7-2"),
      panel("26–27", "La miniera di Cinque Valli", "miniera-di-cinque-valli-8"),
      { numbers: "28", title: "Il Sentiero Cinque Valli", href: "/percorsi/sentiero-cinque-valli" },
      panel("29", "Il camminamento austriaco", "camminamento-austriaco-10"),
      panel("30", "La tempesta Vaia", "la-tempesta-vaia-11-1"),
      panel("31", "Il bostrico tipografo", "bostrico-tipografo-11-2"),
      panel("32", "La ricostruzione del bosco", "ricostruzione-bosco-11-3"),
    ],
  },
];
