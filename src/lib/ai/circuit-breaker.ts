import { AVAILABLE_MODELS } from "./models";
import { ModelOption } from "@/lib/types/chat";

interface ProviderState {
  exhausted: boolean;
  exhaustedAt: number;
  reason?: string;
}

interface FailureWindow {
  count: number;
  windowStart: number;
}

class CircuitBreaker {
  private states = new Map<string, ProviderState>();
  private failureWindows = new Map<string, FailureWindow>();
  private readonly cooldownMs = 60 * 1000; // 1 minute cooldown for rate-limited providers
  private readonly failureThreshold = 3; // Minimum 3 consecutive failures to trip
  private readonly failureWindowMs = 30 * 1000; // 30-second rolling window

  isExhausted(provider: string): boolean {
    const state = this.states.get(provider);
    if (!state || !state.exhausted) return false;

    // Check if cooldown elapsed
    if (Date.now() - state.exhaustedAt > this.cooldownMs) {
      this.states.delete(provider);
      return false;
    }
    return true;
  }

  markExhausted(provider: string, reason?: string): void {
    this.states.set(provider, {
      exhausted: true,
      exhaustedAt: Date.now(),
      reason,
    });
    this.failureWindows.delete(provider);
  }

  /**
   * Records a provider failure. Only trips the circuit breaker after
   * failureThreshold failures within failureWindowMs to prevent single-request
   * Denial of Service poisoning across all tenants (SEC-03).
   * Returns true if the circuit breaker was tripped.
   */
  recordFailure(provider: string, reason?: string, fatal = false): boolean {
    const now = Date.now();
    if (fatal) {
      this.markExhausted(provider, reason);
      return true;
    }

    const window = this.failureWindows.get(provider);
    if (!window || now - window.windowStart > this.failureWindowMs) {
      this.failureWindows.set(provider, { count: 1, windowStart: now });
      return false;
    }

    window.count++;
    if (window.count >= this.failureThreshold) {
      this.markExhausted(provider, reason || `Exhausted after ${window.count} failures`);
      return true;
    }

    return false;
  }

  resetAll(): void {
    this.states.clear();
    this.failureWindows.clear();
  }

  /**
   * Resolves fallback model candidates in order of preference,
   * skipping providers currently marked as exhausted.
   */
  resolveCandidateModels(preferredModelId: string, needsVision: boolean): ModelOption[] {
    const preferred = AVAILABLE_MODELS.find((m) => m.id === preferredModelId);
    let candidates = [...AVAILABLE_MODELS];

    // If request needs vision, strictly restrict to models supporting vision (e.g. Gemini)
    if (needsVision) {
      candidates = candidates.filter((m) => Boolean(m.supportsVision));
      if (preferred && preferred.supportsVision) {
        const idx = candidates.findIndex((m) => m.id === preferred.id);
        if (idx > -1) {
          candidates.splice(idx, 1);
          candidates.unshift(preferred);
        }
      }
    } else if (preferred) {
      // Put preferred model first
      const idx = candidates.findIndex((m) => m.id === preferred.id);
      if (idx > -1) {
        candidates.splice(idx, 1);
        candidates.unshift(preferred);
      }
    }

    return candidates.filter((m) => !this.isExhausted(m.provider));
  }
}

export const circuitBreaker = new CircuitBreaker();
