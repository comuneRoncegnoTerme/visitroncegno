import type { Metadata } from "next";
import Link from "next/link";
import IllustratedMapViewer from "@/components/IllustratedMapViewer";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cartina ufficiale di Roncegno Terme",
  description: "Esplora la cartina illustrata ufficiale di Roncegno Terme, consulta la guida del territorio e scarica il PDF.",
  alternates: { canonical: "/cartina" },
};

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
          <p>Ingrandisci e trascina l’immagine per leggere i dettagli. La rappresentazione è illustrativa e non sostituisce la cartografia escursionistica.</p>
        </div>
        <IllustratedMapViewer
          src="/images/cartina/cartina-roncegno-1.webp"
          alt="Cartina illustrata ufficiale di Roncegno Terme e del suo territorio"
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
