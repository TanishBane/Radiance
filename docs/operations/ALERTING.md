# RADIANCE PLATFORM — ALERTING RULES & NOTIFICATION MATRIX
**Document ID:** RADIANCE-DOC-OPS-012  
**Integration Scope:** Sentry, Better Stack, GitHub Security, Supabase  

---

## 1. ALERT DEFINITION TIERS

Alerts are organized into three severity tiers to eliminate alert fatigue and ensure rapid resolution of genuine outages:

| Severity | Definition | Response SLA | Notification Channels |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Core website down, all AI providers failing (HTTP 503 on `/api/health/ready`), or exposed credential detected. | **< 15 minutes** | PagerDuty / SMS, `#radiance-critical-alerts` |
| **P1 (High)** | Single AI provider rate limited, Sentry error rate > 5% of requests, or Supabase connection saturation > 85%. | **< 1 hour** | Slack `#radiance-alerts`, Email |
| **P2 (Moderate)** | Core Web Vitals degradation (LCP > 3.5s), Dependabot security alert (High/Critical), or bundle size warning. | **< 24 hours** | GitHub Issue, Weekly Ops Digest |

---

## 2. ALERT CONFIGURATION SPECIFICATIONS

### Sentry Alert Rules (sentry.io)
1. **Uncaught Route Handler Crash:**
   - **Condition:** Number of events in `/api/chat` or `/api/image` > 10 in 1 minute.
   - **Action:** Send alert to Slack `#radiance-alerts`.
2. **Provider Failover Spike:**
   - **Condition:** Tag `errorCategory:rate_limit_429` exceeds 20 in 5 minutes.
   - **Action:** Notify SRE on-call to evaluate provider quota or key limits.

### Better Stack Uptime Rules
1. **Liveness Failure:**
   - **Condition:** `/api/health` returns non-200 for 2 consecutive checks (2 minutes).
   - **Action:** P0 escalation to SRE team.
2. **Readiness Degradation:**
   - **Condition:** `/api/health/ready` returns 503 for 3 consecutive checks.
   - **Action:** P1 alert (indicates all AI providers or database unreachable).

### GitHub Security Alerts
1. **Secret Scanning Push Protection:**
   - Blocks push if high-entropy API key is committed.
2. **Dependabot Critical Vulnerability:**
   - Automated PR opened with label `devsecops` and notification to repository admins.
