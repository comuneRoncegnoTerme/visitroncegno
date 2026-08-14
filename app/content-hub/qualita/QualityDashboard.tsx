"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Item = Record<string, unknown> & { id: number; title?: string; slug?: string; status?: string };
type Data = { events: Item[]; places: Item[]; routes: Item[] };

type Problem = { group: string; title: string; detail: string; href: string };

export default function QualityDashboard() {
  const [data, setData] = useState<Data>({ events: [], places: [], routes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const collections = ["events", "places", "routes"] as const;
      const results = await Promise.all(collections.map(async (collection) => {
        const response = await fetch(`/api/content-hub/items/${collection}`, { cache: "no-store" });
        const json = await response.json().catch(() => null);
        if (!response.ok) throw new Error(json?.error ?? `Errore ${collection}`);
        return [collection, json?.data ?? []] as const;
      })).catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Impossibile caricare i contenuti");
        return null;
      });
      if (results) setData(Object.fromEntries(results) as Data);
      setLoading(false);
    })();
  }, []);

  const problems = useMemo(() => {
    const list: Problem[] = [];
    const now = Date.now();

    for (const place of data.places) {
      if (place.status !== "published") continue;
      if (!place.image) list.push({ group: "Luoghi", title: String(place.title ?? place.slug), detail: "Manca l'immagine principale", href: "/content-hub/luoghi" });
      if (place.show_on_map && (place.latitude == null || place.longitude == null)) list.push({ group: "Luoghi", title: String(place.title ?? place.slug), detail: "Visibile in mappa ma senza coordinate", href: "/content-hub/luoghi" });
      if (!place.summary) list.push({ group: "Luoghi", title: String(place.title ?? place.slug), detail: "Manca la descrizione breve", href: "/content-hub/luoghi" });
    }

    for (const route of data.routes) {
      if (route.status !== "published") continue;
      if (!route.image) list.push({ group: "Percorsi", title: String(route.title ?? route.slug), detail: "Manca l'immagine principale", href: "/content-hub/percorsi" });
      if (!route.gpx_file) list.push({ group: "Percorsi", title: String(route.title ?? route.slug), detail: "Manca il file GPX", href: "/content-hub/percorsi" });
      if (route.start_latitude == null || route.start_longitude == null) list.push({ group: "Percorsi", title: String(route.title ?? route.slug), detail: "Manca il punto di partenza", href: "/content-hub/percorsi" });
      if (!route.summary) list.push({ group: "Percorsi", title: String(route.title ?? route.slug), detail: "Manca la descrizione breve", href: "/content-hub/percorsi" });
    }

    for (const event of data.events) {
      if (event.status !== "published") continue;
      if (!event.image) list.push({ group: "Eventi", title: String(event.title ?? event.slug), detail: "Manca l'immagine", href: "/content-hub/eventi" });
      if (!event.location_name) list.push({ group: "Eventi", title: String(event.title ?? event.slug), detail: "Manca il luogo", href: "/content-hub/eventi" });
      if (event.end_date && new Date(String(event.end_date)).getTime() < now) list.push({ group: "Eventi", title: String(event.title ?? event.slug), detail: "Evento terminato ancora pubblicato", href: "/content-hub/eventi" });
    }

    return list;
  }, [data]);

  const stats = [
    ["Eventi", data.events.length],
    ["Luoghi", data.places.length],
    ["Percorsi", data.routes.length],
    ["Da sistemare", problems.length],
  ] as const;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><p>Content Hub · Controllo editoriale</p><h1>Qualità contenuti</h1><span>Segnala automaticamente i contenuti pubblicati che mancano di informazioni utili al sito.</span></div>
        <a href="/content-hub">← Dashboard</a>
      </header>

      <section className={styles.stats}>
        {stats.map(([label, value]) => <article key={label}><strong>{loading ? "—" : value}</strong><span>{label}</span></article>)}
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && problems.length === 0 && <div className={styles.ok}>Nessuna criticità rilevata sui campi controllati.</div>}
      {!loading && !error && problems.length > 0 && (
        <section className={styles.list}>
          {problems.map((problem, index) => (
            <a href={problem.href} key={`${problem.group}-${problem.title}-${index}`}>
              <span>{problem.group}</span>
              <div><strong>{problem.title}</strong><small>{problem.detail}</small></div>
              <b>Correggi →</b>
            </a>
          ))}
        </section>
      )}
    </main>
  );
}
