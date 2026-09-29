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
  { name: "title", label: "Nome del luogo / attività", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true },
  { name: "summary", label: "Descrizione breve", type: "textarea", full: true },
  { name: "image", label: "Immagine", type: "media", mediaKind: "image", full: true },

  { name: "place_type", label: "Tipo di luogo", type: "select", options: [
    { label: "Patrimonio", value: "heritage" },
    { label: "Museo", value: "museum" },
    { label: "Istituzione", value: "institution" },
    { label: "Parcheggio", value: "parking" },
    { label: "Stazione", value: "station" },
    { label: "Ristorazione", value: "food" },
    { label: "Ospitalità", value: "sleep" },
    { label: "Servizio", value: "service" },
    { label: "Natura", value: "nature" },
    { label: "Altro", value: "other" },
  ] },
  { name: "detail_mode", label: "Modalità scheda", type: "select", options: [
    { label: "Pagina interna", value: "internal" },
    { label: "Scheda compatta", value: "compact" },
    { label: "Redirect interno", value: "redirect" },
    { label: "Link esterno", value: "external" },
  ] },
  { name: "canonical_path", label: "Percorso interno canonico", full: true },
  { name: "external_detail_url", label: "Pagina esterna ufficiale", type: "url", full: true },

  { name: "address", label: "Indirizzo", full: true },
  { name: "phone", label: "Telefono", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "website_url", label: "Sito web", type: "url", full: true },
  { name: "booking_url", label: "Prenotazione / contatto online", type: "url", full: true },
  { name: "opening_hours", label: "Orari", type: "textarea", full: true },
  { name: "ticket_info", label: "Biglietti / ingresso", type: "textarea", full: true },
  { name: "visit_duration", label: "Durata indicativa visita" },
  { name: "services_notes", label: "Servizi", type: "textarea", full: true },
  { name: "capacity_notes", label: "Capienza / disponibilità", type: "textarea", full: true },
  { name: "restrictions_notes", label: "Limitazioni", type: "textarea", full: true },
  { name: "access_notes", label: "Indicazioni di accesso", type: "textarea", full: true },
  { name: "parking_notes", label: "Parcheggio", type: "textarea", full: true },
  { name: "public_transport_notes", label: "Trasporto pubblico", type: "textarea", full: true },

  { name: "show_on_map", label: "Mostra sulla mappa", type: "checkbox", help: "Richiede latitudine e longitudine." },
  { name: "map_label", label: "Etichetta mappa" },
  { name: "map_icon", label: "Icona mappa" },
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
      description="Gestisci contenuti, informazioni pratiche, coordinate e comportamento della scheda."
      fields={fields}
      previewBase="/luoghi"
    />
  );
}
