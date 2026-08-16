import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/content-hub", "/api/content-hub"],
    },
    sitemap: "https://www.visitroncegno.it/sitemap.xml",
  };
}
