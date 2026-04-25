import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * PachinkoLights — full-screen background overlay with drifting/pulsing
 * colorful blurred lights for that "slot machine bonus round" vibe.
 *
 * Lifecycle:
 *   - active=false (initial): mounted but transparent (opacity 0). The
 *     component stays mounted while it fades out so animations finish
 *     gracefully.
 *   - active flips true:  fade-in over 300ms.
 *   - active flips false: fade-out over 600ms.
 *
 * Reduced motion: lights render as static blurred dots — no drift, no pulse.
 *
 * Z-index 1: above the page background color, behind all UI.
 */

export type PachinkoIntensity = 'subtle' | 'normal' | 'crazy';

interface Props {
  active: boolean;
  intensity?: PachinkoIntensity;
}

const STYLE_ELEMENT_ID = '__toeic_pachinko_lights_keyframes__';

const FADE_IN_MS = 300;
const FADE_OUT_MS = 600;

// Saturated pachinko / arcade palette. >= 7 colors cycled across lights.
const PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#d946ef', // magenta
  '#a855f7', // purple
];

interface IntensityConfig {
  count: number;
  driftDurationMs: number;
  peakOpacity: number;
  minSize: number;
  maxSize: number;
  blurPx: number;
  spinning: boolean;
  sparkle: boolean;
}

