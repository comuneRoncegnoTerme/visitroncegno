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
  { name: "title", label: "Titolo", required: true, full: true },
  { name: "slug", label: "Slug URL", required: true, full: true },
  { name: "excerpt", label: "Testo breve", type: "textarea", full: true },
  { name: "body", label: "Testo completo", type: "textarea", full: true },
  { name: "image", label: "Immagine", type: "media", mediaKind: "image", full: true },
  { name: "audio_file", label: "Audio", type: "media", mediaKind: "file", full: true },
  { name: "audio_title", label: "Titolo audio", full: true },
  {
    name: "place",
    label: "Luogo collegato",
    type: "relation",
    relationCollection: "places",
    full: true,
    help: "Collega la storia a un luogo: apparirà automaticamente nella scheda pubblica del luogo.",
  },
  {
    name: "route",
    label: "Percorso collegato",
    type: "relation",
    relationCollection: "routes",
    full: true,
    help: "Collega la storia a un percorso: apparirà nel racconto del percorso.",
  },
  { name: "source_label", label: "Etichetta fonte", full: true },
  { name: "source_url", label: "URL fonte", type: "url", full: true },
];

export default async function ContentHubStoriesPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  return (
    <CollectionEditor
      collection="stories"
      title="Storie e memoria"
      description="Gestisci racconti, testimonianze e approfondimenti e collegali ai luoghi e ai percorsi del territorio."
      fields={fields}
      previewBase="/storie"
    />
  );
}
