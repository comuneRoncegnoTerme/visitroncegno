import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import { getStoryBySlug, storyParagraphs } from "@/lib/stories";
import { getTrailPanel, trailPanels, type TrailPanel } from "@/lib/trail-panels";
import styles from "./page.module.css";

interface LegacyTrailPageProps {
  params: Promise<{ slug: string }>;
}

async function getDirectusTrailPanel(slug: string): Promise<TrailPanel | null> {
  const story = await getStoryBySlug(slug);
  if (!story) return null;

  const body = storyParagraphs(story.body);
  const summary = story.excerpt?.trim() || body[0] || "Approfondimento sul territorio di Roncegno Terme.";

  return {
    slug,
    panelNumber: "Approfondimento",
    qrCodes: [],
    title: story.title,
    eyebrow: story.category?.name ?? "Storie lungo il cammino",
    summary,
    body: body.length > 0 ? body : [summary],
    audioTitle: `Ascolta: ${story.title}`,
    relatedRouteLabel: story.route?.title ?? "Sentieri di Roncegno",
    relatedRouteHref: story.route?.slug ? `/percorsi/${story.route.slug}` : "/percorsi",
  };
}

export function generateStaticParams() {
  return trailPanels.map((panel) => ({ slug: panel.slug }));
}

export default async function LegacyTrailPage({ params }: LegacyTrailPageProps) {
  const { slug } = await params;
  const staticPanel = getTrailPanel(slug);
  const [settings, directusPanel] = await Promise.all([
    getSiteSettings(),
    staticPanel ? Promise.resolve(null) : getDirectusTrailPanel(slug),
  ]);
  const panel = staticPanel ?? directusPanel;

  if (!panel) notFound();

  const isChestnutHistory = slug === "il-castagno-nella-storia-3-1";
  const routeHref = panel.relatedRouteHref ??
    (panel.relatedRouteLabel === "Circuito del Castagno" ? "/percorsi/circuito-del-castagno" : "/percorsi");
  const routeLabel = panel.relatedRouteLabel ?? "Scopri i percorsi";

  return (
    <main className={`${styles.page} ${isChestnutHistory ? styles.chestnutPage : ""}`}>
      <SiteHeader settings={settings} overlay />

      <section className={styles.hero}>
        <div className={styles.heroTexture} />
        <div className={styles.heroContent}>
          <Link href={routeHref} className={styles.backLink}>← {routeLabel}</Link>
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
          <p className={styles.articleKicker}>Storia e territorio</p>
          {panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {panel.sections?.map((section) => (
            <section className={styles.articleSection} key={section.title}>
              <h2>{section.title}</h2>
              {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>

        <aside className={styles.sideColumn}>
          <div className={styles.routeCard}>
            <p className={styles.routeKicker}>Lungo il territorio</p>
            <h2>Continua il percorso.</h2>
            <p>Ritrova questa storia nel paesaggio di Roncegno e scopri le altre tappe collegate.</p>
            <Link href={routeHref}>{routeLabel} →</Link>
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

      <section className={styles.footerCta}>
        <div>
          <p className={styles.eyebrowLight}>Dalla storia al paesaggio</p>
          <h2>Cammina dentro il racconto.</h2>
          <p>Ogni approfondimento è una porta sul territorio: continua a esplorare i luoghi, i percorsi e le storie di Roncegno.</p>
        </div>
        <Link href={routeHref} className={styles.ctaButton}>Torna a {routeLabel}</Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
