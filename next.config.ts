import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.ascii-magic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://image.pollinations.ai",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.groq.com https://generativelanguage.googleapis.com https://openrouter.ai https://image.pollinations.ai https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.ascii-magic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
