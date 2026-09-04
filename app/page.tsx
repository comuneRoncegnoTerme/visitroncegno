import Link from "next/link";
import HeroExperience, { type HeroHotspot, type HeroMode } from "@/components/HeroExperience";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  getDirectusAssetUrl,
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import { getLegacyStoryPath } from "@/lib/stories";
import styles from "./home-v2.module.css";

export const dynamic = "force-dynamic";

type HomepageHeroConfig = {
  hero_mode?: HeroMode | null;
  hero_video_url?: string | null;
  hero_atmosphere_enabled?: boolean | null;
  hero_hotspots_enabled?: boolean | null;
  hero_hotspots?: HeroHotspot[] | string | null;
  hero_ambient_audio_enabled?: boolean | null;
  hero_ambient_audio_url?: string | null;
};

function parseHeroHotspots(value: HomepageHeroConfig["hero_hotspots"]): HeroHotspot[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function eventDate(value: string) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("it-IT", { day: "2-digit", timeZone: "Europe/Rome" }).format(date),
    month: new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" }).format(date).replace(".", "").toUpperCase(),
  };
}

const utilityItems = [
  { label: "Sentieri e percorsi", note: "Natura e paesaggi", href: "/percorsi", icon: "↗" },
  { label: "Terme e benessere", note: "Acque, salute e natura", href: "/luoghi", icon: "≈" },
  { label: "Luoghi e cultura", note: "Borghi, musei e memoria", href: "/luoghi", icon: "⌂" },
  { label: "Dove mangiare", note: "Sapori del territorio", href: "/organizza-la-visita", icon: "◌" },
  { label: "Eventi", note: "Cosa succede a Roncegno", href: "/eventi", icon: "□" },
  { label: "Cartina", note: "Orientati sul territorio", href: "/cartina", icon: "◇" },
];

const planningItems = [
  { label: "Come arrivare", note: "Auto, treno e mobilità", href: "/organizza-la-visita" },
  { label: "Dove dormire", note: "Ospitalità e soggiorno", href: "/organizza-la-visita" },
  { label: "Dove mangiare", note: "Ristoranti e sapori", href: "/organizza-la-visita" },
  { label: "Informazioni utili", note: "Servizi, contatti e accessibilità", href: "/organizza-la-visita" },
];

