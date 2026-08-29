import { getCinqueValliPanel } from "@/lib/cinque-valli-panels";
import { getTrailPanel } from "@/lib/trail-panels";

const LEGACY_TRAIL_PREFIX = "/it/sentieri/";

const EXTRA_PANEL_NUMBERS: Record<string, string> = {
  "miniera-di-cinque-valli-8": "26–27",
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
