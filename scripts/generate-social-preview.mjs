import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function generateSocialPreview() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 640 },
    deviceScaleFactor: 2,
  });

  const symbolSvgPath = path.resolve(process.cwd(), "public/brand/radiance-symbol.svg");
  const symbolSvgContent = fs.readFileSync(symbolSvgPath, "utf8");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 640px;
      overflow: hidden;
      background: #06050a;
      color: #f3f1ec;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .ambient-glow {
      position: absolute;
      width: 900px;
      height: 500px;
      background: radial-gradient(ellipse at 50% 40%, rgba(124, 92, 255, 0.32) 0%, rgba(192, 132, 252, 0.15) 35%, rgba(12, 11, 20, 0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .specular-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 80%);
      pointer-events: none;
    }
    .card-border {
      position: absolute;
      inset: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      pointer-events: none;
      box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                  0 24px 64px -12px rgba(0, 0, 0, 0.8);
    }
    .content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 18px;
      padding: 40px;
    }
    .logo-gem {
      width: 92px;
      height: 92px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 12px 32px -4px rgba(124, 92, 255, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      color: #bfa7ff;
    }
    .logo-gem svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 8px rgba(124, 92, 255, 0.6));
    }
    .brand-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 64px;
      font-weight: 700;
      letter-spacing: 0.16em;
      line-height: 1;
      text-transform: uppercase;
      background: linear-gradient(135deg, #ffffff 0%, #d8c7ff 40%, #7c5cff 80%, #e27aff 100%);
      -webkit-background-clip: text;
      -webkit-fill-color: transparent;
      color: transparent;
      margin-top: 6px;
    }
    .tagline {
      font-size: 20px;
      font-weight: 500;
      color: rgba(243, 241, 236, 0.90);
      letter-spacing: 0.02em;
    }
    .tagline span {
      color: #bfa7ff;
      font-weight: 600;
    }
    .description {
      font-size: 15px;
      color: rgba(243, 241, 236, 0.60);
      max-width: 680px;
      line-height: 1.5;
    }
    .pill-row {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.10);
      color: rgba(243, 241, 236, 0.80);
      letter-spacing: 0.04em;
    }
    .pill-accent {
      background: rgba(124, 92, 255, 0.15);
      border-color: rgba(124, 92, 255, 0.35);
      color: #bfa7ff;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="specular-grid"></div>
  <div class="card-border"></div>
  <div class="content">
    <div class="logo-gem">
      ${symbolSvgContent}
    </div>
    <h1 class="brand-title">RADIANCE</h1>
    <div class="tagline">Illuminate what is possible. <span>High-Precision AI Platform.</span></div>
    <p class="description">
      Multi-provider LLM orchestration, real-time reasoning streams, responsive touch design, and atmospheric spatial computing.
    </p>
    <div class="pill-row">
      <span class="pill pill-accent">Next.js 15</span>
      <span class="pill pill-accent">React 19</span>
      <span class="pill">TypeScript</span>
      <span class="pill">Tailwind CSS v4</span>
      <span class="pill">Groq Llama 3.3</span>
      <span class="pill">Gemini 2.5</span>
      <span class="pill">Supabase</span>
      <span class="pill">Three.js</span>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  const outPath = path.resolve(process.cwd(), "docs/assets/radiance-social-preview.png");
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log("Generated social preview at:", outPath);
}

generateSocialPreview().catch(console.error);
