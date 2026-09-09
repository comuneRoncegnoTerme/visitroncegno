import Link from "next/link";
import { getDirectusAssetUrl, type SiteSettings } from "@/lib/directus";
import MobileMenu from "./MobileMenu";
import styles from "./SiteHeader.module.css";

type Props = { settings: SiteSettings; overlay?: boolean };

export default function SiteHeader({ settings, overlay = false }: Props) {
  const name = settings.site_name ?? "Visit Roncegno";
  const logo = getDirectusAssetUrl(overlay ? (settings.logo_light ?? settings.logo) : settings.logo);

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : styles.inner}`}>
      <Link className={styles.brand} href="/" aria-label={name}>
        {logo ? (
          <img className={styles.logo} src={logo} alt={name} />
        ) : (
          <span className={styles.wordmark}>
            <strong>{name}</strong>
            <small>{settings.tagline ?? "Roncegno Terme · Valsugana"}</small>
          </span>
        )}
      </Link>

      <nav className={styles.nav} aria-label="Navigazione principale">
        <Link href="/luoghi">Luoghi</Link>
        <Link href="/percorsi">Percorsi</Link>
        <Link href="/eventi">Eventi</Link>
        <Link href="/cartina">Cartina</Link>
        <Link href="/#mappa">Mappa</Link>
      </nav>

      <Link className={styles.cta} href="/organizza-la-visita">
        Organizza la visita
      </Link>

      <MobileMenu />
    </header>
  );
}
