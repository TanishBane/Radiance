import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import "./hover-button-1.css";

interface HoverActionButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function HoverActionButton({
  href,
  label = "Button",
  className,
}: HoverActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("hover-action-button", className)}
    >
      <span className="hover-action-button__fill" aria-hidden="true" />
      <span className="hover-action-button__label" aria-hidden="true">
        {label}
        <ArrowDown className="h-4 w-4" />
      </span>
      <span className="hover-action-button__reveal" aria-hidden="true">
        {label}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
