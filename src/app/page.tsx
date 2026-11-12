import React from "react";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Radiance — AI that brings your context forward",
  description:
    "Bring your saved notes and response preferences into a Radiance conversation. Notes stay in this browser, sharing is opt-in, and you choose the model.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Radiance — AI that brings your context forward",
    description:
      "Bring your saved notes and response preferences into a Radiance conversation. Notes stay in this browser, sharing is opt-in, and you choose the model.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
