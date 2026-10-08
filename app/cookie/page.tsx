import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie",
  description: "Informazioni sui cookie utilizzati dal portale Visit Roncegno.",
  alternates: { canonical: "/cookie" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <LegalPage slug="cookie" />;
}
