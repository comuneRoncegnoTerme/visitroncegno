import type { Metadata } from "next";
import EditorialIndex from "@/components/EditorialIndex";
import { getEditorialList } from "@/lib/editorial";
export const metadata: Metadata = { title: "Luoghi da scoprire", description: "Centro storico, terme, musei, natura e punti di interesse: scopri i luoghi di Roncegno Terme.", alternates: { canonical: "/luoghi" } };
export default async function PlacesPage() { return <EditorialIndex eyebrow="Esplora Roncegno" title="Luoghi da conoscere." introduction="Dal centro storico ai masi, dalle acque termali ai boschi del Lagorai: una guida per leggere il territorio attraverso i suoi luoghi." items={await getEditorialList("places")} basePath="/luoghi" emptyMessage="I luoghi saranno pubblicati a breve dal content hub." />; }
