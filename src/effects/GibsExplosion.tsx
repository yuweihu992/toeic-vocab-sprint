import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * GibsExplosion — DOOM-style dismemberment. Spawns N pixel-art chunks that
 * fly outward (with upward bias), spin while flying, get dragged down by
 * gravity, leave a trail of blood droplets, then splat-fade leaving a small
 * ground splotch.
 *
 * Each chunk is a tiny pre-defined SVG pixel pattern (head/torso/arm/limb)
 * tinted with the provided body color plus a darker shadow ramp. Blood is
 * always red.
 *
 * Implementation: chunk trajectories (angle, speed, rotation, shape) are
 * pre-computed on mount via useMemo; each chunk renders as an absolutely
 * positioned div with inline CSS variables consumed by a single keyframe.
 *
 * Reduced motion: render nothing, fire onComplete.
 */

export interface GibsExplosionProps {
  x: number;
  y: number;
  color?: string;
  count?: number;
  size?: number;
  duration?: number;
  onComplete?: () => void;
}

const STYLE_ELEMENT_ID = '__toeic_gibs_explosion_keyframes__';
const DEFAULT_COLOR = '#86efac';
const DEFAULT_COUNT = 7;
const DEFAULT_SIZE = 14;
const DEFAULT_DURATION = 1200;
const Z_INDEX = 9999;

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // --dx, --dy: the displacement at the apex of the arc (scaled from
  // angle*speed). --gravity: extra downward pull added at the end.
  // --rotEnd: total rotation degrees by end. The arc is approximated by a
  // 3-key curve: lift to apex then drop to landing.
  // The trail droplet keyframe just fades a small static dot.
  // The ground splotch grows briefly then fades over the last 30% of life.
  style.textContent = `
@keyframes toeic-gib-fly {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  45% {
    transform: translate3d(calc(var(--dx, 0px) * 0.7), calc(var(--dy, 0px) * 0.85), 0) rotate(calc(var(--rotEnd, 360deg) * 0.55)) scale(1);
    opacity: 1;
  }
  80% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 80px) * 0.65), 0) rotate(calc(var(--rotEnd, 360deg) * 0.9)) scale(1);
    opacity: 1;
  }
  92% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 80px)), 0) rotate(var(--rotEnd, 360deg)) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 80px)), 0) rotate(var(--rotEnd, 360deg)) scale(0.85);
    opacity: 0;
  }
}
@keyframes toeic-gib-trail {
  0%   { opacity: 0;   transform: scale(0.6); }
  20%  { opacity: 0.9; transform: scale(1);   }
  100% { opacity: 0;   transform: scale(0.5); }
}
@keyframes toeic-gib-splotch {
  0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
  70%  { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
  78%  { transform: translate(-50%, -50%) scale(1.1); opacity: 0.95; }
  100% { transform: translate(-50%, -50%) scale(1);   opacity: 0;    }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-gib-fly      { 0%,100% { opacity: 0; transform: none; } }
  @keyframes toeic-gib-trail    { 0%,100% { opacity: 0; } }
  @keyframes toeic-gib-splotch  { 0%,100% { opacity: 0; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---- Pixel art chunk shapes -------------------------------------------------
// Each shape is a list of 1x1 cells in a small grid. Cells reference a "ramp"
// slot (0 = body bright, 1 = body shadow, 2 = blood red, 3 = bone white) so
// the same shape can be tinted to any body color.

type Cell = { x: number; y: number; slot: 0 | 1 | 2 | 3 };

interface ChunkShape {
  name: 'head' | 'torso' | 'arm' | 'limb' | 'sliver';
  grid: number; // cells per side
  cells: Cell[];
}

// Head: roundish blob 4x4 with one bone bit and a blood drip.
const SHAPE_HEAD: ChunkShape = {
  name: 'head',
  grid: 4,
  cells: [
    { x: 1, y: 0, slot: 0 }, { x: 2, y: 0, slot: 0 },
    { x: 0, y: 1, slot: 0 }, { x: 1, y: 1, slot: 0 }, { x: 2, y: 1, slot: 0 }, { x: 3, y: 1, slot: 1 },
    { x: 0, y: 2, slot: 1 }, { x: 1, y: 2, slot: 0 }, { x: 2, y: 2, slot: 1 }, { x: 3, y: 2, slot: 1 },
    { x: 1, y: 3, slot: 2 }, { x: 2, y: 3, slot: 2 },
  ],
};

// Torso: bigger blob 5x5 with darker center (cavity) and bone fragment.
const SHAPE_TORSO: ChunkShape = {
  name: 'torso',
  grid: 5,
  cells: [
    { x: 1, y: 0, slot: 0 }, { x: 2, y: 0, slot: 0 }, { x: 3, y: 0, slot: 0 },
    { x: 0, y: 1, slot: 0 }, { x: 1, y: 1, slot: 1 }, { x: 2, y: 1, slot: 2 }, { x: 3, y: 1, slot: 1 }, { x: 4, y: 1, slot: 0 },
    { x: 0, y: 2, slot: 0 }, { x: 1, y: 2, slot: 2 }, { x: 2, y: 2, slot: 2 }, { x: 3, y: 2, slot: 3 }, { x: 4, y: 2, slot: 1 },
    { x: 0, y: 3, slot: 1 }, { x: 1, y: 3, slot: 1 }, { x: 2, y: 3, slot: 0 }, { x: 3, y: 3, slot: 1 }, { x: 4, y: 3, slot: 1 },
    { x: 1, y: 4, slot: 2 }, { x: 2, y: 4, slot: 2 }, { x: 3, y: 4, slot: 1 },
  ],
};

// Arm: 2x5 rectangle with bone end and blood stump.
const SHAPE_ARM: ChunkShape = {
  name: 'arm',
  grid: 5, // we'll center it; effective is 2 wide
  cells: [
    { x: 2, y: 0, slot: 3 }, { x: 3, y: 0, slot: 3 },
    { x: 2, y: 1, slot: 0 }, { x: 3, y: 1, slot: 1 },
    { x: 2, y: 2, slot: 0 }, { x: 3, y: 2, slot: 1 },
    { x: 2, y: 3, slot: 0 }, { x: 3, y: 3, slot: 1 },
    { x: 2, y: 4, slot: 2 }, { x: 3, y: 4, slot: 2 },
  ],
};

// Limb: 3x3 small chunk with blood and shadow.
const SHAPE_LIMB: ChunkShape = {
  name: 'limb',
  grid: 3,
  cells: [
    { x: 0, y: 0, slot: 0 }, { x: 1, y: 0, slot: 0 }, { x: 2, y: 0, slot: 1 },
    { x: 0, y: 1, slot: 0 }, { x: 1, y: 1, slot: 2 }, { x: 2, y: 1, slot: 1 },
    { x: 0, y: 2, slot: 2 }, { x: 1, y: 2, slot: 1 }, { x: 2, y: 2, slot: 1 },
  ],
};

// Sliver: thin 1x4 strip — looks like a sinew/limb fragment.
const SHAPE_SLIVER: ChunkShape = {
  name: 'sliver',
  grid: 4,
  cells: [
    { x: 1, y: 0, slot: 3 }, { x: 2, y: 0, slot: 3 },
    { x: 1, y: 1, slot: 0 }, { x: 2, y: 1, slot: 1 },
    { x: 1, y: 2, slot: 0 }, { x: 2, y: 2, slot: 1 },
    { x: 1, y: 3, slot: 2 }, { x: 2, y: 3, slot: 2 },
  ],
};

const SHAPES: ChunkShape[] = [SHAPE_HEAD, SHAPE_TORSO, SHAPE_ARM, SHAPE_LIMB, SHAPE_SLIVER];

// ---- Color helpers ----------------------------------------------------------

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return { r: 134, g: 239, b: 172 };
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => {
    const v = Math.round(clamp01(n / 255) * 255);
    return v.toString(16).padStart(2, '0');
  };
  return `#${to(r)}${to(g)}${to(b)}`;
}

