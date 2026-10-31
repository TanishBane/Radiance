import { test, expect } from "@playwright/test";

test.describe("Radiance AI Platform E2E Workflows", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root
    await page.goto("/");
  });

  test("loads application workspace with Radiance branding", async ({ page }) => {
    // Expect topbar and branding to be visible
    await expect(page.locator("text=RADIANCE")).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("composer accepts input and updates character count", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("Hello Radiance, explain neural network attention.");

    // Expect character counter to reflect length
    await expect(page.locator("text=51 chars")).toBeVisible();
  });

  test("opens and closes keyboard shortcuts dialog via Ctrl+K", async ({ page }) => {
    // Press Ctrl+K or Cmd+K
    await page.keyboard.press("Control+k");

    // Modal should become visible
    await expect(page.locator("text=Keyboard Shortcuts")).toBeVisible();

    // Escape closes modal
    await page.keyboard.press("Escape");
    await expect(page.locator("text=Keyboard Shortcuts")).not.toBeVisible();
  });

  test("sidebar navigation buttons trigger slideout drawers", async ({ page }) => {
    // History drawer trigger
    const historyButton = page.locator('button[title*="History"]');
    if (await historyButton.isVisible()) {
      await historyButton.click();
      await expect(page.locator("text=Conversations")).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });
});
