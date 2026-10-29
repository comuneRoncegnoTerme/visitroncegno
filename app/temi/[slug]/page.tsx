import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getDirectusImageUrl, getHomepage, getSiteSettings, getUpcomingEvents } from "@/lib/directus";
import { getEditorialList, type EditorialItem } from "@/lib/editorial";
import { getLegacyPanelNumber } from "@/lib/content-semantics";
import { placeHref } from "@/lib/place-detail";
import { getLegacyStoryPath, getStories, type StoryItem } from "@/lib/stories";
import { THEME_HIGHLIGHTS, THEME_STORY_KEYWORDS } from "@/lib/theme-highlights";
import styles from "./theme.module.css";

const THEMES = {
  "natura-e-montagna": {
    title: "Natura e montagna",
    intro: "Boschi, castagneti, sentieri e pascoli in quota. Il modo migliore per conoscerli è a piedi.",
    lead: "Dal fondovalle ai versanti del Lagorai: luoghi e percorsi.",
    placeTypes: ["nature"],
    keywords: ["natura", "bosco", "castagno", "montagna", "parco", "laghetto", "cinque valli", "panarotta"],
    eventKeywords: ["passeggiata", "escurs", "sentiero", "natura", "cammin", "montagna"],
    showRoutes: true,
    primaryHref: "/percorsi",
    primaryLabel: "Vedi i percorsi",
  },
  "terme-e-benessere": {
    title: "Terme e benessere",
    intro: "Il parco delle terme, le acque e la storia termale del paese.",
    lead: "Il parco, le acque e i luoghi legati alla storia termale del paese.",
    placeTypes: ["nature", "service", "institution", "other"],
    keywords: ["terme", "termale", "benessere", "raphael", "salute", "acqua", "parco delle terme"],
    eventKeywords: ["benessere", "salute", "terme", "acqua"],
    showRoutes: false,
    primaryHref: "/luoghi",
    primaryLabel: "Vedi i luoghi",
  },
  "cultura-e-memoria": {
    title: "Cultura e memoria",
    intro: "Musei, architetture, tradizioni e memoria locale raccontano un paese che ha conservato molte tracce del proprio passato.",
    lead: "Dal Mulino Angeli al Museo degli Strumenti Musicali, dalle chiese alle storie raccolte dal Progetto Memoria.",
    placeTypes: ["museum", "heritage", "institution"],
    keywords: ["museo", "mulino", "chiesa", "cultura", "memoria", "storia", "musica", "borgo"],
    eventKeywords: ["cultura", "musica", "teatro", "mostra", "storia", "tradizion", "concerto"],
    showRoutes: false,
    primaryHref: "/luoghi",
    primaryLabel: "Luoghi e musei",
  },
  "sport-e-movimento": {
    title: "Sport e movimento",
    intro: "Camminare, correre, andare in bici o usare gli impianti sportivi, tra fondovalle e montagna.",
    lead: "Percorsi, attività e appuntamenti per chi vuole muoversi all’aperto.",
    placeTypes: ["other", "service"],
    keywords: ["sport", "palestra", "tennis", "campo", "movimento"],
    eventKeywords: ["sport", "gara", "torneo", "corsa", "calcio", "pallavolo", "passeggiata", "camminata", "escurs"],
    showRoutes: true,
    primaryHref: "/percorsi",
    primaryLabel: "Trova un percorso",
  },
} as const;

type ThemeSlug = keyof typeof THEMES;
type ThemeConfig = (typeof THEMES)[ThemeSlug];
type CardItem = { id: string; title: string; summary: string | null; image: string | null; href: string; label: string };

function normalizedText(item: EditorialItem) {
  return [item.title, item.summary, item.description, item.category?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesKeywords(item: EditorialItem, keywords: readonly string[]) {
  const text = normalizedText(item);
  return keywords.some((keyword) => text.includes(keyword));
}

function placeCards(places: EditorialItem[], config: ThemeConfig): CardItem[] {
  return places
    .filter((place) =>
      config.placeTypes.includes((place.place_type ?? "other") as never) || matchesKeywords(place, config.keywords)
    )
    .slice(0, 5)
    .map((place) => ({
      id: `place-${place.id}`,
      title: place.title,
      summary: place.summary ?? place.description ?? null,
      image: place.image ?? null,
      href: placeHref(place),
      label: place.category?.name ?? "Luogo",
    }));
}

function routeCards(routes: EditorialItem[], config: ThemeConfig): CardItem[] {
  if (!config.showRoutes) return [];
  return routes.slice(0, 5).map((route) => ({
    id: `route-${route.id}`,
    title: route.title,
    summary: route.summary ?? route.description ?? route.route_highlight ?? null,
    image: route.image ?? null,
    href: `/percorsi/${route.slug}`,
    label: route.difficulty ? `Percorso · ${route.difficulty}` : "Percorso",
  }));
}

function eventCards(events: EditorialItem[], config: ThemeConfig): CardItem[] {
  return events
    .filter((event) => matchesKeywords(event, config.eventKeywords))
    .slice(0, 3)
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      summary: event.summary ?? event.description ?? null,
      image: event.image ?? null,
      href: `/eventi/${event.slug}`,
      label: "Evento",
    }));
}

