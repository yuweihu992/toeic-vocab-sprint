import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * FloatingNumber — a damage / heal / miss number that floats up & fades.
 *
 * Variants:
 *   damage : white,  32px, bold, black stroke
 *   crit   : yellow, 48px, bold, red stroke, scaled-up entry
 *   heal   : green,  32px, bold
 *   miss   : gray,   24px, italic, prints "MISS!" rather than the number
 *
 * Animation: lifts ~60px upward over 800ms while fading 1 -> 0. Crit gets
 * an extra pop-in scale curve.
 *
 * Reduced motion: rendered briefly without movement, onComplete fires.
 */

interface Props {
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'crit' | 'heal' | 'miss';
  onComplete?: () => void;
}

const STYLE_ELEMENT_ID = '__toeic_floating_number_keyframes__';
const DURATION_MS = 800;

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
@keyframes toeic-float-up {
  0%   { transform: translate3d(-50%, 0, 0) scale(1);   opacity: 0; }
  10%  { transform: translate3d(-50%, -6px, 0) scale(1); opacity: 1; }
  100% { transform: translate3d(-50%, -60px, 0) scale(1); opacity: 0; }
}
@keyframes toeic-float-up-crit {
  0%   { transform: translate3d(-50%, 0, 0) scale(0.4);  opacity: 0; }
  15%  { transform: translate3d(-50%, -8px, 0) scale(1.3); opacity: 1; }
  35%  { transform: translate3d(-50%, -14px, 0) scale(1.0); opacity: 1; }
  100% { transform: translate3d(-50%, -60px, 0) scale(0.95); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-float-up      { 0%,100% { opacity: 0; transform: translate3d(-50%,0,0); } }
  @keyframes toeic-float-up-crit { 0%,100% { opacity: 0; transform: translate3d(-50%,0,0); } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface VariantStyle {
  color: string;
  fontSize: number;
  fontStyle?: 'italic' | 'normal';
  fontWeight: number;
  textShadow: string;
  animationName: string;
}

function getVariantStyle(type: Props['type']): VariantStyle {
  switch (type) {
    case 'crit':
      return {
        color: '#facc15',
        fontSize: 48,
        fontWeight: 900,
        // Red text "stroke" via layered text-shadows.
        textShadow:
          '-2px -2px 0 #b91c1c, 2px -2px 0 #b91c1c, -2px 2px 0 #b91c1c, 2px 2px 0 #b91c1c, 0 0 8px rgba(185,28,28,0.6)',
        animationName: 'toeic-float-up-crit',
      };
    case 'heal':
      return {
        color: '#10b981',
        fontSize: 32,
        fontWeight: 800,
        textShadow:
          '-1px -1px 0 #064e3b, 1px -1px 0 #064e3b, -1px 1px 0 #064e3b, 1px 1px 0 #064e3b',
        animationName: 'toeic-float-up',
      };
    case 'miss':
      return {
        color: '#9ca3af',
        fontSize: 24,
        fontWeight: 700,
        fontStyle: 'italic',
        textShadow:
          '-1px -1px 0 #1f2937, 1px -1px 0 #1f2937, -1px 1px 0 #1f2937, 1px 1px 0 #1f2937',
        animationName: 'toeic-float-up',
      };
    case 'damage':
    default:
      return {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 800,
        textShadow:
          '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        animationName: 'toeic-float-up',
      };
  }
}

export function FloatingNumber(props: Props): JSX.Element {
  const { value, x, y, type, onComplete } = props;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    ensureKeyframesInjected();
    const wait = prefersReducedMotion() ? 0 : DURATION_MS;
    const timer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, wait);
    return () => window.clearTimeout(timer);
  }, []);

  const variant = getVariantStyle(type);
  const label = type === 'miss' ? 'MISS!' : String(value);

  const style: CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    pointerEvents: 'none',
    zIndex: 10000,
    color: variant.color,
    fontSize: variant.fontSize,
    fontWeight: variant.fontWeight,
    fontStyle: variant.fontStyle ?? 'normal',
    textShadow: variant.textShadow,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    lineHeight: 1,
    letterSpacing: type === 'crit' ? '0.04em' : '0.02em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    // Center horizontally on (x,y); the keyframes include translate(-50%,...).
    transform: 'translate3d(-50%, 0, 0)',
    animationName: variant.animationName,
    animationDuration: `${DURATION_MS}ms`,
    animationTimingFunction: 'cubic-bezier(.22,.61,.36,1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
  };

  return (
    <div style={style} aria-hidden>
      {label}
    </div>
  );
}
