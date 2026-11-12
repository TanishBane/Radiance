import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const outDir = path.resolve("docs/landing-page/screenshots");

test.describe("Visual Quality Inspection & Multi-Viewport Screenshot Capture", () => {
  test.setTimeout(120000);

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

      // Scroll to context pipeline section (the point where autumn-road-cyclist fades in)
      const pipelineSection = page.locator("#pipeline");
      if ((await pipelineSection.count()) > 0) {
        await pipelineSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-pipeline-section.png`),
          fullPage: false,
        });
      }

      // Scroll to privacy fortress section (the point where autumn-pagoda-maples fades in)
      const privacySection = page.locator("#privacy");
      if ((await privacySection.count()) > 0) {
        await privacySection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-privacy-section.png`),
          fullPage: false,
        });
      }

      // Scroll to FAQ section (the point where falling-leaves fades in)
      const faqSection = page.locator("#faq");
      if ((await faqSection.count()) > 0) {
        await faqSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-faq-section.png`),
          fullPage: false,
        });
      }

      // Scroll to Future Vision section (the point where aurora-curtains fades in)
      const visionSection = page.locator("#vision");
      if ((await visionSection.count()) > 0) {
        await visionSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-vision-section.png`),
          fullPage: false,
        });
      }

      // Scroll to Final CTA section (the point where starry-ridge fades in)
      const startSection = page.locator("#start");
      if ((await startSection.count()) > 0) {
        await startSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}-cta-starry-section.png`),
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

  test("capture 404 page with starry-ridge ascii art", async ({ page }) => {
    page.on("console", (msg) => console.log("E2E CONSOLE:", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.log("E2E PAGEERROR:", err.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/non-existent-route-for-404-test");
    await page.waitForTimeout(3000);

    const artOuter = await page.evaluate(() => document.querySelector("ascii-art")?.outerHTML);
    const shadowInner = await page.evaluate(() => document.querySelector("ascii-art")?.shadowRoot?.innerHTML);
    const scriptSrcs = await page.evaluate(() => Array.from(document.querySelectorAll("script")).map((s) => s.src || s.type));
    console.log("E2E SCRIPT TAGS:", scriptSrcs);
    console.log("E2E ASCII-ART OUTER:", artOuter);
    console.log("E2E SHADOW INNER:", shadowInner);

    await page.screenshot({
      path: path.join(outDir, "desktop-1440-not-found-starry-ridge.png"),
      fullPage: false,
    });
  });
});
