import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/blog"],
        disallow: [
          "/app",
          "/api/",
        ],
      },
    ],
    sitemap: "https://forms.stayclever.in/sitemap.xml",
  };
}
