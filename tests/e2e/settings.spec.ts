import { test, expect, Page } from "@playwright/test";

async function openSettings(page: Page) {
  await expect(page.getByPlaceholder("Ask RADIANCE anything...")).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) < 768) {
    const bottomSettings = page.getByTestId("bottom-nav-settings");
    if (await bottomSettings.isVisible()) {
      await bottomSettings.click();
    } else {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.getByRole("button", { name: "Settings", exact: true }).click();
    }
  } else {
    await page.keyboard.press("Control+k");
  }
  await expect(page.getByRole("dialog", { name: "Radiance Settings" })).toBeVisible();
}

async function selectSection(page: Page, label: string) {
  const desktopLink = page.getByRole("button", { name: label, exact: true });
  if (await desktopLink.isVisible().catch(() => false)) {
    await desktopLink.click();
  } else {
    await page.getByRole("combobox", { name: "Settings section" }).selectOption({ label });
  }
}

test.describe("Radiance Settings Center", () => {
  test("opens the shortcut reference, searches settings, and persists choices", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await openSettings(page);

    const viewport = page.viewportSize();
    if (viewport) {
      await page.screenshot({
        path: `.antigravity/screenshots/settings-${viewport.width < 768 ? "mobile" : "desktop"}.png`,
        fullPage: false,
      });
    }

    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();
    await expect(page.getByText("Ctrl / ⌘ + K")).toBeVisible();
    const search = page.getByRole("searchbox", { name: "Search settings" });
    await search.fill("response language");
    await page.getByRole("button", { name: /Interface and response language.*Personalization/i }).click();
    await page.getByLabel("Interface and response language").selectOption("hi");
    const close = page.getByRole("button", { name: "Close settings" });
    if (await close.isVisible()) await close.click();
    else await page.getByRole("button", { name: "Back to chat" }).click();

    await page.reload();
    await page.waitForLoadState("networkidle");
    await openSettings(page);
    await selectSection(page, "Personalization");
    await expect(page.getByLabel("Interface and response language")).toHaveValue("hi");
  });

  test("manages explicit local intelligence notes with sharing off by default", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await openSettings(page);
    await selectSection(page, "Personal Intelligence");

    const sharing = page.getByRole("checkbox", { name: /Share relevant saved context/i });
    await expect(sharing).not.toBeChecked();
    await expect(page.getByText(/in this browser only/i)).toBeVisible();
    await page.getByLabel("New note").fill("I use Python for data analysis");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("I use Python for data analysis", { exact: true })).toBeVisible();
    const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("radiance_personal_intelligence_v1") || "null"));
    expect(profile.personalizationEnabled).toBe(false);
    expect(profile.memories).toHaveLength(1);
    expect(profile.memories[0].confidence).toBe("user-confirmed");
  });

  test("Enter-to-send preference keeps Enter as a newline when disabled", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await openSettings(page);
    await selectSection(page, "Chat & Composer");
    const sendOnEnter = page.getByRole("switch", { name: "Enter sends a message" });
    await sendOnEnter.click();
    await expect(sendOnEnter).toHaveAttribute("aria-checked", "false");
    const close = page.getByRole("button", { name: "Close settings" });
    if (await close.isVisible()) await close.click();
    else await page.getByRole("button", { name: "Back to chat" }).click();

    const composer = page.getByPlaceholder("Ask RADIANCE anything...");
    await composer.fill("Keep this draft");
    await composer.press("Enter");
    await expect(composer).toHaveValue("Keep this draft\n");
  });

  test("requires confirmation before clearing locally stored conversations", async ({ page }) => {
    const key = "radiance_chat_settings_e2e";
    await page.addInitScript(({ storageKey, conversation }) => {
      localStorage.setItem(storageKey, JSON.stringify(conversation));
    }, {
      storageKey: key,
      conversation: {
        id: "conv_settings_e2e",
        title: "Settings data fixture",
        pinned: false,
        createdAt: 1,
        updatedAt: 1,
        messages: [{ id: "msg_settings_e2e", role: "user", content: "Fixture", createdAt: 1 }],
      },
    });
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await openSettings(page);
    await selectSection(page, "Data Controls");
    await expect(page.getByText("Download 1 locally available conversation as a JSON file.")).toBeVisible();

    await page.getByRole("button", { name: "Clear history" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Download 1 locally available conversation as a JSON file.")).toBeVisible();

    await page.getByRole("button", { name: "Clear history" }).click();
    await page.getByRole("button", { name: "Clear conversations" }).click();
    await expect(page.getByText("Download 0 locally available conversations as a JSON file.")).toBeVisible();
    expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull();
  });
});
