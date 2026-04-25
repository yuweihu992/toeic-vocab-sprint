// Character: Tax Fiend (稅單怪)
// A small horned imp with a calculator embedded in its chest displaying
// numbers like "9999.99" on a green LCD. Two short curved horns, hooved
// feet, pointy tail. Holds a 1040-style tax form with red ink grid lines
// in one hand and an oversize wooden pen in the other. Devilish grin
// with sharp teeth. Faces LEFT.
// Reference: D&D imp + accountant trope.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── Palette ────────────────────────────────────────────────
   16 unique glyphs. Light comes from upper-left.
   ───────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // Red imp skin (deepest shadow → highlight)
  D: '#450a0a',
  R: '#7f1d1d',
  r: '#b91c1c',
  S: '#dc2626',
  s: '#ef4444',
  // Bone white (horns, teeth, form paper highlight)
  B: '#fef3c7',
  b: '#d6d3d1',
  // Hooves (deep black → shadow)
  K: '#0c0a09',
  H: '#1c1917',
  // Calculator body (dark → light)
  C: '#44403c',
  c: '#78716c',
  // Calculator LCD screen + digits
  G: '#15803d',
  g: '#22c55e',
  L: '#86efac',
  // Tax form yellow shadow (paper highlight reuses B)
  Y: '#fde68a',
  // Pen wood (brown)
  W: '#78350f',
};

const W = 48;

/**
 * Helper that right-pads a row with transparent '.' so artists can write
 * just the leftmost meaningful pixels. Throws if the row is wider than W.
 */
function row(s: string): string {
  if (s.length > W) {
    throw new Error(`tax-fiend row too wide: ${s.length} > ${W}: "${s}"`);
  }
  return s.padEnd(W, '.');
}

function assertGrid(
  rows: readonly string[],
  label: string,
): readonly string[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `tax-fiend ${label} row ${i} has length ${r.length}, expected ${W}`,
      );
    }
  }
  return rows;
}

/* All grids: 48 rows tall. Each row is built via `row(...)`, which pads
   with '.' on the right to exactly 48 chars. We only need to write the
   meaningful left portion of each row.
   Body box convention: a 13-col-wide D-outlined torso/head occupies
   columns 16..28 in IDLE (and shifts left/right for other poses).
*/

