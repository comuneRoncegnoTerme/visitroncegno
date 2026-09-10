import Link from "next/link";
import HeroExperience, { type HeroHotspot, type HeroMode } from "@/components/HeroExperience";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  getDirectusAssetUrl,
  getExperiences,
  getHomepage,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/directus";
import styles from "./home-v2.module.css";
import refine from "./home-v2-refine.module.css";

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

type UtilityIconName = "trail" | "wellness" | "culture" | "food" | "events" | "map";

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

function eventTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

function UtilityIcon({ name }: { name: UtilityIconName }) {
  const common = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "trail") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19c4-1 4-6 8-7s4-6 8-7" fill="none" {...common}/><path d="M5 8h4M15 16h4" fill="none" {...common}/></svg>;
  if (name === "wellness") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5c-2 3 2 4 0 7M12 4c-2 3 2 4 0 7M17 5c-2 3 2 4 0 7" fill="none" {...common}/><path d="M4 16c3 2 13 2 16 0" fill="none" {...common}/></svg>;
  if (name === "culture") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 8-4 8 4M6 10v7M10 10v7M14 10v7M18 10v7M4 19h16" fill="none" {...common}/></svg>;
  if (name === "food") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v7M4.5 4v4.5A2.5 2.5 0 0 0 7 11v9M9.5 4v4.5A2.5 2.5 0 0 1 7 11M16 4c3 2 3 7 0 9v7" fill="none" {...common}/></svg>;
  if (name === "events") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v12H5zM8 4v5M16 4v5M5 11h14" fill="none" {...common}/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14" fill="none" {...common}/></svg>;
}

function experienceHref(title: string, configuredHref: string | null | undefined) {
  const normalized = title.toLowerCase();
  if (normalized.includes("natura") || normalized.includes("montagna")) return "/temi/natura-e-montagna";
  if (normalized.includes("terme") || normalized.includes("benessere")) return "/temi/terme-e-benessere";
  if (normalized.includes("cultura") || normalized.includes("memoria")) return "/temi/cultura-e-memoria";
  if (normalized.includes("sport") || normalized.includes("movimento")) return "/temi/sport-e-movimento";
  return configuredHref ?? "/luoghi";
}

const utilityItems: Array<{ label: string; note: string; href: string; icon: UtilityIconName }> = [
  { label: "Sentieri e percorsi", note: "Natura da vivere", href: "/percorsi", icon: "trail" },
  { label: "Terme e benessere", note: "Un equilibrio naturale", href: "/temi/terme-e-benessere", icon: "wellness" },
  { label: "Luoghi e cultura", note: "Borghi, musei e memoria", href: "/temi/cultura-e-memoria", icon: "culture" },
  { label: "Dove mangiare", note: "Sapori del territorio", href: "/organizza-la-visita", icon: "food" },
  { label: "Eventi", note: "Cosa succede a Roncegno", href: "/eventi", icon: "events" },
  { label: "Cartina", note: "Orientati sul territorio", href: "/cartina", icon: "map" },
];

const planningItems = [
  { label: "Come arrivare", note: "Auto, treno e mobilità", href: "/organizza-la-visita" },
  { label: "Dove dormire", note: "Ospitalità e soggiorno", href: "/organizza-la-visita" },
  { label: "Dove mangiare", note: "Ristoranti e sapori", href: "/organizza-la-visita" },
  { label: "Informazioni utili", note: "Servizi, contatti e accessibilità", href: "/organizza-la-visita" },
];

