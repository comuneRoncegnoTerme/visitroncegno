import Link from "next/link";
import { connection } from "next/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeMap from "@/components/HomeMap";
import MuseumKeyInfo from "@/components/museum/MuseumKeyInfo";
import { MuseumStatusBadge } from "@/components/museum/MuseumStatus";
import museumStyles from "@/components/museum/Museum.module.css";
import { getSiteSettings } from "@/lib/directus";
import { getHomeMapPlaces } from "@/lib/map-places";
import { distanceKm, getMuseums, type Museum } from "@/lib/museums";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Musei di Roncegno Terme",
  description: "Il Mulino Angeli e il Museo degli Strumenti Musicali Popolari: la memoria, il lavoro e i suoni di Roncegno Terme. Orari, visite e come arrivare.",
  path: "/musei",
  image: "/images/musei/museo-della-musica/strumenti.jpg",
});

const cards: { id: Museum["id"]; visual: string; reverse?: boolean; text: string; cta: string; highlights: string[] }[] = [
  {
    id: "mulino-angeli",
    visual: "mill",
    text: "Il mulino ad acqua sul Brenta che ha macinato granoturco e cereali fino agli anni Cinquanta. Le macchine sono ancora al loro posto su tre piani, e nella casa del mugnaio abitano i cinquanta spaventapasseri raccolti dal fotografo Flavio Faganello.",
    cta: "Entra nel Mulino",
    highlights: ["La ruota e le macine", "Cinquanta spaventapasseri", "Laboratori per scuole e famiglie"],
  },
  {
    id: "museo-della-musica",
    visual: "music",
    reverse: true,
    text: "Un museo “da vedere e da suonare”, con strumenti popolari provenienti da tutto il mondo e un percorso pensato anche per famiglie, scuole e attività guidate.",
    cta: "Entra nel Museo",
    highlights: ["Circa mille strumenti", "Alcuni si possono provare", "Parco Musicale"],
  },
];

function formatKm(value: number) {
  return `${value.toLocaleString("it-IT", { maximumFractionDigits: 1 })} km`;
}

export default async function MuseumsPage() {
  await connection();
  const [settings, museums, mapPlaces] = await Promise.all([getSiteSettings(), getMuseums(), getHomeMapPlaces()]);
  const mulino = museums["mulino-angeli"];
  const musica = museums["museo-della-musica"];

  const museumPlaceIds = new Set([mulino.placeId, musica.placeId].filter((id): id is number => id !== null));
  const museumPins = mapPlaces.filter((place) => museumPlaceIds.has(place.id));
  const between =
    mulino.latitude !== null && mulino.longitude !== null && musica.latitude !== null && musica.longitude !== null
      ? distanceKm({ latitude: mulino.latitude, longitude: mulino.longitude }, { latitude: musica.latitude, longitude: musica.longitude })
      : null;

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Polo museale · Roncegno Terme</p>
          <h1>I musei di Roncegno</h1>
          <p className={styles.lead}>Un antico mulino che conserva gesti, ingranaggi e memoria contadina. Un museo in cui gli strumenti musicali si possono ascoltare e, durante le visite guidate, anche suonare.</p>
          <div className={styles.heroStatusList}>
            {[mulino, musica].map((item) => (
              <a key={item.id} href={`#${item.id}`} className={styles.heroStatusItem}>
                <strong>{item.title}</strong>
                <MuseumStatusBadge hours={item.openingHours} fallback="Orari variabili · verifica il calendario" />
              </a>
            ))}
          </div>
          <a href="#musei" className={styles.heroCta}>Orari e informazioni dei due musei ↓</a>
        </div>
        <div className={styles.heroCollage} aria-hidden="true">
          <div className={styles.heroPhotoOne}><span>Mulino Angeli</span></div>
          <div className={styles.heroPhotoTwo}><span>Museo degli Strumenti Musicali Popolari</span></div>
        </div>
      </section>

      <section className={styles.cards} id="musei">
        {cards.map((card) => {
          const item = museums[card.id];
          return (
            <article className={`${styles.card} ${card.reverse ? styles.reverse : ""}`} id={card.id} key={card.id}>
              <Link href={item.path} className={`${styles.cardVisual} ${styles[card.visual]}`} aria-label={item.title} tabIndex={-1} />
              <div className={styles.cardCopy}>
                <p className={styles.cardArea}>{item.area}</p>
                <h2>{item.title}</h2>
                <MuseumStatusBadge hours={item.openingHours} className={styles.cardStatus} />
                <p>{card.text}</p>
                <ul className={styles.highlights}>
                  {card.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>
                <MuseumKeyInfo museum={item} compact />
                <p className={styles.cardAddress}>{item.address}</p>
                <div className={styles.cardActions}>
                  <Link href={item.path} className={styles.link}>{card.cta} <span>→</span></Link>
                  <Link href={`${item.path}#visita`} className={styles.secondaryLink}>Orari completi e visite</Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.bridge}>
        <div className={styles.bridgeCopy}>
          <h2>Visitarli tutti e due</h2>
          <p>I due musei raccontano aspetti diversi dello stesso territorio: il lavoro, la creatività e la memoria del paese. Il Mulino è a Marter, nel fondovalle; il Museo degli Strumenti Musicali a Santa Brigida, poco sopra il centro.</p>
          {between !== null && <p className={styles.distance}><strong>{formatKm(between)}</strong> in linea d’aria tra i due musei</p>}
          <ol className={styles.plan}>
            <li><strong>Controlla gli orari</strong><span>Gli orari dei due musei sono diversi e cambiano con le stagioni.</span></li>
            <li><strong>Prenota la guida</strong><span>Al Museo degli Strumenti Musicali la visita guidata permette di provare alcuni strumenti.</span></li>
            <li><strong>Resta per la giornata</strong><span>Sentieri, terme e posti dove mangiare sono a pochi minuti.</span></li>
          </ol>
          <div className={styles.bridgeActions}>
            <Link href="/organizza-la-visita" className={styles.link}>Organizza la visita <span>→</span></Link>
            <Link href="/percorsi" className={styles.secondaryLink}>Percorsi e sentieri</Link>
          </div>
        </div>
        {museumPins.length > 0 && (
          <div className={`${styles.bridgeMap} ${museumStyles.arriveMap}`}>
            <HomeMap places={museumPins} compact showFilters={false} />
          </div>
        )}
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
