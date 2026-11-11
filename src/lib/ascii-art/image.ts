/**
 * Image Piece Engine for static halftone picture scenes with dynamic overlays (shooting stars).
 */
export interface ImageMeta {
  slug: string;
  name: string;
  category: string;
  note: string;
  tags: string[];
  cols: number;
  rows: number;
  fps: number;
  cell?: string;
  look?: string;
  dots?: {
    tone?: {
      gamma?: number;
      floor?: number;
      sat?: number;
    };
  };
  palette: Record<string, string>;
}

export interface ImageData {
  color: string[];
  level: string[];
}

export interface ImagePieceOptions {
  shooting?: boolean;
}

export interface StarryRidgeFrame {
  cols: number;
  rows: number;
  ch: string[];
  co: string[];
  levels: Uint8Array;
  palHex: Record<string, string>;
  shootingStars?: { x: number; y: number; alpha: number }[];
}

export const DOT_LEVELS = " ·:•●■▓█";

interface ShootingStarTrack {
  x0: number;
  y0: number;
  angle: number; // in radians
  speed: number; // cells per second
  period: number; // total repeat cycle in seconds
  phase: number; // start offset in seconds
  duration: number; // duration of visibility in seconds
  length: number; // tail length in cells
}

export function imagePiece(
  meta: ImageMeta,
  data: ImageData,
  options: ImagePieceOptions = {}
) {
  const { cols, rows, palette } = meta;
  const totalCells = cols * rows;

  // Pre-bake static background cells
  const baseCh = new Array<string>(totalCells);
  const baseCo = new Array<string>(totalCells);
  const baseLevels = new Uint8Array(totalCells);

  for (let y = 0; y < rows; y++) {
    const cRow = data.color[y] || "";
    const lRow = data.level[y] || "";
    for (let x = 0; x < cols; x++) {
      const idx = x + y * cols;
      const cKey = cRow[x] || "Z";
      const lChar = lRow[x] || "0";
      const lv = Math.max(0, Math.min(7, parseInt(lChar, 10) || 0));

      baseLevels[idx] = lv;
      baseCh[idx] = DOT_LEVELS[lv] || " ";
      baseCo[idx] = palette[cKey] || "#000000";
    }
  }

  // Shooting stars tracks (active across the upper celestial sky)
  const tracks: ShootingStarTrack[] = [
    { x0: 180, y0: 8, angle: (215 * Math.PI) / 180, speed: 52, period: 4.2, phase: 0.0, duration: 0.85, length: 14 },
    { x0: 120, y0: 3, angle: (210 * Math.PI) / 180, speed: 58, period: 5.6, phase: 2.1, duration: 0.8, length: 16 },
    { x0: 155, y0: 22, angle: (218 * Math.PI) / 180, speed: 46, period: 6.8, phase: 4.0, duration: 0.95, length: 13 },
    { x0: 85, y0: 6, angle: (212 * Math.PI) / 180, speed: 54, period: 6.0, phase: 1.2, duration: 0.82, length: 15 },
    { x0: 190, y0: 32, angle: (216 * Math.PI) / 180, speed: 48, period: 7.5, phase: 5.3, duration: 0.9, length: 12 },
  ];

  return function create() {
    return function render(t: number): StarryRidgeFrame {
      const ch = baseCh.slice();
      const co = baseCo.slice();
      const levels = new Uint8Array(baseLevels);
      const activeStars: { x: number; y: number; alpha: number }[] = [];

      if (options.shooting) {
        for (const tr of tracks) {
          const cycleTime = (t + tr.phase) % tr.period;
          if (cycleTime < tr.duration) {
            const progress = cycleTime / tr.duration;
            const dist = cycleTime * tr.speed;
            const cosA = Math.cos(tr.angle);
            const sinA = Math.sin(tr.angle);

            const hx = tr.x0 + cosA * dist;
            const hy = tr.y0 + sinA * dist;

            const alpha = Math.sin(progress * Math.PI);
            activeStars.push({ x: hx, y: hy, alpha });

            for (let step = 0; step < tr.length; step++) {
              const px = Math.round(hx - cosA * step);
              const py = Math.round(hy - sinA * step);

              if (px >= 0 && px < cols && py >= 0 && py < rows) {
                if (py < 78) {
                  const idx = px + py * cols;
                  if (step === 0) {
                    ch[idx] = "█";
                    co[idx] = "#ffffff";
                    levels[idx] = 7;
                  } else if (step < 3) {
                    ch[idx] = "●";
                    co[idx] = "#ffedce";
                    levels[idx] = 6;
                  } else if (step < 7) {
                    ch[idx] = "•";
                    co[idx] = "#ff9edc";
                    levels[idx] = 4;
                  } else if (step < 11) {
                    ch[idx] = ":";
                    co[idx] = "#d789d5";
                    levels[idx] = 2;
                  } else {
                    ch[idx] = "·";
                    co[idx] = "#8c309b";
                    levels[idx] = 1;
                  }
                }
              }
            }
          }
        }
      }

      return {
        cols,
        rows,
        ch,
        co,
        levels,
        palHex: palette,
        shootingStars: activeStars,
      };
    };
  };
}
