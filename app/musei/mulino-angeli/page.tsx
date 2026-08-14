import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata = {
  title: "Mulino Angeli | Visit Roncegno",
  description: "Scopri il Mulino Angeli - Casa Museo degli Spaventapasseri di Roncegno Terme.",
};

export default async function MulinoAngeliPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} overlay />
      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Marter · Roncegno Terme</p>
          <h1>Mulino<br />Angeli</h1>
          <p>Casa Museo degli Spaventapasseri</p>
          <a href="#scopri" className={styles.scroll}>Entra nel Mulino ↓</a>
        </div>
        <div className={styles.heroNote}>Immagine demo<br />da sostituire con archivio museo</div>
      </section>

      <section className={styles.manifesto} id="scopri">
        <div><p className={styles.eyebrowDark}>Un luogo che continua a muoversi</p><h2>Acqua, farina,<br />ingegno e memoria.</h2></div>
        <div className={styles.manifestoCopy}><p>Il Mulino Angeli è documentato fin dal 1909 e conserva due sistemi molitori: quello tradizionale a palmenti, destinato al frumento, e un sistema più moderno a cilindri per il mais.</p><p>Nastri convettori e saliscendi attraversano i piani dell’edificio, accompagnando granaglie e farina nelle diverse fasi di lavorazione: spulatura, macinazione, setacciatura e insaccatura.</p></div>
      </section>

      <section className={styles.mechanics}>
        <div className={styles.mechanicsImage}><span>Immagine demo · meccanismi del mulino</span></div>
        <div className={styles.mechanicsCopy}>
          <p className={styles.eyebrowLight}>Dentro la macchina</p>
          <h2>Seguire il grano, piano dopo piano.</h2>
          <p>La visita è un piccolo viaggio verticale: si segue il percorso delle granaglie dentro una macchina complessa, leggibile e sorprendentemente contemporanea nella sua logica.</p>
          <div className={styles.stats}><div><strong>1909</strong><span>prime notizie documentate</span></div><div><strong>2</strong><span>sistemi molitori conservati</span></div><div><strong>4</strong><span>fasi da raccontare</span></div></div>
        </div>
      </section>

      <section className={styles.scarecrows}>
        <div className={styles.scareCopy}>
          <p className={styles.eyebrowDark}>Casa Museo degli Spaventapasseri</p>
          <h2>Il mondo rurale attraverso lo sguardo di Flavio Faganello.</h2>
          <p>Negli ambienti dell’abitazione del mugnaio è ospitata la collezione di spaventapasseri legata al fotografo reporter e giornalista trentino Flavio Faganello. Un secondo racconto, più umano e poetico, che completa quello della macchina.</p>
        </div>
        <div className={styles.scareGrid} aria-hidden="true"><div /><div /><div /></div>
      </section>

      <section className={styles.visit}>
        <div className={styles.visitIntro}><p className={styles.eyebrowDark}>Organizza la visita</p><h2>Vieni a vedere<br />il Mulino in funzione.</h2><p>Informazioni aggiornate al calendario 2026 pubblicato dal museo. Per gruppi e visite speciali è consigliato il contatto diretto.</p></div>
        <div className={styles.visitCard}>
          <div><span>18 aprile — 14 giugno</span><strong>Sabato e domenica · 09:00–12:00</strong></div>
          <div><span>16 giugno — 13 settembre</span><strong>Martedì · 15:30–18:30<br />Sabato e domenica · 09:00–12:00</strong></div>
          <div><span>19 settembre — 25 ottobre</span><strong>Sabato e domenica · 09:00–12:00</strong></div>
          <div className={styles.offer}><span>Ingresso</span><strong>Offerta libera</strong></div>
          <a href="mailto:polomusealeroncegno@gmail.com">polomusealeroncegno@gmail.com</a>
          <a href="tel:+393458714426">+39 345 871 4426</a>
        </div>
      </section>

      <section className={styles.next}>
        <p>Continua il viaggio culturale</p>
        <h2>Dalle macine ai suoni del mondo.</h2>
        <div className={styles.nextActions}><Link href="/musei">Torna ai musei →</Link><a href="https://www.museodellamusicaroncegno.it/" target="_blank" rel="noreferrer">Museo degli Strumenti Musicali ↗</a></div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
