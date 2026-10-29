import qrInventory from "../../../data/qr-codes.json";

// I QR stampati (pannelli dei sentieri, libretto InfoRoncegno) codificano https://www.visitroncegno.it/qrx/<codice>:
// il gestionale del sito precedente rispondeva con un 302 verso la pagina associata al codice.
// Qui si replica lo stesso comportamento leggendo l'export del gestionale; i redirect in next.config.ts
// portano poi i vecchi indirizzi alle pagine nuove. Codici senza indirizzo: home, come sul sito precedente.
const PATH_BY_CODE = new Map(qrInventory.codes.map((qr) => [qr.code, qr.path ?? "/"]));

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const path = PATH_BY_CODE.get(code.toLowerCase());
  if (!path) return new Response("Codice QR non riconosciuto", { status: 404 });

  // Location relativa: il server dietro al proxy non conosce il dominio pubblico.
  return new Response(null, { status: 302, headers: { Location: path, "Cache-Control": "no-store" } });
}
