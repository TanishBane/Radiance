# RADIANCE PLATFORM — VERCEL SPEED INSIGHTS (CORE WEB VITALS)
**Document ID:** RADIANCE-DOC-OPS-006  
**Package:** `@vercel/speed-insights`  
**Layout Component:** `src/app/layout.tsx` (`<SpeedInsights />`)  
**Reference:** [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)

---

## 1. CORE WEB VITALS MEASUREMENT

Speed Insights tracks real-user performance across production sessions:

1. **LCP (Largest Contentful Paint):**
   Measures perceived loading speed when main content (e.g., chat composer and welcome cards) finishes rendering. Target: `< 2.5s`.
2. **INP (Interaction to Next Paint):**
   Measures responsiveness when users click models, submit prompts, or open drawers. Target: `< 200ms`.
3. **CLS (Cumulative Layout Shift):**
   Measures visual stability during dynamic theme loading and streaming markdown expansion. Target: `< 0.1`.
4. **TTFB (Time to First Byte):**
   Measures edge routing and initial server response time. Target: `< 800ms`.
5. **FCP (First Contentful Paint):**
   Measures initial layout paint time. Target: `< 1.8s`.

---

## 2. CSP & ARCHITECTURAL INTEGRATION

- Integrated directly into root `RootLayout` in `src/app/layout.tsx`.
- CSP in `next.config.ts` includes `https://vitals.vercel-insights.com` in `connect-src`.
- Automatically active in production deployments on Vercel without requiring manual tokens.

---

## 3. DASHBOARD VERIFICATION IN VERCEL

1. Navigate to the Radiance project dashboard on [Vercel](https://vercel.com).
2. Click **Speed Insights** in the top navigation tab.
3. If not already active, click **Enable Speed Insights**.
4. Real-user performance scores are aggregated and segmented by route (`/`, `/api/chat`), device type (Mobile vs Desktop), and geographic region.
