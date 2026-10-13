"use client";

import { useMemo } from "react";
import type { ProgrammeDay } from "./FestaProgramme";
import { eventState, flattenProgramme, romeDate, showOnFestaMap, useNow, type FestaEvent } from "./festa-time";
import styles from "./FestaExtras.module.css";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function Countdown({ to, now }: { to: number; now: number }) {
  const minutes = Math.max(0, Math.floor((to - now) / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const parts = [
    ...(days > 0 ? [[days, days === 1 ? "giorno" : "giorni"] as const] : []),
    [hours, hours === 1 ? "ora" : "ore"],
    [minutes % 60, "min"],
  ] as const;
  return (
    <div className={styles.countdown} role="timer" aria-label={`Mancano ${days} giorni, ${hours} ore e ${minutes % 60} minuti`}>
      <span className={styles.countdownLabel}>Mancano</span>
      {parts.map(([value, unit]) => (
        <span className={styles.countdownPart} key={unit} aria-hidden="true">
          <strong key={value}>{unit === "giorni" || unit === "giorno" ? value : pad(value)}</strong>
          <small>{unit}</small>
        </span>
      ))}
    </div>
  );
}

function when(event: FestaEvent, now: number) {
  if (romeDate(event.start) === romeDate(now)) return event.time;
  const tomorrow = romeDate(now + 86_400_000) === romeDate(event.start);
  return `${tomorrow ? "Domani" : event.day.split(" ")[0]} ${event.time}`;
}

function EventLine({ event, label, now }: { event: FestaEvent; label: string; now: number }) {
  return (
    <li className={styles.nowItem}>
      <span className={styles.nowTag} data-state={label === "Adesso" ? "now" : "next"}>{label}</span>
      <span className={styles.nowText}>
        <strong>{event.title}</strong>
        <small>{label === "Adesso" ? `fino alle ${new Date(event.end).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}` : when(event, now)}</small>
      </span>
      {event.pointId && (
        <button type="button" className={styles.nowWhere} onClick={() => showOnFestaMap(event.pointId!)}>
          Dov’è
        </button>
      )}
    </li>
  );
}

// Nell'hero: conto alla rovescia prima della Festa, "adesso e tra poco" durante, niente dopo.
export default function FestaNow({ days }: { days: readonly ProgrammeDay[] }) {
  const now = useNow();
  const events = useMemo(() => flattenProgramme(days), [days]);
  if (now === null || !events.length) return null;

  const first = events[0].start;
  const last = Math.max(...events.map((event) => event.end));
  if (now >= last) return null;
  if (now < first) return <Countdown to={first} now={now} />;

  // Prima gli eventi iniziati da poco: il mercatino, aperto tutto il giorno, non copre il resto.
  const current = events
    .filter((event) => eventState(event, now) === "now")
    .sort((a, b) => b.start - a.start)
    .slice(0, 2);
  const upcoming = events.filter((event) => event.start > now).sort((a, b) => a.start - b.start)[0];

  return (
    <div className={styles.now} aria-live="polite">
      <p className={styles.nowHeading}><i aria-hidden="true" /> La Festa è in corso</p>
      <ul>
        {current.map((event) => <EventLine key={`${event.date}-${event.time}-${event.title}`} event={event} label="Adesso" now={now} />)}
        {upcoming && <EventLine event={upcoming} label={current.length ? "Dopo" : "Prossimo"} now={now} />}
      </ul>
    </div>
  );
}
