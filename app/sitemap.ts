import type { MetadataRoute } from "next";
import { getEditorialList } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import { SITE_URL } from "@/lib/seo";
import { getLegacyStoryPath, getStories } from "@/lib/stories";
import { trailPanels } from "@/lib/trail-panels";

export const revalidate = 3600;

const STATIC_PATHS = [
  "/",
  "/luoghi",
  "/percorsi",
  "/eventi",
  "/musei",
  "/musei/mulino-angeli",
  "/musei/museo-della-musica",
  "/memoria",
  "/festa-della-castagna",
  "/organizza-la-visita",
  "/cartina",
];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: path === "/eventi" || path.startsWith("/eventi/") ? "weekly" : "monthly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, routes, events, stories] = await Promise.all([
    getEditorialList("places"),
    getEditorialList("routes"),
    getEditorialList("events"),
    getStories(),
  ]);

  const canonicalPaths = new Set(STATIC_PATHS);

  for (const place of places) {
    const href = placeHref(place);
    if (href.startsWith("/")) canonicalPaths.add(href);
  }
  for (const route of routes) canonicalPaths.add(`/percorsi/${route.slug}`);
  for (const event of events) canonicalPaths.add(`/eventi/${event.slug}`);
  for (const story of stories) canonicalPaths.add(getLegacyStoryPath(story) ?? `/storie/${story.slug}`);
  for (const panel of trailPanels) canonicalPaths.add(`/it/sentieri/${panel.slug}`);

  return Array.from(canonicalPaths, (path) => entry(path, path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6));
}
