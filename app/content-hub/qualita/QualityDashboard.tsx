"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Item = Record<string, unknown> & {
  id: number;
  title?: string;
  slug?: string;
  status?: string;
};

type Data = { events: Item[]; places: Item[]; routes: Item[] };
type Problem = {
  key: string;
  group: string;
  title: string;
  detail: string;
  href: string;
};

type Props = {
  referenceTime: number;
};

async function fetchCollection(collection: keyof Data, signal: AbortSignal) {
  const response = await fetch(`/api/content-hub/items/${collection}`, {
    cache: "no-store",
    signal,
  });
  const json = await response.json().catch(() => null);
  if (response.status === 401) return { unauthorized: true as const, collection, data: [] };
  if (!response.ok) throw new Error(json?.error ?? `Errore ${collection}`);
  return { unauthorized: false as const, collection, data: json?.data ?? [] };
}

export default function QualityDashboard({ referenceTime }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Data>({ events: [], places: [], routes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const collections = ["events", "places", "routes"] as const;

    void Promise.all(
      collections.map((collection) => fetchCollection(collection, controller.signal))
    )
      .then((results) => {
        if (results.some((result) => result.unauthorized)) {
          router.replace("/content-hub/login");
          return;
        }
        setData(
          Object.fromEntries(
            results.map((result) => [result.collection, result.data])
          ) as Data
        );
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(
          reason instanceof Error ? reason.message : "Impossibile caricare i contenuti"
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  const problems = useMemo(() => {
    const list: Problem[] = [];

    const add = (
      item: Item,
      group: string,
      detail: string,
      href: string,
      code: string
    ) => {
      list.push({
        key: `${group}-${item.id}-${code}`,
        group,
        title: String(item.title ?? item.slug ?? `#${item.id}`),
        detail,
        href,
      });
    };

    for (const place of data.places) {
      if (place.status !== "published") continue;
      if (!place.image) add(place, "Luoghi", "Manca l'immagine principale", "/content-hub/luoghi", "image");
      if (place.show_on_map && (place.latitude == null || place.longitude == null)) {
        add(place, "Luoghi", "Visibile in mappa ma senza coordinate", "/content-hub/luoghi", "coordinates");
      }
      if (!place.summary) add(place, "Luoghi", "Manca la descrizione breve", "/content-hub/luoghi", "summary");
    }

    for (const route of data.routes) {
      if (route.status !== "published") continue;
      if (!route.image) add(route, "Percorsi", "Manca l'immagine principale", "/content-hub/percorsi", "image");
      if (!route.gpx_file) add(route, "Percorsi", "Manca il file GPX", "/content-hub/percorsi", "gpx");
      if (route.start_latitude == null || route.start_longitude == null) {
        add(route, "Percorsi", "Manca il punto di partenza", "/content-hub/percorsi", "start");
      }
      if (!route.summary) add(route, "Percorsi", "Manca la descrizione breve", "/content-hub/percorsi", "summary");
    }

    for (const event of data.events) {
      if (event.status !== "published") continue;
      if (!event.image) add(event, "Eventi", "Manca l'immagine", "/content-hub/eventi", "image");
      if (!event.location_name) add(event, "Eventi", "Manca il luogo", "/content-hub/eventi", "location");
      if (
        event.end_date &&
        new Date(String(event.end_date)).getTime() < referenceTime
      ) {
        add(event, "Eventi", "Evento terminato ancora pubblicato", "/content-hub/eventi", "expired");
      }
    }

    return list;
  }, [data, referenceTime]);

  const stats = [
    ["Eventi", data.events.length],
    ["Luoghi", data.places.length],
    ["Percorsi", data.routes.length],
    ["Da sistemare", problems.length],
  ] as const;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Content Hub · Controllo editoriale</p>
          <h1>Qualità contenuti</h1>
          <span>
            Segnala automaticamente i contenuti pubblicati che mancano di informazioni
            utili al sito.
          </span>
        </div>
        <Link href="/content-hub">← Dashboard</Link>
      </header>

      <section className={styles.stats}>
        {stats.map(([label, value]) => (
          <article key={label}>
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && problems.length === 0 && (
        <div className={styles.ok}>Nessuna criticità rilevata sui campi controllati.</div>
      )}
      {!loading && !error && problems.length > 0 && (
        <section className={styles.list}>
          {problems.map((problem) => (
            <Link href={problem.href} key={problem.key}>
              <span>{problem.group}</span>
              <div>
                <strong>{problem.title}</strong>
                <small>{problem.detail}</small>
              </div>
              <b>Correggi →</b>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
