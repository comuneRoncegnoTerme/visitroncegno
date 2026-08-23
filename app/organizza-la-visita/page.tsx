import type { Metadata } from "next";
import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  getDirectusAssetUrl,
  getMapPlaces,
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizza la visita",
  description: "Dove dormire, dove mangiare, come arrivare e servizi utili per vivere Roncegno Terme.",
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
  if (places.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <div className={styles.placeGrid}>
      {places.slice(0, 6).map((place) => {
        const image = getDirectusAssetUrl(place.image);
        return (
          <Link className={styles.placeCard} href={placeHref(place)} key={place.id}>
            <div className={styles.placeImage} style={{ backgroundImage: image ? `url('${image}')` : undefined }} />
            <div className={styles.placeCopy}>
              <small>{place.map_label ?? place.category?.name ?? "Roncegno Terme"}</small>
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
  const [siteSettings, mapPlaces, allPlaces] = await Promise.all([
    getSiteSettings(),
    getMapPlaces(),
    getEditorialList("places"),
  ]);

  const editorialById = new Map(allPlaces.map((place) => [place.id, place]));
  const placesWithCoordinates = mapPlaces
    .filter((place) => place.latitude !== null && place.longitude !== null)
    .map((place) => {
      const editorial = editorialById.get(place.id);
      return {
        id: place.id,
        title: place.title,
        slug: place.slug,
        summary: place.summary,
        imageUrl: getDirectusAssetUrl(place.image),
        latitude: place.latitude as number,
        longitude: place.longitude as number,
        mapLabel: place.map_label,
        mapIcon: place.map_icon,
        placeType: editorial?.place_type,
        detailMode: editorial?.detail_mode,
        canonicalPath: editorial?.canonical_path,
        externalDetailUrl: editorial?.external_detail_url,
      };
    });

  const sleeping = allPlaces.filter(isSleepingPlace);
  const eating = allPlaces.filter(isEatingPlace);
  const services = allPlaces.filter(isServicePlace);

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Pianifica il soggiorno</p>
          <h1>Organizza la tua visita.</h1>
          <p className={styles.lead}>
            Trova dove dormire e mangiare, orientati sulla mappa e raccogli in un solo posto le informazioni utili per vivere Roncegno Terme con semplicità.
          </p>
          <nav className={styles.jumpNav} aria-label="Sezioni della pagina">
            <a href="#dormire">Dormire</a>
            <a href="#mangiare">Mangiare</a>
            <a href="#come-arrivare">Come arrivare</a>
            <a href="#mappa-visita">Mappa</a>
            <a href="#servizi">Servizi</a>
          </nav>
        </div>
      </section>

      <section className={styles.gateway}>
        <div className={styles.gatewayGrid}>
          <a href="#dormire" className={styles.gatewayCard}>
            <span>01 · Ospitalità</span>
            <strong>Dove dormire</strong>
            <p>Strutture ricettive e soluzioni per fermarsi a Roncegno e nei dintorni.</p>
            <ArrowIcon />
          </a>
          <a href="#mangiare" className={styles.gatewayCard}>
            <span>02 · Sapori</span>
            <strong>Dove mangiare</strong>
            <p>Ristoranti, pizzerie, bar e locali per una pausa o una cena sul territorio.</p>
            <ArrowIcon />
          </a>
          <a href="#come-arrivare" className={styles.gatewayCard}>
            <span>03 · Mobilità</span>
            <strong>Come arrivare</strong>
            <p>Auto, treno, autobus e indicazioni utili per pianificare il viaggio.</p>
            <ArrowIcon />
          </a>
          <a href="#servizi" className={styles.gatewayCard}>
            <span>04 · Informazioni</span>
            <strong>Servizi utili</strong>
            <p>Parcheggi, punti informativi e altri riferimenti pratici durante la visita.</p>
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section className={styles.contentSection} id="dormire">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Ospitalità</p><h2>Dove dormire</h2></div>
          <p>Una selezione delle strutture ricettive pubblicate sul territorio. Apri una scheda per trovare descrizione, contatti e informazioni disponibili.</p>
        </div>
        <PlaceStrip places={sleeping} emptyText="Le strutture ricettive saranno disponibili presto." />
      </section>

      <section className={`${styles.contentSection} ${styles.alt}`} id="mangiare">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Sapori</p><h2>Dove mangiare</h2></div>
          <p>Locali e ristorazione a Roncegno Terme: consulta le schede per scegliere dove fermarti durante la giornata.</p>
        </div>
        <PlaceStrip places={eating} emptyText="Ristoranti e locali saranno disponibili presto." />
      </section>

      <section className={styles.travelSection} id="come-arrivare">
        <div className={styles.travelHeading}>
          <div>
            <p className={styles.eyebrow}>Come arrivare</p>
            <h2>Raggiungere Roncegno.</h2>
          </div>
          <p>Le indicazioni qui sotto restano volutamente essenziali. Per orari, coincidenze e variazioni del servizio consulta sempre i canali ufficiali prima della partenza.</p>
        </div>

        <div className={styles.travelGrid}>
          <article className={styles.travelCard}>
            <span>01</span>
            <h3>In auto</h3>
            <p>Roncegno Terme si trova in Valsugana ed è raggiungibile attraverso la SS47. Per chi arriva dall’autostrada A22, il collegamento indicato dall’APT Valsugana passa da Trento Sud verso la Valsugana.</p>
            <a href={OFFICIAL_TRAVEL_LINKS.valsugana} target="_blank" rel="noreferrer">Indicazioni APT Valsugana ↗</a>
          </article>

          <article className={styles.travelCard}>
            <span>02</span>
            <h3>In treno</h3>
            <p>La ferrovia della Valsugana serve il territorio con la stazione Roncegno Bagni-Marter, sulla direttrice Trento–Borgo Valsugana–Bassano.</p>
            <a href={OFFICIAL_TRAVEL_LINKS.railway} target="_blank" rel="noreferrer">Consulta ferrovia e avvisi ↗</a>
          </article>

          <article className={styles.travelCard}>
            <span>03</span>
            <h3>In autobus</h3>
            <p>Roncegno è servita anche dal trasporto pubblico extraurbano. Linee e frequenze possono cambiare tra periodo scolastico, feriale e stagionale.</p>
            <a href={OFFICIAL_TRAVEL_LINKS.trentinoTrasporti} target="_blank" rel="noreferrer">Orari Trentino Trasporti ↗</a>
          </article>

          <article className={styles.travelCard}>
            <span>04</span>
            <h3>Muoversi sul posto</h3>
            <p>Per pianificare spostamenti, verificare fermate e tempi reali di attesa puoi usare il servizio ufficiale Muoversi in Trentino. Per parcheggi e servizi locali usa anche la mappa qui sotto.</p>
            <div className={styles.travelLinks}>
              <a href={OFFICIAL_TRAVEL_LINKS.muoversi} target="_blank" rel="noreferrer">Muoversi in Trentino ↗</a>
              <a href="#mappa-visita">Apri la mappa ↓</a>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.mapSection} id="mappa-visita">
        <div className={styles.mapHeading}>
          <p className={styles.eyebrow}>Orientati sul territorio</p>
          <h2>Tutto sulla mappa.</h2>
          <p>Filtra luoghi, ristorazione, ospitalità e servizi per capire subito cosa trovi vicino a te e come distribuire la visita.</p>
        </div>
        <div className={styles.mapFrame}>
          <HomeMap places={placesWithCoordinates} compact />
        </div>
      </section>

      <section className={`${styles.contentSection} ${styles.alt}`} id="servizi">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Durante la visita</p><h2>Servizi utili</h2></div>
          <p>Parcheggi, punti informativi, stazione e altri servizi pratici raccolti in un unico elenco e, quando disponibili, anche sulla mappa.</p>
        </div>
        <PlaceStrip places={services} emptyText="I servizi utili saranno disponibili presto." />
      </section>

      <section className={styles.practicalGrid}>
        <article className={styles.practicalCard}>
          <p className={styles.eyebrow}>Prima di partire</p>
          <h2>Controlla gli aggiornamenti.</h2>
          <p>Orari ferroviari e autobus, deviazioni e avvisi possono cambiare. Per il viaggio usa sempre le informazioni aggiornate degli operatori ufficiali.</p>
          <a href={OFFICIAL_TRAVEL_LINKS.trentinoTrasporti} target="_blank" rel="noreferrer">Apri Trentino Trasporti <ArrowIcon /></a>
        </article>
        <article className={styles.practicalCard}>
          <p className={styles.eyebrow}>Hai bisogno di aiuto?</p>
          <h2>Contatti utili</h2>
          <p>Per informazioni sul territorio puoi utilizzare i riferimenti ufficiali pubblicati nel sito.</p>
          {siteSettings.contact_email ? (
            <a href={`mailto:${siteSettings.contact_email}`}>Scrivi a {siteSettings.contact_email} <ArrowIcon /></a>
          ) : siteSettings.contact_phone ? (
            <a href={`tel:${siteSettings.contact_phone.replace(/\s+/g, "")}`}>Chiama {siteSettings.contact_phone} <ArrowIcon /></a>
          ) : (
            <Link href="/luoghi">Esplora i luoghi <ArrowIcon /></Link>
          )}
        </article>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
