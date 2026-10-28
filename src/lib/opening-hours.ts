// Orari di apertura scritti a mano in Directus (campo "Orari" dei luoghi), letti in una forma strutturata.
//
// Una riga per periodo; il periodo è facoltativo (senza date vale tutto l'anno):
//   18/04/2026 – 14/06/2026: sab, dom 09:00–12:00
//   16 giugno – 13 settembre: mar, gio 15:30–18:30; sab, dom 09:00–12:00
//   mar–dom 10:00–12:00, 15:30–18:00
// Le righe che non si riconoscono restano come note ("In inverno su prenotazione").
// Il calcolo usa l'ora di Roncegno, indipendentemente dal fuso di chi guarda.

const TIME_ZONE = "Europe/Rome";

const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
// 0 = lunedì … 6 = domenica
const WEEKDAYS = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const WEEKDAY_NAMES = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];

export type TimeSlot = { from: number; to: number };
export type DayRule = { days: number[]; slots: TimeSlot[] };
export type Season = {
  /** "MM-DD" o "YYYY-MM-DD"; null = tutto l'anno. */
  from: string | null;
  to: string | null;
  rules: DayRule[];
  label: string;
};
export type OpeningHours = { seasons: Season[]; notes: string[] };

const DATE = String.raw`(\d{1,2})(?:[/.](\d{1,2})|\s+(${MONTHS.join("|")}))(?:[/.\s]+(\d{4}))?`;
const DATE_RANGE = new RegExp(String.raw`^\s*(?:dal\s+)?${DATE}\s*(?:[–—-]|al)\s*${DATE}\s*:?\s*`, "i");
const TIME_RANGE = /(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/g;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(day: string, numericMonth: string | undefined, monthName: string | undefined, year: string | undefined) {
  const month = numericMonth ? Number(numericMonth) : MONTHS.indexOf(monthName!.toLowerCase()) + 1;
  const dayNumber = Number(day);
  if (month < 1 || month > 12 || dayNumber < 1 || dayNumber > 31) return null;
  const monthDay = `${pad(month)}-${pad(dayNumber)}`;
  return year ? `${year}-${monthDay}` : monthDay;
}

function weekdayIndex(token: string) {
  const value = token.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return WEEKDAYS.findIndex((prefix) => value.startsWith(prefix));
}

// "sab, dom", "mar–dom", "da martedì a domenica", "tutti i giorni"
function parseDays(text: string): number[] | null {
  const value = text.trim().toLowerCase();
  if (!value) return null;
  if (/tutti i giorni|ogni giorno|giornaliero/.test(value)) return [0, 1, 2, 3, 4, 5, 6];
  const days = new Set<number>();
  const parts = value.replace(/\be\b/g, ",").split(/[,/]+/).map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const range = part.match(/^(?:da\s+)?([a-zìé]+)\.?(?:\s*[–—-]\s*|\s+al?\s+)([a-zìé]+)\.?$/);
    if (range) {
      const start = weekdayIndex(range[1]);
      const end = weekdayIndex(range[2]);
      if (start < 0 || end < 0) return null;
      for (let day = start; ; day = (day + 1) % 7) {
        days.add(day);
        if (day === end) break;
      }
      continue;
    }
    const single = weekdayIndex(part.replace(/\.$/, ""));
    if (single < 0 || !/^[a-zìé]+\.?$/.test(part)) return null;
    days.add(single);
  }
  return days.size ? [...days].sort((a, b) => a - b) : null;
}

// "sab, dom 09:00–12:00; mar, gio 15:30–18:30"
function parseRules(text: string): DayRule[] | null {
  const rules: DayRule[] = [];
  for (const chunk of text.split(";").map((part) => part.trim()).filter(Boolean)) {
    const firstTime = chunk.search(/\d{1,2}[:.]\d{2}/);
    if (firstTime < 0) return null;
    const days = parseDays(chunk.slice(0, firstTime).replace(/[·:]\s*$/, "").replace(/\bore\b/g, "").replace(/\bdalle\b/g, ""));
    const slots = [...chunk.slice(firstTime).matchAll(TIME_RANGE)].map((match) => ({
      from: Number(match[1]) * 60 + Number(match[2]),
      to: Number(match[3]) * 60 + Number(match[4]),
    }));
    if (!days || !slots.length || slots.some((slot) => slot.to <= slot.from)) return null;
    rules.push({ days, slots });
  }
  return rules.length ? rules : null;
}

