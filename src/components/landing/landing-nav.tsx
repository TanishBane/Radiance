"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { LandingCta } from "./landing-cta";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#intelligence", label: "Personal Intelligence" },
  { href: "#privacy", label: "Privacy" },
  { href: "#vision", label: "Vision" },
] as const;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.querySelector(".landing-root");
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 8);
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("landing-nav", scrolled && "is-scrolled", "landing-nav-redesign")}>
      <div className="landing-shell landing-nav-row">
        <Link href="/" className="inline-flex items-center min-h-11" aria-label="Radiance home">
          <RadianceLogo variant="lockup" size="sm" aria-hidden />
        </Link>

        <nav className="landing-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <LandingCta className="landing-cta-desktop" />
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button type="button" className="landing-menu-btn" aria-label="Open menu" aria-haspopup="dialog">
                <Menu size={18} strokeWidth={1.5} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="landing-menu-overlay fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--void)_78%,transparent)]" />
              <Dialog.Content
                className="landing-menu-panel fixed inset-y-0 right-0 z-50 w-[min(100%,360px)] bg-[var(--void)] border-l border-[var(--border)] p-6 pt-[calc(16px+var(--sat))] landing-menu-redesign"
                aria-describedby={undefined}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-medium">Menu</Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="landing-menu-btn" aria-label="Close menu">
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </Dialog.Close>
                </div>
                <nav className="mt-10 flex flex-col gap-2" aria-label="Mobile">
                  {NAV_LINKS.map((link) => (
                    <Dialog.Close asChild key={link.href}>
                      <a href={link.href} className="flex min-h-11 items-center text-xl">
                        {link.label}
                      </a>
                    </Dialog.Close>
                  ))}
                </nav>
                <div className="mt-10">
                  <LandingCta className="w-full" />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
