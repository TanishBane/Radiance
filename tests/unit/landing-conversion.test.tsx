import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrivacySection } from "@/components/landing/privacy-section";
import { LandingFaq } from "@/components/landing/landing-faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/components/branding/radiance-logo", () => ({
  RadianceLogo: () => <span>Radiance</span>,
}));

afterEach(cleanup);

describe("landing privacy and conversion", () => {
  it("states the current browser-storage limitations and links to the privacy model", () => {
    render(<PrivacySection />);
    expect(screen.getByText(/plaintext/i)).toBeTruthy();
    expect(screen.getByText(/not end-to-end encrypted/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /current privacy model/i }).getAttribute("href")).toBe("/privacy");
  });

  it("opens and closes FAQ answers with accessible disclosure buttons", () => {
    render(<LandingFaq />);
    const question = screen.getByRole("button", { name: /what is radiance/i });
    expect(question.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(question);
    expect(question.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(question);
    expect(question.getAttribute("aria-expanded")).toBe("true");
  });

  it("sends the final conversion action to the real chat route", () => {
    render(<FinalCta />);
    expect(screen.getByRole("link", { name: /chat with radiance/i }).getAttribute("href")).toBe("/chat");
  });

  it("provides responsive footer navigation to privacy and chat", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Chat" }).getAttribute("href")).toBe("/chat");
    expect(screen.getByRole("link", { name: "Privacy model" }).getAttribute("href")).toBe("/privacy");
  });
});
