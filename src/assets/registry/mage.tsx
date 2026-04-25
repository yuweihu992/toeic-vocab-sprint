// Character: Mage (法師) — wise wizard archetype, faces RIGHT.
// 48×48 pixel grid, 6 distinct poses. Light source: upper-left.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── palette ─────────────────────────────────────────────────────────────
   Single legend used across every pose for consistent shading.
   Single-character codes only; '.' = transparent.
   ────────────────────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // hat & robe — deep blue-purple gradient
  H: '#1e1b4b', // hat / robe darkest (shadow)
  P: '#312e81', // hat / robe mid
  Q: '#4338ca', // hat / robe highlight (lit side)
  // silver stars on hat/robe
  S: '#e5e7eb',
  // beard / hair — white-grey gradient
  W: '#f1f5f9', // beard highlight (white)
  G: '#cbd5e1', // beard mid grey
  D: '#94a3b8', // beard shadow
  // skin (aged warm)
  K: '#fde68a', // skin highlight
  J: '#d4a256', // skin shadow
  // eyes / mouth
  E: '#0f172a', // dark outline / pupils
  // wooden staff
  B: '#78350f', // staff dark
  N: '#92400e', // staff highlight
  // crystal orb (cyan glow)
  O: '#06b6d4', // orb shadow
  C: '#22d3ee', // orb mid
  Y: '#67e8f9', // orb highlight
  X: '#ffffff', // orb core / star sparkle / aura core
  // energy / lightning aura
  A: '#a5f3fc', // pale cyan aura
  L: '#fde047', // lightning yellow
  // outline
  Z: '#0b1023', // crisp dark outline (near-black blue)
};

/* ── helpers ──────────────────────────────────────────────────────────── */
const ROW_LEN = 48;
const ROWS = 48;

/** Defensive guard: every grid we ship must be 48×48. */
function assertGrid(rows: readonly string[], label: string): void {
  if (rows.length !== ROWS) {
    throw new Error(`mage: ${label} has ${rows.length} rows (need ${ROWS})`);
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== ROW_LEN) {
      throw new Error(
        `mage: ${label} row ${i} has length ${r.length} (need ${ROW_LEN})`,
      );
    }
  }
}

/* ── IDLE ─────────────────────────────────────────────────────────────────
   Standing tall, staff vertical at right side, beard flowing.
   ────────────────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '...............ZZZ..............................', //  2
  '..............ZHHHZ.............................', //  3
  '.............ZHHPHHZ............................', //  4
  '............ZHPSPHHHZ...........................', //  5
  '...........ZHPPPPHHHHZ..........................', //  6
  '..........ZHPPSPPPHHHHZ.........................', //  7
  '.........ZHPPPPPPPPPHHHZ........................', //  8
  '........ZHQPPSPPPPPPPHHHZ.......................', //  9
  '.......ZHQQPPPPPPPSPPPHHHZ......................', // 10
  '......ZHQQQPPPPPPPPPPPHHHHZ.....................', // 11
  '.....ZZHQQQPPSPPPPPPSPPHHHHZ....................', // 12
  '....ZZZZZZZZZZZZZZZZZZZZZZZZZ...................', // 13
  '...........ZKKKKKKKKKKZ.........................', // 14
  '..........ZKKKKKKKKKKKKZ........................', // 15
  '..........ZKKEKKKKKEKKKZ........................', // 16
  '..........ZKKEKKKKKEKKKZ.....ZZ.................', // 17
  '..........ZKKKKKJKKKKKKZ....ZNNZ................', // 18
  '..........ZKKJJJJJJKKKKZ....ZNBZ................', // 19
  '...........ZKKWWWWKKKKZ.....ZBBZ................', // 20
  '...........ZWWWWWWWWWZ......ZBBZ................', // 21
  '..........ZWWWGWWWWWWWZ.....ZBBZ................', // 22
  '..........ZWWGGGWWWWWWZ.....ZBBZ................', // 23
  '.........ZWWGGGGGWWWWWWZ....ZBBZ................', // 24
  '.........ZWGGDDGGGWWWWWZ....ZBBZ................', // 25
  '........ZWWGGDDDGGGWWWWWZ...ZBBZ................', // 26
  '........ZHHHWGDDGGWWWHHHZ...ZBBZ................', // 27
  '.......ZHQPPSPPPPPPPSPHHHZ..ZBBZ................', // 28
  '.......ZHQPPPPPSPPPPPPHHHZ..ZBBZ................', // 29
  '......ZHQQPPPPPPPPSPPPHHHHZ.ZBBZ................', // 30
  '......ZHQQPPSPPPPPPPPPHHHHZ.ZBBZ................', // 31
  '......ZHQQPPPPPPSPPPPPHHHHZ.ZBBZ................', // 32
  '......ZHQPPPSPPPPPPPSPPHHHZ.ZBBZ................', // 33
  '......ZHPPPPPPPSPPPPPPPHHHZ.ZBBZ................', // 34
  '......ZHPPSPPPPPPPPSPPPHHHZ.ZBBZ................', // 35
  '......ZHPPPPPPSPPPPPPPPHHHZ.ZBBZ................', // 36
  '......ZHPPPPPPPPPPSPPPPHHHZ.ZBBZ................', // 37
  '.......ZHPPPSPPPPPPPPPHHHZ..ZBBZ................', // 38
  '........ZHHPPPPPSPPPPHHHZ...ZBBZ................', // 39
  '.........ZHHHHHHHHHHHHZ.....ZBBZ................', // 40
  '..........ZHHHHHHHHHHZ......ZBBZ................', // 41
  '..........ZHHHHHHHHHHZ......ZBBZ................', // 42
  '..........ZBBBZ.ZBBBZ.......ZBBZ................', // 43
  '..........ZBBBZ.ZBBBZ.......ZBBZ................', // 44
  '..........ZZZZ..ZZZZ........ZBBZ................', // 45
  '............................ZZZ.................', // 46
  '................................................', // 47
];

/* ── WALK ─────────────────────────────────────────────────────────────────
   Robe trailing leftward (motion to right), staff tapping forward.
   ────────────────────────────────────────────────────────────────────── */
