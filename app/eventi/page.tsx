import type { Metadata } from "next";
import EditorialIndex from "@/components/EditorialIndex";
import { getEditorialList } from "@/lib/editorial";
export const metadata: Metadata = { title: "Eventi e appuntamenti", description: "Feste, cultura, sport e iniziative in programma a Roncegno Terme: scopri gli eventi e organizza la visita.", alternates: { canonical: "/eventi" } };
export default async function EventsPage() { return <EditorialIndex eyebrow="Agenda" title="Vivi Roncegno, insieme." introduction="Feste di paese, cultura, sport e sapori: gli appuntamenti per incontrare la comunità e vivere il territorio nel momento giusto." items={await getEditorialList("events")} basePath="/eventi" emptyMessage="Non ci sono eventi pubblicati in questo momento. Torna presto per i prossimi appuntamenti." />; }
