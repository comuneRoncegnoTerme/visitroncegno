import { DIRECTUS_URL } from "@/lib/directus";

export interface StoryItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  image: string | null;
  source_url: string | null;
  source_label: string | null;
  category?: {
    name: string;
  } | null;
  route?: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

export function storyParagraphs(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) return [];

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function getStoryBySlug(slug: string): Promise<StoryItem | null> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[slug][_eq]", slug);
  params.set("limit", "1");
  params.set(
    "fields",
    [
      "id",
      "title",
      "slug",
      "excerpt",
      "body",
      "image",
      "source_url",
      "source_label",
      "category.name",
      "route.id",
      "route.title",
      "route.slug",
    ].join(",")
  );

  const token = process.env.DIRECTUS_TOKEN;

  try {
    const response = await fetch(`${DIRECTUS_URL}/items/stories?${params.toString()}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      console.error(`Directus story error: ${response.status}`);
      return null;
    }

    const result = (await response.json()) as { data?: StoryItem[] };
    return result.data?.[0] ?? null;
  } catch (error) {
    console.error("Directus story error:", error);
    return null;
  }
}
