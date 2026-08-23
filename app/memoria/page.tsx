import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";

export const metadata = {
  title: "Memoria · Na vòlta a Ronzégno",
  description:
    "Fotografie, testimonianze e manoscritti del Progetto Memoria Na vòlta a Ronzégno.",
  alternates: { canonical: "/memoria" },
};

const archiveSections = [
  { number: "01", title: "Paesaggio", image: "/images/memoria/paesaggio.jpg", href: "https://www.visitroncegno.it/it/memoria/paesaggio" },
  { number: "02", title: "Edifici", image: "/images/memoria/edifici.jpg", href: "https://www.visitroncegno.it/it/memoria/edifici" },
  { number: "03", title: "Persone", image: "/images/memoria/persone.jpg", href: "https://www.visitroncegno.it/it/memoria/persone" },
  { number: "04", title: "Eventi e tradizioni", image: "/images/memoria/eventi-tradizioni.jpg", href: "https://www.visitroncegno.it/it/memoria/eventi-e-tradizioni" },
  { number: "05", title: "Attività tipiche", image: "/images/memoria/attivita-tipiche.jpg", href: "https://www.visitroncegno.it/it/memoria/tivor" },
  { number: "06", title: "Lettere e manoscritti", image: "/images/memoria/lettere-manoscritti.jpg", href: "https://www.visitroncegno.it/it/memoria/lettere-e-manoscritti" },
];

export default async function MemoryPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} overlay />

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Progetto Memoria · Roncegno Terme</p>
          <h1>Na vòlta<br />a Ronzégno.</h1>
          <p>Le immagini, le voci e i documenti di una comunità diventano un racconto da custodire e condividere.</p>
          <a className={styles.scrollLink} href="#progetto">Scopri il progetto <span aria-hidden="true">↓</span></a>
        </div>
        <p className={styles.heroCaption}>Memoria collettiva · Archivio di comunità</p>
      </section>

      <section className={styles.intro} id="progetto">
        <p className={styles.kicker}>Il progetto</p>
        <div className={styles.introGrid}>
          <h2>La memoria come punto di partenza.</h2>
          <div>
            <p>Il Progetto Memoria “Na vòlta a Ronzégno” nasce nel novembre 2022 dalla volontà di un gruppo di giovani di conservare la memoria collettiva e rafforzare il senso di comunità.</p>
            <p>Nel 2024, grazie al bando “Turismo delle Radici”, il progetto ha proposto 22 incontri dedicati alla condivisione di storie, informazioni, fotografie e manoscritti. Questa pagina apre una porta sul patrimonio raccolto.</p>
          </div>
        </div>
      </section>

      <section className={styles.archive} aria-labelledby="archivio-title">
        <div className={styles.archiveHeading}>
          <div><p className={styles.kicker}>Esplora l’archivio</p><h2 id="archivio-title">Sei tracce,<br />un solo racconto.</h2></div>
          <p>Paesaggi, volti, mestieri, edifici e parole: scegli una sezione per proseguire nell’archivio storico già pubblicato.</p>
        </div>
        <div className={styles.archiveGrid}>
          {archiveSections.map((section) => (
            <a className={styles.archiveCard} href={section.href} key={section.title}>
              <span className={styles.cardImage} style={{ backgroundImage: `url('${section.image}')` }} />
              <span className={styles.cardShade} />
              <span className={styles.cardNumber}>{section.number}</span>
              <span className={styles.cardTitle}>{section.title}</span>
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <p className={styles.kicker}>Storia per immagini</p>
        <h2>Ogni fotografia<br />riporta a casa una storia.</h2>
        <div className={styles.closingActions}>
          <a href="https://www.visitroncegno.it/it/memoria/storia-per-immagini">Sfoglia la storia per immagini <span aria-hidden="true">→</span></a>
          <a href="https://www.visitroncegno.it/it/memoria/progetto-memoria-na-volt">Scopri le pubblicazioni <span aria-hidden="true">→</span></a>
        </div>
        <Link className={styles.homeLink} href="/">Torna a Visit Roncegno</Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
