import type { Metadata } from "next";
import RadianceApp from "@/features/chat/components/radiance-app";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Radiance — Chat",
  description:
    "Start a Radiance conversation. Save personal notes, set response preferences, and chat with the model you choose.",
  alternates: {
    canonical: "/chat",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ChatPage() {
  return <RadianceApp />;
}
