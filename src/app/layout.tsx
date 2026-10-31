import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RADIANCE — Intelligent AI Platform",
  description:
    "Illuminate what is possible. High-precision reasoning, multimodal intelligence, and ambient spatial computing.",
  keywords: ["AI", "Radiance", "Machine Learning", "Groq", "Gemini", "Llama 3.3", "Vercel AI SDK"],
  authors: [{ name: "RADIANCE Architecture Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06060a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${cormorant.variable}`}>
      <body className="antialiased font-sans bg-[#06060a] text-[#f0ede6] h-[100dvh] overflow-hidden selection:bg-[var(--accent)] selection:text-[var(--void)]">
        {children}
      </body>
    </html>
  );
}
