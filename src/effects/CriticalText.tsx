import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * CriticalText — slams a giant brutality text overlay in the middle of the
 * screen for ~600-900ms (variant dependent), then unmounts (via onComplete).
 *
 * Variants:
 *   - 'critical' (default, existing behavior): "CRITICAL!" yellow, 600ms
 *   - 'brutal':    "BRUTAL!" red-orange aggressive shake + edge glow, 700ms
 *   - 'overkill':  "OVERKILL!" big DOOM-red zoom w/ chromatic split, 900ms
 *   - 'rampage':   "RAMPAGE!" purple-magenta italic slide-in, 700ms
 *   - 'fever':     "FEVER!" rainbow rotating gradient, 800ms
 *
 * Reduced motion: still rendered briefly so the *information* lands, but
 * without scaling/rotation/skew.
 */

export type CritVariant = 'critical' | 'brutal' | 'overkill' | 'rampage' | 'fever';

interface Props {
  variant?: CritVariant;
  onComplete?: () => void;
}

const STYLE_ELEMENT_ID = '__toeic_critical_text_keyframes__';

interface VariantConfig {
  duration: number;
  label: string;
  color: string;
  fontSize: number;
  letterSpacing: string;
  textShadow: string;
  fontStyle?: 'italic' | 'normal';
  animationName: string;
  animationTiming: string;
  /** Optional extra layered text (chromatic split for overkill). */
  rgbSplit?: boolean;
  /** Optional skew to apply to wrapper. */
  skewDeg?: number;
  /** Optional backdrop pulse (brutal) — adds an absolute backdrop element. */
  backdropPulse?: 'red' | null;
  /** Use a rainbow animated gradient as text fill (fever). */
  rainbow?: boolean;
}

