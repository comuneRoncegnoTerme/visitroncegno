// Converte l'esportazione KML della My Maps della Festa della Castagna nel file dati della mappa del sito.
// Uso: node scripts/import-festa-kml.mjs data/festa-castagna/mymaps-2026.kml
// In My Maps: ⋮ → Esporta in KML/KMZ → togliere "Mantieni i dati aggiornati" → "Esporta come KML".
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Indica il file KML da importare.");
  process.exit(1);
}
const output = path.join("src", "data", "festa-mappa.json");
const kml = fs.readFileSync(input, "utf8");

const decode = (value) =>
  value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
const tag = (xml, name) => {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : "";
};

// Nomi scritti in maiuscolo nella My Maps: forma corretta per il sito.
const NAMES = {
  "PARCHEGGIO MARTER": "Parcheggio Marter",
  "PARCHEGGIO RONCEGNO - ORATORIO": "Parcheggio dell’oratorio",
  "PARCHEGGIO LOC. FERME": "Parcheggio località Ferme",
  "PARCHEGGIO CAMPER - GOLF CLUB": "Parcheggio camper · Golf Club",
  "FERMATA BUS NAVETTA": "Fermata della navetta",
  "PARCHEGGIO DISABILI": "Parcheggio per persone con disabilità",
  "PRAGA 6": "Praga 6",
  "CASTANICOLTORI": "Castanicoltori di Roncegno",
  "R.O.C.": "R.O.C. · Roncegno Oltre i Confini",
  "VILLA ROSA": "Ristorante Villa Rosa",
  "COMITATO TRADIZIONI LOCALI": "Comitato Tradizioni Locali",
  "SCI CLUB FRAVORT": "Sci Club Fravort",
  "STIVOR ETS": "Stivor ETS",
  "VIGILI DEL FUOCO DI RONCEGNO": "Vigili del Fuoco di Roncegno",
  "GSD RONCEGNO CALCIO": "GSD Roncegno Calcio",
  "DOLCI FESTA DELLA CASTAGNA": "Dolci della Festa",
  "CORO SANT'OSVALDO": "Coro Sant’Osvaldo",
  "BAR TRE VENEZIE": "Bar Tre Venezie",
  "BOCCIOFILA TOR TONDA": "Bocciofila Tor Tonda",
  "GONFIABILI": "Gonfiabili",
  "FATTORIA DEGLI ANIMALI": "Fattoria degli animali",
  "MULINO LENZI": "Laboratorio del Mulino Lenzi",
  "CANTÓN DEI SELFIE": "Cantón dei selfie",
  "RONZEGNO DE NA VOLTA": "Ronzégno de na volta",
  "MUSICA CON I TRIFISA": "Musica con i Trifisa",
  "GSD CALCIO: PRESENTAZIONE SQUADRE": "Presentazione delle squadre del GSD Calcio",
  "PIAZZETTA DEL CORO": "Piazzetta del Coro",
  "PRESENTAZIONE LIBRO": "Presentazione del libro",
  "PARTENZA PASSEGGIATA": "Partenza della passeggiata",
  "GLI ALBERI DEL PARCO, FACCIAMO L'ERBARIO": "Gli alberi del parco: facciamo l’erbario",
  "INAUGURAZIONE DEL FORNO DI COMUNITA'": "Inaugurazione del forno di comunità",
  "THE CAPSTON ROCK ANNI '70 E '80": "The Capston · rock anni ’70 e ’80",
  "DJ SET STEFANO CENCI": "DJ set Stefano Cenci",
  "PENTOLINA, PENTOLETTA, PENTOLACCIA": "Pentolina, pentoletta, pentolaccia",
  "PREMIAZIONE DISEGNI BAMBINI": "Premiazione dei disegni dei bambini",
  "WC": "Servizi igienici",
};

function cleanName(raw) {
  const key = raw.replace(/\s+/g, " ").trim().toUpperCase();
  if (NAMES[key]) return NAMES[key];
  // Nomi nuovi: maiuscola solo all'inizio, da rivedere nel file generato.
  const lower = raw.replace(/\s+/g, " ").trim().toLocaleLowerCase("it-IT");
  return lower.charAt(0).toLocaleUpperCase("it-IT") + lower.slice(1);
}

