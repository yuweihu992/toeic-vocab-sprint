// Character: Flight Delay Demon (班機延誤魔)
// A bat-winged purple imp wearing a navy TSA-style vest with a white
// name badge, dragging a gray rolling SUITCASE plastered with red
// "DELAYED" stickers. In its other clawed hand it clutches a torn
// boarding pass. Two small red horns and a smug smirk with one
// white fang. Yellow eyes. Faces LEFT — head and wings oriented so
// the demon glides toward the viewer's left.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── Palette ────────────────────────────────────────────────
   Each glyph is exactly one ASCII char so every grid row
   stays at 48 chars (the canvas size in logical pixels).
   ───────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // Demon skin — light → mid → base → dark → deep shadow
  L: '#a855f7',
  p: '#7e22ce',
  P: '#6b21a8',
  S: '#581c87',
  X: '#3b0764',
  // Bat wings reuse demon dark/deep purples (X / S above).
  // Navy TSA vest (mid → dark)
  n: '#1e40af',
  N: '#1e3a8a',
  // Badge white / fang / boarding-pass paper
  W: '#f8fafc',
  F: '#f8fafc',
  // Boarding-pass paper highlight & DELAYED sticker text background
  B: '#f1f5f9',
  b: '#cbd5e1',
  // Red — DELAYED stickers, badge text, horns lower
  R: '#dc2626',
  // Horns dark / mid
  H: '#7f1d1d',
  h: '#b91c1c',
  // Suitcase metal-gray (dark → mid)
  K: '#44403c',
  k: '#78716c',
  // Eye yellow
  Y: '#facc15',
  // Outline / text / ink
  J: '#0a0a0a',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W_PX = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W_PX) {
      throw new Error(
        `flight-delay-demon ${label} row ${i} has length ${r.length}, expected ${W_PX}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — hovering slightly above the ground with bat wings
   half-spread behind. Suitcase rests at the demon's feet with a
   bright red DELAYED sticker on its face. Boarding pass clutched
   in the trailing claw. Smug smirk faces LEFT.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '...........HH.........HH........................',
    /* 03 */ '...........Hh.........Hh........................',
    /* 04 */ '..........HhH........HhH....XX..................',
    /* 05 */ '...XX.....hhh.SSSSSS.hhh...XSSX.................',
    /* 06 */ '..XSSX...XSSSSpppppSSSSX..XSppSX................',
    /* 07 */ '.XSppSX.XSpppLLLLLLpppSX.XSppppSX...............',
    /* 08 */ 'XSppppSXSppLLpLLLLLpLpSXSpppppSSX...............',
    /* 09 */ 'XSppLLpSpLLpLpLLLLLpLpLpSppLLLpSSX..............',
    /* 10 */ '.XSppLpLpLLpLpLpLLpLpLpLpLLLLpSSX...............',
    /* 11 */ '..XSppLpLLLpYYpLpLLpLLpLpLpLpSSX................',
    /* 12 */ '...XSppLpLpYJYpLpFLpLpLpLpLpSX..................',
    /* 13 */ '....XSppLLLYJpLLLLLLpLpLpLpSX...................',
    /* 14 */ '.....XSppLLLLpLpLpLpLpLpLpSX....................',
    /* 15 */ '......XSppLpLpLpLpLpLpLpSSX.....................',
    /* 16 */ '.......XSpppLpLpLpLpLpSSX.......................',
    /* 17 */ '........XSppppLpLpLppSSX........................',
    /* 18 */ '........NNNNNNNNNNNNNNN.........................',
    /* 19 */ '.......NnnnnnnnnnnnnnnN.........................',
    /* 20 */ '......NnnnWWWWnnnnnnnnN.........................',
    /* 21 */ '......NnnnWRRWnnnnnnnnN.........................',
    /* 22 */ '......NnnnWWWWnnnnnnnnN.........................',
    /* 23 */ '......NnnnnnnnnnnnnnnnN.........................',
    /* 24 */ '......NNnnnnnnnnnnnnnNN.........................',
    /* 25 */ '.......LLpLpL....LpLpLL.........................',
    /* 26 */ '......LpLpLL......LpLpL.........................',
    /* 27 */ '......LLpL.........LpLLBBBBBBBBB................',
    /* 28 */ '......LpLp.........pLpLBJJJJJJJB................',
    /* 29 */ '.....pLpL...........LpLBbJJBBBJB................',
    /* 30 */ '.....pLp.............LpLBBBJJJBB................',
    /* 31 */ '.....pLp.............LpLBJJBBJJB................',
    /* 32 */ '.....pLp.............LpLBJBBBJJB................',
    /* 33 */ '.....pLpLLLLLLLLLLLLLpLpBBBBBBBB................',
    /* 34 */ '......pLpLpLpLpLpLpLpL..........................',
    /* 35 */ '...KKKKKKKKKKKKKKKKKKK..........................',
    /* 36 */ '...KkkkkkkkkkkkkkkkkkK..........................',
    /* 37 */ '...KkRRRRRRRRRRRRRRRkK..........................',
    /* 38 */ '...KkRJJJJJJJJJJJJJRkK..........................',
    /* 39 */ '...KkRJJJJJJJJJJJJJRkK..........................',
    /* 40 */ '...KkRJJJJJJJJJJJJJRkK..........................',
    /* 41 */ '...KkRRRRRRRRRRRRRRRkK..........................',
    /* 42 */ '...KkkkkkkkkkkkkkkkkkK..........................',
    /* 43 */ '...KkkkkkkkkkkkkkkkkkK..........................',
    /* 44 */ '...KKKKKKKKKKKKKKKKKKK..........................',
    /* 45 */ '....JJ...............JJ.........................',
    /* 46 */ '....JJ...............JJ.........................',
    /* 47 */ '................................................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — gliding leftward with wings angled back, body tilted
   forward. Suitcase rolls alongside (slightly behind), wheels
   visibly rotated. Boarding pass trails in the back claw.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '............HH..........HH......................',
    /* 03 */ '............Hh..........Hh......................',
    /* 04 */ '...........HhH.........HhH......................',
    /* 05 */ 'XX..........hhh..SSSSSS.hhh.....................',
    /* 06 */ 'SSXX.......XSSSSpppppSSSSX......................',
    /* 07 */ 'SppSXX....XSpppLLLLLLpppSXX...XX................',
    /* 08 */ 'SpppSSXX.XSppLLpLLLLLpLpSSXX.XSSX...............',
    /* 09 */ 'XSppppSSpLLpLpLLLLLpLpLpSSXXXSppSX..............',
    /* 10 */ '.XSppLpLpLLpLpLpLLpLpLpLpLLLpSSX................',
    /* 11 */ '..XSppLpLLLpYYpLpLLpLLpLpLpLpSX.................',
    /* 12 */ '...XSppLpLpYJYpLpFLpLpLpLpLSX...................',
    /* 13 */ '....XSppLLLYJpLLLLLLpLpLpLpSX...................',
    /* 14 */ '.....XSppLLLLpLpLpLpLpLpLpSX....................',
    /* 15 */ '......XSppLpLpLpLpLpLpLpSSX.....................',
    /* 16 */ '.......XSpppLpLpLpLpLpSSX.......................',
    /* 17 */ '........NNNNNNNNNNNNNNN.........................',
    /* 18 */ '.......NnnnnnnnnnnnnnnN.........................',
    /* 19 */ '......NnnnWWWWnnnnnnnnN.........................',
    /* 20 */ '......NnnnWRRWnnnnnnnnN.........................',
    /* 21 */ '......NnnnWWWWnnnnnnnnN.........................',
    /* 22 */ '......NnnnnnnnnnnnnnnnN.........................',
    /* 23 */ '......NNnnnnnnnnnnnnnNN.........................',
    /* 24 */ '.......LpLpLpLpLpLpLpL..........................',
    /* 25 */ '.......LLpLpLpLpLpLpLp..........................',
    /* 26 */ '......LpLpLpLpLpLpLpLp..........................',
    /* 27 */ '......LpLp..........LpL.....BBBBBBBBB...........',
    /* 28 */ '......LpLp...........pL.....BJJJJJJJB...........',
    /* 29 */ '.....pLp..............L.....BJBBJBJBB...........',
    /* 30 */ '.....pLp....................BBJBJJJBB...........',
    /* 31 */ '.....pLp....................BJJBBJBJB...........',
    /* 32 */ '....pLp.....................BJBJJJBJB...........',
    /* 33 */ '....pLp.....................BBBBBBBBB...........',
    /* 34 */ '....pLp.........KKKKKKKKKKKKKKKKKKK.............',
    /* 35 */ '....pLp.........KkkkkkkkkkkkkkkkkkK.............',
    /* 36 */ '...pLpL.........KkRRRRRRRRRRRRRRRkK.............',
    /* 37 */ '...pLp..........KkRJJJJJJJJJJJJJRkK.............',
    /* 38 */ '...pLp..........KkRJJJJJJJJJJJJJRkK.............',
    /* 39 */ '...pLp..........KkRJJJJJJJJJJJJJRkK.............',
    /* 40 */ '...pLp..........KkRRRRRRRRRRRRRRRkK.............',
    /* 41 */ '...pLp..........KkkkkkkkkkkkkkkkkkK.............',
    /* 42 */ '...pLp..........KkkkkkkkkkkkkkkkkkK.............',
    /* 43 */ '...pLp..........KKKKKKKKKKKKKKKKKKK.............',
    /* 44 */ '..LLpL...........JJ...............JJ............',
    /* 45 */ '..LpLp...........JJJ.............JJJ............',
    /* 46 */ '..LpLL............JJ...............JJ...........',
    /* 47 */ '................................................',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — boarding pass thrust forward (to the LEFT) like a
   blade, wings flared out aggressively. Smirk widened to a
   fanged snarl. Suitcase still on the ground behind.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ 'XX...........HH.........HH......................',
    /* 02 */ 'SSXX.........Hh.........Hh......................',
    /* 03 */ 'SppSXX......HhH........HhH......................',
    /* 04 */ 'XSppSSXX....hhh..SSSSSS.hhh....XX...............',
    /* 05 */ '.XSppppSXX.XSSSSpppppSSSSX....XSSX..............',
    /* 06 */ '..XSpppSSXSSpppLLLLLLpppSSX..XSppSX.............',
    /* 07 */ '...XSppSSXSppLLpLLLLLpLpSSXXXSppppSX............',
    /* 08 */ '....XSpSSpLLpLpLLLLLpLpLpSSXXSppppSSX...........',
    /* 09 */ '.....XSpLpLLpLpLpLLpLpLpLpLLLpSSppSSX...........',
    /* 10 */ '......XppLpLLLpYYpLpLLpLLpLpLpSSSSX.............',
    /* 11 */ '.......XSpLpLpYJYpLpFLpLpLpLpSSX................',
    /* 12 */ '........XSpLLLYJpLLLLLLpLpLpSX..................',
    /* 13 */ '.........XSpLLLLpLpLpLpLpLpSX...................',
    /* 14 */ 'BBBBBBBB..XSppLpLpLpLpLpLpSSX...................',
    /* 15 */ 'BJJJJJJB...XSppLpLpLpLpLpSSX....................',
    /* 16 */ 'BJBJBJJB....NNNNNNNNNNNNNNN.....................',
    /* 17 */ 'BJJJBBJB...NnnnnnnnnnnnnnnN.....................',
    /* 18 */ 'BJBJJJJB..NnnnWWWWnnnnnnnnN.....................',
    /* 19 */ 'BBBBBBBB..NnnnWRRWnnnnnnnnN.....................',
    /* 20 */ '..LLpL....NnnnWWWWnnnnnnnnN.....................',
    /* 21 */ '..LpLp....NnnnnnnnnnnnnnnnN.....................',
    /* 22 */ '..LpLL....NNnnnnnnnnnnnnnNN.....................',
    /* 23 */ '...........LpLpLpLpLpLpLpL......................',
    /* 24 */ '..........LpLpLpLpLpLpLpLp......................',
    /* 25 */ '..........LpLp........LpLp......................',
    /* 26 */ '.........LpLp...........pL......................',
    /* 27 */ '.........pLp.............L......................',
    /* 28 */ '.........pLp....................................',
    /* 29 */ '.........pLp....................................',
    /* 30 */ '.........pLp....................................',
    /* 31 */ '.........pLpLLLLLLLLLLLLLpLp....................',
    /* 32 */ '..........pLpLpLpLpLpLpLpLp.....................',
    /* 33 */ '......KKKKKKKKKKKKKKKKKKK.......................',
    /* 34 */ '......KkkkkkkkkkkkkkkkkkK.......................',
    /* 35 */ '......KkRRRRRRRRRRRRRRRkK.......................',
    /* 36 */ '......KkRJJJJJJJJJJJJJRkK.......................',
    /* 37 */ '......KkRJJJJJJJJJJJJJRkK.......................',
    /* 38 */ '......KkRJJJJJJJJJJJJJRkK.......................',
    /* 39 */ '......KkRRRRRRRRRRRRRRRkK.......................',
    /* 40 */ '......KkkkkkkkkkkkkkkkkkK.......................',
    /* 41 */ '......KkkkkkkkkkkkkkkkkkK.......................',
    /* 42 */ '......KKKKKKKKKKKKKKKKKKK.......................',
    /* 43 */ '.......JJ...............JJ......................',
    /* 44 */ '.......JJ...............JJ......................',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — body recoiling rightward, wings folded inward against
   the back, eyes squeezed shut (J-cross), suitcase tipped on
   its side spilling a corner of fabric. Boarding pass dropped.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '..............HH..........HH....................',
    /* 03 */ '..............Hh..........Hh....................',
    /* 04 */ '.............HhH.........HhH....................',
    /* 05 */ '..............hhh..SSSSSS.hhh...................',
    /* 06 */ '.............XSSSSpppppSSSSX....................',
    /* 07 */ '............XSpppLLLLLLpppSX....................',
    /* 08 */ '...........XSppLLpLLLLLpLpSX....................',
    /* 09 */ '...........SpLLpLpLLLLLpLpLp....................',
    /* 10 */ '...........SpLpLpLpLLpLpLpLp....................',
    /* 11 */ '...........SppLpJJpLLpLLpLpLp...................',
    /* 12 */ '...........SppLpJJpLpFLpLpLp....................',
    /* 13 */ '...........XSpLpJJLLLLpLpLpSX...................',
    /* 14 */ '............XSpLLLpLpLpLpSSX....................',
    /* 15 */ '.............XSpLpLpLpLpSSX.....................',
    /* 16 */ '..............NNNNNNNNNNNNNNN...................',
    /* 17 */ '.............NnnnnnnnnnnnnnnN...................',
    /* 18 */ '............NnnnWWWWnnnnnnnnN...................',
    /* 19 */ '............NnnnWRRWnnnnnnnnN...................',
    /* 20 */ '............NnnnWWWWnnnnnnnnN...................',
    /* 21 */ '............NnnnnnnnnnnnnnnnN...................',
    /* 22 */ '............NNnnnnnnnnnnnnnNN...................',
    /* 23 */ '.............LpLpLpLpLpLpLpL....................',
    /* 24 */ '............LpLpLpLpLpLpLpLp....................',
    /* 25 */ '............LpLp........LpLp....................',
    /* 26 */ '...........LpLp...........pL....................',
    /* 27 */ '...........pLp.............L....................',
    /* 28 */ '...........pLp..................................',
    /* 29 */ '...........pLp..................................',
    /* 30 */ '...........pLpLLLLLLLLLLLLpLp...................',
    /* 31 */ '............pLpLpLpLpLpLpLp.....................',
    /* 32 */ '..............JJ........JJ......................',
    /* 33 */ '...............JJ......JJ.......................',
    /* 34 */ '................................................',
    /* 35 */ '................................................',
    /* 36 */ '................................................',
    /* 37 */ '....KKKKKKKKKKKKKKKKKKKKKKK.....................',
    /* 38 */ '...KkkkkkkkkkkkkkkkkkkkkkkkK....................',
    /* 39 */ '...KkRRRRRRRRRRRRRRRkkkkkkkK....................',
    /* 40 */ '...KkRJJJJJJJJJJJJJRkBBBBkkK....................',
    /* 41 */ '...KkRRRRRRRRRRRRRRRkBbBBkkK....................',
    /* 42 */ '...KkkkkkkkkkkkkkkkkkBBBBkkK....................',
    /* 43 */ '....KKKKKKKKKKKKKKKKKKKKKKK.....................',
    /* 44 */ '.......BBBBBBB..................................',
    /* 45 */ '.......BJJJJJB..................................',
    /* 46 */ '.......BBBBBBB..................................',
    /* 47 */ '................................................',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — SCHEDULE CHAOS: multiple red DELAYED stamp icons
   and torn boarding-pass scraps spin in a halo around the
   demon's body. Wings spread wide, glowing with menace.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ '.RRRRR..............BBBBB...............RRRRR...',
    /* 01 */ '.RJJJR..............BJBJB...............RJJJR...',
    /* 02 */ '.RRRRR..............BBBBB...............RRRRR...',
    /* 03 */ '................................................',
    /* 04 */ '..............HH.........HH.....................',
    /* 05 */ '..............Hh.........Hh.....................',
    /* 06 */ '.............HhH........HhH....XX...............',
    /* 07 */ '...XX.........hhh.SSSSSS.hhh...XSSX.....BBBBB...',
    /* 08 */ '..XSSX.......XSSSSpppppSSSSX..XSppSX....BJBJB...',
    /* 09 */ '.XSppSX.....XSpppLLLLLLpppSX.XSppppSX...BBBBB...',
    /* 10 */ 'XSppppSX...XSppLLpLLLLLpLpSXXSpppppSSX..........',
    /* 11 */ 'XSppLLpSXXSpLLpLpLLLLLpLpLpSppLLLpSSX...........',
    /* 12 */ 'BBBBB.SpLpLLpLpLpLLpLpLpLpLpLLLLpSSX............',
    /* 13 */ 'BJBJB..SpLpLLLpYYpLpLLpLLpLpLpLpSSX.............',
    /* 14 */ 'BBBBB...SpLpLpYJYpLpFLpLpLpLpLpSX..........RRRRR',
    /* 15 */ '.........SpLLLYJpLLLLLLpLpLpLpSX...........RJJJR',
    /* 16 */ '..........SpLLLLpLpLpLpLpLpLpSX............RRRRR',
    /* 17 */ '...........NNNNNNNNNNNNNNN......................',
    /* 18 */ '..........NnnnnnnnnnnnnnnN......................',
    /* 19 */ '.........NnnnWWWWnnnnnnnnN......................',
    /* 20 */ '.........NnnnWRRWnnnnnnnnN......................',
    /* 21 */ '.........NnnnWWWWnnnnnnnnN......................',
    /* 22 */ '.........NnnnnnnnnnnnnnnnN......................',
    /* 23 */ '.........NNnnnnnnnnnnnnnNN......................',
    /* 24 */ '..........LpLpLpLpLpLpLpL.......................',
    /* 25 */ '..........LpLpLpLpLpLpLpL.......................',
    /* 26 */ '.........LpLp........LpLp.......................',
    /* 27 */ '........LpLp...........pL.......................',
    /* 28 */ '........pLp.............L.......................',
    /* 29 */ '........pLp.....................................',
    /* 30 */ '........pLp.....................................',
    /* 31 */ '........pLpLLLLLLLLLLLLpLp......................',
    /* 32 */ '.........pLpLpLpLpLpLpLp........................',
    /* 33 */ '....KKKKKKKKKKKKKKKKKKKKKKK.....................',
    /* 34 */ '....KkkkkkkkkkkkkkkkkkkkkkK.....................',
    /* 35 */ '....KkRRRRRRRRRRRRRRRRRRRkK.....BBBBB...........',
    /* 36 */ '....KkRJJJJJJJJJJJJJJJJJRkK.....BJBJB...........',
    /* 37 */ '....KkRJJJJJJJJJJJJJJJJJRkK.....BBBBB...........',
    /* 38 */ '....KkRJJJJJJJJJJJJJJJJJRkK.....................',
    /* 39 */ '....KkRRRRRRRRRRRRRRRRRRRkK.....................',
    /* 40 */ '....KkkkkkkkkkkkkkkkkkkkkkK.....................',
    /* 41 */ '....KKKKKKKKKKKKKKKKKKKKKKK.....................',
    /* 42 */ '.....JJ...................JJ....................',
    /* 43 */ '.....JJ...................JJ....................',
    /* 44 */ '................................................',
    /* 45 */ '.RRRRR..............BBBBB...............RRRRR...',
    /* 46 */ '.RJJJR..............BJBJB...............RJJJR...',
    /* 47 */ '.RRRRR..............BBBBB...............RRRRR...',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — collapsed on the floor, wings crumpled beneath,
   horns poking into the dirt. Suitcase has burst open at
   the demon's side, white clothes (W) spilling out across
   the ground. Boarding pass torn in half nearby.
   ───────────────────────────────────────────────────────────── */
const DEFEAT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '................................................',
    /* 07 */ '................................................',
    /* 08 */ '................................................',
    /* 09 */ '................................................',
    /* 10 */ '................................................',
    /* 11 */ '................................................',
    /* 12 */ '................................................',
    /* 13 */ '................................................',
    /* 14 */ '................................................',
    /* 15 */ '................................................',
    /* 16 */ '................................................',
    /* 17 */ '................................................',
    /* 18 */ '................................................',
    /* 19 */ '................................................',
    /* 20 */ '................................................',
    /* 21 */ '................................................',
    /* 22 */ '................................................',
    /* 23 */ '................................................',
    /* 24 */ '................................................',
    /* 25 */ '................................................',
    /* 26 */ '................................................',
    /* 27 */ '................................................',
    /* 28 */ '..............HH....HH..........................',
    /* 29 */ '...XSSX......HhH...HhH..........BBBB............',
    /* 30 */ '..XSppSSX....hhh.SSSSSS.hh......BJJB............',
    /* 31 */ '.XSppppppSXSSSSpppppppSSSSXX....BBBB......BBBB..',
    /* 32 */ 'XSppLLLLpSSSppLLLLLLLLLpLpSSXX............BJJB..',
    /* 33 */ 'XSppLpLLpLLpLpLLpLpLpYYpLpLpSXX...........BBBB..',
    /* 34 */ '.XSppLpLpLpLpLpLpLpLYJYpLpLpSXX.................',
    /* 35 */ '..XSppLpLpLpLpLpLpLpLYpLpLpSXX..................',
    /* 36 */ '...XSppLpLpLpLpLpLpLpLpLpLSXX...................',
    /* 37 */ '....XSSpppLpLpLpLpLpLpLpLSXX....................',
    /* 38 */ '.....XSSppppppNNNNNNNNNSSXX.....................',
    /* 39 */ '......XSSSSSSNnnWWWWnnnNXX......................',
    /* 40 */ '.......XXXXXXNnnWRRWnnnNXX......................',
    /* 41 */ '.............NnnWWWWnnnN........................',
    /* 42 */ '..KKKKKKKKKKKKKKKKKKKKKKKKKK....................',
    /* 43 */ '..KkkkkkkkkkkkkkkkkkkkkkkkkK....................',
    /* 44 */ '..KkRRRRRRRRRRRRRWWWWWWWWWWK....................',
    /* 45 */ '..KkRJJJJJJJJJJJJRWWWWWWWWWK..WWWWWWWW..........',
    /* 46 */ '..KkRRRRRRRRRRRRRWWWWWWWWWWK.WWWWWWWWWWW........',
    /* 47 */ '..KKKKKKKKKKKKKKKKKKKKKKKKKKWWWWWWWWWWWWWW......',
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

const Sprite = memo(function FlightDelayDemonSprite({
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
        viewBox={`0 0 ${W_PX} ${W_PX}`}
        width={size}
        height={size}
        role="img"
        aria-label="Flight Delay Demon — 班機延誤魔"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const FlightDelayDemon: CharacterArt = {
  meta: {
    id: 'flight-delay-demon',
    name: '班機延誤魔',
    englishName: 'Flight Delay Demon',
    role: 'generic',
    tier: 'minor',
    description: '紫翼惡魔穿 TSA 背心，拖著貼滿 DELAYED 貼紙的行李箱。',
  },
  Sprite,
};

export default FlightDelayDemon;
