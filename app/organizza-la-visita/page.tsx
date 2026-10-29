import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  getDirectusImageUrl,
  getSiteSettings,
} from "@/lib/directus";
import { getEditorialList, type EditorialItem } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import {
  isEatingPlace,
  isServicePlace,
  isSleepingPlace,
} from "@/lib/place-taxonomy";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Organizza la visita",
  description: "Dove dormire, dove mangiare, come arrivare e servizi utili per visitare Roncegno Terme.",
  alternates: { canonical: "/organizza-la-visita" },
};

const OFFICIAL_TRAVEL_LINKS = {
  valsugana: "https://www.visitvalsugana.it/it/come-arrivare/",
  trentinoTrasporti: "https://www.trentinotrasporti.it/it/",
  railway: "https://www.trentinotrasporti.it/it/viaggia-con-noi/ferrovia?app_v2=true%2F",
  muoversi: "https://www.trentinotrasporti.it/it/viaggia-con-noi/app-muoversi",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaceStrip({ places, emptyText }: { places: EditorialItem[]; emptyText: string }) {
  if (places.length === 0) return <p className={styles.empty}>{emptyText}</p>;

  return (
    <div className={styles.placeGrid}>
      {places.slice(0, 6).map((place) => {
        const image = getDirectusImageUrl(place.image);
        return (
          <Link className={styles.placeCard} href={placeHref(place)} key={place.id}>
            <div className={styles.placeImage} style={{ backgroundImage: image ? `url('${image}')` : undefined }} />
            <div className={styles.placeCopy}>
              <small>{place.map_label ?? place.category?.name ?? "Roncegno Terme"}</small>
              <strong>{place.title}</strong>
              {place.summary && <p>{place.summary}</p>}
              <span>Vai <ArrowIcon /></span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function OrganizzaLaVisitaPage() {
  await connection();
  const [siteSettings, allPlaces] = await Promise.all([
    getSiteSettings(),
    getEditorialList("places"),
  ]);

  const sleeping = allPlaces.filter(isSleepingPlace);
  const eating = allPlaces.filter(isEatingPlace);
  const services = allPlaces.filter(isServicePlace);
  const heroPhotoA = getDirectusImageUrl(sleeping[0]?.image ?? eating[0]?.image);
  const heroPhotoB = getDirectusImageUrl(eating[0]?.image ?? services[0]?.image);

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} />

      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroTitle}>
            <h1>Organizza la visita</h1>
          </div>
          <div className={styles.heroSide}>
            <p className={styles.lead}>Dove dormire e mangiare, come arrivare e i servizi utili, tutto in una pagina.</p>
            <nav className={styles.jumpNav} aria-label="Sezioni della pagina">
              <a href="#dormire">Dormire</a>
              <a href="#mangiare">Mangiare</a>
              <a href="#come-arrivare">Come arrivare</a>
              <Link href="/mappa">Mappa</Link>
              <a href="#servizi">Servizi</a>
            </nav>
          </div>
          {(heroPhotoA || heroPhotoB) && (
            <div className={styles.heroPhotos} aria-hidden="true">
              {heroPhotoA && <span className={styles.heroPhotoA} style={{ backgroundImage: `url('${heroPhotoA}')` }} />}
              {heroPhotoB && <span className={styles.heroPhotoB} style={{ backgroundImage: `url('${heroPhotoB}')` }} />}
            </div>
          )}
        </div>
      </section>

      <section className={styles.gateway}>
        <div className={styles.gatewayGrid}>
          <a href="#dormire" className={styles.gatewayCard}><strong>Dove dormire</strong><p>Strutture ricettive e soluzioni per fermarsi a Roncegno e nei dintorni.</p><ArrowIcon /></a>
          <a href="#mangiare" className={styles.gatewayCard}><strong>Dove mangiare</strong><p>Ristoranti, pizzerie, bar e locali per una pausa o una cena sul territorio.</p><ArrowIcon /></a>
          <a href="#come-arrivare" className={styles.gatewayCard}><strong>Come arrivare</strong><p>Auto, treno, autobus e indicazioni utili per pianificare il viaggio.</p><ArrowIcon /></a>
          <a href="#servizi" className={styles.gatewayCard}><strong>Servizi utili</strong><p>Parcheggi, punti informativi e altri riferimenti pratici durante la visita.</p><ArrowIcon /></a>
        </div>
      </section>

      <section className={styles.contentSection} id="dormire">
        <div className={styles.sectionHeading}><div><h2>Dove dormire</h2></div><p>Una selezione delle strutture ricettive pubblicate sul territorio. Apri una scheda per trovare descrizione, contatti e informazioni disponibili.</p></div>
        <PlaceStrip places={sleeping} emptyText="Le strutture ricettive saranno disponibili presto." />
      </section>

      <section className={`${styles.contentSection} ${styles.alt}`} id="mangiare">
        <div className={styles.sectionHeading}><div><h2>Dove mangiare</h2></div><p>Locali e ristorazione a Roncegno Terme: consulta le schede per scegliere dove fermarti durante la giornata.</p></div>
        <PlaceStrip places={eating} emptyText="Ristoranti e locali saranno disponibili presto." />
      </section>

      <section className={styles.travelSection} id="come-arrivare">
        <div className={styles.travelHeading}><div><h2>Come arrivare</h2></div><p>Per orari, coincidenze e variazioni del servizio consulta sempre i canali ufficiali prima della partenza.</p></div>
        <div className={styles.travelGrid}>
          <article className={styles.travelCard}><h3>In auto</h3><p>Roncegno Terme si trova in Valsugana ed è raggiungibile attraverso la SS47. Per chi arriva dall’autostrada A22, il collegamento indicato dall’APT Valsugana passa da Trento Sud verso la Valsugana.</p><a href={OFFICIAL_TRAVEL_LINKS.valsugana} target="_blank" rel="noreferrer">Indicazioni APT Valsugana ↗</a></article>
          <article className={styles.travelCard}><h3>In treno</h3><p>La ferrovia della Valsugana serve il territorio con la stazione Roncegno Bagni-Marter, sulla direttrice Trento–Borgo Valsugana–Bassano.</p><a href={OFFICIAL_TRAVEL_LINKS.railway} target="_blank" rel="noreferrer">Consulta ferrovia e avvisi ↗</a></article>
          <article className={styles.travelCard}><h3>In autobus</h3><p>Roncegno è servita anche dal trasporto pubblico extraurbano. Linee e frequenze possono cambiare tra periodo scolastico, feriale e stagionale.</p><a href={OFFICIAL_TRAVEL_LINKS.trentinoTrasporti} target="_blank" rel="noreferrer">Orari Trentino Trasporti ↗</a></article>
          <article className={styles.travelCard}><h3>Muoversi sul posto</h3><p>Per pianificare spostamenti, verificare fermate e tempi reali di attesa puoi usare il servizio ufficiale Muoversi in Trentino. Per parcheggi e servizi locali usa anche la mappa del sito.</p><div className={styles.travelLinks}><a href={OFFICIAL_TRAVEL_LINKS.muoversi} target="_blank" rel="noreferrer">Muoversi in Trentino ↗</a><Link href="/mappa">Apri la mappa</Link></div></article>
        </div>
      </section>

      <section className={styles.mapSection} id="mappa-visita">
        <div className={styles.mapHeading}>
          <h2>Mappa</h2>
          <p>Luoghi da vedere, ristoranti, alloggi e servizi sulla mappa, con le indicazioni per arrivarci. Oppure la cartina disegnata da Fabio Vettori.</p>
          <div className={styles.mapLinks}>
            <Link href="/mappa">Apri la mappa</Link>
            <Link href="/cartina">La cartina disegnata</Link>
          </div>
        </div>
        <Link href="/cartina" className={styles.mapPreview} aria-label="La cartina disegnata di Roncegno">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/cartina/cartina-roncegno-preview.webp" alt="" loading="lazy" />
        </Link>
      </section>

      <section className={`${styles.contentSection} ${styles.alt}`} id="servizi">
        <div className={styles.sectionHeading}><div><h2>Servizi utili</h2></div><p>Parcheggi, punti informativi, stazione e altri servizi pratici raccolti in un unico elenco e, quando disponibili, anche sulla mappa. In bici elettrica? <Link className={styles.inlineLink} href="/e-bike">I cinque punti di ricarica e-bike →</Link></p></div>
        <PlaceStrip places={services} emptyText="I servizi utili saranno disponibili presto." />
      </section>

      <section className={styles.nearbySection} id="dintorni">
        <div className={styles.nearbyText}>
          <h2>Nei dintorni</h2>
          <h3>Arte Sella</h3>
          <p>
            In Val di Sella, dimora preferita di Alcide Degasperi, un’esposizione a cielo aperto di opere fatte di foglie,
            rami e tronchi, che col tempo si fondono con il bosco. Il simbolo è la Cattedrale Vegetale.
          </p>
          <a href="https://www.artesella.it/" target="_blank" rel="noreferrer">Il sito di Arte Sella ↗</a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/inforoncegno/arte-sella.jpg" width={341} height={286} alt="Un viale di alberi ad Arte Sella" loading="lazy" />
      </section>

      <section className={styles.practicalGrid}>
        <article className={styles.practicalCard}><h2>Orari e avvisi</h2><p>Orari ferroviari e autobus, deviazioni e avvisi possono cambiare. Per il viaggio usa sempre le informazioni aggiornate degli operatori ufficiali.</p><a href={OFFICIAL_TRAVEL_LINKS.trentinoTrasporti} target="_blank" rel="noreferrer">Apri Trentino Trasporti <ArrowIcon /></a></article>
        <article className={styles.practicalCard}><h2>Contatti utili</h2><p>Per informazioni scrivi o chiama:</p>{siteSettings.contact_email ? <a href={`mailto:${siteSettings.contact_email}`}>Scrivi a {siteSettings.contact_email} <ArrowIcon /></a> : siteSettings.contact_phone ? <a href={`tel:${siteSettings.contact_phone.replace(/\s+/g, "")}`}>Chiama {siteSettings.contact_phone} <ArrowIcon /></a> : <Link href="/luoghi">Esplora i luoghi <ArrowIcon /></Link>}</article>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