export default async function Home() {
  const [homepage, experiences, events, siteSettings] = await Promise.all([
    getHomepage(),
    getExperiences(),
    getUpcomingEvents(),
    getSiteSettings(),
  ]);

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";
  const heroConfig = homepage as typeof homepage & HomepageHeroConfig;
  const heroHotspots = parseHeroHotspots(heroConfig.hero_hotspots);
  const visibleEvents = events.slice(0, 4);
  const visibleExperiences = experiences.slice(0, 4);
  const nextEvent = visibleEvents[0] ?? null;
  const nextEventDate = nextEvent ? eventDate(nextEvent.start_date) : null;
  const nextEventTime = nextEvent ? eventTime(nextEvent.start_date) : null;

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} overlay />

      <section className={`${styles.hero} ${refine.hero}`}>
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
        <div className={`${styles.heroOverlay} ${refine.heroOverlay}`} />
        <div className={`${styles.heroContent} ${refine.heroContent}`}>
          <p className={styles.eyebrow}>{homepage.hero_eyebrow ?? "Trentino · Valsugana"}</p>
          <h1>{homepage.hero_title ?? "Semplicemente, Roncegno Terme"}</h1>
          <p className={styles.heroIntro}>{homepage.hero_description ?? "Natura, montagna, benessere e memoria. Un territorio autentico da scoprire con il proprio ritmo."}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href={homepage.hero_primary_url ?? "/luoghi"}>{homepage.hero_primary_label ?? "Esplora il territorio"}<span aria-hidden="true">→</span></Link>
            <Link className={styles.secondaryButton} href="/organizza-la-visita">Organizza la visita <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        {nextEvent && nextEventDate && (
          <Link className={refine.heroEvent} href={`/eventi/${nextEvent.slug}`}>
            <span className={refine.heroEventEyebrow}>Prossimo appuntamento</span>
            <span className={refine.heroEventDate}><strong>{nextEventDate.day}</strong>{nextEventDate.month}</span>
            <span className={refine.heroEventCopy}>
              <span className={refine.heroEventTitle}>{nextEvent.title}</span>
              {nextEventTime && <span className={refine.heroEventMeta}>Ore {nextEventTime} · Roncegno Terme</span>}
            </span>
            <span className={refine.heroEventArrow} aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <div className={styles.utilityWrap}>
        <nav className={styles.utilityBar} aria-label="Scorciatoie principali">
          {utilityItems.map((item) => (
            <Link className={styles.utilityCard} href={item.href} key={item.label}>
              <span className={styles.utilityIcon}><UtilityIcon name={item.icon} /></span>
              <span className={styles.utilityText}><strong>{item.label}</strong><small>{item.note}</small></span>
              <span className={styles.utilityArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>

      <section className={`${styles.section} ${styles.eventsSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div><p>In primo piano</p><h2 className={styles.sectionTitle}>Eventi a Roncegno</h2><span className={styles.sectionLead}>Tradizioni, cultura e vita di paese. I prossimi appuntamenti da non perdere.</span></div>
            <Link className={styles.sectionLink} href="/eventi">Vedi tutti gli eventi →</Link>
          </div>
          <div className={`${styles.eventsGrid} ${refine.eventsGrid}${visibleEvents.length === 3 ? ` ${refine.eventsGridThree}` : ""}`}>
            {visibleEvents.map((event, index) => {
              const date = eventDate(event.start_date);
              const image = getDirectusAssetUrl(event.image) ?? heroImage;
              const location = event.location_name ?? event.place?.title ?? "Roncegno Terme";
              const primary = index === 0;
              return (
                <Link className={`${styles.eventCard} ${refine.eventCard}${primary ? ` ${styles.eventCardPrimary} ${refine.eventCardPrimary}` : ""}`} href={`/eventi/${event.slug}`} key={event.id}>
                  <div className={`${styles.eventImage} ${refine.eventImage}`} style={{ backgroundImage: `url('${image}')` }} />
                  <div className={`${styles.eventShade} ${refine.eventShade}`} />
                  {primary && <span className={styles.featuredLabel}>Evento in evidenza</span>}
                  <div className={`${styles.eventBody} ${refine.eventBody}`}>
                    <span className={`${styles.eventDate} ${refine.eventDate}`}><strong>{date.day}</strong><span>{date.month}</span></span>
                    <div className={`${styles.eventMeta} ${refine.eventMeta}`}>{event.category?.name ?? "Evento"} · {location}</div>
                    <h3>{event.title}</h3>
                    {primary && event.summary && <p>{event.summary}</p>}
                    <span className={`${styles.cardArrow} ${refine.cardArrow}`} aria-hidden="true">→</span>
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
            <div><p>Esplora per interesse</p><h2 className={styles.sectionTitle}>Quattro modi di vivere Roncegno</h2><span className={styles.sectionLead}>Natura, benessere, cultura e movimento: scegli da dove cominciare.</span></div>
          </div>
          <div className={styles.themesGrid}>
            {visibleExperiences.map((experience, index) => {
              const image = getDirectusAssetUrl(experience.image) ?? heroImage;
              const href = experienceHref(experience.title, experience.link);
              return (
                <Link className={styles.themeCard} href={href} key={experience.id}>
                  <div className={styles.themeImage} style={{ backgroundImage: `url('${image}')` }} />
                  <div className={styles.themeShade} />
                  <div className={styles.themeCopy}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <h3>{experience.title}</h3>
                    <span aria-hidden="true">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
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
            {planningItems.map((item, index) => (
              <Link className={styles.planningCard} href={item.href} key={item.label}>
                <span className={styles.planningNumber}>{String(index + 1).padStart(2, "0")}</span>
                <small>{item.note}</small><strong>{item.label}</strong><span className={styles.planningArrow}>Apri →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
