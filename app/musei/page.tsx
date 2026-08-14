import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata = {
  title: "I musei di Roncegno Terme | Visit Roncegno",
  description: "Due luoghi identitari per scoprire la memoria, il lavoro e i suoni di Roncegno Terme.",
};

export default async function MuseumsPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Polo museale · Roncegno Terme</p>
          <h1>Due musei.<br />Un territorio che si racconta.</h1>
          <p className={styles.lead}>Un antico mulino che conserva gesti, ingranaggi e memoria contadina. Un museo in cui gli strumenti musicali si possono ascoltare e, durante le visite guidate, anche suonare.</p>
          <a href="#musei" className={styles.heroCta}>Scopri i due musei ↓</a>
        </div>
        <div className={styles.heroCollage} aria-hidden="true">
          <div className={styles.heroPhotoOne}><span>Mulino Angeli</span></div>
          <div className={styles.heroPhotoTwo}><span>Museo degli Strumenti Musicali Popolari</span></div>
        </div>
      </section>

      <section className={styles.intro}>
        <p className={styles.kicker}>La cultura come esperienza</p>
        <h2>Non semplici collezioni, ma luoghi da vivere.</h2>
        <p>Il Mulino Angeli conserva due sistemi molitori e ospita la Casa Museo degli Spaventapasseri. Il Museo degli Strumenti Musicali Popolari accompagna invece in un viaggio tra culture e continenti attraverso circa mille strumenti.</p>
      </section>

      <section className={styles.cards} id="musei">
        <article className={styles.card}>
          <div className={`${styles.cardVisual} ${styles.mill}`}><span>01</span></div>
          <div className={styles.cardCopy}>
            <p>Memoria · Lavoro · Fotografia</p>
            <h2>Mulino Angeli</h2>
            <p>Un mulino documentato dal 1909, con il sistema tradizionale a palmenti e quello a cilindri. Negli spazi dell’abitazione del mugnaio vive anche la collezione di spaventapasseri di Flavio Faganello.</p>
            <Link href="/musei/mulino-angeli" className={styles.link}>Entra nel Mulino <span>→</span></Link>
          </div>
        </article>

        <article className={`${styles.card} ${styles.reverse}`}>
          <div className={`${styles.cardVisual} ${styles.music}`}><span>02</span></div>
          <div className={styles.cardCopy}>
            <p>Suono · Mondo · Famiglie</p>
            <h2>Museo degli Strumenti Musicali Popolari</h2>
            <p>Un museo “da vedere e da suonare”, con strumenti popolari provenienti da tutto il mondo e un percorso pensato anche per famiglie, scuole e attività guidate.</p>
            <Link href="/musei/museo-della-musica" className={styles.link}>Entra nel Museo <span>→</span></Link>
          </div>
        </article>
      </section>

      <section className={styles.bridge}>
        <div><p className={styles.kicker}>Una sola visita, due prospettive</p><h2>Dal rumore delle macine al suono degli strumenti.</h2></div>
        <p>I due musei raccontano aspetti diversi dello stesso territorio: il lavoro, la creatività, la memoria e il rapporto con le comunità. Questa landing è pensata come porta d’accesso comune, mentre ogni museo mantiene la propria identità.</p>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