const WALK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '..............ZZZ...............................', //  2
  '.............ZHHHZ..............................', //  3
  '............ZHHPHHZ.............................', //  4
  '...........ZHPSPHHHZ............................', //  5
  '..........ZHPPPPHHHHZ...........................', //  6
  '.........ZHPPSPPPHHHHZ..........................', //  7
  '........ZHPPPPPPPPPHHHZ.........................', //  8
  '.......ZHQPPSPPPPPPPHHHZ........................', //  9
  '......ZHQQPPPPPPPSPPPHHHZ.......................', // 10
  '.....ZHQQQPPPPPPPPPPPHHHHZ......................', // 11
  '....ZZHQQQPPSPPPPPPSPPHHHHZ.....................', // 12
  '...ZZZZZZZZZZZZZZZZZZZZZZZZZ....................', // 13
  '..........ZKKKKKKKKKKZ..........................', // 14
  '.........ZKKKKKKKKKKKKZ.........................', // 15
  '.........ZKKEKKKKKEKKKZ.........................', // 16
  '.........ZKKEKKKKKEKKKZ.........................', // 17
  '.........ZKKKKKJKKKKKKZ......ZZ.................', // 18
  '.........ZKKJJJJJJKKKKZ.....ZNNZ................', // 19
  '..........ZKKWWWWKKKKZ......ZNBZ................', // 20
  '..........ZWWWWWWWWWZ.......ZBBZ................', // 21
  '.........ZWWWGWWWWWWWZ......ZBBZ................', // 22
  '.........ZWWGGGWWWWWWZ......ZBBZ................', // 23
  '........ZWWGGGGGWWWWWWZ.....ZBBZ................', // 24
  '........ZWGGDDGGGWWWWWZ.....ZBBZ................', // 25
  '.......ZWWGGDDDGGGWWWWWZ....ZBBZ................', // 26
  '.......ZHHHWGDDGGWWWHHHZ....ZBBZ................', // 27
  '......ZHQPPSPPPPPPPSPHHHZ...ZBBZ................', // 28
  '.....ZHQPPPPPSPPPPPPHHHZ....ZBBZ................', // 29
  '....ZHQQPPPPPPPPSPPPHHHHZ...ZBBZ................', // 30
  '...ZHQQPPSPPPPPPPPPHHHHZ....ZBBZ................', // 31
  '..ZHQQPPPPPPSPPPPPHHHHZ.....ZBBZ................', // 32
  '..ZHQPPSPPPPPPPSPPHHHZ......ZBBZ................', // 33
  '..ZHPPPPPSPPPPPPPHHHZ.......ZBBZ................', // 34
  '..ZHPPPPPPPPSPPPHHHZ........ZBBZ................', // 35
  '..ZHHHHHHHHHHHHHHHZ.........ZBBZ................', // 36
  '...ZZZZZZZZZZZZZZZ..........ZBBZ................', // 37
  '..........ZHHHHHHHHHHZ......ZBBZ................', // 38
  '.........ZHHPPPPPPHHHZ......ZBBZ................', // 39
  '........ZHPPPPPPPPPPHZ......ZBBZ................', // 40
  '........ZHPPPPHHPPPPHZ......ZBBZ................', // 41
  '........ZHHHHZ..ZHHHHZ......ZBBZ................', // 42
  '.......ZBBBBZ....ZBBBBZ.....ZBBZ................', // 43
  '......ZBBBBZ......ZBBBBZ....ZBBZ................', // 44
  '......ZZZZZ........ZZZZZ....ZBBZ................', // 45
  '............................ZZZ.................', // 46
  '................................................', // 47
];

