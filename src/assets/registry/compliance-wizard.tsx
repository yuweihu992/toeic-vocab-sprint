// Character: Compliance Wizard (法遵巫師) — book-headed wizard, faces LEFT.
// 48×48 pixel grid, 6 distinct poses. Light source: upper-left.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── palette ─────────────────────────────────────────────────────────────
   Single legend used across every pose. 16-20 colors total.
   '.' = transparent.
   ────────────────────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // robe — dark grey-blue
  R: '#1e293b', // robe darkest (shadow)
  M: '#334155', // robe mid
  L: '#475569', // robe highlight (lit upper-left)
  // book pages — pale parchment
  P: '#fef3c7', // page highlight
  Q: '#fde68a', // page mid
  W: '#f1f5f9', // page coolest highlight (light side)
  // book ink / text lines
  I: '#0c0a09', // ink darkest (text strokes)
  T: '#1c1917', // text shadow
  // book leather cover/binding
  B: '#451a03', // leather darkest
  N: '#78350f', // leather mid
  C: '#92400e', // leather highlight
  // gold legal symbols / gavel head accent
  G: '#fbbf24', // gold highlight
  D: '#d97706', // gold shadow
  '§': '#fbbf24', // section sign — embroidered gold legal symbol
  '¶': '#d97706', // pilcrow — embroidered gold legal symbol
  // bony pale skin (hands/wrists)
  K: '#e7d3b1', // skin highlight
  J: '#d4a574', // skin shadow
  // wand wood
  V: '#78350f', // wand wood
  // outline
  Z: '#0b1023', // crisp dark outline
};

/* ── helpers ──────────────────────────────────────────────────────────── */
const ROW_LEN = 48;
const ROWS = 48;

/** Defensive guard: every grid we ship must be 48×48. */
function assertGrid(rows: readonly string[], label: string): void {
  if (rows.length !== ROWS) {
    throw new Error(
      `compliance-wizard: ${label} has ${rows.length} rows (need ${ROWS})`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== ROW_LEN) {
      throw new Error(
        `compliance-wizard: ${label} row ${i} has length ${r.length} (need ${ROW_LEN})`,
      );
    }
  }
}

/* ── IDLE ─────────────────────────────────────────────────────────────────
   Standing tall, book-head open with text pages, pages slightly fluttering.
   Wand held in right hand (character's right = our left of body since faces
   LEFT). Faces LEFT.
   ────────────────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '...........ZZZZZZZZZZZZZZZZZZZZZZZZZ............', //  3
  '..........ZBNNNNNNNNNNNNNNNNNNNNNNNCZ...........', //  4
  '.........ZBNCCCCCCCCCCCCCCCCCCCCCCCNCZ..........', //  5
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', //  6
  '........ZBNCWPIIIIPPPPIIPPPIIIIPPQNCBZ..........', //  7
  '........ZBNCWPIIIIPPPPIIPPPIIIIPPQNCBZ..........', //  8
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', //  9
  '........ZBNCWPIIIPPPPPIIPPPPIIIPPQNCBZ..........', // 10
  '........ZBNCWPIIIPPPPPIIPPPPIIIPPQNCBZ..........', // 11
  '........ZBNCWPPPPPIIPPIIPPIIPPPPPQNCBZ..........', // 12
  '........ZBNCWPIIIIIIPPIIPPIIIIIPPQNCBZ..........', // 13
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', // 14
  '........ZBNCWPIIPPIIPPIIPPIIIIPPPQNCBZ..........', // 15
  '........ZBNCWPIIPPIIPPIIPPIIIIPPPQNCBZ..........', // 16
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', // 17
  '........ZBNNNNNNNNNNNNNNNNNNNNNNNNNCBZ..........', // 18
  '.........ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...........', // 19
  '...............ZRRRRRRRRRRRRZ...................', // 20
  '..............ZLRRRRRRRRRRRMRZ..................', // 21
  '.............ZLLRRGRRRRRRRMMRZ..................', // 22
  '.............ZLLRRRRR§RRRRMMMRZ.................', // 23
  '............ZLLRRGRRRRRRRRMMMRZ.................', // 24
  '...........ZKKZRRRRRR¶RRRRMMMRZ.................', // 25
  '..........ZKKKZLRRGRRRRRRRMMMRZZKKKZ............', // 26
  '..........ZKKZZLLRRRRR§RRRMMMRZZJKKKZ...........', // 27
  '..........ZZVZZLLRRGRRRRRRMMMRZZJJKKKZ..........', // 28
  '...........ZGZZLLRRRRR¶GRRMMMRZZJJJKKZ..........', // 29
  '...........ZGGZLLRRGRRRRRRMMMRZZ.ZJKKZ..........', // 30
  '...........ZVVZLLRRRRRRRRRMMMRZ..ZZZZ...........', // 31
  '...........ZVVZLLLRRGRRRRRMMMRZ.................', // 32
  '...........ZVZ.ZLLRRRRR§RRMMMRZ.................', // 33
  '...........ZVZ..ZLRRGRRRRRMMMRZ.................', // 34
  '...........ZVZ..ZLLRRRRRRRMMMRZ.................', // 35
  '...........ZZZ..ZLLRRRRRRRMMMRZ.................', // 36
  '................ZLRRRRRRRRMMMRZ.................', // 37
  '...............ZLLRRRRRRRRRMMRZ.................', // 38
  '...............ZLLRRRRRRRRRRMRZ.................', // 39
  '..............ZLLLRRRRRRRRRRRRRZ................', // 40
  '..............ZLLRRRRRRRRRRRRRRZ................', // 41
  '.............ZLLRRRRRRRRRRRRRRRRZ...............', // 42
  '............ZLLLRRRRRRRRRRRRRRRRRZ..............', // 43
  '............ZLLRRRRRRRRRRRRRRRRRRZ..............', // 44
  '...........ZLLLLLLZZZZZZZZRRRRRRRRZ.............', // 45
  '...........ZZZZZZZ........ZZZZZZZZZ.............', // 46
  '................................................', // 47
];

/* ── WALK ─────────────────────────────────────────────────────────────────
   Striding LEFT, robe trailing right, body tilted slightly.
   ────────────────────────────────────────────────────────────────────── */