/* ─────────────────────────────────────────────────────────────
   IDLE — standing on hooves, tax form held in left-side hand at
   chest level, pen vertical at right-side hand. Calculator chest
   reads digits. Two curved horns, devilish grin, tail.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ row(''),
    /* 01 */ row(''),
    /* 02 */ row(''),
    /* 03 */ row(''),
    /* 04 */ row(''),
    /* 05 */ row('..................BB.....BB'),
    /* 06 */ row('.................BBBb...BBBb'),
    /* 07 */ row('.................BBBb...BBBb'),
    /* 08 */ row('..................BBb...BBb'),
    /* 09 */ row('................DDDDDDDDDDDDD'),
    /* 10 */ row('................DSsssssssssrD'),
    /* 11 */ row('................DSssssssssrrD'),
    /* 12 */ row('................DSsssssssssrD'),
    /* 13 */ row('................DSssssssssrrD'),
    /* 14 */ row('................DSHHsHHssssrD'),
    /* 15 */ row('................DSsssssssssrD'),
    /* 16 */ row('................DSsBBBBBBBsrD'),
    /* 17 */ row('................DSsBHBHBHBsrD.W'),
    /* 18 */ row('................DSsrrrrrrrsrD.W'),
    /* 19 */ row('................DDSrrrrrrrRDD.W'),
    /* 20 */ row('................DSrRDDDDDRRrD.W'),
    /* 21 */ row('.BBBBBBBBBBB....DSRDCCCCCCCrD.W'),
    /* 22 */ row('.BHYYYYYYYHB....DRDCcccccccCD.W'),
    /* 23 */ row('.BYBSSSSSBYB....DRDCGGGGGGGCD.W'),
    /* 24 */ row('.BYBBBBBBBYB....DRDCgggggggCD'),
    /* 25 */ row('.BYBSSSSSBYB....DRDCgLLLLLgCD'),
    /* 26 */ row('.BYBBBBBBBYB....DRDCgLgLLLgCD'),
    /* 27 */ row('.BYBSSSSSBYB....DRDCgggggggCD'),
    /* 28 */ row('.BYBBBBBBBYB....DRDCGGGGGGGCD'),
    /* 29 */ row('.BYBSSSSSBYB....DRDCCCCCCCCCD'),
    /* 30 */ row('.BYYYYYYYYYB....DDDDDDDDDDDDD'),
    /* 31 */ row('.BBBBBBBBBBB....DSsrRRRRRrrrD'),
    /* 32 */ row('................DSsrD...DsrrD'),
    /* 33 */ row('................DSsrD...DsrrD'),
    /* 34 */ row('................DSrrD...DrrrD'),
    /* 35 */ row('................DRrD.....DrrD'),
    /* 36 */ row('................DRrD.....DrrD'),
    /* 37 */ row('................DRrD.....DrrD'),
    /* 38 */ row('................DRRD.....DRRD'),
    /* 39 */ row('................DRRD.....DRRD'),
    /* 40 */ row('................DDDDD...DDDDD'),
    /* 41 */ row('................DRRRD...DRRRD'),
    /* 42 */ row('................DRRRD...DRRRD'),
    /* 43 */ row('................DHHHD...DHHHD'),
    /* 44 */ row('................DKKKD...DKKKD'),
    /* 45 */ row('................HKKKH...HKKKH'),
    /* 46 */ row(''),
    /* 47 */ row(''),
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — skittering left on hooves: front (left) hoof lifted high,
   back (right) hoof planted. Form swings forward. Body shifted
   left by 2 columns compared to idle.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ row(''),
    /* 01 */ row(''),
    /* 02 */ row(''),
    /* 03 */ row(''),
    /* 04 */ row(''),
    /* 05 */ row('................BB.....BB'),
    /* 06 */ row('...............BBBb...BBBb'),
    /* 07 */ row('...............BBBb...BBBb'),
    /* 08 */ row('................BBb...BBb'),
    /* 09 */ row('..............DDDDDDDDDDDDD'),
    /* 10 */ row('..............DSsssssssssrD'),
    /* 11 */ row('..............DSssssssssrrD'),
    /* 12 */ row('..............DSsssssssssrD'),
    /* 13 */ row('..............DSssssssssrrD'),
    /* 14 */ row('..............DSHHsHHssssrD'),
    /* 15 */ row('..............DSsssssssssrD'),
    /* 16 */ row('..............DSsBBBBBBBsrD'),
    /* 17 */ row('..............DSsBHBHBHBsrD..W'),
    /* 18 */ row('..............DSsrrrrrrrsrD..W'),
    /* 19 */ row('..............DDSrrrrrrrRDD..W'),
    /* 20 */ row('..............DSrRDDDDDRRrD..W'),
    /* 21 */ row('BBBBBBBBBBB...DSRDCCCCCCCrD..W'),
    /* 22 */ row('BHYYYYYYYHB...DRDCcccccccCD..W'),
    /* 23 */ row('BYBSSSSSBYB...DRDCGGGGGGGCD'),
    /* 24 */ row('BYBBBBBBBYB...DRDCggggLggCD'),
    /* 25 */ row('BYBSSSSSBYB...DRDCgLgLLLgCD'),
    /* 26 */ row('BYBBBBBBBYB...DRDCgggLgggCD'),
    /* 27 */ row('BYBSSSSSBYB...DRDCgggggggCD'),
    /* 28 */ row('BYBBBBBBBYB...DRDCGGGGGGGCD'),
    /* 29 */ row('BYBSSSSSBYB...DRDCCCCCCCCCD'),
    /* 30 */ row('BYYYYYYYYYB...DDDDDDDDDDDDD'),
    /* 31 */ row('BBBBBBBBBBB...DSsrRRRRRrrrD'),
    /* 32 */ row('..............DSsrD...DsrrD'),
    /* 33 */ row('..............DSsrD...DsrrD'),
    /* 34 */ row('..............DSrrD...DrrrD'),
    /* 35 */ row('..............DRrD.....DrrD'),
    /* 36 */ row('..............DRrD.....DrrD'),
    /* 37 */ row('..............DRrD.....DrrD'),
    /* 38 */ row('..............DRRD.....DRRD'),
    /* 39 */ row('..............DRRD......DRRD'),
    /* 40 */ row('..............DDDDD....DDDDD'),
    /* 41 */ row('..............DRRRDD..DRRRD'),
    /* 42 */ row('..............DRRRD...DRRRD'),
    /* 43 */ row('..............DHHHD....DHHHD'),
    /* 44 */ row('..............DKKKDD..DKKKD'),
    /* 45 */ row('..............HKKKH...HKKKH'),
    /* 46 */ row(''),
    /* 47 */ row(''),
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — body lunges LEFT, tax form thrust forward like a
   weapon blade, oversize pen jabbing past it as a long brown
   shaft, mouth open with sharp teeth.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ row(''),
    /* 01 */ row(''),
    /* 02 */ row(''),
    /* 03 */ row(''),
    /* 04 */ row(''),
    /* 05 */ row('...................BB.....BB'),
    /* 06 */ row('..................BBBb...BBBb'),
    /* 07 */ row('..................BBBb...BBBb'),
    /* 08 */ row('...................BBb...BBb'),
    /* 09 */ row('.................DDDDDDDDDDDDD'),
    /* 10 */ row('.................DSsssssssssrD'),
    /* 11 */ row('.................DSssssssssrrD'),
    /* 12 */ row('.................DSsssssssssrD'),
    /* 13 */ row('.................DSssssssssrrD'),
    /* 14 */ row('BBBBBBBBBBB......DSHHsHHssssrD'),
    /* 15 */ row('BHYYYYYYYHB......DSsssssssssrD'),
    /* 16 */ row('BYBSSSSSBYB......DSsBBBBBBBsrD'),
    /* 17 */ row('BYBBBBBBBYB......DSsBHBHBHBsrD'),
    /* 18 */ row('BYBSSSSSBYBWWW...DSsrrrrrrrsrD'),
    /* 19 */ row('BYBBBBBBBYBWWWWW.DDSrrrrrrrRDD'),
    /* 20 */ row('BYBSSSSSBYBWWWWWWWDSrRDDDDDRRrD'),
    /* 21 */ row('BYYYYYYYYYBWWWWWWWWDSRDCCCCCCCrD'),
    /* 22 */ row('BBBBBBBBBBB.WWWWWWWWWDRDCcccccccCD'),
    /* 23 */ row('............WWWWWWWWWDRDCGGGGGGGCD'),
    /* 24 */ row('.............WWWWWWWWDRDCgggggggCD'),
    /* 25 */ row('..............WWWWWWWDRDCgLLLLLgCD'),
    /* 26 */ row('...............WWWWWWDRDCgLgLLLgCD'),
    /* 27 */ row('................WWWWWDRDCgggggggCD'),
    /* 28 */ row('.................WWWWDRDCGGGGGGGCD'),
    /* 29 */ row('.................DRDCCCCCCCCCD'),
    /* 30 */ row('.................DDDDDDDDDDDDD'),
    /* 31 */ row('.................DSsrRRRRRrrrD'),
    /* 32 */ row('.................DSsrD...DsrrD'),
    /* 33 */ row('.................DSsrD...DsrrD'),
    /* 34 */ row('.................DSrrD...DrrrD'),
    /* 35 */ row('.................DRrD.....DrrD'),
    /* 36 */ row('.................DRrD.....DrrD'),
    /* 37 */ row('.................DRrD.....DrrD'),
    /* 38 */ row('.................DRRD.....DRRD'),
    /* 39 */ row('.................DRRD.....DRRD......DDD'),
    /* 40 */ row('.................DDDDD...DDDDD.....DRRD'),
    /* 41 */ row('.................DRRRD...DRRRD....DRRD'),
    /* 42 */ row('.................DRRRD...DRRRD...DDDD'),
    /* 43 */ row('.................DHHHD...DHHHD'),
    /* 44 */ row('.................DKKKD...DKKKD'),
    /* 45 */ row('.................HKKKH...HKKKH'),
    /* 46 */ row(''),
    /* 47 */ row(''),
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — body recoiling, tax form crumpled (small wad), calculator
   screen displays "ERR". Pain expression. Stun motes overhead and
   sweat droplets. Tail tucked, hooves stagger.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ row(''),
    /* 01 */ row('....b....b..............................b...b'),
    /* 02 */ row('...bbb..bbb............................bbb.bbb'),
    /* 03 */ row('....b....b..............................b...b'),
    /* 04 */ row(''),
    /* 05 */ row('..................BB.....BB'),
    /* 06 */ row('.................BBBb...BBBb'),
    /* 07 */ row('.................BBBb...BBBb'),
    /* 08 */ row('..................BBb...BBb'),
    /* 09 */ row('................DDDDDDDDDDDDD'),
    /* 10 */ row('................DSsssssssssrD'),
    /* 11 */ row('................DSssssssssrrD'),
    /* 12 */ row('................DSsssssssssrD'),
    /* 13 */ row('................DSssssssssrrD'),
    /* 14 */ row('................DSHHsHHssssrD'),
    /* 15 */ row('................DSDDDDDDDDDsrD'),
    /* 16 */ row('................DSsBHBHBHBsrD'),
    /* 17 */ row('................DSsBBBBBBBsrD'),
    /* 18 */ row('................DSsrrrrrrrsrD'),
    /* 19 */ row('................DDSrrrrrrrRDD'),
    /* 20 */ row('................DSrRDDDDDRRrD'),
    /* 21 */ row('...BBBB.........DSRDCCCCCCCrD'),
    /* 22 */ row('..BYYYYB........DRDCcccccccCD'),
    /* 23 */ row('.BYSSSYB........DRDCGGGGGGGCD'),
    /* 24 */ row('.BYBBBYB........DRDCggLLgggCD'),
    /* 25 */ row('..BYYYB.........DRDCggLgLLgCD'),
    /* 26 */ row('...BBB..........DRDCgLLLLLgCD'),
    /* 27 */ row('................DRDCgggLgLgCD'),
    /* 28 */ row('................DRDCGGGGGGGCD'),
    /* 29 */ row('................DRDCCCCCCCCCD'),
    /* 30 */ row('................DDDDDDDDDDDDD'),
    /* 31 */ row('................DSsrRRRRRrrrD'),
    /* 32 */ row('................DSsrD...DsrrD'),
    /* 33 */ row('................DSsrD...DsrrD'),
    /* 34 */ row('................DSrrD...DrrrD'),
    /* 35 */ row('................DRrD.....DrrD'),
    /* 36 */ row('................DRrD.....DrrD'),
    /* 37 */ row('................DRrD.....DrrD'),
    /* 38 */ row('................DRRD.....DRRD'),
    /* 39 */ row('................DRRD.....DRRD........DDD'),
    /* 40 */ row('................DDDDD...DDDDD.......DRRD'),
    /* 41 */ row('....DDD.........DRRRD...DRRRD......DRRD'),
    /* 42 */ row('...DRRD.........DRRRD...DRRRD.....DDDD'),
    /* 43 */ row('...DRRD.........DHHHD...DHHHD'),
    /* 44 */ row('..DDDD..........DKKKD...DKKKD'),
    /* 45 */ row('................HKKKH...HKKKH'),
    /* 46 */ row(''),
    /* 47 */ row(''),
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — AUDIT BLAST. Calculator chest screen flares HUGE,
   beaming green light outward. Tax forms explode out in all
   directions like shrapnel.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ row('..BBBB.......L.L.L.L.L.L.L........BBBB'),
    /* 01 */ row('.BHYYHB....L.gggggggggggggg.L....BHYYHB'),
    /* 02 */ row('.BYBBYB.....gLLLLLLLLLLLLLLg.....BYBBYB'),
    /* 03 */ row('.BYSSYB....LgLLLLLLLLLLLLLLgL....BYSSYB'),
    /* 04 */ row('.BYBBYB....LgLLLLLLLLLLLLLLgL....BYBBYB'),
    /* 05 */ row('.BYYYYB....LgLLLLLLLLLLLLLLgL....BYYYYB'),
    /* 06 */ row('..BHHB.....LgLLLLLLLLLLLLLLgL.....BHHB'),
    /* 07 */ row('...........LgLLLLLLLLLLLLLLgL'),
    /* 08 */ row('............gLLLLLLLLLLLLLLg.....BB'),
    /* 09 */ row('...........L.gggggggggggggg.L...BBBb'),
    /* 10 */ row('.............L.L.L.L.L.L.L.....BBBb'),
    /* 11 */ row('..........DDDDDDDDDDDDDDDDDDDDD..BBb'),
    /* 12 */ row('..........DSsssssssssssssssssrD'),
    /* 13 */ row('..........DSssssssssssssssssrrD'),
    /* 14 */ row('..........DSssssHHsHHssssssssrD'),
    /* 15 */ row('..........DSsssBBBBBBBBBBBBBssrD'),
    /* 16 */ row('..........DSsssBHBHBHBHBHBHBssrD'),
    /* 17 */ row('..........DSssrrrrrrrrrrrrrsrrD'),
    /* 18 */ row('..........DDSrrrrrrrrrrrrrrrRDD'),
    /* 19 */ row('..........DSrRDDDDDDDDDDDDDRRrD'),
    /* 20 */ row('..........DSRDCCCCCCCCCCCCCCCrD'),
    /* 21 */ row('..........DRDCcccccccccccccccCD'),
    /* 22 */ row('..........DRDCGGGGGGGGGGGGGGGCD'),
    /* 23 */ row('..........DRDCgggggggggggggggCD..gLg'),
    /* 24 */ row('..........DRDCgLLgLLgLLgLLgLLgCD.gLLLg'),
    /* 25 */ row('..........DRDCgLLLLLLLLLLLLLLgCDgLLLLLg'),
    /* 26 */ row('..........DRDCgLLLgLLgLLLgLLLLgCDLLLLLLLg'),
    /* 27 */ row('..........DRDCggLLLLLLLLLLLLLLgCDLLLLLLLLg'),
    /* 28 */ row('..........DRDCgggggggggggggggCD.gLLLLLLg'),
    /* 29 */ row('..........DRDCGGGGGGGGGGGGGGGCD..gLLLLg'),
    /* 30 */ row('..........DRDCCCCCCCCCCCCCCCCCD..gLLLg'),
    /* 31 */ row('..........DDDDDDDDDDDDDDDDDDDDD...gLg'),
    /* 32 */ row('..........DSsrRRRRRRRRRRRRRRrrD'),
    /* 33 */ row('..........DSsrDDDDDDDDDDDDDDsrrD'),
    /* 34 */ row('..........DSsrD.............DsrrD'),
    /* 35 */ row('..........DSrrD..............DrrrD'),
    /* 36 */ row('..........DRrD................DrrD'),
    /* 37 */ row('..........DRrD................DrrD'),
    /* 38 */ row('..........DRRD................DRRD....BBBB'),
    /* 39 */ row('..........DRRD................DRRD...BHYYHB'),
    /* 40 */ row('..........DDDDD..............DDDDD...BYBBYB'),
    /* 41 */ row('..........DRRRD..............DRRRD...BYSSYB'),
    /* 42 */ row('..........DRRRD..............DRRRD...BYBBYB'),
    /* 43 */ row('..........DHHHD..............DHHHD...BYYYYB'),
    /* 44 */ row('..........DKKKD..............DKKKD....BHHB'),
    /* 45 */ row('..........HKKKH..............HKKKH'),
    /* 46 */ row(''),
    /* 47 */ row(''),
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — face-down, sprawled flat. Calculator chest screen
   CRACKED with jagged dark lines. Horns lying sideways. Tax form
   crumpled aside at left. Pen rolled to the side at right.
   Hooves splayed. (Most of the upper canvas is empty so the
   defeat-rotate animation has room to fall.)
   ───────────────────────────────────────────────────────────── */
