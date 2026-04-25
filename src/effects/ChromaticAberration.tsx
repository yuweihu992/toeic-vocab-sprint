import type { CSSProperties } from 'react';

/**
 * ChromaticAberration — DOOM-style RGB-split overlay for "you got crit /
 * you took a heavy hit" feedback.
 *
 * Implementation:
 *   Two thin full-screen tinted overlays sit on top of the UI with
 *   `mix-blend-mode: screen`:
 *     - red layer (#ff0000), shifted left  by `intensity` px
 *     - cyan layer (#00ffff), shifted right by `intensity` px
 *   When `active` becomes true the layers fade in over 100ms; when false
 *   they fade out over 250ms. Opacity is kept subtle so the underlying UI
 *   remains visible — the user perceives a color "fringe" at the edges.
 *
 * Reduced motion: layers are still rendered (the information lands), but
 * fade transitions are reduced to ~30ms.
 */

interface Props {
  active: boolean;
  intensity?: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const TARGET_OPACITY = 0.2;

export function ChromaticAberration(props: Props): JSX.Element {
  const { active, intensity = 4 } = props;

  const reduce = prefersReducedMotion();
  const fadeInMs = reduce ? 30 : 100;
  const fadeOutMs = reduce ? 30 : 250;
  const transitionMs = active ? fadeInMs : fadeOutMs;
  const opacity = active ? TARGET_OPACITY : 0;

  const baseLayer: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    opacity,
    transition: `opacity ${transitionMs}ms ease-out, transform ${transitionMs}ms ease-out`,
    willChange: 'opacity, transform',
  };

  // Use thin inset box-shadow rings to fringe the edges with red on the left
  // and cyan on the right — pairs with the screen-blend tint to "split" the
  // perceived image without literally splitting the DOM.
  const redLayer: CSSProperties = {
    ...baseLayer,
    zIndex: 9996,
    transform: `translate3d(${-intensity}px, 0, 0)`,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    boxShadow: `inset ${intensity * 2}px 0 ${intensity * 4}px rgba(255,0,0,0.45)`,
  };

  const cyanLayer: CSSProperties = {
    ...baseLayer,
    zIndex: 9996,
    transform: `translate3d(${intensity}px, 0, 0)`,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    boxShadow: `inset ${-intensity * 2}px 0 ${intensity * 4}px rgba(0,255,255,0.45)`,
  };

  return (
    <>
      <div style={redLayer} aria-hidden />
      <div style={cyanLayer} aria-hidden />
    </>
  );
}
