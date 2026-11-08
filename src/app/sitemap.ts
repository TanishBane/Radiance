import type { MetadataRoute } from "next";

/**
 * Dynamic XML Sitemap Generator for Search Engines.
 * Strictly exposes public, indexable entry points while excluding internal APIs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://radiance.ai";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
