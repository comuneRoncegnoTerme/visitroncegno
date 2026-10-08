// Solo formati che il sito usa davvero. SVG e file generici sono esclusi: un SVG può
// contenere script e verrebbe servito dallo stesso dominio del sito.
const MEDIA_TYPES: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "audio/mpeg": [".mp3"],
  "audio/mp4": [".m4a", ".mp4"],
  "audio/x-m4a": [".m4a"],
  "audio/wav": [".wav"],
  "audio/x-wav": [".wav"],
};
// I browser non hanno un tipo fisso per i GPX: si accettano i tipi XML e generici solo con estensione .gpx.
const GPX_TYPES = ["application/gpx+xml", "application/gpx", "application/xml", "text/xml", "application/octet-stream", ""];

export function isAllowedUpload(file: { name: string; type: string }) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".gpx")) return GPX_TYPES.includes(file.type);
  const extensions = MEDIA_TYPES[file.type];
  return Boolean(extensions?.some((extension) => name.endsWith(extension)));
}
