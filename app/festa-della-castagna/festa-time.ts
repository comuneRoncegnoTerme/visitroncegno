"use client";

import { useSyncExternalStore } from "react";

export const FESTA_START = "2026-10-23";
export const FESTA_END = "2026-10-25";

const TIME_ZONE = "Europe/Rome";

// Scarto di Roma rispetto a UTC in un dato istante, in minuti (+120 in estate, +60 in inverno).
function romeOffsetMinutes(instant: number) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "shortOffset" })
    .formatToParts(new Date(instant))
    .find((part) => part.type === "timeZoneName")?.value ?? "GMT+1";
  const match = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 60;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "-" ? -minutes : minutes;
}

/** Istante di un orario "HH:MM" del giorno "YYYY-MM-DD" a Roncegno (gestisce il cambio dell'ora). */
export function romeInstant(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hours, minutes);
  return guess - romeOffsetMinutes(guess) * 60_000;
}

/** Giorno di calendario a Roncegno, "YYYY-MM-DD". */
export function romeDate(instant: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instant));
}

// "?ora=2026-10-24T18:20" mostra la pagina come sarà in quel momento: serve per provare la modalità Festa.
function previewInstant() {
  const value = new URLSearchParams(window.location.search).get("ora");
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/);
  return match ? romeInstant(match[1], match[2]) : null;
}

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 30_000);
  return () => window.clearInterval(timer);
}

// Il valore cambia una volta al minuto: React non ridisegna più spesso del necessario.
function snapshot() {
  return previewInstant() ?? Math.floor(Date.now() / 60_000) * 60_000;
}

/** Ora attuale (al minuto) nel browser; null durante il rendering sul server. */
export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export type FestaEvent = {
  date: string;
  day: string;
  time: string;
  title: string;
  description: string;
  pointId?: string;
  start: number;
  end: number;
};

type ProgrammeLike = readonly {
  date: string;
  day: string;
  events: readonly (readonly [string, string, string, string?])[];
}[];

// Eventi senza orario di fine: si considerano in corso per un'ora e mezza.
const DEFAULT_DURATION = 90 * 60_000;

export function flattenProgramme(days: ProgrammeLike): FestaEvent[] {
  return days.flatMap((day) =>
    day.events.map(([time, title, description, pointId]) => {
      const [from, to] = time.split(/[–-]/).map((part) => part.trim());
      const start = romeInstant(day.date, from);
      const end = to ? romeInstant(day.date, to) : start + DEFAULT_DURATION;
      return { date: day.date, day: day.day, time, title, description, pointId, start, end };
    })
  );
}

export type EventState = "past" | "now" | "next" | "later";

export function eventState(event: FestaEvent, now: number): EventState {
  if (now >= event.end) return "past";
  if (now >= event.start) return "now";
  return event.start - now <= 3 * 60 * 60_000 ? "next" : "later";
}

/** Apre un punto sulla mappa della Festa (ascoltato da FestaMap). */
export function showOnFestaMap(pointId: string) {
  window.dispatchEvent(new CustomEvent("festa:punto", { detail: pointId }));
  document.getElementById("mappa")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
