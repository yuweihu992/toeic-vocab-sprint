import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useSlowMotion
 *
 * Briefly slows down the entire app's perceived motion by injecting a global
 * stylesheet that scales the `animation-duration` and `transition-duration`
 * of every element under `<html class="toeic-slowmo-active">`. Returns:
 *
 *   - `trigger(durationMs?, slowdown?)` — activate slow-mo for `durationMs`
 *     real-time milliseconds. `slowdown` is the scale factor in (0, 1]:
 *     0.4 means "play at 40% speed" (i.e., animations take 2.5x longer).
 *     Defaults: durationMs=600, slowdown=0.4.
 *   - `isActive` — boolean, true while slow-mo is on. Consumers can read
 *     this and adjust their own `setTimeout` calls (e.g., delay a follow-up
 *     state change by `1/slowdown` while active).
 *
 * Implementation notes:
 *   - The injected rule uses `* { animation-duration: ... !important; ... }`
 *     scoped under the activation class. This affects CSS animations and
 *     transitions, which is what we visually want. It does NOT slow down
 *     React state updates / setTimeout — that's why `isActive` is exposed.
 *   - Reduced motion: the hook becomes a no-op (no class applied, no
 *     stylesheet effects), but `isActive` still flips so consumers can opt
 *     into a non-visual delay if they wish.
 *   - Idempotent style injection (id-tagged <style>).
 */

const STYLE_ELEMENT_ID = '__toeic_slowmo_styles__';
const ACTIVE_CLASS = 'toeic-slowmo-active';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ensureStylesInjected(slowdown: number): void {
  if (typeof document === 'undefined') return;

  const clamped = Math.max(0.05, Math.min(1, slowdown));
  // Animations/transitions take 1/clamped times longer.
  const factor = (1 / clamped).toFixed(3);

  const css = `
.${ACTIVE_CLASS} *,
.${ACTIVE_CLASS} *::before,
.${ACTIVE_CLASS} *::after {
  animation-duration: calc(var(--toeic-slowmo-base-anim, 1s) * ${factor}) !important;
  transition-duration: calc(var(--toeic-slowmo-base-trans, 200ms) * ${factor}) !important;
}
`;

  const existing = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (existing) {
    if (existing.dataset.factor !== factor) {
      existing.textContent = css;
      existing.dataset.factor = factor;
    }
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.dataset.factor = factor;
  style.textContent = css;
  document.head.appendChild(style);
}

export function useSlowMotion(): {
  trigger: (durationMs?: number, slowdown?: number) => void;
  isActive: boolean;
} {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Always strip the activation class on unmount so a torn-down owner
      // doesn't leave the page stuck in slow-mo.
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove(ACTIVE_CLASS);
      }
    };
  }, []);

  const trigger = useCallback(
    (durationMs: number = 600, slowdown: number = 0.4) => {
      if (typeof document === 'undefined') return;

      const reduce = prefersReducedMotion();

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!reduce) {
        ensureStylesInjected(slowdown);
        document.documentElement.classList.add(ACTIVE_CLASS);
      }

      setIsActive(true);

      timeoutRef.current = window.setTimeout(() => {
        document.documentElement.classList.remove(ACTIVE_CLASS);
        setIsActive(false);
        timeoutRef.current = null;
      }, Math.max(0, durationMs));
    },
    [],
  );

  return { trigger, isActive };
}
