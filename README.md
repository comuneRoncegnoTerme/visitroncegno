# Visit Roncegno

Portale turistico di **Roncegno Terme**, sviluppato con Next.js e alimentato da Directus.

Il progetto comprende il sito pubblico, una mappa interattiva del territorio e un Content Hub redazionale per gestire i contenuti senza intervenire sul codice.

## Stack

- Next.js 16 / App Router
- React 19
- TypeScript
- Directus come CMS e fonte dati
- MapLibre GL per le mappe interattive
- Docker per l'esecuzione in produzione
- GitHub Actions per CI e deploy

## Struttura del progetto

```text
app/                     pagine e route Next.js
src/components/          componenti condivisi del sito
src/lib/                 accesso Directus e logica applicativa
public/images/           immagini statiche e loghi
.github/workflows/       CI e deploy
```

La grafica, il responsive e le interazioni restano nel codice. Testi, immagini, ordinamento, coordinate, dati editoriali e impostazioni generali sono gestiti principalmente tramite Directus.

## Pagine principali

- `/` — homepage
- `/luoghi` — luoghi e punti di interesse
- `/percorsi` — percorsi e itinerari
- `/eventi` — eventi
- `/musei` — polo museale e pagine dei musei
- `/festa-della-castagna` — landing dedicata alla Festa della Castagna
- `/organizza-la-visita` — ospitalità, ristorazione, mobilità, servizi e mappa
- `/content-hub` — area redazionale

Sono inoltre mantenuti gli URL storici utilizzati dai QR fisici già presenti sul territorio. Questi percorsi non devono essere modificati senza verificare prima la compatibilità con la segnaletica esistente.

## Mappa

La mappa pubblica utilizza MapLibre GL e i luoghi pubblicati in Directus.

Funzioni principali:

- marker generati dalle coordinate dei luoghi;
- inquadratura automatica tramite `fitBounds` in base alla distribuzione geografica dei punti;
- popup con contenuto e collegamento alla relativa pagina;
- target touch più ampi per l'uso su smartphone;
- comportamento responsive e controlli ottimizzati per mobile;
- supporto alla futura presenza di strutture ricettive, ristoranti e altri servizi territoriali.

I luoghi compaiono in mappa quando sono pubblicati e configurati con `show_on_map` e coordinate valide.

## Organizza la visita

La landing `/organizza-la-visita` raccoglie in un unico punto le informazioni utili alla visita e sostituisce i precedenti collegamenti a sezioni isolate della homepage.

La pagina è predisposta per gestire:

- hotel, B&B, agriturismi e altre strutture ricettive;
- ristoranti e attività di ristorazione;
- servizi utili;
- indicazioni su come arrivare e muoversi;
- mappa territoriale alimentata da Directus.

Le strutture vengono lette dalla collection `places`; la classificazione editoriale può essere utilizzata per distinguere ospitalità, ristorazione e altri servizi senza duplicare i dati.

## Directus

Le principali collection utilizzate dal sito sono:

- `homepage`
- `experiences`
- `events`
- `event_categories`
- `places`
- `place_categories`
- `routes`
- `route_categories`
- `route_points`
- `stories`
- `story_categories`
- `pages`
- `site_settings`
- `tags`

Il frontend legge solo contenuti pubblicati. Il Content Hub utilizza API server-side autenticate per leggere anche bozze e salvare modifiche.

## Content Hub

L'area redazionale è disponibile su `/content-hub` ed è protetta da login Directus.

Funzioni attive:

- modifica della homepage;
- CRUD Eventi;
- CRUD Luoghi con coordinate e presenza in mappa;
- CRUD Percorsi con dati tecnici e GPX;
- libreria Media con upload immagini, audio e file GPX;
- dashboard Qualità contenuti;
- modifica delle impostazioni generali del sito da `site_settings`;
- anteprima del sito e logout.

### Variabili server richieste

```bash
DIRECTUS_URL=http://127.0.0.1:8055
DIRECTUS_TOKEN=...
CONTENT_HUB_SESSION_SECRET=...
CONTENT_HUB_ALLOWED_ROLES=Redazione Turismo
CONTENT_HUB_COOKIE_SECURE=false
```

`CONTENT_HUB_SESSION_SECRET` deve contenere almeno 32 caratteri casuali. Con HTTPS, impostare `CONTENT_HUB_COOKIE_SECURE=true`.

`DIRECTUS_TOKEN` rimane esclusivamente lato server e viene utilizzato dalle API interne del Content Hub. Non deve essere esposto al browser o inserito nel repository.

L'accesso all'Hub resta limitato agli amministratori Directus e agli eventuali ruoli esplicitamente indicati in `CONTENT_HUB_ALLOWED_ROLES`.

## Sviluppo locale

Prerequisiti consigliati:

- Node.js compatibile con Next.js 16
- npm
- un'istanza Directus raggiungibile

Installazione e avvio:

```bash
npm ci
npm run dev
```

Il sito viene esposto normalmente su:

```text
http://localhost:3000
```

Controlli disponibili:

```bash
npm run lint
npm run build
```

## Deploy

Il deploy di produzione è automatizzato con GitHub Actions su push verso `main`.

Il workflow:

1. si collega al VPS tramite SSH;
2. aggiorna il checkout a `origin/main`;
3. ricostruisce i container con Docker Compose;
4. riavvia i servizi;
5. verifica lo stato dei container.

Secret GitHub richiesti dal workflow:

```text
VPS_HOST
VPS_USER
VPS_SSH_KEY_B64
```

Le variabili applicative e i token non devono essere salvati nel repository; restano configurati nell'ambiente del server.

## Convenzioni operative

- `main` rappresenta la versione destinata al deploy.
- Le modifiche significative vengono sviluppate su branch dedicate e integrate tramite Pull Request.
- Non rigenerare o cambiare gli URL dei QR storici già stampati sul territorio.
- Evitare contenuti duplicati tra sito e CMS: Directus deve restare la fonte editoriale principale.
- Per immagini, audio e GPX utilizzare la libreria media del Content Hub quando il contenuto deve essere gestibile dalla redazione.

## Stato attuale

Il progetto include già:

- homepage editoriale responsive;
- Festa della Castagna con landing dedicata;
- pagine museali;
- luoghi, eventi e percorsi alimentati da Directus;
- mappe interattive;
- supporto GPX per i percorsi;
- Content Hub redazionale;
- landing `Organizza la visita`;
- navigazione mobile dedicata.

Ulteriori contenuti territoriali, ristoranti, hotel/B&B e loghi istituzionali possono essere aggiunti progressivamente tramite Directus e gli asset del progetto.
