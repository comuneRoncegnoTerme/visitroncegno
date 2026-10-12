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
        <h2>La cartina illustrata</h2>
        <span>Dai musei alle cime del Lagorai, tutto il territorio in un’illustrazione di Fabio Vettori.</span>
        <Link href="/cartina">Apri la cartina <b aria-hidden="true">→</b></Link>
      </div>
    </section>
  );
}
