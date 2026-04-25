import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * BloodSplatter — a static SVG splatter that lingers, drips slightly, then
 * fades. Used for impact ground-stains after a heavy hit.
 *
 * Visual: layered ellipses + irregular blobs around an organic center, with
 * surrounding splash droplets when intensity = 'heavy'. Color is a dark-red
 * radial gradient (#7f1d1d → #dc2626 in center).
 *
 * Lifecycle (default 2500ms):
 *   0      → ~80ms : scale 0.6 → 1.0 (instant pop-in)
 *   80ms   → ~70%  : hold full opacity, slowly translateY downward (drip)
 *   ~70%   → 100%  : fade opacity 1 → 0
 *
 * Reduced motion: render briefly without animation, fire onComplete.
 */

export interface BloodSplatterProps {
  x: number;
  y: number;
  size?: number;
  intensity?: 'light' | 'heavy';
  duration?: number;
  onComplete?: () => void;
}

const STYLE_ELEMENT_ID = '__toeic_blood_splatter_keyframes__';
const DEFAULT_SIZE = 80;
const DEFAULT_DURATION = 2500;
const Z_INDEX = 50;

function ensureKeyframesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  // The lifecycle splits scale-in (~3% of duration), hold w/ slow drip
  // (3%..70%), and fade (70%..100%). --drip is the px the splatter slides
  // down during the hold. The animation is driven entirely by keyframes so
  // we don't need RAF.
  style.textContent = `
@keyframes toeic-blood-splatter {
  0%   { transform: translate(-50%, -50%) scale(0.55); opacity: 0;   }
  3%   { transform: translate(-50%, -50%) scale(1.05); opacity: 1;   }
  6%   { transform: translate(-50%, -50%) scale(1.00); opacity: 1;   }
  70%  { transform: translate(-50%, calc(-50% + var(--drip, 14px))) scale(1.0); opacity: 1; }
  100% { transform: translate(-50%, calc(-50% + var(--drip, 14px) + 4px)) scale(1.0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes toeic-blood-splatter {
    0%,100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
  }
}
`;
  document.head.appendChild(style);
}

ensureKeyframesInjected();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Blob {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  fill: string;
  opacity: number;
}

interface Droplet {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}

interface SplatterShape {
  blobs: Blob[];
  droplets: Droplet[];
}

const DARK = '#7f1d1d';
const MID = '#991b1b';
const BRIGHT = '#dc2626';

function buildShape(intensity: 'light' | 'heavy'): SplatterShape {
  // Coordinates are normalized to a 100x100 viewBox; the SVG scales to size.
  const blobs: Blob[] = [];
  const droplets: Droplet[] = [];

  // Organic center: 4-6 overlapping ellipses with varying angle/colors.
  const centerCount = intensity === 'heavy' ? 6 : 4;
  for (let i = 0; i < centerCount; i++) {
    const cx = 50 + (Math.random() - 0.5) * 14;
    const cy = 50 + (Math.random() - 0.5) * 14;
    const rx = 16 + Math.random() * 14;
    const ry = 12 + Math.random() * 14;
    const rotate = Math.random() * 180;
    const fill = i === 0 ? DARK : i === 1 ? MID : Math.random() < 0.5 ? MID : BRIGHT;
    const opacity = 0.85 + Math.random() * 0.15;
    blobs.push({ cx, cy, rx, ry, rotate, fill, opacity });
  }

  // A few jagged "spikes" off the center to break the ellipse silhouette.
  const spikeCount = intensity === 'heavy' ? 8 : 4;
  for (let i = 0; i < spikeCount; i++) {
    const angle = (i / spikeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
    const dist = 18 + Math.random() * (intensity === 'heavy' ? 18 : 8);
    const cx = 50 + Math.cos(angle) * dist;
    const cy = 50 + Math.sin(angle) * dist;
    const rx = 4 + Math.random() * 7;
    const ry = 2 + Math.random() * 4;
    const rotate = (angle * 180) / Math.PI;
    blobs.push({
      cx,
      cy,
      rx,
      ry,
      rotate,
      fill: Math.random() < 0.5 ? MID : DARK,
      opacity: 0.85,
    });
  }

  // Surrounding splash droplets — 'heavy' only.
  if (intensity === 'heavy') {
    const dropCount = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 38 + Math.random() * 14;
      const cx = 50 + Math.cos(angle) * dist;
      const cy = 50 + Math.sin(angle) * dist;
      const r = 1.2 + Math.random() * 2.6;
      const fill = Math.random() < 0.6 ? BRIGHT : MID;
      droplets.push({ cx, cy, r, fill });
    }
  } else {
    const dropCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 8;
      const cx = 50 + Math.cos(angle) * dist;
      const cy = 50 + Math.sin(angle) * dist;
      const r = 1 + Math.random() * 1.8;
      droplets.push({ cx, cy, r, fill: MID });
    }
  }

  return { blobs, droplets };
}

export function BloodSplatter(props: BloodSplatterProps): JSX.Element {
  const {
    x,
    y,
    size = DEFAULT_SIZE,
    intensity = 'heavy',
    duration = DEFAULT_DURATION,
    onComplete,
  } = props;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const shape = useMemo(() => buildShape(intensity), [intensity]);
  // Drip distance: 12-20px, randomized per mount.
  const drip = useMemo(() => 12 + Math.random() * 8, []);
  // Unique gradient id per mount in case multiple are on screen.
  const gradId = useMemo(
    () => `toeic-blood-grad-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  useEffect(() => {
    ensureKeyframesInjected();
    const wait = prefersReducedMotion() ? 0 : duration;
    const timer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [duration]);

  // For reduced motion we skip the visual entirely — the effect above still
  // fires onComplete so flow continues.
  if (prefersReducedMotion()) {
    return <></>;
  }

  // Heavy gets a slightly larger render footprint to fit splash droplets.
  const renderSize = intensity === 'heavy' ? size * 1.4 : size;

  const wrapperStyle: CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    width: renderSize,
    height: renderSize,
    pointerEvents: 'none',
    zIndex: Z_INDEX,
    transform: 'translate(-50%, -50%)',
    animationName: 'toeic-blood-splatter',
    animationDuration: `${duration}ms`,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    ['--drip' as string]: `${drip}px`,
    willChange: 'transform, opacity',
    // imageRendering is harmless on SVG and keeps any rasterized fallback crisp.
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
  };

  return (
    <div style={wrapperStyle} aria-hidden>
      <svg
        width={renderSize}
        height={renderSize}
        viewBox="0 0 100 100"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={BRIGHT} stopOpacity={1} />
            <stop offset="55%" stopColor={MID} stopOpacity={1} />
            <stop offset="100%" stopColor={DARK} stopOpacity={1} />
          </radialGradient>
        </defs>

        {/* Faint dark halo behind the main pool to soften the silhouette. */}
        <ellipse
          cx={50}
          cy={50}
          rx={32}
          ry={26}
          fill={DARK}
          opacity={0.55}
        />

        {shape.blobs.map((b, i) => (
          <ellipse
            key={`b-${i}`}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            transform={`rotate(${b.rotate} ${b.cx} ${b.cy})`}
            fill={i === 0 ? `url(#${gradId})` : b.fill}
            opacity={b.opacity}
          />
        ))}

        {/* Bright central highlight to make it read as wet/fresh. */}
        <ellipse cx={50} cy={48} rx={9} ry={6} fill={BRIGHT} opacity={0.9} />

        {shape.droplets.map((d, i) => (
          <circle
            key={`d-${i}`}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.fill}
            opacity={0.95}
          />
        ))}
      </svg>
    </div>
  );
}
