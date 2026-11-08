# Environment Configuration Guide

Radiance uses environment variables to configure AI model providers, database persistence, rate limiting, and observability instrumentation.

All secrets must be stored in `.env.local` for local development. **Never commit `.env.local` to version control.**

---

## 1. Environment Variable Reference

### Application Core
| Variable | Description | Required / Optional | Default |
|:---|:---|:---|:---|
| `NEXT_PUBLIC_APP_URL` | Base URL of the deployed application (used for canonical SEO and metadata). | Optional | `http://localhost:3000` |

### AI Model Providers (Server-Side Only)
At least one provider key is required to stream inference responses.
| Variable | Description | Provider |
|:---|:---|:---|
| `GROQ_API_KEY` | API key from [Groq Console](https://console.groq.com) for ultra-low latency Llama 3.3 and 3.1 inference. | Groq |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com) for Gemini 2.5 Flash and Pro. | Google Gemini |
| `OPENROUTER_API_KEY` | API key from [OpenRouter](https://openrouter.ai) for multi-model reasoning routing. | OpenRouter |

### Supabase (Database, Auth, Persistent Storage)
| Variable | Description | Scope |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project REST endpoint. | Public (Client & Server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key. | Public (Client & Server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated service role key (used for server-side administrative actions). | Server-Only |

*Note: If Supabase credentials are omitted, Radiance automatically falls back to client-side localStorage persistence.*

### Rate Limiting & Cache (Upstash Redis)
| Variable | Description | Scope |
|:---|:---|:---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for distributed sliding-window rate limiting. | Server-Only |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST bearer token. | Server-Only |

*Note: If Upstash is omitted, Radiance utilizes an in-memory sliding-window token bucket limiter.*

### Application Monitoring (Sentry)
| Variable | Description | Scope |
|:---|:---|:---|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client DSN for browser error reporting. | Public (Client) |
| `SENTRY_DSN` | Sentry server DSN override. | Server-Only |
| `SENTRY_ORG` | Sentry organization identifier for build-time sourcemap uploads. | Build-Only |
| `SENTRY_PROJECT` | Sentry project identifier for build-time sourcemap uploads. | Build-Only |
| `SENTRY_AUTH_TOKEN` | Sentry CI upload token. | Build-Only |

---

## 2. Safe Local Development Template

A complete, sanitised template is provided in the root directory:
- [`.env.example`](../../.env.example)
