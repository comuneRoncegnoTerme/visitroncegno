import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.visitroncegno.it"),
  title: {
    default: "Roncegno Terme: cosa vedere e cosa fare | Visit Roncegno",
    template: "%s | Visit Roncegno",
  },
  description: "Scopri Roncegno Terme in Valsugana: natura, percorsi, eventi, musei, memoria, ristoranti e ospitalità.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  applicationName: "Visit Roncegno",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Visit Roncegno",
    title: "Visit Roncegno Terme",
    description: "Natura, percorsi, eventi, musei, memoria e informazioni utili per vivere Roncegno Terme.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit Roncegno Terme",
    description: "Scopri Roncegno Terme e organizza la tua visita in Valsugana.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#contenuto">Salta al contenuto</a>
        {children}
      </body>
    </html>
  );
}
