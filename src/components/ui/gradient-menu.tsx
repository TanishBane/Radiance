"use client";

import { LiquidNavbar, type LiquidNavbarProps, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar";

export type GradientMenuItem = LiquidNavItem & {
  gradientFrom: string;
  gradientTo: string;
};

export type GradientMenuProps = Omit<LiquidNavbarProps, "items" | "orientation" | "compact"> & {
  items: GradientMenuItem[];
};

/** Vertical gradient hover treatment layered into Radiance's liquid-glass navigation. */
export function GradientMenu({ items, className, ...props }: GradientMenuProps) {
  return (
    <LiquidNavbar
      {...props}
      items={items}
      orientation="vertical"
      compact={false}
      className={["nimbus-gradient-menu", className].filter(Boolean).join(" ")}
    />
  );
}

export default GradientMenu;
