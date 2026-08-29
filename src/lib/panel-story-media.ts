import { directusJson } from "@/lib/directus-client";

type StoryMedia = {
  image: string | null;
  audio_file: string | null;
  audio_title: string | null;
};

type StoryMediaResponse = { data?: Partial<StoryMedia>[] };

async function fetchStoryMedia(params: URLSearchParams): Promise<StoryMedia | null> {
  try {
    const response = await directusJson<StoryMediaResponse>(
      `/items/stories?${params.toString()}`,
      { authenticated: true }
    );
    const item = response.data?.[0];
    if (!item) return null;
    return {
      image: item.image ?? null,
      audio_file: item.audio_file ?? null,
      audio_title: item.audio_title ?? null,
    };
  } catch {
    return null;
  }
}

async function findStoryMedia(legacySlug: string, fields: string) {
  const byLegacyUrl = new URLSearchParams();
  byLegacyUrl.set("filter[status][_eq]", "published");
  byLegacyUrl.set("filter[source_url][_contains]", `/it/sentieri/${legacySlug}`);
  byLegacyUrl.set("fields", fields);
  byLegacyUrl.set("limit", "1");

  const fromLegacyUrl = await fetchStoryMedia(byLegacyUrl);
  if (fromLegacyUrl) return fromLegacyUrl;

  const bySlug = new URLSearchParams();
  bySlug.set("filter[status][_eq]", "published");
  bySlug.set("filter[slug][_eq]", legacySlug);
  bySlug.set("fields", fields);
  bySlug.set("limit", "1");
  return fetchStoryMedia(bySlug);
}

export async function getPanelStoryMedia(legacySlug: string): Promise<StoryMedia | null> {
  const complete = await findStoryMedia(legacySlug, "image,audio_file,audio_title");
  if (complete) return complete;

  // Keeps existing Directus installations working until the optional audio fields are added.
  return findStoryMedia(legacySlug, "image");
}
