"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./KioskQr.module.css";

function publicPath(pathname: string) {
  if (pathname === "/kiosk") return "/";
  if (pathname === "/kiosk/organizza") return "/organizza-la-visita";
  if (pathname.startsWith("/kiosk/eventi")) return pathname.replace("/kiosk", "");
  if (pathname.startsWith("/kiosk/percorsi")) return pathname.replace("/kiosk", "");
  if (pathname.startsWith("/kiosk/luoghi")) return pathname.replace("/kiosk", "");
  return "/";
}

export default function KioskQr({ pathname, label = "Continua sul tuo telefono" }: { pathname: string; label?: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`https://www.visitroncegno.it${publicPath(pathname)}`);
  }, [pathname]);

  const qrUrl = useMemo(() => {
    if (!url) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(url)}`;
  }, [url]);

  if (!qrUrl) return null;

  return (
    <aside className={styles.qr}>
      <img src={qrUrl} alt="" aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <span>Inquadra il QR e porta con te questa pagina.</span>
      </div>
    </aside>
  );
}
