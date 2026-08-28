import type { Metadata } from "next";
import Link from "next/link";
import IllustratedMapViewer, { type IllustratedMapHotspot } from "@/components/IllustratedMapViewer";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cartina ufficiale di Roncegno Terme",
  description: "Esplora la cartina illustrata ufficiale di Roncegno Terme e scarica il PDF.",
  alternates: { canonical: "/cartina" },
};

const MAP_HOTSPOTS: IllustratedMapHotspot[] = [
  {
    id: "mulino-angeli",
    x: 10,
    y: 68,
    eyebrow: "Marter · Museo",
    title: "Mulino Angeli",
    text: "Un antico mulino e la Casa Museo degli Spaventapasseri: la porta occidentale del territorio illustrato.",
    href: "/musei/mulino-angeli",
  },
  {
    id: "centro-roncegno",
    x: 57,
    y: 70,
    eyebrow: "Paese · Terme",
    title: "Il cuore di Roncegno",
    text: "Il centro, il parco e i luoghi della comunità sono il punto di partenza per conoscere Roncegno Terme.",
    href: "/luoghi",
  },
  {
    id: "museo-musica",
    x: 78,
    y: 61,
    eyebrow: "Santa Brigida · Museo",
    title: "Museo della Musica",
    text: "Una collezione di strumenti popolari da tutto il mondo e un museo che invita anche ad ascoltare e suonare.",
    href: "/musei/museo-della-musica",
  },
  {
    id: "cinque-valli",
    x: 31,
    y: 33,
    eyebrow: "Boschi · Cammini",
    title: "Cinque Valli",
    text: "Boschi, acqua e paesaggi del Lagorai: da qui si apre il racconto dei percorsi in quota.",
    href: "/percorsi",
  },
  {
    id: "laghetto-prese",
    x: 51,
    y: 29,
    eyebrow: "Natura · Alta quota",
    title: "Laghetto delle Prese",
    text: "Uno specchio d’acqua alpino circondato dal verde, tra le mete illustrate nella guida ufficiale.",
    href: "/percorsi",
  },
  {
    id: "monte-cola",
    x: 65,
    y: 14,
    eyebrow: "Lagorai · Panorama",
    title: "Monte Cola",
    text: "La montagna domina la cartina e invita a esplorare con preparazione i paesaggi d’alta quota.",
    href: "/percorsi",
  },
];

export default async function CartinaPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.intro} aria-labelledby="cartina-page-title">
        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>La cartina ufficiale</p>
          <h1 id="cartina-page-title">La cartina illustrata di Roncegno.</h1>
          <p className={styles.lead}>
            Esplora il territorio attraverso l’illustrazione ufficiale e apri i punti evidenziati per approfondire luoghi e percorsi nel sito.
          </p>
        </div>
        <div className={styles.introActions}>
          <a className={styles.primaryAction} href="/downloads/cartina-ufficiale-roncegno-terme.pdf" download>
            Scarica il PDF <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className={styles.mapSection} aria-labelledby="cartina-title">
        <div className={styles.mapHeading}>
          <div>
            <p className={styles.eyebrow}>Esplora</p>
            <h2 id="cartina-title">Muoviti nella cartina.</h2>
          </div>
          <p>Tocca i punti numerati oppure avvia il tour illustrato. La rappresentazione è orientativa e non sostituisce la cartografia escursionistica.</p>
        </div>
        <div className={styles.viewerWrap}>
          <IllustratedMapViewer
            src="/images/cartina/cartina-roncegno-1.webp"
            alt="Cartina illustrata ufficiale di Roncegno Terme e del suo territorio"
            hotspots={MAP_HOTSPOTS}
          />
        </div>
        <p className={styles.attribution}>Illustrazione “Le Formiche” di Fabio Vettori · Cartina ufficiale 2026</p>
      </section>

      <section className={styles.nextSteps} aria-labelledby="approfondisci-title">
        <div>
          <p className={styles.eyebrow}>Approfondisci</p>
          <h2 id="approfondisci-title">Dalla cartina alle informazioni utili.</h2>
        </div>
        <div className={styles.nextLinks}>
          <Link href="/percorsi">Scopri i percorsi <span aria-hidden="true">→</span></Link>
          <Link href="/luoghi">Esplora i luoghi <span aria-hidden="true">→</span></Link>
          <Link href="/organizza-la-visita">Organizza la visita <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={styles.mapCta}>
        <div>
          <p className={styles.eyebrowLight}>Per orientarti sul posto</p>
          <h2>Ti servono coordinate e indicazioni precise?</h2>
        </div>
        <Link href="/organizza-la-visita#mappa-visita">Apri la mappa interattiva <span aria-hidden="true">→</span></Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