const INTENSITY_CONFIG: Record<PachinkoIntensity, IntensityConfig> = {
  subtle: {
    count: 12,
    driftDurationMs: 12000,
    peakOpacity: 0.5,
    minSize: 16,
    maxSize: 24,
    blurPx: 10,
    spinning: false,
    sparkle: false,
  },
  normal: {
    count: 24,
    driftDurationMs: 6000,
    peakOpacity: 0.7,
    minSize: 18,
    maxSize: 28,
    blurPx: 12,
    spinning: false,
    sparkle: false,
  },
  crazy: {
    count: 40,
    driftDurationMs: 3500,
    peakOpacity: 0.9,
    minSize: 22,
    maxSize: 36,
    blurPx: 14,
    spinning: true,
    sparkle: true,
  },
};

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // Each drift animation translates around in a 4-stop sin/cos-like loop and
  // pulses opacity. Three variants give different motion paths so a field of
  // many lights doesn't look synchronized. The `-spin` variant adds rotation
  // for the 'crazy' intensity. The `-sparkle` keyframe is a fast opacity
  // flicker layered on top.
  style.textContent = `
@keyframes toeic-pachinko-drift-a {
  0%   { transform: translate3d(0, 0, 0)        scale(1);   opacity: var(--peak, 0.7); }
  25%  { transform: translate3d(40px, -28px, 0) scale(1.2); opacity: calc(var(--peak, 0.7) * 0.5); }
  50%  { transform: translate3d(0, -56px, 0)    scale(0.9); opacity: var(--peak, 0.7); }
  75%  { transform: translate3d(-40px, -28px, 0) scale(1.15); opacity: calc(var(--peak, 0.7) * 0.6); }
  100% { transform: translate3d(0, 0, 0)        scale(1);   opacity: var(--peak, 0.7); }
}
@keyframes toeic-pachinko-drift-b {
  0%   { transform: translate3d(0, 0, 0)         scale(1);   opacity: calc(var(--peak, 0.7) * 0.6); }
  25%  { transform: translate3d(-32px, 24px, 0)  scale(0.85);opacity: var(--peak, 0.7); }
  50%  { transform: translate3d(28px, 36px, 0)   scale(1.25);opacity: calc(var(--peak, 0.7) * 0.7); }
  75%  { transform: translate3d(36px, -16px, 0)  scale(0.95);opacity: var(--peak, 0.7); }
  100% { transform: translate3d(0, 0, 0)         scale(1);   opacity: calc(var(--peak, 0.7) * 0.6); }
}
@keyframes toeic-pachinko-drift-c {
  0%   { transform: translate3d(0, 0, 0)         scale(1);   opacity: var(--peak, 0.7); }
  25%  { transform: translate3d(24px, 24px, 0)   scale(1.1); opacity: calc(var(--peak, 0.7) * 0.55); }
  50%  { transform: translate3d(48px, 0, 0)      scale(0.8); opacity: var(--peak, 0.7); }
  75%  { transform: translate3d(24px, -24px, 0)  scale(1.18);opacity: calc(var(--peak, 0.7) * 0.65); }
  100% { transform: translate3d(0, 0, 0)         scale(1);   opacity: var(--peak, 0.7); }
}
@keyframes toeic-pachinko-drift-spin-a {
  0%   { transform: translate3d(0, 0, 0)        rotate(0deg)   scale(1);   opacity: var(--peak, 0.9); }
  25%  { transform: translate3d(40px, -28px, 0) rotate(90deg)  scale(1.25);opacity: calc(var(--peak, 0.9) * 0.5); }
  50%  { transform: translate3d(0, -56px, 0)    rotate(180deg) scale(0.85);opacity: var(--peak, 0.9); }
  75%  { transform: translate3d(-40px, -28px, 0) rotate(270deg) scale(1.2); opacity: calc(var(--peak, 0.9) * 0.6); }
  100% { transform: translate3d(0, 0, 0)        rotate(360deg) scale(1);   opacity: var(--peak, 0.9); }
}
@keyframes toeic-pachinko-drift-spin-b {
  0%   { transform: translate3d(0, 0, 0)         rotate(0deg)    scale(1);    opacity: calc(var(--peak, 0.9) * 0.6); }
  25%  { transform: translate3d(-36px, 28px, 0)  rotate(-90deg)  scale(0.85); opacity: var(--peak, 0.9); }
  50%  { transform: translate3d(32px, 40px, 0)   rotate(-180deg) scale(1.3);  opacity: calc(var(--peak, 0.9) * 0.7); }
  75%  { transform: translate3d(40px, -20px, 0)  rotate(-270deg) scale(0.95); opacity: var(--peak, 0.9); }
  100% { transform: translate3d(0, 0, 0)         rotate(-360deg) scale(1);    opacity: calc(var(--peak, 0.9) * 0.6); }
}
@keyframes toeic-pachinko-sparkle {
  0%, 100% { filter: brightness(1); }
  20%      { filter: brightness(1.6); }
  40%      { filter: brightness(0.9); }
  60%      { filter: brightness(1.8); }
  80%      { filter: brightness(1); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-pachinko-drift-a       { 0%, 100% { transform: none; opacity: var(--peak, 0.5); } }
  @keyframes toeic-pachinko-drift-b       { 0%, 100% { transform: none; opacity: var(--peak, 0.5); } }
  @keyframes toeic-pachinko-drift-c       { 0%, 100% { transform: none; opacity: var(--peak, 0.5); } }
  @keyframes toeic-pachinko-drift-spin-a  { 0%, 100% { transform: none; opacity: var(--peak, 0.5); } }
  @keyframes toeic-pachinko-drift-spin-b  { 0%, 100% { transform: none; opacity: var(--peak, 0.5); } }
  @keyframes toeic-pachinko-sparkle       { 0%, 100% { filter: none; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface LightSpec {
  // Initial position as a viewport percentage (0..100).
  topPct: number;
  leftPct: number;
  size: number;
  color: string;
  // Which drift keyframe to use.
  driftIndex: 0 | 1 | 2;
  // Per-light duration jitter (multiplier on the base intensity duration).
  durationScale: number;
  // Negative animation-delay so each light starts mid-cycle (un-syncs them).
  negativeDelayMs: number;
  // Sparkle phase offset (only meaningful in 'crazy').
  sparkleDelayMs: number;
}

// Tiny seeded PRNG so the same intensity gives a stable layout between
// re-renders within a session. We don't actually need cross-session
// determinism — only "useMemo doesn't shuffle on parent re-render".
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLights(intensity: PachinkoIntensity): LightSpec[] {
  const cfg = INTENSITY_CONFIG[intensity];
  // Seed varies by intensity so switching intensities reshuffles, but the
  // same intensity is stable within a session.
  const seedByIntensity: Record<PachinkoIntensity, number> = {
    subtle: 0xa5a5,
    normal: 0xc0ffee,
    crazy: 0xfeedface,
  };
  const rand = mulberry32(seedByIntensity[intensity]);

  const lights: LightSpec[] = [];
  for (let i = 0; i < cfg.count; i++) {
    const sizeRange = cfg.maxSize - cfg.minSize;
    const size = cfg.minSize + Math.floor(rand() * (sizeRange + 1));
    const color = PALETTE[i % PALETTE.length] as string;
    const driftIndex = (i % 3) as 0 | 1 | 2;
    const durationScale = 0.75 + rand() * 0.6; // 0.75..1.35
    const negativeDelayMs = Math.floor(rand() * cfg.driftDurationMs);
    const sparkleDelayMs = Math.floor(rand() * 1400);
    lights.push({
      topPct: rand() * 100,
      leftPct: rand() * 100,
      size,
      color,
      driftIndex,
      durationScale,
      negativeDelayMs,
      sparkleDelayMs,
    });
  }
  return lights;
}

type Phase = 'hidden' | 'visible';

export function PachinkoLights(props: Props): JSX.Element {
  const { active, intensity = 'normal' } = props;
  const cfg = INTENSITY_CONFIG[intensity];

  // Track whether we should be currently visible. We do not unmount on
  // active=false — we just fade opacity out.
  const [phase, setPhase] = useState<Phase>(active ? 'visible' : 'hidden');
  const firstRenderRef = useRef(true);

  useEffect(() => {
    ensureKeyframesInjected();
  }, []);

  useEffect(() => {
    // Skip the very first render — we already initialized phase from
    // `active`, no need to re-trigger.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    setPhase(active ? 'visible' : 'hidden');
  }, [active]);

  const lights = useMemo(() => buildLights(intensity), [intensity]);

  const reduce = prefersReducedMotion();

  const containerStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'hidden',
    opacity: phase === 'visible' ? 1 : 0,
    transition: `opacity ${phase === 'visible' ? FADE_IN_MS : FADE_OUT_MS}ms ease-out`,
    willChange: 'opacity',
  };

  const driftNames: [string, string, string] = cfg.spinning
    ? [
        'toeic-pachinko-drift-spin-a',
        'toeic-pachinko-drift-spin-b',
        'toeic-pachinko-drift-spin-a',
      ]
    : [
        'toeic-pachinko-drift-a',
        'toeic-pachinko-drift-b',
        'toeic-pachinko-drift-c',
      ];

  return (
    <div style={containerStyle} aria-hidden>
      {lights.map((light, i) => {
        const driftName = driftNames[light.driftIndex];
        const driftDuration = Math.round(cfg.driftDurationMs * light.durationScale);

        // Radial gradient from saturated color center to fully transparent
        // edge — this gives the soft glow disk look.
        const background = `radial-gradient(circle, ${light.color} 0%, ${light.color}cc 35%, ${light.color}00 75%)`;

        // Compose drift + (optional) sparkle on the same element.
        const animationName = cfg.sparkle
          ? `${driftName}, toeic-pachinko-sparkle`
          : driftName;
        const animationDuration = cfg.sparkle
          ? `${driftDuration}ms, 1400ms`
          : `${driftDuration}ms`;
        const animationTimingFunction = cfg.sparkle
          ? 'ease-in-out, ease-in-out'
          : 'ease-in-out';
        const animationIterationCount = cfg.sparkle ? 'infinite, infinite' : 'infinite';
        const animationDelay = cfg.sparkle
          ? `-${light.negativeDelayMs}ms, -${light.sparkleDelayMs}ms`
          : `-${light.negativeDelayMs}ms`;

        const lightStyle: CSSProperties = {
          position: 'absolute',
          top: `${light.topPct}%`,
          left: `${light.leftPct}%`,
          width: light.size,
          height: light.size,
          borderRadius: '50%',
          background,
          filter: `blur(${cfg.blurPx}px)`,
          // Ensure the @keyframes can read the per-intensity peak opacity.
          ['--peak' as string]: String(cfg.peakOpacity),
          // Reduced motion: render as static dots at peak opacity, no anim.
          opacity: reduce ? cfg.peakOpacity : undefined,
          animationName: reduce ? undefined : animationName,
          animationDuration: reduce ? undefined : animationDuration,
          animationTimingFunction: reduce ? undefined : animationTimingFunction,
          animationIterationCount: reduce ? undefined : animationIterationCount,
          animationDelay: reduce ? undefined : animationDelay,
          willChange: reduce ? undefined : 'transform, opacity, filter',
          mixBlendMode: 'screen',
        };
        return <div key={i} style={lightStyle} />;
      })}
    </div>
  );
}
