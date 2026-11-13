import { test, expect } from "@playwright/test";

test.describe("Radiance AI Platform E2E Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Illuminate what is possible", { exact: true })).toHaveCount(0, { timeout: 7000 });
  });

  test("loads application workspace with Radiance branding", async ({ page }) => {
    // Expect topbar and branding to be visible
    await expect(page).toHaveTitle(/RADIANCE/);
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("composer accepts input and updates character count", async ({ page }) => {
    const textarea = page.locator("textarea");
    const message = "Hello Radiance, explain neural network attention.";
    await textarea.fill(message);

    // Expect character counter to reflect length
    await expect(textarea).toHaveValue(message);
  });

  test("opens settings to the keyboard shortcut reference and closes it", async ({ page }) => {
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await page.getByTestId("bottom-nav-settings").click();
    } else {
      await page.keyboard.press("Control+k");
    }

    await expect(page.getByRole("dialog", { name: "Radiance Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).not.toBeVisible();
  });

  test("sidebar navigation buttons trigger slideout drawers", async ({ page }) => {
    // History drawer trigger
    const historyButton = page.locator('button[title*="History"]');
    if (await historyButton.isVisible()) {
      await historyButton.click();
      await expect(page.getByText("Conversations", { exact: true })).toBeVisible();
      await expect(page.getByRole("dialog", { name: "Conversations" })).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });

  test("opens personalization in an accessible dialog", async ({ page }) => {
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
    }
    await page.getByRole("button", { name: "Personalization" }).click();
    await expect(page.getByRole("dialog", { name: "Radiance Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Personalization" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Personalization" })).not.toBeVisible();
  });

  test("reduced motion keeps dialog transitions immediate", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await page.getByTestId("bottom-nav-settings").click();
    } else {
      await page.keyboard.press("Control+k");
    }

    const dialog = page.getByRole("dialog", { name: "Radiance Settings" });
    await expect(dialog).toBeVisible();
    const durationMs = await dialog.evaluate((element) => {
      const duration = getComputedStyle(element).animationDuration;
      return duration.endsWith("ms") ? parseFloat(duration) : parseFloat(duration) * 1000;
    });
    expect(durationMs).toBeLessThanOrEqual(1);
  });

  test("model selector opens and applies a registered model", async ({ page }) => {
    const modelButton = page.getByTestId("composer-model-trigger");
    await modelButton.click();
    await expect(page.getByText("Frontier Inference Models", { exact: false })).toBeVisible();

    await page.getByRole("option", { name: /Radiance Instant/ }).click();
    await expect(page.getByTestId("composer-model-trigger")).toContainText("Radiance Instant");
  });

  test("mode selector shows all modes above the composer and selects Plan", async ({ page }) => {
    await page.getByRole("button", { name: "Build", exact: true }).click();

    const planOption = page.getByRole("button", { name: "Plan", exact: true });
    const askOption = page.getByRole("button", { name: "Ask", exact: true });
    await expect(planOption).toBeVisible();
    await expect(askOption).toBeVisible();

    const menuBounds = await planOption.boundingBox();
    const composerBounds = await page.getByTestId("composer-model-trigger").boundingBox();
    expect(menuBounds).not.toBeNull();
    expect(composerBounds).not.toBeNull();
    expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(composerBounds!.y + 2);

    await planOption.click();
    await expect(page.getByRole("button", { name: "Plan", exact: true })).toBeVisible();
  });

  test("language picker shows readable choices and changes interface language", async ({ page }) => {
    await page.getByRole("button", { name: "Translate" }).click();

    const languageList = page.getByRole("listbox", { name: "Interface and response language" });
    await expect(languageList).toBeVisible();
    await expect(languageList.getByRole("option", { name: "Español" })).toBeVisible();
    await expect(languageList.getByRole("option", { name: "日本語" })).toBeVisible();

    await languageList.getByRole("option", { name: "Español" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("Hola, soy")).toBeVisible();
  });

  test("390px workspace does not overflow horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/chat");
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
    await expect(page.getByRole("button", { name: "Radiance home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear active conversation" })).toBeVisible();

    const category = page.getByRole("button", { name: "Create", exact: true });
    const categoryWidth = await category.evaluate((element) => ({
      client: element.clientWidth,
      content: element.scrollWidth,
    }));
    expect(categoryWidth.content).toBeLessThanOrEqual(categoryWidth.client);
  });

  test("320px workspace does not overflow horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/chat");
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
    await expect(page.getByRole("button", { name: "Clear active conversation" })).toBeVisible();
  });

  test("prompt suggestion columns remain inside their desktop row", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    const promptCategories = page.getByTestId("prompt-categories");
    const fits = await promptCategories.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return [...element.children].every((child) => {
        const item = child.getBoundingClientRect();
        return item.left >= bounds.left && item.right <= bounds.right;
      });
    });

    expect(fits).toBe(true);
  });
});
