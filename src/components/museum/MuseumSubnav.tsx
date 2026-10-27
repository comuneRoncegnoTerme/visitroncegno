"use client";

import { useEffect, useState } from "react";
import styles from "./Museum.module.css";

type Item = { id: string; label: string };

/** Menu del museo: resta in alto mentre si scorre e segna la sezione in vista. */
export default function MuseumSubnav({ title, items }: { title: string; items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // La voce attiva resta visibile anche quando il menu scorre in orizzontale (smartphone).
  useEffect(() => {
    document.querySelector(`[data-subnav-id="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  return (
    <nav className={styles.subnav} aria-label={`Sezioni: ${title}`}>
      <div className={styles.subnavInner}>
        <a className={styles.subnavTitle} href="#top">{title}</a>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-subnav-id={item.id}
                aria-current={active === item.id ? "location" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
