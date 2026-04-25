// Shared helper: renders a 2D character grid as one <rect> per same-color run.
// Each character file constructs grids per state and reuses this renderer.

import { memo, type ReactElement } from 'react';

interface PixelGridProps {
  /** Rows of single-char codes; '.' or ' ' = transparent. */
  rows: readonly string[];
  /** Maps char codes to CSS color strings. */
  palette: Readonly<Record<string, string>>;
  /** Logical pixel width per cell (default 1). */
  cell?: number;
}

function isTransparent(ch: string): boolean {
  return ch === '.' || ch === ' ' || ch === '';
}

export const PixelGrid = memo(function PixelGrid({
  rows,
  palette,
  cell = 1,
}: PixelGridProps): ReactElement {
  const out: ReactElement[] = [];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] ?? '';
    let runStart = -1;
    let runColor = '';
    for (let x = 0; x <= row.length; x++) {
      const ch = row[x] ?? '.';
      const color = isTransparent(ch) ? '' : palette[ch] ?? '';
      if (color !== runColor || x === row.length) {
        if (runStart >= 0 && runColor) {
          out.push(
            <rect
              key={`${y}-${runStart}`}
              x={runStart * cell}
              y={y * cell}
              width={(x - runStart) * cell}
              height={cell}
              fill={runColor}
              shapeRendering="crispEdges"
            />,
          );
        }
        runStart = color ? x : -1;
        runColor = color;
      }
    }
  }
  return <>{out}</>;
});
