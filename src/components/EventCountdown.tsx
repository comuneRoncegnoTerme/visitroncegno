"use client";

import { useSyncExternalStore } from "react";

const TIME_ZONE = "Europe/Rome";

// Giorno di calendario a Roncegno, come numero confrontabile (giorni dal 1970).
function romeDay(date: Date) {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
}

function label(start: string, end: string | null) {
  const today = romeDay(new Date());
  const first = romeDay(new Date(start));
  const last = end ? romeDay(new Date(end)) : first;
  if (today > last) return null;
  if (today >= first) return "In corso";
  const days = first - today;
  if (days === 1) return "Manca un giorno";
  return `Mancano ${days} giorni`;
}

// Il testo dipende dalla data di chi guarda: sul server non si mostra niente,
// nel browser si calcola subito (e si aggiorna se la pagina resta aperta oltre la mezzanotte).
function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  return () => window.clearInterval(timer);
}

export default function EventCountdown({
  start,
  end,
  className,
}: {
  start: string;
  end: string | null;
  className?: string;
}) {
  const text = useSyncExternalStore(subscribe, () => label(start, end), () => null);
  if (!text) return null;
  return (
    <p className={className} aria-live="polite">
      {text}
    </p>
  );
}
