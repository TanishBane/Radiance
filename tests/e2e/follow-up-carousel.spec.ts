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

  const leftCarousel = page.getByRole("region", { name: "Left follow-up suggestions" });
  const rightCarousel = page.getByRole("region", { name: "Right follow-up suggestions" });
  await expect(leftCarousel).toBeVisible();
  await expect(rightCarousel).toBeVisible();
  await expect(leftCarousel.getByText("1/3")).toBeVisible();
  await expect(rightCarousel.getByText("2/3")).toBeVisible();
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const leftBounds = await page.getByTestId("left-follow-up-lane").boundingBox();
  const rightBounds = await page.getByTestId("right-follow-up-lane").boundingBox();
  const composerBounds = await page.getByTestId("composer-lane").boundingBox();
  expect(leftBounds).not.toBeNull();
  expect(rightBounds).not.toBeNull();
  expect(composerBounds).not.toBeNull();
  expect(rightBounds!.x + rightBounds!.width).toBeLessThanOrEqual(viewportWidth);
  if (viewportWidth >= 768) {
    expect(leftBounds!.x + leftBounds!.width).toBeLessThanOrEqual(composerBounds!.x);
    expect(composerBounds!.x + composerBounds!.width).toBeLessThanOrEqual(rightBounds!.x);
    const leftCenter = leftBounds!.y + leftBounds!.height / 2;
    const composerCenter = composerBounds!.y + composerBounds!.height / 2;
    const rightCenter = rightBounds!.y + rightBounds!.height / 2;
    expect(Math.abs(leftCenter - composerCenter)).toBeLessThanOrEqual(32);
    expect(Math.abs(rightCenter - composerCenter)).toBeLessThanOrEqual(32);
  } else {
    expect(leftBounds!.x).toBeLessThan(rightBounds!.x);
    expect(Math.abs(leftBounds!.y - rightBounds!.y)).toBeLessThanOrEqual(1);
    expect(leftBounds!.y + leftBounds!.height).toBeLessThanOrEqual(composerBounds!.y);
  }

  const activeSuggestion = leftCarousel.getByRole("button", { name: "Use suggestion: How should this implementation be tested?" });
  const accent = await activeSuggestion.evaluate((element) =>
    getComputedStyle(element).borderColor
  );
  expect(accent).not.toBe("");

  await page.screenshot({ path: testInfo.outputPath("follow-up-carousel.png") });
  await page.waitForTimeout(250);
  const nextButton = page.getByRole("button", { name: "Next Left" });
  if ((page.viewportSize()?.width ?? 0) < 768) await nextButton.tap();
  else await nextButton.click();
  await expect(leftCarousel.getByText("2/3")).toBeVisible();
  await expect(rightCarousel.getByText("2/3")).toBeVisible();
  await leftCarousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(leftCarousel.getByText("3/3")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(leftCarousel.getByText("2/3")).toBeVisible();

  await leftCarousel.getByRole("button", { name: "Use suggestion: What edge cases should I consider?" }).click();
  await expect.poll(() => lastSubmittedText).toBe("What edge cases should I consider?");
});
