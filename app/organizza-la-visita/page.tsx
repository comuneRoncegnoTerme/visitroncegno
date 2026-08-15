import type { Metadata } from "next";
import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  getDirectusAssetUrl,
  getMapPlaces,
  getSiteSettings,
  type MapPlace,
} from "@/lib/directus";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Organizza la visita | Visit Roncegno",
  description: "Dove dormire, dove mangiare, come arrivare e servizi utili per vivere Roncegno Terme.",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function normalizeLabel(place: MapPlace) {
  return (place.map_label ?? "").toLocaleLowerCase("it-IT");
}

function isSleeping(place: MapPlace) {
  const label = normalizeLabel(place);
  return ["hotel", "b&b", "bed", "agritur", "allogg", "ospital", "dormire", "appartament"].some((term) => label.includes(term));
}

function isEating(place: MapPlace) {
  const label = normalizeLabel(place);
  return ["ristor", "pizzer", "bar", "oster", "trattor", "mangiare", "enotec", "locale"].some((term) => label.includes(term));
}

function PlaceStrip({ places, emptyText }: { places: MapPlace[]; emptyText: string }) {
  if (places.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <div className={styles.placeGrid}>
      {places.slice(0, 6).map((place) => {
        const image = getDirectusAssetUrl(place.image);
        return (
          <Link className={styles.placeCard} href={`/luoghi/${place.slug}`} key={place.id}>
            <div className={styles.placeImage} style={{ backgroundImage: image ? `url('${image}')` : undefined }} />
            <div className={styles.placeCopy}>
              <small>{place.map_label ?? "Roncegno Terme"}</small>
              <strong>{place.title}</strong>
              {place.summary && <p>{place.summary}</p>}
              <span>Scopri <ArrowIcon /></span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function OrganizzaLaVisitaPage() {
  const [siteSettings, mapPlaces] = await Promise.all([
    getSiteSettings(),
    getMapPlaces(),
  ]);

  const placesWithCoordinates = mapPlaces
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

  const sleeping = mapPlaces.filter(isSleeping);
  const eating = mapPlaces.filter(isEating);

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Pianifica il soggiorno</p>
          <h1>Organizza la tua visita.</h1>
          <p className={styles.lead}>
            Dormire, mangiare, arrivare e orientarsi sul territorio: tutte le informazioni pratiche in un unico punto, senza rimbalzare tra sezioni diverse del sito.
          </p>
          <nav className={styles.jumpNav} aria-label="Sezioni della pagina">
            <a href="#dormire">Dormire</a>
            <a href="#mangiare">Mangiare</a>
            <a href="#mappa-visita">Mappa</a>
            <a href="#come-arrivare">Come arrivare</a>
            <a href="#servizi">Servizi</a>
          </nav>
        </div>
      </section>

      <section className={styles.gateway}>
        <div className={styles.gatewayGrid}>
          <a href="#dormire" className={styles.gatewayCard}>
            <span>01 · Ospitalità</span>
            <strong>Dove dormire</strong>
            <p>Hotel, B&B, agriturismi, appartamenti e altre strutture ricettive.</p>
            <ArrowIcon />
          </a>
          <a href="#mangiare" className={styles.gatewayCard}>
            <span>02 · Sapori</span>
            <strong>Dove mangiare</strong>
            <p>Ristoranti, pizzerie, bar e luoghi dove scoprire i sapori locali.</p>
            <ArrowIcon />
          </a>
          <a href="#come-arrivare" className={styles.gatewayCard}>
            <span>03 · Mobilità</span>
            <strong>Come arrivare</strong>
            <p>Indicazioni essenziali per raggiungere Roncegno e muoversi sul territorio.</p>
            <ArrowIcon />
          </a>
          <a href="#servizi" className={styles.gatewayCard}>
            <span>04 · Informazioni</span>
            <strong>Servizi utili</strong>
            <p>Parcheggi, informazioni, servizi e riferimenti utili durante il soggiorno.</p>
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section className={styles.contentSection} id="dormire">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Ospitalità</p><h2>Dove dormire</h2></div>
          <p>Le strutture pubblicate nel Content Hub compaiono qui automaticamente quando sono indicate come hotel, B&B, agriturismo, appartamento o altra forma di ospitalità.</p>
        </div>
        <PlaceStrip places={sleeping} emptyText="Le strutture ricettive saranno pubblicate qui dal Content Hub." />
      </section>

      <section className={`${styles.contentSection} ${styles.alt}`} id="mangiare">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Sapori</p><h2>Dove mangiare</h2></div>
          <p>Ristoranti e locali entrano nella stessa struttura dei luoghi: una sola scheda alimenta pagina, mappa e questa landing.</p>
        </div>
        <PlaceStrip places={eating} emptyText="Ristoranti e locali saranno pubblicati qui dal Content Hub." />
      </section>

      <section className={styles.mapSection} id="mappa-visita">
        <div className={styles.mapHeading}>
          <p className={styles.eyebrow}>Orientati sul territorio</p>
          <h2>Tutto sulla mappa.</h2>
          <p>I punti vengono inquadrati automaticamente in base alla loro distanza. Tocca un marker per aprire la scheda del luogo.</p>
        </div>
        <div className={styles.mapFrame}>
          <HomeMap places={placesWithCoordinates} compact />
        </div>
      </section>

      <section className={styles.practicalGrid}>
        <article className={styles.practicalCard} id="come-arrivare">
          <p className={styles.eyebrow}>Mobilità</p>
          <h2>Come arrivare</h2>
          <p>Roncegno Terme si trova in Valsugana. Questa sezione è predisposta per raccogliere indicazioni in auto, trasporto pubblico, parcheggi e mobilità locale dal Content Hub.</p>
          <Link href="/#mappa">Apri la mappa del territorio <ArrowIcon /></Link>
        </article>
        <article className={styles.practicalCard} id="servizi">
          <p className={styles.eyebrow}>Durante la visita</p>
          <h2>Servizi utili</h2>
          <p>Info point, parcheggi, servizi pubblici e riferimenti pratici possono essere gestiti come luoghi e visualizzati sia qui sia sulla mappa.</p>
          <Link href="/luoghi">Vedi i luoghi pubblicati <ArrowIcon /></Link>
        </article>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
