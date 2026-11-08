import React, { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LandingCta({
  href = "/chat",
  children = "Chat with Radiance",
  variant = "solid",
  size = "md",
  className,
}: {
  href?: string;
  children?: ReactNode;
  variant?: "solid" | "ghost";
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "landing-cta",
        variant === "ghost" && "landing-cta-ghost",
        size === "lg" && "landing-cta-lg",
        className
      )}
    >
      {children}
    </Link>
  );
}
