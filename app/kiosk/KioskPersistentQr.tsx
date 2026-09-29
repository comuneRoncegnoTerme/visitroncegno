"use client";

import { usePathname } from "next/navigation";
import KioskQr from "./KioskQr";
import styles from "./KioskPersistentQr.module.css";

export default function KioskPersistentQr() {
  const pathname = usePathname();

  return (
    <div className={styles.wrap}>
      <KioskQr pathname={pathname} label="Continua sul tuo telefono" />
    </div>
  );
}
