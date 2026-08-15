"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={styles.mobileMenu}>
      <button
        className={styles.mobileToggle}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>

      {open && (
        <div className={styles.mobilePanel} id="mobile-navigation">
          <div className={styles.mobilePanelTop}>
            <span>Esplora Roncegno</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi menu">
              ×
            </button>
          </div>

          <nav className={styles.mobileNav} aria-label="Navigazione mobile">
            <Link href="/luoghi" onClick={() => setOpen(false)}>Luoghi <span>01</span></Link>
            <Link href="/percorsi" onClick={() => setOpen(false)}>Percorsi <span>02</span></Link>
            <Link href="/eventi" onClick={() => setOpen(false)}>Eventi <span>03</span></Link>
            <Link href="/#mappa" onClick={() => setOpen(false)}>Mappa <span>04</span></Link>
            <Link href="/organizza-la-visita" onClick={() => setOpen(false)}>Organizza la visita <span>05</span></Link>
          </nav>

          <div className={styles.mobileShortcuts}>
            <Link href="/organizza-la-visita#dormire" onClick={() => setOpen(false)}>Dove dormire</Link>
            <Link href="/organizza-la-visita#mangiare" onClick={() => setOpen(false)}>Dove mangiare</Link>
            <Link href="/organizza-la-visita#come-arrivare" onClick={() => setOpen(false)}>Come arrivare</Link>
          </div>
        </div>
      )}
    </div>
  );
}