export function parseOpeningHours(text: string | null | undefined): OpeningHours | null {
  if (!text?.trim()) return null;
  const seasons: Season[] = [];
  const notes: string[] = [];

  for (const line of text.split(/\r?\n/).map((part) => part.trim()).filter(Boolean)) {
    const range = line.match(DATE_RANGE);
    if (range) {
      // Un anno scritto su una sola delle due date vale per entrambe.
      const year = range[4] ?? range[8];
      const from = dateKey(range[1], range[2], range[3], range[4] ?? year);
      const to = dateKey(range[5], range[6], range[7], range[8] ?? year);
      const rules = parseRules(line.slice(range[0].length));
      if (from && to && rules) {
        seasons.push({ from, to, rules, label: line.slice(0, range[0].length).replace(/:\s*$/, "").trim() });
        continue;
      }
    } else {
      const rules = parseRules(line);
      if (rules) {
        seasons.push({ from: null, to: null, rules, label: "Tutto l’anno" });
        continue;
      }
    }
    notes.push(line);
  }

  return { seasons, notes };
}

type RomeDay = { year: number; month: number; day: number; weekday: number };

function romeNow(instant: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(instant));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), minutes: value("hour") * 60 + value("minute") };
}

// Giorno di calendario spostato di "offset" giorni: aritmetica in UTC, senza fusi.
function shiftDay(base: { year: number; month: number; day: number }, offset: number): RomeDay {
  const date = new Date(Date.UTC(base.year, base.month - 1, base.day + offset));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: (date.getUTCDay() + 6) % 7,
  };
}

function inSeason(season: Season, day: RomeDay) {
  if (!season.from || !season.to) return true;
  const full = `${day.year}-${pad(day.month)}-${pad(day.day)}`;
  if (season.from.length === 10) return season.from <= full && full <= season.to;
  const short = full.slice(5);
  // Un periodo senza anno vale ogni anno e può scavalcare il capodanno (es. 01/12 – 31/03).
  return season.from <= season.to
    ? season.from <= short && short <= season.to
    : short >= season.from || short <= season.to;
}

export function slotsForDay(hours: OpeningHours, day: RomeDay): TimeSlot[] {
  const slots = hours.seasons
    .filter((season) => inSeason(season, day))
    .flatMap((season) => season.rules.filter((rule) => rule.days.includes(day.weekday)).flatMap((rule) => rule.slots));
  return slots.sort((a, b) => a.from - b.from);
}

