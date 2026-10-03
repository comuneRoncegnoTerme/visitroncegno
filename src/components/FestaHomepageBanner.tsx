import Link from "next/link";
import styles from "./FestaHomepageBanner.module.css";

export default function FestaHomepageBanner() {
  return (
    <section className={styles.wrapper} aria-labelledby="festa-home-title">
      <div className={styles.image} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>23–25 ottobre 2026 · Roncegno Terme</p>
        <h2 id="festa-home-title">Festa della Castagna 2026</h2>
        <p className={styles.lead}>
          Tre giorni di castagne, cucina, musica, passeggiate e vita di paese.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/festa-della-castagna">Scopri il programma →</Link>
          <Link className={styles.secondary} href="/eventi">Tutti gli appuntamenti</Link>
        </div>
      </div>

      <div className={styles.identity}>
        <img
          className={styles.logo}
          src="/images/festa-castagna/logo-festa.png"
          alt="Festa della Castagna – Roncegno Terme"
        />
      </div>

      <div className={styles.note}>
        <span>Festa: sabato 24 e domenica 25</span>
        <strong>Aspettando la Festa: venerdì 23</strong>
      </div>
    </section>
  );
}
