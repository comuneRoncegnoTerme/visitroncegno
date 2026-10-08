// L'archivio "Na vòlta a Ronzégno" è ancora pubblicato sul sito precedente.
// Prima di spostare www.visitroncegno.it sul nuovo portale, il vecchio sito va reso raggiungibile
// a un altro indirizzo (es. https://archivio.visitroncegno.it) e indicato in MEMORIA_ARCHIVE_URL:
// altrimenti questi link tornerebbero al nuovo sito, che reindirizza /it/memoria/* a /memoria.
const DEFAULT_ARCHIVE_BASE = "https://www.visitroncegno.it";

export function memoriaArchiveUrl(path: string) {
  const base = (process.env.MEMORIA_ARCHIVE_URL?.trim() || DEFAULT_ARCHIVE_BASE).replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