const DEFEAT: readonly string[] = assertGrid(
  [
    /* 00 */ row(''),
    /* 01 */ row(''),
    /* 02 */ row(''),
    /* 03 */ row(''),
    /* 04 */ row(''),
    /* 05 */ row(''),
    /* 06 */ row(''),
    /* 07 */ row(''),
    /* 08 */ row(''),
    /* 09 */ row(''),
    /* 10 */ row(''),
    /* 11 */ row(''),
    /* 12 */ row(''),
    /* 13 */ row(''),
    /* 14 */ row(''),
    /* 15 */ row(''),
    /* 16 */ row(''),
    /* 17 */ row(''),
    /* 18 */ row(''),
    /* 19 */ row(''),
    /* 20 */ row(''),
    /* 21 */ row(''),
    /* 22 */ row(''),
    /* 23 */ row(''),
    /* 24 */ row(''),
    /* 25 */ row(''),
    /* 26 */ row(''),
    /* 27 */ row(''),
    /* 28 */ row(''),
    /* 29 */ row(''),
    /* 30 */ row(''),
    /* 31 */ row(''),
    /* 32 */ row(''),
    /* 33 */ row(''),
    /* 34 */ row(''),
    /* 35 */ row('....BB...BB'),
    /* 36 */ row('...BBBb.BBBb'),
    /* 37 */ row('...BBBb.BBBb..DDDDDDDDDDDDDDDDDDDDDD'),
    /* 38 */ row('....BBb.BBb..DRrrrrrrrrrrrrrrrrrrrrD'),
    /* 39 */ row('.............DRrCCCCCCCCCCCCCCCCCrrD'),
    /* 40 */ row('...BBBBB.....DRrCgggggggggggggggCrrD'),
    /* 41 */ row('..BYYYYYB....DRrCgGgHHGggHGgggHGgCrrD'),
    /* 42 */ row('.BYSSSSSYB...DRrCgHHHGgggHHGgggHHgCrrD'),
    /* 43 */ row('BYBBBBBBYB...DRrCggHGggHHGgggHGggCrrrD'),
    /* 44 */ row('BYSSSSSSYB...DRrCCCCCCCCCCCCCCCCCrrrD..WWb'),
    /* 45 */ row('BYBBBBBBYB...DRRrrrrrrrrrrrrrrrrrrrrD.WWWb'),
    /* 46 */ row('.BYYYYYYB....DDDDDDDDDDDDDDDDDDDDDDDDD.WWWb'),
    /* 47 */ row('.BBBBBBBB....HKKKH..HKKKH..HKKKH..HKKKH.WWb'),
  ],
  'defeat',
);

const FRAMES: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

const Sprite = memo(function TaxFiendSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = FRAMES[state];
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${W} ${W}`}
        width={size}
        height={size}
        role="img"
        aria-label="Tax Fiend — 稅單怪"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const TaxFiend: CharacterArt = {
  meta: {
    id: 'tax-fiend',
    name: '稅單怪',
    englishName: 'Tax Fiend',
    role: 'generic',
    tier: 'minor',
    description: '紅皮小惡魔，胸口嵌計算機、手持稅單與大筆。',
  },
  Sprite,
};

export default TaxFiend;
