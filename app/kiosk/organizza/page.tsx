import type { Metadata } from "next";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import KioskChrome from "../KioskChrome";
import styles from "../KioskList.module.css";

export const metadata: Metadata = { title: "Organizza la visita | Infopoint Visit Roncegno" };

export default async function KioskOrganizePage() {
  const settings = await getSiteSettings();
  const logo = getDirectusAssetUrl(settings.logo);

  return (
    <main className={styles.page}>
      <KioskChrome logo={logo} siteName={settings.site_name} section="Organizza la visita" />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Informazioni utili</p>
          <h1>Organizza la tua visita.</h1>
        </div>
        <p>Le informazioni essenziali per orientarti, arrivare, fermarti e vivere il territorio con semplicità.</p>
      </section>

      <section className={styles.organizeGrid}>
        <article className={styles.organizeCard}>
          <small>01 · Mobilità</small>
          <strong>Come arrivare</strong>
          <p>Roncegno Terme è raggiungibile dalla SS47 e dalla linea ferroviaria della Valsugana. La stazione di riferimento è Roncegno Bagni-Marter.</p>
          <span>Auto · treno · autobus</span>
        </article>
        <article className={styles.organizeCard}>
          <small>02 · Ospitalità</small>
          <strong>Dove dormire</strong>
          <p>Scopri le strutture ricettive del territorio e continua poi sul tuo telefono per contatti e prenotazioni.</p>
          <span>Ospitalità e soggiorno</span>
        </article>
        <article className={styles.organizeCard}>
          <small>03 · Sapori</small>
          <strong>Dove mangiare</strong>
          <p>Ristoranti, agriturismi e locali: un punto di partenza per conoscere i sapori di Roncegno e della Valsugana.</p>
          <span>Ristorazione</span>
        </article>
        <article className={styles.organizeCard}>
          <small>04 · Orientamento</small>
          <strong>Cartina e servizi</strong>
          <p>Usa la cartina del territorio per individuare luoghi, percorsi e servizi utili durante la visita.</p>
          <span>Infopoint · parcheggi · servizi</span>
        </article>
      </section>
</main>
  );
}
