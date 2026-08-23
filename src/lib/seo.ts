import type { Metadata } from "next";

export const SITE_URL = "https://www.visitroncegno.it";
export const SITE_NAME = "Visit Roncegno";

export function descriptionFrom(
  value: string | null | undefined,
  fallback: string
) {
  const normalized = value
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return fallback;
  return normalized.length > 160
    ? `${normalized.slice(0, 157).trimEnd()}…`
    : normalized;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
