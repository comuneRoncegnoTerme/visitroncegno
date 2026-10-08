"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./not-found.module.css";

// Errore imprevisto in una pagina: il visitatore vede un messaggio chiaro invece di una pagina vuota.
export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Page render error", error.digest ?? error.message);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.copy}>
          <p className={styles.eyebrow}>Errore temporaneo</p>
          <h1>Questa pagina non si è caricata.</h1>
          <p className={styles.intro}>
            Si è verificato un problema momentaneo. Puoi riprovare oppure tornare alla homepage.
          </p>
          <nav className={styles.actions} aria-label="Azioni principali">
            <button type="button" className={styles.primary} onClick={() => retry()}>Riprova</button>
            <Link className={styles.secondary} href="/">Torna alla homepage</Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