const WALK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '...........ZZZZZZZZZZZZZZZZZZZZZZZZZ............', //  2
  '..........ZBNNNNNNNNNNNNNNNNNNNNNNNCZ...........', //  3
  '.........ZBNCCCCCCCCCCCCCCCCCCCCCCCNCZ..........', //  4
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', //  5
  '........ZBNCWPIIIIPPPPIIPPPIIIIPPQNCBZ..........', //  6
  '........ZBNCWPIIIIPPPPIIPPPIIIIPPQNCBZ..........', //  7
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', //  8
  '........ZBNCWPIIIPPPPPIIPPPPIIIPPQNCBZ..........', //  9
  '........ZBNCWPIIIPPPPPIIPPPPIIIPPQNCBZ..........', // 10
  '........ZBNCWPPPPPIIPPIIPPIIPPPPPQNCBZ..........', // 11
  '........ZBNCWPIIIIIIPPIIPPIIIIIPPQNCBZ..........', // 12
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', // 13
  '........ZBNCWPIIPPIIPPIIPPIIIIPPPQNCBZ..........', // 14
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', // 15
  '........ZBNNNNNNNNNNNNNNNNNNNNNNNNNCBZ..........', // 16
  '.........ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...........', // 17
  '...............ZRRRRRRRRRRRRZ...................', // 18
  '..............ZLRRGRRRRRRRRMRZ..................', // 19
  '.............ZLLRRRRRRRR§RRMMRZZ................', // 20
  '............ZLLRRRRGRRRRRRRMMMRRZ...............', // 21
  '...........ZLLRRRRRRRRRR¶GRRMMMMRRZ.............', // 22
  '..........ZKKZRRRGRRRRRRRRRRMMMMRRRRZ...........', // 23
  '.........ZKKKZLRRRRRRRR§RRRRMMMMRRRRRZ..........', // 24
  '.........ZKKZZLLRRGRRRRRRRRRMMMMRRRRRZ..........', // 25
  '.........ZZVZZLLRRRRRRRR¶GRRMMMMRRRRRZ..........', // 26
  '..........ZGZZLLRRGRRRRRRRRRMMMMRRRRRZ..........', // 27
  '..........ZGGZLLRRRRRR§RRRRRMMMMRRRRZ...........', // 28
  '..........ZVVZLLLRRGRRRRRRRRMMMMRRRZ............', // 29
  '..........ZVVZLLLRRRRRRRRRRRMMMMRRZ.............', // 30
  '..........ZVZ.ZLLRRRRRRRRRRMMMMRZ...............', // 31
  '..........ZVZ..ZLLRRRRRRRRRMMMRZ................', // 32
  '..........ZVZ..ZLLRRRRRRRRRMMMMRZ...............', // 33
  '..........ZZZ..ZLLRRRRRRRRRRMMMRZ...............', // 34
  '...............ZLLRRRRRRRRRRRMMRZ...............', // 35
  '..............ZLLLRRRRRRRRRRRMMMRZ..............', // 36
  '..............ZLLRRRRRRRRRRRRRMMRZ..............', // 37
  '.............ZLLRRRRRRRRRRRRRRRMRZ..............', // 38
  '............ZLLRRRRRZZZZZZZRRRMMRZ..............', // 39
  '...........ZLLLLRRRZ.....ZRRRRRMRZ..............', // 40
  '..........ZLLLLZZZZ.......ZZRRRRZ...............', // 41
  '.........ZLLLZZ..............ZZZZ...............', // 42
  '........ZLLLZ...................................', // 43
  '.......ZLLLZ....................................', // 44
  '.......ZZZZ.....................................', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ── ATTACK ───────────────────────────────────────────────────────────────
   Wand thrust forward LEFT, book-head pages fanning out wildly.
   ────────────────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '..ZZZZZZ.......ZZZZZZZZZZZZZZZ..................', //  2
  '.ZPPPPPZ......ZBNNNNNNNNNNNNNCZ.................', //  3
  'ZPIIIIIPZ....ZBNCCCCCCCCCCCCNCZ.................', //  4
  'ZPIIIIIPZZZZZBNCWPPPPPIIPPPPPNCBZ.ZZZ...........', //  5
  'ZPPPPPPPZ.ZQQQNCWPIIPPIIPPIIPPNCBZPPPZ..........', //  6
  'ZPIIIPPPZZZQQQNCWPIIPPIIPPIIPPNCBZPIIPZ.........', //  7
  '.ZPPPPPPPZZQQQNCWPPPPPIIPPPPPPNCBZPIIPZ.........', //  8
  '..ZZZZPPPZZQQQNCWPIIIIIIPPIIIPNCBZPPPPZ.........', //  9
  '......ZPPPZZQQQNCWPPPPPPIPPPPPNCBZZPPPZ.........', // 10
  '.......ZZPPPZQQQNCWPIIPPIIIIPPNCBZ.ZZZ..........', // 11
  '.........ZZPPPQNNNNNNNNNNNNNNNCBZ...............', // 12
  '...........ZZPPZZZZZZZZZZZZZZZZ.................', // 13
  '.............ZZRRRRRRRRRZ.......................', // 14
  '............ZLLRRGRRRRRMRZ......................', // 15
  '...........ZLLLRRRRR§RRMMRZ.....................', // 16
  '...........ZLLRRRRGRRRRMMMRZ....................', // 17
  '..........ZLLRRRRRRRR¶RRMMMRZ...................', // 18
  '..........ZLLRRGRRRRRRRRMMMRZ...................', // 19
  '..........ZLLRRRRRR§RRRRMMMRZ...................', // 20
  '..........ZLLRRGRRRRRRRRMMMRZ...................', // 21
  '....ZGGGZ.ZLLRRRRRR¶GRRRMMMRZ...................', // 22
  '...ZVZZZZZ.ZLLRRGRRRRRRRMMMRZ...................', // 23
  '..ZVZZJKKKZZLLRRRRR§RRRRMMMRZ...................', // 24
  '.ZVKKKKKKKKKZRRRRRRRRRRRMMMRZ...................', // 25
  'ZVKKJJJJJJKKKKLRRRRRRRRRMMMRZ...................', // 26
  '.ZVZJJJZZZJJZ.ZLRRGRRRRRMMMRZ...................', // 27
  '..ZZZZZ...ZZZ..ZLLRRRRRRMMMRZ...................', // 28
  '...............ZLLRRRRRRMMMRZ...................', // 29
  '...............ZLLRRRRRRMMMRZ...................', // 30
  '..............ZLLRRRRRRRMMMRZ...................', // 31
  '..............ZLLRRRRRRRMMMRZ...................', // 32
  '.............ZLLRRRRRRRRRMMRZ...................', // 33
  '.............ZLLRRRRRRRRRRMRZ...................', // 34
  '............ZLLLRRRRRRRRRRRRZ...................', // 35
  '............ZLLRRRRRRRRRRRRRZ...................', // 36
  '...........ZLLRRRRRRRRRRRRRRRZ..................', // 37
  '...........ZLLLRRRRRRRRRRRRRRZ..................', // 38
  '..........ZLLLRRRRRRRRRRRRRRRRZ.................', // 39
  '..........ZLLRRRRRRRRRRRRRRRRRZ.................', // 40
  '.........ZLLLRRRRRRRRRRRRRRRRRRZ................', // 41
  '.........ZLLRRRRRRRRRRRRRRRRRRRZ................', // 42
  '........ZLLLRRRRRZZZZZZZRRRRRRRRZ...............', // 43
  '........ZLLLLLLLZ......ZRRRRRRRRZ...............', // 44
  '.......ZZZZZZZZZ.......ZZZZZZZZZZ...............', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ── HIT ──────────────────────────────────────────────────────────────────
   Knocked back, book-head pages scattering, robe ripped.
   ────────────────────────────────────────────────────────────────────── */
