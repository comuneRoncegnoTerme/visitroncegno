// Date degli eventi, sempre nel fuso di Roncegno (Europe/Rome).
//
// Directus può restituire tre formati:
//   "2026-10-24"                → campo data: evento di giornata, senza orario
//   "2026-10-24T14:00:00"       → campo datetime: ora "da orologio" italiana, senza fuso
//   "2026-10-24T12:00:00.000Z"  → campo timestamp: istante assoluto
// `new Date()` sui primi due formati dipende dal fuso del server (UTC in Docker) e sposta gli orari:
// qui ogni formato viene interpretato in modo esplicito.

export const EVENT_TIME_ZONE = "Europe/Rome";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const NAIVE_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export type EventDateInput = {
  start_date?: string | null;
  end_date?: string | null;
  all_day?: boolean | null;
};

type ParsedDate = { instant: number; hasTime: boolean };

function romeOffsetMs(instant: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

// Converte un orario "da orologio" di Roncegno nell'istante corrispondente.
function romeWallTime(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const first = guess - romeOffsetMs(guess);
  return guess - romeOffsetMs(first);
}

export function parseEventDate(value: string | null | undefined): ParsedDate | null {
  if (!value) return null;
  const text = value.trim();

  const dateOnly = text.match(DATE_ONLY);
  if (dateOnly) {
    const [, year, month, day] = dateOnly.map(Number);
    return { instant: romeWallTime(year, month, day), hasTime: false };
  }

  const naive = text.match(NAIVE_DATE_TIME);
  if (naive) {
    const [, year, month, day, hour, minute, second] = naive.map((part) => Number(part ?? 0));
    return { instant: romeWallTime(year, month, day, hour, minute, second), hasTime: true };
  }

  const instant = new Date(text).getTime();
  return Number.isNaN(instant) ? null : { instant, hasTime: true };
}

export function isAllDayEvent(item: EventDateInput) {
  if (item.all_day) return true;
  const start = parseEventDate(item.start_date);
  return Boolean(start && !start.hasTime);
}

function romeDayParts(instant: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

// Fine del giorno (a Roncegno) che contiene l'istante dato.
function endOfRomeDay(instant: number) {
  const { year, month, day } = romeDayParts(instant);
  return romeWallTime(year, month, day + 1) - 1;
}

export function romeDayKey(instant: number) {
  const { year, month, day } = romeDayParts(instant);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function eventStartInstant(item: EventDateInput) {
  return parseEventDate(item.start_date)?.instant ?? null;
}

// Fine effettiva: la data di fine se presente; per eventi di giornata o senza fine, la fine di quel giorno.
export function eventEndInstant(item: EventDateInput) {
  const start = parseEventDate(item.start_date);
  if (!start) return null;
  const end = parseEventDate(item.end_date);
  if (end) return end.hasTime && !item.all_day ? end.instant : endOfRomeDay(end.instant);
  // Senza data di fine l'evento resta "in corso" fino a fine giornata.
  return endOfRomeDay(start.instant);
}

export function isEventOngoing(item: EventDateInput, now = Date.now()) {
  const start = eventStartInstant(item);
  const end = eventEndInstant(item);
  return start !== null && end !== null && start <= now && end >= now;
}

export function isEventPast(item: EventDateInput, now = Date.now()) {
  const end = eventEndInstant(item);
  return end !== null && end < now;
}

// Eventi da mostrare come "prossimi": in corso o futuri, ordinati per inizio.
export function currentAndUpcomingEvents<T extends EventDateInput>(items: T[], now = Date.now()) {
  return items
    .filter((item) => eventStartInstant(item) !== null && !isEventPast(item, now))
    .sort((a, b) => (eventStartInstant(a) ?? 0) - (eventStartInstant(b) ?? 0));
}

// Data da passare a Directus per non escludere gli eventi già iniziati ma non ancora finiti.
export function directusUpcomingLowerBound(now = Date.now(), lookbackDays = 31) {
  return romeDayKey(now - lookbackDays * DAY_MS);
}

function format(instant: number, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: EVENT_TIME_ZONE, ...options }).format(new Date(instant));
}

export function eventDayBadge(value: string | null | undefined) {
  const parsed = parseEventDate(value);
  if (!parsed) return null;
  return {
    day: format(parsed.instant, { day: "2-digit" }),
    month: format(parsed.instant, { month: "short" }).replace(".", "").toUpperCase(),
    year: format(parsed.instant, { year: "numeric" }),
  };
}

// Orario "HH:MM", oppure null per eventi di giornata.
export function eventTimeLabel(item: EventDateInput) {
  const start = parseEventDate(item.start_date);
  if (!start || isAllDayEvent(item)) return null;
  return format(start.instant, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

// "sabato 24 ottobre 2026, 14:00" oppure "sabato 24 ottobre 2026" per eventi di giornata.
export function eventStartLabel(item: EventDateInput) {
  const start = parseEventDate(item.start_date);
  if (!start) return null;
  const day = format(start.instant, { dateStyle: "full" });
  const time = eventTimeLabel(item);
  return time ? `${day}, ${time}` : day;
}

// Etichetta della fine, solo se cade in un giorno diverso dall'inizio.
export function eventEndLabel(item: EventDateInput) {
  const start = parseEventDate(item.start_date);
  const end = parseEventDate(item.end_date);
  if (!start || !end) return null;
  if (romeDayKey(start.instant) === romeDayKey(end.instant)) {
    return end.hasTime && !isAllDayEvent(item) ? format(end.instant, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : null;
  }
  return format(end.instant, { dateStyle: "full" });
}

export function formatEventDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  const parsed = parseEventDate(value);
  return parsed ? format(parsed.instant, options) : "";
}

function calendarStamp(instant: number) {
  return new Date(instant).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function calendarDay(instant: number) {
  return romeDayKey(instant).replace(/-/g, "");
}

// Intervallo nel formato di Google Calendar: giorni interi per eventi di giornata.
export function googleCalendarDates(item: EventDateInput) {
  const start = parseEventDate(item.start_date);
  if (!start) return null;
  if (isAllDayEvent(item)) {
    const end = eventEndInstant(item) ?? start.instant;
    return `${calendarDay(start.instant)}/${calendarDay(end + 1)}`;
  }
  const end = parseEventDate(item.end_date);
  const endInstant = end && end.instant > start.instant ? end.instant : start.instant + 2 * 60 * 60 * 1000;
  return `${calendarStamp(start.instant)}/${calendarStamp(endInstant)}`;
}
