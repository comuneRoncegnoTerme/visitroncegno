import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import CollectionEditor, { type EditorField } from "../CollectionEditor";

const fields: EditorField[] = [
  { name: "status", label: "Stato", type: "select", required: true, options: [
    { label: "Bozza", value: "draft" },
    { label: "Pubblicato", value: "published" },
    { label: "Archiviato", value: "archived" },
  ] },
  { name: "featured", label: "In evidenza", type: "checkbox" },
  { name: "recommended", label: "Consigliato", type: "checkbox" },
  { name: "title", label: "Titolo", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true },
  { name: "summary", label: "Descrizione breve", type: "textarea", full: true },
  { name: "description", label: "Descrizione completa", type: "textarea", full: true },
  { name: "image", label: "Immagine del percorso", type: "media", mediaKind: "image", full: true, help: "Scegli una foto già presente oppure caricane una nuova direttamente da questa scheda." },
  { name: "difficulty", label: "Difficoltà" },
  { name: "distance_km", label: "Distanza (km)", type: "number", step: "0.1" },
  { name: "duration_minutes", label: "Durata (minuti)", type: "number", step: "1" },
  { name: "elevation_gain_m", label: "Dislivello + (m)", type: "number", step: "1" },
  { name: "start_latitude", label: "Latitudine partenza", type: "number", step: "0.000001" },
  { name: "start_longitude", label: "Longitudine partenza", type: "number", step: "0.000001" },
  { name: "family_friendly", label: "Adatto alle famiglie", type: "checkbox" },
  { name: "accessible", label: "Accessibile", type: "checkbox" },
  { name: "public_transport", label: "Raggiungibile con trasporto pubblico", type: "checkbox" },
  { name: "loop_route", label: "Percorso ad anello", type: "checkbox" },
  { name: "route_highlight", label: "Punto di forza", type: "textarea", full: true },
  { name: "gpx_file", label: "File GPX", type: "media", mediaKind: "file", full: true, help: "Scegli un GPX esistente oppure caricalo direttamente dalla scheda del percorso." },
];

export default async function ContentHubRoutesPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="routes"
      title="Percorsi"
      description="Gestisci schede, dati tecnici, accessibilità, immagini e file GPX dei percorsi."
      fields={fields}
      previewBase="/percorsi"
    />
  );
}
