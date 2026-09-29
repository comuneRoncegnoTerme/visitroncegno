import type { Metadata } from "next";
import Link from "next/link";
import {
  getDirectusAssetUrl,
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/directus";
import KioskAttract, { type KioskAttractSlide } from "./KioskAttract";
import KioskFullscreenButton from "./KioskFullscreenButton";
import KioskWeather from "./KioskWeather";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Infopoint digitale | Visit Roncegno",
  description: "Interfaccia kiosk dell’infopoint turistico di Roncegno Terme.",
  robots: { index: false, follow: false },
};

function formatEventDate(value: string) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      timeZone: "Europe/Rome",
    }).format(date),
    month: new Intl.DateTimeFormat("it-IT", {
      month: "short",
      timeZone: "Europe/Rome",
    })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
    weekday: new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      timeZone: "Europe/Rome",
    }).format(date),
  };
}

export default async function KioskPage() {
  const [homepage, events, experiences, places, settings] = await Promise.all([
    getHomepage(),
    getUpcomingEvents(),
    getExperiences(),
    getFeaturedPlaces(),
    getSiteSettings(),
  ]);

  const heroImage =
    getDirectusAssetUrl(homepage.hero_image) ??
    "/images/hero/roncegno-hero.jpg";
  const logo = getDirectusAssetUrl(settings.logo_light ?? settings.logo);
  const nextEvent = events[0] ?? null;
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.start_date) : null;
  const highlight = experiences[0] ?? null;
  const highlightImage =
    getDirectusAssetUrl(highlight?.image) ??
    getDirectusAssetUrl(places[0]?.image) ??
    heroImage;

  const attractSlides: KioskAttractSlide[] = [
    {
      eyebrow: "Benvenuti a Roncegno Terme",
      title: homepage.hero_title ?? "Un territorio da vivere.",
      description: homepage.hero_description ?? "Natura, benessere, cultura e sapori nel cuore della Valsugana.",
      image: heroImage,
    },
    ...(nextEvent ? [{
      eyebrow: "Prossimo appuntamento",
      title: nextEvent.title,
      description: nextEvent.location_name ?? nextEvent.place?.title ?? "Roncegno Terme",
      image: getDirectusAssetUrl(nextEvent.image) ?? heroImage,
    }] : []),
    ...(highlight ? [{
      eyebrow: "Da scoprire",
      title: highlight.title,
      description: highlight.description,
      image: highlightImage,
    }] : []),
  ];

  return (
    <main className={styles.page}>
      <KioskAttract
        slides={attractSlides}
        nextEvent={nextEvent && nextEventDate ? {
          title: nextEvent.title,
          date: `${nextEventDate.weekday} ${nextEventDate.day} ${nextEventDate.month.toLowerCase()}`,
          location: nextEvent.location_name ?? nextEvent.place?.title ?? "Roncegno Terme",
          href: `/kiosk/eventi/${nextEvent.slug}`,
        } : null}
      />

      <section
        className={styles.hero}
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className={styles.heroShade} />

        <header className={styles.header}>
          <Link href="/kiosk" className={styles.brand} aria-label="Visit Roncegno kiosk">
            {logo ? (
              <img src={logo} alt={settings.site_name ?? "Visit Roncegno"} />
            ) : (
              <span>{settings.site_name ?? "Visit Roncegno"}</span>
            )}
          </Link>

          <div className={styles.headerActions}>
            <KioskFullscreenButton className={styles.fullscreenButton} />
            <KioskWeather className={styles.weatherBlock} />
            <div className={styles.clockBlock} aria-label="Ora locale">
            <span className={styles.clock} data-kiosk-clock>--:--</span>
              <small data-kiosk-date>Roncegno Terme</small>
            </div>
          </div>
        </header>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Benvenuti a Roncegno Terme</p>
          <h1>Un territorio<br />da vivere.</h1>
          <p>
            Natura, benessere, cultura e sapori. Tocca lo schermo per iniziare
            a esplorare.
          </p>
        </div>

        {nextEvent && nextEventDate && (
          <Link href={`/kiosk/eventi/${nextEvent.slug}`} className={styles.nextEvent}>
            <span className={styles.nextEventLabel}>Prossimo appuntamento</span>
            <span className={styles.nextEventDate}>
              <strong>{nextEventDate.day}</strong>
              <span>{nextEventDate.month}</span>
            </span>
            <span className={styles.nextEventCopy}>
              <small>{nextEventDate.weekday}</small>
              <strong>{nextEvent.title}</strong>
              <span>{nextEvent.location_name ?? nextEvent.place?.title ?? "Roncegno Terme"}</span>
            </span>
            <span className={styles.nextEventArrow} aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <section className={styles.actions} aria-label="Esplora Visit Roncegno">
        <Link href="/kiosk/luoghi" className={styles.actionCard}>
          <span className={styles.actionNumber}>01</span>
          <span>
            <small>Territorio</small>
            <strong>Scopri Roncegno</strong>
          </span>
          <b aria-hidden="true">→</b>
        </Link>

        <Link href="/kiosk/percorsi" className={styles.actionCard}>
          <span className={styles.actionNumber}>02</span>
          <span>
            <small>Camminare e pedalare</small>
            <strong>Percorsi</strong>
          </span>
          <b aria-hidden="true">→</b>
        </Link>

        <Link href="/kiosk/eventi" className={styles.actionCard}>
          <span className={styles.actionNumber}>03</span>
          <span>
            <small>Oggi e nei prossimi giorni</small>
            <strong>Eventi</strong>
          </span>
          <b aria-hidden="true">→</b>
        </Link>

        <Link href="/kiosk/organizza" className={styles.actionCard}>
          <span className={styles.actionNumber}>04</span>
          <span>
            <small>Informazioni utili</small>
            <strong>Organizza la visita</strong>
          </span>
          <b aria-hidden="true">→</b>
        </Link>
      </section>

      <section className={styles.highlight}>
        <div
          className={styles.highlightImage}
          style={{ backgroundImage: `url('${highlightImage}')` }}
        />
        <div className={styles.highlightCopy}>
          <p className={styles.eyebrow}>In evidenza</p>
          <h2>{highlight?.title ?? "Roncegno, naturalmente."}</h2>
          <p>
            {highlight?.description ??
              places[0]?.summary ??
              "Lasciati guidare tra paesaggi, luoghi e storie del territorio."}
          </p>
          <Link href="/kiosk/luoghi">Scopri di più →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Visit Roncegno</strong>
          <span>Infopoint turistico digitale</span>
        </div>
        <p>
          I contenuti di questo schermo sono aggiornati dallo stesso ecosistema
          digitale di visitroncegno.it.
        </p>
        <span className={styles.footerNote}>Tocca lo schermo oppure inquadra il QR per continuare sul telefono.</span>
      </footer>
    </main>
  );
}
