import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RADIANCE — Intelligent AI Platform",
  description: "Illuminate what is possible. High-precision reasoning, multimodal intelligence, and ambient spatial computing.",
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
    <html lang="en" className="dark">
      <body className="antialiased bg-[#06060a] text-[#f0ede6] h-screen overflow-hidden selection:bg-[var(--accent)] selection:text-[var(--void)]">
        {children}
      </body>
    </html>
  );
}
