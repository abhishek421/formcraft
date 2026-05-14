import type { NextConfig } from "next";

const RENDERER_ORIGIN = process.env.NEXT_PUBLIC_RENDERER_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: RENDERER_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
