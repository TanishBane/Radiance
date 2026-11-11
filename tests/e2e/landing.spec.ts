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
    await expect(page.getByRole("heading", { name: "Saved by you. Ready when it matters." })).toBeVisible();
  });

  test("every primary navigation link reaches its matching section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const navigation = page.getByRole("navigation", { name: "Primary" });

    for (const [label, target] of [
      ["Product", "product"],
      ["Personal Intelligence", "intelligence"],
      ["Privacy", "privacy"],
      ["Vision", "vision"],
    ]) {
      await navigation.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${target}$`));
      await expect(page.locator(`#${target}`)).toBeVisible();
      await expect(page.locator(`#${target}`)).toHaveCount(1);
    }
  });

  test("mobile menu links reach their unique homepage sections and close the menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const targets = [
      ["Product", "product"],
      ["Personal Intelligence", "intelligence"],
      ["Privacy", "privacy"],
      ["Vision", "vision"],
    ];

    for (const [label, target] of targets) {
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Menu" });
      await menu.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${target}$`));
      await expect(page.locator(`#${target}`)).toBeVisible();
      await expect(page.locator(`#${target}`)).toHaveCount(1);
      await expect(menu).not.toBeVisible();
    }
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

  test("annotated hero connects saved notes and preferences to the reply", async ({ page }) => {
    await page.goto("/");
    const article = page.getByRole("figure", { name: "An illustrative Radiance conversation" });
    await expect(article).toBeVisible();
    await expect(article.getByText("Saved note", { exact: true })).toBeVisible();
    await expect(article.getByText("Response preference", { exact: true })).toBeVisible();
    await expect(article.getByText(/illustrative conversation/i)).toBeVisible();
    await expect(article.getByText("More concise", { exact: true })).toBeVisible();
  });

  test("annotated hero fits narrow, tablet, and desktop widths", async ({ page }) => {
    for (const width of [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
      await expect(page.getByRole("figure", { name: "An illustrative Radiance conversation" })).toBeVisible();
    }
  });

  test("mobile opening shows the context proof beside the chat action", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".landing-hero a.landing-cta[href='/chat']")).toBeVisible();
    const proof = page.locator(".landing-hero-proof").getByText("More concise", { exact: true });
    await expect(proof).toBeVisible();
    const proofBottom = await proof.evaluate((element) => element.getBoundingClientRect().bottom);
    expect(proofBottom).toBeLessThanOrEqual(844);
  });

  test("hero and menu motion stay still when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".landing-reference-line").first()).toHaveCSS("animation-name", "none");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCSS("animation-name", "none");
  });

  test("mobile menu uses its short entrance transition", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCSS("animation-name", "landing-menu-panel-in");
  });

  test("hero reference line has one finite entrance on standard motion", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".landing-reference-line").first()).toHaveCSS("animation-name", "landing-reference-draw");
    await expect(page.locator(".landing-faq-item").first()).toHaveCSS("animation-name", "none");
  });

  test("hero chat CTA opens the existing chat experience", async ({ page }) => {
    // Warm the route first so the first development-server compile does not
    // make this navigation assertion depend on dev compilation timing.
    await page.goto("/chat");
    await expect(page.getByPlaceholder("Ask RADIANCE anything...")).toBeVisible();
    await page.goto("/");
    const cta = page.locator(".landing-hero a.landing-cta[href='/chat']");
    await expect(cta).toBeVisible();
    await cta.click();
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