export function formatMinutes(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export type OpeningStatus =
  | { state: "open"; until: string; label: string }
  | { state: "closed"; label: string; next: string | null; seasonal: boolean };

const LOOKAHEAD_DAYS = 370;

export function openingStatus(hours: OpeningHours, now = Date.now()): OpeningStatus | null {
  if (!hours.seasons.length) return null;
  const current = romeNow(now);
  const today = shiftDay(current, 0);

  const open = slotsForDay(hours, today).find((slot) => slot.from <= current.minutes && current.minutes < slot.to);
  if (open) return { state: "open", until: formatMinutes(open.to), label: `Aperto ora · fino alle ${formatMinutes(open.to)}` };

  for (let offset = 0; offset <= LOOKAHEAD_DAYS; offset += 1) {
    const day = shiftDay(current, offset);
    const slot = slotsForDay(hours, day).find((item) => offset > 0 || item.from > current.minutes);
    if (!slot) continue;
    const time = formatMinutes(slot.from);
    let when: string;
    if (offset === 0) when = `oggi alle ${time}`;
    else if (offset === 1) when = `domani alle ${time}`;
    else if (offset < 7) when = `${WEEKDAY_NAMES[day.weekday]} alle ${time}`;
    else when = `il ${day.day} ${MONTHS[day.month - 1]}${day.year !== today.year ? ` ${day.year}` : ""}`;
    const seasonal = offset >= 14;
    return {
      state: "closed",
      label: seasonal ? `Chiuso per la stagione · riapre ${when}` : `Chiuso · apre ${when}`,
      next: when,
      seasonal,
    };
  }
  return { state: "closed", label: "Chiuso per la stagione", next: null, seasonal: true };
}

export type WeekDay = { key: string; label: string; today: boolean; slots: string[] };

/** I prossimi sette giorni, da oggi, con gli orari di ciascun giorno. */
export function upcomingWeek(hours: OpeningHours, now = Date.now()): WeekDay[] {
  const current = romeNow(now);
  return Array.from({ length: 7 }, (_, offset) => {
    const day = shiftDay(current, offset);
    return {
      key: `${day.year}-${pad(day.month)}-${pad(day.day)}`,
      label: offset === 0 ? "Oggi" : `${WEEKDAY_NAMES[day.weekday].slice(0, 3)} ${day.day}`,
      today: offset === 0,
      slots: slotsForDay(hours, day).map((slot) => `${formatMinutes(slot.from)}–${formatMinutes(slot.to)}`),
    };
  });
}

/** Righe leggibili per una tabella: periodo e orari per giorno. */
export function describeSeason(season: Season) {
  return season.rules.map((rule) => {
    const days = rule.days.length === 7 ? "Tutti i giorni" : describeDays(rule.days);
    return `${days} · ${rule.slots.map((slot) => `${formatMinutes(slot.from)}–${formatMinutes(slot.to)}`).join(", ")}`;
  });
}

function describeDays(days: number[]) {
  const consecutive = days.length > 2 && days.every((day, index) => index === 0 || day === days[index - 1] + 1);
  if (consecutive) return `${capitalize(WEEKDAY_NAMES[days[0]])}–${WEEKDAY_NAMES[days[days.length - 1]]}`;
  const names = days.map((day) => WEEKDAY_NAMES[day]);
  const text = names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}` : names[0];
  return capitalize(text);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export type SeasonFocus = { season: Season; state: "current" | "upcoming" | "past"; when: string | null };

function seasonStart(season: Season, today: RomeDay) {
  if (!season.from) return null;
  if (season.from.length === 10) return season.from;
  // Senza anno: il prossimo inizio, quest'anno o l'anno dopo.
  const thisYear = `${today.year}-${season.from}`;
  const full = `${today.year}-${pad(today.month)}-${pad(today.day)}`;
  return thisYear >= full ? thisYear : `${today.year + 1}-${season.from}`;
}

function formatKey(key: string, withYear: boolean) {
  const [year, month, day] = key.length === 10 ? key.split("-").map(Number) : [null, ...key.split("-").map(Number)];
  return `${day} ${MONTHS[month! - 1]}${withYear && year ? ` ${year}` : ""}`;
}

/** Il periodo che interessa adesso: quello in corso, altrimenti il prossimo, altrimenti l'ultimo concluso. */
export function seasonInFocus(hours: OpeningHours, now = Date.now()): SeasonFocus | null {
  if (!hours.seasons.length) return null;
  const today = shiftDay(romeNow(now), 0);
  const current = hours.seasons.find((season) => inSeason(season, today));
  if (current) return { season: current, state: "current", when: current.to ? `fino al ${formatKey(current.to, false)}` : null };

  const upcoming = hours.seasons
    .map((season) => ({ season, start: seasonStart(season, today) }))
    .filter((item): item is { season: Season; start: string } => item.start !== null && item.start > `${today.year}-${pad(today.month)}-${pad(today.day)}`)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  if (upcoming) return { season: upcoming.season, state: "upcoming", when: `dal ${formatKey(upcoming.start, upcoming.start.slice(0, 4) !== String(today.year))}` };

  const last = [...hours.seasons].sort((a, b) => (a.to ?? "").localeCompare(b.to ?? "")).at(-1)!;
  return { season: last, state: "past", when: last.to ? `conclusa il ${formatKey(last.to, true)}` : null };
}
