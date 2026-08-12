import Link from "next/link";
import {
  getDirectusAssetUrl,
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getUpcomingEvents,
} from "@/lib/directus";
import styles from "./page.module.css";

const chestnutStories = [
  { label: "Storia", title: "Il castagno nella storia", href: "/it/sentieri/il-castagno-nella-storia-3-1" },
  { label: "Natura", title: "Aspetti botanici", href: "/it/sentieri/aspetti-botanici-3-2" },
  { label: "Tradizioni", title: "Utilizzo delle castagne", href: "/it/sentieri/utilizzo-delle-castagne-3-3" },
  { label: "Paesaggio", title: "Conservazione dei castagneti", href: "/it/sentieri/conservazione-castagneti-3-4" },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default async function LaunchPage() {
  const [homepage, events, places, experiences] = await Promise.all([
    getHomepage(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getExperiences(),
  ]);

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";
  const launchExperiences = experiences.slice(0, 4);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/lancio" className={styles.brand}>Visit Roncegno</Link>
        <nav>
          <a href="#esperienze">Esperienze</a>
          <a href="#percorso">Sentieri</a>
          <a href="#eventi">Eventi</a>
          <Link href="/festa-della-castagna" className={styles.navFeature}>Festa della Castagna</Link>
        </nav>
      </header>

      <section className={styles.hero} style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className={styles.heroShade} />
        <div className={styles.heroGrain} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Trentino · Valsugana</p>
          <h1>Roncegno<br />Terme, da vivere.</h1>
          <div className={styles.heroBottom}>
            <p>{homepage.hero_description ?? "Tra castagneti, terme, masi e boschi del Lagorai. Un luogo da attraversare lentamente, seguendo le storie del territorio."}</p>
            <div className={styles.actions}>
              <a href="#esperienze" className={styles.primary}>Inizia a scoprire <Arrow /></a>
              <Link href="/festa-della-castagna" className={styles.secondary}>Festa della Castagna</Link>
            </div>
          </div>
        </div>
        <div className={styles.heroAside}>
          <span>46°03′ N</span>
          <span>Valsugana</span>
          <span>Trentino</span>
        </div>
        <a href="#festa" className={styles.scrollCue}>Scopri ↓</a>
      </section>

      <section className={styles.festa} id="festa">
        <div className={styles.festaVisual}>
          <div className={styles.festaNumber}>01</div>
          <div className={styles.festaBadge}>Evento di lancio</div>
          <div className={styles.festaPhoto} style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
        <div className={styles.festaCopy}>
          <p className={styles.eyebrow}>Autunno · Roncegno Terme</p>
          <h2>La Festa della Castagna diventa un viaggio nel territorio.</h2>
          <p className={styles.lead}>
            A Roncegno la castagna non è soltanto un prodotto autunnale: per secoli è stata alimento,
            lavoro, paesaggio e memoria. Il nuovo Visit Roncegno parte da qui, mettendo insieme festa,
            sentieri, pannelli e audioguide.
          </p>
          <div className={styles.factRow}>
            <div><strong>11 km</strong><span>Circuito del Castagno</span></div>
            <div><strong>4 storie</strong><span>Da ascoltare sul territorio</span></div>
            <div><strong>1 esperienza</strong><span>Dal paese ai castagneti</span></div>
          </div>
          <Link href="/festa-della-castagna" className={styles.textLink}>Entra nella Festa della Castagna <Arrow /></Link>
        </div>
      </section>

      <section className={styles.experiences} id="esperienze">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Vivi Roncegno</p>
          <h2>Un territorio.<br />Quattro ritmi diversi.</h2>
          <p>Scegli come viverlo: a piedi, attraverso le sue storie, nel benessere o seguendo la vita del paese.</p>
        </div>
        <div className={styles.experienceGrid}>
          {launchExperiences.map((experience, index) => {
            const image = getDirectusAssetUrl(experience.image) ?? heroImage;
            return (
              <Link className={styles.experienceCard} href={experience.link ?? `/esperienze/${experience.slug}`} key={experience.id}>
                <div className={styles.experienceImage} style={{ backgroundImage: `url('${image}')` }} />
                <div className={styles.experienceOverlay} />
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.experienceText}>
                  <h3>{experience.title}</h3>
                  {experience.description && <p>{experience.description}</p>}
                  <span className={styles.roundArrow}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.routeFeature} id="percorso">
        <div className={styles.routeCopy}>
          <p className={styles.eyebrowLight}>Un percorso da provare</p>
          <h2>La palude<br />di Roncegno.</h2>
          <p>Una passeggiata breve e accessibile per entrare nel paesaggio naturale di Roncegno, con traccia GPX e mappa interattiva sempre con te.</p>
          <div className={styles.routeStats}>
            <div><strong>1,3</strong><span>km</span></div>
            <div><strong>60</strong><span>min</span></div>
            <div><strong>93</strong><span>m dislivello</span></div>
          </div>
          <Link href="/percorsi/passeggiata-biotopo-palude-roncegno" className={styles.lightLink}>Apri percorso e mappa <Arrow /></Link>
        </div>
        <div className={styles.routeVisual}>
          <div className={styles.routeContour}>RONCEGNO<br />46.05127<br />11.40972</div>
          <div className={styles.routePath} aria-hidden="true">
            <svg viewBox="0 0 600 520" preserveAspectRatio="none">
              <path d="M84 430 C130 350 125 250 210 205 C300 158 352 245 420 190 C487 135 470 75 538 52" />
            </svg>
          </div>
          <div className={styles.mapDotStart}>A</div>
          <div className={styles.mapDotEnd}>B</div>
        </div>
      </section>

      <section className={styles.stories}>
        <div className={styles.storiesHead}>
          <div>
            <p className={styles.eyebrow}>Segnaletica che continua online</p>
            <h2>Il territorio<br />ha una voce.</h2>
          </div>
          <p>
            I pannelli già installati nei castagneti diventano punti di accesso a una narrazione più ricca:
            testi, audio, trascrizioni e contenuti collegati. Gli URL dei QR restano gli stessi.
          </p>
        </div>
        <div className={styles.storyStrip}>
          {chestnutStories.map((story, index) => (
            <Link href={story.href} className={styles.storyItem} key={story.href}>
              <span>{story.label}</span>
              <strong>{story.title}</strong>
              <small>0{index + 1} / Audioguida</small>
              <Arrow />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.events} id="eventi">
        <div className={styles.eventsIntro}>
          <p className={styles.eyebrowLight}>Agenda</p>
          <h2>Oggi a<br />Roncegno.</h2>
          <p>Eventi, incontri e occasioni per entrare nella vita del paese.</p>
        </div>
        <div className={styles.eventList}>
          {events.map((event, index) => (
            <article key={event.id}>
              <span className={styles.eventIndex}>0{index + 1}</span>
              <div>
                <small>{new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", timeZone: "Europe/Rome" }).format(new Date(event.start_date))}</small>
                <h3>{event.title}</h3>
                <p>{event.location_name ?? event.place?.title ?? "Roncegno Terme"}</p>
              </div>
              <span className={styles.eventArrow}>→</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.places}>
        <div className={styles.placesTitle}>
          <p className={styles.eyebrow}>Luoghi da conoscere</p>
          <h2>Tre tappe.<br />Tre Roncegno.</h2>
        </div>
        <div className={styles.placeGrid}>
          {places.map((place, index) => (
            <article key={place.id} className={styles.placeCard}>
              <div className={styles.placeImage} style={{ backgroundImage: `url('${getDirectusAssetUrl(place.image) ?? heroImage}')` }}>
                <span>0{index + 1}</span>
              </div>
              <div className={styles.placeText}>
                <small>{place.category?.name ?? place.map_label ?? "Roncegno Terme"}</small>
                <h3>{place.title}</h3>
                {place.summary && <p>{place.summary}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrowLight}>Roncegno Terme · Valsugana</p>
        <h2>Non visitarlo.<br /><em>Vivilo.</em></h2>
        <div className={styles.finalBottom}>
          <p>Sentieri, luoghi, storie, eventi e sapori: il nuovo Visit Roncegno nasce per accompagnarti prima e durante il viaggio.</p>
          <a href="#esperienze" className={styles.primary}>Esplora il territorio <Arrow /></a>
        </div>
      </section>
    </main>
  );
}
