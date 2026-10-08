import Link from "next/link";
import { getDirectusAssetUrl, type SiteSettings } from "@/lib/directus";
import { mainNavigation } from "@/lib/navigation";
import MobileMenu from "./MobileMenu";
import styles from "./SiteHeader.module.css";

type Props = { settings: SiteSettings; overlay?: boolean };

export default function SiteHeader({ settings, overlay = false }: Props) {
  const name = settings.site_name ?? "Visit Roncegno";
  const cmsLogo = getDirectusAssetUrl(overlay ? (settings.logo_light ?? settings.logo) : settings.logo);
  const logo = cmsLogo ?? (overlay ? "/images/logo/logo_white.svg" : "/images/logo/visit-roncegno.png");
  const useWhiteFallbackLogo = overlay && !settings.logo_light && !!settings.logo && !!cmsLogo;

  return (
    <>
    <header className={`${styles.header} ${overlay ? styles.overlay : styles.inner}`}>
      <Link className={styles.brand} href="/" aria-label={name}>
        {logo ? (
          <img className={`${styles.logo} ${useWhiteFallbackLogo ? styles.logoOverlayFallback : ""}`} src={logo} alt={name} />
        ) : (
          <span className={styles.wordmark}>
            <strong>{name}</strong>
            <small>{settings.tagline ?? "Roncegno Terme · Valsugana"}</small>
          </span>
        )}
      </Link>

      <nav className={styles.nav} aria-label="Navigazione principale">
        {mainNavigation.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>

      <Link className={styles.cta} href="/organizza-la-visita">
        Organizza la visita
      </Link>

      <MobileMenu />
    </header>
    {/* Destinazione del link "Salta al contenuto" (in app/layout.tsx): subito dopo l'intestazione. */}
    <span id="contenuto" tabIndex={-1} className={styles.contentAnchor} />
    </>
  );
}
