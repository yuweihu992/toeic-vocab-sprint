import { useCallback, useEffect, useRef, useState } from 'react';
import type * as React from 'react';

/**
 * useScreenShake
 *
 * Returns:
 *  - `trigger(intensity)`: call this to shake the wrapped element.
 *      - 'light': +/-4px, 0.3s
 *      - 'heavy': +/-8px, 0.4s   (use for criticals)
 *      - 'devastating': +/-16px + scale wobble + slight rotation + brief blur, 0.5s
 *  - `shakeStyle`: spread onto a wrapper <div>'s `style` prop. While a shake
 *    is active this object will contain a CSS `animation` value pointing at
 *    one of the keyframes injected by this module. While idle the object is
 *    empty so layout/transform isn't disturbed.
 *
 * Reduced motion: respects `prefers-reduced-motion: reduce` and becomes a
 * no-op (no animation applied, just an immediate completion tick).
 */

type ShakeIntensity = 'light' | 'heavy' | 'devastating';

const STYLE_ELEMENT_ID = '__toeic_screen_shake_keyframes__';

// Inject keyframes once per page load. Doing this at module scope means the
// stylesheet is ready before the first `trigger()` call.
function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
@keyframes toeic-shake-light {
  0%   { transform: translate3d(0, 0, 0); }
  10%  { transform: translate3d(-4px, 2px, 0); }
  20%  { transform: translate3d(3px, -3px, 0); }
  30%  { transform: translate3d(-3px, 3px, 0); }
  40%  { transform: translate3d(4px, 1px, 0); }
  50%  { transform: translate3d(-2px, -2px, 0); }
  60%  { transform: translate3d(3px, 2px, 0); }
  70%  { transform: translate3d(-3px, -1px, 0); }
  80%  { transform: translate3d(2px, 2px, 0); }
  90%  { transform: translate3d(-1px, -1px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
@keyframes toeic-shake-heavy {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  10%  { transform: translate3d(-8px, 4px, 0) rotate(-0.5deg); }
  20%  { transform: translate3d(7px, -6px, 0) rotate(0.5deg); }
  30%  { transform: translate3d(-6px, 7px, 0) rotate(-0.5deg); }
  40%  { transform: translate3d(8px, 2px, 0) rotate(0.5deg); }
  50%  { transform: translate3d(-5px, -5px, 0) rotate(-0.3deg); }
  60%  { transform: translate3d(6px, 5px, 0) rotate(0.3deg); }
  70%  { transform: translate3d(-7px, -2px, 0) rotate(-0.2deg); }
  80%  { transform: translate3d(4px, 4px, 0) rotate(0.2deg); }
  90%  { transform: translate3d(-2px, -2px, 0) rotate(0deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}
@keyframes toeic-shake-devastating {
  0%   { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); filter: blur(0px); }
  8%   { transform: translate3d(-16px, 8px, 0) scale(1.04) rotate(-2deg); filter: blur(1px); }
  16%  { transform: translate3d(14px, -12px, 0) scale(1.02) rotate(2deg); filter: blur(0.8px); }
  24%  { transform: translate3d(-13px, 13px, 0) scale(0.98) rotate(-1.6deg); filter: blur(0.6px); }
  32%  { transform: translate3d(15px, 6px, 0) scale(1.03) rotate(1.4deg); filter: blur(0.5px); }
  40%  { transform: translate3d(-11px, -11px, 0) scale(1) rotate(-1.2deg); filter: blur(0.4px); }
  50%  { transform: translate3d(12px, 9px, 0) scale(1.01) rotate(1deg); filter: blur(0.3px); }
  60%  { transform: translate3d(-10px, -7px, 0) scale(0.99) rotate(-0.8deg); filter: blur(0.2px); }
  70%  { transform: translate3d(8px, 8px, 0) scale(1) rotate(0.6deg); filter: blur(0.15px); }
  80%  { transform: translate3d(-5px, -4px, 0) scale(1) rotate(-0.4deg); filter: blur(0.1px); }
  90%  { transform: translate3d(3px, 2px, 0) scale(1) rotate(0.2deg); filter: blur(0px); }
  100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); filter: blur(0px); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-shake-light { 0%,100% { transform: none; } }
  @keyframes toeic-shake-heavy { 0%,100% { transform: none; } }
  @keyframes toeic-shake-devastating { 0%,100% { transform: none; filter: none; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface ShakeState {
  active: boolean;
  intensity: ShakeIntensity;
  // monotonically increasing token used to restart the animation when
  // trigger() is called rapidly back-to-back.
  token: number;
}

function durationFor(intensity: ShakeIntensity): number {
  switch (intensity) {
    case 'devastating':
      return 500;
    case 'heavy':
      return 400;
    case 'light':
    default:
      return 300;
  }
}

function animationNameFor(intensity: ShakeIntensity): string {
  switch (intensity) {
    case 'devastating':
      return 'toeic-shake-devastating';
    case 'heavy':
      return 'toeic-shake-heavy';
    case 'light':
    default:
      return 'toeic-shake-light';
  }
}

export function useScreenShake(): {
  trigger: (intensity?: ShakeIntensity) => void;
  shakeStyle: React.CSSProperties;
} {
  const [state, setState] = useState<ShakeState>({
    active: false,
    intensity: 'light',
    token: 0,
  });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const trigger = useCallback((intensity: ShakeIntensity = 'light') => {
    ensureKeyframesInjected();

    if (prefersReducedMotion()) {
      // Skip shake entirely; nothing to do.
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const duration = durationFor(intensity);

    setState((prev) => ({
      active: true,
      intensity,
      token: prev.token + 1,
    }));

    timeoutRef.current = window.setTimeout(() => {
      setState((prev) => ({ ...prev, active: false }));
      timeoutRef.current = null;
    }, duration);
  }, []);

  const shakeStyle: React.CSSProperties = state.active
    ? {
        // Token in the animation name forces React to re-apply the style
        // string, restarting the keyframe sequence on rapid retriggers.
        animationName: animationNameFor(state.intensity),
        animationDuration: `${durationFor(state.intensity)}ms`,
        animationTimingFunction: 'cubic-bezier(.36,.07,.19,.97)',
        animationFillMode: 'both',
        // Hint the compositor.
        willChange: 'transform',
      }
    : {};

  // Use the token to make React produce a fresh style object each retrigger,
  // which ensures the animation restarts even if intensity didn't change.
  if (state.active) {
    (shakeStyle as Record<string, unknown>)['--toeic-shake-token'] = state.token;
  }

  return { trigger, shakeStyle };
}
