import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Hub",
  robots: { index: false, follow: false, noarchive: true },
};

export default function ContentHubLayout({ children }: LayoutProps<"/content-hub">) {
  return children;
}