function category(folder, name) {
  const f = folder.toUpperCase();
  const n = name.toUpperCase();
  if (f.includes("PARCHEGG")) {
    if (n.includes("NAVETTA")) return "shuttle";
    if (n.includes("DISABIL")) return "services";
    return "parking";
  }
  if (f.includes("STAND") || f.includes("GASTRONOM")) return "food";
  if (f.includes("BAMBINI")) return /SELFIE|NA VOLTA/.test(n) ? "see" : "kids";
  if (f.includes("EVENTI")) return "events";
  if (f.includes("BAGNI")) return "services";
  return "events";
}

// Nomi propri che nei menù in maiuscolo perderebbero le iniziali.
const PROPER = [
  ["montibeller leopolda", "Montibeller Leopolda"], ["coca cola", "Coca-Cola"], ["nutella", "Nutella"],
  ["lemon soda", "Lemon Soda"], ["crèpes", "crêpes"], ["boema", "boema"], ["ajvar", "ajvar"],
];
const WEEKDAYS = /(?<![\p{L}])(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?![\p{L}])/giu;

// Testi tutti in maiuscolo → frase normale. Le date dell'edizione passata (es. "venerdì 24") perdono il numero.
function sentence(value) {
  let text = value.replace(/\s+/g, " ").trim();
  const letters = text.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "").length;
  if (letters.length && upper / letters.length > 0.7) {
    text = text.toLocaleLowerCase("it-IT").replace(/(^|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toLocaleUpperCase("it-IT"));
    for (const [from, to] of PROPER) text = text.replace(new RegExp(from, "gi"), to);
  }
  // Frasi intere in maiuscolo dentro un testo normale ("IN CASO DI MALTEMPO IN TEATRO").
  text = text.replace(/(?<![\p{L}])\p{Lu}{2,}(?:\s+\p{Lu}{2,}){2,}(?![\p{L}])/gu, (run) => run.toLocaleLowerCase("it-IT"));
  return text
    .replace(/(?<![\p{L}])(venerdì|sabato|domenica)\s+\d{1,2}(?!\d)/giu, "$1")
    .replace(WEEKDAYS, (d) => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
    .replace(/(^|[.!?]\s+)(\p{Ll})/gu, (m, p, c) => p + c.toLocaleUpperCase("it-IT"))
    .replace(/\s+([.!?,;:])/g, "$1")
    .replace(/\.\.$/, ".")
    .trim();
}

// Refusi della My Maps 2025.
const FIXES = [["Sci Club Fravor.", "Sci Club Fravort."], ["Crèpes", "crêpes"], ["crepes", "crêpes"]];
const fix = (text) => FIXES.reduce((acc, [from, to]) => acc.split(from).join(to), text);

function parseDescription(raw) {
  if (!raw) return { text: null, menu: [] };
  const lines = raw.split(/<br\s*\/?>/i).map((line) => line.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const menu = [];
  const text = [];
  let inMenu = false;
  for (const line of lines) {
    if (/^proposte gastronomiche/i.test(line)) { inMenu = true; continue; }
    if (inMenu && /^[•\-–]/.test(line)) {
      menu.push(sentence(line.replace(/^[•\-–]\s*/, "")));
      continue;
    }
    text.push(line);
  }
  return { text: text.length ? fix(sentence(text.join(" "))) : null, menu: menu.map(fix) };
}

const documentName = tag(kml, "name");
const edition = Number(documentName.match(/20\d\d/)?.[0] ?? new Date().getFullYear());
const points = [];
for (const folder of kml.matchAll(/<Folder>([\s\S]*?)<\/Folder>/g)) {
  const folderName = tag(folder[1], "name");
  for (const placemark of folder[1].matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)) {
    const xml = placemark[1];
    const rawName = tag(xml, "name");
    const coords = xml.match(/<coordinates>\s*([-\d.]+),([-\d.]+)/);
    if (!coords) continue;
    const { text, menu } = parseDescription(tag(xml, "description"));
    const cat = category(folderName, rawName);
    points.push({
      id: `${cat}-${points.length + 1}`,
      category: cat,
      name: cleanName(rawName),
      text,
      menu,
      lng: Number(Number(coords[1]).toFixed(6)),
      lat: Number(Number(coords[2]).toFixed(6)),
    });
  }
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ edition, source: path.basename(input), points }, null, 2)}\n`);
const counts = points.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }), {});
console.log(`Edizione ${edition}: ${points.length} punti →`, counts, `→ ${output}`);
