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
  { name: "title", label: "Nome del luogo / attività", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true },
  { name: "summary", label: "Descrizione breve", type: "textarea", full: true },
  { name: "image", label: "ID immagine Directus", full: true, help: "Carica il file dalla sezione Media e incolla qui il suo ID." },
  { name: "show_on_map", label: "Mostra sulla mappa", type: "checkbox", help: "Richiede latitudine e longitudine." },
  {
    name: "map_label",
    label: "Tipologia per sito e mappa",
    type: "select",
    help: "Questa scelta alimenta i filtri della mappa e le sezioni Mangiare/Dormire.",
    options: [
      { label: "Luogo", value: "Luogo" },
      { label: "Museo", value: "Museo" },
      { label: "Natura", value: "Natura" },
      { label: "Ristorante", value: "Ristorante" },
      { label: "Pizzeria", value: "Pizzeria" },
      { label: "Bar", value: "Bar" },
      { label: "Hotel", value: "Hotel" },
      { label: "B&B", value: "B&B" },
      { label: "Agriturismo", value: "Agriturismo" },
      { label: "Appartamento", value: "Appartamento" },
      { label: "Parcheggio", value: "Parcheggio" },
      { label: "Servizio", value: "Servizio" },
    ],
  },
  {
    name: "map_icon",
    label: "Icona mappa",
    type: "select",
    help: "Usata per mantenere coerente la rappresentazione cartografica.",
    options: [
      { label: "Generica", value: "place" },
      { label: "Museo", value: "museum" },
      { label: "Natura", value: "nature" },
      { label: "Mangiare", value: "food" },
      { label: "Dormire", value: "sleep" },
      { label: "Parcheggio", value: "parking" },
      { label: "Servizio", value: "service" },
    ],
  },
  { name: "latitude", label: "Latitudine", type: "number", step: "0.000001" },
  { name: "longitude", label: "Longitudine", type: "number", step: "0.000001" },
  { name: "map_priority", label: "Priorità mappa", type: "number", step: "1" },
];

export default async function ContentHubPlacesPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="places"
      title="Luoghi, mangiare e dormire"
      description="Gestisci luoghi, ristoranti, strutture ricettive, servizi, coordinate e presenza sulla mappa. La tipologia scelta qui alimenta automaticamente Organizza la visita e i filtri della mappa."
      fields={fields}
      previewBase="/luoghi"
    />
  );
}
