# RADIANCE PLATFORM — EXTERNAL UPTIME & SYNTHETIC MONITORING
**Document ID:** RADIANCE-DOC-OPS-008  
**Provider:** Better Stack Uptime / Pingdom / Cloudflare Health  
**Endpoints:**
- Liveness Probe: `GET /api/health`
- Readiness Probe: `GET /api/health/ready`

---

## 1. DUAL PROBE ARCHITECTURE

To avoid misleading availability signals, Radiance separates process responsiveness from downstream dependency readiness:

```
                  ┌──────────────────────────────────────────────┐
                  │          BETTER STACK UPTIME ENGINE          │
                  └──────────────────────┬───────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         [ Probe 1: Liveness ]                     [ Probe 2: Readiness ]
           GET /api/health                           GET /api/health/ready
                    │                                         │
                    ▼                                         ▼
         - Process running?                        - Supabase configured?
         - Event loop responding?                  - Upstash / cache ready?
         - Memory usage healthy?                   - AI circuit available?
                    │                                         │
                    ▼                                         ▼
            HTTP 200 OK                               HTTP 200 / 503
```

---

## 2. BETTER STACK CONFIGURATION GUIDE

1. Sign in to [Better Stack Uptime](https://betterstack.com/uptime).
2. Click **Create Monitor**.
3. **Monitor 1 (Liveness):**
   - **Name:** `Radiance — Liveness & Core API`
   - **URL:** `https://your-domain.com/api/health`
   - **Interval:** 1 minute.
   - **Alert threshold:** Fail after 2 consecutive checks.
   - **Expected Status:** `200`.
   - **Keyword match:** `"status":"healthy"`.
4. **Monitor 2 (Readiness):**
   - **Name:** `Radiance — Infrastructure Readiness`
   - **URL:** `https://your-domain.com/api/health/ready`
   - **Interval:** 3 minutes.
   - **Alert threshold:** Fail after 2 consecutive checks.
   - **Expected Status:** `200`.
   - **Keyword match:** `"status":"ready"`.
5. **Notification Channels:** Link alerts to Slack (`#radiance-alerts`), Discord, PagerDuty, or Email.

---

## 3. PROBE PRIVACY INVARIANTS

Neither `/api/health` nor `/api/health/ready` leaks API keys, database connection strings, or system environment secrets. Public monitors receive high-level status booleans and categorical strings only.
