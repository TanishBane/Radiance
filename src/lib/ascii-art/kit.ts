/**
 * ASCII Art & Textmode Generative Canvas Toolkit
 * Core primitives for procedural grids, coherent noise, gradients, and palettes.
 */

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function toHex(r: number, g: number, b: number): string {
  const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${clampByte(r)}${clampByte(g)}${clampByte(b)}`;
}

/**
 * Interpolates `count` hex colors evenly across an array of color stops.
 */
export function gradient(stops: string[], count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [stops[0]];
  const parsed = stops.map(parseHex);
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const pos = t * (parsed.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;

    if (idx >= parsed.length - 1) {
      const last = parsed[parsed.length - 1];
      result.push(toHex(last[0], last[1], last[2]));
    } else {
      const c1 = parsed[idx];
      const c2 = parsed[idx + 1];
      const r = c1[0] + (c2[0] - c1[0]) * frac;
      const g = c1[1] + (c2[1] - c1[1]) * frac;
      const b = c1[2] + (c2[2] - c1[2]) * frac;
      result.push(toHex(r, g, b));
    }
  }

  return result;
}

/**
 * Clamps value between min and max (defaults to 0 and 1).
 */
export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Linear interpolation between a and b by factor t.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Fast, deterministic pseudo-random number generator (Mulberry32).
 */
export function rng(seed: number = 1): () => number {
  let s = (seed | 0) || 1;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * 2D coherent value noise with quintic Hermite interpolation.
 * Strictly bounded in range [0, 1].
 */
export function noise2(x: number, y: number, seed: number = 0): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const fx = x - x0;
  const fy = y - y0;

  // Quintic smoothstep: 6t^5 - 15t^4 + 10t^3
  const sx = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const sy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

  const n00 = hash2D(x0, y0, seed);
  const n10 = hash2D(x1, y0, seed);
  const n01 = hash2D(x0, y1, seed);
  const n11 = hash2D(x1, y1, seed);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);

  return nx0 + sy * (nx1 - nx0);
}

/**
 * Fractal Brownian Motion summing coherent noise octaves in range [0, 1].
 */
export function fbm(x: number, y: number, octaves: number = 2, seed: number = 0): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  let maxAmp = 0;

  for (let i = 0; i < octaves; i++) {
    val += amp * noise2(x * freq, y * freq, seed + i * 37);
    maxAmp += amp;
    freq *= 2.0;
    amp *= 0.5;
  }

  return maxAmp > 0 ? val / maxAmp : 0;
}

/**
 * Master palette keys mapping integer indices to unique token identifiers.
 */
export const KEYS: number[] = Array.from({ length: 512 }, (_, i) => i);

/**
 * Returns a cloned array of palette colors.
 */
export function palette(colors: string[]): string[] {
  return [...colors];
}

export interface GridFrame {
  ch: string[];
  co: number[];
  cols: number;
  rows: number;
}

/**
 * 2D Character and Color Buffer for textmode generative animations.
 */
export class Grid {
  cols: number;
  rows: number;
  ch: string[];
  co: number[];

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.ch = new Array(cols * rows).fill(" ");
    this.co = new Array(cols * rows).fill(0);
  }

  clear(): void {
    this.ch.fill(" ");
    this.co.fill(0);
  }

  set(x: number, y: number, char: string, colorKey: number): void {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      const idx = x + y * this.cols;
      this.ch[idx] = char;
      this.co[idx] = colorKey;
    }
  }

  frame(): GridFrame {
    return {
      ch: this.ch,
      co: this.co,
      cols: this.cols,
      rows: this.rows,
    };
  }
}
