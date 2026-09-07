import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getDirectusAssetUrl, getHomepage, getSiteSettings, getUpcomingEvents } from "@/lib/directus";
import { getEditorialList, type EditorialItem } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import styles from "./theme.module.css";

const THEMES = {
  "natura-e-montagna": {
    title: "Natura e montagna",
    eyebrow: "Respira il territorio",
    intro: "Boschi, castagneti, sentieri e paesaggi alpini: Roncegno si scopre soprattutto camminando, con tempi lenti e punti di vista sempre diversi.",
    lead: "Dalla valle ai versanti del Lagorai, una selezione di luoghi e percorsi per entrare nel paesaggio.",
    placeTypes: ["nature"],
    keywords: ["natura", "bosco", "castagno", "montagna", "parco", "laghetto", "cinque valli", "panarotta"],
    eventKeywords: ["passeggiata", "escurs", "sentiero", "natura", "cammin", "montagna"],
    showRoutes: true,
    primaryHref: "/percorsi",
    primaryLabel: "Esplora i percorsi",
  },
  "terme-e-benessere": {
    title: "Terme e benessere",
    eyebrow: "Acque, quiete, salute",
    intro: "La storia termale di Roncegno incontra il paesaggio, i parchi e i luoghi dedicati alla cura e al benessere.",
    lead: "Un modo diverso di vivere il territorio: più lento, raccolto e legato alla tradizione delle acque.",
    placeTypes: ["nature", "service", "institution", "other"],
    keywords: ["terme", "termale", "benessere", "raphael", "salute", "acqua", "parco delle terme"],
    eventKeywords: ["benessere", "salute", "terme", "acqua"],
    showRoutes: false,
    primaryHref: "/luoghi",
    primaryLabel: "Scopri i luoghi",
  },
  "cultura-e-memoria": {
    title: "Cultura e memoria",
    eyebrow: "Storie che restano",
    intro: "Musei, architetture, tradizioni e memoria locale raccontano un paese che ha conservato molte tracce del proprio passato.",
    lead: "Dal Mulino Angeli alla musica, dalle chiese alle storie del territorio: qui il paesaggio diventa racconto.",
    placeTypes: ["museum", "heritage", "institution"],
    keywords: ["museo", "mulino", "chiesa", "cultura", "memoria", "storia", "musica", "borgo"],
    eventKeywords: ["cultura", "musica", "teatro", "mostra", "storia", "tradizion", "concerto"],
    showRoutes: false,
    primaryHref: "/luoghi",
    primaryLabel: "Scopri luoghi e musei",
  },
  "sport-e-movimento": {
    title: "Sport e movimento",
    eyebrow: "Muoversi all'aperto",
    intro: "Camminare, correre, pedalare e vivere gli impianti sportivi: Roncegno offre occasioni per muoversi tra fondovalle e montagna.",
    lead: "Percorsi, attività e appuntamenti per chi vuole esplorare il territorio in modo attivo.",
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
  const { slug } = await params;
  const theme = THEMES[slug as ThemeSlug];
  if (!theme) notFound();

  const [places, routes, events, homepage, siteSettings] = await Promise.all([
    getEditorialList("places"),
    getEditorialList("routes"),
    getUpcomingEvents(),
    getHomepage(),
    getSiteSettings(),
  ]);

  const cards = [...placeCards(places, theme), ...routeCards(routes, theme)].slice(0, 6);
  const relatedEvents = eventCards(events as EditorialItem[], theme);
  const heroImage =
    getDirectusAssetUrl(cards.find((item) => item.image)?.image ?? null) ??
    getDirectusAssetUrl(homepage.hero_image) ??
    "/images/hero/roncegno-hero.jpg";

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} overlay />

      <section className={styles.hero} style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <Link className={styles.back} href="/">← Home</Link>
          <p>{theme.eyebrow}</p>
          <h1>{theme.title}</h1>
          <div className={styles.heroBottom}>
            <p className={styles.heroIntro}>{theme.intro}</p>
            <Link className={styles.heroButton} href={theme.primaryHref}>{theme.primaryLabel} →</Link>
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introInner}>
          <span>Un modo di vivere Roncegno</span>
          <p>{theme.lead}</p>
        </div>
      </section>

      {cards.length > 0 && (
        <section className={styles.discoverySection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><p>Da scoprire</p><h2>Parti da qui.</h2></div>
              <span>{cards.length} proposte dal territorio</span>
            </div>
            <div className={styles.cardsGrid}>
              {cards.map((item, index) => {
                const image = getDirectusAssetUrl(item.image) ?? heroImage;
                return (
                  <Link className={`${styles.card}${index === 0 ? ` ${styles.cardPrimary}` : ""}`} href={item.href} key={item.id}>
                    <div className={styles.cardImage} style={{ backgroundImage: `url('${image}')` }} />
                    <div className={styles.cardShade} />
                    <div className={styles.cardBody}>
                      <small>{item.label}</small>
                      <h3>{item.title}</h3>
                      {index === 0 && item.summary && <p>{item.summary}</p>}
                      <span>Scopri →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {relatedEvents.length > 0 && (
        <section className={styles.eventsSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeading}>
              <div><p>Da vivere adesso</p><h2>Appuntamenti collegati.</h2></div>
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
          <p>Continua a esplorare</p>
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
