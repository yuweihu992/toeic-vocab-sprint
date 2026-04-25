// Character: Email Spectre (信件幽靈)
// A floating semi-transparent envelope ghost. Body shaped like a giant
// SEALED envelope with a triangular flap, red wax seal in the center, and
// an "@" symbol stamped on the front. Two glowing yellow eyes peek above
// the flap. Ghostly arms stick out the sides; a wispy ghost trail with
// gaps replaces legs. Subtle cyan aura around the body.
// Faces LEFT (mouth/flap snap is to the left during attack).

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
  // Envelope paper (highlight → mid → shadow → deep shadow)
  W: '#f8fafc',
  P: '#e5e7eb',
  p: '#cbd5e1',
  d: '#94a3b8',
  // Red wax seal (highlight → mid → shadow)
  R: '#dc2626',
  r: '#b91c1c',
  X: '#7f1d1d',
  // Glowing yellow eyes (highlight → core)
  Y: '#fde047',
  y: '#facc15',
  // Black ink — pupils, "@" symbol, address text
  K: '#1c1917',
  // Ghost wispy trail (lighter → darker — both semi-transparent feel)
  T: '#e5e7eb',
  t: '#cbd5e1',
  // Cyan aura (highlight → soft glow)
  C: '#67e8f9',
  c: '#a5f3fc',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `email-spectre ${label} row ${i} has length ${r.length}, expected ${W}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — hovering, slight wobble, flap closed with red wax seal,
   eyes scanning slightly to the left side.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '..............c..............c..................',
    /* 03 */ '.............cCc............cCc.................',
    /* 04 */ '..............c..............c..................',
    /* 05 */ '.............dPPPPPPPPPPPPPPPd..................',
    /* 06 */ '............dPWWPPPPPPPPPPPPPPd.................',
    /* 07 */ '...........dPWWWPPPPPPPPPPPPPPPd................',
    /* 08 */ '..........dPWWPPdPPPPPPPPPPPPPPPd...............',
    /* 09 */ '.........dPWWPPyYydPPPPPPyYydPPPPd..............',
    /* 10 */ 'c.......dPWWPPPyKydPPPPPyKydPPPPPd......c.......',
    /* 11 */ 'CcccccddPWWPPPPPyydPPPPPPyydPPPPPPddcccccccccccc',
    /* 12 */ 'c......dPWWPPPPPPPPdPPPPPPPPPPPPPPPPd...c.......',
    /* 13 */ '.......dPWWPPPPPPPPdPdPPPPPPPPPPPPPPd...........',
    /* 14 */ 'C......dPWPPPPPPPPdPPPdPPPPPPPPPPPPPd...........',
    /* 15 */ 'c......dPWPPPPPPPdPPPPPdPPPPPPPPPPPPd...........',
    /* 16 */ '.......dPWPPPPPPdPPPRRRPdPPPPPPPPPPPd...........',
    /* 17 */ '.......dPWPPPPPdPPPRrrrRdPPPPPPPPPPPd...........',
    /* 18 */ '.......dPWPPPPdPPPRrXrrrRPdPPPPPPPPPd...........',
    /* 19 */ '.......dPPPPPdPPPPRrrrrrrRdPPPPPPPPPd...........',
    /* 20 */ '.......dPPPPdPPPPPRrrXrrrRPdPPPPPPPPd...........',
    /* 21 */ '.......dPPPdPPPPPPPRrrrrrRPPdPPPPPPPd...........',
    /* 22 */ '.......dPPPPdPPPPPPPRrrrRPPPdPPPPPPPd...........',
    /* 23 */ '.......dPPPPPdPPPPPPPRrRPPPdPPPPPPPPd...........',
    /* 24 */ '.......dPPPPPPdPPPPPPPRPPdPPPPPPPPPPd...........',
    /* 25 */ '.......dPPPPPPPdPPPKKKKKKdPPPPPPPPPPd...........',
    /* 26 */ '.......dPPPPPPPPdKKPPPPPKKKPPPPPPPPPd...........',
    /* 27 */ '.......dPPPPPPPPPKPPPPPPPPKPPPPPPPPPd...........',
    /* 28 */ '.......dPPPPPPPPKPPPPKKPPPKPPPPPPPPPd...........',
    /* 29 */ '.......dPPPPPPPPKPPPKKKKPPKPPPPPPPPPd...........',
    /* 30 */ '.......dPPPPPPPPKPPKKPPKKPKPPPPPPPPPd...........',
    /* 31 */ '..p....dPPPPPPPPKPPKKPPKKPKPPPPPPPPPd....p......',
    /* 32 */ '.ppp...dPPPPPPPPKPPPKKKPPPKPPPPPPPPPd...ppp.....',
    /* 33 */ 'ppppd..dPPPPPPPPPKPPPPPPPPKPPPPPPPPPd..dpppp....',
    /* 34 */ '.dPPd..dPPPPPPPPPdKKPPPKKKPPPPPPPPPPd..dPPd.....',
    /* 35 */ '..dd...dPPPPPPPPPPdKKKKKPPPPPPPPPPPPd...dd......',
    /* 36 */ '.......dPPPPPPPPPPPdPPPPPPPPPPPPPPPPd...........',
    /* 37 */ '.......dddPPPPPPPPddPPPPPPPPPPPPPPPdd...........',
    /* 38 */ '..........dddpppdd..ddpppdddpppdddd.............',
    /* 39 */ '..........t..ttt......ttt..ttt.t.t..............',
    /* 40 */ '.........tt.tttttt..tttttt..tttttt..............',
    /* 41 */ '........ttt..ttt.ttt.tt.tttt.tt..tt.............',
    /* 42 */ '.......tt..tttt....ttt......ttt...t.............',
    /* 43 */ '......t...ttt.....t.....tt....tttt..............',
    /* 44 */ '.......tttt.........t...........tt..............',
    /* 45 */ '........t.............ttt.......................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — drifting forward (toward viewer's left). Body tilted
   left, longer wispy trail streaming behind to the right.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '............c..............c....................',
    /* 03 */ '...........cCc............cCc...................',
    /* 04 */ '............c..............c....................',
    /* 05 */ '...........dPPPPPPPPPPPPPPPd....................',
    /* 06 */ '..........dPWWPPPPPPPPPPPPPPd...................',
    /* 07 */ '.........dPWWWPPPPPPPPPPPPPPPd..................',
    /* 08 */ '........dPWWPPdPPPPPPPPPPPPPPPd.................',
    /* 09 */ '.......dPWWPPyYydPPPPPPyYydPPPPd................',
    /* 10 */ 'c.....dPWWPPPyKydPPPPPyKydPPPPPd......c.........',
    /* 11 */ 'CcccddPWWPPPPPyydPPPPPPyydPPPPPPddcccccccc......',
    /* 12 */ '.....dPWWPPPPPPPPdPPPPPPPPPPPPPPPPd...c.........',
    /* 13 */ '.....dPWWPPPPPPPPdPdPPPPPPPPPPPPPPd.............',
    /* 14 */ 'C....dPWPPPPPPPPdPPPdPPPPPPPPPPPPPd.............',
    /* 15 */ 'c....dPWPPPPPPPdPPPPPdPPPPPPPPPPPPd.............',
    /* 16 */ '.....dPWPPPPPPdPPPRRRPdPPPPPPPPPPPd.............',
    /* 17 */ '.....dPWPPPPPdPPPRrrrRdPPPPPPPPPPPd.............',
    /* 18 */ '.....dPWPPPPdPPPRrXrrrRPdPPPPPPPPPd.............',
    /* 19 */ '.....dPPPPPdPPPPRrrrrrrRdPPPPPPPPPd.............',
    /* 20 */ '.....dPPPPdPPPPPRrrXrrrRPdPPPPPPPPd.............',
    /* 21 */ '.....dPPPdPPPPPPPRrrrrrRPPdPPPPPPPd.............',
    /* 22 */ '.....dPPPPdPPPPPPPRrrrRPPPdPPPPPPPd.............',
    /* 23 */ '.....dPPPPPdPPPPPPPRrRPPPdPPPPPPPPd.............',
    /* 24 */ '.....dPPPPPPdPPPPPPPRPPdPPPPPPPPPPd.............',
    /* 25 */ '.....dPPPPPPPdPPPKKKKKKdPPPPPPPPPPd.............',
    /* 26 */ '.....dPPPPPPPPdKKPPPPPKKKPPPPPPPPPd.............',
    /* 27 */ '.....dPPPPPPPPPKPPPPPPPPKPPPPPPPPPd.............',
    /* 28 */ '.....dPPPPPPPPKPPPPKKPPPKPPPPPPPPPd.............',
    /* 29 */ '.....dPPPPPPPPKPPPKKKKPPKPPPPPPPPPd.............',
    /* 30 */ '.....dPPPPPPPPKPPKKPPKKPKPPPPPPPPPd.............',
    /* 31 */ '..p..dPPPPPPPPKPPKKPPKKPKPPPPPPPPPd....p........',
    /* 32 */ '.ppp.dPPPPPPPPKPPPKKKPPPKPPPPPPPPPd...ppp.......',
    /* 33 */ 'ppppddPPPPPPPPPKPPPPPPPPKPPPPPPPPPd..dpppp......',
    /* 34 */ '.dPPd.dPPPPPPPPPdKKPPPKKKPPPPPPPPPPd.dPPd.......',
    /* 35 */ '..dd..dPPPPPPPPPPdKKKKKPPPPPPPPPPPPd..dd........',
    /* 36 */ '......dPPPPPPPPPPPdPPPPPPPPPPPPPPPPd............',
    /* 37 */ '......dddPPPPPPPPddPPPPPPPPPPPPPPPdd............',
    /* 38 */ '.........dddpppdd..ddpppdddpppdddd..............',
    /* 39 */ '.........t.tttt.tt.t.tt.tt.tt..t..t.tt..........',
    /* 40 */ '........tt..ttt....t.t..t.tttttttttttt..........',
    /* 41 */ '.......tt..tt.ttt..ttt.tt..ttttttttttttttt......',
    /* 42 */ '........tt..tt..tttt..tt.t.tttt.ttttttt..t......',
    /* 43 */ '.........tt..tt..tt....ttt.tttt.....tt..........',
    /* 44 */ '..........tt..t.ttt.....ttttttt.................',
    /* 45 */ '...........tt....tttt.....ttt...................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — envelope flap snapping open like a mouth, lunging
   forward (left). The triangular flap is hinged open revealing
   dark interior; wax seal cracks. Arms thrust forward.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '..........c..............c......................',
    /* 02 */ '.........cCc............cCc.....................',
    /* 03 */ '..........c..............c......................',
    /* 04 */ '..........dPPPPPPPPPPPPPPPd.....................',
    /* 05 */ '.........dPWWPPyYydPPPPyYydPPd..................',
    /* 06 */ '........dPWWWPPyKydPPPPyKydPPPd.................',
    /* 07 */ '.......dPWWPPPPyydPPPPPPyydPPPPd................',
    /* 08 */ '......dPWWPPPPPPPPPdPPPPPPPPPPPd................',
    /* 09 */ '.....dPWWPPPPPPPPPdKdPPPPPPPPPPd................',
    /* 10 */ 'CccddPWWPPPPPPPPPdKKKdPPPPPPPPPdcccccccc........',
    /* 11 */ '....dPWWPPPPPPPPdKKKKKdPPPPPPPPPd...c...........',
    /* 12 */ '....dPWWPPPPPPPdKKKKKKKdPPPPPPPPd...............',
    /* 13 */ '....dPWWPPPPPPdKKKKKKKKKdPPPPPPPd...............',
    /* 14 */ 'C...dPWPPPPPPdKKKKKKKKKKKdPPPPPPd...............',
    /* 15 */ 'c...dPWPPPPPdKKKKKKKKKKKKKdPPPPPd...............',
    /* 16 */ '....dPWPPPPdKKKKKRRRRRKKKKKKdPPPd...............',
    /* 17 */ '....dPWPPPdKKKKKRrrrrrRKKKKKKdPPd...............',
    /* 18 */ '....dPWPPdKKKKKRrXrrXrRKKKKKKKdPd...............',
    /* 19 */ '....dPPPdKKKKKKRrrrrrrrRKKKKKKKdd...............',
    /* 20 */ '....dPPdKKKKKKKRrrXrrrrRKKKKKKKKd...............',
    /* 21 */ '....dPPdKKKKKKKKRrrrrrrRKKKKKKKKd...............',
    /* 22 */ '....dPPdKKKKKKKKKRrrrrRKKKKKKKKKd...............',
    /* 23 */ '....dPPPdKKKKKKKKKRrrRKKKKKKKKKKd...............',
    /* 24 */ '....dPPPPdKKKKKKKKKRRKKKKKKKKKKKd...............',
    /* 25 */ '....dPPPPPdKKKKKKKKKKKKKKKKKKKKKd...............',
    /* 26 */ '....dPPPPPPdPPPPPKKKKKKKKKKKKKKKd...............',
    /* 27 */ '....dPPPPPPPPdPPPPPPPPKKKKKKKKKKd...............',
    /* 28 */ '....dPPPPPPPPdPPPPKKPPPKKKKKKKKKd...............',
    /* 29 */ '....dPPPPPPPPdPPPKKKKPPKPPPPPPPPd...............',
    /* 30 */ '....dPPPPPPPPdPPKKPPKKPKPPPPPPPPd...............',
    /* 31 */ '.p..dPPPPPPPPdPPKKPPKKPKPPPPPPPPd...p...........',
    /* 32 */ 'ppp.dPPPPPPPPdPPPKKKPPPKPPPPPPPPd..ppp..........',
    /* 33 */ 'ppdddPPPPPPPPPdPPPPPPPPKPPPPPPPPd.dpppd.........',
    /* 34 */ '.dPd.dPPPPPPPPPdKKPPPKKKPPPPPPPPd..dPPd.........',
    /* 35 */ '..d..dPPPPPPPPPPdKKKKKPPPPPPPPPPd...dd..........',
    /* 36 */ '.....dPPPPPPPPPPPdPPPPPPPPPPPPPPd...............',
    /* 37 */ '.....dddPPPPPPPPddPPPPPPPPPPPPPdd...............',
    /* 38 */ '........dddpppdd..ddpppdddpppdd.................',
    /* 39 */ '..........t..t......tt..tt.t.t..................',
    /* 40 */ '..........tt.t.tt..tttt..ttttt..................',
    /* 41 */ '..........tt..tt.tt.t.tttttttttt................',
    /* 42 */ '...........tt..ttt....tttt.....ttt..............',
    /* 43 */ '............t...t.....t.t.....tttt..............',
    /* 44 */ '..............tt.t.....t.tt.....tt..............',
    /* 45 */ '...............tt......ttt......................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — body crumpled inward (squashed), eyes wide with shock.
   Wax seal cracked; aura flickering. Trail jagged and short.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '...............c.........c......................',
    /* 02 */ '..............cCc.......cCc.....................',
    /* 03 */ '...............c.........c......................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '..........dPPPPPPPPPPPPPPPPPPPPPPd..............',
    /* 07 */ '.........dPWWPPPPPPPPPPPPPPPPPPPPPd.............',
    /* 08 */ '........dPWWWPYYYYPPPPPPPPYYYYPPPPd.............',
    /* 09 */ '........dPWWPYKKYPdPPPPPPYKKYPPPPPPd............',
    /* 10 */ 'C.......dPWWPYKKYPPdPPPPPYKKYPPPPPPd...C........',
    /* 11 */ 'cccccddPPWWPYYYYPPPPdPPPPYYYYPPPPPPPdccccccc....',
    /* 12 */ 'C......dPPWWPPPPPPPPdPPPPPPPPPPPPPPPPd...C......',
    /* 13 */ '.......dPPWPPPPPPPPdPdPPPPPPPPPPPPPPPd..........',
    /* 14 */ '.......dPPWPPPPPPPdPPPdPPPPPPPPPPPPPPd..........',
    /* 15 */ '.......dPPWPPPPPPdPPPPPdPPPPPPPPPPPPPd..........',
    /* 16 */ '.......dPPWPPPPPdPPPXXXPdPPPPPPPPPPPPd..........',
    /* 17 */ '.......dPPWPPPPdPPPXrrXXdPPPPPPPPPPPPd..........',
    /* 18 */ '.......dPPWPPPdPPPXrXXrXXPdPPPPPPPPPPd..........',
    /* 19 */ '.......dPPPPPdPPPPXrrXrrrXdPPPPPPPPPPd..........',
    /* 20 */ '.......dPPPPdPPPPPXrXXrrrXPdPPPPPPPPPd..........',
    /* 21 */ '.......dPPPdPPPPPPPXrrXrrXPPdPPPPPPPPd..........',
    /* 22 */ '.......dPPPPdPPPPPPPXrXrXPPPdPPPPPPPPd..........',
    /* 23 */ '.......dPPPPPdPPPPPPPXrXPPPdPPPPPPPPPd..........',
    /* 24 */ '.......dPPPPPPdPPPPPPPXPPdPPPPPPPPPPPd..........',
    /* 25 */ '.......dPPPPPPPdPPPKKKKKKdPPPPPPPPPPPd..........',
    /* 26 */ '.......dPPPPPPPPdKKPPPPPKKKPPPPPPPPPPd..........',
    /* 27 */ '.......dPPPPPPPPPKPPPPPPPPKPPPPPPPPPPd..........',
    /* 28 */ '.......dPPPPPPPPKPPPPKKPPPKPPPPPPPPPPd..........',
    /* 29 */ '.......dPPPPPPPPKPPPKKKKPPKPPPPPPPPPPd..........',
    /* 30 */ '.......dPPPPPPPPKPPKKPPKKPKPPPPPPPPPPd..........',
    /* 31 */ '.......dPPPPPPPPKPPKKPPKKPKPPPPPPPPPPd..........',
    /* 32 */ '.......dPPPPPPPPKPPPKKKPPPKPPPPPPPPPPd..........',
    /* 33 */ '......ddPPPPPPPPPKPPPPPPPPKPPPPPPPPPPd..........',
    /* 34 */ '......dPPPPPPPPPPdKKPPPKKKPPPPPPPPPPPd..........',
    /* 35 */ '......dPPPPPPPPPPPdKKKKKPPPPPPPPPPPPPd..........',
    /* 36 */ '......dPPPPPPPPPPPPdPPPPPPPPPPPPPPPPPd..........',
    /* 37 */ '......dddPPPPPPPPPPddPPPPPPPPPPPPPPPdd..........',
    /* 38 */ '.........dddpppddd..dddpppdddpppdddd............',
    /* 39 */ '............ttt........ttt...ttt................',
    /* 40 */ '...........t..t........t.t...tt.................',
    /* 41 */ '..........t....t......t...t..t..................',
    /* 42 */ '.........t......t....t.....t.t..................',
    /* 43 */ '..........tt....t......t....tt..................',
    /* 44 */ '...........tt..t........tt..t...................',
    /* 45 */ '............ttt..........tt.....................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — SPAM STORM. Multiple smaller envelopes radiate
   outward from the body in 8 directions. Body glows brighter,
   eyes blazing, central wax seal pulsing.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ 'dPPd.....................................dPPd...',
    /* 01 */ 'dWPd......................................dPd...',
    /* 02 */ 'dPPd........dPPd...............dPPd........dPd..',
    /* 03 */ '.dd........dWPPd...............dPPd........dd...',
    /* 04 */ '...........dPPd.................dd..............',
    /* 05 */ '............dd.................c................',
    /* 06 */ '...........cCc.....dPPPPPPPPPd.cCc..............',
    /* 07 */ '............c.....dPWWPPPPPPPPd.c...............',
    /* 08 */ '.................dPWWWPyYydPPPPd................',
    /* 09 */ '................dPWWPPyKydPyYydPd...............',
    /* 10 */ 'CcccccddccccccccdPWWPPyydPPyKydPPdcccccccccccccc',
    /* 11 */ 'C......dd.......dPWWPPPPPPPyydPPPd......dd......',
    /* 12 */ 'C......dPd......dPWWPPPRRRPPPPPPPd......dPd.....',
    /* 13 */ 'C......dPPd.....dPWPPPRrrrRPPPPPPd......dPPd....',
    /* 14 */ 'C......dPPPd....dPWPPRrXrrrRPPPPPd......dPPPd...',
    /* 15 */ 'C......dPPPd....dPPPRrrXrrrrRPPPPd......dPPPd...',
    /* 16 */ 'C......dPPd.....dPPPRrrrrXrrrRPPPd......dPPd....',
    /* 17 */ 'C......dPd......dPPPPRrrrrrrRPPPPd......dPd.....',
    /* 18 */ 'C......dd.......dPPPPPRrrrrRPPPPPd......dd......',
    /* 19 */ '................dPPPPPPRrrRPPPPPPd..............',
    /* 20 */ '................dPPPPPPPRRPPPPPPPd..............',
    /* 21 */ '..........dd...dPPPKKKKKKPPPPPPPd...dd..........',
    /* 22 */ '.........dPd...dPPPKPPPPKPPPPPPPd...dPd.........',
    /* 23 */ '..........dPPd..dPPKPPKKPKPPPPPPPd..dPPd........',
    /* 24 */ '..........dPPPd.dPPKPKKPKKPPPPPPPd..dPPPd.......',
    /* 25 */ '..........dPPPd.dPPKPKKPKKPPPPPPPd..dPPPd.......',
    /* 26 */ '..........dPPd..dPPKPPKKKPKPPPPPPd..dPPd........',
    /* 27 */ '..........dPd...dPPPKKPPPKPPPPPPPd..dPd.........',
    /* 28 */ '..........dd....dPPPPKKKPPPPPPPPPd..dd..........',
    /* 29 */ '................ddPPPPPPPPPPPPPPdd..............',
    /* 30 */ 'Ccccccccccccccccddpppppppppdpppdcccccccccccccccc',
    /* 31 */ 'C......................t..t.tt..................',
    /* 32 */ 'C.....dPPd..........tt..tttt..tt..........dPPd..',
    /* 33 */ 'C.....dWPd.........t..tt.tt.tt..t.........dWPd..',
    /* 34 */ '......dPPd......tt.tt.t.t.tttt.tt.tt......dPPd..',
    /* 35 */ '.......dd........tt.t.tt..tt.tt.tt.........dd...',
    /* 36 */ '..................tt.tt..t.tt.t.................',
    /* 37 */ '...................t.t.tt..t.tt.................',
    /* 38 */ '....................ttt..ttttt..................',
    /* 39 */ '...........dPd...........tt......dPd............',
    /* 40 */ '..........dPPd...........tt......dPPd...........',
    /* 41 */ '..........dPPd......................dPPd........',
    /* 42 */ '...........dd........................dd.........',
    /* 43 */ 'dPd...............................dPd...........',
    /* 44 */ 'dPPd.............................dPPd...........',
    /* 45 */ 'dPPd..............................dPPd..........',
    /* 46 */ '.dd................................dd...........',
    /* 47 */ '................................................',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — faded out, drifting downward. Eyes closed (X marks),
   envelope tilted, wax seal cracked, body sinking with a long
   thin dispersing trail above.
   ───────────────────────────────────────────────────────────── */
const DEFEAT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '...........t....t.....t.....t...t...............',
    /* 04 */ '............t....tt...t...tt..t..t..............',
    /* 05 */ '..............tttt.tttttt.tttt.t................',
    /* 06 */ '...............ttttttttttttttttt................',
    /* 07 */ '.................t.tt..t.tt..t..................',
    /* 08 */ '.................................t..............',
    /* 09 */ '...........dpppppppppppppppppd..................',
    /* 10 */ '..........dPpPpppppppppppppppPd.................',
    /* 11 */ '.........dPpPPpKKpppppppKKpppppd................',
    /* 12 */ '.........dPpPPpKKpppdpppKKpppppPd...............',
    /* 13 */ '........dPppPpppppdpdpppppppppppd...............',
    /* 14 */ '........dPpPpppppdpppdppppppppppPd..............',
    /* 15 */ '........dPpPppppdpppppdpppppppppPd..............',
    /* 16 */ '........dPpPpppdppXXXppdpppppppppd..............',
    /* 17 */ '........dPpPppdppXrrXXpdpppppppppd..............',
    /* 18 */ '........dPpPpdppXrXXrXXpdpppppppPd..............',
    /* 19 */ '........dPpppdppXrrXrrrXdpppppppPd..............',
    /* 20 */ '........dPppdppppXrrrXrXpdppppppPd..............',
    /* 21 */ '........dPpdppppppXrrrrrXppdpppppd..............',
    /* 22 */ '........dPppdpppppppXrrrXpppdppppd..............',
    /* 23 */ '........dPpppdpppppppXrXpppdppppPd..............',
    /* 24 */ '........dPpppPdpppppppXppdppppppPd..............',
    /* 25 */ '........dPppppPdpppKKKKKpdpppppppd..............',
    /* 26 */ '........dPpppppPdKKpppppKKKpppppd...............',
    /* 27 */ '........dPpppppppKpppppppKpppppPd...............',
    /* 28 */ '........dPpppppppKpppKKpKKpppppPd...............',
    /* 29 */ '........dPpppppppKppKKKKpKpppppPd...............',
    /* 30 */ '........dPpppppppKpKKppKKpKppppPd...............',
    /* 31 */ '........dPpppppppKpKKppKKpKppppPd...............',
    /* 32 */ '........dPpppppppKppKKKpppKpppppd...............',
    /* 33 */ '........dPpppppppPKpppppppKppppPd...............',
    /* 34 */ '........dPpppppppPdKKpppKKKpppppd...............',
    /* 35 */ '........dPpppppppPpdKKKKKpppppppd...............',
    /* 36 */ '........dPppppppppPdpppppppppppPd...............',
    /* 37 */ '........dddPppppppPddpppppppppppdd..............',
    /* 38 */ '...........dddpppdd...ddpppdddppd...............',
    /* 39 */ '...............t.t......t...t...................',
    /* 40 */ '..............t.t........t...t..................',
    /* 41 */ '..............t..t.......tt..t..................',
    /* 42 */ '...............t..t.......t..t..................',
    /* 43 */ '................t...........t...................',
    /* 44 */ '................................................',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
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

const Sprite = memo(function EmailSpectreSprite({
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
        aria-label="Email Spectre — 信件幽靈"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const EmailSpectre: CharacterArt = {
  meta: {
    id: 'email-spectre',
    name: '信件幽靈',
    englishName: 'Email Spectre',
    role: 'generic',
    tier: 'minor',
    description: '漂浮的信封幽靈，紅蠟封印、@ 符號胸口、煙霧尾巴。',
  },
  Sprite,
};

export default EmailSpectre;
