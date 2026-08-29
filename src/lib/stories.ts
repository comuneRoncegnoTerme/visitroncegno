import { directusJson } from "@/lib/directus-client";

export interface StoryItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  image: string | null;
  source_url: string | null;
  source_label: string | null;
  category?: { name: string } | null;
  route?: { id: number; title: string; slug: string } | null;
}

type StoryLinkInput = Pick<StoryItem, "slug" | "source_url">;
type LegacyStoryCopy = { excerpt?: string; body?: string };
type StoryResponse = { data?: StoryItem[] };

const LEGACY_PATH_BY_STORY_SLUG: Record<string, string> = {
  "tempesta-vaia-cinque-valli": "/it/sentieri/la-tempesta-vaia-11-1",
  "bostrico-tipografo-cinque-valli": "/it/sentieri/bostrico-tipografo-11-2",
};

const STORY_SLUG_BY_LEGACY_SLUG = Object.fromEntries(
  Object.entries(LEGACY_PATH_BY_STORY_SLUG).map(([storySlug, path]) => [
    path.split("/").filter(Boolean).at(-1) as string,
    storySlug,
  ])
) as Record<string, string>;

const LEGACY_STORY_COPY: Record<string, LegacyStoryCopy> = {
  "bostrico-tipografo-11-2": {
    excerpt:
      "La tempesta Vaia, oltre a provocare ingenti danni diretti, ha creato le condizioni ideali per la diffusione incontrollata del bostrico proprio sulle superfici boscate inizialmente scampate alla tempesta.",
    body: [
      "<p>La tempesta Vaia, oltre a provocare ingenti danni diretti, ha creato le condizioni ideali per la diffusione incontrollata del bostrico proprio sulle superfici boscate inizialmente scampate alla tempesta.</p>",
      "<p>L’Ips thypographus, meglio noto come bostrico tipografo, è un piccolo insetto coleottero del gruppo degli Scolitidi, di forma cilindrica e di colore bruno, lungo circa 4-5 mm. È endemico dei boschi del Trentino e attacca prevalentemente l’abete rosso.</p>",
      "<p>Una volta penetrato sotto corteccia, il bostrico scava delle gallerie che interrompono il flusso di linfa nel floema. In tal modo gli zuccheri prodotti dalla chioma non raggiungono più le radici. Inoltre, quando penetrano nei tronchi, gli adulti trasportano anche funghi patogeni, che intasano i vasi di conduzione dell’acqua nell’albero (xilema). Entrambi i fattori, la distruzione del floema da parte delle larve e la ridotta conduttività dell’acqua dovuta all’infestazione fungina, portano gli abeti a morte rapida nel periodo di vegetazione.</p>",
    ].join(""),
  },
};

const LEGACY_INDEX_SLUGS = new Set([
  "sentieri-di-roncegno-1",
  "localita-cinque-valli-9",
]);

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  quot: '"',
  nbsp: " ",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  laquo: "«",
  raquo: "»",
  hellip: "…",
  ndash: "–",
  mdash: "—",
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const value = Number.parseInt(code.slice(2), 16);
      return Number.isFinite(value) ? String.fromCodePoint(value) : entity;
    }
    if (code.startsWith("#")) {
      const value = Number.parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : entity;
    }
    return HTML_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

function normalizeVisitRoncegnoLegacyPath(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value, "https://www.visitroncegno.it");
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "visitroncegno.it") return null;

    const pathname = url.pathname.replace(/\/+$/, "");
    if (!pathname.startsWith("/it/sentieri/")) return null;

    const legacySlug = pathname.split("/").filter(Boolean).at(-1);
    if (!legacySlug || LEGACY_INDEX_SLUGS.has(legacySlug)) return null;

    return pathname;
  } catch {
    return null;
  }
}

export function getLegacyStoryPath(story: StoryLinkInput): string | null {
  return LEGACY_PATH_BY_STORY_SLUG[story.slug] ?? normalizeVisitRoncegnoLegacyPath(story.source_url);
}

export function storyParagraphs(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) return [];

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}|\n/)
    .map((paragraph) => decodeHtmlEntities(paragraph.trim()))
    .filter(Boolean);
}

function storyFields() {
  return [
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
  ].join(",");
}

async function fetchStory(params: URLSearchParams): Promise<StoryItem | null> {
  try {
    const result = await directusJson<StoryResponse>(
      `/items/stories?${params.toString()}`,
      { authenticated: true }
    );
    return result.data?.[0] ?? null;
  } catch (error) {
    console.error("Directus story error:", error);
    return null;
  }
}

export async function getStories(): Promise<StoryItem[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("limit", "100");
  params.set("fields", storyFields());

  try {
    const result = await directusJson<StoryResponse>(
      `/items/stories?${params.toString()}`,
      { authenticated: true }
    );
    return result.data ?? [];
  } catch (error) {
    console.error("Directus stories list error:", error);
    return [];
  }
}

export async function getStoryBySlug(slug: string): Promise<StoryItem | null> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[slug][_eq]", slug);
  params.set("limit", "1");
  params.set("fields", storyFields());
  return fetchStory(params);
}

export async function getStoryByLegacySlug(legacySlug: string): Promise<StoryItem | null> {
  const mappedStorySlug = STORY_SLUG_BY_LEGACY_SLUG[legacySlug];
  let story = mappedStorySlug ? await getStoryBySlug(mappedStorySlug) : null;

  if (!story) {
    const params = new URLSearchParams();
    params.set("filter[status][_eq]", "published");
    params.set("filter[source_url][_contains]", `/it/sentieri/${legacySlug}`);
    params.set("limit", "1");
    params.set("fields", storyFields());
    story = await fetchStory(params);
  }

  if (!story) story = await getStoryBySlug(legacySlug);
  if (!story) return null;

  const legacyCopy = LEGACY_STORY_COPY[legacySlug];
  if (!legacyCopy) return story;

  return {
    ...story,
    excerpt: legacyCopy.excerpt ?? story.excerpt,
    body: legacyCopy.body ?? story.body,
  };
}
