# RADIANCE PLATFORM — VERCEL WEB ANALYTICS
**Document ID:** RADIANCE-DOC-OPS-007  
**Package:** `@vercel/analytics`  
**Layout Component:** `src/app/layout.tsx` (`<Analytics />`)  
**Reference:** [Vercel Web Analytics Documentation](https://vercel.com/docs/analytics)

---

## 1. PRIVACY-FIRST TRAFFIC TRACKING

Vercel Web Analytics provides zero-cookie, GDPR-compliant audience metrics:
- **Page Views:** Total views per route.
- **Unique Visitors:** Hash-based de-duplicated daily visitors without persistent tracking cookies.
- **Referrers:** Attribution from search engines, direct links, and documentation.
- **Geographic Distribution:** Country and city-level anonymized location telemetry.
- **Operating Systems & Browsers:** High-level platform distribution (macOS, Windows, iOS, Android).

---

## 2. PRIVACY SAFEGUARDS

> [!IMPORTANT]
> Radiance never tracks prompt texts, user queries, document contents, or model responses as custom analytics events.

All event metrics are restricted to route navigation and high-level interaction milestones.

---

## 3. CSP & INTEGRATION

- Component placed inside `<body>` in `src/app/layout.tsx`.
- CSP configured in `next.config.ts`:
  - `script-src`: allows `https://va.vercel-scripts.com`.
  - `connect-src`: allows `https://va.vercel-scripts.com`.
- Automatically connects to the host Vercel project when deployed.
