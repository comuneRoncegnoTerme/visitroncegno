import type { MetadataRoute } from "next";

const BASE_URL = "https://www.visitroncegno.it";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/luoghi",
    "/percorsi",
    "/eventi",
    "/musei",
    "/musei/mulino-angeli",
    "/musei/museo-della-musica",
    "/festa-della-castagna",
    "/memoria",
    "/organizza-la-visita",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: route === "" || route === "/eventi" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/organizza-la-visita" ? 0.9 : 0.8,
  }));
}
