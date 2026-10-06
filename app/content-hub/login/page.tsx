import Link from "next/link";
import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

const MUNICIPAL_CREST_URL =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Roncegno_Terme-Stemma.svg";

export default async function ContentHubLoginPage() {
  const session = await getContentHubSession();
  if (session) redirect("/content-hub");

  const settings = await getSiteSettings();
  const siteLogo = getDirectusAssetUrl(settings.logo);
  const siteName = settings.site_name ?? "Visit Roncegno";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label={siteName}>
            {siteLogo ? (
              <img className={styles.siteLogo} src={siteLogo} alt={siteName} />
            ) : (
              <span>{siteName}</span>
            )}
            <small>Content Hub</small>
          </Link>

          <div className={styles.headerMeta}>
            <span>Area redazione</span>
            <Link href="/" className={styles.siteLink}>← Torna al sito</Link>
          </div>
        </header>

        <section className={styles.loginArea}>
          <div className={styles.introPanel}>
            <div className={styles.introTop}>
              <p className={styles.eyebrow}>Visit Roncegno · redazione</p>
              <h1>Il sito, tutto da qui.</h1>
              <p className={styles.lead}>
                Aggiorna ciò che le persone vedono: appuntamenti, luoghi,
                percorsi, storie e contenuti della homepage.
              </p>
            </div>

            <div className={styles.editorialIndex} aria-label="Aree del Content Hub">
              <div><span>01</span><strong>Contenuti</strong><small>Homepage · eventi · storie</small></div>
              <div><span>02</span><strong>Territorio</strong><small>Luoghi · percorsi · pannelli</small></div>
              <div><span>03</span><strong>Media</strong><small>Immagini · documenti · audio</small></div>
            </div>

            <div className={styles.institutionalSignature}>
              <img
                src={MUNICIPAL_CREST_URL}
                alt="Stemma del Comune di Roncegno Terme"
                className={styles.municipalCrest}
              />
              <div>
                <small>Uno strumento del</small>
                <strong>Comune di Roncegno Terme</strong>
                <span>per la gestione di Visit Roncegno</span>
              </div>
            </div>
          </div>

          <div className={styles.accessPanel}>
            <div className={styles.cardHeading}>
              <span>Accesso riservato</span>
              <h2>Accedi al Content Hub</h2>
              <p>
                Usa le credenziali della tua utenza Directus.
              </p>
            </div>

            <LoginForm />

            <div className={styles.securityNote}>
              <span aria-hidden="true">●</span>
              <p>Sessione protetta con scadenza automatica dopo 8 ore.</p>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Visit Roncegno Digital Platform</span>
          <small>Content management · territorio · comunicazione</small>
        </footer>
      </div>
    </main>
  );
}
