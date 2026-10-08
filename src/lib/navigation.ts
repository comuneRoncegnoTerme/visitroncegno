// Voci di navigazione principali, condivise da intestazione, menu mobile e footer.
export const mainNavigation = [
  { href: "/luoghi", label: "Luoghi" },
  { href: "/percorsi", label: "Percorsi" },
  { href: "/eventi", label: "Eventi" },
  { href: "/musei", label: "Musei" },
  { href: "/memoria", label: "Memoria" },
  { href: "/cartina", label: "Cartina" },
] as const;

export const planningLinks = [
  { href: "/organizza-la-visita#dormire", label: "Dove dormire" },
  { href: "/organizza-la-visita#mangiare", label: "Dove mangiare" },
  { href: "/organizza-la-visita#come-arrivare", label: "Come arrivare" },
  { href: "/organizza-la-visita#mappa-visita", label: "Mappa" },
] as const;
