import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * ScreenFlash — a full-screen color flash for big-hit feedback (DOOM-style).
 *
 * Usage: increment `triggerKey` each time you want a fresh flash. The same
 * key won't retrigger; the component watches the key for changes.
 *
 *   - opacity quickly ramps 0 -> intensity over ~50ms
 *   - then back to 0 over the rest of `duration`
 *
 * Reduced motion: a brief 30%-intensity solid flash with no animation.
 */

interface Props {
  /** Increment this number to trigger a fresh flash; same key won't retrigger. */
  triggerKey: number;
  color?: string;
  duration?: number;
  intensity?: number;
}

const RAMP_IN_MS = 50;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Phase = 'idle' | 'in' | 'out';

export function ScreenFlash(props: Props): JSX.Element {
  const { triggerKey, color = 'white', duration = 200, intensity = 0.6 } = props;

  const [phase, setPhase] = useState<Phase>('idle');
  const inTimerRef = useRef<number | null>(null);
  const outTimerRef = useRef<number | null>(null);
  // The first render shouldn't trigger a flash — only subsequent triggerKey
  // changes should. Track whether we've seen the first key yet.
  const lastKeyRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (inTimerRef.current !== null) window.clearTimeout(inTimerRef.current);
      if (outTimerRef.current !== null) window.clearTimeout(outTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Skip first observation: don't auto-flash on mount.
    if (lastKeyRef.current === null) {
      lastKeyRef.current = triggerKey;
      return;
    }
    if (lastKeyRef.current === triggerKey) return;
    lastKeyRef.current = triggerKey;

    if (inTimerRef.current !== null) {
      window.clearTimeout(inTimerRef.current);
      inTimerRef.current = null;
    }
    if (outTimerRef.current !== null) {
      window.clearTimeout(outTimerRef.current);
      outTimerRef.current = null;
    }

    const reduce = prefersReducedMotion();

    if (reduce) {
      // Brief solid flash at 30% intensity, no animation.
      setPhase('in');
      outTimerRef.current = window.setTimeout(() => {
        setPhase('idle');
        outTimerRef.current = null;
      }, Math.max(60, Math.min(duration, 120)));
      return;
    }

    setPhase('in');
    inTimerRef.current = window.setTimeout(() => {
      setPhase('out');
      const outMs = Math.max(0, duration - RAMP_IN_MS);
      outTimerRef.current = window.setTimeout(() => {
        setPhase('idle');
        outTimerRef.current = null;
      }, outMs);
      inTimerRef.current = null;
    }, RAMP_IN_MS);
  }, [triggerKey, duration]);

  const reduce = prefersReducedMotion();
  const clamped = Math.max(0, Math.min(1, intensity));

  let opacity = 0;
  let transitionMs = RAMP_IN_MS;
  if (phase === 'in') {
    opacity = reduce ? clamped * 0.3 : clamped;
    transitionMs = RAMP_IN_MS;
  } else if (phase === 'out') {
    opacity = 0;
    transitionMs = Math.max(0, duration - RAMP_IN_MS);
  } else {
    opacity = 0;
    transitionMs = RAMP_IN_MS;
  }

  const style: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 9997,
    backgroundColor: color,
    opacity,
    transition: reduce ? 'none' : `opacity ${transitionMs}ms ease-out`,
    willChange: 'opacity',
  };

  return <div style={style} aria-hidden />;
}
