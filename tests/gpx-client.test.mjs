// Test della logica GPX senza dipendenze: `node --test tests/`.
// Il parser deve funzionare anche fuori dal browser (rendering lato server).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildElevationProfile, parseGpxSegments } from "../src/lib/gpx-client.ts";

const wrap = (body) => `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">${body}</gpx>`;

test("non usa API del browser: funziona in Node", () => {
  assert.equal(typeof globalThis.DOMParser, "undefined");
  const segments = parseGpxSegments(wrap(`<trk><trkseg>
    <trkpt lat="46.05" lon="11.40"><ele>500</ele></trkpt>
    <trkpt lat="46.06" lon="11.41"><ele>520.5</ele></trkpt>
  </trkseg></trk>`));
  assert.deepEqual(segments, [[
    { latitude: 46.05, longitude: 11.4, elevation: 500 },
    { latitude: 46.06, longitude: 11.41, elevation: 520.5 },
  ]]);
});

test("gestisce più segmenti, punti senza quota, punti auto-chiusi e attributi invertiti", () => {
  const segments = parseGpxSegments(wrap(`<trk>
    <trkseg><trkpt lon="11.40" lat="46.05"/><trkpt lat='46.051' lon='11.401'><time>2026-10-01T10:00:00Z</time></trkpt></trkseg>
    <trkseg><trkpt lat="46.07" lon="11.42"><ele> 610 </ele></trkpt></trkseg>
  </trk>`));
  assert.equal(segments.length, 2);
  assert.deepEqual(segments[0][0], { latitude: 46.05, longitude: 11.4, elevation: null });
  assert.equal(segments[0][1].elevation, null);
  assert.equal(segments[1][0].elevation, 610);
});

test("accetta prefissi di namespace e ignora i commenti", () => {
  const segments = parseGpxSegments(`<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1">
    <!-- <gpx:trkpt lat="0" lon="0"/> -->
    <gpx:trk><gpx:trkseg><gpx:trkpt lat="46.1" lon="11.5"><gpx:ele>700</gpx:ele></gpx:trkpt></gpx:trkseg></gpx:trk>
  </gpx:gpx>`);
  assert.deepEqual(segments, [[{ latitude: 46.1, longitude: 11.5, elevation: 700 }]]);
});

test("usa i punti di rotta se non ci sono tracce", () => {
  const segments = parseGpxSegments(wrap(`<rte><rtept lat="46" lon="11"><ele>400</ele></rtept><rtept lat="46.01" lon="11.01"/></rte>`));
  assert.equal(segments.length, 1);
  assert.equal(segments[0].length, 2);
});

test("scarta coordinate non valide e restituisce vuoto per testo non GPX", () => {
  assert.deepEqual(parseGpxSegments(wrap(`<trk><trkseg><trkpt lat="abc" lon="11"/></trkseg></trk>`)), []);
  assert.deepEqual(parseGpxSegments("<html>errore</html>"), []);
  assert.deepEqual(parseGpxSegments(""), []);
});

test("il profilo altimetrico parte da 0 e cresce con la distanza", () => {
  const profile = buildElevationProfile(parseGpxSegments(wrap(`<trk><trkseg>
    <trkpt lat="46.00" lon="11.00"><ele>400</ele></trkpt>
    <trkpt lat="46.01" lon="11.00"><ele>450</ele></trkpt>
    <trkpt lat="46.02" lon="11.00"><ele>500</ele></trkpt>
  </trkseg></trk>`)));
  assert.equal(profile.length, 3);
  assert.equal(profile[0].distanceKm, 0);
  // 0,01° di latitudine ≈ 1,11 km
  assert.ok(Math.abs(profile[2].distanceKm - 2.224) < 0.01, `distanza ${profile[2].distanceKm}`);
});
