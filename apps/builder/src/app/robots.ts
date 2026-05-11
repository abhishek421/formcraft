import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/blog"],
        disallow: [
          "/forms",
          "/builder",
          "/integrations",
          "/api-keys",
          "/settings",
          "/f/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://forms.stayclever.in/sitemap.xml",
  };
}
