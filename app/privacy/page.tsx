import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa sul trattamento dei dati personali del portale Visit Roncegno.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <LegalPage slug="privacy" />;
}