const VARIANTS: Record<CritVariant, VariantConfig> = {
  critical: {
    duration: 600,
    label: 'CRITICAL!',
    color: '#facc15',
    fontSize: 96,
    letterSpacing: '0.06em',
    textShadow: [
      '-3px -3px 0 #b91c1c',
      '3px -3px 0 #b91c1c',
      '-3px 3px 0 #b91c1c',
      '3px 3px 0 #b91c1c',
      '0 0 16px rgba(185,28,28,0.7)',
      '0 0 32px rgba(250,204,21,0.4)',
    ].join(', '),
    animationName: 'toeic-critical-pop',
    animationTiming: 'cubic-bezier(.34,1.56,.64,1)',
  },
  brutal: {
    duration: 700,
    label: 'BRUTAL!',
    color: '#f97316',
    fontSize: 110,
    letterSpacing: '0.08em',
    textShadow: [
      '-3px -3px 0 #000',
      '3px -3px 0 #000',
      '-3px 3px 0 #000',
      '3px 3px 0 #000',
      '0 0 24px rgba(249,115,22,0.85)',
      '0 0 48px rgba(220,38,38,0.6)',
    ].join(', '),
    animationName: 'toeic-critical-brutal',
    animationTiming: 'cubic-bezier(.36,.07,.19,.97)',
    backdropPulse: 'red',
  },
  overkill: {
    duration: 900,
    label: 'OVERKILL!',
    color: '#dc2626',
    fontSize: 130,
    letterSpacing: '0.1em',
    textShadow: [
      '-4px -4px 0 #450a0a',
      '4px -4px 0 #450a0a',
      '-4px 4px 0 #450a0a',
      '4px 4px 0 #450a0a',
      '0 0 24px rgba(0,0,0,0.9)',
      '0 0 48px rgba(0,0,0,0.7)',
      '0 0 80px rgba(220,38,38,0.6)',
    ].join(', '),
    animationName: 'toeic-critical-overkill',
    animationTiming: 'cubic-bezier(.34,1.56,.64,1)',
    rgbSplit: true,
  },
  rampage: {
    duration: 700,
    label: 'RAMPAGE!',
    color: '#d946ef',
    fontSize: 110,
    letterSpacing: '0.08em',
    textShadow: [
      '-3px -3px 0 #ec4899',
      '3px -3px 0 #ec4899',
      '-3px 3px 0 #ec4899',
      '3px 3px 0 #ec4899',
      '0 0 20px rgba(236,72,153,0.8)',
      '0 0 40px rgba(217,70,239,0.5)',
    ].join(', '),
    fontStyle: 'italic',
    animationName: 'toeic-critical-rampage',
    animationTiming: 'cubic-bezier(.22,1,.36,1)',
    skewDeg: -8,
  },
  fever: {
    duration: 800,
    label: 'FEVER!',
    color: '#fff',
    fontSize: 100,
    letterSpacing: '0.07em',
    textShadow: [
      '0 0 12px rgba(255,255,255,0.6)',
      '0 0 24px rgba(255,255,255,0.4)',
    ].join(', '),
    animationName: 'toeic-critical-fever',
    animationTiming: 'cubic-bezier(.34,1.56,.64,1)',
    rainbow: true,
  },
};

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
@keyframes toeic-critical-pop {
  /* 0-150ms (0%-25%) : pop in */
  0%   { transform: translate(-50%, -50%) scale(0.5) rotate(-3deg); opacity: 0; }
  15%  { opacity: 1; }
  25%  { transform: translate(-50%, -50%) scale(1.2) rotate(3deg);  opacity: 1; }
  /* 150-350ms (25%-58%) : settle & hold */
  40%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);  opacity: 1; }
  58%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);  opacity: 1; }
  /* 350-600ms (58%-100%) : fade & drift up */
  100% { transform: translate(-50%, -60%) scale(1.05) rotate(0deg); opacity: 0; }
}
@keyframes toeic-critical-brutal {
  0%   { transform: translate(-50%, -50%) scale(0.4) rotate(-6deg); opacity: 0; }
  12%  { opacity: 1; }
  22%  { transform: translate(-50%, -50%) scale(1.25) rotate(6deg);  opacity: 1; }
  32%  { transform: translate(-50%, -50%) scale(1.0) rotate(-4deg);  opacity: 1; }
  42%  { transform: translate(-50%, -50%) scale(1.05) rotate(4deg);  opacity: 1; }
  55%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);   opacity: 1; }
  70%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);   opacity: 1; }
  100% { transform: translate(-50%, -62%) scale(1.08) rotate(0deg);  opacity: 0; }
}
@keyframes toeic-critical-brutal-backdrop {
  0%   { opacity: 0; }
  20%  { opacity: 0.55; }
  60%  { opacity: 0.25; }
  100% { opacity: 0; }
}
@keyframes toeic-critical-overkill {
  0%   { transform: translate(-50%, -50%) scale(0.3) rotate(-2deg); opacity: 0; }
  10%  { opacity: 1; }
  25%  { transform: translate(-50%, -50%) scale(1.4) rotate(2deg);  opacity: 1; }
  40%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);  opacity: 1; }
  /* hold ~350ms */
  78%  { transform: translate(-50%, -50%) scale(1.0) rotate(0deg);  opacity: 1; }
  100% { transform: translate(-50%, -58%) scale(1.1) rotate(0deg);  opacity: 0; }
}
@keyframes toeic-critical-rampage {
  0%   { transform: translate(-220%, -50%) skewX(-8deg) scale(0.9); opacity: 0; }
  20%  { transform: translate(-50%, -50%)  skewX(-8deg) scale(1.15); opacity: 1; }
  35%  { transform: translate(-50%, -50%)  skewX(-8deg) scale(1.0);  opacity: 1; }
  70%  { transform: translate(-50%, -50%)  skewX(-8deg) scale(1.0);  opacity: 1; }
  100% { transform: translate(40%, -55%)   skewX(-8deg) scale(1.05); opacity: 0; }
}
@keyframes toeic-critical-fever {
  0%   { transform: translate(-50%, -50%) scale(0.6) rotate(-4deg); opacity: 0; }
  18%  { opacity: 1; }
  28%  { transform: translate(-50%, -50%) scale(1.15) rotate(2deg); opacity: 1; }
  50%  { transform: translate(-50%, -50%) scale(1.0)  rotate(-2deg); opacity: 1; }
  72%  { transform: translate(-50%, -50%) scale(1.0)  rotate(2deg);  opacity: 1; }
  100% { transform: translate(-50%, -58%) scale(1.05) rotate(0deg);  opacity: 0; }
}
@keyframes toeic-critical-fever-hue {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-critical-pop {
    0%   { transform: translate(-50%, -50%); opacity: 0; }
    20%  { transform: translate(-50%, -50%); opacity: 1; }
    80%  { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -50%); opacity: 0; }
  }
  @keyframes toeic-critical-brutal {
    0%   { transform: translate(-50%, -50%); opacity: 0; }
    20%  { transform: translate(-50%, -50%); opacity: 1; }
    80%  { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -50%); opacity: 0; }
  }
  @keyframes toeic-critical-overkill {
    0%   { transform: translate(-50%, -50%); opacity: 0; }
    20%  { transform: translate(-50%, -50%); opacity: 1; }
    80%  { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -50%); opacity: 0; }
  }
  @keyframes toeic-critical-rampage {
    0%   { transform: translate(-50%, -50%) skewX(-8deg); opacity: 0; }
    20%  { transform: translate(-50%, -50%) skewX(-8deg); opacity: 1; }
    80%  { transform: translate(-50%, -50%) skewX(-8deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) skewX(-8deg); opacity: 0; }
  }
  @keyframes toeic-critical-fever {
    0%   { transform: translate(-50%, -50%); opacity: 0; }
    20%  { transform: translate(-50%, -50%); opacity: 1; }
    80%  { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -50%); opacity: 0; }
  }
  @keyframes toeic-critical-brutal-backdrop {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.3; }
  }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

