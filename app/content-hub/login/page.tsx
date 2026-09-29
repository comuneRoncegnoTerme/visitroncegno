import Link from "next/link";
import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import {
  getDirectusAssetUrl,
  getHomepage,
  getSiteSettings,
} from "@/lib/directus";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

const MUNICIPAL_CREST_URL =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Roncegno_Terme-Stemma.svg";

export default async function ContentHubLoginPage() {
  const session = await getContentHubSession();
  if (session) redirect("/content-hub");

  const [settings, homepage] = await Promise.all([
    getSiteSettings(),
    getHomepage(),
  ]);

  const siteLogo = getDirectusAssetUrl(settings.logo);
  const siteName = settings.site_name ?? "Visit Roncegno";
  const showcaseImage =
    getDirectusAssetUrl(homepage.hero_image) ??
    "/images/homepage/APT_Valsugana_Roncegno_2025_10_07_Luca_Matassoni_HD_12.jpg";

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

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
            <span>Piattaforma editoriale</span>
            <Link href="/" className={styles.siteLink}>← Torna al sito</Link>
          </div>
        </header>

        <section className={styles.loginArea}>
          <div
            className={styles.showcase}
            style={{ backgroundImage: `url('${showcaseImage}')` }}
          >
            <div className={styles.showcaseShade} />

            <div className={styles.showcaseContent}>
              <div>
                <p className={styles.eyebrow}>Area redazione</p>
                <h1>Content Hub</h1>
                <p className={styles.lead}>
                  Un unico ambiente per governare contenuti, luoghi, eventi,
                  percorsi, pannelli e media dell’ecosistema Visit Roncegno.
                </p>
              </div>

              <div className={styles.capabilities} aria-label="Funzioni del Content Hub">
                <span>Homepage</span>
                <span>Luoghi</span>
                <span>Eventi</span>
                <span>Percorsi</span>
                <span>Storie</span>
                <span>Media</span>
              </div>

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
          </div>

          <div className={styles.accessPanel}>
            <div className={styles.card}>
              <div className={styles.cardHeading}>
                <span>Accesso riservato</span>
                <h2>Entra nell’area di gestione</h2>
                <p>
                  Accedi con le credenziali della tua utenza Directus per
                  gestire i contenuti del portale.
                </p>
              </div>

              <LoginForm />

              <div className={styles.securityNote}>
                <span aria-hidden="true">●</span>
                <p>
                  Area riservata alla redazione. La sessione scade
                  automaticamente dopo 8 ore.
                </p>
              </div>
            </div>

            <div className={styles.productNote}>
              <span>Visit Roncegno Digital Platform</span>
              <small>Content management · territorio · comunicazione</small>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