function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}

const BLOOD_COLORS = ['#dc2626', '#b91c1c', '#991b1b'];
const BONE_COLOR = '#f8fafc';

function pickBlood(): string {
  return BLOOD_COLORS[Math.floor(Math.random() * BLOOD_COLORS.length)] as string;
}

// ---- Trajectory specs -------------------------------------------------------

interface TrailDot {
  // Position offset relative to origin (x, y).
  dx: number;
  dy: number;
  size: number;
  delay: number;
  color: string;
}

interface ChunkSpec {
  shape: ChunkShape;
  // Final landing offset (apex/peak displacement direction).
  dx: number;
  dy: number;
  gravity: number;
  rotEnd: number;
  size: number;
  delayMs: number;
  // Where the chunk lands (for the ground splotch). World offset relative
  // to (x,y).
  landDx: number;
  landDy: number;
  splotchSize: number;
  trail: TrailDot[];
}

function buildChunks(
  count: number,
  size: number,
  duration: number,
): ChunkSpec[] {
  // Cap to keep extreme counts safe.
  const safeCount = Math.max(1, Math.min(count, 40));
  const out: ChunkSpec[] = [];

  for (let i = 0; i < safeCount; i++) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)] as ChunkShape;

    // Angle: full 360°, but biased upward 60% of the time (upper half =
    // angle in [-PI, 0]).
    let angle: number;
    if (Math.random() < 0.6) {
      // Upper half (-PI..0).
      angle = -Math.PI * (0.15 + Math.random() * 0.7);
    } else {
      angle = Math.random() * Math.PI * 2;
    }

    // Speed in px/s, scaled by duration to produce final pixel offset.
    const speedPxPerSec = 200 + Math.random() * 300; // 200..500
    const flightSeconds = duration / 1000;
    const dist = speedPxPerSec * flightSeconds * 0.6; // 0.6 = "apex" portion
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    // Gravity: extra Y displacement applied at end. Tuned so heavy chunks
    // arc visibly. 70..160 px.
    const gravity = 70 + Math.random() * 90;

    // Rotation 0..720 either direction.
    const rotEnd = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 720;

    // Size variation per chunk: ±35%.
    const chunkSize = Math.max(8, size * (0.7 + Math.random() * 0.7));

    const delayMs = Math.floor(Math.random() * 60);

    // Final landing position = apex + gravity drop.
    const landDx = dx;
    const landDy = dy + gravity;
    const splotchSize = chunkSize * (1.4 + Math.random() * 0.6);

    // Trail: 3-4 droplets along the first ~30% of the path.
    const trailCount = 3 + Math.floor(Math.random() * 2); // 3..4
    const trail: TrailDot[] = [];
    for (let t = 0; t < trailCount; t++) {
      const frac = 0.06 + (t / trailCount) * 0.26; // 6%..32%
      // Slight perpendicular jitter so they don't form a perfect line.
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const jitter = (Math.random() - 0.5) * 6;
      trail.push({
        dx: dx * frac + perpX * jitter,
        dy: dy * frac + perpY * jitter,
        size: 2 + Math.floor(Math.random() * 3), // 2..4 px
        delay: delayMs + t * 40,
        color: pickBlood(),
      });
    }

    out.push({
      shape,
      dx,
      dy,
      gravity,
      rotEnd,
      size: chunkSize,
      delayMs,
      landDx,
      landDy,
      splotchSize,
      trail,
    });
  }

  return out;
}

