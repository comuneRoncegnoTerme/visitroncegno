import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import CollectionEditor, { type EditorField } from "../CollectionEditor";

const fields: EditorField[] = [
  { name: "status", label: "Stato", type: "select", required: true, options: [
    { label: "Bozza", value: "draft" },
    { label: "Pubblicato", value: "published" },
    { label: "Archiviato", value: "archived" },
  ] },
  { name: "featured", label: "In evidenza", type: "checkbox", help: "Porta l'evento tra i contenuti prioritari del sito." },

  { name: "title", label: "Titolo dell'evento", required: true, full: true },
  { name: "slug", label: "Indirizzo URL", required: true, full: true, help: "Viene proposto automaticamente quando crei un nuovo evento. Modificalo solo se serve." },
  { name: "summary", label: "Testo breve", type: "textarea", full: true, help: "Due o tre righe per card, anteprime e apertura della pagina evento." },
  { name: "content", label: "Racconto dell'evento", type: "textarea", full: true, help: "Il testo principale della pagina. Evita di ripetere il testo breve: qui puoi aggiungere programma, dettagli e informazioni utili." },
  { name: "image", label: "Immagine di copertina", type: "media", mediaKind: "image", full: true, help: "Scegli una foto orizzontale già presente oppure caricane una nuova." },

  { name: "start_date", label: "Inizio", type: "datetime-local", required: true },
  { name: "end_date", label: "Fine", type: "datetime-local" },
  { name: "all_day", label: "Evento tutto il giorno", type: "checkbox", full: true },

  { name: "location_name", label: "Nome del luogo", full: true, help: "Esempio: Piazza A. De Giovanni, Sentiero del Castagno, Teatro comunale." },
  { name: "address", label: "Indirizzo", full: true, help: "Se presente viene usato anche per il link alle indicazioni." },

  { name: "ticket_info", label: "Biglietti / accesso", full: true, help: "Esempio: ingresso libero, € 10, prenotazione obbligatoria." },
  { name: "booking_url", label: "Link prenotazione", type: "url", full: true },
  { name: "website_url", label: "Sito ufficiale", type: "url", full: true },
  { name: "phone", label: "Telefono", type: "tel" },
  { name: "email", label: "Email", type: "email" },
];

export default async function ContentHubEventsPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="events"
      title="Eventi"
      description="Pubblica un appuntamento completo: prima le informazioni essenziali, poi immagine, luogo e contatti. I campi non disponibili nello schema Directus vengono nascosti automaticamente."
      fields={fields}
      previewBase="/eventi"
    />
  );
}
