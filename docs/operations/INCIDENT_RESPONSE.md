# RADIANCE PLATFORM — INCIDENT RESPONSE & RUNBOOKS
**Document ID:** RADIANCE-DOC-OPS-013  
**Audience:** Site Reliability Engineers (SRE), On-Call Engineers  

---

## 1. INCIDENT WORKFLOW LIFECYCLE

```
[ TRIGGER ] ──> Alert fires from Better Stack / Sentry / GitHub Security
      │
      ▼
[ TRIAGE ] ───> SRE on-call acknowledges within SLA (P0: 15m, P1: 1h)
      │
      ▼
[ DIAGNOSE ] ─> Inspect Health Probes (/api/health, /api/health/ready)
                Inspect Sentry issues & correlation IDs (x-request-id)
                Inspect Supabase Postgres connection pool & logs
      │
      ▼
[ MITIGATE ] ─> Execute corresponding runbook (Failover, Key Rotation, Cache Bypass)
      │
      ▼
[ RESOLVE ] ──> Verify recovery across Better Stack and test suites
      │
      ▼
[ POST-MORTEM ] Record timeline, root cause, and preventative action in .antigravity/
```

---

## 2. STANDARD INCIDENT RUNBOOKS

### Runbook A: All AI Providers Exhausted (HTTP 503 on `/api/chat`)
1. **Symptom:** `/api/health/ready` returns 503 with `"aiProviders":{"status":"exhausted"}`.
2. **Diagnosis:** Check provider API quotas in:
   - Groq Console (Rate limits / token thresholds).
   - Google Cloud Console / Gemini API Quotas.
   - OpenRouter Dashboard (Credits balance).
3. **Mitigation:**
   - Add backup credits or rotate depleted API keys in Vercel Environment Variables.
   - Circuit breaker auto-recovers after failure window expires, or trigger cold restart by redeploying current commit.

### Runbook B: High Database Latency or Connection Saturation
1. **Symptom:** API requests slow (> 2,000ms TTFT), database errors in Sentry.
2. **Diagnosis:** Inspect Supabase Dashboard > Database > Connection Pooling.
3. **Mitigation:**
   - Confirm application connects via Supavisor Transaction Pooler (`pooler.supabase.com:6543`), not Direct Session (`:5432`).
   - Terminate hanging idle queries using Supabase SQL editor:
     ```sql
     SELECT pg_terminate_backend(pid) 
     FROM pg_stat_activity 
     WHERE state = 'idle in transaction' 
       AND state_change < NOW() - INTERVAL '5 minutes';
     ```

### Runbook C: Exposed Credential Incident
1. **Symptom:** Gitleaks or GitHub Push Protection alerts on committed API key.
2. **Mitigation:** Follow 6-step protocol in `GITHUB_SECURITY.md`:
   - Revoke immediately at vendor dashboard.
   - Generate replacement key.
   - Update Vercel environment variables.
   - Clean Git history if needed.
