import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  description: "La pagina richiesta non è disponibile.",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow dark">Errore 404</p>
      <h1>Questa pagina non c’è più, oppure ha cambiato indirizzo.</h1>
      <p>Puoi tornare alla homepage oppure continuare dai percorsi e dai luoghi di Roncegno Terme.</p>
      <nav aria-label="Link utili">
        <Link className="button button-dark" href="/">Torna alla homepage</Link>
        <Link className="button button-dark-outline" href="/percorsi">Esplora i percorsi</Link>
        <Link className="button button-dark-outline" href="/luoghi">Scopri i luoghi</Link>
      </nav>
    </main>
  );
}
