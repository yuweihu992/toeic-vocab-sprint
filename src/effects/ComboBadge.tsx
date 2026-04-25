import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * ComboBadge — top-screen combo counter that escalates visually with `count`.
 *
 * Tiers:
 *   - <2:    not rendered (returns null)
 *   - 2-3:   small (~24px), white-on-dark, subtle glow.
 *   - 4-6:   medium (~36px), yellow text, gold glow border, gentle bobbing.
 *   - 7-9:   large (~48px), orange text, fire-flicker shadow, bigger pulse.
 *   - 10-19: huge (~64px), animated rainbow gradient text, ⚡ icon.
 *   - 20+:   huge (~64px), rainbow text, label becomes "x∞", 💥 icon.
 *
 * On `count` change (while >=2), a 200ms scale-pop runs (1.0 -> 1.3 -> 1.0).
 *
 * Reduced motion: tiers still render with their colors, but bob/flicker/pulse
 * keyframes collapse to no-op.
 */

interface Props {
  count: number;
  position?: 'top-center' | 'top-right';
}

const STYLE_ELEMENT_ID = '__toeic_combo_badge_keyframes__';

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // We split animations between an outer "pop" wrapper (scale on count
  // change) and an inner "tier" element (bob/flicker/pulse). This keeps
  // the pop replay independent and avoids restarting the tier loop.
  style.textContent = `
@keyframes toeic-combo-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes toeic-combo-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
@keyframes toeic-combo-pulse {
  0%, 100% { transform: scale(1);    filter: brightness(1);   }
  50%      { transform: scale(1.06); filter: brightness(1.25);}
}
@keyframes toeic-combo-flicker {
  0%, 100% { text-shadow:
              0 0 6px rgba(251,146,60,0.95),
              0 0 14px rgba(249,115,22,0.85),
              0 0 26px rgba(234,88,12,0.75),
              -2px -2px 0 #7c2d12,
              2px -2px 0 #7c2d12,
              -2px 2px 0 #7c2d12,
              2px 2px 0 #7c2d12; }
  25%      { text-shadow:
              0 0 10px rgba(253,186,116,1),
              0 0 22px rgba(251,146,60,0.9),
              0 0 40px rgba(249,115,22,0.85),
              -2px -2px 0 #7c2d12,
              2px -2px 0 #7c2d12,
              -2px 2px 0 #7c2d12,
              2px 2px 0 #7c2d12; }
  55%      { text-shadow:
              0 0 4px rgba(251,146,60,0.7),
              0 0 10px rgba(249,115,22,0.6),
              0 0 18px rgba(234,88,12,0.5),
              -2px -2px 0 #7c2d12,
              2px -2px 0 #7c2d12,
              -2px 2px 0 #7c2d12,
              2px 2px 0 #7c2d12; }
  75%      { text-shadow:
              0 0 12px rgba(254,215,170,1),
              0 0 24px rgba(251,146,60,0.95),
              0 0 44px rgba(249,115,22,0.9),
              -2px -2px 0 #7c2d12,
              2px -2px 0 #7c2d12,
              -2px 2px 0 #7c2d12,
              2px 2px 0 #7c2d12; }
}
@keyframes toeic-combo-rainbow-hue {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes toeic-combo-rainbow-pulse {
  0%, 100% { transform: scale(1);    }
  50%      { transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-combo-pop      { 0%, 100% { transform: none; } }
  @keyframes toeic-combo-bob      { 0%, 100% { transform: none; } }
  @keyframes toeic-combo-pulse    { 0%, 100% { transform: none; filter: none; } }
  @keyframes toeic-combo-flicker  { 0%, 100% { text-shadow:
              0 0 6px rgba(249,115,22,0.85),
              -2px -2px 0 #7c2d12,
              2px -2px 0 #7c2d12,
              -2px 2px 0 #7c2d12,
              2px 2px 0 #7c2d12; } }
  @keyframes toeic-combo-rainbow-hue   { 0%, 100% { background-position: 0% 50%; } }
  @keyframes toeic-combo-rainbow-pulse { 0%, 100% { transform: none; } }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

type Tier = 'low' | 'mid' | 'high' | 'epic';

function tierFor(count: number): Tier {
  if (count >= 10) return 'epic';
  if (count >= 7) return 'high';
  if (count >= 4) return 'mid';
  return 'low';
}

interface TierStyle {
  fontSize: number;
  color: string;
  textShadow: string;
  borderColor?: string;
  borderShadow?: string;
  // Inner-element animation (bob, flicker, pulse, rainbow).
  innerAnimationName?: string;
  innerAnimationDuration?: string;
  innerAnimationTiming?: string;
  innerAnimationIteration?: string;
  rainbow?: boolean;
}

const TIER_STYLES: Record<Tier, TierStyle> = {
  low: {
    fontSize: 24,
    color: '#ffffff',
    textShadow: [
      '0 0 4px rgba(255,255,255,0.45)',
      '0 0 10px rgba(148,163,184,0.4)',
      '-1px -1px 0 #0f172a',
      '1px -1px 0 #0f172a',
      '-1px 1px 0 #0f172a',
      '1px 1px 0 #0f172a',
    ].join(', '),
  },
  mid: {
    fontSize: 36,
    color: '#facc15',
    textShadow: [
      '0 0 8px rgba(250,204,21,0.7)',
      '0 0 18px rgba(234,179,8,0.5)',
      '-2px -2px 0 #422006',
      '2px -2px 0 #422006',
      '-2px 2px 0 #422006',
      '2px 2px 0 #422006',
    ].join(', '),
    borderColor: 'rgba(250,204,21,0.7)',
    borderShadow:
      '0 0 12px rgba(250,204,21,0.7), 0 0 24px rgba(234,179,8,0.5), inset 0 0 8px rgba(250,204,21,0.4)',
    innerAnimationName: 'toeic-combo-bob',
    innerAnimationDuration: '900ms',
    innerAnimationTiming: 'ease-in-out',
    innerAnimationIteration: 'infinite',
  },
  high: {
    fontSize: 48,
    color: '#fb923c',
    // textShadow gets overridden by the flicker keyframe per-frame, but we
    // need a sane default for the moments between keyframe updates.
    textShadow: [
      '0 0 8px rgba(251,146,60,0.9)',
      '0 0 16px rgba(249,115,22,0.7)',
      '-2px -2px 0 #7c2d12',
      '2px -2px 0 #7c2d12',
      '-2px 2px 0 #7c2d12',
      '2px 2px 0 #7c2d12',
    ].join(', '),
    borderColor: 'rgba(249,115,22,0.8)',
    borderShadow:
      '0 0 16px rgba(249,115,22,0.8), 0 0 32px rgba(234,88,12,0.6), inset 0 0 10px rgba(251,146,60,0.4)',
    // Compose flicker (text-shadow) + pulse (scale + brightness).
    innerAnimationName: 'toeic-combo-flicker, toeic-combo-pulse',
    innerAnimationDuration: '420ms, 700ms',
    innerAnimationTiming: 'steps(4, end), ease-in-out',
    innerAnimationIteration: 'infinite, infinite',
  },
  epic: {
    fontSize: 64,
    color: '#ffffff', // overridden by gradient fill
    textShadow: [
      '0 0 14px rgba(255,255,255,0.5)',
      '0 0 28px rgba(255,255,255,0.35)',
    ].join(', '),
    borderColor: 'rgba(217,70,239,0.85)',
    borderShadow:
      '0 0 18px rgba(217,70,239,0.8), 0 0 36px rgba(59,130,246,0.55), 0 0 60px rgba(34,197,94,0.4), inset 0 0 12px rgba(236,72,153,0.5)',
    innerAnimationName: 'toeic-combo-rainbow-hue, toeic-combo-rainbow-pulse',
    innerAnimationDuration: '2200ms, 800ms',
    innerAnimationTiming: 'linear, ease-in-out',
    innerAnimationIteration: 'infinite, infinite',
    rainbow: true,
  },
};

function emojiFor(count: number): string {
  if (count >= 20) return '\u{1F4A5}'; // 💥
  if (count >= 10) return '⚡️'; // ⚡
  if (count >= 5) return '\u{1F525}'; // 🔥
  return '';
}

function labelFor(count: number): string {
  if (count >= 20) return 'x∞'; // x∞
  return `x${count}`;
}

export function ComboBadge(props: Props): JSX.Element | null {
  const { count, position = 'top-center' } = props;

  // Track which count the pop animation should be keyed to. Bumping this
  // restarts the keyframe by remounting the wrapper.
  const [popKey, setPopKey] = useState<number>(0);
  const lastCountRef = useRef<number>(count);

  useEffect(() => {
    ensureKeyframesInjected();
  }, []);

  useEffect(() => {
    if (count >= 2 && count !== lastCountRef.current) {
      setPopKey((k) => k + 1);
    }
    lastCountRef.current = count;
  }, [count]);

  if (count < 2) return null;

  const tier = tierFor(count);
  const tierStyle = TIER_STYLES[tier];
  const label = labelFor(count);
  const emoji = emojiFor(count);

  // Outer wrapper anchors position (fixed) and is non-interactive.
  const outerStyle: CSSProperties = {
    position: 'fixed',
    top: 16,
    left: position === 'top-center' ? '50%' : undefined,
    right: position === 'top-right' ? 16 : undefined,
    transform: position === 'top-center' ? 'translateX(-50%)' : undefined,
    pointerEvents: 'none',
    zIndex: 10000,
    userSelect: 'none',
  };

  // Mid-wrapper plays the scale-pop on each count change, keyed by popKey
  // so React remounts it and the keyframe replays from 0.
  const popStyle: CSSProperties = {
    animationName: 'toeic-combo-pop',
    animationDuration: '200ms',
    animationTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
    animationIterationCount: 1,
    animationFillMode: 'forwards',
    willChange: 'transform',
  };

  // Pill (badge) container — dark background, optional glowing border.
  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tier === 'low' ? 6 : 10,
    padding:
      tier === 'low'
        ? '4px 10px'
        : tier === 'mid'
          ? '6px 14px'
          : tier === 'high'
            ? '8px 18px'
            : '10px 22px',
    borderRadius: 9999,
    background:
      tier === 'epic'
        ? 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,27,75,0.92))'
        : 'rgba(15,23,42,0.85)',
    border: tierStyle.borderColor ? `2px solid ${tierStyle.borderColor}` : '1px solid rgba(255,255,255,0.15)',
    boxShadow: tierStyle.borderShadow ?? '0 2px 10px rgba(0,0,0,0.4)',
  };

  // Inner element runs the per-tier animation (bob / flicker+pulse / rainbow).
  const innerBaseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tier === 'low' ? 6 : 10,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI Black', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: 900,
    fontSize: tierStyle.fontSize,
    lineHeight: 1,
    letterSpacing: '0.04em',
    color: tierStyle.color,
    textShadow: tierStyle.textShadow,
    willChange: 'transform, filter',
    animationName: tierStyle.innerAnimationName,
    animationDuration: tierStyle.innerAnimationDuration,
    animationTimingFunction: tierStyle.innerAnimationTiming,
    animationIterationCount: tierStyle.innerAnimationIteration,
  };

  // Rainbow text fill via background-clip for the epic tier. We keep the
  // text-shadow on the wrapper (white halo) and put the gradient on the
  // text fill itself.
  const rainbowText: CSSProperties = tierStyle.rainbow
    ? {
        backgroundImage:
          'linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }
    : {};

  // Build the visual: optional emoji, label text. Emoji is its own span so
  // the rainbow background-clip on the label doesn't affect it.
  const labelStyle: CSSProperties = {
    ...rainbowText,
  };

  return (
    <div style={outerStyle} aria-hidden>
      <div key={popKey} style={popStyle}>
        <div style={pillStyle}>
          <div style={innerBaseStyle}>
            {emoji ? <span style={{ fontSize: tierStyle.fontSize * 0.85 }}>{emoji}</span> : null}
            <span style={labelStyle}>{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
