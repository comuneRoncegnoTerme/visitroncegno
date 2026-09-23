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
  { name: "image", label: "Immagine", type: "media", mediaKind: "image", full: true, help: "Scegli una foto già presente oppure caricane una nuova direttamente da questa scheda." },

  { name: "place_type", label: "Tipo di luogo", type: "select", options: [
    { label: "Patrimonio / monumento", value: "heritage" },
    { label: "Museo", value: "museum" },
    { label: "Istituzione / edificio pubblico", value: "institution" },
    { label: "Parcheggio", value: "parking" },
    { label: "Stazione / mobilità", value: "station" },
    { label: "Ristorazione", value: "food" },
    { label: "Ospitalità", value: "sleep" },
    { label: "Servizio", value: "service" },
    { label: "Natura", value: "nature" },
    { label: "Altro", value: "other" },
  ], help: "Determina la struttura e le informazioni prioritarie della scheda pubblica." },
  { name: "detail_mode", label: "Tipo di scheda", type: "select", options: [
    { label: "Scheda luogo completa", value: "internal" },
    { label: "Scheda pratica compatta", value: "compact" },
    { label: "Rimando a pagina interna dedicata", value: "redirect" },
    { label: "Rimando a sito esterno", value: "external" },
  ] },
  { name: "canonical_path", label: "Pagina interna dedicata", full: true, help: "Solo per i redirect interni, ad esempio /musei/mulino-angeli." },
  { name: "external_detail_url", label: "Pagina esterna ufficiale", type: "url", full: true, help: "Solo per le schede che rimandano a un sito esterno." },

  { name: "opening_hours", label: "Orari", type: "textarea", full: true },
  { name: "ticket_info", label: "Biglietti / accesso", type: "textarea", full: true },
  { name: "visit_duration", label: "Durata consigliata della visita" },
  { name: "services_notes", label: "Servizi disponibili", type: "textarea", full: true },
  { name: "capacity_notes", label: "Capienza / posti disponibili" },
  { name: "restrictions_notes", label: "Limitazioni e condizioni", type: "textarea", full: true },

  { name: "address", label: "Indirizzo", full: true },
  { name: "phone", label: "Telefono", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "website_url", label: "Sito web", type: "url", full: true },
  { name: "booking_url", label: "Prenotazione / contatto online", type: "url", full: true },
  { name: "access_notes", label: "Indicazioni di accesso", type: "textarea", full: true },
  { name: "parking_notes", label: "Parcheggio", type: "textarea", full: true },
  { name: "public_transport_notes", label: "Trasporto pubblico", type: "textarea", full: true },

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
      description="Gestisci luoghi, ristoranti, strutture ricettive, servizi, contatti, coordinate e presenza sulla mappa. Il Content Hub mostra automaticamente solo i campi realmente disponibili nello schema Directus installato."
      fields={fields}
      previewBase="/luoghi"
    />
  );
}
