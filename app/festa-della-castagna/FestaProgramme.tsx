"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import styles from "./page.module.css";

export type ProgrammeDay = {
  date: string; // YYYY-MM-DD, giorno a Roncegno
  day: string;
  label: string;
  events: readonly (readonly [string, string, string])[];
};

function romeToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Programma a schede per giorno. Tutti i giorni restano nell'HTML (motori di ricerca, stampa,
// JavaScript disattivato); durante la Festa si apre sul giorno corrente.
export default function FestaProgramme({ days }: { days: readonly ProgrammeDay[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const today = days.findIndex((day) => day.date === romeToday());
    // Sincronizza con l'orologio del visitatore, disponibile solo nel browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (today >= 0) setSelected(today);
    setEnhanced(true);
  }, [days]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (selected + step + days.length) % days.length;
    setSelected(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <div className={styles.timeline}>
      {enhanced && (
        <div className={styles.dayTabs} role="tablist" aria-label="Giorni della Festa">
          {days.map((day, index) => (
            <button
              key={day.date}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={index === selected ? 0 : -1}
              className={styles.dayTab}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
            >
              <small>{day.label}</small>
              <span>{day.day}</span>
            </button>
          ))}
        </div>
      )}
      {days.map((day, index) => (
        <section
          className={styles.programDay}
          key={day.date}
          id={`${baseId}-panel-${index}`}
          role={enhanced ? "tabpanel" : undefined}
          aria-labelledby={enhanced ? `${baseId}-tab-${index}` : undefined}
          hidden={enhanced && index !== selected}
        >
          <div className={styles.dayHeading}><span>{day.label}</span><h3>{day.day}</h3></div>
          {day.events.map(([time, title, description]) => (
            <article key={`${day.date}-${time}-${title}`}><time>{time}</time><div><h4>{title}</h4><p>{description}</p></div></article>
          ))}
        </section>
      ))}
    </div>
  );
}
