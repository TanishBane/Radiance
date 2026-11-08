# AI Orchestration & Streaming Pipeline

This document details the multi-provider routing, streaming protocols, token buffering, and resilience mechanisms powering **RADIANCE**.

---

## 1. Multi-Provider Registry

Radiance abstracts multiple frontier inference providers through the **Vercel AI SDK**, offering a unified model registry defined in `src/lib/ai/models.ts`:

| Model ID | Provider | Underlying Model | Context Window | Capabilities |
|:---|:---|:---|:---|:---|
| `groq-fast` | Groq | `llama-3.3-70b-versatile` | 128k | Extreme TTFT, deep reasoning, coding |
| `groq-instant`| Groq | `llama-3.1-8b-instant` | 128k | Instant conversational feedback |
| `gemini-quality` | Google | `gemini-2.5-flash` | 1,000k | Massive context window, multimodal vision |
| `gemini-pro` | Google | `gemini-1.5-pro` | 2,000k | Deep analytical reasoning |
| `openrouter-reasoning`| OpenRouter | Multi-model routing | 128k | Specialized chain-of-thought routing |

---

## 2. Server-Sent Events (SSE) Stream Lifecycle

```
[User Submits Prompt]
       │
       ▼
[useChatStream.send()]
       │
       ▼ POST /api/chat
[Rate Limiter Token Check] ──(Exceeded)──> HTTP 429 Error Card
       │ (Allowed)
       ▼
[Provider Model Selection]
       │
       ▼
[Vercel AI SDK StreamText]
       │
       ▼ Server-Sent Events (SSE) Chunks
[Cross-Chunk Line Buffer (useChatStream.ts)]
       │
       ▼ Progressive Markdown Parsing (format.ts)
[Active Message Update (ChatWorkspace)]
       │
       ▼ (User Clicks Stop Button)
[AbortController.abort()]
       │
       ▼
[Partial Token Retention (Feature 18)]
       │
       ▼
[Assistant Message Persisted to Storage]
```

### Key Streaming Invariants
1. **Persistent Line Buffering:** SSE chunks can split words, JSON lines, or markdown delimiters across network packets. `useChatStream.ts` maintains an internal buffer that splits on line boundaries (`\n`) and preserves trailing partial lines until the next chunk arrives.
2. **Partial Token Retention (Feature 18):** When a user clicks the Stop button, the active HTTP stream is aborted via `AbortController`, but all tokens already received are preserved and committed as an assistant message in the conversation history rather than discarded.
3. **Stream Deduplication:** Ref guards and IME composition event checks prevent rapid duplicate submissions.
