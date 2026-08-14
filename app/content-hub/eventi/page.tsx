import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import CollectionEditor, { type EditorField } from "../CollectionEditor";

const fields: EditorField[] = [
  { name: "status", label: "Stato", type: "select", required: true, options: [
    { label: "Bozza", value: "draft" },
    { label: "Pubblicato", value: "published" },
    { label: "Archiviato", value: "archived" },
  ] },
  { name: "featured", label: "In evidenza", type: "checkbox", help: "Mostra l'evento tra i contenuti prioritari." },
  { name: "title", label: "Titolo", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true, help: "Viene proposto automaticamente quando crei un nuovo evento." },
  { name: "summary", label: "Descrizione breve", type: "textarea", full: true },
  { name: "image", label: "ID immagine Directus", full: true, help: "Carica o scegli il file dalla sezione Media e incolla qui il suo ID." },
  { name: "start_date", label: "Inizio", type: "datetime-local", required: true },
  { name: "end_date", label: "Fine", type: "datetime-local" },
  { name: "all_day", label: "Evento tutto il giorno", type: "checkbox" },
  { name: "location_name", label: "Luogo", full: true },
];

export default async function ContentHubEventsPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="events"
      title="Eventi"
      description="Crea, aggiorna e pubblica gli appuntamenti del calendario. Le modifiche vengono salvate direttamente in Directus."
      fields={fields}
      previewBase="/eventi"
    />
  );
}
