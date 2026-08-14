import Link from "next/link";
import styles from "./FestaHomepageBanner.module.css";

export default function FestaHomepageBanner() {
  return (
    <section className={styles.wrapper} aria-labelledby="festa-home-title">
      <div className={styles.visual}>
        <div className={styles.image} />
        <div className={styles.overlay} />
        <img
          className={styles.logo}
          src="/images/festa-castagna/logo-festa.png"
          alt="Festa della Castagna – Roncegno Terme"
        />
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>23–25 ottobre 2026 · Roncegno Terme</p>
        <h2 id="festa-home-title">L’autunno porta il paese in festa.</h2>
        <p>
          Mercatino della castagna, caldarroste, sapori locali, musica,
          attività per famiglie e passeggiate nel Circuito del Castagno.
          Tre giorni per vivere Roncegno nel suo momento più caratteristico.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/festa-della-castagna">
            Scopri la Festa →
          </Link>
          <Link className={styles.secondary} href="/festa-della-castagna#programma">
            Vai al programma
          </Link>
        </div>
      </div>
    </section>
  );
}
