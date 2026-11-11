"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LandingCta({
  href = "/chat",
  children = "Chat with Radiance",
  variant = "solid",
  size = "md",
  className,
  style,
}: {
  href?: string;
  children?: ReactNode;
  variant?: "solid" | "ghost";
  size?: "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <Link
      href={href}
      style={style}
      onClick={handleClick}
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
