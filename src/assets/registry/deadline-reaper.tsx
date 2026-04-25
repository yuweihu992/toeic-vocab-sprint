import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;
const W = 48;

// Palette — Deadline Reaper. Light source: upper-left.
// 17 colors total. Single-character keys keep grid rows aligned at 48 cells.
const PALETTE: Readonly<Record<string, string>> = {
  // tattered cloak (black)
  k: '#0c0a09', // darkest outline / shadow folds
  K: '#1c1917', // mid cloak
  D: '#292524', // light cloak highlight
  // pale clock face
  F: '#f1f5f9', // face highlight
  f: '#e2e8f0', // face shadow
  // clock numbers and hands (very dark)
  n: '#0c0a09', // alias of cloak black; reused for numerals/hands
  // bone (skeletal hands)
  B: '#fef3c7', // bone highlight
  b: '#d6d3d1', // bone mid
  o: '#a8a29e', // bone shadow
  // wood scythe handle
  W: '#92400e', // wood highlight
  w: '#78350f', // wood shadow
  // scythe blade silver
  S: '#e2e8f0', // blade highlight
  s: '#cbd5e1', // blade mid
  L: '#94a3b8', // blade shadow / spine
  // calendar pages (white sheet w/ red ✗)
  P: '#f1f5f9', // paper alias of face highlight (key separated for readability — same value)
  X: '#dc2626', // red ✗ on pages
  // gold hourglass detail on belt
  G: '#fbbf24',
  // red glow eyes (special)
  R: '#dc2626', // glow core
  g: '#fca5a5', // glow halo
};

// All grids face LEFT — the scythe blade arcs out to the LEFT of the body,
// the cloak's hood curves up the right side, and the figure's "front" is at lower x.

// ── IDLE ──────────────────────────────────────────────────────────────────
// Standing tall, scythe planted vertically on the left side, cloak draped,
// clock hands at 11:59 (minute hand straight up, hour hand near 12 leaning left).
const IDLE: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 00
  '..........SS....................................', // 01  blade tip
  '.........SsS....................................', // 02
  '........SssL....................................', // 03
  '.......SssL.....kkkkkkk.........................', // 04  hood top
  '......SssL....kkKKKKKKKkk.......................', // 05
  '.....SssL...kkKKDDDDDDDKKKkk....................', // 06  hood + face
  '....SssL..kkKDFFFFFFFFFFFDDKkk..................', // 07
  '...SssL..kKDFFFFFFnFFFFFFFFFDKk.................', // 08
  '..SssL..kKDFFFFnFFFFFFnFFFFFfDk.................', // 09
  '..LsL...kKDFFFFFFFFFFFFFFFFFfDk.................', // 10
  '..wWw...kKDFnFFFFFnnFFFFFFnFfDk.................', // 11  numbers
  '..wWw...kKDFFFFFFFnFFFFFFFFFfDk.................', // 12  hand up (11:59)
  '..wWw...kKDFFFFFFFnFFFFFFFFFfDk.................', // 13
  '..wWw...kKDFFnFFFFnFFFFFFnFFfDk.................', // 14
  '..wWw...kKDFFFFFFFFFFFFFFFFFfDk.................', // 15
  '..wWw...kKDfFnFFFFFnnFFFFnFffDk.................', // 16
  '..wWw....kKDfffFFFFFFFFFFffffDk.................', // 17
  '..wWw....kkKDDfffffffffffffDDk..................', // 18
  '..wWw.....kkKKDDDDDDDDDDDDKKkk..................', // 19  shoulder line
  '..wWw....kKKKKKKKKKKKKKKKKKKKKk.................', // 20
  '..wWw...kKKDDKKKKKKKKKKKKKKKKKKk................', // 21  cloak shoulders
  '..wWw...kKDDKKKKKKKKKKKKKKKKKKKk................', // 22
  '..wWw..kKKDKKKKKKKKKKKKKKKKKKKKKk...............', // 23
  '..wWw..kKDKKKKKKKKKKKKKKKKKKKKKKk...............', // 24
  '..wWw.kKKDKKKKKKKKKKKKKKKKKKKKKKKk..............', // 25
  '..wWw.kKDKKKKKKKKKKKKKKKKKKKKKKKKk..............', // 26
  '..wWw.kKKKKKKKKKKbBbKKKKKKKKKKKKKk..............', // 27  bone hand grip top
  '..wWw.kKKKKKKKKKbBBoKKKKKKKKKKKKKk..............', // 28
  '..wWw.kKKKKKKKKKbBboKKKKKKKKKKKKKk..............', // 29
  '..wWw.kKKKKKKKKKKKKKKKKKKGGGKKKKKk..............', // 30  hourglass top
  '..wWw.kKKKKKKKKKKKKKKKKKKGgGKKKKKk..............', // 31  hourglass waist
  '..wWw.kKKKKKKKKKKKKKKKKKKGGGKKKKKk..............', // 32  hourglass bottom
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKk..............', // 33
  '..wWw.kKKDDDKKKKKKKKKKKKKKKKKKKKKk..............', // 34
  '..wWw.kKKDKDDKKKKKKKKKKKKKKKKKKKKk..............', // 35
  '..wWw.kKDKDKDKKKKKKKKKKKKKKKKKKKKk..............', // 36
  '..wWw.kKDKDDKDKKKKKKKKKKKKKKKKKKKk..............', // 37
  '..wWw.kKDDDKDKKKKKKKKKKKKKKKKKKKKk..............', // 38
  '..wWw.kKKDKKDKKKKKKKKKKKKKKKKKKKKk..............', // 39
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKk..............', // 40
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKk..............', // 41  tattered hem area
  '..wWw.kKkKKKkKKkKKKkKKkKKKkKKkKKKk..............', // 42  jagged tatters
  '..wWw.k.k.k.k.k.k.k.k.k.k.k.k.k..k..............', // 43  tatter spikes
  '..www...........................................', // 44
  '..www...........................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── WALK ──────────────────────────────────────────────────────────────────
