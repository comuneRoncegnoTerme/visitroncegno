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
      { source: "/natura-e-montagna", destination: "/temi/natura-e-montagna", permanent: true },
      { source: "/terme-e-benessere", destination: "/temi/terme-e-benessere", permanent: true },
      { source: "/cultura-e-memoria", destination: "/temi/cultura-e-memoria", permanent: true },
      { source: "/sport-e-movimento", destination: "/temi/sport-e-movimento", permanent: true },
    ];
  },
};

export default nextConfig;
