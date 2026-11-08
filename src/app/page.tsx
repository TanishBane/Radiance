import React from "react";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Radiance — Intelligence that understands you",
  description:
    "Radiance is personal intelligence AI. Save notes, set response preferences, and bring relevant context into later conversations under your control.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Radiance — Intelligence that understands you",
    description:
      "Your context. Your preferences. Your AI. Save notes, set response preferences, and chat with the model you choose.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
