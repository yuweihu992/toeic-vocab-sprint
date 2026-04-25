// Character: Meeting Demon (會議惡魔)
// A Mimic-style monster: an office conference table that came alive.
// Rectangular wood-grain table top forms its body; a horizontal jagged
// mouth on the front-left edge bristles with paper "teeth"; two glowing
// eyes peek up from the table surface; four wooden table legs end in
// claws. A coffee mug, a stack of agenda papers, and a pen sit on top.
// Faces LEFT — when placed on the right side of the battlefield, the
// mouth-front points toward the player.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── Palette ────────────────────────────────────────────────
   16 colors. Single-char glyphs; rows stay exactly 48 chars.
   Light source upper-left.
   ───────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // Wood-grain table top (highlight → mid → mid-shadow → base)
  L: '#d97706',
  M: '#b45309',
  N: '#92400e',
  O: '#78350f',
  // Deep wood shadow (under-table, leg shadows, mouth interior)
  K: '#451a03',
  // Agenda papers (highlight → mid → torn-edge grey)
  P: '#f8fafc',
  p: '#e5e7eb',
  G: '#d6d3d1',
  // Black ink (text lines on paper, pen body, mouth shadow)
  I: '#1c1917',
  // Glowing yellow eyes (highlight / mid)
  Y: '#fde047',
  y: '#facc15',
  // Red pupils & special-state rim glow (bright / soft)
  R: '#dc2626',
  r: '#fca5a5',
  // Coffee mug ceramic
  W: '#f1f5f9',
  // Coffee inside mug (re-uses brown family but distinct slot)
  C: '#78350f',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `meeting-demon ${label} row ${i} has length ${r.length}, expected ${W}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — table standing on four legs, eyes scanning, mouth on
   the FRONT (left) edge slightly open showing paper teeth. A
   coffee mug, agenda stack and a pen rest on the surface.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '..............GGGGG.............................',
    /* 07 */ '.............GPPPPPG.....WWWWW..................',
    /* 08 */ '............GPIIIIIPG....WPPPW..................',
    /* 09 */ '............GPpppppPG....WCCCW..................',
    /* 10 */ '............GPIIIIIPG....WCCCWW.................',
    /* 11 */ '...........GPpppppppPG...WWWWWW.................',
    /* 12 */ '...........GPIIIIIIIPG..........................',
    /* 13 */ '..........GPpppppppppPG......II.................',
    /* 14 */ '..........GPIIIIIIIIIPG.....II..................',
    /* 15 */ '..........GPpppppppppPG....II...................',
    /* 16 */ 'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL........',
    /* 17 */ 'LMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLM........',
    /* 18 */ 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM........',
    /* 19 */ 'NMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMM........',
    /* 20 */ 'NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN........',
    /* 21 */ 'NONONONONONONONONONONONONONONONONONONONO........',
    /* 22 */ 'NyYY.NN.OOOOOOOOOOOOOOOOOOOOOOOO.NN.YYy.........',
    /* 23 */ 'NYYYY.OO.IIIIIIIIIIIIIIIIIIIII.OO.YYYY..........',
    /* 24 */ 'OYYRO.OO.IPPIPPIPPIPPIPPIPPIPPI.OOOORYYO........',
    /* 25 */ 'OOyRO.K.IPPIIPPIIPPIIPPIIPPIIPPI.K.ORyOO........',
    /* 26 */ '.OKK.K..IIIIIIIIIIIIIIIIIIIIIIII..K.KKO.........',
    /* 27 */ '.K.....KKKKKKKKKKKKKKKKKKKKKKKKKK.....K.........',
    /* 28 */ '.K......KKKKKKKKKKKKKKKKKKKKKKKK......K.........',
    /* 29 */ '..K....OO........................OO..K..........',
    /* 30 */ '..OO..OO..........................OO.OO.........',
    /* 31 */ '..OO..OO..........................OO.OO.........',
    /* 32 */ '..OO..OO..........................OO.OO.........',
    /* 33 */ '..ON..ON..........................ON.ON.........',
    /* 34 */ '..ON..ON..........................ON.ON.........',
    /* 35 */ '..NN..NN..........................NN.NN.........',
    /* 36 */ '..NN..NN..........................NN.NN.........',
    /* 37 */ '..NN..NN..........................NN.NN.........',
    /* 38 */ '..KN..KN..........................KN.KN.........',
    /* 39 */ '..KN..KN..........................KN.KN.........',
    /* 40 */ '..KK..KK..........................KK.KK.........',
    /* 41 */ '..KK..KK..........................KK.KK.........',
    /* 42 */ '.KKKK.KKKK......................KKKK.KKKK.......',
    /* 43 */ 'IKIKIIKIKI......................IKIKIIKIKI......',
    /* 44 */ 'IIIIIIIIII......................IIIIIIIIII......',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — body shifted left, front-left legs lifted (stomping
   forward toward viewer's left), back-right legs planted.
   Coffee/papers tilt slightly. Eyes forward.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '...........GGGGG................................',
    /* 06 */ '..........GPPPPPG....WWWWW......................',
    /* 07 */ '.........GPIIIIIPG..WPPPW.......................',
    /* 08 */ '.........GPpppppPG..WCCCW.......................',
    /* 09 */ '........GPIIIIIIIPG.WCCCWW......................',
    /* 10 */ '........GPpppppppPG.WWWWWW......................',
    /* 11 */ '.......GPIIIIIIIIIPG..........II................',
    /* 12 */ '.......GPpppppppppPG.........II.................',
    /* 13 */ '.......GPIIIIIIIIIPG........II..................',
    /* 14 */ '.......GPpppppppppPG.......II...................',
    /* 15 */ 'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL............',
    /* 16 */ 'LMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLM............',
    /* 17 */ 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM............',
    /* 18 */ 'NMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMM............',
    /* 19 */ 'NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN............',
    /* 20 */ 'NONONONONONONONONONONONONONONONONONO............',
    /* 21 */ 'NyYY.NN.OOOOOOOOOOOOOOOOOOOO.NN.YYy.............',
    /* 22 */ 'NYYYY.OO.IIIIIIIIIIIIIIIIIII.OO.YYYY............',
    /* 23 */ 'OYYRO.OO.IPPIPPIPPIPPIPPIPPI.OOOORYYO...........',
    /* 24 */ 'OOyRO.K.IPPIIPPIIPPIIPPIIPPI.K.ORyOO............',
    /* 25 */ '.OKK.K..IIIIIIIIIIIIIIIIIIII..K.KKO.............',
    /* 26 */ '.K.....KKKKKKKKKKKKKKKKKKKKKK.....K.............',
    /* 27 */ '.K......KKKKKKKKKKKKKKKKKKKK......K.............',
    /* 28 */ '..K..OO........................OO..K............',
    /* 29 */ '..OO..OOO.....................OO.OO.............',
    /* 30 */ '...OO...OOO...................OO.OO.............',
    /* 31 */ '....OO....OOO.................OO.OO.............',
    /* 32 */ '....ON.....OON................ON.ON.............',
    /* 33 */ '.....ON.....ONN...............ON.ON.............',
    /* 34 */ '.....NN.....NNN...............NN.NN.............',
    /* 35 */ '......NN....NN................NN.NN.............',
    /* 36 */ '......NN....NN................NN.NN.............',
    /* 37 */ '......KN....KN................KN.KN.............',
    /* 38 */ '......KN....KN................KN.KN.............',
    /* 39 */ '......KK....KK................KK.KK.............',
    /* 40 */ '......KK....KK................KK.KK.............',
    /* 41 */ '.....KKKK..KKKK..............KKKK.KKKK..........',
    /* 42 */ '....IKIKIIKIKII..............IKIKIIKIKI.........',
    /* 43 */ '....IIIIIIIIII...............IIIIIIIIII.........',
    /* 44 */ '................................................',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — body lunges forward-left. Mouth GAPES wide with
   long jagged paper-teeth fully exposed. Eyes locked forward.
   Tongue/throat (K) deep visible. Items slide right with
   inertia.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '....................GGGGG.......................',
    /* 06 */ '...................GPPPPPG.....WWWWW............',
    /* 07 */ '..................GPIIIIIPG...WPPPW.............',
    /* 08 */ '..................GPpppppPG...WCCCW.............',
    /* 09 */ '.................GPIIIIIIIPG..WCCCWW............',
    /* 10 */ '.................GPpppppppPG..WWWWWW............',
    /* 11 */ '................GPIIIIIIIIIPG......II...........',
    /* 12 */ '................GPpppppppppPG.....II............',
    /* 13 */ 'NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN....',
    /* 14 */ 'NMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMN....',
    /* 15 */ 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM....',
    /* 16 */ 'NMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNM....',
    /* 17 */ 'NyYY.NN.MMMMMMMMMMMMMMMMMMMMMMMMMMMM.NN.YYyN....',
    /* 18 */ 'YYYY.OO.MMMMMMMMMMMMMMMMMMMMMMMMMMMMM.OO.YYYY...',
    /* 19 */ 'YYRO.OO.MMMMMMMMMMMMMMMMMMMMMMMMMMMMM.OO.ORYY...',
    /* 20 */ 'OyRO.OO.NNNNNNNNNNNNNNNNNNNNNNNNNNNNNN.O.ORyO...',
    /* 21 */ 'OOOO.K..NNNNNNNNNNNNNNNNNNNNNNNNNNNNNN.K..OOOO..',
    /* 22 */ '.IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII........',
    /* 23 */ 'IPPIPPIPPIPPIPPIPPIPPIPPIPPIPPIPPIPPIPPIII......',
    /* 24 */ 'IPPIIPPIIPPIIPPIIPPIIPPIIPPIIPPIIPPIIPPI.II.....',
    /* 25 */ 'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII..II....',
    /* 26 */ '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK....II...',
    /* 27 */ '..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK......II..',
    /* 28 */ '..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.......II.',
    /* 29 */ '...KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.........II',
    /* 30 */ '....KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK............',
    /* 31 */ '.....IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII...........',
    /* 32 */ '........OO...........................OO.OO......',
    /* 33 */ '........OO...........................OO.OO......',
    /* 34 */ '........OO...........................OO.OO......',
    /* 35 */ '........ON...........................ON.ON......',
    /* 36 */ '........ON...........................ON.ON......',
    /* 37 */ '........NN...........................NN.NN......',
    /* 38 */ '........NN...........................NN.NN......',
    /* 39 */ '........NN...........................NN.NN......',
    /* 40 */ '........KN...........................KN.KN......',
    /* 41 */ '........KN...........................KN.KN......',
    /* 42 */ '.......KKKK.........................KKKK.KKKK...',
    /* 43 */ '......IKIKII........................IKIKIIKIKI..',
    /* 44 */ '......IIIIII........................IIIIIIIIII..',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — body recoiled right, papers SCATTERED in air, coffee
   mug TIPPED with brown coffee splashing out. Eyes squeezed
   shut (no pupils). Mouth clamped, paper teeth crooked.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '....G......G..........G....G....................',
    /* 02 */ '...GPG....GPG........GPG..GPG...................',
    /* 03 */ '..GPIPG..GPpPG.......GPIPG.GPG..................',
    /* 04 */ '..GPpPG..GPIPG........GPG..GPG..................',
    /* 05 */ '...GPG....GPG..........G....G...................',
    /* 06 */ '....G......G....................................',
    /* 07 */ '..............................WW................',
    /* 08 */ '.............................WWPPW..............',
    /* 09 */ '............................WWPCCW..............',
    /* 10 */ '...........................WWCCCWW..............',
    /* 11 */ '...........................WWWWWW.CC............',
    /* 12 */ '............................CCC.CCC.............',
    /* 13 */ '............................CCCCC.II............',
    /* 14 */ 'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL..........',
    /* 15 */ 'LMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLM..........',
    /* 16 */ 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM..........',
    /* 17 */ 'NMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNM..........',
    /* 18 */ 'NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN..........',
    /* 19 */ 'NONONONONONONONONONONONONONONONONONONO..........',
    /* 20 */ 'NyY..NN.OOOOOOOOOOOOOOOOOOOOOOOO.NN..Yy.........',
    /* 21 */ 'NYIY.OO.OOOOOOOOOOOOOOOOOOOOOOOO.OO.YIY.........',
    /* 22 */ 'OYYO.OO.IPPIPPIPPIPPIPPIPPIPPIPP.OOOOOYYO.......',
    /* 23 */ 'OOIO.K..IIIIIIIIIIIIIIIIIIIIIIII..K..OIOO.......',
    /* 24 */ '.OKK.K..IPPIIPPIIPPIIPPIIPPIIPPI..K.KKO.........',
    /* 25 */ '.K.....KKIKKKKIKKKKKIKKKKKIKKKKKKK.....K........',
    /* 26 */ '.K......KKKKKKKKKKKKKKKKKKKKKKKK......K.........',
    /* 27 */ '..K....OO........................OO..K..........',
    /* 28 */ '..OO..OO..........................OO.OO.........',
    /* 29 */ '..OO..OO..........................OO.OO.........',
    /* 30 */ '..OO..OO..........................OO.OO.........',
    /* 31 */ '..ON..ON..........................ON.ON.........',
    /* 32 */ '..ON..ON..........................ON.ON.........',
    /* 33 */ '..NN..NN..........................NN.NN.........',
    /* 34 */ '..NN..NN..........................NN.NN.........',
    /* 35 */ '..NN..NN..........................NN.NN.........',
    /* 36 */ '..KN..KN..........................KN.KN.........',
    /* 37 */ '..KN..KN..........................KN.KN.........',
    /* 38 */ '..KK..KK..........................KK.KK.........',
    /* 39 */ '..KK..KK..........................KK.KK.........',
    /* 40 */ '.KKKK.KKKK......................KKKK.KKKK.......',
    /* 41 */ 'IKIKIIKIKI......................IKIKIIKIKI......',
    /* 42 */ 'IIIIIIIIII......................IIIIIIIIII......',
    /* 43 */ '................................................',
    /* 44 */ '................................................',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — MEETING SUMMON. A FOUNTAIN of agenda papers blasts
   upward from the table surface in an arc pattern. Eyes BLAZE
   with red pupils + extra glow. Red rim glow (R / r) traces
   the table edge. Coffee mug is gone — vaporized into the storm
   of paper.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ '............G..G..G..G..G..G..G.................',
    /* 01 */ '..........GPGGPGGPGGPGGPGGPGGPG.................',
    /* 02 */ '.G.......GPIPGPIPGPIPGPIPGPIPGPIPG......G.......',
    /* 03 */ 'GPG.....GPpPGPpPGPpPGPpPGPpPGPpPGPpPG...GPG.....',
    /* 04 */ 'GPIPG..GPIPGPIPGPIPGPIPGPIPGPIPGPIPGPG.GPIPG....',
    /* 05 */ 'GPpPG.GPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPG.GPpPG...',
    /* 06 */ '.GPG.GPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPG.GPG....',
    /* 07 */ '..G.GPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPG.G.....',
    /* 08 */ '...GPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPG......',
    /* 09 */ 'G..GPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPG..G...',
    /* 10 */ 'GPGGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPGGGPG..',
    /* 11 */ 'GPIPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPIPGPG.',
    /* 12 */ 'GPpPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPIPGPpPGPG.',
    /* 13 */ '.GPGGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPpPGPGGGPG.',
    /* 14 */ '..G..GPGGPGGPGGPGGPGGPGGPGGPGGPGGPGGPGGPG..G..G.',
    /* 15 */ 'rRrRrLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLrRrRrR..',
    /* 16 */ 'RrRrRLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLRrRrRr..',
    /* 17 */ 'rRrRMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMRrRrRR..',
    /* 18 */ 'RrRRNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMRrRRrR..',
    /* 19 */ 'rRRRNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNRRRrRr..',
    /* 20 */ 'RRRrNONONONONONONONONONONONONONONONONONORrRrRR..',
    /* 21 */ 'NRRRyYYRYY.NN.OOOOOOOOOOOOOOOOOO.NN.YYRYYRRRRN..',
    /* 22 */ 'NRRYYYRYYYY.OO.OOOOOOOOOOOOOOOOO.OO.YYYYRYYRRN..',
    /* 23 */ 'OYRYRYRYYRO.OO.IIIIIIIIIIIIIIIII.OOOORYYRYRYYO..',
    /* 24 */ 'OORyRYRyRRO.K..IPPIPPIPPIPPIPPI..K.ORRyRYRyROO..',
    /* 25 */ '.OKK.RR.K..K.KKKKKKKKKKKKKKKKKKKKK.K..RR.KKO....',
    /* 26 */ '.K....RR..KKKKKKKKKKKKKKKKKKKKKKKKK..RR....K....',
    /* 27 */ '.K.....R..KKKKKKKKKKKKKKKKKKKKKKKK..R......K....',
    /* 28 */ '..K....OO........................OO..K..........',
    /* 29 */ '..OO..OO..........................OO.OO.........',
    /* 30 */ '..OO..OO..........................OO.OO.........',
    /* 31 */ '..OO..OO..........................OO.OO.........',
    /* 32 */ '..ON..ON..........................ON.ON.........',
    /* 33 */ '..ON..ON..........................ON.ON.........',
    /* 34 */ '..NN..NN..........................NN.NN.........',
    /* 35 */ '..NN..NN..........................NN.NN.........',
    /* 36 */ '..NN..NN..........................NN.NN.........',
    /* 37 */ '..KN..KN..........................KN.KN.........',
    /* 38 */ '..KN..KN..........................KN.KN.........',
    /* 39 */ '..KK..KK..........................KK.KK.........',
    /* 40 */ '..KK..KK..........................KK.KK.........',
    /* 41 */ '.KKKK.KKKK......................KKKK.KKKK.......',
    /* 42 */ 'IKIKIIKIKI......................IKIKIIKIKI......',
    /* 43 */ 'IIIIIIIIII......................IIIIIIIIII......',
    /* 44 */ '................................................',
    /* 45 */ '................................................',
    /* 46 */ '................................................',
    /* 47 */ '................................................',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — table TIPPED on its back. Legs in air, claws limp.
   Eyes are X-shaped (II). Mouth hangs open with paper teeth
   limp. Loose papers and the spilled coffee mug litter the
   ground around it.
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
    /* 13 */ '..........KK..KK..........KK..KK................',
    /* 14 */ '..........KKKKKK..........KKKKKK................',
    /* 15 */ '..........KKKKKK..........KKKKKK................',
    /* 16 */ '..........NNKKNN..........NNKKNN................',
    /* 17 */ '..........NN..NN..........NN..NN................',
    /* 18 */ '..........NN..NN..........NN..NN................',
    /* 19 */ '..........NN..NN..........NN..NN................',
    /* 20 */ '..........ON..ON..........ON..ON................',
    /* 21 */ '..........OO..OO..........OO..OO................',
    /* 22 */ '..........OO..OO..........OO..OO................',
    /* 23 */ '..........OO..OO..........OO..OO................',
    /* 24 */ '..........OO..OO..........OO..OO................',
    /* 25 */ '..........K....K..........K....K................',
    /* 26 */ '......LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL..........',
    /* 27 */ '.....LMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLMLM.........',
    /* 28 */ '.....MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.........',
    /* 29 */ '.....NMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNMMNM........',
    /* 30 */ '.....NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN........',
    /* 31 */ 'GG...NONONONONONONONONONONONONONONONONONO.......',
    /* 32 */ 'GPG..NyII.NN.OOOOOOOOOOOOOOOOOOOOO.NN.IIyN......',
    /* 33 */ 'GIPGGYIIY.OO.OOOOOOOOOOOOOOOOOOOOO.OO.YIIYN..GG.',
    /* 34 */ 'GPpPGYYYO.OO.IIIIIIIIIIIIIIIIIIII..OOOOYYYO.GPG.',
    /* 35 */ '.GGG.OOIO.K..IPP.IPP.IPPI.IPPI.IPI..K..OOIO.GIP.',
    /* 36 */ '..WW..OKK.K..IIIIIIIIIIIIIIIIIIIII.K..OKKO..GPp.',
    /* 37 */ '.WWPPW.K..KKKKKKKKKKKKKKKKKKKKKKKKKK..K......GG.',
    /* 38 */ '.WCCWW.K....KKKKKKKKKKKKKKKKKKKKKKK....K........',
    /* 39 */ 'WCCCWW..........................................',
    /* 40 */ 'WWWWW..CCC...CCC................................',
    /* 41 */ '......CCCCCCCCCCC...............................',
    /* 42 */ '.......CCCCCCCCC................................',
    /* 43 */ '.........CCCCC..................................',
    /* 44 */ 'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    /* 45 */ 'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
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

const Sprite = memo(function MeetingDemonSprite({
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
        aria-label="Meeting Demon — 會議惡魔"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const MeetingDemon: CharacterArt = {
  meta: {
    id: 'meeting-demon',
    name: '會議惡魔',
    englishName: 'Meeting Demon',
    role: 'generic',
    tier: 'minor',
    description: '活過來的會議桌怪物，桌邊大嘴塞滿議程紙，會冒煙的咖啡杯。',
  },
  Sprite,
};

export default MeetingDemon;
