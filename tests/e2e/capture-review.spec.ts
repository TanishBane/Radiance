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

      // Full page screenshot
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-fullpage.png`),
        fullPage: true,
      });
    });
  }
});
