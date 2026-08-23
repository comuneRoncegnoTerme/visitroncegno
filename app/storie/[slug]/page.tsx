import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getLegacyStoryPath, getStoryBySlug, storyParagraphs } from "@/lib/stories";
import { descriptionFrom, pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStoryBySlug((await params).slug);
  if (!story) return { title: "Storia non trovata", robots: { index: false, follow: false } };
  const canonical = getLegacyStoryPath(story) ?? `/storie/${story.slug}`;
  return pageMetadata({
    title: story.title,
    description: descriptionFrom(story.excerpt ?? story.body, `Una storia di Roncegno Terme: ${story.title}.`),
    path: canonical,
    image: getDirectusAssetUrl(story.image),
  });
}

const FALLBACK_IMAGE = "/images/hero/roncegno-hero.jpg";

function publicSourceUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "visitroncegno.it") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const [story, settings] = await Promise.all([
    getStoryBySlug(slug),
    getSiteSettings(),
  ]);

  if (!story) notFound();

  const legacyPath = getLegacyStoryPath(story);
  if (legacyPath) permanentRedirect(legacyPath);

  const storyImage = getDirectusAssetUrl(story.image);
  const heroImage = storyImage ?? FALLBACK_IMAGE;
  const paragraphs = storyParagraphs(story.body);
  const routeHref = story.route?.slug ? `/percorsi/${story.route.slug}` : "/percorsi";
  const routeLabel = story.route?.title ?? "Scopri i percorsi";
  const sourceUrl = publicSourceUrl(story.source_url);

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.hero}>
        <div className={styles.heroImage} style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link className={styles.backLink} href={routeHref}>← Torna al percorso</Link>
          <p className={styles.eyebrow}>{story.category?.name ?? "Storia del territorio"}</p>
          <h1>{story.title}</h1>
          {story.excerpt && <p className={styles.lead}>{story.excerpt}</p>}
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.contentGrid}>
          <article className={styles.article}>
            <p className={styles.kicker}>Approfondimento</p>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)
            ) : (
              <p>{story.excerpt ?? "Questo approfondimento sarà completato a breve."}</p>
            )}
          </article>

          <aside className={styles.aside}>
            <div className={styles.asideCard}>
              <p className={styles.kicker}>Lungo il cammino</p>
              <h2>Continua a esplorare.</h2>
              <p>Questa storia fa parte del racconto diffuso di Roncegno: luoghi, paesaggio, memoria e percorsi sono collegati tra loro.</p>
              <Link href={routeHref}>{routeLabel} →</Link>
            </div>

            {sourceUrl && (
              <div className={styles.sourceCard}>
                <small>Fonte e approfondimenti</small>
                <a href={sourceUrl} target="_blank" rel="noreferrer">
                  {story.source_label ?? "Consulta la fonte"} ↗
                </a>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className={styles.endLinks}>
        <Link href={routeHref}>
          <small>Torna sul territorio</small>
          <strong>{routeLabel} →</strong>
        </Link>
        <Link href="/luoghi">
          <small>Continua a conoscere Roncegno</small>
          <strong>Esplora i luoghi →</strong>
        </Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