/* ── ATTACK ───────────────────────────────────────────────────────────────
   Staff thrust forward to the right; orb glowing brightly with energy beam.
   ────────────────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '..............ZZZ...............................', //  2
  '.............ZHHHZ..............................', //  3
  '............ZHHPHHZ.............................', //  4
  '...........ZHPSPHHHZ............................', //  5
  '..........ZHPPPPHHHHZ...........................', //  6
  '.........ZHPPSPPPHHHHZ..........................', //  7
  '........ZHPPPPPPPPPHHHZ.........................', //  8
  '.......ZHQPPSPPPPPPPHHHZ........................', //  9
  '......ZHQQPPPPPPPSPPPHHHZ.......................', // 10
  '.....ZHQQQPPPPPPPPPPPHHHHZ......................', // 11
  '....ZZHQQQPPSPPPPPPSPPHHHHZ.....................', // 12
  '...ZZZZZZZZZZZZZZZZZZZZZZZZZ....................', // 13
  '..........ZKKKKKKKKKKZ........ZZZ...............', // 14
  '.........ZKKKKKKKKKKKKZ......ZYYZ...............', // 15
  '.........ZKKEKKKKKEKKKZ.....ZYXYYZ..............', // 16
  '.........ZKKEKKKKKEKKKZ....ZYXXYYZ..............', // 17
  '.........ZKKKKKJKKKKKKZ....ZYXAXYYZ.............', // 18
  '.........ZKKJJJJJJKKKKZ...ZYAXXAYYYZ............', // 19
  '..........ZKKWWWWKKKKZ.ZZZZZYAXXYYYZ............', // 20
  '..........ZWWWWWWWWZZZZNNNNZYAXXYYYZ............', // 21
  '.........ZWWWWWGWWWNNBBBBBBNZYAXAYYZ............', // 22
  '........ZWWGGGGWWWWNBBBBBBBBNZYXXYYZ............', // 23
  '........ZWGGDDGGGWWZZZZZZZZZNZYYAYYZ............', // 24
  '.......ZWWGGDDGGGWWWWWWZ.....ZYAAYYZ............', // 25
  '.......ZHHHWGGDGGWWWHHHZ......ZYAYZ.............', // 26
  '......ZHQPPSPPPPPPPSPHHHZ......ZYZ..............', // 27
  '......ZHQPPPPPSPPPPPPHHHZ.......Z...............', // 28
  '......ZHQQPPPPPPPPSPPPHHHZ......................', // 29
  '......ZHQQPPSPPPPPPPPPHHHZ......................', // 30
  '......ZHQQPPPPPPSPPPPPHHHZ......................', // 31
  '......ZHQPPPSPPPPPPPSPPHHZ......................', // 32
  '......ZHPPPPPPPSPPPPPPPHHZ......................', // 33
  '......ZHPPSPPPPPPPPSPPPHHZ......................', // 34
  '......ZHPPPPPPSPPPPPPPPHHZ......................', // 35
  '......ZHPPPPPPPPPPSPPPPHHZ......................', // 36
  '.......ZHPPPSPPPPPPPPPHHZ.......................', // 37
  '........ZHHPPPPPSPPPPHHZ........................', // 38
  '.........ZHHHHHHHHHHHHZ.........................', // 39
  '..........ZHHHHHHHHHHZ..........................', // 40
  '..........ZHHHHHHHHHHZ..........................', // 41
  '..........ZBBBZ.ZBBBZ...........................', // 42
  '..........ZBBBZ.ZBBBZ...........................', // 43
  '..........ZZZZ..ZZZZ............................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ── HIT ──────────────────────────────────────────────────────────────────
   Head jerked back, hat askew leaning left, beard scattered.
   ────────────────────────────────────────────────────────────────────── */
