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
    help: "Usa etichette coerenti: Luogo, Museo, Natura, Ristorante, Pizzeria, Bar, Hotel, B&B, Agriturismo, Appartamento, Parcheggio o Servizio. Alimenta automaticamente i filtri della mappa e le sezioni Mangiare/Dormire.",
  },
  {
    name: "map_icon",
    label: "Icona mappa",
    help: "Valori consigliati: place, museum, nature, food, sleep, parking, service. I valori esistenti restano compatibili.",
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
      description="Gestisci luoghi, ristoranti, strutture ricettive, servizi, coordinate e presenza sulla mappa. La tipologia inserita qui alimenta automaticamente Organizza la visita e i filtri cartografici."
      fields={fields}
      previewBase="/luoghi"
    />
  );
}
