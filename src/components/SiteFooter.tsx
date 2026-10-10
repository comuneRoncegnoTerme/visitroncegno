import Link from "next/link";
import { getDirectusAssetUrl, type SiteSettings } from "@/lib/directus";
import { getPublishedLegalLinks } from "@/lib/legal-pages";
import { mainNavigation } from "@/lib/navigation";

export default async function SiteFooter({ settings }: { settings: SiteSettings }) {
  const legalLinks = await getPublishedLegalLinks();
  const logo = getDirectusAssetUrl(settings.logo_light) ?? "/images/logo/logo_white.svg";
  const name = settings.site_name ?? "Visit Roncegno";
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Link className="brand footer-brand" href="/" aria-label={name}><img className="brand-logo brand-logo-footer" src={logo} alt={name} /></Link><p className="footer-description">{settings.footer_description ?? "Il portale turistico del territorio di Roncegno Terme."}</p>{(settings.instagram_url || settings.facebook_url) && <div className="footer-social">{settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}</div>}</div>
        <div className="footer-column"><strong>Esplora</strong>{mainNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
        <div className="footer-column"><strong>Organizza</strong><Link href="/organizza-la-visita#dormire">Dove dormire</Link><Link href="/organizza-la-visita#mangiare">Dove mangiare</Link><Link href="/organizza-la-visita#servizi">Servizi</Link><Link href="/organizza-la-visita#come-arrivare">Come arrivare</Link><Link href="/organizza-la-visita#mappa-visita">Mappa</Link></div>
        <div className="footer-column"><strong>Contatti</strong>{settings.address && <span>{settings.address}</span>}{settings.contact_phone && <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>}{settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {name}</span>{legalLinks.length > 0 && <div>{legalLinks.map((page) => <Link key={page.path} href={page.path}>{page.label}</Link>)}</div>}</div>
    </footer>
  );
}