const HIT: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '......ZZZ.......................................', //  2
  '.....ZHHHZ......................................', //  3
  '....ZHHHHZ......................................', //  4
  '....ZHPSHZ......................................', //  5
  '....ZHPPPHZ.....................................', //  6
  '...ZHPPSPPHZ....................................', //  7
  '...ZHQPPPPPHZ...................................', //  8
  '...ZHQPPSPPPHZ..................................', //  9
  '...ZHQQPPPPPHHZ.................................', // 10
  '....ZHQQPPSPPHHZ................................', // 11
  '.....ZHQQPPPPHHZZZZZZ...........................', // 12
  '......ZZZZZZZZKKKKKKKKZ.........................', // 13
  '............ZKKKKKKKKKKKZ.......................', // 14
  '............ZKKEKKKKKEKKZ.......................', // 15
  '............ZKKEKKKKKEKKZ.......................', // 16
  '............ZKKKKKJKKKKKZ.......ZZ..............', // 17
  '............ZKKJJJJJJKKKZ......ZNNZ.............', // 18
  '.............ZKKKKKKKKKZ.......ZNBZ.............', // 19
  '.............ZKKWWWWKKZ........ZBBZ.............', // 20
  '............ZWWWWWWWWZ.........ZBBZ.............', // 21
  '...........ZWWGGGWWWWZ.........ZBBZ.............', // 22
  '..........ZWGGGGWWWWZ..........ZBBZ.............', // 23
  '.........ZWGGDDGGWWWZ..........ZBBZ.............', // 24
  '........ZWGDDDGGWWWWZ..........ZBBZ.............', // 25
  '.......ZWGDDGGGWWWWZ...........ZBBZ.............', // 26
  '......ZHHHWGGGWWWHHHZ..........ZBBZ.............', // 27
  '.....ZHQPPSPPPPPPSPHHHZ........ZBBZ.............', // 28
  '....ZHQPPPPPSPPPPPPHHHZ........ZBBZ.............', // 29
  '....ZHQQPPPPPPPPSPPPHHHZ.......ZBBZ.............', // 30
  '....ZHQQPPSPPPPPPPPPHHHZ.......ZBBZ.............', // 31
  '....ZHQQPPPPPPSPPPPPHHHZ.......ZBBZ.............', // 32
  '....ZHQPPSPPPPPPPSPPHHHZ.......ZBBZ.............', // 33
  '....ZHPPPPPSPPPPPPPHHHZ........ZBBZ.............', // 34
  '....ZHPPPPPPPPSPPPHHHZ.........ZBBZ.............', // 35
  '....ZHPPSPPPPPPPPPHHHZ.........ZBBZ.............', // 36
  '....ZHPPPPPPSPPPPPHHHZ.........ZBBZ.............', // 37
  '....ZHPPPPPPPPPPSHHHZ..........ZBBZ.............', // 38
  '.....ZHPPPSPPPPPHHHZ...........ZBBZ.............', // 39
  '......ZHHPPPSPPHHHZ............ZBBZ.............', // 40
  '.......ZHHHHHHHHHZ.............ZBBZ.............', // 41
  '........ZHHHHHHHZ..............ZBBZ.............', // 42
  '........ZBBBZBBBZ..............ZBBZ.............', // 43
  '........ZBBBZBBBZ..............ZBBZ.............', // 44
  '........ZZZZ.ZZZZ..............ZBBZ.............', // 45
  '...............................ZZZ..............', // 46
  '................................................', // 47
];