export function CriticalText(props: Props): JSX.Element {
  const { variant = 'critical', onComplete } = props;
  const config = VARIANTS[variant];

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    ensureKeyframesInjected();
    const timer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, config.duration);
    return () => window.clearTimeout(timer);
  }, [config.duration]);

  const wrapperStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseTextStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: config.fontSize,
    fontWeight: 900,
    color: config.color,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI Black', Roboto, 'Helvetica Neue', Arial, sans-serif",
    letterSpacing: config.letterSpacing,
    textTransform: 'uppercase',
    textShadow: config.textShadow,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    fontStyle: config.fontStyle ?? 'normal',
    animationName: config.animationName,
    animationDuration: `${config.duration}ms`,
    animationTimingFunction: config.animationTiming,
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
  };

  // Optional backdrop pulse (brutal variant)
  const backdropEl =
    config.backdropPulse === 'red' ? (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, rgba(220,38,38,0) 30%, rgba(220,38,38,0.45) 70%, rgba(127,29,29,0.85) 100%)',
          animationName: 'toeic-critical-brutal-backdrop',
          animationDuration: `${config.duration}ms`,
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          willChange: 'opacity',
        }}
      />
    ) : null;

  // Rainbow text fill via background-clip (fever variant)
  const rainbowOverrides: CSSProperties = config.rainbow
    ? {
        backgroundImage:
          'linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        animationName: `${config.animationName}, toeic-critical-fever-hue`,
        animationDuration: `${config.duration}ms, ${config.duration}ms`,
        animationTimingFunction: `${config.animationTiming}, linear`,
        animationFillMode: 'forwards, forwards',
        animationIterationCount: '1, 1',
      }
    : {};

  // Chromatic-aberration "RGB split" layers for overkill — three offset copies.
  const rgbSplitLayers: JSX.Element[] = [];
  if (config.rgbSplit) {
    const sharedSplitStyle: CSSProperties = {
      ...baseTextStyle,
      color: config.color,
      textShadow: 'none',
      mixBlendMode: 'screen',
    };
    rgbSplitLayers.push(
      <div
        key="split-r"
        aria-hidden
        style={{
          ...sharedSplitStyle,
          color: '#ff0040',
          transform: 'translate(calc(-50% - 3px), -50%)',
          opacity: 0.7,
          textShadow: 'none',
        }}
      >
        {config.label}
      </div>,
      <div
        key="split-g"
        aria-hidden
        style={{
          ...sharedSplitStyle,
          color: '#00ff80',
          transform: 'translate(-50%, -50%)',
          opacity: 0.5,
          textShadow: 'none',
        }}
      >
        {config.label}
      </div>,
      <div
        key="split-b"
        aria-hidden
        style={{
          ...sharedSplitStyle,
          color: '#00d0ff',
          transform: 'translate(calc(-50% + 3px), -50%)',
          opacity: 0.7,
          textShadow: 'none',
        }}
      >
        {config.label}
      </div>,
    );
  }

  const textStyle: CSSProperties = {
    ...baseTextStyle,
    ...rainbowOverrides,
  };

  return (
    <div style={wrapperStyle} aria-hidden>
      {backdropEl}
      {rgbSplitLayers}
      <div style={textStyle}>{config.label}</div>
    </div>
  );
}
