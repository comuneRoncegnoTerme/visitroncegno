import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Visit Roncegno Terme",
  description: "Scopri Roncegno Terme in Valsugana: natura, percorsi, eventi, musei, memoria, ristoranti e ospitalità.",
  applicationName: "Visit Roncegno",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Visit Roncegno",
    title: "Visit Roncegno Terme",
    description: "Natura, percorsi, eventi, musei, memoria e informazioni utili per vivere Roncegno Terme.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit Roncegno Terme",
    description: "Scopri Roncegno Terme e organizza la tua visita in Valsugana.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