export default async function Home() {
  const [homepage, experiences, events, featuredPlaces, stories, siteSettings] = await Promise.all([
    getHomepage(),
    getExperiences(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getEditorialList("stories"),
    getSiteSettings(),
  ]);

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";
  const heroConfig = homepage as typeof homepage & HomepageHeroConfig;
  const heroHotspots = parseHeroHotspots(heroConfig.hero_hotspots);
  const visibleEvents = events.slice(0, 4);
  const visibleExperiences = experiences.slice(0, 5);
  const visibleStories = stories.slice(0, 3);
  const placeFallback = featuredPlaces[0] ? getDirectusAssetUrl(featuredPlaces[0].image) : null;

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} overlay />

      <section className={styles.hero}>
        <HeroExperience
          mode={heroConfig.hero_mode}
          imageUrl={heroImage}
          videoUrl={heroConfig.hero_video_url}
          atmosphereEnabled={heroConfig.hero_atmosphere_enabled}
          hotspotsEnabled={false}
          hotspots={heroHotspots}
          ambientAudioEnabled={heroConfig.hero_ambient_audio_enabled}
          ambientAudioUrl={heroConfig.hero_ambient_audio_url}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{homepage.hero_eyebrow ?? "Natura · Benessere · Cultura · Sapori"}</p>
          <h1>{homepage.hero_title ?? "Semplicemente Roncegno Terme"}</h1>
          <p className={styles.heroIntro}>{homepage.hero_description ?? "Un territorio autentico tra montagna, acque termali, borghi e storie da vivere tutto l’anno."}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href={homepage.hero_primary_url ?? "/luoghi"}>{homepage.hero_primary_label ?? "Esplora il territorio"} →</Link>
            <Link className={styles.secondaryButton} href="/organizza-la-visita">Organizza la visita</Link>
          </div>
        </div>
      </section>

      <div className={styles.utilityWrap}>
        <nav className={styles.utilityBar} aria-label="Scorciatoie principali">
          {utilityItems.map((item) => (
            <Link className={styles.utilityCard} href={item.href} key={item.label}>
              <span className={styles.utilityIcon} aria-hidden="true">{item.icon}</span>
              <span><strong>{item.label}</strong><small>{item.note}</small></span>
            </Link>
          ))}
        </nav>
      </div>

      <section className={`${styles.section} ${styles.eventsSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div><p>In primo piano</p><h2 className={styles.sectionTitle}>Eventi a Roncegno</h2></div>
            <Link className={styles.sectionLink} href="/eventi">Vedi tutti gli eventi →</Link>
          </div>
          <div className={styles.eventsGrid}>
            {visibleEvents.map((event, index) => {
              const date = eventDate(event.start_date);
              const image = getDirectusAssetUrl(event.image) ?? "/images/events/evento-fallback.jpg";
              const location = event.location_name ?? event.place?.title ?? "Roncegno Terme";
              return (
                <Link className={`${styles.eventCard}${index === 0 ? ` ${styles.eventCardPrimary}` : ""}`} href={`/eventi/${event.slug}`} key={event.id}>
                  <div className={styles.eventImage} style={{ backgroundImage: `url('${image}')` }} />
                  <div className={styles.eventShade} />
                  <div className={styles.eventBody}>
                    <span className={styles.eventDate}><strong>{date.day}</strong><span>{date.month}</span></span>
                    <div className={styles.eventMeta}>{event.category?.name ?? "Evento"} · {location}</div>
                    <h3>{event.title}</h3>
                    {index === 0 && event.summary && <p>{event.summary}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.themesSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div><p>Esperienze da vivere</p><h2 className={styles.sectionTitle}>Scopri Roncegno per temi</h2></div>
            <Link className={styles.sectionLink} href="/luoghi">Esplora il territorio →</Link>
          </div>
          <div className={styles.themesGrid}>
            {visibleExperiences.map((experience, index) => {
              const image = getDirectusAssetUrl(experience.image) ?? placeFallback ?? heroImage;
              return (
                <Link className={styles.themeCard} href={experience.link ?? "/luoghi"} key={experience.id}>
                  <div className={styles.themeImage} style={{ backgroundImage: `url('${image}')` }} />
                  <div className={styles.themeShade} />
                  <div className={styles.themeCopy}><small>{String(index + 1).padStart(2, "0")}</small><h3>{experience.title}</h3></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>Storie lungo il cammino</p>
          <h2>Capire il territorio mentre lo attraversi.</h2>
          <p>I pannelli, i percorsi e le storie di Roncegno diventano un unico racconto: natura, memoria, paesaggio e comunità da scoprire anche lungo i sentieri.</p>
          <Link className={styles.primaryButton} href="/percorsi">Scopri i percorsi →</Link>
        </div>
        <div className={styles.storyCards}>
          {visibleStories.map((story) => {
            const image = getDirectusAssetUrl(story.image) ?? heroImage;
            const href = getLegacyStoryPath(story) ?? `/storie/${story.slug}`;
            return (
              <Link className={styles.storyCard} href={href} key={story.id}>
                <div className={styles.storyImage} style={{ backgroundImage: `url('${image}')` }} />
                <div className={styles.storyBody}>
                  <small>{story.category?.name ?? "Storia"}</small>
                  <strong>{story.title}</strong>
                  {story.excerpt && <p>{story.excerpt}</p>}
                  <span>Apri la storia →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.planningSection}>
        <div className={`${styles.sectionInner} ${styles.planningGrid}`}>
          <div className={styles.planningCopy}>
            <p className={styles.eyebrow}>Tutto a portata di mano</p>
            <h2>Pianifica la tua visita.</h2>
            <p>Informazioni utili e servizi per organizzare al meglio il soggiorno, senza interrompere il racconto del territorio.</p>
          </div>
          <div className={styles.planningCards}>
            {planningItems.map((item) => (
              <Link className={styles.planningCard} href={item.href} key={item.label}>
                <small>{item.note}</small><strong>{item.label}</strong><span>Apri →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.closingInner}>
          <div><p className={styles.eyebrow}>Visit Roncegno</p><h2>Un territorio piccolo abbastanza da viverlo davvero.</h2><p>Parti da un evento, da un sentiero o da un luogo. Il resto del viaggio viene da sé.</p></div>
          <Link className={styles.primaryButton} href="/organizza-la-visita">Organizza la visita →</Link>
        </div>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
