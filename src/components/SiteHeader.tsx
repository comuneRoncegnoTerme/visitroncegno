import Link from "next/link";
import { getDirectusAssetUrl, type SiteSettings } from "@/lib/directus";

type Props = { settings: SiteSettings; overlay?: boolean };

export default function SiteHeader({ settings, overlay = false }: Props) {
  const logo = getDirectusAssetUrl(settings.logo);
  const name = settings.site_name ?? "Visit Roncegno";
  return (
    <header className={`site-header${overlay ? "" : " site-header-inner"}`}>
      <Link className="brand" href="/" aria-label={name}>
        {logo ? <img className="brand-logo brand-logo-header" src={logo} alt={name} /> : <><span className="brand-mark">R</span><span className="brand-copy"><strong>{name}</strong><small>{settings.tagline ?? "Roncegno Terme · Valsugana"}</small></span></>}
      </Link>
      <nav className="main-nav" aria-label="Navigazione principale">
        <Link href="/luoghi">Luoghi</Link><Link href="/percorsi">Percorsi</Link><Link href="/eventi">Eventi</Link><Link href="/#mappa">Mappa</Link>
      </nav>
      <Link className="header-cta" href="/#organizza">Organizza la visita</Link>
    </header>
  );
}
