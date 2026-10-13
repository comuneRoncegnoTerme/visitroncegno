// Previsioni per i giorni della Festa della Castagna, per la scheda meteo della pagina.
// Come /api/meteo: passa dal sito e Open-Meteo viene interrogato al massimo una volta ogni ora.
// Open-Meteo prevede fino a 16 giorni: prima di allora (e dopo la Festa) la risposta è vuota.
export const revalidate = 3600;

const FESTA_START = "2026-10-23";
const FESTA_END = "2026-10-25";

const SOURCE =
  "https://api.open-meteo.com/v1/forecast?latitude=46.05&longitude=11.41" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
  `&timezone=Europe%2FRome&start_date=${FESTA_START}&end_date=${FESTA_END}`;

type Daily = {
  time?: string[];
  weather_code?: (number | null)[];
  temperature_2m_max?: (number | null)[];
  temperature_2m_min?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
};

export async function GET() {
  try {
    const response = await fetch(SOURCE, { next: { revalidate: 3600 } });
    if (!response.ok) return Response.json({ days: [] });
    const { daily } = (await response.json()) as { daily?: Daily };
    const days = (daily?.time ?? [])
      .map((date, index) => ({
        date,
        code: daily?.weather_code?.[index] ?? null,
        max: daily?.temperature_2m_max?.[index] ?? null,
        min: daily?.temperature_2m_min?.[index] ?? null,
        rain: daily?.precipitation_probability_max?.[index] ?? null,
      }))
      .filter((day) => typeof day.code === "number" && typeof day.max === "number" && typeof day.min === "number");
    return Response.json(
      { days },
      { headers: { "Cache-Control": "public, max-age=1800, s-maxage=3600" } }
    );
  } catch {
    return Response.json({ days: [] });
  }
}
