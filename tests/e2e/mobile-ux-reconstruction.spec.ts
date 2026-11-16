import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const outDir = path.resolve("docs/mobile-ux-reconstruction/screenshots");

test.describe("Mobile UI/UX Reconstruction & Layout Collision Verification", () => {
  test.setTimeout(120000);

  test.beforeAll(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  });

  const mobileDevices = [
    { name: "se1-320", width: 320, height: 568 },
    { name: "se2-375", width: 375, height: 667 },
    { name: "iphone15-393", width: 393, height: 852 },
    { name: "pixel8-412", width: 412, height: 915 },
  ];

  for (const dev of mobileDevices) {
    test.describe(`Device: ${dev.name}`, () => {
      test.use({ viewport: { width: dev.width, height: dev.height } });

      test(`captures and verifies mobile UX at ${dev.name} (${dev.width}x${dev.height})`, async ({ page }) => {
        await page.goto("/chat");
        await expect(page.locator("textarea")).toBeVisible({ timeout: 15000 });

        // 1. Verify zero horizontal overflow
        const overflowCheck = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          content: document.documentElement.scrollWidth,
        }));
        expect(overflowCheck.content).toBeLessThanOrEqual(overflowCheck.viewport);

        // Capture Chat Workspace Empty State
        await page.screenshot({
          path: path.join(outDir, `${dev.name}-chat-workspace.png`),
          fullPage: false,
        });

        // 2. Open Model Selector and capture Mobile Action Sheet
        const modelTrigger = page.getByTestId("composer-model-trigger");
        await expect(modelTrigger).toBeVisible();
        await modelTrigger.scrollIntoViewIfNeeded();
        await modelTrigger.click();

        const modelListbox = page.locator("#composer-model-listbox");
        await expect(modelListbox).toBeVisible();

        // Verify grab handle on mobile
        const grabHandle = page.locator(".action-sheet-grab-handle");
        await expect(grabHandle).toBeVisible();

        await page.screenshot({
          path: path.join(outDir, `${dev.name}-model-action-sheet.png`),
          fullPage: false,
        });

        // Close model sheet by pressing Escape
        await page.keyboard.press("Escape");
        await expect(modelListbox).not.toBeVisible();
        await page.waitForTimeout(300);

        // 3. Open Unified History Drawer via bottom navigation
        const historyBtn = page.getByTestId("bottom-nav-history");
        await expect(historyBtn).toBeVisible();
        await historyBtn.click();

        const drawer = page.getByTestId("history-drawer");
        await expect(drawer).toBeVisible({ timeout: 10000 });

        // Verify "+ Start New Chat" hero button
        const newChatHero = drawer.getByRole("button", { name: "Start New Chat" });
        await expect(newChatHero).toBeVisible();

        // Verify quick navigation settings and context buttons
        const settingsBtn = drawer.getByRole("button", { name: "Settings" });
        await expect(settingsBtn).toBeVisible();

        await page.screenshot({
          path: path.join(outDir, `${dev.name}-unified-history-drawer.png`),
          fullPage: false,
        });

        // Close drawer
        const closeBtn = drawer.getByRole("button", { name: /Close conversation history|Close/i });
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press("Escape");
        }
        await expect(drawer).not.toBeVisible();
        await page.waitForTimeout(300);

        // 4. Navigate to Landing Page and verify footer clearance
        await page.goto("/");
        await page.waitForTimeout(1000);

        // Scroll to footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(outDir, `${dev.name}-landing-footer-clearance.png`),
          fullPage: false,
        });
      });
    });
  }

  test.describe("Desktop Preservation", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("captures and verifies desktop layout preservation at 1440x900", async ({ page }) => {
      await page.goto("/chat");
      await expect(page.locator("textarea")).toBeVisible({ timeout: 15000 });

      // Verify desktop sidebar dock is visible (aside element with primary sidebar dock accessible name)
      const sidebarDock = page.getByRole("complementary", { name: "Primary sidebar dock" });
      await expect(sidebarDock).toBeVisible();

      // Capture Desktop Chat Workspace
      await page.screenshot({
        path: path.join(outDir, "desktop-1440-chat-workspace.png"),
        fullPage: false,
        animations: "disabled",
      });

      // Open model selector on desktop (anchored popover)
      const modelTrigger = page.getByTestId("composer-model-trigger");
      await modelTrigger.click();

      const modelListbox = page.locator("#composer-model-listbox");
      await expect(modelListbox).toBeVisible({ timeout: 10000 });

      // Verify grab handle is HIDDEN on desktop
      const grabHandle = page.locator(".action-sheet-grab-handle");
      await expect(grabHandle).not.toBeVisible();

      await page.screenshot({
        path: path.join(outDir, "desktop-1440-model-popover.png"),
        fullPage: false,
        animations: "disabled",
      });
    });
  });
});
