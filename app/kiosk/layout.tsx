import type { Metadata } from "next";
import KioskPersistentQr from "./KioskPersistentQr";
import KioskRuntime from "./KioskRuntime";
import styles from "./KioskShell.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KioskLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell}>
      <KioskRuntime />
      {children}
      <KioskPersistentQr />
    </div>
  );
}
