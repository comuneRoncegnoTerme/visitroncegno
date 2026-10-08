import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentAndUpcomingEvents, eventEndLabel, eventStartLabel, eventTimeLabel,
  googleCalendarDates, isAllDayEvent, isEventOngoing, isEventPast, parseEventDate, schemaEventDates,
} from "../src/lib/event-dates.ts";

const at = (iso) => new Date(iso).getTime();

test("data senza fuso è ora italiana, indipendente dal fuso del server", () => {
  // 14:00 a Roncegno il 24 ottobre 2026 (ora legale, UTC+2) = 12:00 UTC
  assert.equal(parseEventDate("2026-10-24T14:00:00").instant, at("2026-10-24T12:00:00Z"));
  // 26 ottobre 2026: ora solare, UTC+1
  assert.equal(parseEventDate("2026-10-26T14:00").instant, at("2026-10-26T13:00:00Z"));
  assert.equal(parseEventDate("2026-10-24T12:00:00.000Z").instant, at("2026-10-24T12:00:00Z"));
  assert.equal(parseEventDate("non è una data"), null);
});

test("eventi di giornata: niente orario, niente \"ore 02:00\"", () => {
  const item = { start_date: "2026-10-18", all_day: false };
  assert.equal(isAllDayEvent(item), true);
  assert.equal(eventTimeLabel(item), null);
  assert.equal(eventStartLabel(item), "domenica 18 ottobre 2026");
  assert.equal(eventTimeLabel({ start_date: "2026-10-18T09:00:00", all_day: true }), null);
});

test("orario mostrato in ora italiana", () => {
  const item = { start_date: "2026-10-24T14:00:00", all_day: false };
  assert.equal(eventTimeLabel(item), "14:00");
  assert.equal(eventStartLabel(item), "sabato 24 ottobre 2026, 14:00");
});

test("la Festa resta visibile mentre è in corso", () => {
  const festa = { start_date: "2026-10-23T18:00:00", end_date: "2026-10-25T19:00:00" };
  const saturdayMorning = at("2026-10-24T08:30:00Z");
  assert.equal(isEventOngoing(festa, saturdayMorning), true);
  assert.equal(isEventPast(festa, saturdayMorning), false);
  assert.deepEqual(currentAndUpcomingEvents([festa], saturdayMorning), [festa]);
  // Domenica 25 ottobre 2026 finisce l'ora legale: le 19:00 a Roncegno sono le 18:00 UTC.
  assert.equal(isEventPast(festa, at("2026-10-25T17:59:00Z")), false);
  assert.equal(isEventPast(festa, at("2026-10-25T18:01:00Z")), true);
});

test("evento senza fine resta tra i prossimi fino a mezzanotte", () => {
  const concerto = { start_date: "2026-10-24T20:30:00" };
  assert.equal(isEventOngoing(concerto, at("2026-10-24T21:00:00Z")), true);
  assert.equal(isEventPast(concerto, at("2026-10-24T22:30:00Z")), true);
});

test("ordine per data di inizio, esclusi i passati", () => {
  const now = at("2026-10-20T10:00:00Z");
  const items = [
    { id: 3, start_date: "2026-11-01" },
    { id: 1, start_date: "2026-10-10" },
    { id: 2, start_date: "2026-10-23T18:00:00", end_date: "2026-10-25T19:00:00" },
  ];
  assert.deepEqual(currentAndUpcomingEvents(items, now).map((item) => item.id), [2, 3]);
});

test("etichetta di fine solo se serve", () => {
  assert.equal(eventEndLabel({ start_date: "2026-10-23T18:00:00", end_date: "2026-10-25T19:00:00" }), "domenica 25 ottobre 2026");
  assert.equal(eventEndLabel({ start_date: "2026-10-24T20:30:00", end_date: "2026-10-24T23:00:00" }), "23:00");
  assert.equal(eventEndLabel({ start_date: "2026-10-24" }), null);
});

test("Google Calendar: giorni interi per eventi di giornata", () => {
  assert.equal(googleCalendarDates({ start_date: "2026-10-24", end_date: "2026-10-25" }), "20261024/20261026");
  assert.equal(googleCalendarDates({ start_date: "2026-10-24T14:00:00" }), "20261024T120000Z/20261024T140000Z");
});

test("date schema.org: giorno per eventi di giornata, istante UTC per eventi con orario", () => {
  assert.deepEqual(schemaEventDates({ start_date: "2026-10-23", end_date: "2026-10-25", all_day: true }), {
    startDate: "2026-10-23",
    endDate: "2026-10-25",
  });
  assert.deepEqual(schemaEventDates({ start_date: "2026-10-25T19:00:00", end_date: null, all_day: false }), {
    startDate: "2026-10-25T18:00:00.000Z",
    endDate: undefined,
  });
  assert.equal(schemaEventDates({ start_date: null, end_date: null }), null);
});
