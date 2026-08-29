const PANEL_AUDIO_FILES: Record<string, string> = {
  "miniera-di-cinque-valli-8": "8c3546a0-fc47-4dc7-a2cc-ef1a76a62870",
};

export function getPanelAudioFileId(slug: string): string | null {
  return PANEL_AUDIO_FILES[slug] ?? null;
}
