import type { Metadata } from "next";
import KioskRuntime from "./KioskRuntime";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KioskLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <KioskRuntime />
      {children}
    </>
  );
}
