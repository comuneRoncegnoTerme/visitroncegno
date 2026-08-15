import Link from "next/link";
import styles from "./FestaHomepageBanner.module.css";

export default function FestaHomepageBanner() {
  return (
    <section className={styles.wrapper} aria-labelledby="festa-home-title">
      <div className={styles.image} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>23–25 ottobre 2026 · Roncegno Terme</p>
        <h2 id="festa-home-title">Tre giorni per vivere l’autunno di Roncegno.</h2>
        <p className={styles.lead}>
          Caldarroste sul fuoco, bancarelle tra gli alberi, musica, famiglie e un paese intero che si ritrova.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/festa-della-castagna">Scopri la Festa →</Link>
          <Link className={styles.secondary} href="/festa-della-castagna#programma">Vai al programma</Link>
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
