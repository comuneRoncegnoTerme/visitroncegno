import Link from "next/link";
import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

// Stemma servito dal sito (estratto dalla cartina ufficiale): nessuna richiesta a server esterni.
const MUNICIPAL_CREST_URL = "/images/logo/stemma-roncegno.webp";

export default async function ContentHubLoginPage() {
  const session = await getContentHubSession();
  if (session) redirect("/content-hub");

  const settings = await getSiteSettings();
  const siteLogo = getDirectusAssetUrl(settings.logo) ?? "/images/logo/visit-roncegno.png";
  const siteName = settings.site_name ?? "Visit Roncegno";
  const helpEmail = settings.contact_email;

  return (
    <main className={styles.page}>
      <figure className={styles.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/homepage/roncegno-panorama.webp" alt="" />
        <figcaption>
          Roncegno Terme, Valsugana
          <span>Foto Luca Matassoni · APT Valsugana</span>
        </figcaption>
      </figure>

      <div className={styles.panel}>
        <div className={styles.top}>
          <Link href="/" className={styles.siteLink}>← visitroncegno.it</Link>
        </div>

        <div className={styles.box}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src={siteLogo} alt={siteName} />

          <h1>Area redazione</h1>
          <p className={styles.intro}>
            Per aggiornare eventi, luoghi, percorsi e pagine del sito.
            Entra con l’email e la password del tuo account Directus.
          </p>

          <LoginForm />

          <p className={styles.help}>
            {helpEmail ? (
              <>
                Non riesci ad accedere? Scrivi a{" "}
                <a href={`mailto:${helpEmail}`}>{helpEmail}</a>.
              </>
            ) : (
              <>Non riesci ad accedere? Chiedi a chi gestisce gli account del Comune.</>
            )}
          </p>
        </div>

        <footer className={styles.footer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MUNICIPAL_CREST_URL} alt="" className={styles.crest} />
          <span>Comune di Roncegno Terme</span>
        </footer>
      </div>
    </main>
  );
}
