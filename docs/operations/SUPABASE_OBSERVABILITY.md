# RADIANCE PLATFORM — SUPABASE & POSTGRESQL OBSERVABILITY
**Document ID:** RADIANCE-DOC-OPS-009  
**Target:** Supabase PostgreSQL 15+  
**Schema File:** `supabase/migrations/20261101_001_initial_schema.sql`  
**Reference:** [Supabase Observability Guide](https://supabase.com/docs/guides/observability)

---

## 1. POSTGRESQL METRICS & DASHBOARD INSPECTION

Supabase provides built-in observability in the Supabase Dashboard:

1. **Database Connections & Pooling:**
   - **Metric:** Active connections vs Pool Size.
   - **Dashboard:** **Database** > **Connection Pooling** (Supavisor).
   - **Alert Threshold:** Warning when connections exceed 80% of max pool limit.
2. **Slow Queries (`pg_stat_statements`):**
   - **Dashboard:** **Reports** > **Query Performance**.
   - Inspect queries with `total_time` or `mean_exec_time` exceeding 250ms.
   - Verify index utilization on foreign keys:
     - `idx_conversations_user_updated`: `(user_id, updated_at DESC)`
     - `idx_messages_conversation_created`: `(conversation_id, created_at ASC)`
     - `idx_attachments_user`: `(user_id)`
3. **Database Disk I/O & Storage Utilization:**
   - **Dashboard:** **Settings** > **Database** > **Disk Usage**.
   - Track table bloat and VACUUM activity on `public.messages` and `public.conversations`.

---

## 2. ROW LEVEL SECURITY (RLS) & AUDITING

All tables in the Radiance schema have Row Level Security enabled:
- `public.profiles`: Restricted to `auth.uid() = id`.
- `public.conversations`: Restricted to `auth.uid() = user_id`.
- `public.messages`: Restricted to `auth.uid() = user_id`.
- `public.attachments`: Restricted to `auth.uid() = user_id`.
- `public.usage_events`: Insertable by server, selectable only by `auth.uid() = user_id`.

### Inspecting RLS Violations & Auth Logs
1. Navigate to **Logs** > **Auth Logs** to detect brute-force token refresh attempts or invalid refresh tokens.
2. Navigate to **Logs** > **Postgres Logs** and filter by `FATAL` or `ERROR: permission denied for table` to inspect unauthorized cross-tenant query attempts.

---

## 3. SUPABASE ADVISORS

- **Security Advisor:** Run regularly under **Database** > **Security Advisor** to check for unindexed foreign keys, public schema exposure, or missing RLS policies.
- **Performance Advisor:** Reviews slow sequential scans and recommends compound index creations.