// Gliding forward (to the LEFT), cloak trailing back to the right, scythe
// tilted slightly back, clock head leaning forward.
const WALK: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 00
  '............SS..................................', // 01
  '...........SsS..................................', // 02
  '..........SssL..................................', // 03
  '.........SssL...kkkkkkk.........................', // 04
  '........SssL..kkKKKKKKKkk.......................', // 05
  '.......SssL.kkKKDDDDDDDKKKkk....................', // 06
  '......SssL.kkKDFFFFFFFFFFDDKkk..................', // 07
  '.....SssL.kKDFFFFFFnFFFFFFFFDKk.................', // 08
  '....SssL..kKDFFFFnFFFFFFnFFFfDk.................', // 09
  '....LsL...kKDFFFFFFFFFFFFFFFfDk.................', // 10
  '....wWw...kKDFnFFFFFnnFFFFFnfDk.................', // 11
  '...wWw....kKDFFFFFFFnFFFFFFFfDk.................', // 12
  '...wWw....kKDFFFFFFFnFFFFFFFfDk.................', // 13
  '...wWw....kKDFFnFFFFnFFFFFnFfDk.................', // 14
  '...wWw....kKDFFFFFFFFFFFFFFFfDk.................', // 15
  '..wWw.....kKDfFnFFFFFnnFFnFffDk.................', // 16
  '..wWw.....kKDfffFFFFFFFFFFfffDk.................', // 17
  '..wWw......kKDDfffffffffffDDk...................', // 18
  '..wWw.......kkKKDDDDDDDDDKKkk...................', // 19
  '.wWw.......kKKKKKKKKKKKKKKKKKkk.................', // 20
  '.wWw......kKKDDKKKKKKKKKKKKKKKKKk...............', // 21
  '.wWw.....kKKDDKKKKKKKKKKKKKKKKKKKk..............', // 22
  '.wWw....kKKDKKKKKKKKKKKKKKKKKKKKKKk.............', // 23
  '.wWw...kKKDKKKKKKKKKKKKKKKKKKKKKKKKk............', // 24
  'wWw...kKKDKKKKKKKKKKKKKKKKKKKKKKKKKKk...........', // 25
  'wWw..kKKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..........', // 26
  'wWw.kKKKKKKKKKKbBbKKKKKKKKKKKKKKKKKKKKk.........', // 27
  'wWw.kKKKKKKKKKbBBoKKKKKKKKKKKKKKKKKKKKKk........', // 28
  'wWw.kKKKKKKKKKbBboKKKKKKKKKKKKKKKKKKKKKKk.......', // 29
  'wWw.kKKKKKKKKKKKKKKKKKKGGGKKKKKKKKKKKKKKKk......', // 30
  'wWw.kKKKKKKKKKKKKKKKKKKGgGKKKKKKKKKKKKKKKKk.....', // 31
  'wWw.kKKKKKKKKKKKKKKKKKKGGGKKKKKKKKKKKKKKKKKk....', // 32
  'wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk...', // 33
  'wWw.kKKDDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..', // 34
  'wWw.kKKDKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.', // 35
  'wWw.kKDDKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk', // 36  cloak trailing far right
  'wWw.kKDKDDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkk', // 37
  'wWw.kKKDDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkk.', // 38
  'wWw.kKKKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..', // 39
  'wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..', // 40
  'wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkk..', // 41
  'wWw.kKkKKkKKkKKkKKKkKKkKKkKKKkKKkKKkKKkKKKkkk...', // 42
  'wWw...k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.kk....', // 43
  'www.............................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── ATTACK ────────────────────────────────────────────────────────────────
