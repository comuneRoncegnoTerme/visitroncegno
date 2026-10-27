import { test } from "node:test";
import assert from "node:assert/strict";
import { openingStatus, parseOpeningHours, upcomingWeek } from "../src/lib/opening-hours.ts";

// Orari 2026 del Mulino Angeli, come si scrivono in Directus.
const MULINO = `18/04/2026 – 14/06/2026: sab, dom 09:00–12:00
16/06/2026 – 13/09/2026: mar, gio 15:30–18:30; sab, dom 09:00–12:00
19/09/2026 – 25/10/2026: sab, dom 09:00–12:00
Per gruppi e scuole su prenotazione`;

const at = (iso) => new Date(iso).getTime();

test("riconosce periodi, giorni e fasce; il resto resta nota", () => {
  const hours = parseOpeningHours(MULINO);
  assert.equal(hours.seasons.length, 3);
  assert.deepEqual(hours.seasons[1].rules, [
    { days: [1, 3], slots: [{ from: 930, to: 1110 }] },
    { days: [5, 6], slots: [{ from: 540, to: 720 }] },
  ]);
  assert.deepEqual(hours.notes, ["Per gruppi e scuole su prenotazione"]);
});

test("aperto e chiuso con l'ora di Roncegno", () => {
  const hours = parseOpeningHours(MULINO);
  // Sabato 24 ottobre 2026, 10:30 a Roncegno (UTC+2)
  assert.equal(openingStatus(hours, at("2026-10-24T08:30:00Z")).label, "Aperto ora · fino alle 12:00");
  // Sabato 24 ottobre, 12:30: riapre domenica mattina
  assert.equal(openingStatus(hours, at("2026-10-24T10:30:00Z")).label, "Chiuso · apre domani alle 09:00");
  // Martedì 16 giugno, 08:00: apre nel pomeriggio
  assert.equal(openingStatus(hours, at("2026-06-16T06:00:00Z")).label, "Chiuso · apre oggi alle 15:30");
});

test("finita la stagione non c'è una riapertura inventata", () => {
  const hours = parseOpeningHours(MULINO);
  assert.deepEqual(openingStatus(hours, at("2026-10-27T10:00:00Z")), {
    state: "closed", label: "Chiuso per la stagione", next: null, seasonal: true,
  });
  // Ad aprile, prima dell'apertura: data della riapertura
  assert.equal(openingStatus(hours, at("2026-03-01T10:00:00Z")).label, "Chiuso per la stagione · riapre il 18 aprile");
});

test("periodi senza anno valgono ogni anno, anche a cavallo del capodanno", () => {
  const hours = parseOpeningHours("1 dicembre – 31 marzo: dom 14:00-17:00\nda martedì a venerdì 10.00-12.00, 15.30-18.00");
  assert.equal(hours.seasons.length, 2);
  assert.deepEqual(hours.seasons[1].rules[0].days, [1, 2, 3, 4]);
  // Domenica 3 gennaio 2027, 15:00 (UTC+1)
  assert.equal(openingStatus(hours, at("2027-01-03T14:00:00Z")).state, "open");
  // Mercoledì 6 gennaio 2027, 16:00
  assert.equal(openingStatus(hours, at("2027-01-06T15:00:00Z")).label, "Aperto ora · fino alle 18:00");
});

test("testo libero: nessuno stato calcolato", () => {
  const hours = parseOpeningHours("In inverno apertura su prenotazione");
  assert.equal(hours.seasons.length, 0);
  assert.equal(openingStatus(hours), null);
  assert.equal(parseOpeningHours("  "), null);
});

test("settimana a partire da oggi", () => {
  const week = upcomingWeek(parseOpeningHours(MULINO), at("2026-10-19T08:00:00Z"));
  assert.equal(week.length, 7);
  assert.equal(week[0].label, "Oggi");
  assert.deepEqual(week.map((day) => day.slots.length), [0, 0, 0, 0, 0, 1, 1]);
  assert.equal(week[5].label, "sab 24");
});
