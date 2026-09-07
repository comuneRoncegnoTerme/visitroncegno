import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  description: "La pagina richiesta non è disponibile.",
};

function LostTrailIllustration() {
  return (
    <svg viewBox="0 0 720 620" role="img" aria-label="Un sentiero tra le montagne con un cartello 404">
      <rect x="30" y="30" width="660" height="560" rx="38" fill="#faf9f5" stroke="#d8d4ca" />
      <circle cx="550" cy="130" r="52" fill="#e3a06e" opacity=".72" />
      <path d="M65 405 190 250l88 92 92-122 118 143 86-92 81 134Z" fill="#b9c6bc" />
      <path d="M65 438 170 330l92 77 110-150 119 136 84-72 80 117Z" fill="#6e8f80" />
      <path d="M70 477c91-29 144-17 193 6 58 27 120 47 194 22 69-24 118-17 198 7v53H70Z" fill="#163d32" />
      <path className={styles.trail} d="M135 515c74-42 118-65 161-60 47 6 59 52 114 38 53-13 77-60 126-62 33-1 57 10 92 32" fill="none" stroke="#f3f0e8" strokeWidth="7" strokeLinecap="round" />
      <g className={styles.sign}>
        <path d="M470 228v185" stroke="#70452d" strokeWidth="13" strokeLinecap="round" />
        <path d="M395 220h164l-21 42H395Z" fill="#d66b2c" />
        <text x="465" y="248" textAnchor="middle" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="700" letterSpacing="3">404</text>
        <path d="M416 279h144l-20 39H416Z" fill="#f3f0e8" stroke="#70452d" strokeWidth="3" />
        <text x="480" y="304" textAnchor="middle" fill="#163d32" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700">sentiero?</text>
      </g>
      <g className={styles.pin}>
        <path d="M360 352c-24 0-43 19-43 43 0 34 43 75 43 75s43-41 43-75c0-24-19-43-43-43Z" fill="#f3f0e8" stroke="#163d32" strokeWidth="5" />
        <circle cx="360" cy="395" r="13" fill="#d66b2c" />
      </g>
      <path d="M118 397c0-41 24-73 54-73s54 32 54 73" fill="none" stroke="#163d32" strokeWidth="10" strokeLinecap="round" />
      <path d="M147 397v69M197 397v69" stroke="#163d32" strokeWidth="8" strokeLinecap="round" />
      <path d="M113 466h101" stroke="#163d32" strokeWidth="8" strokeLinecap="round" />
      <path d="M188 324c9-21 17-40 22-60 18 8 33 18 46 31-13 4-26 14-39 28Z" fill="#c87842" />
      <path d="M198 316c15-20 29-35 42-45" stroke="#70452d" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.copy}>
          <p className={styles.eyebrow}>Errore 404</p>
          <h1>Ti sei perso lungo il sentiero.</h1>
          <p className={styles.intro}>
            La pagina che stavi cercando potrebbe essere stata spostata o non essere più disponibile. Da qui puoi tornare all’inizio oppure continuare a scoprire Roncegno Terme.
          </p>
          <nav className={styles.actions} aria-label="Azioni principali">
            <Link className={styles.primary} href="/">Torna alla homepage</Link>
            <Link className={styles.secondary} href="/percorsi">Esplora i percorsi</Link>
            <Link className={styles.secondary} href="/luoghi">Scopri i luoghi</Link>
          </nav>
          <nav className={styles.useful} aria-label="Link utili">
            <Link href="/eventi">Eventi</Link>
            <Link href="/cartina">Cartina</Link>
            <Link href="/organizza-la-visita">Organizza la visita</Link>
          </nav>
        </section>
        <div className={styles.art}>
          <LostTrailIllustration />
        </div>
      </div>
    </main>
  );
}