// Scythe swept forward in a horizontal arc across the top, calendar pages
// exploding off the blade. Body lurches LEFT, both bone hands gripping
// the handle which now arcs across the upper portion of the canvas.
const ATTACK: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '..PXP..PPP......................................', // 00  pages flying
  '..PPP..PXP....SSSSSSSSSS........................', // 01  blade arc
  '...P....P....SssssssssLLL.......................', // 02
  '..PPP.......SssssssLLLLL........................', // 03
  '.PXXPP.....SssssLLL.............................', // 04
  '.PPPPP....LLLLLL...kkkkkkk......................', // 05
  '..PPP....wWwww...kkKKKKKKKkk....................', // 06
  '........wWwwww.kkKKDDDDDDDKKKkk.................', // 07  handle
  '.PPP...wWwwww.kkKDFFFFFFFFFDDKkk................', // 08
  '.PXP..wWwww..kKDFFFFFFnFFFFFFDKk................', // 09
  '.PPP.wWwww...kKDFFFFnFFFFFnFFfDk................', // 10
  '....wWwww....kKDFFFFFFFFFFFFFfDk................', // 11
  '...wWwww.....kKDFnFFFFFnnFFFnfDk................', // 12
  '..wWww.......kKDFFFFFFFnFFFFFfDk................', // 13
  '..www........kKDFFFFFFFnFFFFFfDk................', // 14
  '.............kKDFFnFFFFnFFFFnfDk................', // 15
  '.............kKDFFFFFFFFFFFFFfDk................', // 16
  '.............kKDfFnFFFFFnnFnffDk................', // 17
  '.............kKDfffFFFFFFFFffffDk...............', // 18
  '..............kKDDfffffffffffDDk................', // 19
  '...............kkKKDDDDDDDDKKkk.................', // 20
  '..............kKKKKKKKKKKKKKKKkk................', // 21
  '.............kKKDDKKKKKKKKKKKKKKk...............', // 22
  '............kKKDKKKKKKKKKKKKKKKKKk..............', // 23
  '...........kKKDKKKKKKKKKKKKKKKKKKKk.............', // 24
  '..........kKKDKKKKKKKKKKKKKKKKKKKKKk............', // 25
  '..bBb....kKKDKKKKKKKKKKKKKKKKKKKKKKKk...........', // 26  off-hand reaches up
  '..bBo...kKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..........', // 27
  '..bbo...kKKKKKKKKKKKbBbKKKKKKKKKKKKKKKk.........', // 28  main grip
  '........kKKKKKKKKKKbBBoKKKKKKKKKKKKKKKk.........', // 29
  '........kKKKKKKKKKKbBboKKKKKKKKKKKKKKKk.........', // 30
  '........kKKKKKKKKKKKKKKKKKGGGKKKKKKKKKk.........', // 31
  '........kKKKKKKKKKKKKKKKKKGgGKKKKKKKKKk.........', // 32
  '........kKKKKKKKKKKKKKKKKKGGGKKKKKKKKKk.........', // 33
  '........kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 34
  '........kKKDDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 35
  '........kKKDKDKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 36
  '........kKDDKDKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 37
  '........kKDKDDKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 38
  '........kKDDDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 39
  '........kKKDKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 40
  '........kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 41
  '........kKkKKkKKkKKkKKkKKKkKKkKKkKKkKKk.........', // 42
  '........k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.........', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── HIT ───────────────────────────────────────────────────────────────────
