import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorialDetail from "@/components/EditorialDetail";
import { getEditorialItem } from "@/lib/editorial";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const item = await getEditorialItem("places", (await params).slug); return { title: item ? `${item.title} | Visit Roncegno` : "Luogo | Visit Roncegno", description: item?.summary ?? undefined }; }
export default async function PlacePage({ params }: Props) { const item = await getEditorialItem("places", (await params).slug); if (!item) notFound(); return <EditorialDetail item={item} type="place" />; }
