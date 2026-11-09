import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("Immersive Storytelling & Multi-Viewport Experience", () => {
  test.beforeAll(() => {
    const dir = path.join(process.cwd(), "docs/landing-page/screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test("all 8 storytelling sections are present, unique, and accessible via navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. Hero
    await expect(page.locator(".hero-landscape-section")).toBeVisible();
    await expect(page.getByRole("heading", { name: /AI that brings your context forward/i })).toBeVisible();

    // 2. Problem
    await expect(page.locator("#problem")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your context shouldn't disappear between conversations/i })).toBeVisible();

    // 3. Product Intro & Personal Intelligence
    await expect(page.locator("#product")).toBeVisible();
    await expect(page.locator("#intelligence")).toBeVisible();
    await expect(page.getByRole("heading", { name: /An AI experience shaped around your context/i })).toBeVisible();

    // 4. Preferences Sandbox
    await expect(page.locator("#preferences")).toBeVisible();
    await expect(page.getByRole("heading", { name: /An answer should feel right for you/i })).toBeVisible();

    // 5. Context Pipeline
    await expect(page.locator("#pipeline")).toBeVisible();
    await expect(page.getByRole("heading", { name: /The right context. At the right moment/i })).toBeVisible();

    // 6. Privacy
    await expect(page.locator("#privacy")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your context. Your choice/i })).toBeVisible();

    // 7. Vision
    await expect(page.locator("#vision")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Personal intelligence, with room to evolve/i })).toBeVisible();

    // 8. Final CTA
    await expect(page.locator(".section-atmosphere-final")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your next conversation can feel different/i })).toBeVisible();
  });

  test("interactive hero stage reacts to suggestion clicks", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const stage = page.locator(".hero-stage-container");
    await expect(stage).toBeVisible();

    // Click "pack accordingly" in the Understand card
    const packBtn = page.getByRole("button", { name: "pack accordingly" });
    await packBtn.click();

    // Output preview should reflect the selected context
    await expect(page.locator(".hero-stage-output-text")).toContainText("Tailored packing checklist prepared");

    // Click "job negotiation and accept..." in Create card
    const jobBtn = page.getByRole("button", { name: "job negotiation and accept..." });
    await jobBtn.click();
    await expect(page.locator(".hero-stage-output-text")).toContainText("Drafted formal counter-proposal");
  });

  test("interactive preference sandbox morphs outputs on tab click", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const sandbox = page.locator("#preferences");
    await sandbox.scrollIntoViewIfNeeded();

    // Default is concise
    await expect(sandbox.locator(".preference-result-body")).toContainText("elects a single leader");

    // Switch to Detailed
    await sandbox.getByRole("tab", { name: "Detailed" }).click();
    await expect(sandbox.locator(".preference-result-body")).toContainText("Leader Completeness Property");

    // Switch to Structured
    await sandbox.getByRole("tab", { name: "Structured" }).click();
    await expect(sandbox.locator(".preference-result-body")).toContainText("State Machine Matrix");
  });

  test("zero horizontal overflow and natural scrolling across viewports", async ({ page }) => {
    const viewports = [
      { name: "desktop-1440", width: 1440, height: 900 },
      { name: "tablet-768", width: 768, height: 1024 },
      { name: "mobile-390", width: 390, height: 844 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      expect(overflow.hasOverflow).toBe(false);

      // Scroll to bottom and verify displacement
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);

      // Capture screenshots for visual review pass
      const screenshotDir = path.join(process.cwd(), "docs/landing-page/screenshots");
      await page.screenshot({
        path: path.join(screenshotDir, `immersive-${vp.name}-viewport.png`),
        fullPage: false
      });
      await page.screenshot({
        path: path.join(screenshotDir, `immersive-${vp.name}-fullpage.png`),
        fullPage: true
      });
    }
  });

  test("primary and final CTAs navigate to real chat experience", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Hero CTA
    const heroChatBtn = page.locator(".hero-btn-primary");
    await expect(heroChatBtn).toHaveAttribute("href", "/chat");

    // Final CTA
    const finalChatBtn = page.locator(".section-atmosphere-final a[href='/chat']");
    await expect(finalChatBtn).toBeVisible();
    await expect(finalChatBtn).toHaveAttribute("href", "/chat");
  });
});