// Clock hands jerked off their pivot, cloak flapping outward to the right,
// scythe wobbles. A small cracked-glass mark on the clock face.
const HIT: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 00
  '..........SS....................................', // 01
  '.........SsS....................................', // 02
  '........SssL....................................', // 03
  '.......SssL.....kkkkkkk.........................', // 04
  '......SssL....kkKKKKKKKkk.......................', // 05
  '.....SssL...kkKKDDDDDDDKKKkk....................', // 06
  '....SssL..kkKDFFFFFFFFFFFDDKkk..................', // 07
  '...SssL..kKDFFFFFFFnFFFFFFFFDKk.................', // 08
  '..SssL..kKDFFFnFFFFFFFFnFFFFfDk.................', // 09
  '..LsL...kKDFFFFFFFFFFFFFFFFFfDk.................', // 10
  '..wWw...kKDFnFFnFFFFnFFFnFFnfDk.................', // 11  cracks (extra n's)
  '..wWw...kKDFFnFFFFFFFFFFFFFFfDk.................', // 12  hand jolted aside
  '..wWw...kKDFFFnnFFFFFFFFnFFFfDk.................', // 13
  '..wWw...kKDFFnFnFFnnFFFnFnFFfDk.................', // 14
  '..wWw...kKDFFFFFFFFFFFFFFFFFfDk.................', // 15
  '..wWw...kKDfFnFFFFFnFFFFFnFffDk.................', // 16
  '..wWw....kKDfffFFFFFFFFFFffffDk.................', // 17
  '..wWw....kkKDDfffffffffffffDDk..................', // 18
  '..wWw.....kkKKDDDDDDDDDDDDKKkk..................', // 19
  '..wWw....kKKKKKKKKKKKKKKKKKKKKkk................', // 20
  '..wWw...kKKDDKKKKKKKKKKKKKKKKKKKk...............', // 21
  '..wWw...kKDDKKKKKKKKKKKKKKKKKKKKKk..............', // 22
  '..wWw..kKKDKKKKKKKKKKKKKKKKKKKKKKKk.............', // 23  cloak flares right
  '..wWw..kKDKKKKKKKKKKKKKKKKKKKKKKKKKk............', // 24
  '..wWw.kKKDKKKKKKKKKKKKKKKKKKKKKKKKKKk...........', // 25
  '..wWw.kKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKk..........', // 26
  '..wWw.kKKKKKKKKKbBbKKKKKKKKKKKKKKKKKKk..........', // 27
  '..wWw.kKKKKKKKKbBBoKKKKKKKKKKKKKKKKKKk..........', // 28
  '..wWw.kKKKKKKKKbBboKKKKKKKKKKKKKKKKKKk..........', // 29
  '..wWw.kKKKKKKKKKKKKKKKKKGGGKKKKKKKKKKKk.........', // 30
  '..wWw.kKKKKKKKKKKKKKKKKKGgGKKKKKKKKKKKk.........', // 31
  '..wWw.kKKKKKKKKKKKKKKKKKGGGKKKKKKKKKKKk.........', // 32
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 33
  '..wWw.kKKDDKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 34
  '..wWw.kKKDKDDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 35
  '..wWw.kKDKDKDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 36
  '..wWw.kKDKDDKDKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 37
  '..wWw.kKDDDKDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 38
  '..wWw.kKKDKKDKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 39
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 40
  '..wWw.kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk.........', // 41
  '..wWw.kKkKKkKKkKKKkKKkKKKkKKkKKkKKKkKKk.........', // 42
  '..wWw.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.........', // 43
  '..www...........................................', // 44
  '..www...........................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── SPECIAL ───────────────────────────────────────────────────────────────
