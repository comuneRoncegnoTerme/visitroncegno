"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./hub.module.css";

const groups = [
  {
    label: "Sito",
    links: [
      { href: "/content-hub", label: "Panoramica" },
      { href: "/content-hub/homepage", label: "Homepage" },
      { href: "/content-hub/impostazioni", label: "Impostazioni" },
    ],
  },
  {
    label: "Contenuti",
    links: [
      { href: "/content-hub/eventi", label: "Eventi" },
      { href: "/content-hub/luoghi", label: "Luoghi" },
      { href: "/content-hub/percorsi", label: "Percorsi" },
      { href: "/content-hub/storie", label: "Storie e memoria" },
      { href: "/content-hub/pannelli", label: "Pannelli e audioguide" },
    ],
  },
  {
    label: "Archivio",
    links: [
      { href: "/content-hub/media", label: "Immagini e file" },
      { href: "/content-hub/qualita", label: "Cose da sistemare" },
    ],
  },
];

export default function HubNav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/content-hub" className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo/logo_white.svg" alt="Visit Roncegno" />
        <span>Redazione</span>
      </Link>

      <nav className={styles.nav} aria-label="Sezioni del Content Hub">
        {groups.map((group) => (
          <div className={styles.navGroup} key={group.label}>
            <p>{group.label}</p>
            {group.links.map((link) => {
              const active =
                link.href === "/content-hub"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? styles.navActive : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.account}>
        {name && (
          <div className={styles.user}>
            <strong>{name}</strong>
            {role && <span>{role}</span>}
          </div>
        )}
        <a href="/" target="_blank" rel="noreferrer">Apri il sito</a>
        <form action="/api/content-hub/logout" method="post">
          <button type="submit">Esci</button>
        </form>
      </div>
    </aside>
  );
}
