import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import EditorialDetail from "@/components/EditorialDetail";
import { getEditorialItem } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import { descriptionFrom, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getEditorialItem("places", (await params).slug);
  if (!item) return { title: "Luogo non trovato", robots: { index: false, follow: false } };

  const canonical = placeHref(item);
  return pageMetadata({
    title: item.title,
    description: descriptionFrom(item.summary ?? item.description, `Scopri ${item.title}, luogo di interesse a Roncegno Terme.`),
    path: canonical.startsWith("/") ? canonical : `/luoghi/${item.slug}`,
  });
}

export default async function PlacePage({ params }: Props) {
  const item = await getEditorialItem("places", (await params).slug);
  if (!item) notFound();

  const destination = placeHref(item);
  const ownPath = `/luoghi/${item.slug}`;
  if (destination !== ownPath) permanentRedirect(destination);

  return <EditorialDetail item={item} type="place" />;
}
