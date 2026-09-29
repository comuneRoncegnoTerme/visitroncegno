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
          <Link href="/" className={styles.siteLink}>← Torna al sito</Link>
        </header>

        <section className={styles.loginArea}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Area redazione</p>
            <h1>Content Hub</h1>
            <p>Gestisci contenuti, pannelli, luoghi, eventi e percorsi del sito Visit Roncegno.</p>

            <div className={styles.institutionalSignature}>
              <img
                src={MUNICIPAL_CREST_URL}
                alt="Stemma del Comune di Roncegno Terme"
                className={styles.municipalCrest}
              />
              <div>
                <small>Un progetto del</small>
                <strong>Comune di Roncegno Terme</strong>
                <span>Assessorato alla Comunicazione</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeading}>
              <span>Accesso riservato</span>
              <h2>Entra nell’area di gestione</h2>
              <p>Usa le credenziali della tua utenza Directus.</p>
            </div>
            <LoginForm />
            <p className={styles.note}>La sessione scade automaticamente dopo 8 ore.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
