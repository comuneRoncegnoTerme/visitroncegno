import Link from "next/link";
import { getDirectusAssetUrl, type SiteSettings } from "@/lib/directus";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const logo = getDirectusAssetUrl(settings.logo_light ?? settings.logo);
  const name = settings.site_name ?? "Visit Roncegno";
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Link className="brand footer-brand" href="/" aria-label={name}>{logo ? <img className="brand-logo brand-logo-footer" src={logo} alt={name} /> : <><span className="brand-mark">R</span><span className="brand-copy"><strong>{name}</strong><small>{settings.tagline ?? "Roncegno Terme · Valsugana"}</small></span></>}</Link><p className="footer-description">{settings.footer_description ?? "Il portale turistico del territorio di Roncegno Terme."}</p>{(settings.instagram_url || settings.facebook_url) && <div className="footer-social">{settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}</div>}</div>
        <div className="footer-column"><strong>Esplora</strong><Link href="/percorsi">Percorsi</Link><Link href="/eventi">Eventi</Link><Link href="/luoghi">Luoghi</Link><Link href="/#mappa">Mappa</Link></div>
        <div className="footer-column"><strong>Organizza</strong><Link href="/#dormire">Dove dormire</Link><Link href="/#mangiare">Dove mangiare</Link><Link href="/#servizi">Servizi</Link><Link href="/#come-arrivare">Come arrivare</Link></div>
        <div className="footer-column"><strong>Contatti</strong>{settings.address && <span>{settings.address}</span>}{settings.contact_phone && <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>}{settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {name}</span><div><Link href="/#privacy">Privacy</Link><Link href="/#cookie">Cookie</Link><Link href="/#accessibilita">Accessibilità</Link></div></div>
    </footer>
  );
}
