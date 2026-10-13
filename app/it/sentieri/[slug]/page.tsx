import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PanelAudioPlayer from "@/components/PanelAudioPlayer";
import { getDirectusAssetUrl, getDirectusImageUrl, getSiteSettings } from "@/lib/directus";
import { getStoryByLegacySlug, storyParagraphs } from "@/lib/stories";
import { getTrailPanel, trailPanels, type TrailPanel } from "@/lib/trail-panels";
import { cinqueValliPanels, getCinqueValliPanel } from "@/lib/cinque-valli-panels";
import { getPanelAudioFileId } from "@/lib/panel-audio";
import { getPanelStoryMedia } from "@/lib/panel-story-media";
import styles from "./page.module.css";
import mediaStyles from "./panel-media.module.css";
import { descriptionFrom, pageMetadata } from "@/lib/seo";

interface LegacyTrailPageProps {
  params: Promise<{ slug: string }>;
}

const LEGACY_PANEL_NUMBERS: Record<string, string> = {
  "miniera-di-cinque-valli-8": "26–27",
};

async function getDirectusTrailPanel(slug: string): Promise<TrailPanel | null> {
  const story = await getStoryByLegacySlug(slug);
  if (!story) return null;

  const body = storyParagraphs(story.body);
  const summary = story.excerpt?.trim() || body[0] || "Approfondimento sul territorio di Roncegno Terme.";

  return {
    slug,
    panelNumber: LEGACY_PANEL_NUMBERS[slug] ?? "Approfondimento",
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

function getStaticTrailPanel(slug: string) {
  return getTrailPanel(slug) ?? getCinqueValliPanel(slug);
}

function mergePanelContent(staticPanel: TrailPanel | null, directusPanel: TrailPanel | null) {
  if (!staticPanel) return directusPanel;
  if (!directusPanel) return staticPanel;

  return {
    ...staticPanel,
    title: directusPanel.title,
    eyebrow: directusPanel.eyebrow,
    summary: directusPanel.summary,
    body: directusPanel.body,
    audioTitle: directusPanel.audioTitle,
    relatedRouteLabel: directusPanel.relatedRouteLabel ?? staticPanel.relatedRouteLabel,
    relatedRouteHref: directusPanel.relatedRouteHref ?? staticPanel.relatedRouteHref,
  } satisfies TrailPanel;
}

export function generateStaticParams() {
  return [...trailPanels, ...cinqueValliPanels].map((panel) => ({ slug: panel.slug }));
}

export async function generateMetadata({ params }: LegacyTrailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const panel = mergePanelContent(getStaticTrailPanel(slug), await getDirectusTrailPanel(slug));
  if (!panel) return { title: "Approfondimento non trovato", robots: { index: false, follow: false } };

  return pageMetadata({
    title: panel.title,
    description: descriptionFrom(panel.summary, `Approfondimento su ${panel.title} e il territorio di Roncegno Terme.`),
    path: `/it/sentieri/${slug}`,
  });
}

export default async function LegacyTrailPage({ params }: LegacyTrailPageProps) {
  const { slug } = await params;
  const staticPanel = getStaticTrailPanel(slug);
  const [settings, directusPanel, storyMedia] = await Promise.all([
    getSiteSettings(),
    getDirectusTrailPanel(slug),
    getPanelStoryMedia(slug),
  ]);
  const panel = mergePanelContent(staticPanel, directusPanel);

  if (!panel) notFound();

  const isChestnutHistory = slug === "il-castagno-nella-storia-3-1";
  const routeHref = panel.relatedRouteHref ??
    (panel.relatedRouteLabel === "Circuito del Castagno" ? "/percorsi/circuito-del-castagno" : "/percorsi");
  const routeLabel = panel.relatedRouteLabel ?? "Tutti i percorsi";
  const audioFileId = storyMedia?.audio_file ?? getPanelAudioFileId(slug);
  const audioUrl = getDirectusAssetUrl(audioFileId);
  const audioTitle = storyMedia?.audio_title?.trim() || panel.audioTitle;
  const panelImageUrl = getDirectusImageUrl(storyMedia?.image);

  return (
    <main className={`${styles.page} ${isChestnutHistory ? styles.chestnutPage : ""}`}>
      <SiteHeader settings={settings} overlay />

      <section className={`${styles.hero} ${panelImageUrl ? mediaStyles.heroWithImage : ""}`}>
        {panelImageUrl && (
          <div
            className={mediaStyles.heroPhoto}
            style={{ backgroundImage: `url(${panelImageUrl})` }}
            aria-hidden="true"
          />
        )}
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
        {isChestnutHistory && !panelImageUrl && (
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

      <section className={`${styles.contentGrid} ${audioUrl ? mediaStyles.audioLayout : ""}`}>
        <article className={`${styles.article} ${mediaStyles.article}`}>
          <p className={styles.articleKicker}>Storia e territorio</p>
          {panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {panel.sections?.map((section) => (
            <section className={styles.articleSection} key={section.title}>
              <h2>{section.title}</h2>
              {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>

        {/* Audio e schede laterali in un'unica colonna che resta in vista mentre si legge:
            separati, la colonna "appiccicosa" scorreva sopra il lettore audio. */}
        <div className={styles.sideStack}>
          {audioUrl && (
            <div className={mediaStyles.audioCard}>
              <PanelAudioPlayer src={audioUrl} title={audioTitle} autoPlay />
            </div>
          )}
          <aside className={`${styles.sideColumn} ${mediaStyles.sideColumn}`}>
            <div className={styles.routeCard}>
              <p className={styles.routeKicker}>Questo pannello fa parte di</p>
              <Link href={routeHref}>{routeLabel} →</Link>
              <p>Mappa, tappe e informazioni pratiche del percorso.</p>
            </div>

            {isChestnutHistory && (
              <div className={styles.sourceCard}>
                <p className={styles.metaLabel}>Dalle schede storiche</p>
                <p>Il castagno è stato per secoli una risorsa completa: frutto, legno, fogliame e tannino entravano nella vita quotidiana delle famiglie di montagna.</p>
                <span>I Sentieri di Roncegno · tra storia e tradizione</span>
              </div>
            )}
          </aside>
        </div>
      </section>

      {panel.relatedPanels && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeading}>
            <h2>Gli altri pannelli del circuito</h2>
          </div>
          <div className={styles.relatedGrid}>
            {panel.relatedPanels.map((related) => (
              <Link href={related.href} className={styles.relatedCard} key={related.href}>
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
          <h2>Torna al percorso</h2>
          <p>Mappa, tappe e informazioni pratiche per percorrerlo.</p>
        </div>
        <Link href={routeHref} className={styles.ctaButton}>Torna a {routeLabel}</Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
