// Character: Goblin Resume (哥布林履歷怪)
// A sleazy, desperate middle-aged human job-hunter clutching a crumpled
// résumé. NOT a green creature — pale unhealthy skin, greasy combover,
// stained brown suit, crooked red tie, sweaty forehead, yellow teeth.
// Faces LEFT (so when placed on the right side of the battlefield, the
// viewer reads him as facing the player on the left).

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
  // Skin (light → mid → shadow)
  S: '#e7d3b1',
  s: '#c8a479',
  k: '#8b6f47',
  // Hair (greasy black-brown: highlight → mid → shadow)
  H: '#44403c',
  h: '#292524',
  J: '#1c1917',
  // Suit (stained brown: highlight → mid → shadow)
  U: '#78350f',
  u: '#5a3318',
  N: '#3b1f08',
  // Tie (red: highlight → shadow)
  T: '#b91c1c',
  t: '#7f1d1d',
  // Yellowed paper résumé (highlight → mid → torn-edge grey)
  P: '#fef3c7',
  p: '#fde68a',
  G: '#d6d3d1',
  // Black ink lines on the paper, also pupils & mouth interior
  I: '#0a0a0a',
  // Yellow teeth / sneer
  Y: '#facc15',
  y: '#f59e0b',
  // Eye whites
  W: '#f8fafc',
  // Purple under-eye bags
  B: '#5b21b6',
  // Sweat beads (cold light blue-white)
  Q: '#dbeafe',
  q: '#bfdbfe',
  // Shoes (very dark brown, separate from hair)
  X: '#171717',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  // Defensive: catch row-width mistakes during development. No `any` used.
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `goblin-resume ${label} row ${i} has length ${r.length}, expected ${W}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — hunched, résumé clutched at chest, eyes darting.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '....................JJJJJJJ.....................',
    /* 05 */ '..................JJhhhhhhhJJ...................',
    /* 06 */ '.................JhhHHHHHHHhhJ..................',
    /* 07 */ '................JhHHHHHHHHHHHhJ.................',
    /* 08 */ '...............JhhHHHHHHHHHHHHhJ................',
    /* 09 */ '...............JhhhhhhhhhSSSSSSk................',
    /* 10 */ '...............JhhhhhhhSSSSSSSSk................',
    /* 11 */ '...............JhhhhhSSSSSSSSSSk................',
    /* 12 */ '..............JhhhSSSSSSSSSSSSSk................',
    /* 13 */ '.............JhhSSSSSSSSSSSSSSSk................',
    /* 14 */ '............kkSSSSBBBSSSSSBBBSSk................',
    /* 15 */ '...........kSSSSSBWIBSSSSSBWIBSk................',
    /* 16 */ '...........kSSSSSBBBBSSSSSBBBBSk................',
    /* 17 */ '..........kSSSSSSSSSSSSSSSSSSSSk................',
    /* 18 */ '..........kSSSSSSSSSSSSSSSSSSSSk................',
    /* 19 */ '...........kSSSSSSSSkkSSSSSSSSk.................',
    /* 20 */ '...........kSSSSSIIIIIIIIIIIISk.................',
    /* 21 */ '...........kSSSIYYYYYYYYYYYYIk..................',
    /* 22 */ '............kkSSIIIIIIIIIIIIkk..................',
    /* 23 */ '............kkkSSSkSSSkSSSSSk...................',
    /* 24 */ '...........NNNNNkkkkkkkkkNNNNN..................',
    /* 25 */ '..........NNttTTNNNNNNNNNttTTNN.................',
    /* 26 */ '.........NNttTTTTNNGGGGNNttTTTNN................',
    /* 27 */ '........NUuuTTTTTNGPPPPGNttTTTTUN...............',
    /* 28 */ '.......NUuuuTTTTNGPIIIPGNTTTTuuUN...............',
    /* 29 */ '......NUuuuuuTTTNGPIIIPGNTTuuuuUN...............',
    /* 30 */ '.....NUuuuuuuuuNGPIIIIPGNuuuuuuUN...............',
    /* 31 */ '.....NUuuuuuuuuNGPIIIIPGNuuuuuuuN...............',
    /* 32 */ '.....NuuuuuuuuuNGPIIIIPGNuuuuuuuN...............',
    /* 33 */ '.....NuuuuuuuuNGGPIIIIPGGNuuuuuuN...............',
    /* 34 */ '.....NuuuuuuuuNGGPpppppGGNuuuuuuN...............',
    /* 35 */ '.....NuuuuuuuNNGGGGGGGGGGGNNuuuuN...............',
    /* 36 */ '.....NNuuuuuNNuuuuuuuuuuuuuNNuuuN...............',
    /* 37 */ '......NuuuuuuuuuuuuuuuuuuuuuuuNN................',
    /* 38 */ '......NuuuuuuuuuuuuuuuuuuuuuuuN.................',
    /* 39 */ '......NNuuuuuuuuuuuuuuuuuuuuuNN.................',
    /* 40 */ '.......NNuuuuuuNN....NNuuuuuNN..................',
    /* 41 */ '........NNNNNNNN......NNNNNNN...................',
    /* 42 */ '........NNNNNNN........NNNNNN...................',
    /* 43 */ '........XXXXXXX........XXXXXX...................',
    /* 44 */ '.......XXXXXXXXX......XXXXXXXX..................',
    /* 45 */ '......XXXXXXXXXXX....XXXXXXXXXX.................',
    /* 46 */ '......XXXXXXXXXXX....XXXXXXXXXX.................',
    /* 47 */ '................................................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — shuffling forward (toward viewer's left), résumé
   swinging out to one side, weight shifted, one foot forward.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '....................JJJJJJJ.....................',
    /* 05 */ '..................JJhhhhhhhJJ...................',
    /* 06 */ '.................JhHHHHHHHHHJ...................',
    /* 07 */ '................JhHHHHHHHHHHHJ..................',
    /* 08 */ '...............JhhHHHHHHHHHHHhJ.................',
    /* 09 */ '..............JhhhhhhhhSSSSSSSk.................',
    /* 10 */ '..............JhhhhhhSSSSSSSSSk.................',
    /* 11 */ '..............JhhhhSSSSSSSSSSSk.................',
    /* 12 */ '.............JhhSSSSSSSSSSSSSSk.................',
    /* 13 */ '............JhhSSSSSSSSSSSSSSSk.................',
    /* 14 */ '...........kkSSSSBBBSSSSSBBBSSk.................',
    /* 15 */ '..........kSSSSSBWIBSSSSSBWIBSk.................',
    /* 16 */ '..........kSSSSSBBBBSSSSSBBBBSk.................',
    /* 17 */ '.........kSSSSSSSSSSSSSSSSSSSSk.................',
    /* 18 */ '.........kSSSSSSSSSSSSSSSSSSSSk.................',
    /* 19 */ '..........kSSSSSSSSkkSSSSSSSSk..................',
    /* 20 */ '..........kSSSSIIIIIIIIIIIIIISk.................',
    /* 21 */ '..........kSSIYYYYYYYYYYYYYYIk..................',
    /* 22 */ '...........kkSIIIIIIIIIIIIIIkk..................',
    /* 23 */ '...........kkkSSSkkkkkSSSSSSk...................',
    /* 24 */ '..GGGG....NNNNNkkkkkkkkkNNNNN...................',
    /* 25 */ '.GPPPPG..NNttTTNNNNNNNNNttTTNN..................',
    /* 26 */ 'GPIIIIPGNNttTTTTNNNNNNNNttTTTNN.................',
    /* 27 */ 'GPIIIIPGNUuuTTTTTNNNNNNNttTTTTUN................',
    /* 28 */ 'GPIIIIPGNUuuuTTTTNNNNNNNTTTTuuUN................',
    /* 29 */ 'GPpppppGNUuuuuuTTNNNNNNNTTuuuuUN................',
    /* 30 */ '.GGGGGGNUuuuuuuuuNNNNNNNuuuuuuUN................',
    /* 31 */ '.....NUuuuuuuuuuNNNNNNNNuuuuuuuN................',
    /* 32 */ '.....NuuuuuuuuuuNNNNNNNNuuuuuuuN................',
    /* 33 */ '.....NuuuuuuuuuuNNNNNNNNuuuuuuuN................',
    /* 34 */ '.....NuuuuuuuuuNNNNNNNNNNuuuuuuN................',
    /* 35 */ '.....NuuuuuuuuNNuuuuuuNNNNuuuuuN................',
    /* 36 */ '.....NNuuuuuuNNuuuuuuuuNNNuuuuuN................',
    /* 37 */ '......NuuuuuNNuuuuuuuuuuNNuuuuNN................',
    /* 38 */ '......NuuuuuNuuuuuuuuuuuNNuuuuN.................',
    /* 39 */ '......NNuuuuNuuuuuuuuuuuuNNuuNN.................',
    /* 40 */ '.......NNuuuNN..........NNuuNN..................',
    /* 41 */ '........NNNNN............NNNN...................',
    /* 42 */ '.....NNNNNNNNN............NNN...................',
    /* 43 */ '....XXXXXXXXXXX........XXXXXXX..................',
    /* 44 */ '...XXXXXXXXXXXXX......XXXXXXXX..................',
    /* 45 */ '...XXXXXXXXXXXXX....XXXXXXXXXXX.................',
    /* 46 */ '...XXXXXXXXXXX......XXXXXXXXXXX.................',
    /* 47 */ '................................................',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — left arm thrust forward, jamming the résumé toward
   the player. Mouth wide in a leering yellow-toothed grin.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '......................JJJJJJJ...................',
    /* 05 */ '....................JJhhhhhhhJJ.................',
    /* 06 */ '...................JhhHHHHHHHhhJ................',
    /* 07 */ '..................JhHHHHHHHHHHHJ................',
    /* 08 */ '.................JhHHHHHHHHHHHHJ................',
    /* 09 */ '.................JhhhhhSSSSSSSSk................',
    /* 10 */ '.................JhhhSSSSSSSSSSk................',
    /* 11 */ '................JhhSSSSSSSSSSSSk................',
    /* 12 */ '...............JhSSSSSSSSSSSSSSk................',
    /* 13 */ '..............JhSSSSSSSSSSSSSSSk................',
    /* 14 */ '.............kkSSSSBBBSSSSBBBBSk................',
    /* 15 */ '............kSSSSBBWIIBBSBWIIBSk................',
    /* 16 */ '............kSSSSBBBBBBSBBBBBBSk................',
    /* 17 */ '...........kSSSSSSSSSSSSSSSSSSSk................',
    /* 18 */ '...........kSSSSSSSSSSSSSSSSSSSk................',
    /* 19 */ '...........kSSSSSSSSkkSSSSSSSSSk................',
    /* 20 */ '..GGGGGGGGG.kSSSIIIIIIIIIIIIIIIk................',
    /* 21 */ '.GPPPPPPPPPG.kSSIYYYYYYYYYYYYYIk................',
    /* 22 */ 'GPIIIIIIIIIPGkkSIIIIIIIIIIIIIIIk................',
    /* 23 */ 'GPIIIIIIIIIPGkkSkkkkkkSSSSSkkSk.................',
    /* 24 */ 'GPpppppppppPGNkkkkkkkkkkkNNNNNN.................',
    /* 25 */ 'GPIIIIIIIIIPGNNNNNNNNNNNttTTNN..................',
    /* 26 */ 'GPpppppppppPGuuNNNNNNNNNttTTTTNN................',
    /* 27 */ 'GPPPPPPPPPPPGuuuNNNNNNNUuuTTTTTUN...............',
    /* 28 */ '.GGGGGGGGGGG.NuuuuuNNNNNUuuuTTTTUN..............',
    /* 29 */ '.....NNNNNNNNNuuuuuuuuNNUuuuuuTTUN..............',
    /* 30 */ '.....NuuuuuuuuuuuuuuuuuNUuuuuuuuUN..............',
    /* 31 */ '.....NuuuuuuuuuuuuuuuuuNUuuuuuuuuN..............',
    /* 32 */ '.....NuuuuuuuuuuuuuuuuuNuuuuuuuuuN..............',
    /* 33 */ '.....NuuuuuuuuuuuuuuuuuNuuuuuuuuuN..............',
    /* 34 */ '.....NuuuuuuuuuuuuuuuuuNuuuuuuuuN...............',
    /* 35 */ '.....NuuuuuuuuuuuuuuuuNNuuuuuuuN................',
    /* 36 */ '.....NNuuuuuuuuuuuuuuNNuuuuuuuNN................',
    /* 37 */ '......NuuuuuuuuuuuuNNuuuuuuuuuN.................',
    /* 38 */ '......NuuuuuuuuuuuuNuuuuuuuuuuN.................',
    /* 39 */ '......NNuuuuuuuuuuNNuuuuuuuuuNN.................',
    /* 40 */ '.......NNuuuuuuNN....NNuuuuuNN..................',
    /* 41 */ '........NNNNNNNN......NNNNNNN...................',
    /* 42 */ '........NNNNNNN........NNNNNN...................',
    /* 43 */ '........XXXXXXX........XXXXXX...................',
    /* 44 */ '.......XXXXXXXXX......XXXXXXXX..................',
    /* 45 */ '......XXXXXXXXXXX....XXXXXXXXXX.................',
    /* 46 */ '......XXXXXXXXXXX....XXXXXXXXXX.................',
    /* 47 */ '................................................',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — head/torso jerked back, eyes squeezed, papers flying
   off. Sweat droplets spray into the air.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '....................G.....G....................q',
    /* 02 */ '..G.................GPG..GPG.................qq.',
    /* 03 */ '.GPG.....q...........GPG.GPG..................q.',
    /* 04 */ 'GPIPG...qQ............GPGPG...................q.',
    /* 05 */ '.GPG..JJJJJJJJJ........GPPG.....................',
    /* 06 */ '..G.JJhhhhhhhhhJJ.......G.......................',
    /* 07 */ '...JhHHHHHHHHHHHJ........q......................',
    /* 08 */ '..JhHHHHHHHHHHHHHJ......qQq.....................',
    /* 09 */ '..JhhhhhhhhhhhSSSk......q.......................',
    /* 10 */ '..JhhhhhhhhhhSSSSSk.....q.......................',
    /* 11 */ '...JhhhhhhhSSSSSSSk.............................',
    /* 12 */ '....JhhhhSSSSSSSSSSk............................',
    /* 13 */ '....JhhhSSSSSSSSSSSk............................',
    /* 14 */ '...kkSSSSBBBSSSSSBBBk...........................',
    /* 15 */ '..kSSSSSSBIBSSSSSBIBk...........................',
    /* 16 */ '..kSSSSSSBBBSSSSSBBBk...........................',
    /* 17 */ '.kSSSSSSSSSSSSSSSSSSk...........................',
    /* 18 */ '.kSSSSSSSSSSSSSSSSSSk...........................',
    /* 19 */ '..kSSSSSSSkkkSSSSSSk............................',
    /* 20 */ '..kSSSSIIIIIIIIIISSk............................',
    /* 21 */ '..kSSIYYYYYYYYYYIk..............................',
    /* 22 */ '...kkSIIIIIIIIIIkk..............................',
    /* 23 */ '....kkSSSkkSSSSSk...............................',
    /* 24 */ '...NNNkkkkkkkkkNNNN.............................',
    /* 25 */ '..NNttTTNNNNNNttTTNN............................',
    /* 26 */ '.NNttTTTTNNNNttTTTTNN...........................',
    /* 27 */ 'NUuuTTTTTNNNNttTTTTTUN..........................',
    /* 28 */ 'NUuuuTTTTNNNNTTTTuuuUN..........................',
    /* 29 */ 'NUuuuuuTTTNNTTTuuuuuUN..........................',
    /* 30 */ 'NUuuuuuuuuuNNuuuuuuuuN..........................',
    /* 31 */ 'NuuuuuuuuuuuNuuuuuuuuN..........................',
    /* 32 */ 'NuuuuuuuuuuuNuuuuuuuuN..........................',
    /* 33 */ 'NuuuuuuuuuuuNuuuuuuuuN..........................',
    /* 34 */ 'NuuuuuuuuuuuNuuuuuuuN...........................',
    /* 35 */ 'NuuuuuuuuuuNNuuuuuuN............................',
    /* 36 */ 'NNuuuuuuuuuNNuuuuuNN............................',
    /* 37 */ '.NuuuuuuuuNNuuuuuuN.............................',
    /* 38 */ '.NuuuuuuuuNNuuuuuuN.............................',
    /* 39 */ '.NNuuuuuuuNNuuuuuNN.............................',
    /* 40 */ '..NNuuuuNN....NNuuuN............................',
    /* 41 */ '...NNNNNN......NNNNNN...........................',
    /* 42 */ '...NNNNN........NNNNN...........................',
    /* 43 */ '...XXXXX........XXXXX...........................',
    /* 44 */ '..XXXXXXX......XXXXXXX..........................',
    /* 45 */ '.XXXXXXXXX....XXXXXXXXX.........................',
    /* 46 */ '.XXXXXXXXX....XXXXXXXXX.........................',
    /* 47 */ '................................................',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — wild rant. Both arms flung up, mouth screaming
   wide, résumé pages exploding outward in a flurry.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ '...G..........G........G.........G.G..........G.',
    /* 01 */ '..GPG........GPG......GPG.......GPG.GPG.......GP',
    /* 02 */ '.GPIPG......GPIPG....GPIPG.....GPIPGPIPG.....GPI',
    /* 03 */ '.GPpPG......GPIPG....GPpPG.....GPIPGPpPG.....GPI',
    /* 04 */ '..GPG..JJJJJJGPGJJJJJJGPG.JJJJ.GPGGGPG..JJJJ.GPG',
    /* 05 */ '...G.JJhhhhhhGhhhhhhhhGhJJhhhhJJGGG.G.JJhhhhJ.G.',
    /* 06 */ 'JJ..JhhHHHHHHGHHHHHHHHGHHHHHHHHhJ.....JhhhhhhhJ.',
    /* 07 */ 'JhJJhHHHHHHHHGHHHHHHHHGHHHHHHHHHhJ...JhHHHHHHhJ.',
    /* 08 */ 'JhhhHHHHHHHHHHHHHHHHHHHHHHHHHHHHHhJ.JhHHHHHHHhJ.',
    /* 09 */ '.JhhhhhhhhhSSSSSSSSSSSSSSSSShhhhhhhJhhhhhhhSShJ.',
    /* 10 */ '.JhhhhhhSSSSSSSSSSSSSSSSSSSSSSSSSShhhhhhSSSSShJ.',
    /* 11 */ '..JhhhSSSSSSSSSSSSSSSSSSSSSSSSSSSSSShhhSSSSSShk.',
    /* 12 */ '..JhSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSShSSSSSSk..',
    /* 13 */ '..kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk..',
    /* 14 */ '..kSSSSSBBBBBSSSSSSSSSSSSSSSSSSSSSSSBBBBBSSSSk..',
    /* 15 */ '..kSSSSBWIIIWBSSSSSSSSSSSSSSSSSSSSSBWIIIWBSSSk..',
    /* 16 */ '..kSSSBBWIIIWBBSSSSSSSSSSSSSSSSSSSBBWIIIWBBSSk..',
    /* 17 */ '..kSSSSSBBBBBSSSSSIIIIIIIIIIIIISSSSSBBBBBSSSSSk.',
    /* 18 */ '..kSSSSSSSSSSSSSIYYYYYYYYYYYYYYYISSSSSSSSSSSSk..',
    /* 19 */ '...kSSSSSSSSSSIIYYYYYYIIIIYYYYYYYIISSSSSSSSSk...',
    /* 20 */ '....kSSSSSSSSSIYYYYYIIIIIIIIYYYYYISSSSSSSSSSk...',
    /* 21 */ '.....kSSSSSSSSIIIIIIIIIIIIIIIIIIIISSSSSSSSSk....',
    /* 22 */ '......kkkSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSkkk.....',
    /* 23 */ '........NNNNkkkkkkkkkkkkkkkkkkkkkkkkkkNNNN......',
    /* 24 */ '.......NUuuuTTTTTTNNNNNNNNNNNNTTTTTTuuuUN.......',
    /* 25 */ '......NUuuuuuTTTTTTNNNNNNNNNTTTTTTuuuuuUN.......',
    /* 26 */ '.....NUuuuuuuuTTTTTTNNNNNNTTTTTTuuuuuuuUN.......',
    /* 27 */ '....NUuuuuuuuuuuTTTTNNNNNNTTTTuuuuuuuuuuUN......',
    /* 28 */ '...NUuuuuuuuuuuuuuTTNNNNTTuuuuuuuuuuuuuuUN......',
    /* 29 */ '..NUuuuuuuuuuuuuuuuuNNNNuuuuuuuuuuuuuuuuUN......',
    /* 30 */ '.NUuuuuuuuuuuuuuuuuuNNNNuuuuuuuuuuuuuuuuuUN.....',
    /* 31 */ '.NuuuuuuuuuuuuuuuuuuNNNNuuuuuuuuuuuuuuuuuuN.....',
    /* 32 */ '.NuuuuuuuuuuuuuuuuuNuuuuNuuuuuuuuuuuuuuuuuN.....',
    /* 33 */ '.NuuuuuuuuuuuuuuuuNuuuuuuNuuuuuuuuuuuuuuuuN.....',
    /* 34 */ '.NNuuuuuuuuuuuuuuNuuuuuuuuNuuuuuuuuuuuuuuNN.....',
    /* 35 */ '..NNuuuuuuuuuuuuNuuuuuuuuuuNuuuuuuuuuuuuNN......',
    /* 36 */ '...NNuuuuuuuuuuNuuuuuuuuuuuuNuuuuuuuuuuNN.......',
    /* 37 */ '....NNuuuuuuuuNuuuuuuuuuuuuuuNuuuuuuuuNN........',
    /* 38 */ '.....NNuuuuuuNNuuuuuuuuuuuuuuNNuuuuuuNN.........',
    /* 39 */ '......NNuuuuNN..uuuuuuuuuuuu..NNuuuuNN..........',
    /* 40 */ '.......NNuuNN....uuuuuuuuuu....NNuuNN...........',
    /* 41 */ '........NNNN..NNNNNNNNNNNNNN....NNNN............',
    /* 42 */ '.........NN..NNNNNNNNNNNNNNNN....NN.............',
    /* 43 */ '............XXXXXXXXXXXXXXXXXX..................',
    /* 44 */ '...........XXXXXXXXXXXXXXXXXXXX.................',
    /* 45 */ '..........XXXXXXXXXXXXXXXXXXXXXX................',
    /* 46 */ '..........XXXXXXXXXXXXXXXXXXXXXX................',
    /* 47 */ '................................................',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — collapsed face-down on the ground, résumé torn in
   half beside him. A single "X" eye visible in profile.
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
    /* 29 */ '...........GGGG.................................',
    /* 30 */ '..........GPpPpG......GpPpG.....................',
    /* 31 */ '.........GPIIIIPG....GIIIIPG....................',
    /* 32 */ '........GPIIIIIIPG..GPIIIIPG....................',
    /* 33 */ '.....JJJGPIIIPpPGGGGPpPpIIPG....................',
    /* 34 */ '....JhhhhJpPpPpPpPpPpPpPpPpJJJ..................',
    /* 35 */ '...JhHHHHhhJSSSSSSSSSSSSSJJhhhJ.................',
    /* 36 */ '..JhHHHHHHhJSBIBSSSSSBIBSJhhHHJ.................',
    /* 37 */ '..JhhhhhhhhhSSSSSSkkkSSSSShhhhJ.................',
    /* 38 */ '...JhhSSSSkSSSSSSkkkkSSSSkSSSk..................',
    /* 39 */ '....kkSSSkkSSIIIYYYIIIISSSkkSSk.................',
    /* 40 */ '.....kkSkNNNkkkkkkkkkkkNNNkSSSk.................',
    /* 41 */ '....NNNNNuuuNNNNNNNNNNNuuuNNNNNN................',
    /* 42 */ '...NNttTTTuuuuuTTTTTTuuuuuTTttNN................',
    /* 43 */ '..NNttTTTTuuuuuuTTTTuuuuuuTTTTTNN...............',
    /* 44 */ '..NUuuuuuuuuuuuuuuuuuuuuuuuuuuuUN...............',
    /* 45 */ '..NNuuuuuuuuuuuuuuuuuuuuuuuuuuuNN..XXX.....XXX..',
    /* 46 */ '...NNNNNNNNNNNNNNNNNNNNNNNNNNNN....XXXX...XXXX..',
    /* 47 */ '....XXXXXXXXXXXXXXXXXXXXXXXXX.......XXXXXXXXX...',
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

const Sprite = memo(function GoblinResumeSprite({
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
        aria-label="Goblin Resume — 哥布林履歷怪"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const GoblinResume: CharacterArt = {
  meta: {
    id: 'goblin-resume',
    name: '哥布林履歷怪',
    englishName: 'Goblin Resume',
    role: 'job-hunting',
    tier: 'minor',
    topic: 'job-hunting',
    description: '油頭中年男、髒西裝、緊抓爛履歷的求職怪。',
  },
  Sprite,
};

export default GoblinResume;
