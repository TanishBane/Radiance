import React from "react";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Radiance — AI that brings your context forward",
  description:
    "Bring saved context and response preferences into your AI conversations with Radiance. Local-first personal intelligence with explicit control over what you share.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Radiance — AI that brings your context forward",
    description:
      "Bring saved context and response preferences into your AI conversations with Radiance. Local-first personal intelligence with explicit control over what you share.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
