import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * FeverOverlay — subtle full-screen rainbow tint used during "fever mode".
 *
 * Visuals:
 *   - A slowly-rotating conic-gradient (rainbow) at low opacity (~12-18%)
 *     that also breathes brighter <-> dimmer for life.
 *   - Four corner radial light-flares that breathe in/out, brushing the
 *     edges of the screen with color.
 *
 * Lifecycle:
 *   - active flips true:  fade-in over 300ms.
 *   - active flips false: fade-out over 500ms.
 *   - We keep the layer mounted across active toggles so the fade-out can
 *     play. Internally the keyframes always run; the wrapper opacity is
 *     what gates visibility.
 *
 * Reduced motion: the rotating conic gradient is replaced with a static
 * low-opacity rainbow linear gradient and the corner flares stop breathing.
 *
 * z-index 9995: above other overlays (vignette etc), but below chromatic
 * aberration / particles / damage numbers.
 */

interface Props {
  active: boolean;
}

const STYLE_ELEMENT_ID = '__toeic_fever_overlay_keyframes__';

const FADE_IN_MS = 300;
const FADE_OUT_MS = 500;

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // Conic rotation: full 360deg over ~14s, very slow so it reads as
  // ambient color rather than motion. Brightness pulse alternates over
  // ~3s between 0.85x and 1.15x. Corner flares scale & fade gently.
  style.textContent = `
@keyframes toeic-fever-rotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes toeic-fever-pulse {
  0%, 100% { opacity: 0.12; }
  50%      { opacity: 0.18; }
}
@keyframes toeic-fever-flare-a {
  0%, 100% { opacity: 0.18; transform: scale(1);   }
  50%      { opacity: 0.32; transform: scale(1.15);}
}
@keyframes toeic-fever-flare-b {
  0%, 100% { opacity: 0.30; transform: scale(1.1); }
  50%      { opacity: 0.16; transform: scale(0.95);}
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-fever-rotate  { 0%, 100% { transform: none; } }
  @keyframes toeic-fever-pulse   { 0%, 100% { opacity: 0.15; } }
  @keyframes toeic-fever-flare-a { 0%, 100% { opacity: 0.22; transform: none; } }
  @keyframes toeic-fever-flare-b { 0%, 100% { opacity: 0.22; transform: none; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface CornerFlare {
  // CSS positioning corner.
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  // Center color for the radial gradient.
  color: string;
  // Which keyframe phase (a vs b) drives this flare's breathing.
  phase: 'a' | 'b';
  // Animation delay (ms) — desync flares.
  delayMs: number;
  // Diameter in viewport units.
  sizeVmax: number;
}

const CORNER_FLARES: CornerFlare[] = [
  // Top-left: magenta
  { top: -120, left: -120, color: 'rgba(217,70,239,0.55)', phase: 'a', delayMs: 0, sizeVmax: 55 },
  // Top-right: cyan
  { top: -120, right: -120, color: 'rgba(34,211,238,0.55)', phase: 'b', delayMs: 600, sizeVmax: 55 },
  // Bottom-left: yellow
  { bottom: -120, left: -120, color: 'rgba(250,204,21,0.55)', phase: 'b', delayMs: 1200, sizeVmax: 55 },
  // Bottom-right: green
  { bottom: -120, right: -120, color: 'rgba(34,197,94,0.55)', phase: 'a', delayMs: 1800, sizeVmax: 55 },
  // Mid-left edge flare: blue
  { top: '40%', left: -160, color: 'rgba(59,130,246,0.45)', phase: 'a', delayMs: 900, sizeVmax: 45 },
  // Mid-right edge flare: red-orange
  { top: '40%', right: -160, color: 'rgba(249,115,22,0.45)', phase: 'b', delayMs: 1500, sizeVmax: 45 },
];

export function FeverOverlay(props: Props): JSX.Element {
  const { active } = props;
  const [, setTick] = useState(0);

  useEffect(() => {
    ensureKeyframesInjected();
    // Force a re-read of prefers-reduced-motion if the user toggles it.
    // We don't strictly need to subscribe, but we run once.
    setTick((t) => t + 1);
  }, []);

  const reduce = prefersReducedMotion();

  // Outer container fades in/out via opacity transition.
  const containerStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 9995,
    opacity: active ? 1 : 0,
    transition: `opacity ${active ? FADE_IN_MS : FADE_OUT_MS}ms ease-out`,
    overflow: 'hidden',
    willChange: 'opacity',
  };

  // The rainbow conic gradient is on a layer that is bigger than the
  // viewport so that when it rotates, we never see the un-painted corners
  // sweep into view. We rotate that layer with a slow keyframe.
  const conicLayerStyle: CSSProperties = {
    position: 'absolute',
    // 200vmax square centered, so even rotated to 45deg it covers the screen.
    top: '50%',
    left: '50%',
    width: '200vmax',
    height: '200vmax',
    marginLeft: '-100vmax',
    marginTop: '-100vmax',
    background:
      'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #6366f1, #d946ef, #ef4444)',
    animationName: reduce ? undefined : 'toeic-fever-rotate',
    animationDuration: reduce ? undefined : '14000ms',
    animationTimingFunction: reduce ? undefined : 'linear',
    animationIterationCount: reduce ? undefined : 'infinite',
    willChange: reduce ? undefined : 'transform',
  };

  // Static rainbow fallback when reduced motion is on. Replaces the conic
  // gradient layer so we don't render both.
  const staticLayerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(245,158,11,0.18), rgba(234,179,8,0.18), rgba(34,197,94,0.18), rgba(6,182,212,0.18), rgba(99,102,241,0.18), rgba(217,70,239,0.18))',
  };

  // Outer pulse wrapper holds the conic layer and runs the brightness pulse
  // (12% <-> 18%) via its own opacity keyframe. We use opacity instead of
  // filter:brightness so it composes cleanly with the container's fade.
  const pulseWrapperStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    opacity: 0.15, // baseline; keyframe pulses around this
    animationName: reduce ? undefined : 'toeic-fever-pulse',
    animationDuration: reduce ? undefined : '3000ms',
    animationTimingFunction: reduce ? undefined : 'ease-in-out',
    animationIterationCount: reduce ? undefined : 'infinite',
    mixBlendMode: 'screen',
  };

  return (
    <div style={containerStyle} aria-hidden>
      <div style={pulseWrapperStyle}>
        {reduce ? <div style={staticLayerStyle} /> : <div style={conicLayerStyle} />}
      </div>

      {CORNER_FLARES.map((flare, i) => {
        const flareStyle: CSSProperties = {
          position: 'absolute',
          top: flare.top,
          bottom: flare.bottom,
          left: flare.left,
          right: flare.right,
          width: `${flare.sizeVmax}vmax`,
          height: `${flare.sizeVmax}vmax`,
          // Translate-y to vertically center mid-edge flares whose anchor is "40%".
          transform: typeof flare.top === 'string' ? 'translateY(-50%)' : undefined,
          background: `radial-gradient(circle, ${flare.color} 0%, ${flare.color.replace(
            /[\d.]+\)$/,
            '0)',
          )} 70%)`,
          filter: 'blur(20px)',
          animationName: reduce
            ? undefined
            : flare.phase === 'a'
              ? 'toeic-fever-flare-a'
              : 'toeic-fever-flare-b',
          animationDuration: reduce ? undefined : '4500ms',
          animationTimingFunction: reduce ? undefined : 'ease-in-out',
          animationIterationCount: reduce ? undefined : 'infinite',
          animationDelay: reduce ? undefined : `${flare.delayMs}ms`,
          willChange: reduce ? undefined : 'transform, opacity',
          mixBlendMode: 'screen',
          opacity: reduce ? 0.22 : undefined,
        };
        return <div key={i} style={flareStyle} />;
      })}
    </div>
  );
}
