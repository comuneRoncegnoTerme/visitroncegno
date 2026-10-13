"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { eventState, flattenProgramme, romeDate, showOnFestaMap, useNow } from "./festa-time";
import styles from "./page.module.css";

export type ProgrammeDay = {
  date: string; // YYYY-MM-DD, giorno a Roncegno
  day: string;
  label: string;
  // [orario, titolo, descrizione, id del punto sulla mappa della Festa]
  events: readonly (readonly [string, string, string, string?])[];
};

// Programma a schede per giorno. Tutti i giorni restano nell'HTML (motori di ricerca, stampa,
// JavaScript disattivato); durante la Festa si apre sul giorno corrente.
export default function FestaProgramme({ days }: { days: readonly ProgrammeDay[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const now = useNow();
  const events = useMemo(() => flattenProgramme(days), [days]);
  const festaRunning = now !== null && now >= events[0]?.start && now < Math.max(...events.map((event) => event.end));

  // Le schede compaiono solo nel browser; durante la Festa si apre sul giorno corrente
  // (anche con l'anteprima "?ora=") e cambia da sola a mezzanotte.
  const todayIndex = now === null ? -1 : days.findIndex((day) => day.date === romeDate(now));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnhanced(true);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (todayIndex >= 0) setSelected(todayIndex);
  }, [todayIndex]);

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
          {day.events.map(([time, title, description, pointId]) => {
            const event = events.find((item) => item.date === day.date && item.time === time && item.title === title);
            // Durante la Festa: evento in corso acceso, eventi passati attenuati.
            const state = festaRunning && event && now !== null ? eventState(event, now) : undefined;
            return (
              <article key={`${day.date}-${time}-${title}`} data-state={state}>
                <time>{time}{state === "now" && <span className={styles.liveBadge}>Adesso</span>}</time>
                <div>
                  <h4>{title}</h4>
                  <p>{description}</p>
                  {pointId && (
                    <button type="button" className={styles.whereButton} onClick={() => showOnFestaMap(pointId)}>
                      Dov’è sulla mappa
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
