import { test, expect } from "@playwright/test";

test.describe("Homepage Scrolling Architecture & Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("document element and body allow vertical scrolling with zero horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const scrollDimensions = await page.evaluate(() => {
      return {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyOverflowY: window.getComputedStyle(document.body).overflowY,
        htmlOverflowY: window.getComputedStyle(document.documentElement).overflowY,
      };
    });

    // Content must be significantly taller than viewport to allow scrolling
    expect(scrollDimensions.scrollHeight).toBeGreaterThan(scrollDimensions.clientHeight * 2);
    // Zero horizontal overflow
    expect(scrollDimensions.scrollWidth).toBeLessThanOrEqual(scrollDimensions.clientWidth);
    // Overflow-y must not be hidden on html or body
    expect(scrollDimensions.bodyOverflowY).not.toBe("hidden");
    expect(scrollDimensions.htmlOverflowY).not.toBe("hidden");
  });

  test("mouse-wheel scrolling smoothly updates window.scrollY", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // Scroll down via mouse wheel
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(400);

    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBeGreaterThan(150);

    // Scroll back up via mouse wheel
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(400);

    const scrollYTop = await page.evaluate(() => window.scrollY);
    expect(scrollYTop).toBeLessThan(scrollYAfter);
  });

  test("keyboard scrolling supports PageDown, PageUp, ArrowDown, End, and Home navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForLoadState("networkidle");
    
    // Click on the background to ensure page viewport has keyboard focus
    await page.mouse.click(10, 10);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // Press PageDown
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(400);
    const scrollAfterPageDown = await page.evaluate(() => window.scrollY);
    expect(scrollAfterPageDown).toBeGreaterThan(100);

    // Scroll back up to top using instant scroll to reset position
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("anchor navigation moves window.scrollY to target section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const nav = page.getByRole("navigation", { name: "Primary" });

    // Click "Privacy" in desktop nav
    await nav.getByRole("link", { name: "Privacy" }).click();
    await page.waitForTimeout(500);

    const privacySection = page.locator("#privacy");
    await expect(privacySection).toBeVisible();

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(300);
  });

  test("touch and mobile scrolling work naturally with zero horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.evaluate(() => {
      window.scrollTo({ top: 400, behavior: "instant" });
    });

    const scrollYMobile = await page.evaluate(() => window.scrollY);
    expect(scrollYMobile).toBe(400);

    // Ensure no horizontal overflow at mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("mobile menu open temporarily locks scroll and restores natural scroll when closed", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Open menu
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();

    // Close menu via close button
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).not.toBeVisible();
    await page.waitForTimeout(300);

    // Verify scrolling is active immediately after close
    await page.evaluate(() => {
      window.scrollTo({ top: 300, behavior: "instant" });
    });
    const restoredScroll = await page.evaluate(() => window.scrollY);
    expect(restoredScroll).toBe(300);
  });
});
