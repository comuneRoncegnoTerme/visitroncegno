import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorialDetail from "@/components/EditorialDetail";
import { getEditorialItem } from "@/lib/editorial";
import { descriptionFrom, pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const item = await getEditorialItem("events", (await params).slug); if (!item) return { title: "Evento non trovato", robots: { index: false, follow: false } }; return pageMetadata({ title: item.title, description: descriptionFrom(item.summary ?? item.description, `Informazioni e programma di ${item.title} a Roncegno Terme.`), path: `/eventi/${item.slug}` }); }
export default async function EventPage({ params }: Props) { const item = await getEditorialItem("events", (await params).slug); if (!item) notFound(); return <EditorialDetail item={item} type="event" />; }
