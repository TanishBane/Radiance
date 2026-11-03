import { AVAILABLE_MODELS } from "./models";
import { ModelOption } from "@/lib/types/chat";

interface ProviderState {
  exhausted: boolean;
  exhaustedAt: number;
  reason?: string;
}

class CircuitBreaker {
  private states = new Map<string, ProviderState>();
  private readonly cooldownMs = 60 * 1000; // 1 minute cooldown for rate-limited providers

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
  }

  resetAll(): void {
    this.states.clear();
  }

  /**
   * Resolves fallback model candidates in order of preference,
   * skipping providers currently marked as exhausted.
   */
  resolveCandidateModels(preferredModelId: string, needsVision: boolean): ModelOption[] {
    const preferred = AVAILABLE_MODELS.find((m) => m.id === preferredModelId);
    const candidates = [...AVAILABLE_MODELS];

    // If request needs vision, prioritize models supporting vision (e.g. Gemini)
    if (needsVision) {
      candidates.sort((a, b) => (b.supportsVision ? 1 : 0) - (a.supportsVision ? 1 : 0));
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
