import { directusJson } from "@/lib/directus-client";

type StoryMedia = {
  image: string | null;
  audio_file: string | null;
  audio_title: string | null;
};

type StoryMediaResponse = { data?: StoryMedia[] };

async function fetchStoryMedia(params: URLSearchParams): Promise<StoryMedia | null> {
  try {
    const response = await directusJson<StoryMediaResponse>(
      `/items/stories?${params.toString()}`,
      { authenticated: true }
    );
    return response.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPanelStoryMedia(legacySlug: string): Promise<StoryMedia | null> {
  const fields = "image,audio_file,audio_title";

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
