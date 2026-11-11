import React from "react";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Radiance — Scale Smarter, Not Harder",
  description:
    "Drive your funnel forward with clever workflows, analytics, and seamless lead management — all in one immersive command center.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Radiance — Scale Smarter, Not Harder",
    description:
      "Drive your funnel forward with clever workflows, analytics, and seamless lead management — all in one immersive command center.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
