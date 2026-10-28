"use client";

import { useMemo } from "react";
import DirectionsLink from "@/components/DirectionsLink";
import { describeSeason, parseOpeningHours, seasonInFocus } from "@/lib/opening-hours";
import type { Museum } from "@/lib/museums";
import { MuseumStatusBadge } from "./MuseumStatus";
import { useMinute } from "./useMinute";
import styles from "./Museum.module.css";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Gli orari che interessano oggi: il periodo in corso o il prossimo, senza tutta la tabella. */
function HoursNow({ hours }: { hours: string }) {
  const parsed = useMemo(() => parseOpeningHours(hours), [hours]);
  const now = useMinute();

  if (!parsed?.seasons.length) {
    return <>{(parsed?.notes ?? [hours]).map((line) => <p key={line}>{line}</p>)}</>;
  }
  // Sul server l'ora non si conosce: lo spazio resta, il contenuto arriva nel browser.
  if (now === null) return <p className={styles.keyPending} aria-hidden="true">…</p>;

  const focus = seasonInFocus(parsed, now)!;
  if (focus.state === "past") {
    return (
      <>
        <p>Stagione {focus.when}.</p>
        <p className={styles.keyMuted}>I nuovi orari saranno pubblicati qui. Per gruppi e scuole si può chiedere una visita anche fuori stagione.</p>
      </>
    );
  }
  return (
    <>
      <p className={styles.keyMuted}>{focus.state === "current" ? "In questo periodo" : "Prossima apertura"}{focus.when ? `, ${focus.when}` : ""}</p>
      {describeSeason(focus.season).map((line) => <p key={line}><strong>{line}</strong></p>)}
    </>
  );
}

/**
 * Le informazioni pratiche in un colpo d'occhio, subito sotto l'apertura della pagina.
 * `compact` è la versione per le schede di /musei: niente indirizzo né indicazioni.
 */
export default function MuseumKeyInfo({ museum, compact = false, id }: { museum: Museum; compact?: boolean; id?: string }) {
  const items = (
    <dl className={styles.keyGrid}>
      <div>
        <dt>Orari</dt>
        <dd><HoursNow hours={museum.openingHours} /></dd>
      </div>
      <div>
        <dt>Ingresso</dt>
        <dd>
          <p><strong>{museum.ticketInfo}</strong></p>
          {!compact && museum.visitDuration && <p className={styles.keyMuted}>Visita: {museum.visitDuration.charAt(0).toLowerCase() + museum.visitDuration.slice(1)}</p>}
        </dd>
      </div>
      {!compact && (
        <div>
          <dt>Dove</dt>
          <dd>
            <p><strong>{museum.address}</strong></p>
            <DirectionsLink className={styles.keyAction} latitude={museum.latitude} longitude={museum.longitude} address={`${museum.title}, ${museum.address}`}>
              Indicazioni ↗
            </DirectionsLink>
          </dd>
        </div>
      )}
      <div>
        <dt>{compact ? "Informazioni" : "Contatti e prenotazioni"}</dt>
        <dd className={styles.keyContacts}>
          {museum.bookingUrl && <a className={styles.keyAction} href={museum.bookingUrl} target="_blank" rel="noreferrer">Prenota ↗</a>}
          {museum.phones.map((phone) => <a key={phone} href={telHref(phone)}>{phone}</a>)}
          {!compact && museum.email && <a href={`mailto:${museum.email}`}>{museum.email}</a>}
        </dd>
      </div>
    </dl>
  );

  if (compact) return <div className={styles.keyCompact}>{items}</div>;

  return (
    <section className={styles.key} id={id} aria-labelledby={`${museum.id}-in-breve`}>
      <div className={styles.keyInner}>
        <div className={styles.keyHead}>
          <h2 id={`${museum.id}-in-breve`}>In breve</h2>
          <MuseumStatusBadge hours={museum.openingHours} />
          <a className={styles.keyMore} href="#visita">Tutti gli orari e le visite ↓</a>
        </div>
        {items}
      </div>
    </section>
  );
}
