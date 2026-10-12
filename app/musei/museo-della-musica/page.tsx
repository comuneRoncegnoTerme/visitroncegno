import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata = {
  title: "Museo degli Strumenti Musicali Popolari",
  description: "Scopri il Museo degli Strumenti Musicali Popolari di Roncegno Terme: circa mille strumenti da tutto il mondo, visite interattive e Parco Musicale.",
  alternates: { canonical: "/musei/museo-della-musica" },
};

export default async function MusicMuseumPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} overlay />

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Santa Brigida · Roncegno Terme</p>
          <h1>Museo degli Strumenti<br />Musicali Popolari</h1>
          <p className={styles.heroLead}>Un museo da vedere e da suonare.</p>
          <a href="#scopri" className={styles.scroll}>Entra nel museo ↓</a>
        </div>
      </section>

      <section className={styles.manifesto} id="scopri">
        <div>
          <p className={styles.eyebrowDark}>Un giro del mondo attraverso il suono</p>
          <h2>Circa mille strumenti<br />da cinque continenti</h2>
        </div>
        <div className={styles.manifestoCopy}>
          <p>Il Museo degli Strumenti Musicali Popolari raccoglie strumenti provenienti da culture diverse e costruisce un itinerario che unisce musica, arte, storia e geografia dei popoli.</p>
          <p>La visita può essere autonoma oppure guidata. Su prenotazione, il percorso diventa interattivo: alcuni strumenti possono essere provati direttamente dai visitatori.</p>
        </div>
      </section>

      <section className={styles.experience}>
        <div className={styles.experienceVisual}><span>La collezione degli strumenti</span></div>
        <div className={styles.experienceCopy}>
          <h2>Alcuni strumenti si possono provare</h2>
          <p>Il valore distintivo del percorso è il contatto diretto con il suono. Nelle visite guidate il pubblico può avvicinarsi agli strumenti, comprenderne la funzione e sperimentarne alcuni in prima persona.</p>
          <div className={styles.stats}>
            <div><strong>~1000</strong><span>strumenti musicali popolari esposti</span></div>
            <div><strong>5</strong><span>continenti raccontati</span></div>
            <div><strong>1</strong><span>percorso pensato anche per famiglie e scuole</span></div>
          </div>
        </div>
      </section>

      <section className={styles.jewels}>
        <div className={styles.jewelsCopy}>
          <h2>Alcuni pezzi della collezione</h2>
          <p>Tra gli strumenti segnalati dal museo figurano un harmonium francese della metà dell’Ottocento, un setar dell’Azerbaijan e un fortepiano del 1848. La collezione comprende anche un nucleo librario musicale con testi sacri dell’Ottocento e del primo Novecento.</p>
        </div>
        <div className={styles.jewelGrid} aria-hidden="true"><div /><div /><div /></div>
      </section>

      <section className={styles.park}>
        <div className={styles.parkCopy}>
          <h2>Il Parco Musicale</h2>
          <p>Accanto al museo, cinque aree verdi compongono un itinerario tra suoni della natura, strumenti e paesaggio: frutteto, giardino musicale, giardino fiorito, erbe aromatiche e roseto.</p>
        </div>
        <div className={styles.parkSide}>
          <div className={styles.parkVisual} aria-hidden="true" />
          <div className={styles.parkList}>
            <span>Frutteto</span><span>Giardino musicale</span><span>Giardino fiorito</span><span>Erbe aromatiche</span><span>Roseto</span>
          </div>
        </div>
      </section>

      <section className={styles.visit}>
        <div className={styles.visitIntro}>
          <h2>Orari e visite</h2>
          <p>Le aperture possono variare durante l’anno. Il museo pubblica calendari periodici e in inverno apre su prenotazione: prima della visita è consigliato verificare gli aggiornamenti.</p>
        </div>
        <div className={styles.visitCard}>
          <div><span>Ingresso</span><strong>Libero</strong></div>
          <div><span>Visite guidate</span><strong>Su prenotazione · piccolo contributo</strong></div>
          <div><span>Indirizzo</span><strong>Località S. Brigida · Roncegno Terme</strong></div>
          <a href="mailto:museodellamusicaroncegno@gmail.com">museodellamusicaroncegno@gmail.com</a>
          <a href="tel:+393458714426">+39 345 871 4426</a>
          <a href="tel:+393407701815">+39 340 770 1815</a>
          <a href="https://www.museodellamusicaroncegno.it/" target="_blank" rel="noreferrer">Sito ufficiale ↗</a>
        </div>
      </section>

      <section className={styles.next}>
        <p>L’altro museo di Roncegno</p>
        <h2>Il Mulino Angeli, a Marter</h2>
        <div className={styles.nextActions}>
          <Link href="/musei">Torna ai musei →</Link>
          <Link href="/musei/mulino-angeli">Mulino Angeli →</Link>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
