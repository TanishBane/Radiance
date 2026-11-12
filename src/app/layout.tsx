import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin-variable.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "../fonts/jetbrains-mono-latin-variable.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Consolas", "SFMono-Regular", "ui-monospace", "monospace"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://radiance.ai";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "RADIANCE — Intelligent AI Platform",
    template: "%s | RADIANCE",
  },
  description:
    "Bring saved notes and response preferences into a multi-provider AI chat. Browser-local plaintext storage, opt-in sharing, and a model you choose.",
  keywords: [
    "AI",
    "Radiance",
    "Machine Learning",
    "Groq",
    "Gemini",
    "Llama 3.3",
    "OpenRouter",
    "Vercel AI SDK",
    "Next.js AI",
  ],
  authors: [{ name: "RADIANCE Architecture Team", url: "https://github.com/TanishBane/Tanixai" }],
  creator: "TanishBane",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "RADIANCE — Intelligent AI Platform",
    description:
      "Bring saved notes and response preferences into a multi-provider AI chat. Browser-local plaintext storage, opt-in sharing, and a model you choose.",
    url: "/",
    siteName: "RADIANCE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1280,
        height: 640,
        alt: "RADIANCE — Intelligent AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RADIANCE — Intelligent AI Platform",
    description:
      "Bring saved notes and response preferences into a multi-provider AI chat. Browser-local plaintext storage, opt-in sharing, and a model you choose.",
    images: ["/opengraph-image.png"],
    creator: "@radiance_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06060a",
  interactiveWidget: "resizes-content",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      "url": APP_URL,
      "name": "RADIANCE",
      "description": "AI chat workspace with browser-local notes, explicit saves, opt-in context sharing, and multi-provider models.",
      "publisher": {
        "@type": "Organization",
        "name": "RADIANCE Team",
        "url": APP_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${APP_URL}/icon.svg`,
        },
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/#software`,
      "name": "RADIANCE",
      "operatingSystem": "Web",
      "applicationCategory": "ProductivityApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description": "Multi-provider AI chat with browser-local notes, explicit saves, and opt-in context sharing.",
      "softwareVersion": "1.0.0",
      "author": {
        "@type": "Organization",
        "name": "RADIANCE Architecture Team",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${cormorant.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans bg-[#06060a] text-[#f0ede6] min-h-[100dvh] selection:bg-[var(--accent)] selection:text-[var(--void)]">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* ASCII Magic Web Component Loader - Loads once per app on the client */}
        <Script
          type="module"
          src="https://www.ascii-magic.com/ascii/ascii.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
