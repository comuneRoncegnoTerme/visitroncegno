import type { Metadata } from "next";
import Link from "next/link";
import IllustratedMapViewer, { type IllustratedMapHotspot } from "@/components/IllustratedMapViewer";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cartina ufficiale di Roncegno Terme",
  description: "Esplora la cartina illustrata ufficiale di Roncegno Terme, consulta la guida del territorio e scarica il PDF.",
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
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>La cartina ufficiale</p>
          <h1>Roncegno Terme,<br />tutto in uno sguardo.</h1>
        </div>
        <div className={styles.heroCopy}>
          <p>Dal centro ai masi, dai musei alle vette del Lagorai: esplora il territorio attraverso l’illustrazione ufficiale e scopri quanto c’è intorno.</p>
          <a className={styles.download} href="/downloads/cartina-ufficiale-roncegno-terme.pdf" download>Scarica la cartina in PDF <span>↓</span></a>
        </div>
      </section>

      <section className={styles.mapSection} aria-labelledby="cartina-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Esplora</p><h2 id="cartina-title">Muoviti dentro la cartina.</h2></div>
          <p>Tocca i punti numerati oppure avvia il tour illustrato. La rappresentazione è orientativa e non sostituisce la cartografia escursionistica.</p>
        </div>
        <IllustratedMapViewer
          src="/images/cartina/cartina-roncegno-1.webp"
          alt="Cartina illustrata ufficiale di Roncegno Terme e del suo territorio"
          hotspots={MAP_HOTSPOTS}
        />
        <p className={styles.attribution}>Illustrazione “Le Formiche” di Fabio Vettori · Cartina ufficiale 2026</p>
      </section>

      <section className={styles.guideSection} aria-labelledby="guida-title">
        <div className={styles.guideIntro}>
          <p className={styles.eyebrow}>Sul retro della cartina</p>
          <h2 id="guida-title">Idee e indirizzi per la visita.</h2>
          <p>La seconda facciata raccoglie passeggiate, punti d’interesse, rifugi, musei e strutture del territorio in italiano e inglese.</p>
          <div className={styles.guideLinks}>
            <Link href="/percorsi">Scopri i percorsi →</Link>
            <Link href="/organizza-la-visita">Organizza la visita →</Link>
          </div>
        </div>
        <IllustratedMapViewer
          src="/images/cartina/cartina-roncegno-2.webp"
          alt="Guida bilingue ufficiale allegata alla cartina di Roncegno Terme"
          mobileScale={2.5}
        />
      </section>

      <section className={styles.endCta}>
        <div><p className={styles.eyebrowLight}>Orientati con precisione</p><h2>Hai bisogno di coordinate e indicazioni?</h2></div>
        <Link href="/organizza-la-visita#mappa-visita">Apri la mappa interattiva →</Link>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
