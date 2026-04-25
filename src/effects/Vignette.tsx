import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * Vignette — full-screen red radial-gradient overlay used for "you got hit".
 *
 * Lifecycle when `active` flips true:
 *   - opacity 0 -> intensity over 100ms (fast in)
 *   - opacity intensity -> 0 over 400ms (slower out)
 * Then it sits at 0 again until `active` flips true once more. Pass a fresh
 * `active=true` (e.g. by toggling false->true) for each hit.
 *
 * Reduced motion: still flashes, but with much shorter durations.
 */

interface Props {
  active: boolean;
  intensity?: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Phase = 'idle' | 'in' | 'out';

export function Vignette(props: Props): JSX.Element {
  const { active, intensity = 0.5 } = props;

  const [phase, setPhase] = useState<Phase>('idle');
  const inTimerRef = useRef<number | null>(null);
  const outTimerRef = useRef<number | null>(null);

  // Clear any pending timers on unmount.
  useEffect(() => {
    return () => {
      if (inTimerRef.current !== null) window.clearTimeout(inTimerRef.current);
      if (outTimerRef.current !== null) window.clearTimeout(outTimerRef.current);
    };
  }, []);

  // Drive the in/out cycle whenever `active` becomes true.
  useEffect(() => {
    if (!active) return;

    const reduce = prefersReducedMotion();
    const inMs = reduce ? 30 : 100;
    const outMs = reduce ? 80 : 400;

    if (inTimerRef.current !== null) window.clearTimeout(inTimerRef.current);
    if (outTimerRef.current !== null) window.clearTimeout(outTimerRef.current);

    setPhase('in');
    inTimerRef.current = window.setTimeout(() => {
      setPhase('out');
      outTimerRef.current = window.setTimeout(() => {
        setPhase('idle');
        outTimerRef.current = null;
      }, outMs);
      inTimerRef.current = null;
    }, inMs);
  }, [active]);

  const reduce = prefersReducedMotion();
  const inMs = reduce ? 30 : 100;
  const outMs = reduce ? 80 : 400;

  // Clamp intensity into [0,1].
  const clamped = Math.max(0, Math.min(1, intensity));

  let opacity = 0;
  let transitionMs = inMs;
  if (phase === 'in') {
    opacity = clamped;
    transitionMs = inMs;
  } else if (phase === 'out') {
    opacity = 0;
    transitionMs = outMs;
  } else {
    opacity = 0;
    transitionMs = outMs;
  }

  const style: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 9998,
    opacity,
    transition: `opacity ${transitionMs}ms ease-out`,
    background:
      'radial-gradient(ellipse at center, rgba(239,68,68,0) 35%, rgba(220,38,38,0.55) 75%, rgba(127,29,29,0.95) 100%)',
    willChange: 'opacity',
  };

  return <div style={style} aria-hidden />;
}
