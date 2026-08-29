import Link from "next/link";
import styles from "./IllustratedMapBanner.module.css";

export default function IllustratedMapBanner() {
  return (
    <section className={styles.section}>
      <Link className={styles.visual} href="/cartina" aria-label="Esplora la cartina illustrata ufficiale">
        <span className={styles.image} />
        <span className={styles.badge}>Cartina ufficiale</span>
      </Link>
      <div className={styles.copy}>
        <p>Roncegno illustrata</p>
        <h2>Il territorio,<br />tutto in uno sguardo.</h2>
        <span>Dai musei alle vette del Lagorai, orientati nella cartina illustrata e scopri i luoghi del territorio.</span>
        <Link href="/cartina">Apri la cartina <b aria-hidden="true">→</b></Link>
      </div>
    </section>
  );
}