// I "da non perdere" con il loro link e la foto: link solo verso schede pubblicate.
function highlightCards(slug: string, places: EditorialItem[], routes: EditorialItem[], stories: StoryItem[]) {
  const placesBySlug = new Map(places.map((place) => [place.slug, place]));
  return (THEME_HIGHLIGHTS[slug] ?? []).map((item) => {
    const place = item.place ? placesBySlug.get(item.place) : undefined;
    const route = item.route ? routes.find((candidate) => candidate.slug === item.route) : undefined;
    const story = item.story ? stories.find((candidate) => candidate.slug === item.story) : undefined;
    const href =
      item.href ??
      (place ? placeHref(place) : null) ??
      (route ? `/percorsi/${route.slug}` : null) ??
      (story ? getLegacyStoryPath(story) ?? `/storie/${story.slug}` : null);
    const image = item.image ?? getDirectusImageUrl(place?.image ?? route?.image ?? story?.image ?? null);
    return { ...item, href, image };
  });
}

function themeStories(slug: string, stories: StoryItem[]) {
  const keywords = THEME_STORY_KEYWORDS[slug] ?? [];
  if (!keywords.length) return [];
  return stories
    .filter((story) => {
      const text = [story.title, story.excerpt, story.category?.name].filter(Boolean).join(" ").toLowerCase();
      return keywords.some((keyword) => text.includes(keyword));
    })
    .slice(0, 6)
    .map((story) => {
      const href = getLegacyStoryPath(story) ?? `/storie/${story.slug}`;
      const panelNumber = getLegacyPanelNumber(href);
      return { id: story.id, title: story.title, href, label: panelNumber ? `Pannello ${panelNumber}` : "Storia" };
    });
}

export function generateStaticParams() {
  return Object.keys(THEMES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = THEMES[slug as ThemeSlug];
  if (!theme) return {};
  return {
    title: `${theme.title} | Visit Roncegno`,
    description: theme.intro,
    alternates: { canonical: `/temi/${slug}` },
  };
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const theme = THEMES[slug as ThemeSlug];
  if (!theme) notFound();

  const [places, routes, events, homepage, siteSettings, stories] = await Promise.all([
    getEditorialList("places"),
    getEditorialList("routes"),
    getUpcomingEvents(),
    getHomepage(),
    getSiteSettings(),
    getStories().catch(() => [] as StoryItem[]),
  ]);
  const highlights = highlightCards(slug, places, routes, stories);
  const relatedStories = themeStories(slug, stories);

  const cards = [...placeCards(places, theme), ...routeCards(routes, theme)].slice(0, 6);
  const relatedEvents = eventCards(events as EditorialItem[], theme);
  const heroImage =
    getDirectusImageUrl(cards.find((item) => item.image)?.image ?? null) ??
    getDirectusImageUrl(homepage.hero_image) ??
    "/images/hero/roncegno-hero.jpg";

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} overlay />

      <section className={styles.hero} style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <Link className={styles.back} href="/">← Home</Link>
          <h1>{theme.title}</h1>
          <div className={styles.heroBottom}>
            <p className={styles.heroIntro}>{theme.intro}</p>
            <Link className={styles.heroButton} href={theme.primaryHref}>{theme.primaryLabel}</Link>
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introInner}>
          <p>{theme.lead}</p>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className={styles.discoverySection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><h2>Da non perdere</h2></div>
            </div>
            <div className={styles.highlightGrid}>
              {highlights.map((item) => {
                const body = (
                  <>
                    {item.image && <div className={styles.cardImage} style={{ backgroundImage: `url('${item.image}')` }} />}
                    <div className={styles.cardShade} />
                    <div className={styles.cardBody}>
                      <small>{item.label}</small>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      {item.href && <span>Apri →</span>}
                    </div>
                  </>
                );
                return item.href
                  ? <Link className={styles.card} href={item.href} key={item.title}>{body}</Link>
                  : <article className={styles.card} key={item.title}>{body}</article>;
              })}
            </div>
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section className={`${styles.discoverySection}${highlights.length ? ` ${styles.followingSection}` : ""}`}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><h2>Da vedere</h2></div>
              <span>{cards.length === 1 ? "1 scheda" : `${cards.length} schede`}</span>
            </div>
            <div className={styles.cardsGrid}>
              {cards.map((item, index) => {
                const image = getDirectusImageUrl(item.image) ?? heroImage;
                return (
                  <Link className={`${styles.card}${index === 0 ? ` ${styles.cardPrimary}` : ""}`} href={item.href} key={item.id}>
                    <div className={styles.cardImage} style={{ backgroundImage: `url('${image}')` }} />
                    <div className={styles.cardShade} />
                    <div className={styles.cardBody}>
                      <small>{item.label}</small>
                      <h3>{item.title}</h3>
                      {index === 0 && item.summary && <p>{item.summary}</p>}
                      <span>Apri →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {relatedStories.length > 0 && (
        <section className={styles.eventsSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><h2>Storie e pannelli</h2></div>
            </div>
            <div className={styles.eventList}>
              {relatedStories.map((story) => (
                <Link href={story.href} className={styles.eventRow} key={story.id}>
                  <span>{story.label}</span><strong>{story.title}</strong><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedEvents.length > 0 && (
        <section className={styles.eventsSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><h2>Appuntamenti in programma</h2></div>
              <Link href="/eventi">Tutti gli eventi →</Link>
            </div>
            <div className={styles.eventList}>
              {relatedEvents.map((event) => (
                <Link href={event.href} className={styles.eventRow} key={event.id}>
                  <span>{event.label}</span><strong>{event.title}</strong><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className={styles.themeNav} aria-label="Altri temi">
        <div className={styles.sectionInner}>
          <p>Altri temi</p>
          <div className={styles.themeLinks}>
            {Object.entries(THEMES).map(([themeSlug, item]) => (
              <Link className={themeSlug === slug ? styles.activeTheme : ""} href={`/temi/${themeSlug}`} key={themeSlug}>
                {item.title}<span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
