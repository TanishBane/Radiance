import { chromium } from "@playwright/test";

async function measureRoute(browser, urlPath, interactionFn) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Track network resources
  const resources = [];
  page.on("response", async (response) => {
    try {
      const req = response.request();
      const status = response.status();
      const url = response.url();
      const resourceType = req.resourceType();
      const headers = response.headers();
      const contentLength = headers["content-length"] ? parseInt(headers["content-length"], 10) : 0;
      let bodySize = contentLength;
      if (!bodySize) {
        try {
          const body = await response.body();
          bodySize = body.length;
        } catch {}
      }
      resources.push({
        url,
        resourceType,
        status,
        size: bodySize,
      });
    } catch {}
  });

  // Inject performance observer setup before page loads
  await page.addInitScript(() => {
    window.__perfMetrics = {
      lcp: 0,
      lcpElement: "",
      cls: 0,
      longTasks: [],
      tbt: 0,
      fcp: 0,
      fp: 0,
      inp: 0,
      interactions: [],
    };

    // LCP
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          window.__perfMetrics.lcp = lastEntry.startTime;
          window.__perfMetrics.lcpElement = lastEntry.element ? (lastEntry.element.tagName + (lastEntry.element.className ? "." + lastEntry.element.className.slice(0, 30) : "")) : "none";
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {}

    // CLS
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perfMetrics.cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch (e) {}

    // Long Tasks (TBT)
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__perfMetrics.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
          });
          if (entry.duration > 50) {
            window.__perfMetrics.tbt += (entry.duration - 50);
          }
        }
      }).observe({ type: "longtask", buffered: true });
    } catch (e) {}

    // Event Timing / INP
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > window.__perfMetrics.inp) {
            window.__perfMetrics.inp = entry.duration;
          }
          window.__perfMetrics.interactions.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }).observe({ type: "event", durationThreshold: 16, buffered: true });
    } catch (e) {}
  });

  const fullUrl = `http://localhost:3000${urlPath}`;
  const startTime = Date.now();
  await page.goto(fullUrl, { waitUntil: "networkidle" });
  // Allow animations and starfield warmup
  await page.waitForTimeout(3000);

  if (interactionFn) {
    await interactionFn(page);
    await page.waitForTimeout(1000);
  }

  const timingData = await page.evaluate(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const nav = navEntries.length > 0 ? navEntries[0] : null;
    const paintEntries = performance.getEntriesByType("paint");
    let fp = 0, fcp = 0;
    for (const p of paintEntries) {
      if (p.name === "first-paint") fp = p.startTime;
      if (p.name === "first-contentful-paint") fcp = p.startTime;
    }

    let ttfb = 0;
    let domLoad = 0;
    let windowLoad = 0;
    if (nav) {
      ttfb = nav.responseStart - nav.requestStart;
      domLoad = nav.domContentLoadedEventEnd - nav.startTime;
      windowLoad = nav.loadEventEnd - nav.startTime;
    }

    return {
      ttfb,
      fp,
      fcp,
      domLoad,
      windowLoad,
      customMetrics: window.__perfMetrics,
    };
  });

  await context.close();

  // Aggregate resource weights
  const weightsByType = {};
  let totalTransfer = 0;
  for (const r of resources) {
    const type = r.resourceType || "other";
    weightsByType[type] = (weightsByType[type] || 0) + (r.size || 0);
    totalTransfer += (r.size || 0);
  }

  return {
    urlPath,
    ...timingData,
    resourceSummary: {
      count: resources.length,
      totalBytes: totalTransfer,
      totalKb: (totalTransfer / 1024).toFixed(1),
      byType: Object.fromEntries(
        Object.entries(weightsByType).map(([k, v]) => [k, `${(v / 1024).toFixed(1)} kB`])
      ),
    },
  };
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  console.log("Measuring / (Landing Page)...");
  const landingMetrics = await measureRoute(browser, "/", async (page) => {
    // Scroll down and click interactive preview pills
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
    const conciseBtn = page.locator("button:has-text('Concise')").first();
    if (await conciseBtn.isVisible()) {
      await conciseBtn.click();
    }
  });

  console.log("Measuring /chat (Chat Application)...");
  const chatMetrics = await measureRoute(browser, "/chat", async (page) => {
    // Click composer and type a character to measure input responsiveness
    const composer = page.locator("textarea").first();
    if (await composer.isVisible()) {
      await composer.click();
      await composer.fill("Hello");
    }
  });

  await browser.close();

  console.log("\n=======================================================");
  console.log("EMPIRICAL PERFORMANCE & CORE WEB VITALS REPORT");
  console.log("=======================================================\n");

  console.log(JSON.stringify({ landing: landingMetrics, chat: chatMetrics }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
