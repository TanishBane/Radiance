import React from "react";
import { RadianceLogo as OfficialRadianceLogo, RadianceLogoProps } from "./radiance-logo";

export interface LogoProps extends Omit<RadianceLogoProps, "variant"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  onClick?: () => void;
  showWordmark?: boolean;
}

/**
 * RadianceLogo: Official Brand Symbol & Lockup
 * Re-exports the official mathematical speed-striped symbol identity.
 */
export function RadianceLogo(props: LogoProps) {
  return <OfficialRadianceLogo variant={props.showWordmark === false ? "symbol" : "lockup"} {...props} />;
}

export { OfficialRadianceLogo };
