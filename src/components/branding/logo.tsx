import React from "react";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function RadianceLogo({ size = "md", className, onClick }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-12 h-12 text-[14px]",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div
      onClick={onClick}
      className={cn("flex items-center gap-2.5 cursor-pointer select-none group", className)}
    >
      <div
        className={cn(
          "rounded-xl font-mono font-bold flex items-center justify-center transition-all duration-300",
          "border border-[var(--border)] shadow-[0_0_20px_rgba(232,168,73,0.15)]",
          "group-hover:border-[var(--accent)] group-hover:shadow-[0_0_25px_var(--accent-g)]",
          sizeClasses[size]
        )}
        style={{
          background: "linear-gradient(135deg, rgba(232,168,73,0.22), rgba(212,136,58,0.08))",
          color: "var(--accent-b)",
        }}
      >
        RD
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-serif tracking-[0.12em] font-bold text-[var(--txt)] transition-colors",
            "group-hover:text-[var(--accent-b)]",
            textSizes[size]
          )}
        >
          RADIANCE
        </span>
      </div>
    </div>
  );
}
