import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * Particles — shoots N square chips outward from (x, y).
 *
 * Variants tune shape, size, color logic, motion, and gravity to give each
 * burst a distinct feel — blood (default) is heavy & meaty, gold sparkles &
 * twinkles, bone is fast & rotating, rainbow recolors per-particle, and
 * spark is short & gravity-less.
 *
 * Each particle picks a random angle and speed, then animates via a CSS
 * keyframe that reads CSS custom properties off the particle's own style
 * object: `--dx`, `--dy`, `--gravity`, `--rot`. We use translate3d so it
 * stays on the GPU. After `duration` ms, `onComplete` fires (if provided).
 *
 * Reduced motion: render nothing and call onComplete on the next tick.
 */

export type ParticleVariant = 'blood' | 'gold' | 'bone' | 'rainbow' | 'spark';

interface Props {
  x: number;
  y: number;
  count?: number;
  color?: string;
  spread?: number;
  duration?: number;
  variant?: ParticleVariant;
  onComplete?: () => void;
}

const STYLE_ELEMENT_ID = '__toeic_particles_keyframes__';

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // The particle element starts at (x,y). We translate by --dx,--dy at the
  // end and add a parabolic gravity term via the midpoint keyframe. Opacity
  // fades 1 -> 0 across the lifetime. The `-rot` variant adds rotation.
  // The `-twinkle` variant flickers opacity during flight.
  style.textContent = `
@keyframes toeic-particle-fly {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
  60% {
    opacity: 0.9;
  }
  100% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 0px)), 0) scale(0.4);
    opacity: 0;
  }
}
@keyframes toeic-particle-fly-rot {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  60% {
    opacity: 0.95;
  }
  100% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 0px)), 0) rotate(var(--rot, 360deg)) scale(0.5);
    opacity: 0;
  }
}
@keyframes toeic-particle-fly-twinkle {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
  18% { opacity: 0.6; }
  32% { opacity: 1;   }
  48% { opacity: 0.65;}
  64% { opacity: 1;   }
  80% { opacity: 0.7; }
  100% {
    transform: translate3d(var(--dx, 0px), calc(var(--dy, 0px) + var(--gravity, 0px)), 0) scale(0.4);
    opacity: 0;
  }
}
@keyframes toeic-particle-trail {
  0%   { opacity: 0.55; transform: scale(1); }
  100% { opacity: 0;    transform: scale(0.6); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-particle-fly         { 0%,100% { opacity: 0; transform: none; } }
  @keyframes toeic-particle-fly-rot     { 0%,100% { opacity: 0; transform: none; } }
  @keyframes toeic-particle-fly-twinkle { 0%,100% { opacity: 0; transform: none; } }
  @keyframes toeic-particle-trail       { 0%,100% { opacity: 0; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface ParticleSpec {
  dx: number;
  dy: number;
  gravity: number;
  width: number;
  height: number;
  delay: number;
  color: string;
  rotation: number;
  hasTrail: boolean;
  // A subset of the trajectory: trailing afterimage rects placed near the
  // start of the flight path that fade independently of the main particle.
  trailOffsets: Array<{ dx: number; dy: number; size: number; delay: number }>;
}

const BLOOD_PALETTE = ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
const GOLD_PALETTE = ['#fbbf24', '#f59e0b', '#fde047'];
const BONE_PALETTE = ['#f8fafc', '#e2e8f0', '#f1f5f9'];
const RAINBOW_PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
];
const SPARK_PALETTE = ['#fb923c', '#fef08a', '#fdba74'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function buildParticles(
  count: number,
  spread: number,
  variant: ParticleVariant,
  fallbackColor: string,
): ParticleSpec[] {
  const out: ParticleSpec[] = [];
  // Cap count to a sane max to keep a heavy burst from tanking the page.
  const safeCount = Math.max(1, Math.min(count, 80));

  for (let i = 0; i < safeCount; i++) {
    // Random angle 0..2pi.
    let angle = Math.random() * Math.PI * 2;

    // Per-variant motion / size / color.
    let speedScale = 0.5 + Math.random() * 0.5; // 0.5..1.0
    let gravity = 30 + Math.random() * 30;
    let width = 4 + Math.floor(Math.random() * 5);
    let height = width;
    let color = fallbackColor;
    let rotation = 0;
    let hasTrail = false;

    switch (variant) {
      case 'blood': {
        // Mix of sizes — some chunky 10-12px, some small 4-6px.
        const big = Math.random() < 0.35;
        const s = big ? 8 + Math.floor(Math.random() * 5) : 4 + Math.floor(Math.random() * 4);
        width = s;
        height = s;
        color = pick(BLOOD_PALETTE);
        // Heavier gravity so it falls fast and arcs.
        gravity = 70 + Math.random() * 50;
        // Vary speed: some fast streaks, some slow drips.
        speedScale = 0.35 + Math.random() * 0.85;
        // ~30% leave a trailing afterimage rect.
        hasTrail = Math.random() < 0.3;
        break;
      }
      case 'gold': {
        const s = 4 + Math.floor(Math.random() * 5); // 4..8
        width = s;
        height = s;
        color = pick(GOLD_PALETTE);
        // Slower gravity, slight upward bias.
        gravity = 8 + Math.random() * 14;
        // Bias angle upward (-PI..-0 range covers upper half).
        if (Math.random() < 0.65) angle = -Math.random() * Math.PI;
        speedScale = 0.5 + Math.random() * 0.5;
        break;
      }
      case 'bone': {
        // Irregular fragments: some 5-9 squares, some thin 3x6 slivers.
        if (Math.random() < 0.5) {
          width = 3 + Math.floor(Math.random() * 3); // 3..5
          height = 5 + Math.floor(Math.random() * 4); // 5..8
        } else {
          width = 5 + Math.floor(Math.random() * 5); // 5..9
          height = 5 + Math.floor(Math.random() * 5);
        }
        color = pick(BONE_PALETTE);
        gravity = 50 + Math.random() * 30;
        speedScale = 0.7 + Math.random() * 0.6; // fast outward
        rotation = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540); // 180..720
        break;
      }
      case 'rainbow': {
        const big = Math.random() < 0.35;
        const s = big ? 8 + Math.floor(Math.random() * 5) : 4 + Math.floor(Math.random() * 4);
        width = s;
        height = s;
        color = pick(RAINBOW_PALETTE);
        gravity = 70 + Math.random() * 50;
        speedScale = 0.35 + Math.random() * 0.85;
        hasTrail = Math.random() < 0.25;
        break;
      }
      case 'spark': {
        const s = 3 + Math.floor(Math.random() * 4); // 3..6
        width = s;
        height = s;
        color = pick(SPARK_PALETTE);
        gravity = 0; // no gravity
        speedScale = 0.85 + Math.random() * 0.6; // very fast
        break;
      }
    }

    const distance = spread * speedScale;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // Build trail droplets along the first ~30% of the flight.
    const trailOffsets: ParticleSpec['trailOffsets'] = [];
    if (hasTrail) {
      const trailCount = 2 + Math.floor(Math.random() * 2); // 2..3
      for (let t = 0; t < trailCount; t++) {
        const frac = 0.08 + (t / trailCount) * 0.22; // 8%..30% along path
        trailOffsets.push({
          dx: dx * frac,
          dy: dy * frac,
          size: Math.max(2, Math.floor(width * 0.5)),
          delay: t * 30,
        });
      }
    }

    const delay = Math.floor(Math.random() * 40); // tiny stagger
    out.push({
      dx,
      dy,
      gravity,
      width,
      height,
      delay,
      color,
      rotation,
      hasTrail,
      trailOffsets,
    });
  }
  return out;
}

function pickAnimationName(variant: ParticleVariant): string {
  switch (variant) {
    case 'bone':
      return 'toeic-particle-fly-rot';
    case 'gold':
      return 'toeic-particle-fly-twinkle';
    case 'spark':
    case 'blood':
    case 'rainbow':
    default:
      return 'toeic-particle-fly';
  }
}

function pickDuration(variant: ParticleVariant, requested: number | undefined): number {
  if (typeof requested === 'number') return requested;
  if (variant === 'spark') return 300;
  return 600;
}

export function Particles(props: Props): JSX.Element {
  const {
    x,
    y,
    count = 16,
    color = '#ef4444',
    spread = 80,
    variant = 'blood',
    onComplete,
  } = props;

  const duration = pickDuration(variant, props.duration);

  // Build particle specs once per mount; if the inputs change, useMemo
  // recomputes them, but in practice this component is mount-once and
  // unmount when complete.
  const particles = useMemo(
    () => buildParticles(count, spread, variant, color),
    [count, spread, variant, color],
  );

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    ensureKeyframesInjected();

    const reduce = prefersReducedMotion();
    const wait = reduce ? 0 : duration + 50; // small buffer for stagger
    const timer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [duration]);

  if (prefersReducedMotion()) {
    // Render nothing; onComplete still fires from the effect above.
    return <></>;
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    zIndex: 9999,
  };

  const animationName = pickAnimationName(variant);

  return (
    <div style={containerStyle} aria-hidden>
      {particles.map((p, i) => {
        const baseStyle: CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          width: p.width,
          height: p.height,
          backgroundColor: p.color,
          borderRadius: variant === 'bone' ? 0 : 1,
          // CSS custom properties consumed by the keyframe.
          ['--dx' as string]: `${p.dx}px`,
          ['--dy' as string]: `${p.dy}px`,
          ['--gravity' as string]: `${p.gravity}px`,
          ['--rot' as string]: `${p.rotation}deg`,
          animationName,
          animationDuration: `${duration}ms`,
          animationTimingFunction: 'cubic-bezier(.22,.61,.36,1)',
          animationDelay: `${p.delay}ms`,
          animationFillMode: 'forwards',
          willChange: 'transform, opacity',
          // Tiny shadow so particles pop on light backgrounds.
          boxShadow: `0 0 4px ${p.color}`,
        };

        const trails = p.hasTrail
          ? p.trailOffsets.map((t, ti) => {
              const trailStyle: CSSProperties = {
                position: 'absolute',
                left: x + t.dx,
                top: y + t.dy,
                width: t.size,
                height: t.size,
                backgroundColor: p.color,
                borderRadius: 1,
                opacity: 0.55,
                animationName: 'toeic-particle-trail',
                animationDuration: `${Math.max(180, duration * 0.5)}ms`,
                animationDelay: `${p.delay + t.delay}ms`,
                animationFillMode: 'forwards',
                animationTimingFunction: 'ease-out',
                willChange: 'opacity, transform',
                pointerEvents: 'none',
              };
              return <div key={`t-${i}-${ti}`} style={trailStyle} />;
            })
          : null;

        return (
          <span key={i}>
            {trails}
            <div style={baseStyle} />
          </span>
        );
      })}
    </div>
  );
}