// TIME ATTACK — clock face glowing red, hands a blur of motion lines,
// red glow halos around the face, blade radiates light. RED EYES peek
// from clock numerals.
const SPECIAL: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '...........g....................................', // 00
  '..........gRg...SS..............................', // 01
  '..........gRRg.SsS..............................', // 02
  '.........gRRRgSssL..............................', // 03
  '........gRRRRSssL.gkkkkkkkg.....................', // 04
  '.......gRRRSssL..gkKKKKKKKkg....................', // 05
  '......gRRSssL..ggkKKDDDDDKKKkkg.................', // 06
  '.....gRSssL...gkKDFFFFFFFFFFDKkg................', // 07
  '....gRssL.....kKDFRFFFFRFFFFFDKg................', // 08  red eyes
  '...gRsL.......kKDFFFFFFFFFFFFfDk................', // 09
  '...gLL........kKDRFFFFRRFFFFFfDk................', // 10
  '...www........kKDFFFRRRRRFFFFfDk................', // 11  blur core
  '..wWw.........kKDRFFRRRRRFFRFfDk................', // 12  hands spinning
  '..wWw.........kKDFFRRRRRRRFFFfDk................', // 13
  '..wWw.........kKDFRFFRRRFFRFFfDk................', // 14
  '..wWw.........kKDFFFFRRRFFFFFfDk................', // 15
  '..wWw.........kKDfFRFFFFFFRFffDk................', // 16
  '..wWw.........kKDfffFRFFRFffffDk................', // 17
  '..wWw..........kKDDfffffffffDDk.................', // 18
  '..wWw...........gkKKDDDDDDDKKkg.................', // 19
  '..wWw..........gkKKKKKKKKKKKKKkg................', // 20
  '..wWw.........gkKKDDKKKKKKKKKKKKkg..............', // 21
  '..wWw........gkKKDDKKKKKKKKKKKKKKKkg............', // 22
  '..wWw.......gkKKDKKKKKKKKKKKKKKKKKKkg...........', // 23
  '..wWw......gkKKDKKKKKKKKKKKKKKKKKKKKkg..........', // 24
  '..wWw.....gkKKDKKKKKKKKKKKKKKKKKKKKKKkg.........', // 25
  '..wWw....gkKKDKKKKKKKKKKKKKKKKKKKKKKKKkg........', // 26
  '..wWw....kKKKKKKKKKbBbKKKKKKKKKKKKKKKKKk........', // 27
  '..wWw....kKKKKKKKKbBBoKKKKKKKKKKKKKKKKKk........', // 28
  '..wWw....kKKKKKKKKbBboKKKKKKKKKKKKKKKKKk........', // 29
  '..wWw....kKKKKKKKKKKKKKKKKGGGKKKKKKKKKKk........', // 30
  '..wWw....kKKKKKKKKKKKKKKKKGRGKKKKKKKKKKk........', // 31  hourglass glow
  '..wWw....kKKKKKKKKKKKKKKKKGGGKKKKKKKKKKk........', // 32
  '..wWw....kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk........', // 33
  '..wWw....kKKDDKKKKKKKKKKKKKKKKKKKKKKKKKk........', // 34
  '..wWw....kKKDKDDKKKKKKKKKKKKKKKKKKKKKKKk........', // 35
  '..wWw....kKDKDKDKKKKKKKKKKKKKKKKKKKKKKKk........', // 36
  '..wWw....kKDKDDKDKKKKKKKKKKKKKKKKKKKKKKk........', // 37
  '..wWw....kKDDDKDKKKKKKKKKKKKKKKKKKKKKKKk........', // 38
  '..wWw....kKKDKKDKKKKKKKKKKKKKKKKKKKKKKKk........', // 39
  '..wWw....kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk........', // 40
  '..wWw....kKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk........', // 41
  '..wWw....kKkKKkKKKkKKkKKKkKKkKKkKKkKKkKk........', // 42
  '..wWw....k.k.k.k.k.k.k.k.k.k.k.k.k.k.k.k........', // 43
  '..www...........................................', // 44
  '..www...........................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── DEFEAT ────────────────────────────────────────────────────────────────
