import type { ReactNode } from "react";
import { connection } from "next/server";

// Pagina generata a ogni richiesta; i dati Directus arrivano dalla cache (src/lib/directus-cache.ts).
export default async function PlaceDetailLayout({ children }: { children: ReactNode }) {
  await connection();
  return children;
}
