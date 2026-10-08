import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedUpload } from "../src/lib/content-hub-uploads.ts";

test("accetta foto, audio e GPX con estensione coerente", () => {
  assert.ok(isAllowedUpload({ name: "Piazza.JPG", type: "image/jpeg" }));
  assert.ok(isAllowedUpload({ name: "castagne.webp", type: "image/webp" }));
  assert.ok(isAllowedUpload({ name: "pannello-3.mp3", type: "audio/mpeg" }));
  assert.ok(isAllowedUpload({ name: "anello.gpx", type: "application/octet-stream" }));
  assert.ok(isAllowedUpload({ name: "anello.gpx", type: "" }));
});

test("rifiuta SVG, HTML e file generici travestiti", () => {
  assert.equal(isAllowedUpload({ name: "logo.svg", type: "image/svg+xml" }), false);
  assert.equal(isAllowedUpload({ name: "foto.jpg", type: "image/svg+xml" }), false);
  assert.equal(isAllowedUpload({ name: "pagina.html", type: "text/html" }), false);
  assert.equal(isAllowedUpload({ name: "script.js", type: "application/octet-stream" }), false);
  assert.equal(isAllowedUpload({ name: "anello.gpx", type: "text/html" }), false);
  assert.equal(isAllowedUpload({ name: "foto.png.html", type: "image/png" }), false);
});
