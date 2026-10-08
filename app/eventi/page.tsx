import type { Metadata } from "next";
import { connection } from "next/server";
import EventsIndex from "@/components/EventsIndex";
import { getEditorialList } from "@/lib/editorial";

export const metadata: Metadata = {
  title: "Eventi e appuntamenti",
  description: "Feste, cultura, sport e iniziative in programma a Roncegno Terme: scopri gli eventi e organizza la visita.",
  alternates: { canonical: "/eventi" },
};

export default async function EventsPage() {
  await connection();
  return <EventsIndex items={await getEditorialList("events")} />;
}
