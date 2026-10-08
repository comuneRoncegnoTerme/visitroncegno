import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/it/memoria/paesaggio", destination: "/memoria", permanent: true },
      { source: "/it/memoria/edifici", destination: "/memoria", permanent: true },
      { source: "/it/memoria/persone", destination: "/memoria", permanent: true },
      { source: "/it/memoria/eventi-e-tradizioni", destination: "/memoria", permanent: true },
      { source: "/it/memoria/tivor", destination: "/memoria", permanent: true },
      { source: "/it/memoria/lettere-e-manoscritti", destination: "/memoria", permanent: true },
      { source: "/it/memoria/storia-per-immagini", destination: "/memoria", permanent: true },
      { source: "/it/memoria/progetto-memoria-na-volt", destination: "/memoria", permanent: true },
      // Pagine del sito precedente indicizzate dai motori di ricerca (verificate l'8/10/2026).
      // Le pagine dei pannelli /it/sentieri/<slug> esistono ancora come route e non vanno reindirizzate.
      { source: "/it", destination: "/", permanent: true },
      { source: "/it/eventi", destination: "/eventi", permanent: true },
      { source: "/it/eventi/:path+", destination: "/eventi", permanent: true },
      { source: "/it/ristoranti", destination: "/organizza-la-visita#mangiare", permanent: true },
      { source: "/it/ristoranti/:path+", destination: "/organizza-la-visita#mangiare", permanent: true },
      { source: "/it/dormire", destination: "/organizza-la-visita#dormire", permanent: true },
      { source: "/it/dormire/:path+", destination: "/organizza-la-visita#dormire", permanent: true },
      { source: "/it/contacts/:path*", destination: "/organizza-la-visita", permanent: true },
      { source: "/it/roncegno-terme/sentieri-e-percorsi-outd", destination: "/percorsi", permanent: true },
      { source: "/it/roncegno-terme", destination: "/luoghi", permanent: true },
      { source: "/it/roncegno-terme/:path+", destination: "/luoghi", permanent: true },
      // Pagine indice dei sentieri del vecchio sito (non sono pannelli): portano all'elenco dei percorsi.
      { source: "/it/sentieri", destination: "/percorsi", permanent: true },
      { source: "/it/sentieri/sentieri-di-roncegno-1", destination: "/percorsi", permanent: true },
      { source: "/it/sentieri/localita-cinque-valli-9", destination: "/percorsi", permanent: true },
      { source: "/it/sentieri/novita-in-arrivo", destination: "/percorsi", permanent: true },
      { source: "/natura-e-montagna", destination: "/temi/natura-e-montagna", permanent: true },
      { source: "/terme-e-benessere", destination: "/temi/terme-e-benessere", permanent: true },
      { source: "/cultura-e-memoria", destination: "/temi/cultura-e-memoria", permanent: true },
      { source: "/sport-e-movimento", destination: "/temi/sport-e-movimento", permanent: true },
    ];
  },
};

export default nextConfig;
