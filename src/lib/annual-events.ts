// Appuntamenti fissi dell'anno, dall'opuscolo InfoRoncegno 2026 ("Eventi e fiere").
// Non hanno una data precisa, quindi non sono record di `events` in Directus: le date di ogni edizione
// si pubblicano come evento quando sono note.
export type AnnualEvent = { title: string; period: string; text?: string; href?: string };

export const ANNUAL_EVENTS: AnnualEvent[] = [
  { title: "Carnevale", period: "Febbraio" },
  { title: "Sagra dei Santi Pietro e Paolo", period: "Fine giugno" },
  { title: "Sagra di Santa Margherita", period: "Metà luglio" },
  { title: "Festa della Polenta", period: "Luglio–agosto" },
  { title: "Sagra di Sant’Osvaldo", period: "Agosto" },
  {
    title: "Festa della Castagna",
    period: "Fine ottobre",
    text: "Caldarroste, dolci, vin brulé, passeggiate: a fine ottobre Roncegno celebra la castagna con la festa simbolo del paese.",
    href: "/festa-della-castagna",
  },
];
