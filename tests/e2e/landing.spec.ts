import { expect, test } from "@playwright/test";

function contrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) throw new Error(`Unexpected computed color: ${color}`);
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test.describe("Radiance landing page", () => {
  test("hero chat CTA text has readable contrast at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const cta = page.locator(".landing-hero a.landing-cta:not(.landing-cta-ghost)").first();
    await expect(cta).toBeVisible();
    const colors = await cta.evaluate((element) => ({
      foreground: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
    }));
    expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  test("mobile menu follows an in-page link and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/#privacy$/);
    await expect(menu).not.toBeVisible();
  });

  test("desktop navigation reaches the product section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Product" }).click();
    await expect(page).toHaveURL(/#product$/);
    await expect(page.getByRole("heading", { name: "Not just another conversation" })).toBeVisible();
  });

  test("privacy route states current storage and sharing limits", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Current privacy model" })).toBeVisible();
    await expect(page.getByText(/profiles live in browser local storage/i)).toBeVisible();
    await expect(page.getByText(/Sharing retrieved context with the selected AI provider starts disabled/i)).toBeVisible();
  });

  test("FAQ disclosure toggles its answer with keyboard activation", async ({ page }) => {
    await page.goto("/");
    const question = page.getByRole("button", { name: "What is Personal Intelligence?" });
    await question.focus();
    await question.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("region", { name: "What is Personal Intelligence?" })).toBeVisible();
  });

  test("product preview steps remain keyboard-operable toggle buttons", async ({ page }) => {
    await page.goto("/");
    const step = page.getByRole("button", { name: "Ask later" });
    await step.focus();
    await step.press("Enter");
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("A later question retrieves overlap")).toBeVisible();
  });

  test("FAQ entrance motion respects reduced-motion preference", async ({ page }) => {
    await page.goto("/");
    const item = page.locator(".landing-faq-item").first();
    await expect(item).toBeVisible();
    await expect(item).toHaveCSS("animation-name", "landing-faq-enter");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(item).toHaveCSS("animation-name", "none");
  });

  test("hero chat CTA opens the existing chat experience", async ({ page }) => {
    await page.goto("/");
    await page.locator(".landing-hero a.landing-cta[href='/chat']").click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByPlaceholder("Ask RADIANCE anything...")).toBeVisible();
  });

  test("desktop navigation CTA opens the existing chat experience", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const cta = page.locator("header a.landing-cta[href='/chat']");
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByPlaceholder("Ask RADIANCE anything...")).toBeVisible();
  });

  test("final CTA opens the existing chat experience", async ({ page }) => {
    await page.goto("/");
    await page.locator(".landing-finale a[href='/chat']").click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByPlaceholder("Ask RADIANCE anything...")).toBeVisible();
  });
});
