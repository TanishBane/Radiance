import { expect, test } from "@playwright/test";

test("contextual follow-ups render as a theme-aware carousel and rotate by controls and keyboard", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  let lastSubmittedText = "";
  await page.route("**/api/chat", (route) => {
    const body = route.request().postDataJSON();
    lastSubmittedText = body.messages.at(-1)?.content ?? "";
    return route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: `0:${JSON.stringify("This is a short implementation example.")}\n`,
    });
  });
  await page.route("**/api/followups", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        questions: [
          "How should this implementation be tested?",
          "What edge cases should I consider?",
          "Can you explain the trade-offs?",
        ],
      }),
    })
  );

  await page.goto("/chat");
  await page.waitForTimeout(3_200);
  await page.getByPlaceholder("Ask RADIANCE anything...").fill("Build a small feature");
  await page.getByPlaceholder("Ask RADIANCE anything...").press("Enter");

  const carousel = page.getByRole("region", { name: "Suggested follow-up questions" });
  await expect(carousel).toBeVisible();
  await expect(page.getByText("Suggestion 1 of 3")).toBeVisible();
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const carouselBounds = await carousel.boundingBox();
  expect(carouselBounds).not.toBeNull();
  expect(carouselBounds!.x + carouselBounds!.width).toBeLessThanOrEqual(viewportWidth);

  const activeSuggestion = page.getByRole("button", { name: "Use suggestion: How should this implementation be tested?" });
  const accent = await activeSuggestion.evaluate((element) =>
    getComputedStyle(element).borderColor
  );
  expect(accent).not.toBe("");

  await page.screenshot({ path: testInfo.outputPath("follow-up-carousel.png") });
  await page.waitForTimeout(250);
  const nextButton = page.getByRole("button", { name: "Next suggestion" });
  if ((page.viewportSize()?.width ?? 0) < 768) await nextButton.tap();
  else await nextButton.click();
  await expect(page.getByText("Suggestion 2 of 3")).toBeVisible();
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("Suggestion 3 of 3")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("Suggestion 2 of 3")).toBeVisible();

  await page.getByRole("button", { name: "Use suggestion: What edge cases should I consider?" }).click();
  await expect.poll(() => lastSubmittedText).toBe("What edge cases should I consider?");
});
