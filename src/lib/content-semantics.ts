import { getCinqueValliPanel } from "@/lib/cinque-valli-panels";
import { getMasoPanel } from "@/lib/masi-panels";
import { getTrailPanel } from "@/lib/trail-panels";

const LEGACY_TRAIL_PREFIX = "/it/sentieri/";

// Numeri dei pannelli il cui testo arriva solo dalle storie Directus (dal gestionale QR, data/qr-codes.json).
export const EXTRA_PANEL_NUMBERS: Record<string, string> = {
  "le-fonti-2-1": "04",
  "acque-termali-2-2": "05",
  "storia-terme-roncegno-6": "23",
  "flora-7-1": "24",
  "fauna-7-2": "25",
  "miniera-di-cinque-valli-8": "26–27",
  "camminamento-austriaco-10": "29",
  "bostrico-tipografo-11-2": "31",
  "ricostruzione-bosco-11-3": "32",
};

function legacySlugFromPath(path: string | null | undefined) {
  if (!path?.startsWith(LEGACY_TRAIL_PREFIX)) return null;
  return path.slice(LEGACY_TRAIL_PREFIX.length).split("/")[0] || null;
}

export function isLegacyTrailPanelPath(path: string | null | undefined) {
  return legacySlugFromPath(path) !== null;
}

export function getLegacyPanelNumber(path: string | null | undefined) {
  const slug = legacySlugFromPath(path);
  if (!slug) return null;

  return (
    getTrailPanel(slug)?.panelNumber ??
    getCinqueValliPanel(slug)?.panelNumber ??
    getMasoPanel(slug)?.panelNumber ??
    EXTRA_PANEL_NUMBERS[slug] ??
    null
  );
}

export function contentKindLabel(path: string | null | undefined) {
  return isLegacyTrailPanelPath(path) ? "Pannello" : "Approfondimento";
}

export function contentCtaLabel(path: string | null | undefined) {
  return isLegacyTrailPanelPath(path) ? "Apri il pannello" : "Apri l’approfondimento";
}
