// Character: Rule Slime (規定史萊姆)
// A bureaucratic horror — a congealed humanoid mass of yellowed legal
// documents wadded together. Semi-translucent ink-bleeding form with
// 4-5 stamp-shaped eyeballs scattered over the body, a torn-paper mouth
// with jagged paper-edge teeth, dripping black ink trails, and a dried
// red wax seal on its forehead. Faces LEFT.
// References: Stardew Valley slime + Office paperwork hell + ghost
// trash from Spirited Away.

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
  // Yellowed paper body (light upper-left → mid → grey edge → shadow)
  P: '#fef3c7',
  p: '#fde68a',
  G: '#d6d3d1',
  g: '#a8a29e',
  // Darker stained patches (mid stain → deep stain)
  U: '#92400e',
  u: '#78350f',
  // Subtle ink text lines / outline (dark soft → near black)
  L: '#292524',
  J: '#1c1917',
  // Dripping black ink (deepest)
  K: '#0c0a09',
  // Eye sclera (white → slight grey)
  W: '#f8fafc',
  w: '#e5e7eb',
  // Pupil (reuse J already; explicit for clarity)
  // Red wax seal (highlight → mid → shadow)
  R: '#dc2626',
  r: '#b91c1c',
  N: '#7f1d1d',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  // Defensive: catch row-width mistakes during development. No `any` used.
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `rule-slime ${label} row ${i} has length ${r.length}, expected ${W}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — congealed blob shape, eyes scattered and scanning.
   Wax seal on forehead, ink dripping at base. Faces left.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '..............JJJJJJJJJJJJJJ....................',
    /* 07 */ '............JJPPPPPPPPPPPPPPJJ..................',
    /* 08 */ '..........JJPPpPPPPPPPPPPPPpPPJJ................',
    /* 09 */ '.........JPPPPPPPPpPPPPPPPpPPPPJ................',
    /* 10 */ '........JPPPPpPPPPPPPNNRRrNPPPPPPJ..............',
    /* 11 */ '.......JPPPPPPpPPPPPNRRrrrrNPPPPPPJ.............',
    /* 12 */ '......JPpPPPPPPPPPPNRrrrrrrrNPpPPPPJ............',
    /* 13 */ '.....JPPPPpPPPPPPPPNrrrrrrrrNPPPPPpJ............',
    /* 14 */ '.....JPPPPPPpPLLLLLPNRrrrrrNPLLLLLPPJ...........',
    /* 15 */ '.....JPwWWwPLpPPPPPPNNNNNNNPPPPPpPLPPJ..........',
    /* 16 */ '....JPpwWJWwLPPPPPPpPPPPPPPPPpPPPPPPPJ..........',
    /* 17 */ '....JPwWWWwPLPPPLLLLPPPPpPPPPPPPpPPPpPJ.........',
    /* 18 */ '....JPpwwwPPLPPPLwWLPPPPPPpLLPPPPPPPPPJ.........',
    /* 19 */ '....JPPPPpPPLPPPLwJLPPPPPLwWLPPpPPPPPPJ.........',
    /* 20 */ '....JPPpPPPPLPPPLWwLPPPPPLwJLPPPPPPpPPJ.........',
    /* 21 */ '....JPpPPPPpPPPPLLLLPpPPPPLWwLPPPPPPPPJ.........',
    /* 22 */ '....JPPPPpPPPPpPPPPPPPPPPpLLLLPPpPpPPPJ.........',
    /* 23 */ '....JPpPPPPLLLLLPPPPpPPPPPPPPPPPPPPPpPJ.........',
    /* 24 */ '....JPPPPPPLwWWLPPPpPPPPpPPPPpPPPPpPPPJ.........',
    /* 25 */ '....JPpPPPPLwWJLPPPPPPPpPPPPPPPPPPPPPPJ.........',
    /* 26 */ '....JPPPPPpLWWwLPPPPpPPPPPPpPpPPPPpPPpJ.........',
    /* 27 */ '....JPPpPPPLLLLPPPPPPPPPPpPPPPPPPpPPPPJ.........',
    /* 28 */ '....JPPPPpPPPPPPPpPPPPPpPPPPPPpPPPPPPpJ.........',
    /* 29 */ '....JPPPPPPpPPPPPPPpPLLLLLPPPPPPPpPPPPJ.........',
    /* 30 */ '....JPPpPPPPPPpPPPPPLwWWwLPPPpPPPPPPPpJ.........',
    /* 31 */ '....JPPPPpPPPPPPPpPPLwJJwLPPPPPpPPPPPPJ.........',
    /* 32 */ '....JPPPPPPPpPPPPPPPLWWWwLPPPPPPPPPpPPJ.........',
    /* 33 */ '....JPpPPPPPPPPpPPPPLLLLLPPpPPPPPPPPPPJ.........',
    /* 34 */ '....JPPPPpPPPPPPPpPPPPPPPPPPPPPpPPpPpPJ.........',
    /* 35 */ '....JPPPPPPpPPPPPPPpPPPPPPpPPPPPPPPPPpJ.........',
    /* 36 */ '....JPPPpPPPPpPPPPPPPpPPPPPPPpPPPPPpPPJ.........',
    /* 37 */ '....JPPPPPPpPPPPPpPPPPPPpPPPPPPPpPPPPPJ.........',
    /* 38 */ '....JPpPPPPPPPpPPPPPpPPPPPPpPPPPPPpPPpJ.........',
    /* 39 */ '....JPPPPpPPPPPPPpPPPPPpPPPPPPpPPPPPPPJ.........',
    /* 40 */ '....JPPPPPPPpPPPPPPPpPPPPpPPPPPPPpPPPpJ.........',
    /* 41 */ '....JggPPPPPPPpPPPgggPPPPPPpPgggPPPpgPJ.........',
    /* 42 */ '....JJggggPPPgggggKKgggPPPgggggKKgggJJ..........',
    /* 43 */ '......JJJggKKKKgggJJKgggKKKKKKgggKKJJ...........',
    /* 44 */ '.........JJKKKKKKKKKKKKKKKKKKKKJJ...............',
    /* 45 */ '...........KKKKKKKKKKKKKKKKKKKK.................',
    /* 46 */ '............KKK..KKKKK..KKKK.KKK................',
    /* 47 */ '.............K....KKK....KK...K.................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — oozing forward to the left, body stretched horizontally,
   leading edge bulging out, trailing edge squished thin.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
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
    /* 09 */ '..........JJJJJJJJJJJJJJJJ......................',
    /* 10 */ '........JJPPPPPPPPPPPPPPPPJJ....................',
    /* 11 */ '.......JPPPPpPPPPPPPNNRRrNPPJJ..................',
    /* 12 */ '......JPPPPPPPPPpPPNRRrrrrNPPPJJ................',
    /* 13 */ '.....JPpPPPPPPPPPPNRrrrrrrNPPPPPJ...............',
    /* 14 */ '....JPPPPpPPPPPPPPNrrrrrrNPPPPPPpJ..............',
    /* 15 */ '....JPwWWwPPLLLLLPNRrrrrNPLLLLLPPPJ.............',
    /* 16 */ '....JPwWJWwPLpPPPPPNNNNNPPPPPPpPLPJ.............',
    /* 17 */ '....JPwWWWwPLPPPPpPPPPPPpPPPPPPPLPJ.............',
    /* 18 */ '....JPpwwwPPLPPPLLLLPPPPPLLLLPPPPPPJ............',
    /* 19 */ '....JPPPPpPPLPPPLwWLPPPPPLwWLPPpPPPJ............',
    /* 20 */ '....JPPpPPPPLPPPLwJLPPPpPLWwLPPPPPpJ............',
    /* 21 */ '....JPpPPPPPPPPLLLLLPPPPLLLLPPPPPPPJ............',
    /* 22 */ '....JPPPPpPPPpPPPPPPPpPPPPPPPpPPPPPJ............',
    /* 23 */ '....JPpPPPPLLLLLPPpPPPPPPPpPPPPPPpPJ............',
    /* 24 */ '....JPPPPPPLwWWLPPPPpPLLLLLPPPPpPPPJ............',
    /* 25 */ '....JPpPPPPLwWJLPPPpPPLwWWwLPPPPPPPJ............',
    /* 26 */ '....JPPPPPpLWWwLPPPPPPLwJJwLPPPpPpPpJ...........',
    /* 27 */ '....JPPpPPPLLLLPPpPpPPLWWWwLPPPPPPPPJ...........',
    /* 28 */ '....JPPPPpPPPPPpPPPPPPPLLLLPpPpPPPPPpJ..........',
    /* 29 */ '....JPpPPPpPPPPPPpPPPpPPPPpPPPPPPPpPPJ..........',
    /* 30 */ '....JPPPPPpPPPPpPPpPPPPpPPPPpPpPPpPPpJ..........',
    /* 31 */ '....JPpPPPPPpPPPPPPPpPPPPPPPpPpPPPPPPJ..........',
    /* 32 */ '...JPPPPpPPPPPpPPPpPPPPpPPPPpPPPPPpPPpJ.........',
    /* 33 */ '...JPPPPPPPpPPPPPPpPPPpPPPPPpPPpPPPPPpJ.........',
    /* 34 */ '...JPpPPPPPPPpPPPpPPPpPPPpPPPPPpPPpPPPJ.........',
    /* 35 */ '..JPPPPpPPPPPPPpPPPPPpPPPPpPPPpPPPPPPPpJ........',
    /* 36 */ '..JPPPPPPpPPPPPPPpPPPPpPPpPPPPPpPPPPpPPJ........',
    /* 37 */ '..JPpPPPPPPpPPPPPPPpPPpPPPPPpPPPPPpPPPPJ........',
    /* 38 */ '.JPPPPPPpPPPPPpPPPPPPPpPPPpPPPPPPpPPPPPpJ.......',
    /* 39 */ '.JPpPPPPPPpPPPPPPPpPPPpPPPPpPPPPpPPPPpPPJ.......',
    /* 40 */ '.JPPPPpPPPPPPPpPPPPPpPPpPPPPPpPPPPPPPPPPJ.......',
    /* 41 */ 'JPgggPPPPPpPPPPPPpPPPPPpPPPPPpPPPPpPPPPPpJ......',
    /* 42 */ 'JggggggPPPPPPpPPPPPgggggPPPpPPgggPPPPPPPpJ......',
    /* 43 */ 'JJggKKgggPgggggKKgggKKKKgggggggKKgggPPPPpJ......',
    /* 44 */ '..JKKKKKKgggKKKKKKKKKKKKKKKKKKKKKKKKgggggJ......',
    /* 45 */ 'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK......',
    /* 46 */ '.KK.KKK..KKK.KKKKK..KKKKK..KKKKKK..KKK.KK.......',
    /* 47 */ '..K..K....K...KKK....KKK...KKK......K..K........',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — lunging forward (left), torn-paper mouth wide open
   showing jagged paper-edge teeth and a black ink throat. Body
   stretched into a forward-leaning teardrop shape.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '......................JJJJJJJJJJJJJJ............',
    /* 07 */ '...................JJPPPPPPPPPPPPPPJJ...........',
    /* 08 */ '.................JPPPPpPPPPPPPNNRRrNPJ..........',
    /* 09 */ '...............JPPPPPPPPPPPPNRRrrrrNPPJ.........',
    /* 10 */ '..............JPPPpPPPPPPPPPNRrrrrrrNPpJ........',
    /* 11 */ '.............JPpPLLLLPPpPPPPNrrrrrrrNPPPJ.......',
    /* 12 */ '............JPPPLwWWLPPPPPPNRrrrrrNPPPPPJ.......',
    /* 13 */ '...........JPPPPLwJWLPPpPPPPNNNNNNPPPPPPJ.......',
    /* 14 */ '..........JPPpPPLWWwLPPPPPPpPPPPPPPpPPPPJ.......',
    /* 15 */ '.........JPPPPPPLLLLPPPPPPPPpPPPPPPPPPPPJ.......',
    /* 16 */ '........JPPpPPPPPPPPpPPLLLLLLLLLLLLPPPPPJ.......',
    /* 17 */ '.....KKKKKKKKKKKKKKKKLwwwwwwwwwwwwLPPpPPJ.......',
    /* 18 */ '....KKKKKKKKKKKKKKKKLwWWWWWWWWWWWWLpPPPPJ.......',
    /* 19 */ '...KKgggggggggggggggLwWJJJJJJJJJWWLPPpPPJ.......',
    /* 20 */ '...KKggwWLLLLLLLLgggLwWWWJJJJJWWWWLPPPPPJ.......',
    /* 21 */ '...KKwwLLLLLLLLLLwWWLwWWWWWWWWWWWWLPpPPPJ.......',
    /* 22 */ '...KKwwLwwwwwwwwLwJWLwwwwwwwwwwwwwLPPPpPJ.......',
    /* 23 */ '...KKwwLwwwwwwwwLWWwLLLLLLLLLLLLLLLPpPPPJ.......',
    /* 24 */ '...KKwwLwwwwwwwwLLLLPPPPPPPPpPPPPPPPPPPPJ.......',
    /* 25 */ '...KKwwLLLLLLLLLLPPpPPPPPPPPPPPpPPPPPPpPJ.......',
    /* 26 */ '...KKgggwwwwwLPPPPPPPPLLLLLPPPpPPPPpPPPPJ.......',
    /* 27 */ '....KKgggggggLPPpPPPPLwWWwLPPPPPPPPPPPPPJ.......',
    /* 28 */ '.....KKKKKKKKKKKPPPPPLwJJwLPpPPPpPPPpPPPJ.......',
    /* 29 */ '.......KKKKKKKKKKPPpPLWWWwLPPPPPPPPPPPpPJ.......',
    /* 30 */ '.........JPpPPPPPPPPPPLLLLLPPpPPPPPPPPPPJ.......',
    /* 31 */ '.........JPPPPpPPPpPPPPPPPPPPPPpPPPpPPpPJ.......',
    /* 32 */ '.........JPPpPPPPPPPpPPPPpPPPPPPPpPPPPPPJ.......',
    /* 33 */ '.........JPPPPPpPPPPPPPpPPPPPPpPPPPpPPPpJ.......',
    /* 34 */ '.........JPpPPPPPPpPPPPPPpPPPPPPPPpPPPPPJ.......',
    /* 35 */ '..........JPPPPpPPPPPpPPPPPpPPpPPPPPpPPpJ.......',
    /* 36 */ '..........JPPpPPPPPPPPPPPpPPPPPPPpPPPPPPJ.......',
    /* 37 */ '..........JPPPPPpPPPPPpPPPPPPpPpPPPPPpPPJ.......',
    /* 38 */ '..........JPgggPPPPPPpPPPPgggPPPPPPPpPPPJ.......',
    /* 39 */ '...........JJgggggPPPgggggKKgggPPPgggggPJ.......',
    /* 40 */ '.............JJgggggKKKKgggKKKKKKgggggJJ........',
    /* 41 */ '...............JJgKKKKKKKKKKKKKKKKKKJJ..........',
    /* 42 */ '.................KKKKKKKKKKKKKKKKKKKKK..........',
    /* 43 */ '..................KKKKKKKKKKKKKKKKKKK...........',
    /* 44 */ '...................KK..KKKKK..KKKK.KKK..........',
    /* 45 */ '....................K...KKK....KK...K...........',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — body splattered/recoiled to the right, eyes wide and
   shocked. Chunks of ink and torn paper flying off. Mouth agape.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '...K.........K................K.........K.......',
    /* 02 */ '..KKK.......KKK..............KKK.......KKK......',
    /* 03 */ '...K.........K................K.........K.......',
    /* 04 */ '..G..........G................G.........G.......',
    /* 05 */ '.GPG..K.....GPG.....K........GPG..K.....GPG.....',
    /* 06 */ '..G..KKK.....G.....KKK........G..KKK.....G......',
    /* 07 */ '.....JJJJJJJJJJJJJJJJJJJ........................',
    /* 08 */ '...JJPPPPPPPPPPPPPPPPPPPJJ......................',
    /* 09 */ '..JPpPPPPPPPPPPPPPNNRRrNPPJ.....................',
    /* 10 */ '..JPPPPpPPPPPPPPPNRRrrrrNPPJ....................',
    /* 11 */ '.JPPPPPPPPpPPPPPPNRrrrrrrNPPJ...................',
    /* 12 */ '.JPpPPpPPPPPPPPPPNrrrrrrrNPPPJ..................',
    /* 13 */ '.JPPPPPPLLLLLPPPPNRrrrrrrNPPPJ..................',
    /* 14 */ '.JPwwwLLwWWWWLPPPPNNNNNNNPPPPJ..................',
    /* 15 */ 'JPwWWWLwWJJJJWLpPPpPPPPPPPPPpJ..................',
    /* 16 */ 'JPWWWWLwJJWWJJWLPPPpPLLLLLLPPJ..................',
    /* 17 */ 'JPwwWwLwJWWWWJWLPPPPLwWWWWWLPJ..................',
    /* 18 */ 'JPwwLLLwJJJJJJWLPPPPLwJWJJJWLJ..................',
    /* 19 */ 'JPLLPPPLLLLLLLLLPPPpLWJWJJJJWLJ.................',
    /* 20 */ 'JPPPPpPPPPPPPPPPPPPPLwJJWJWJJWLJ................',
    /* 21 */ 'JPPPPPPLLLLLPPPPPPpPLwJWJJJJJWLJ................',
    /* 22 */ 'JPpPPPPLwWWWLPPpPPPPLwJJWJJJWWLJ................',
    /* 23 */ 'JPPPPPPLwJJJWLPPPPPPLLLLLLLLLLLJ................',
    /* 24 */ 'JPPpPPPLWWWWWLPPPpPPPPpPPPPPPPPJ................',
    /* 25 */ 'JPPPPPPLLLLLLLPPPPPPPPPPPPPPpPpJ................',
    /* 26 */ 'JPPPPpPPPPPPPPPPPPpPLLLLLLPPPPPJ................',
    /* 27 */ 'JPpPPPPPPPpPPPPPPPPPLwWWWLPPPpPJ................',
    /* 28 */ 'JPPPPPpPPPPPPPpPPpPPLwJWWLPpPPPJ................',
    /* 29 */ 'JPPPPPPPPpPPPPPPPPPPLWWWWLPPPPPJ................',
    /* 30 */ 'JPpPPPPpPPPPPpPPPPPPLLLLLLPPPpPJ................',
    /* 31 */ 'JPPPPpPPPPPPPPPPPPpPPPPPPPpPPPPJ................',
    /* 32 */ 'JPPPPPpPPPpPPPPPpPPPPPpPPPPPPPpJ................',
    /* 33 */ 'JPPpPPPPPPPPpPPPPPpPPPPPPpPPpPPJ................',
    /* 34 */ 'JPPPPPpPPPPPPPpPPPPPPpPPPPPPPpPJ................',
    /* 35 */ 'JPpPPPPPPpPPPPPPPpPPPPpPPPPPpPPJ................',
    /* 36 */ 'JPPPPpPPPPPPpPPPPPPPpPPPPpPPPPPJ................',
    /* 37 */ 'JPPPPPpPPPPPPPpPPPPPPpPPPPPpPPPJ................',
    /* 38 */ 'JPpPPPPPPpPPPPPPPpPPPPpPPPPPPpPJ................',
    /* 39 */ 'JPPPPpPPPPPPpPPPPPPPpPPPPpPPPPPJ................',
    /* 40 */ 'JPgggPPPPPPPPpPPPgggPPPPpPPPgggJ................',
    /* 41 */ 'JJgggggPpPPgggggKKgggPPPgggggKgJ................',
    /* 42 */ '.JJggKKgggggKKKgggKKKKgggKKgggKJ................',
    /* 43 */ '..JKKKKKKKKKKKKKKKKKKKKKKKKKKKKJ................',
    /* 44 */ '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK...............',
    /* 45 */ '..KK.KKK..KKKK.KKKK..KKKKK..KKKK................',
    /* 46 */ '...K..K....KK...KK....KKK....KK.................',
    /* 47 */ '................................................',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — SUMMON RED TAPE. Body upright and elongated, with
   horizontal red bands wrapping around it. Eyes glowing wide
   (full white, no pupil) and the wax seal blazing.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '..............JJJJJJJJJJJJJJ....................',
    /* 02 */ '............JJPPPPPPPPPPPPPPJJ..................',
    /* 03 */ '...........JPPPpPPPPPPPpPPPPPJ..................',
    /* 04 */ '..........JPPPPPPPPPPPPPPPPPPJ..................',
    /* 05 */ '.........JPPPpPPPNNRRRrNPPpPPPJ.................',
    /* 06 */ '.........JPPPPPPNRRRrrrrrNPPPPJ.................',
    /* 07 */ '.........JPPPPPNRrrrrrrrrrNPPPJ.................',
    /* 08 */ '.........JPPpPPNRrrrrrrrrrrNpPJ.................',
    /* 09 */ '.........JPPPPPNRrrrrrrrrrrNPPJ.................',
    /* 10 */ '.........JPPPPPPNRrrrrrrrrNPPpJ.................',
    /* 11 */ '.........JPpPPPPPNNNNNNNNNPPPPJ.................',
    /* 12 */ '.........JPPPPpPPPPPPPPPPPPPpPJ.................',
    /* 13 */ '.........JPLLLLLLPPPPPPPLLLLLLPJ................',
    /* 14 */ '.........JPLwWWWWLPPpPPPLwWWWWLJ................',
    /* 15 */ '.........JPLWWWWWLPPPPPPLWWWWWLJ................',
    /* 16 */ '.........JPLWWWWWLPPPPPPLWWWWWLJ................',
    /* 17 */ '.........JPLwwWWwLPPPPPPLwwWWwLJ................',
    /* 18 */ '.........JPLLLLLLPPPpPPPLLLLLLPJ................',
    /* 19 */ '........RRRRRRRRRRRRRRRRRRRRRRRRRR..............',
    /* 20 */ '........rRRRRRRRRRRRRRRRRRRRRRRRr...............',
    /* 21 */ '........NrrrrrrrrrrrrrrrrrrrrrrN................',
    /* 22 */ '.........JPPpPPPPPPPpPPPPPPpPPPJ................',
    /* 23 */ '.........JPPPPLLLLLLPPPLLLLLLPPPJ...............',
    /* 24 */ '.........JPpPPLwWWWWLPPLwWWWWLpJ................',
    /* 25 */ '.........JPPPPLWWWWWLPPLWWWWWLPJ................',
    /* 26 */ '.........JPPPPLwwWWwLPPLwwWWwLPJ................',
    /* 27 */ '.........JPPpPLLLLLLPPpLLLLLLPPJ................',
    /* 28 */ '........RRRRRRRRRRRRRRRRRRRRRRRRRR..............',
    /* 29 */ '........rRRRRRRRRRRRRRRRRRRRRRRRr...............',
    /* 30 */ '........NrrrrrrrrrrrrrrrrrrrrrrN................',
    /* 31 */ '.........JPPpPPPPPPPpPPPPPPpPPPJ................',
    /* 32 */ '.........JPPPpPPPPPPPPPPpPPPPPPJ................',
    /* 33 */ '.........JPpPPPLLLLLLPPpPPPpPPpJ................',
    /* 34 */ '.........JPPPPPLwWWWWLPPPpPPPPPJ................',
    /* 35 */ '.........JPPpPPLWWWWWLPPPPPPpPPJ................',
    /* 36 */ '.........JPPPPPLwwWWwLPPpPPPPPPJ................',
    /* 37 */ '.........JPpPPPLLLLLLPPPPPPpPPPJ................',
    /* 38 */ '........RRRRRRRRRRRRRRRRRRRRRRRRRR..............',
    /* 39 */ '........rRRRRRRRRRRRRRRRRRRRRRRRr...............',
    /* 40 */ '........NrrrrrrrrrrrrrrrrrrrrrrN................',
    /* 41 */ '.........JPpPPPPPpPPPPPPpPPPPPpJ................',
    /* 42 */ '.........JPPPPgggPPPPgggPPPgggPJ................',
    /* 43 */ '.........JJgggKKgggKKgggKKgggKKJ................',
    /* 44 */ '..........JKKKKKKKKKKKKKKKKKKKKJ................',
    /* 45 */ '...........KKKKKKKKKKKKKKKKKKKK.................',
    /* 46 */ '............KKK..KKKK..KKKK..KK.................',
    /* 47 */ '.............K....KK....KK...K..................',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — body deflated and melted into a flat puddle of
   ink-soaked paper scraps. All eyes closed (horizontal lines).
   Wax seal cracked in half on the floor.
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
    /* 28 */ '................................................',
    /* 29 */ '................................................',
    /* 30 */ '................................................',
    /* 31 */ '................................................',
    /* 32 */ '................................................',
    /* 33 */ '................................................',
    /* 34 */ '................................................',
    /* 35 */ '..........JJJJJJ..............JJJJJJ............',
    /* 36 */ '........JJPPpPPPJJ........JJJPPPPPpPJJ..........',
    /* 37 */ '......JJPPPPPPPPPPPJJ..JJPPPPPpPPPPPPPJJ........',
    /* 38 */ '....JJPPpPPPpPPPPPPPPJJPPPPPPPPPPPpPPPPPJJ......',
    /* 39 */ '...JPPPPPLLLLPPpPPPPPPPpPPPLLLLLPPPPPpPPPPJ.....',
    /* 40 */ '..JPpPPPLJJJJLPPPPpPPpPPPPLJJJJJLPPpPPPPPpPJ....',
    /* 41 */ '.JPPPPPPLLLLLPpPNNRrNPPPPpLLLLLLPPPPPpPPPPPPJ...',
    /* 42 */ 'JPpPPpPPPPPPPPPPNRrrNPPPPPPPPpPPPPPpPPPPPpPPpJ..',
    /* 43 */ 'JPPPPPPPPpPLLLLPPNNNNPPpPPPLLLLLPpPPPPPpPPPPPPJ.',
    /* 44 */ 'JPgggPPPPPLJJJLPpPPPPPPPPPPLJJJJLPPPPgggPPPgggPJ',
    /* 45 */ 'JggggggPPpPLLLLPPPgggPPPgggPLLLLPPgggggPPgggKKgJ',
    /* 46 */ 'JJggKKgggggKKgggKKgggKKgggKKgggKKgggKKgggKKKKKgJ',
    /* 47 */ '.JKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKJJ',
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

const Sprite = memo(function RuleSlimeSprite({
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
        aria-label="Rule Slime — 規定史萊姆"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const RuleSlime: CharacterArt = {
  meta: {
    id: 'rule-slime',
    name: '規定史萊姆',
    englishName: 'Rule Slime',
    role: 'regulations',
    tier: 'minor',
    topic: 'regulations',
    description: '法律文件結成的官僚恐怖物，多眼、滴墨水、紅蠟封章。',
  },
  Sprite,
};

export default RuleSlime;
