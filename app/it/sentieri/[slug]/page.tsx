import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrailPanel, trailPanels } from "@/lib/trail-panels";
import styles from "./page.module.css";

interface LegacyTrailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return trailPanels.map((panel) => ({ slug: panel.slug }));
}

export default async function LegacyTrailPage({ params }: LegacyTrailPageProps) {
  const { slug } = await params;
  const panel = getTrailPanel(slug);

  if (!panel) notFound();

  const isChestnutHistory = slug === "il-castagno-nella-storia-3-1";

  return (
    <main className={`${styles.page} ${isChestnutHistory ? styles.chestnutPage : ""}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Visit Roncegno</Link>
        <nav className={styles.headerNav}>
          <Link href="/festa-della-castagna">Festa della Castagna</Link>
          <Link href="/festa-della-castagna#storie">Circuito del Castagno</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroTexture} />
        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            <p className={styles.eyebrow}>{panel.eyebrow}</p>
            <span className={styles.panelLabel}>Pannello {panel.panelNumber}</span>
          </div>
          <h1>{panel.title}</h1>
          <p className={styles.summary}>{panel.summary}</p>
        </div>
        {isChestnutHistory && (
          <div className={styles.heroWord} aria-hidden="true">CASTAGNO</div>
        )}
      </section>

      {panel.facts && (
        <section className={styles.factBand}>
          {panel.facts.map((fact) => (
            <div key={fact.label}>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
            </div>
          ))}
        </section>
      )}

      <section className={styles.contentGrid}>
        <article className={styles.article}>
          <p className={styles.articleKicker}>Storia e tradizioni locali</p>
          {panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {panel.sections?.map((section) => (
            <section className={styles.articleSection} key={section.title}>
              <h2>{section.title}</h2>
              {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>

        <aside className={styles.sideColumn}>
          <div className={styles.audioCard}>
            <span className={styles.audioIcon}>▶</span>
            <div>
              <p className={styles.audioKicker}>Audioguida</p>
              <h2>{panel.audioTitle}</h2>
              <p className={styles.audioNote}>
                Questa pagina è raggiungibile dagli stessi QR già presenti sul territorio. Testi, audio e approfondimenti possono evolvere senza cambiare il codice stampato.
              </p>
            </div>
            <button type="button" className={styles.audioButton} aria-label="Riproduci audioguida">Riproduci</button>
          </div>

          {isChestnutHistory && (
            <div className={styles.sourceCard}>
              <p className={styles.metaLabel}>Dalle schede storiche</p>
              <p>Il castagno è stato per secoli una risorsa completa: frutto, legno, fogliame e tannino entravano nella vita quotidiana delle famiglie di montagna.</p>
              <span>I Sentieri di Roncegno · tra storia e tradizione</span>
            </div>
          )}
        </aside>
      </section>

      {panel.relatedPanels && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeading}>
            <p className={styles.eyebrowDark}>Continua lungo il circuito</p>
            <h2>Il castagno, da altri punti di vista.</h2>
          </div>
          <div className={styles.relatedGrid}>
            {panel.relatedPanels.map((related, index) => (
              <Link href={related.href} className={styles.relatedCard} key={related.href}>
                <span>0{index + 1}</span>
                <small>{related.label}</small>
                <h3>{related.title}</h3>
                <strong>Apri la storia →</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.metaSection}>
        <div>
          <p className={styles.metaLabel}>QR esistenti associati</p>
          <p>{panel.qrCodes.join(" · ")}</p>
        </div>
        {panel.relatedRouteLabel && (
          <div>
            <p className={styles.metaLabel}>Percorso</p>
            <p>{panel.relatedRouteLabel}</p>
          </div>
        )}
      </section>

      <section className={styles.footerCta}>
        <div>
          <p className={styles.eyebrowLight}>Dalla storia al paesaggio</p>
          <h2>Cammina dentro il racconto.</h2>
          <p>La Festa della Castagna e il Circuito del Castagno collegano il centro di Roncegno ai luoghi, alle persone e alle tradizioni che hanno costruito questo paesaggio.</p>
        </div>
        <Link href="/festa-della-castagna#storie" className={styles.ctaButton}>Esplora il Circuito del Castagno</Link>
      </section>
    </main>
  );
}
