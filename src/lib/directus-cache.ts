// Cache delle letture pubbliche da Directus.
// Le pagine si generano a ogni richiesta (eventi "in corso", orari), ma le risposte di Directus
// restano in cache per un minuto: il sito regge i picchi (es. scansioni QR durante la Festa)
// senza moltiplicare le richieste al CMS. Ogni salvataggio dal Content Hub invalida il tag,
// quindi le modifiche fatte da lì sono visibili subito; quelle fatte direttamente in Directus entro un minuto.
export const DIRECTUS_CACHE_TAG = "directus";
export const DIRECTUS_REVALIDATE_SECONDS = 60;

export const publicDirectusCache = {
  next: { revalidate: DIRECTUS_REVALIDATE_SECONDS, tags: [DIRECTUS_CACHE_TAG] },
} satisfies RequestInit;
