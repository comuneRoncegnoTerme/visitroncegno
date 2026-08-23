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
    ];
  },
};

export default nextConfig;
