import type { ReactNode } from "react";
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

// Le due "porte" dell'apertura: ognuna con i colori e le immagini della pagina del suo museo.
const doors: { id: Museum["id"]; theme: "mill" | "music"; title: ReactNode; hook: string; senses: string[]; cta: string }[] = [
  {
    id: "mulino-angeli",
    theme: "mill",
    title: <>Mulino <em>Angeli</em></>,
    hook: "L’acqua del Brenta, le macine ancora al loro posto e cinquanta spaventapasseri nella casa del mugnaio.",
    senses: ["Ruota e macine", "Tre piani di macchine", "Spaventapasseri"],
    cta: "Entra nel Mulino",
  },
  {
    id: "museo-della-musica",
    theme: "music",
    title: <>Museo degli Strumenti <em>Musicali Popolari</em></>,
    hook: "Circa mille strumenti da tutto il mondo: un museo da vedere e, con la guida, anche da suonare.",
    senses: ["Mille strumenti", "Alcuni si provano", "Parco Musicale"],
    cta: "Entra nel Museo",
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

      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Polo museale · Roncegno Terme</p>
          <h1>I musei di Roncegno</h1>
        </div>
        <p className={styles.lead}>Due porte sullo stesso paese. Da una parte il rumore dell’acqua e delle macine, dall’altra i suoni di strumenti arrivati da tutto il mondo.</p>
      </header>

      <section className={styles.doors} aria-label="I due musei">
        {doors.map((door) => {
          const item = museums[door.id];
          return (
            <Link href={item.path} className={`${styles.door} ${styles[door.theme]}`} id={door.id} key={door.id}>
              <span className={styles.doorImage} aria-hidden="true" />
              {door.theme === "mill" && <span className={styles.scarecrow} aria-hidden="true" />}
              <span className={styles.doorBody}>
                <span className={styles.doorArea}>{item.area}</span>
                <h2>{door.title}</h2>
                <span className={styles.doorHook}>{door.hook}</span>
                <span className={styles.doorSenses}>{door.senses.join(" · ")}</span>
                <span className={styles.doorFoot}>
                  <MuseumStatusBadge hours={item.openingHours} fallback="Aperture variabili" />
                  <span className={styles.doorCta}>{door.cta} <span aria-hidden="true">→</span></span>
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      <section className={styles.practical} id="musei" aria-labelledby="prima-di-partire">
        <div className={styles.practicalHead}>
          <p className={styles.eyebrowDark}>Prima di partire</p>
          <h2 id="prima-di-partire">Orari, ingresso e contatti</h2>
          <p>Gli orari dei due musei sono diversi e cambiano con le stagioni. Qui trovi quelli del periodo in corso; gli orari completi sono nella pagina di ciascun museo.</p>
        </div>
        <div className={styles.practicalGrid}>
          {[mulino, musica].map((item) => (
            <article key={item.id} className={`${styles.practicalCard} ${item.id === "mulino-angeli" ? styles.millCard : styles.musicCard}`}>
              <p className={styles.cardArea}>{item.area}</p>
              <h3><Link href={item.path}>{item.title}</Link></h3>
              <MuseumKeyInfo museum={item} compact />
              <p className={styles.cardAddress}>{item.address}</p>
              <Link href={`${item.path}#visita`} className={styles.secondaryLink}>Orari completi e visite</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bridge}>
        <div className={styles.bridgeCopy}>
          <p className={styles.eyebrowDark}>Una giornata a Roncegno</p>
          <h2>Visitarli tutti e due</h2>
          <p>I due musei raccontano aspetti diversi dello stesso territorio: il lavoro, la creatività e la memoria del paese. Il Mulino è a Marter, nel fondovalle; il Museo degli Strumenti Musicali a Santa Brigida, poco sopra il centro.</p>
          {between !== null && <p className={styles.distance}><strong>{formatKm(between)}</strong> in linea d’aria tra i due musei</p>}
          <ol className={styles.plan}>
            <li><strong>Controlla gli orari</strong><span>Gli orari dei due musei sono diversi e cambiano con le stagioni.</span></li>
            <li><strong>Prenota la guida</strong><span>Al Museo degli Strumenti Musicali la visita guidata permette di provare alcuni strumenti.</span></li>
            <li><strong>Con la classe</strong><span>Per le scuole c’è la doppia visita guidata, Mulino e Museo degli Strumenti, a 6 € a bambino. <Link href="/musei/mulino-angeli#scuole">Proposte per le scuole</Link></span></li>
            <li><strong>Resta per la giornata</strong><span>Sentieri, terme e posti dove mangiare sono a pochi minuti.</span></li>
          </ol>
          <div className={styles.bridgeActions}>
            <Link href="/organizza-la-visita" className={styles.link}>Organizza la visita <span>→</span></Link>
            <Link href="/percorsi" className={styles.secondaryLink}>Percorsi e sentieri</Link>
          </div>
        </div>
        {museumPins.length > 0 ? (
          <div className={`${styles.bridgeMap} ${museumStyles.arriveMap}`}>
            <HomeMap places={museumPins} compact showFilters={false} />
          </div>
        ) : (
          <div className={styles.bridgePhoto} aria-hidden="true" />
        )}
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
