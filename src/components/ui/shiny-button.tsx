"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import "./shiny-button.css";

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * ShinyButton — animated conic-gradient border button with dot pattern,
 * shimmer, and breathing glow on hover/focus.
 *
 * When `href` is provided, renders as an accessible Next.js Link.
 * Otherwise, renders as a standard native `<button>`.
 */
export function ShinyButton({
  children,
  onClick,
  href,
  className,
  size,
  ...props
}: ShinyButtonProps) {
  const sizeClass =
    size === "sm" ? "shiny-cta-sm" : size === "lg" ? "shiny-cta-lg" : "";

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        className={cn("shiny-cta", sizeClass, className)}
      >
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      className={cn("shiny-cta", sizeClass, className)}
      onClick={onClick}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}

export default ShinyButton;
