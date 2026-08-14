import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import FestaHomepageBanner from "@/components/FestaHomepageBanner";
import MuseumsHomepageBanner from "@/components/MuseumsHomepageBanner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  getDirectusAssetUrl,
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getMapPlaces,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/directus";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default async function Home() {
  const [homepage, experiences, mapPlaces, events, featuredPlaces, siteSettings] = await Promise.all([
    getHomepage(),
    getExperiences(),
    getMapPlaces(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getSiteSettings(),
  ]);

  function formatEventDate(date: string) {
    const parsed = new Date(date);
    return {
      day: new Intl.DateTimeFormat("it-IT", { day: "2-digit", timeZone: "Europe/Rome" }).format(parsed),
      month: new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" }).format(parsed).replace(".", "").toUpperCase(),
    };
  }

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";
  const homeMapPlaces = mapPlaces
    .filter((place) => place.latitude !== null && place.longitude !== null)
    .map((place) => ({
      id: place.id,
      title: place.title,
      slug: place.slug,
      summary: place.summary,
      imageUrl: getDirectusAssetUrl(place.image),
      latitude: place.latitude as number,
      longitude: place.longitude as number,
      mapLabel: place.map_label,
    }));

  return (
    <main>
      <SiteHeader settings={siteSettings} overlay />

      <section className="hero" id="top">
        <div className="hero-image" style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">{homepage.hero_eyebrow ?? "Trentino · Valsugana"}</p>
          <h1>{homepage.hero_title ?? "Roncegno Terme, da vivere."}</h1>
          <p className="hero-intro">{homepage.hero_description ?? "Natura, montagna, benessere e memoria. Un territorio autentico da scoprire con il proprio ritmo."}</p>
          <div className="hero-actions">
            <a className="button button-light" href={homepage.hero_primary_url ?? "#scopri"}>{homepage.hero_primary_label ?? "Esplora il territorio"}<ArrowIcon /></a>
            <Link className="button button-glass" href="/festa-della-castagna#programma">Festa della Castagna</Link>
          </div>
        </div>
        <a className="hero-scroll" href="#scopri"><span>Scorri per scoprire</span><span className="scroll-line" /></a>
      </section>

      <FestaHomepageBanner />

      <section className="quick-search" id="scopri">
        <div className="section-shell">
          <div className="quick-search-heading"><p className="eyebrow dark">Inizia da qui</p><h2>Cosa vuoi fare oggi?</h2></div>
          <div className="quick-links">
            <Link href="/festa-della-castagna#programma"><span className="quick-number">01</span><span><strong>Vivere la Festa della Castagna</strong><small>Programma, sapori e informazioni utili</small></span><ArrowIcon /></Link>
            <Link href="/percorsi"><span className="quick-number">02</span><span><strong>Camminare</strong><small>Sentieri, boschi e panorami</small></span><ArrowIcon /></Link>
            <Link href="/luoghi"><span className="quick-number">03</span><span><strong>Scoprire i luoghi</strong><small>Paese, terme e montagna</small></span><ArrowIcon /></Link>
            <a href="#organizza"><span className="quick-number">04</span><span><strong>Mangiare e dormire</strong><small>Ospitalità e sapori locali</small></span><ArrowIcon /></a>
          </div>
        </div>
      </section>

      <section className="intro-section"><div className="section-shell intro-grid"><div><p className="eyebrow dark">Un territorio, molte anime</p><h2 className="display-heading">Qui il paesaggio<br />diventa esperienza.</h2></div><div className="intro-copy"><p>Roncegno Terme si trova nel cuore della Valsugana, tra il fondovalle e le montagne del Lagorai. È un luogo fatto di natura, storia, comunità e tradizioni ancora vive.</p><p>Esplora il paese, segui i sentieri, scopri le sorgenti e lasciati guidare dalle storie del territorio.</p><a className="text-link" href="#esperienze">Scopri Roncegno<ArrowIcon /></a></div></div></section>

      <MuseumsHomepageBanner />

      <section className="experiences-section" id="esperienze"><div className="section-shell"><div className="section-heading-row"><div><p className="eyebrow dark">Esperienze</p><h2>Quattro modi di vivere Roncegno</h2></div><a className="text-link" href="#luoghi">Tutte le esperienze<ArrowIcon /></a></div><div className="experience-grid">{experiences.map((experience, index) => { const experienceImage = getDirectusAssetUrl(experience.image); return (<a className="experience-card" href={experience.link ?? `/esperienze/${experience.slug}`} key={experience.id}><div className="card-background" style={{ backgroundImage: experienceImage ? `url('${experienceImage}')` : undefined }} /><div className="card-overlay" /><span className="card-number">{String(index + 1).padStart(2, "0")}</span><div className="card-content"><h3>{experience.title}</h3>{experience.description && <p>{experience.description}</p>}<span className="round-arrow"><ArrowIcon /></span></div></a>); })}</div></div></section>

      <section className="events-section" id="eventi"><div className="section-shell"><div className="section-heading-row"><div><p className="eyebrow accent">Agenda</p><h2>Cosa succede a Roncegno</h2></div><a className="button button-dark-outline" href="#eventi">Vedi tutti gli eventi<ArrowIcon /></a></div><div className="events-list">{events.map((event) => { const date = formatEventDate(event.start_date); const eventImage = getDirectusAssetUrl(event.image) ?? "/images/events/evento-fallback.jpg"; const location = event.location_name ?? event.place?.title ?? "Roncegno Terme"; const category = event.category?.name ?? "Evento"; return (<article className="event-row" key={event.id}><div className="event-date"><strong>{date.day}</strong><span>{date.month}</span></div><div className="event-image" style={{ backgroundImage: `url('${eventImage}')` }} /><div className="event-copy"><div className="event-meta"><span>{category}</span><span className="event-location"><MapPinIcon />{location}</span></div><h3>{event.title}</h3></div><a className="event-arrow" href={`/eventi/${event.slug}`} aria-label={`Scopri ${event.title}`}><ArrowIcon /></a></article>); })}</div></div></section>

      <section className="map-section" id="mappa"><div className="map-panel"><HomeMap places={homeMapPlaces} /></div><div className="map-copy"><p className="eyebrow light">Esplora la mappa</p><h2>Il territorio,<br />tutto in un luogo.</h2><p>Trova sentieri, luoghi di interesse, parcheggi, strutture ricettive, attività e servizi utili per organizzare la tua visita.</p><a className="button button-light" href="#mappa">Apri la mappa<ArrowIcon /></a></div></section>

      <section className="places-section" id="luoghi"><div className="section-shell"><div className="section-heading-row"><div><p className="eyebrow dark">Luoghi da conoscere</p><h2>Tre paesaggi, un’unica destinazione</h2></div></div><div className="places-grid">{featuredPlaces.map((place) => { const placeImage = getDirectusAssetUrl(place.image) ?? "/images/places/fallback.jpg"; const subtitle = place.category?.name ?? place.map_label ?? "Luogo da scoprire"; const normalizedTitle = place.title.toLowerCase(); const placeHref = normalizedTitle.includes("mulino angeli") ? "/musei/mulino-angeli" : normalizedTitle.includes("strumenti musicali") || normalizedTitle.includes("museo della musica") ? "/musei/museo-della-musica" : `/luoghi/${place.slug}`; return (<a className="place-card" href={placeHref} key={place.id}><div className="place-image" style={{ backgroundImage: `url('${placeImage}')` }} /><div className="place-card-footer"><div><small>{subtitle}</small><h3>{place.title}</h3></div><span className="round-arrow dark-arrow"><ArrowIcon /></span></div></a>); })}</div></div></section>

      <section className="story-section" id="storie"><div className="story-image" style={{ backgroundImage: "url('/images/stories/memoria.jpg')" }} /><div className="story-copy"><p className="eyebrow accent">Storie e memoria</p><h2>Un territorio<br />che si racconta.</h2><p>Fotografie, testimonianze e luoghi custodiscono la memoria della comunità. Un patrimonio da conoscere e tramandare.</p><a className="text-link light-link" href="#storie">Leggi le storie<ArrowIcon /></a></div></section>

      <section className="planning-section" id="organizza"><div className="section-shell planning-grid"><div><p className="eyebrow dark">Organizza la visita</p><h2 className="display-heading">Tutto ciò che serve<br />per partire.</h2></div><div className="planning-links"><a href="#dormire"><span><small>Ospitalità</small><strong>Dove dormire</strong></span><ArrowIcon /></a><a href="#mangiare"><span><small>Sapori</small><strong>Dove mangiare</strong></span><ArrowIcon /></a><a href="#servizi"><span><small>Informazioni</small><strong>Servizi utili</strong></span><ArrowIcon /></a><a href="#come-arrivare"><span><small>Mobilità</small><strong>Come arrivare</strong></span><ArrowIcon /></a></div></div></section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
