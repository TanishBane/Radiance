# Multi-Model Registry & Intelligence Routing

This document details the frontier AI model registry, capability matrix, fallback orchestration, and dynamic capability resolution within Radiance.

---

## 1. Frontier Model Matrix

Radiance integrates multi-provider inference via unified Vercel AI SDK adapters, allowing users to toggle seamlessly between ultra-fast LPU inference and massive-context reasoning engines.

| Model ID | Display Name | Provider | Upstream Model | Context Window | Vision | PDF Analysis | Tier |
|:---|:---|:---|:---|:---|:---:|:---:|:---|
| `groq-fast` | Radiance Fast | Groq | `llama-3.3-70b-versatile` | 128k (131,072) | No | No | Standard |
| `groq-instant` | Radiance Instant | Groq | `llama-3.1-8b-instant` | 128k (131,072) | No | No | Free |
| `gemini-quality` | Radiance Multimodal | Google Gemini | `gemini-2.5-flash` | 1M (1,048,576) | Yes | Yes | Standard |
| `gemini-pro` | Radiance Pro Reasoning | Google Gemini | `gemini-2.5-pro` | 1M (1,048,576) | Yes | Yes | Paid |
| `openrouter-reasoning` | Radiance OpenWeights | OpenRouter | `meta-llama/llama-3.3-70b-instruct` | 128k (131,072) | No | No | Standard |

---

## 2. Dynamic Capability Resolution

When a user attaches an image or PDF document to the composer:
1. The client-side capability resolver (`resolveCapabilityModel`) checks if the currently active model supports multimodal attachments.
2. If the user's selected model does not support vision or document analysis (such as `groq-fast`), the engine automatically routes the request to a multimodal candidate (`gemini-quality`) or prompts the user with an intelligent banner.
3. This eliminates cryptic provider runtime errors and ensures high-quality document analysis.

```typescript
export function resolveCapabilityModel(
  preferredId: string,
  hasMultimodal: boolean
): ModelOption {
  const preferred = getModelById(preferredId);
  if (hasMultimodal && !preferred.supportsVision && !preferred.supportsPdf) {
    const multimodalCandidate = AVAILABLE_MODELS.find(
      (m) => m.supportsVision && m.status === "active"
    );
    if (multimodalCandidate) return multimodalCandidate;
  }
  return preferred;
}
```

---

## 3. Circuit Breaker & Fallback Architecture

To protect availability under upstream rate-limits or transient outages:
- **Provider Circuit Breaker:** Consecutive provider 5xx or 429 errors trip the provider circuit breaker, temporarily diverting inference requests to healthy secondary providers (e.g., Groq -> OpenRouter).
- **Graceful Error Recovery:** If all upstream models encounter quota exhaustion or connectivity loss, an actionable in-message error card is surfaced with a single-click **Retry** button that re-evaluates provider health.

---

## 4. Model Selector Interface

- **Keyboard Accessible Popover:** Built with full ARIA `role="listbox"` and `role="option"` semantics.
- **Roving Focus & Keyboard Navigation:** Arrow keys (`ArrowUp`, `ArrowDown`) navigate options, `Enter` selects, and `Escape` dismisses.
- **Visual Badges:** Shows context window size, multimodal indicators, and provider badges.
