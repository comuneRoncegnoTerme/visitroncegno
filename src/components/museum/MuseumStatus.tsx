"use client";

import { useMemo } from "react";
import { describeSeason, openingStatus, parseOpeningHours, upcomingWeek } from "@/lib/opening-hours";
import { useMinute } from "./useMinute";
import styles from "./Museum.module.css";

/** Pallino "Aperto ora / Chiuso · apre sabato alle 09:00", calcolato con l'ora di Roncegno. */
/** `fallback` compare quando dagli orari non si ricava uno stato (testo libero). */
export function MuseumStatusBadge({ hours, className, fallback }: { hours: string; className?: string; fallback?: string }) {
  const parsed = useMemo(() => parseOpeningHours(hours), [hours]);
  const now = useMinute();
  const status = parsed && now !== null ? openingStatus(parsed, now) : null;
  if (!status) {
    if (!fallback || parsed?.seasons.length) return null;
    return <p className={`${styles.status} ${styles.status_unknown} ${className ?? ""}`}>{fallback}</p>;
  }
  return (
    <p className={`${styles.status} ${styles[`status_${status.state}`]} ${className ?? ""}`} aria-live="polite">
      {status.label}
    </p>
  );
}

/** Orari completi: stato, i prossimi sette giorni e i periodi di apertura. */
export function MuseumHours({ hours }: { hours: string }) {
  const parsed = useMemo(() => parseOpeningHours(hours), [hours]);
  const now = useMinute();

  if (!parsed?.seasons.length) {
    return (
      <div className={styles.hoursText}>
        {(parsed?.notes ?? [hours]).map((line) => <p key={line}>{line}</p>)}
      </div>
    );
  }

  const week = now !== null ? upcomingWeek(parsed, now) : null;
  const openDays = week?.filter((day) => day.slots.length).length ?? 0;

  return (
    <div className={styles.hours}>
      <MuseumStatusBadge hours={hours} />
      {week && openDays > 0 && (
        <ol className={styles.week} aria-label="Aperture dei prossimi sette giorni">
          {week.map((day) => (
            <li key={day.key} className={`${day.today ? styles.weekToday : ""} ${day.slots.length ? styles.weekOpen : ""}`}>
              <span>{day.label}</span>
              {day.slots.length ? day.slots.map((slot) => <strong key={slot}>{slot}</strong>) : <em>chiuso</em>}
            </li>
          ))}
        </ol>
      )}
      <dl className={styles.seasons}>
        {parsed.seasons.map((season) => (
          <div key={`${season.from}-${season.to}-${season.label}`}>
            <dt>{season.label}</dt>
            {describeSeason(season).map((line) => <dd key={line}>{line}</dd>)}
          </div>
        ))}
      </dl>
      {parsed.notes.map((line) => <p className={styles.hoursNote} key={line}>{line}</p>)}
    </div>
  );
}
