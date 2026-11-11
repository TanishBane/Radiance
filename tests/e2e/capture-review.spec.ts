import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const outDir = path.resolve("docs/landing-page/screenshots");

test.describe("Visual Quality Inspection & Multi-Viewport Screenshot Capture", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`capture screenshots at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      // Wait for starfield appear fade-in (300ms delay + 1400ms fade) and Three.js warm up
      await page.waitForTimeout(2500);

      // Above the fold
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-above-fold.png`),
        fullPage: false,
      });

      // Scroll to problem section (the point where balloon-valley-sunrise fades in)
      const problemSection = page.locator("#problem");
      if ((await problemSection.count()) > 0) {
        await problemSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-problem-section.png`),
          fullPage: false,
        });
      }

      // Scroll to product introduction section (the point where moonlit-sea fades in)
      const productSection = page.locator("#product");
      if ((await productSection.count()) > 0) {
        await productSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-product-section.png`),
          fullPage: false,
        });
      }

      // Scroll to product preview walkthrough section (the point where mountain-sunrise fades in)
      const previewSection = page.locator("#preview");
      if ((await previewSection.count()) > 0) {
        await previewSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-preview-section.png`),
          fullPage: false,
        });
      }

      // Scroll to personal intelligence section (the point where nyc-skyline-night fades in)
      const intelligenceSection = page.locator("#intelligence");
      if ((await intelligenceSection.count()) > 0) {
        await intelligenceSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-intelligence-section.png`),
          fullPage: false,
        });
      }

      // Scroll to preferences sandbox section (the point where orbit-window-earth fades in)
      const preferencesSection = page.locator("#preferences");
      if ((await preferencesSection.count()) > 0) {
        await preferencesSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-preferences-section.png`),
          fullPage: false,
        });
      }

      // Full page screenshot
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-fullpage.png`),
        fullPage: true,
      });
    });
  }
});
