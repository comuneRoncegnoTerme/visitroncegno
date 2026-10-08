import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Dichiarazione di accessibilità",
  description: "Dichiarazione di accessibilità del portale Visit Roncegno.",
  alternates: { canonical: "/accessibilita" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <LegalPage slug="accessibilita" />;
}
