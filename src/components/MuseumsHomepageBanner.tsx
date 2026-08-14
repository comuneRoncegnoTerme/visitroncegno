import Link from "next/link";
import styles from "./MuseumsHomepageBanner.module.css";

export default function MuseumsHomepageBanner() {
  return (
    <section className={styles.wrap} aria-labelledby="musei-home-title">
      <div className={styles.shell}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Patrimonio · Cultura</p>
          <h2 id="musei-home-title">Due musei, due modi di entrare nella storia di Roncegno.</h2>
          <p>
            Dal movimento dell’acqua e delle macine al viaggio attraverso i suoni del mondo:
            scopri il Mulino Angeli e il Museo degli Strumenti Musicali Popolari.
          </p>
          <Link href="/musei" className={styles.cta}>Scopri i musei <span aria-hidden="true">→</span></Link>
        </div>
        <Link href="/musei" className={styles.visual} aria-label="Scopri i musei di Roncegno">
          <div className={styles.tileA}><span>Mulino Angeli</span></div>
          <div className={styles.tileB}><span>Museo degli Strumenti Musicali Popolari</span></div>
          <div className={styles.badge}>Roncegno<br />da ascoltare<br />e ricordare</div>
        </Link>
      </div>
    </section>
  );
}