// Collapsed flat: cloak heaped on the ground, clock-face cracked & tipped
// sideways, scythe fallen separately to the left, hourglass spilled.
const DEFEAT: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '................................................', // 05
  '................................................', // 06
  '................................................', // 07
  '................................................', // 08
  '................................................', // 09
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
  '................................................', // 29
  'SSSS............................................', // 30  blade fallen flat
  'sssLLL..........................................', // 31
  '.LLLwWwwwwwwwww.................................', // 32  handle on ground
  '.....wwwwwwwwww.................................', // 33
  '..............kkkkkkkkkk........................', // 34
  '............kkKKDDDDDDDDKKkk....................', // 35  clock tipped
  '...........kKDFfFFnFFFFnFFDKk...................', // 36
  '..........kKDFnFFFFFnnFFFnFfDk..................', // 37
  '..........kKDFFFFFFFFFFFFFFfDk..................', // 38  cracked face
  '..........kKDfFFnFFFFFFnFFFffDk.................', // 39
  '..........kKDfffffffffffffffDk..................', // 40
  '.........kKKDDDDDDDDDDDDDDDDDKkk................', // 41
  '........kKKKKKKKKKKKKKKKKKKKKKKkk...............', // 42  cloak heaped
  '.......kKKDDKKKKKKKbBbKKKKKKKKKKKkk.............', // 43  bone hand limp
  '......kKKDKKKKKKKKbBBoKKKKGGGKKKKKKkk...........', // 44  hourglass spilled
  '....kKKKKKKKKKKKKKbBboKKKKGgGKKKKKKKKkk.........', // 45
  '..kKKkKKKKkKKKKKkKKKKKKkKKKGGGKKKKKKKKKKkk......', // 46  tatters splayed
  'kkk.kk.kk.kk.kk.kk.kk.kk.kk.kk.kk.kk.kk.kkkk....', // 47
];

const POSES: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

function assertGrid(name: string, rows: readonly string[]): void {
  if (rows.length !== W) {
    throw new Error(
      `[deadline-reaper] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[deadline-reaper] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function DeadlineReaperSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = POSES[state] ?? POSES.idle;
  return (
    <svg
      className={`cs-root cs-state-${state}`}
      width={size}
      height={size}
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      style={{ overflow: 'visible' }}
    >
      <PixelGrid rows={rows} palette={PALETTE} />
    </svg>
  );
}

const character: CharacterArt = {
  meta: {
    id: 'deadline-reaper',
    name: '死線收割者',
    englishName: 'Deadline Reaper',
    role: 'generic',
    tier: 'major',
    description: '頭是時鐘的骷髏死神，鐮刀掃出散落日曆紙、永遠 11:59。',
  },
  Sprite: DeadlineReaperSprite,
};

export default character;
