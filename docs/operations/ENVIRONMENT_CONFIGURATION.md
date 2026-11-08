# RADIANCE PLATFORM — ENVIRONMENT CONFIGURATION MANUAL
**Document ID:** RADIANCE-DOC-OPS-014  
**Template File:** `.env.example`  

---

## 1. ENVIRONMENT VARIABLES INVENTORY & USAGE

| Variable Name | Required | Target Runtime | Purpose | Safe Example Format |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Optional | Client & Server | Canonical application base URL | `http://localhost:3000` / `https://radiance.ai` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Client & Server | Supabase Project API URL | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Client & Server | Public anonymous API key (protected by RLS) | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server Only | Administrative backend bypass key (NEVER expose to client) | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `GROQ_API_KEY` | **Yes** (Primary) | Server Only | High-throughput Llama inference key | `gsk_your_groq_api_key_here` |
| `GEMINI_API_KEY` | **Yes** (Multimodal)| Server Only | Google Gemini 2.0 Flash multimodal key | `AIzaSy_your_gemini_api_key_here` |
| `OPENROUTER_API_KEY` | Optional | Server Only | OpenRouter inference failover key | `sk-or-v1-your_openrouter_api_key` |
| `UPSTASH_REDIS_REST_URL` | Optional | Server Only | Upstash Redis REST URL for distributed rate limits | `https://your-redis.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Server Only | Upstash Redis REST bearer token | `AZ...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Client & Server | Sentry ingest DSN for error telemetry | `https://abc@o123.ingest.sentry.io/456` |
| `SENTRY_DSN` | Optional | Server Only | Server-side Sentry DSN override | `https://abc@o123.ingest.sentry.io/456` |
| `SENTRY_ORG` | Optional | Build / CI | Sentry organization slug | `radiance-ai` |
| `SENTRY_PROJECT` | Optional | Build / CI | Sentry project name | `radiance-web` |
| `SENTRY_AUTH_TOKEN` | Optional | Build / CI | Source map upload authorization token | `sntrys_...` |

---

## 2. LOCAL SETUP INSTRUCTIONS

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate required AI keys (`GROQ_API_KEY`, `GEMINI_API_KEY`).
3. If Supabase keys are omitted, Radiance automatically operates in offline local storage fallback mode without errors.
4. If Upstash Redis keys are omitted, Radiance falls back to an in-memory token-bucket rate limiter.
5. If Sentry DSN is omitted, error telemetry is captured in structured console output only.