/* ── SPECIAL ──────────────────────────────────────────────────────────────
   Staff raised overhead with bright cyan/yellow aura around body.
   ────────────────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = [
  '................................................', //  0
  '...AAA..........................................', //  1
  '..AALAA.........................................', //  2
  '..ALYLA.........................................', //  3
  '..AAYAA.....ZZZ.................................', //  4
  '...AYA.....ZNNNZ................................', //  5
  '....A......ZNBBZ................................', //  6
  '...........ZBBBZ................................', //  7
  '..A........ZBBBZ............................A...', //  8
  '.AAA.......ZBBBZ...........................AAA..', //  9
  'AALAA......ZBBBZ..........................AALAA.', // 10
  '.ALA.......ZBBBZ...........................ALA..', // 11
  '..A.......ZZBBBZZ...........................A...', // 12
  '..........ZZZBBBZZ..............................', // 13
  '...........ZHBBBHZ..............................', // 14
  '..........ZHHHBHHHZ.............................', // 15
  '.........ZHHPBPHHHZ.............................', // 16
  'A.......ZHPPSBSPPHHZ........................A...', // 17
  '.A.....ZHPPPPBPPPPHHZ......................A.A..', // 18
  'A.A...ZHQPPSPSPSPPPHHZ.....................AAA..', // 19
  '.AAA.ZHQQPPPPSPPPPPHHHZ......................A..', // 20
  'AAAAAZHQQPPPPPPPPPPPHHHZ.....................A..', // 21
  '.AAA.ZZZZZZZZZZZZZZZZZZZ........................', // 22
  '.....A....ZKKKKKKKKKKZ..........................', // 23
  '....AAA..ZKKKKKKKKKKKKZ.........................', // 24
  '...AALAA.ZKKEKKKKKEKKKZ.....................AAA.', // 25
  '....AAA..ZKKEKKKKKEKKKZ.....................ALA.', // 26
  '.....A...ZKKKKKJKKKKKKZ......................A..', // 27
  '.........ZKKJJJJJJKKKKZ.........................', // 28
  '..........ZKKWWWWKKKKZ......................A...', // 29
  '..........ZWWWWWWWWWZ......................AAA..', // 30
  '.........ZWWWGGGWWWWWZ.....................AALA.', // 31
  '........ZWWGGDDGGGWWWWZ.....................AAA.', // 32
  '.......ZWWGGDDDGGGWWWWZ......................A..', // 33
  '.......ZHHHWGDDGGWWWHHHZ........................', // 34
  '......ZHQPPSPPPPPPPSPHHHZ...................A...', // 35
  '......ZHQPPPPPSPPPPPPHHHZ..................AAA..', // 36
  '......ZHQQPPPPPPPPSPPPHHHZ.................AALA.', // 37
  '......ZHQQPPSPPPPPPPPPHHHZ..................AAA.', // 38
  '......ZHQQPPPPPPSPPPPPHHHZ...................A..', // 39
  '......ZHPPPSPPPPPPPSPPHHZ.......................', // 40
  '......ZHPPPPPPSPPPPPPPHHZ.......................', // 41
  '.......ZHPPPSPPPPPPPHHHZ........................', // 42
  '........ZHHPPPPPHHHHHZ..........................', // 43
  '.........ZHHHHHHHHHHHZ..........................', // 44
  '.........ZBBBZ.ZBBBZ............................', // 45
  '.........ZZZZ..ZZZZ.............................', // 46
  '................................................', // 47
];

/* ── DEFEAT ───────────────────────────────────────────────────────────────
   Collapsed forward over staff, hat fallen off to the side.
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
  '..........ZZ........................ZZZ.........', // 24
  '.........ZHHZ......................ZHHHZ........', // 25
  '........ZHHHHZ....................ZHPSPHZ.......', // 26
  '.......ZHPPSPHZ..................ZHPPPPHHZ......', // 27
  '......ZHPSPPPPHZZZZZZZZZZZZZ....ZHPPSPPPHHZ.....', // 28
  '.....ZHPPPPSPPPHKKKKKKKKKKKKZ..ZHPSPPPPPHHZ.....', // 29
  '....ZHPSPPPPPPPHKKEKKKKKEKKKZ.ZHPPPPSPPPHHHZ....', // 30
  '...ZHPPPPSPPPSPHKKKKKKKKKKKKZZHQPPPSPPPPPHHHZ...', // 31
  '...ZHPPPPPPPPPPHKKKKKJJJKKKKZHQQPPPPPPPSPPHHHZ..', // 32
  '...ZHHHHHHHHHHHWWGGGJJWWWWWGZHQQPPSPPPPPPPHHHZ..', // 33
  '....ZZZZZZZZZZZWWGGDDDGGWWWGZZHQQPPPPSPPPHHHZ...', // 34
  '...............ZWGGDDGGGWWGZ..ZHHHHHHHHHHHHZ....', // 35
  '................ZWWGGGGWWWZ....ZZZZZZZZZZZZ.....', // 36
  '..........ZBBBBBBBBBBBBBBBBBBBBBBBBBBBBBZ.......', // 37
  '..........ZNBBBBBBBBBBBBBBBBBBBBBBBBBBNNZ.......', // 38
  '..........ZBBBBBBBBBBBBBBBBBBBBBBBBBBBBBZ.......', // 39
  '..........ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ.......', // 40
  '................................................', // 41
  '..........ZZ....................................', // 42
  '.........ZYYZ...................................', // 43
  '........ZYXYYZ..................................', // 44
  '........ZYXYYZ..................................', // 45
  '.........ZYYZ...................................', // 46
  '..........ZZ....................................', // 47
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
const MageSprite = memo(function MageSprite({
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
        aria-label="Mage"
        role="img"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

/* ── default export ──────────────────────────────────────────────────── */
const mage: CharacterArt = {
  meta: {
    id: 'mage',
    name: '法師',
    englishName: 'Mage',
    role: 'player',
    tier: 'hero',
    description: '智慧長者，藍水晶法杖、繁星法袍。',
  },
  Sprite: MageSprite,
};

export default mage;
