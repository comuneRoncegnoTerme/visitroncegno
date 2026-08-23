import { permanentRedirect } from "next/navigation";
type Props = { params: Promise<{ slug: string }> };
export default async function LegacyTrailPage({ params }: Props) { permanentRedirect(`/percorsi/${(await params).slug}`); }
