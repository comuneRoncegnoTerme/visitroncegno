import { getVersion, setWorkerUrl } from "maplibre-gl";

let configured = false;

// Con il bundler di Next l'URL automatico del worker non è risolvibile:
// lo serviamo da public/ (copiato da scripts/sync-maplibre-worker.mjs) e lo dichiariamo qui.
export function configureMapLibreWorker() {
  if (configured) return;
  setWorkerUrl(`/maplibre-gl-worker.mjs?v=${getVersion()}`);
  configured = true;
}
