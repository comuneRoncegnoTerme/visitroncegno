import type { Metadata } from "next";
import EditorialIndex from "@/components/EditorialIndex";
import { getEditorialList } from "@/lib/editorial";
export const metadata: Metadata = { title: "Percorsi e sentieri | Visit Roncegno", description: "Cammini, escursioni e itinerari a Roncegno Terme." };
export default async function RoutesPage() { return <EditorialIndex eyebrow="Camminare" title="Percorsi e sentieri." introduction="Itinerari tra castagneti, masi e panorami del Lagorai. Scegli il percorso adatto al tuo tempo, preparati e parti con rispetto per la montagna." items={await getEditorialList("routes")} basePath="/percorsi" emptyMessage="I percorsi saranno pubblicati a breve dal content hub." />; }
