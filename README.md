# Visit Roncegno

Sito turistico di Roncegno Terme, basato su Next.js e Directus.

## Content Hub

L'area redazione è disponibile su `/content-hub` ed è protetta da login Directus.

Funzioni attive:
- modifica reale della homepage;
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

`DIRECTUS_TOKEN` rimane solo lato server e viene usato dalle API interne del Content Hub per leggere anche bozze e scrivere su Directus.

## Sviluppo

```bash
npm ci
npm run dev
```

Il sito di sviluppo viene esposto normalmente su `http://localhost:3000`.
