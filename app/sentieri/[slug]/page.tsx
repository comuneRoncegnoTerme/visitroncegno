import { redirect } from "next/navigation";
type Props = { params: Promise<{ slug: string }> };
export default async function LegacyTrailPage({ params }: Props) { redirect(`/percorsi/${(await params).slug}`); }
