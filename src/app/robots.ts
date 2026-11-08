import type { MetadataRoute } from "next";

/**
 * Dynamic Robots Rules Generator.
 * Disallows search engine crawlers from scraping internal APIs and telemetry tunnels.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://radiance.ai";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/monitoring/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
