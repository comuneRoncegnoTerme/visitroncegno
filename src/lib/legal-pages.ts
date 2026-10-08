import { directusJson } from "@/lib/directus-client";
import { plainText } from "@/lib/editorial";

// Pagine istituzionali obbligatorie. Il testo è gestito dalla collection Directus `pages`
// (campi attesi: slug, title, status, content): finché una pagina non è pubblicata,
// la route risponde 404 e il link non compare nel footer.
export const LEGAL_PAGES = [
  { slug: "privacy", path: "/privacy", label: "Privacy" },
  { slug: "cookie", path: "/cookie", label: "Cookie" },
  { slug: "accessibilita", path: "/accessibilita", label: "Dichiarazione di accessibilità" },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]["slug"];

type PageRecord = Record<string, unknown> & { slug?: string; title?: string | null };

function textField(record: PageRecord, names: string[]) {
  for (const name of names) {
    const value = record[name];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export async function getLegalPage(slug: LegalSlug) {
  const params = new URLSearchParams({
    "filter[slug][_eq]": slug,
    "filter[status][_eq]": "published",
    fields: "*",
    limit: "1",
  });
  try {
    const result = await directusJson<{ data?: PageRecord[] }>(`/items/pages?${params.toString()}`, { cache: "no-store" });
    const page = result.data?.[0];
    if (!page) return null;
    const body = textField(page, ["content", "body", "text", "description"]);
    return {
      title: textField(page, ["title", "name"]) ?? LEGAL_PAGES.find((item) => item.slug === slug)?.label ?? "",
      paragraphs: plainText(body),
      updated: textField(page, ["date_updated", "date_created"]),
    };
  } catch (error) {
    console.warn("Directus legal page unavailable", { slug, message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  }
}

export async function getPublishedLegalLinks() {
  const params = new URLSearchParams({
    "filter[slug][_in]": LEGAL_PAGES.map((page) => page.slug).join(","),
    "filter[status][_eq]": "published",
    fields: "slug",
    limit: String(LEGAL_PAGES.length),
  });
  try {
    const result = await directusJson<{ data?: PageRecord[] }>(`/items/pages?${params.toString()}`, { next: { revalidate: 300 } });
    const published = new Set((result.data ?? []).map((page) => page.slug));
    return LEGAL_PAGES.filter((page) => published.has(page.slug));
  } catch {
    return [];
  }
}