// ---- Component --------------------------------------------------------------

export function GibsExplosion(props: GibsExplosionProps): JSX.Element {
  const {
    x,
    y,
    color = DEFAULT_COLOR,
    count = DEFAULT_COUNT,
    size = DEFAULT_SIZE,
    duration = DEFAULT_DURATION,
    onComplete,
  } = props;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const chunks = useMemo(
    () => buildChunks(count, size, duration),
    [count, size, duration],
  );

  // Pre-compute the body color ramp so all chunks share a consistent palette.
  const bodyBright = color;
  const bodyShadow = useMemo(() => darken(color, 0.55), [color]);

  useEffect(() => {
    ensureKeyframesInjected();
    const wait = prefersReducedMotion() ? 0 : duration + 60;
    const timer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [duration]);

  if (prefersReducedMotion()) {
    return <></>;
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    zIndex: Z_INDEX,
  };

  function slotColor(slot: 0 | 1 | 2 | 3): string {
    switch (slot) {
      case 0:
        return bodyBright;
      case 1:
        return bodyShadow;
      case 2:
        return pickBlood();
      case 3:
        return BONE_COLOR;
      default:
        return bodyBright;
    }
  }

  return (
    <div style={containerStyle} aria-hidden>
      {chunks.map((c, i) => {
        // Render the chunk as a small SVG of stacked rects (pixel grid).
        const cell = c.size / c.shape.grid;
        const chunkStyle: CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          width: c.size,
          height: c.size,
          // Center the chunk on the origin point.
          marginLeft: -c.size / 2,
          marginTop: -c.size / 2,
          ['--dx' as string]: `${c.dx}px`,
          ['--dy' as string]: `${c.dy}px`,
          ['--gravity' as string]: `${c.gravity}px`,
          ['--rotEnd' as string]: `${c.rotEnd}deg`,
          animationName: 'toeic-gib-fly',
          animationDuration: `${duration}ms`,
          animationTimingFunction: 'cubic-bezier(.22,.61,.36,1)',
          animationDelay: `${c.delayMs}ms`,
          animationFillMode: 'forwards',
          willChange: 'transform, opacity',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.55))',
        };

        // Trail droplets: small absolutely positioned dots along the path.
        const trailEls = c.trail.map((t, ti) => {
          const trailStyle: CSSProperties = {
            position: 'absolute',
            left: x + t.dx,
            top: y + t.dy,
            width: t.size,
            height: t.size,
            backgroundColor: t.color,
            borderRadius: 1,
            opacity: 0,
            animationName: 'toeic-gib-trail',
            animationDuration: `${Math.max(260, duration * 0.45)}ms`,
            animationDelay: `${t.delay}ms`,
            animationFillMode: 'forwards',
            animationTimingFunction: 'ease-out',
            willChange: 'opacity, transform',
            boxShadow: `0 0 3px ${t.color}`,
          };
          return <div key={`trail-${i}-${ti}`} style={trailStyle} />;
        });

        // Ground splotch: a tiny inline blood blob at the landing site that
        // pops in at ~70% of duration and fades by 100%. Rendered separately
        // so it isn't affected by the chunk's rotation/scale.
        const splotchStyle: CSSProperties = {
          position: 'absolute',
          left: x + c.landDx,
          top: y + c.landDy,
          width: c.splotchSize,
          height: c.splotchSize * 0.55,
          pointerEvents: 'none',
          animationName: 'toeic-gib-splotch',
          animationDuration: `${duration + 600}ms`,
          animationDelay: `${c.delayMs}ms`,
          animationFillMode: 'forwards',
          animationTimingFunction: 'ease-out',
          willChange: 'transform, opacity',
        };

        return (
          <span key={i}>
            {trailEls}

            <div style={splotchStyle}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 12"
                style={{ display: 'block', overflow: 'visible' }}
              >
                <ellipse cx={10} cy={6} rx={9} ry={5} fill="#7f1d1d" opacity={0.9} />
                <ellipse cx={10} cy={6} rx={6.5} ry={3.5} fill="#991b1b" />
                <ellipse cx={9} cy={5.5} rx={2.5} ry={1.6} fill="#dc2626" />
                <circle cx={2} cy={6} r={0.9} fill="#991b1b" />
                <circle cx={18} cy={5.5} r={0.8} fill="#991b1b" />
                <circle cx={14} cy={9.5} r={0.7} fill="#7f1d1d" />
              </svg>
            </div>

            <div style={chunkStyle}>
              <svg
                width={c.size}
                height={c.size}
                viewBox={`0 0 ${c.shape.grid} ${c.shape.grid}`}
                style={{ display: 'block', overflow: 'visible' }}
                shapeRendering="crispEdges"
              >
                {c.shape.cells.map((cellSpec, ci) => (
                  <rect
                    key={ci}
                    x={cellSpec.x}
                    y={cellSpec.y}
                    width={1}
                    height={1}
                    fill={slotColor(cellSpec.slot)}
                  />
                ))}
              </svg>
            </div>

            {/* Stump drip: a tiny stationary bleed at the spawn origin so the
                impact reads as wet. Fades quickly. */}
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: Math.max(3, cell * 1.2),
                height: Math.max(3, cell * 1.2),
                marginLeft: -Math.max(3, cell * 1.2) / 2,
                marginTop: -Math.max(3, cell * 1.2) / 2,
                backgroundColor: pickBlood(),
                borderRadius: 1,
                opacity: 0,
                animationName: 'toeic-gib-trail',
                animationDuration: `${Math.max(220, duration * 0.35)}ms`,
                animationDelay: `${c.delayMs}ms`,
                animationFillMode: 'forwards',
                animationTimingFunction: 'ease-out',
                boxShadow: '0 0 4px #7f1d1d',
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
