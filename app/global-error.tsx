"use client";

import { useEffect } from "react";

// Errore nel layout principale: sostituisce l'intero documento, quindi gli stili sono in linea.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Global render error", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="it">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: "48px 6vw", background: "#f3f0e8", color: "#163d32", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <title>Errore temporaneo | Visit Roncegno</title>
        <main style={{ maxWidth: 620 }}>
          <p style={{ margin: "0 0 16px", color: "#c86434", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>Errore temporaneo</p>
          <h1 style={{ margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, fontSize: "clamp(38px, 9vw, 64px)", lineHeight: 1 }}>Il sito non si è caricato.</h1>
          <p style={{ margin: "24px 0 0", color: "#66716c", fontSize: 18, lineHeight: 1.6 }}>Si è verificato un problema momentaneo. Puoi riprovare oppure tornare alla homepage.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
            <button type="button" onClick={() => retry()} style={{ minHeight: 48, padding: "0 22px", border: 0, borderRadius: 999, background: "#163d32", color: "#fff", font: "inherit", fontWeight: 700, cursor: "pointer" }}>Riprova</button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- il layout non è disponibile, serve un caricamento completo */}
            <a href="/" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 22px", border: "1px solid rgba(22,61,50,.25)", borderRadius: 999, color: "#163d32", fontWeight: 700, textDecoration: "none" }}>Torna alla homepage</a>
          </div>
        </main>
      </body>
    </html>
  );
}
