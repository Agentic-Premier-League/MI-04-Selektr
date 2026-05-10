import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const config: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default config;
