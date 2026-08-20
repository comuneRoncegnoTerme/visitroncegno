import Link from "next/link";
import styles from "./PlanningHomepageSection.module.css";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PlanningHomepageSection() {
  return (
    <section className={styles.section} id="organizza">
      <div className={styles.shell}>
        <div className={styles.visual}>
          <div className={styles.image} aria-hidden="true" />
          <div className={styles.overlay} aria-hidden="true" />
          <div className={styles.copy}>
            <p>Organizza la visita</p>
            <h2>Tutto ciò che serve<br />per partire.</h2>
            <Link href="/organizza-la-visita">Apri la guida pratica <ArrowIcon /></Link>
          </div>
        </div>

        <div className={styles.links}>
          <Link href="/organizza-la-visita#dormire"><span><small>Ospitalità</small><strong>Dove dormire</strong></span><ArrowIcon /></Link>
          <Link href="/organizza-la-visita#mangiare"><span><small>Sapori</small><strong>Dove mangiare</strong></span><ArrowIcon /></Link>
          <Link href="/organizza-la-visita#servizi"><span><small>Informazioni</small><strong>Servizi utili</strong></span><ArrowIcon /></Link>
          <Link href="/organizza-la-visita#come-arrivare"><span><small>Mobilità</small><strong>Come arrivare</strong></span><ArrowIcon /></Link>
        </div>
      </div>
    </section>
  );
}
