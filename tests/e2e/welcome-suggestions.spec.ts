import { expect, test } from "@playwright/test";

test("welcome suggestions reflect local interests and rotate on a new app session", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    localStorage.setItem("radiance_settings", JSON.stringify({ version: 1, settings: { language: "es" } }));
    if (localStorage.getItem("radiance_chat_conv_welcome_interest")) return;
    localStorage.setItem("radiance_chat_conv_welcome_interest", JSON.stringify({
      id: "welcome_interest",
      title: "Previous conversation",
      createdAt: 1,
      updatedAt: 2,
      pinned: false,
      messages: [
        { id: "user_1", role: "user", content: "I have been learning React and TypeScript.", createdAt: 1 },
        { id: "assistant_1", role: "assistant", content: "We can also discuss gardening.", createdAt: 2 },
      ],
    }));
    localStorage.removeItem("radiance_welcome_suggestion_ids");
  });

  await page.goto("/chat");
  await page.waitForTimeout(3_200);
  const suggestionButtons = page.getByRole("button", { name: /Preguntar esto:/i });
  await expect(suggestionButtons.first()).toContainText("tecnología");
  const firstSessionLabels = await suggestionButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-label") || "")
  );
  expect(firstSessionLabels.length).toBeGreaterThan(0);
  expect(firstSessionLabels.every((label) => !/\p{Extended_Pictographic}/u.test(label))).toBe(true);
  const storedIds = await page.evaluate(() => JSON.parse(localStorage.getItem("radiance_welcome_suggestion_ids") || "[]"));
  expect(storedIds.every((id: unknown) => typeof id === "string")).toBe(true);
  expect(JSON.stringify(storedIds)).not.toContain("React");
  await page.screenshot({ path: testInfo.outputPath("personalized-welcome.png") });

  if (testInfo.project.name === "chromium") {
    const previewButtons = page.getByRole("button", { name: /Vista previa:/i });
    await previewButtons.first().hover();
    await expect(page.getByRole("tooltip")).toContainText("tecnología");
    await page.mouse.move(0, 0);
  }

  await page.getByRole("button", { name: /Vista previa:/i }).first().click();
  const preview = page.getByRole("dialog");
  await expect(preview).toBeVisible();
  await expect(page.getByTestId("suggestion-preview-prompt")).not.toBeEmpty();
  await page.screenshot({ path: testInfo.outputPath("suggestion-preview.png") });
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();

  await page.reload();
  await page.waitForTimeout(3_200);
  const nextSessionButtons = page.getByRole("button", { name: /Preguntar esto:/i });
  await expect(nextSessionButtons.first()).toContainText("tecnología");
  const nextSessionLabels = await nextSessionButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-label") || "")
  );
  expect(nextSessionLabels).toHaveLength(firstSessionLabels.length);
  expect(nextSessionLabels.every((label) => !firstSessionLabels.includes(label))).toBe(true);
  expect(nextSessionLabels.every((label) => !/\p{Extended_Pictographic}/u.test(label))).toBe(true);
});
