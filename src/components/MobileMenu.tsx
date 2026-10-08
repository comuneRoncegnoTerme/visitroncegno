"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { mainNavigation, planningLinks } from "@/lib/navigation";
import styles from "./SiteHeader.module.css";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("nav a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Il focus resta dentro il menu finché è aperto.
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>("a[href], button")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={styles.mobileMenu}>
      <button
        ref={toggleRef}
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
        <div ref={panelRef} className={styles.mobilePanel} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Menu">
          <div className={styles.mobilePanelTop}>
            <span>Esplora Roncegno</span>
            <button type="button" onClick={close} aria-label="Chiudi menu">
              ×
            </button>
          </div>

          <nav className={styles.mobileNav} aria-label="Navigazione mobile">
            {mainNavigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>
            ))}
            <Link href="/organizza-la-visita" onClick={close}>Organizza la visita</Link>
          </nav>

          <div className={styles.mobileShortcuts}>
            {planningLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