const HIT: readonly string[] = [
  '................................................', //  0
  '..PPP....PP.....................................', //  1
  '.PIIPZ..PIIP....................................', //  2
  '.PPPPZ..PPPPZ...........PP......................', //  3
  '..ZZZ..ZZZZZ...........PIIP.....................', //  4
  '...........................ZZZZZZZZZZZZZZZ......', //  5
  '......PPP.................ZBNNNNNNNNNNNNNCZ.....', //  6
  '.....ZPIIPZ..............ZBNCCCCCCCCCCCCCNCZ....', //  7
  '....ZPPPPPZ.............ZBNCWPIIPPIIPPIIPPNCBZ..', //  8
  '....ZZZZZZ..............ZBNCWPPPPPIIPPPPPPNCBZ..', //  9
  '..........PP............ZBNCWPIIIPPIIPPIIIPNCBZ.', // 10
  '.........PIIP...........ZBNCWPPPPPIIPPPPPPNCBZ..', // 11
  '.........PPPP...........ZBNCWPIIPPIIPPIIPPNCBZ..', // 12
  '.........ZZZZ............ZBNNNNNNNNNNNNNNNCBZ...', // 13
  '..........................ZZZZZZZZZZZZZZZZZ.....', // 14
  '....................ZRRRRRRRRRRRZ...............', // 15
  '...................ZLRRRRRZZRRRMRZ..............', // 16
  '..................ZLLRRGRZ..ZRMMRZ..............', // 17
  '..................ZLLRRRRZ..ZMMMRZ..............', // 18
  '..............ZKKZZLLRRRRZ..ZMMMRZ..............', // 19
  '.............ZKKKZZLLRRGRRRRMMMMRZ..............', // 20
  '............ZKKKKZZLLRRRRRRRMMMRZ...............', // 21
  '............ZJKKKZZLLRRRRR§MMMRZ................', // 22
  '...........ZJJKKZ.ZLLRRGRRRMMMRZ................', // 23
  '...........ZJZZZ..ZLLRRRRRRMMMRZ................', // 24
  '...........ZZ.....ZLLRRRRRRMMRRZ................', // 25
  '..................ZLLRRGZRRMRRRZ................', // 26
  '..................ZLLRRRZRRRRZZ.................', // 27
  '..................ZLLRRRZZZZZ...................', // 28
  '..................ZLLRRGRRRRZ...................', // 29
  '..................ZLLRRRRRRRRZ..................', // 30
  '.................ZLLRRRRRZRRRZ..................', // 31
  '.................ZLLRRRRZZZRRZ..................', // 32
  '................ZLLRRRRRRZRRRZ..................', // 33
  '................ZLLRRRRRRRRRRZ..................', // 34
  '...............ZLLRRRRZZZZRRRRZ.................', // 35
  '..............ZLLLRRRRZ..ZRRRRZ.................', // 36
  '..............ZLLRRRRRZ...ZRRRZ.................', // 37
  '.............ZLLRRRRRRZ...ZRRRZ.................', // 38
  '............ZLLLRRRRRRZ...ZRRRRZ................', // 39
  '............ZLLRRRRRRRZ...ZRRRRZ................', // 40
  '...........ZLLRRRRRRRRZ...ZRRRRRZ...............', // 41
  '...........ZLLLLLLLLLZ....ZRRRRRZ...............', // 42
  '..........ZLLLLLLLLZ......ZZRRRRRZ..............', // 43
  '..........ZZZZZZZZZ........ZRRRRRZ..............', // 44
  '............................ZZZZZZZZ............', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ── SPECIAL ──────────────────────────────────────────────────────────────
   SUMMON LAW — multiple legal-text scrolls/pages floating in spiral.
   ────────────────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = [
  '...........ZZZZZ................................', //  0
  '..........ZPPPPPZ...............................', //  1
  '..........ZPIIIPZ.....ZZZZZ.....................', //  2
  '..........ZPPPPPZ....ZPIIIPZ....................', //  3
  '..........ZZZZZZ.....ZPPPPPZ....................', //  4
  '...........ZZZZZZZZZZZZZZZZZZZZZZZZZ............', //  5
  '..........ZBNNNNNNNNNNNNNNNNNNNNNNNCZ...........', //  6
  '.........ZBNCCCCCCCCCCCCCCCCCCCCCCCNCZ..........', //  7
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', //  8
  '........ZBNCWPIIIIPPPPIIPPPIIIIPPQNCBZ..........', //  9
  'ZZZZZ...ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..ZZZZZ...', // 10
  'ZPIIPZ..ZBNCWPIIIPPPPPIIPPPPIIIPPQNCBZ.ZPIIIPZ..', // 11
  'ZPPPPZ..ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ.ZPPPPPZ..', // 12
  'ZZZZZZ..ZBNCWPIIPPIIPPIIPPIIIIPPPQNCBZ.ZZZZZZZ..', // 13
  '........ZBNCWPPPPPPPPPIIPPPPPPPPPQNCBZ..........', // 14
  '........ZBNNNNNNNNNNNNNNNNNNNNNNNNNCBZ..........', // 15
  '.........ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...........', // 16
  '...............ZRRRRRRRRRRRRZ...................', // 17
  'ZZZZZ.........ZLRRGRRRRRRRRMRZ......ZZZZZ.......', // 18
  'ZPIIPZ.......ZLLRRRRRRRR§RRMMRZ....ZPIIIPZ......', // 19
  'ZPPPPZ......ZLLRRRRGRRRRRRRMMMRZ...ZPPPPPZ......', // 20
  'ZZZZZZ.....ZLLRRRRRRRRRR¶GRRMMMRZ..ZZZZZZZ......', // 21
  '..........ZLLRRRRGRRRRRRRRRMMMRZ................', // 22
  '..........ZLLRRRRRRRR§RRRRMMMRZ.................', // 23
  '..........ZLLRRGRRRRRRRRRRMMMRZ.................', // 24
  '..........ZLLRRRRR¶GRRRRRRMMMRZ.................', // 25
  '....ZZZ...ZLLRRGRRRRRRRRRRMMMRZ.....ZZZZZ.......', // 26
  '...ZGGGZ..ZLLRRRRRRR§RRRRRMMMRZ....ZPIIIPZ......', // 27
  '...ZVZZZ..ZLLLRRGRRRRRRRRRMMMRZ....ZPPPPPZ......', // 28
  '..ZVZ.....ZLLRRRRRRR¶GRRRRMMMRZ....ZZZZZZZ......', // 29
  '..ZVZ.....ZLLRRGRRRRRRRRRRMMMRZ.................', // 30
  '..ZVZ....ZLLLRRRRRRRRRRRRRMMMRZ.................', // 31
  '..ZVZ....ZLLRRRRRR§RRRRRRRMMMRZ.................', // 32
  '..ZZZ....ZLLRRGRRRRRRRRRRRMMMRZ.................', // 33
  '.........ZLLRRRRRRRRRRRRRRRMMRZ.................', // 34
  '........ZLLLRRRRRRRRRRRRRRRRMRZ.................', // 35
  '........ZLLRRRRRRRRRRRRRRRRRRRZ.................', // 36
  '.......ZLLLRRRRRRRRRRRRRRRRRRRZ.................', // 37
  '.......ZLLRRRRRRRRRRRRRRRRRRRRRZ................', // 38
  '......ZLLLRRRRRRRRRRRRRRRRRRRRRZ................', // 39
  'ZZZZZ.ZLLRRRRRRRRRRRRRRRRRRRRRRZ....ZZZZZ.......', // 40
  'ZPIIPZZLLLRRRRRRRRRRRRRRRRRRRRRRZ..ZPIIIPZ......', // 41
  'ZPPPPZZLLRRRRRRRRRRRRRRRRRRRRRRRZ..ZPPPPPZ......', // 42
  'ZZZZZZZLLLRRRRRRRRRRRRRRRRRRRRRRRZ.ZZZZZZZ......', // 43
  '......ZLLLRRRRRRRRRRRRRRRRRRRRRRRZ..............', // 44
  '......ZLLLLLLLLZZZZZZZZRRRRRRRRRRZ..............', // 45
  '......ZZZZZZZZZ........ZZZZZZZZZZ...............', // 46
  '................................................', // 47
];

/* ── DEFEAT ───────────────────────────────────────────────────────────────
   Book-head closed (just leather cover) and fallen, robe collapsed.
   ────────────────────────────────────────────────────────────────────── */
const DEFEAT: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '................................................', //  3
  '................................................', //  4
  '................................................', //  5
  '................................................', //  6
  '................................................', //  7
  '................................................', //  8
  '................................................', //  9
  '................................................', // 10
  '................................................', // 11
  '................................................', // 12
  '................................................', // 13
  '................................................', // 14
  '................................................', // 15
  '................................................', // 16
  '................................................', // 17
  '................................................', // 18
  '................................................', // 19
  '................................................', // 20
  '................................................', // 21
  '................................................', // 22
  '................................................', // 23
  '................................................', // 24
  '................................................', // 25
  '................................................', // 26
  '................................................', // 27
  '................................................', // 28
  '...ZZZZZZZZZZZZZ................................', // 29
  '..ZBNNNNNNNNNNNCZ...............................', // 30
  '.ZBNCCCCCCCCCCCNCZ..............................', // 31
  '.ZBNCNNNNNNNNNCCNCZ.............................', // 32
  '.ZBNCNCCCCCCCNNCNCZ.............................', // 33
  '.ZBNNNNNNNNNNNNNNCZ.............................', // 34
  '..ZZZZZZZZZZZZZZZZ..............................', // 35
  '................................................', // 36
  '..ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ.....', // 37
  '..ZRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRZ....', // 38
  '..ZRMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMRZ....', // 39
  '..ZRMGRRGRRGRR§RRGRR¶RRGRR§RRGRRGRR¶RRGRRMRZ....', // 40
  '..ZRMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMRZ....', // 41
  '..ZRMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMRZ....', // 42
  '..ZRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRZ....', // 43
  '..ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ.....', // 44
  '...........ZVVZ.................................', // 45
  '...........ZVVZ.................................', // 46
  '...........ZZZZ.................................', // 47
];

/* ── grid lookup ─────────────────────────────────────────────────────── */
const GRIDS: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

// Validate at module load — fails fast in dev if any row drifts.
assertGrid(IDLE, 'idle');
assertGrid(WALK, 'walk');
assertGrid(ATTACK, 'attack');
assertGrid(HIT, 'hit');
assertGrid(SPECIAL, 'special');
assertGrid(DEFEAT, 'defeat');

/* ── sprite component ────────────────────────────────────────────────── */
const ComplianceWizardSprite = memo(function ComplianceWizardSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = GRIDS[state];
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${ROW_LEN} ${ROWS}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Compliance Wizard"
        role="img"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

/* ── default export ──────────────────────────────────────────────────── */
const complianceWizard: CharacterArt = {
  meta: {
    id: 'compliance-wizard',
    name: '法遵巫師',
    englishName: 'Compliance Wizard',
    role: 'regulations',
    tier: 'major',
    topic: 'regulations',
    description: '頭顱是一本攤開法典的詭異巫師，法袍綴金色法律符號。',
  },
  Sprite: ComplianceWizardSprite,
};

export default complianceWizard;
