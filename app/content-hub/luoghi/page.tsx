import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import CollectionEditor, { type EditorField } from "../CollectionEditor";

const fields: EditorField[] = [
  { name: "status", label: "Stato", type: "select", required: true, options: [
    { label: "Bozza", value: "draft" },
    { label: "Pubblicato", value: "published" },
    { label: "Archiviato", value: "archived" },
  ] },
  { name: "featured", label: "In evidenza", type: "checkbox", help: "Può comparire nelle sezioni editoriali della homepage." },
  { name: "title", label: "Nome del luogo", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true },
  { name: "summary", label: "Descrizione breve", type: "textarea", full: true },
  { name: "show_on_map", label: "Mostra sulla mappa", type: "checkbox", help: "Richiede latitudine e longitudine." },
  { name: "map_label", label: "Etichetta mappa" },
  { name: "map_icon", label: "Icona mappa", help: "Esempi: museum, nature, mountain, church, lake." },
  { name: "latitude", label: "Latitudine", type: "number", step: "0.000001" },
  { name: "longitude", label: "Longitudine", type: "number", step: "0.000001" },
  { name: "map_priority", label: "Priorità mappa", type: "number", step: "1" },
];

export default async function ContentHubPlacesPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="places"
      title="Luoghi"
      description="Gestisci schede territoriali, coordinate e presenza sulla mappa. Le coordinate inserite qui alimentano direttamente la mappa del sito."
      fields={fields}
      previewBase="/luoghi"
    />
  );
}
