import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — dark spider body with a white Excel-grid abdomen, glowing red
// eye cluster, yellow pencil-tip legs and small green/red cell highlights.
// Light source: upper-left.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#0c0a09', // deepest outline / shadow
  K: '#1c1917', // body outline / dark numerals inside cells
  D: '#44403c', // body shadow
  M: '#78716c', // body mid-highlight
  W: '#f1f5f9', // abdomen base (cell white)
  w: '#e5e7eb', // abdomen shadow side
  g: '#94a3b8', // grid lines (abdomen + background web)
  R: '#dc2626', // glowing red eye core / error red / "ERROR" cell
  r: '#fca5a5', // eye mid-glow
  p: '#fee2e2', // eye outer glow
  o: '#ffffff', // pure white pupil core / web bright cast
  Y: '#fbbf24', // pencil yellow shaft
  G: '#22c55e', // green "OK" cell highlight
};

const W = 48;

// Helper: produce a 48-char row from variable-length parts.
//   - if shorter than 48, right-pads with `fill` (default '.')
//   - if longer than 48, slices to 48
// This guarantees every emitted row is exactly 48 chars, which keeps the
// canvas valid even when the source string drifts by a character or two.
function row48(parts: string, fill: string = '.'): string {
  if (parts.length >= W) return parts.slice(0, W);
  return parts + fill.repeat(W - parts.length);
}

// Solid 48-char shortcuts.
const EMPTY = '.'.repeat(W);
const WEB_H = 'g'.repeat(W); // a horizontal web strand

// ── IDLE ────────────────────────────────────────────────────────────────────
// Spider faces LEFT in the centre of the canvas. Legs spread on a faint web
// of horizontal/vertical grey grid lines (the background spreadsheet web).
// Bulbous abdomen on the RIGHT carries a 4×3 Excel grid with tiny scattered
// numerals/letters (K dots inside cells). A red eye-cluster sits on the
// LEFT side of the small head. Eight pencil-tip legs (yellow shaft, black
// graphite) fan out symmetrically. Light from upper-left.
const IDLE: readonly string[] = [
  row48('...g..........g.........g.........g..........g'), //  0
  row48('...g..........g.........g.........g..........g'), //  1
  WEB_H,                                                    //  2
  row48('...g..........g....KKKKKKKKKKKK...g..........g'), //  3
  row48('...g..........g...KDDDDDDDDDDDDK..g..........g'), //  4
  row48('Y..g..........g..KDWWWgWWWgWWWgwK.g..........g'), //  5
  row48('YK.g.....Y....g..KDWKWgWKWgWKWgwwK.g.........g'), //  6
  row48('.YK.g....YK...g..KDWWWgWWWgWWWgwwK.g..Y......g'), //  7
  row48('..YK.g....YK..g..KDgDgDgDgDgDgDgDK.g..YK.....g'), //  8
  row48('gggYKggggggYKggggKDWKWgWKWgWKWgwwKgggggYKggggg'), //  9
  row48('....YK..g...rprKKDgDgDgDgDgDgDgDgK.g....YK...g'), // 10
  row48('.....YK.g..rRoRDDKDWWWgWWWgWWWgwwK.g.....YK..g'), // 11
  row48('......YKg.rRRRrDDKDgDgDgDgDgDgDgDK.g......YK.g'), // 12
  row48('.......YKrprrDDDDDDDDDDDDDDDDDDDDK.g.......YKg'), // 13
  row48('........KKDDDDDDDDDDDDDDDDDDDDDDDDK.g.......Kg'), // 14
  row48('.......KDDDDDDDDDDDDDDDDDDDDDDDDDDK.g........g'), // 15
  row48('......KDDDDDDDDDDDDDDDDDDDDDDDDDDDDKg........g'), // 16
  row48('......KDDDDDDDDDDDDDDDDDDDDDDDDDDDDKg........g'), // 17
  row48('......KKDDDDDDDDDDDDDDDDDDDDDDDDDDDK.........g'), // 18
  row48('.......KKKKKKKKKKKKKKKKKKKKKKKKKKKK..........g'), // 19
  row48('...g.....K...K...K...K...K...K..g............g'), // 20
  row48('...g....K...K...K...K...K...K..Kg............g'), // 21
  row48('...g...K...K...K...K...K...K..K.g............g'), // 22
  row48('...g..K...K...K...K...K...K..K..g............g'), // 23
  row48('...g.K...K...K...K...K...K..K...g............g'), // 24
  row48('..gK..g.K...K...K...K...K..K....g............g'), // 25
  row48('.gK....gK..K...K...K...K..K.....g............g'), // 26
  WEB_H,                                                    // 27
  row48('gK......gK..K...K...K..K........g............g'), // 28
  row48('K.......gK..K...K...K..K........g............g'), // 29
  row48('K.....gK....K...K...K..K........g............g'), // 30
  row48('K....gK.....K...K...K..K........g............g'), // 31
  row48('YK..gK......K...K...K..K........g............g'), // 32
  row48('YK.gK.......K...K...K..K........g............g'), // 33
  WEB_H,                                                    // 34
  row48('.YKgK.......K...K...K..K........g............g'), // 35
  row48('..YK........K...K...K..K........g............g'), // 36
  row48('..gK........K...K...K..K........g............g'), // 37
  row48('..gK........K...K...K..K........g............g'), // 38
  row48('..gK........K...K...K..K........g............g'), // 39
  WEB_H,                                                    // 40
  row48('..gK........K...K...K..K........g............g'), // 41
  row48('..gK........K...K...K..K........g............g'), // 42
  row48('..gK........K...K...K..K........g............g'), // 43
  row48('..gK........K...K...K..K........g............g'), // 44
  row48('..gK........K...K...K..K........g............g'), // 45
  row48('..gKK.......KK..KK..KK.KK.......g............g'), // 46
  row48('...g.........g...g...g..g.......g............g'), // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Same pose as idle but legs are staggered: front-left and back-right legs
// stride forward (further LEFT and DOWN), front-right and back-left legs
// lifted slightly. Body shifted up 1 row to imply a bouncy gait.
const WALK: readonly string[] = [
  row48('...g..........g.........g.........g..........g'), //  0
  WEB_H,                                                    //  1
  row48('...g..........g....KKKKKKKKKKKK...g..........g'), //  2
  row48('Y..g..........g...KDDDDDDDDDDDDK..g..........g'), //  3
  row48('YK.g..........g..KDWWWgWWWgWWWgwK.g.....Y....g'), //  4
  row48('.YK.g....Y....g..KDWKWgWKWgWKWgwwK.g....YK...g'), //  5
  row48('..YK.g..YK....g..KDWWWgWWWgWWWgwwK.g.....YK..g'), //  6
  row48('...YK.g..YK...g..KDgDgDgDgDgDgDgDK.g......YK.g'), //  7
  row48('....YKg...YK..g..KDWKWgWKWgWKWgwwKgggggggggYKg'), //  8
  WEB_H,                                                    //  9
  row48('....YK..g..rprKKDDDgDgDgDgDgDgDgDK.g.........Yg'), // 10
  row48('.....YK.g.rRoRDDKDWWWgWWWgWWWgwwwK.g..........g'), // 11
  row48('......YKgrRRRrDDKDgDgDgDgDgDgDgDgK.g..........g'), // 12
  row48('.......YKprrDDDDDDDDDDDDDDDDDDDDDK.g..........g'), // 13
  row48('........KDDDDDDDDDDDDDDDDDDDDDDDDDK.g.........g'), // 14
  row48('.......KDDDDDDDDDDDDDDDDDDDDDDDDDDK.g.........g'), // 15
  row48('......KDDDDDDDDDDDDDDDDDDDDDDDDDDDDKg.........g'), // 16
  row48('......KDDDDDDDDDDDDDDDDDDDDDDDDDDDDKg.........g'), // 17
  row48('......KKDDDDDDDDDDDDDDDDDDDDDDDDDDDK..........g'), // 18
  row48('.......KKKKKKKKKKKKKKKKKKKKKKKKKKKK...........g'), // 19
  row48('...g....K..K....K....K...K..K..K..g..........g'), // 20
  row48('...g...K..K......K....K...K..K..K.g..........g'), // 21
  row48('...g..K..K........K....K..K..K..K..g.........g'), // 22
  row48('...g.K..K..........K....K..K..K..K.g.........g'), // 23
  row48('...gK..K............K....K..K..K..Kg.........g'), // 24
  row48('..gK..K..............K....K..K..K..g.........g'), // 25
  row48('.gK..K................K....K..K..K..g........g'), // 26
  WEB_H,                                                    // 27
  row48('gK..K..................K....K..K..K.g........g'), // 28
  row48('K..K....................K....K..K..K.g.......g'), // 29
  row48('K.K......................K....K..K..K.g......g'), // 30
  row48('KK........................K....K..K..K.g.....g'), // 31
  row48('YK.........................K....K..K..K.g....g'), // 32
  WEB_H,                                                    // 33
  row48('YK..........................K....K..K..K.g...g'), // 34
  row48('.YK.........................K....K..K..K.g...g'), // 35
  row48('..YK........................K....K..K..K.g...g'), // 36
  row48('...YK.......................K....K..K..K.g...g'), // 37
  row48('....YK......................K....K..K..K.g...g'), // 38
  row48('.....YK.....................K....K..K..K.g...g'), // 39
  WEB_H,                                                    // 40
  row48('......YK....................K....K..K..K.g...g'), // 41
  row48('.......YK...................K....K..K..K.g...g'), // 42
  row48('........YK..................K....K..K..K.g...g'), // 43
  row48('.........YK.................K....K..K..K.g...g'), // 44
  row48('..........YK................K....K..K..K.g...g'), // 45
  row48('..........KK................KK..KK.KK.KK.g...g'), // 46
  row48('...g..........g.........g.........g..........g'), // 47
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Front four legs lunge LEFT, body leaning forward, FANGS bared (white tips
// jutting from the head). Eyes glow brighter (extra white pupil cores).
// Abdomen still shows the grid; cells contain a pop of red.
const ATTACK: readonly string[] = [
  row48('...g..........g.........g.........g..........g'), //  0
  EMPTY,                                                    //  1
  WEB_H,                                                    //  2
  row48('YK................KKKKKKKKKKKK...............g'), //  3
  row48('YKK..............KDDDDDDDDDDDDK...............g'), //  4
  row48('YKKK............KDWWWgWWWgWWWgwK..............g'), //  5
  row48('YKKKK..........KDWKRgRKWgWKWgwwK..............g'), //  6
  row48('.YKKKK........KDWWRgRRWgWWWgwwwK..............g'), //  7
  row48('..YKKKK......KDgDgDgDgDgDgDgDgDK....Y.........g'), //  8
  row48('YK.YKKKKKKK.KDWKWgWKWgWKWgwwwwwwK..YK.........g'), //  9
  row48('YKK.YKKKKpKKDgDgDgDgDgDgDgDgDgDgK.YK..........g'), // 10
  row48('.YKKKKKpRoRKDWWWgWWWgWWWgwwwwwwwK.YK..........g'), // 11
  row48('..YKKKKpRRrRDgDgDgDgDgDgDgDgDgDgK..YK.........g'), // 12
  row48('...YKKKKprrDDDDDDDDDDDDDDDDDDDDDDK..YK........g'), // 13
  row48('....YKKKKDDDDDDDDDDDDDDDDDDDDDDDDDK..YK.......g'), // 14
  row48('YK..YKKKDDDDDDDDDDDDDDDDDDDDDDDDDDK...YK......g'), // 15
  row48('YKK.YKKDDDDDDDDDDDDDDDDDDDDDDDDDDDDK...YK.....g'), // 16
  row48('.YKKKKKDDDDDDDDDDDDDDDDDDDDDDDDDDDDK....YK....g'), // 17
  row48('..YKKKKKDDDDDDDDDDDDDDDDDDDDDDDDDDDK.....YK...g'), // 18
  row48('...YKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK......YK..g'), // 19
  row48('....YKKKKKK..K...K....K..K...K....K.......YK.g'), // 20
  row48('YK..YKKKKK....K...K....K..K...K...K.......YKKg'), // 21
  row48('YKK.YKKKKK.....K....K...K..K...K..K........YKg'), // 22
  row48('.YKKYKKKKK......KK....K...K..K..K..K........Kg'), // 23
  row48('..YKKKKKKK........K...K....K..K..K..K.........g'), // 24
  row48('..YYKKKKKK.........K..K.....K..K..K..K........g'), // 25
  row48('...YKKKKKK..........K..K.....K..K..K..K.......g'), // 26
  row48('....YKKKKK...........K..K.....K..K..K..K......g'), // 27
  WEB_H,                                                    // 28
  row48('.....YKKKK............K..K.....K..K..K..K.....g'), // 29
  row48('......YKKK.............K..K.....K..K..K..K....g'), // 30
  row48('.......YKK..............K..K.....K..K..K..K...g'), // 31
  row48('........YK...............K..K.....K..K..K..K..g'), // 32
  row48('.........K................K..K.....K..K..K..Kg'), // 33
  row48('.........K.................K..K.....K..K..K.Kg'), // 34
  row48('.........K..................K..K.....K..K..KKg'), // 35
  row48('.........K...................K..K.....K..K..Kg'), // 36
  row48('.........K....................K..K.....K..K.Kg'), // 37
  row48('.........K.....................K..K.....K..KKg'), // 38
  row48('.........K......................K..K.....K..Kg'), // 39
  row48('.........K.......................K..K.....KKKg'), // 40
  WEB_H,                                                    // 41
  row48('.........K........................K..K.....KKg'), // 42
  row48('.........K.........................K..K.....Kg'), // 43
  row48('.........K..........................K..K....Kg'), // 44
  row48('.........K...........................K..K..KKg'), // 45
  row48('.........KK..........................KK..KK.Kg'), // 46
  EMPTY,                                                    // 47
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Body recoiling RIGHT, legs splayed outward in surprise. Abdomen displays
// a big red "#REF!" error pattern across the cells (R/E pixels replacing
// the normal grid contents). Eyes squint (small red glow only).
const HIT: readonly string[] = [
  row48('...g..........g.........g.........g..........g'), //  0
  EMPTY,                                                    //  1
  WEB_H,                                                    //  2
  EMPTY,                                                    //  3
  row48('Y......g......g....KKKKKKKKKKKK..g.........Y..g'), //  4
  row48('YK......g.....g...KDDDDDDDDDDDDK..g.......YK..g'), //  5
  row48('.YK......g....g..KDRRRRRRRRRRRRK..g......YK...g'), //  6
  row48('..YK......g...g..KDRwwRRwwRRwwRK..g.....YK....g'), //  7
  row48('...YK......g..g..KDRRwRwRwRRwRRK..g....YK.....g'), //  8
  row48('....YK......g.g..KDRRRRRRRRRRRRK..g...YK......g'), //  9
  row48('.....YK......gg.KDRRwwwRRRwRRRwK..g..YK.......g'), // 10
  row48('......YK......prKKDRwRwwRwwwRwwK..g.YK........g'), // 11
  row48('.......YKrprrRoRKDRRwwwRwwwRwwwK..gYK.........g'), // 12
  row48('........YKRRRrDDKDRRRRRRRRRRRRRK..YK..........g'), // 13
  row48('.........YKDDDDDDDDDDDDDDDDDDDDDKYK...........g'), // 14
  row48('..........KDDDDDDDDDDDDDDDDDDDDDKK............g'), // 15
  row48('..........KDDDDDDDDDDDDDDDDDDDDDDK............g'), // 16
  row48('..........KDDDDDDDDDDDDDDDDDDDDDDDK...........g'), // 17
  row48('..........KDDDDDDDDDDDDDDDDDDDDDDDDK..........g'), // 18
  row48('..........KKDDDDDDDDDDDDDDDDDDDDDDDDK.........g'), // 19
  row48('...g......KKKKKKKKKKKKKKKKKKKKKKKKKKK.........g'), // 20
  row48('...g.....K..K..K..K..K..K..K..K..K..K.........g'), // 21
  row48('...g....K..K..K..K..K..K..K..K..K..K..K.......g'), // 22
  row48('...g...K..K..K..K..K..K..K..K..K..K....K......g'), // 23
  row48('...g..K..K..K..K..K..K..K..K..K..K......K.....g'), // 24
  row48('...g.K..K..K..K..K..K..K..K..K..K........K....g'), // 25
  row48('...gK..K..K..K..K..K..K..K..K..K..........K...g'), // 26
  WEB_H,                                                    // 27
  row48('...K..K..K..K..K..K..K..K..K..K............K..g'), // 28
  row48('..K..K..K..K..K..K..K..K..K..K..............K.g'), // 29
  row48('.K..K..K..K..K..K..K..K..K..K................Kg'), // 30
  row48('K..K..K..K..K..K..K..K..K..K..................g'), // 31
  row48('K.K..K..K..K..K..K..K..K..K..K................g'), // 32
  row48('YK..K..K..K..K..K..K..K..K..K.................g'), // 33
  WEB_H,                                                    // 34
  row48('YKK.K..K..K..K..K..K..K..K..K..g..............g'), // 35
  row48('YYK..K..K..K..K..K..K..K..K..K.g..............g'), // 36
  row48('.YK..K..K..K..K..K..K..K..K..K.g..............g'), // 37
  row48('..YK.K..K..K..K..K..K..K..K..K.g..............g'), // 38
  row48('...YKK..K..K..K..K..K..K..K..K.g..............g'), // 39
  WEB_H,                                                    // 40
  row48('....YK..K..K..K..K..K..K..K..K.g..............g'), // 41
  row48('.....YK..K..K..K..K..K..K..K.K.g..............g'), // 42
  row48('......YK.K..K..K..K..K..K..K.K.g..............g'), // 43
  row48('.......YKK..K..K..K..K..K..K.K.g..............g'), // 44
  row48('........YKK.K..K..K..K..K..K.K.g..............g'), // 45
  row48('.........YKKK.KK.KK.KK.KK.KK.K.g..............g'), // 46
  row48('...g..........g.........g.........g..........g'), // 47
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// WEB CAST. Body raised, abdomen high. Pure-white grid lines (rows AND
// columns) emanate outward from the spider in a perfect spreadsheet
// pattern. Abdomen cells flash GREEN ("OK"). Eyes wide open, eight legs
// raised symmetrically.
const SPECIAL: readonly string[] = [
  row48('o.....o.....o.....o.....o.....o.....o.....o....'), //  0
  row48('oooooooooooooooooooooooooooooooooooooooooooooooo'), //  1
  row48('o.....o.....o.....o.....o.....o.....o.....o....'), //  2
  row48('o.....o.....o.....KKKKKKKKKKKK.o.....o.....o....'), //  3
  row48('o.....o.....o....KDDDDDDDDDDDDK.o....o.....o....'), //  4
  row48('YK....o.....o...KDGGGgGGGgGGGgGK.....o.....o..YK'), //  5
  row48('YKoooooooooooo..KDGKGgGKGgGKGgGGKoooooooooooooYK'), //  6
  row48('.YK...o.....o...KDGGGgGGGgGGGgGGKo....o.....YK.o'), //  7
  row48('..YK..o.....o..KDgDgDgDgDgDgDgDgDK....o....YK..o'), //  8
  row48('ooYKoooooooooooKDGKGgGKGgGKGgGGGGKooooooooYKoooo'), //  9
  row48('o..YK.o.....prKKDgDgDgDgDgDgDgDgDK.o.....YK..o..'), // 10
  row48('o...YKoooorRoRDKDGGGgGGGgGGGgGGGGKoooooYKoooo..o'), // 11
  row48('o....YK..rRRRrDKDgDgDgDgDgDgDgDgDK.o..YK.....o..'), // 12
  row48('o.....YKprrDDDDKDDDDDDDDDDDDDDDDDDK.YK........o.'), // 13
  row48('oooooooKDDDDDDDDDDDDDDDDDDDDDDDDDDKKoooooooooooo'), // 14
  row48('o.....KDDDDDDDDDDDDDDDDDDDDDDDDDDDDK..o.......o.'), // 15
  row48('o....KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK.o.......o.'), // 16
  row48('o....KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK.o.......o.'), // 17
  row48('oooooKKDDDDDDDDDDDDDDDDDDDDDDDDDDDDDKoooooooooooo'), // 18
  row48('o.....KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..o.......o.'), // 19
  row48('o.....o.....o.....o.....o.....o.....o.....o....'), // 20
  row48('YK....o.....o...K..K..K..K..K..K..K..o..o..o.YK'), // 21
  row48('.YKoooooooooooK..K..K..K..K..K..K..K.ooooooooYK.'), // 22
  row48('..YK..o.....K..K..K..K..K..K..K..K..o....o.YK..o'), // 23
  row48('...YK.o....K..K..K..K..K..K..K..K..K.o..YK....o.'), // 24
  row48('....YKooooK..K..K..K..K..K..K..K..K..ooYKooooooo'), // 25
  row48('.....YK..K..K..K..K..K..K..K..K..K..o.YK.....o..'), // 26
  WEB_H,                                                    // 27
  row48('o....YK.K..K..K..K..K..K..K..K..K..o.YK......o.'), // 28
  row48('oooooKoooooooooooooooooooooooooooooooKoooooooooo'), // 29
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 30
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 31
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 32
  WEB_H,                                                    // 33
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 34
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 35
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 36
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 37
  row48('oooooKoooooooooooooooooooooooooooooooKoooooooooo'), // 38
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 39
  WEB_H,                                                    // 40
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 41
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 42
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 43
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 44
  row48('oooooKoooooooooooooooooooooooooooooooKoooooooooo'), // 45
  row48('o....K.o.....o.....o.....o.....o.....K.......o.'), // 46
  row48('o....o.....o.....o.....o.....o.....o.....o....o'), // 47
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Body collapsed near the bottom, legs curled inward toward the body.
// Abdomen DIM (only D/M shadow tones, no white cells, no green/red). Eyes
// reduced to dark slits (K only).
const DEFEAT: readonly string[] = [
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,   //  0- 7
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,   //  8-15
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,   // 16-23
  EMPTY, EMPTY, EMPTY,                                      // 24-26
  row48('................................................'), // 27
  row48('...........KKKK..............................KK'), // 28
  row48('..........KDDDDKKKKKK......................KK..'), // 29
  row48('.........KDDDDDDDDDDKKKKK..............KKKK....'), // 30
  row48('........KKDDMMDDDDDDDDDDKK..........KKDDDD......'), // 31
  row48('.......KKDDMMMDDDDDDDDDDDDKK....KKDDDDDD........'), // 32
  row48('......KKDDMMMMMDDDDDDDDDDDDDDKKDDDDDDDDD........'), // 33
  row48('.....KKDDDMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDD.......'), // 34
  row48('.....KDDDDMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDK.....'), // 35
  row48('....KDDDDDMMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDK....'), // 36
  row48('....KDDDDDDMMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDK...'), // 37
  row48('....KDDDDDDDMMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDK..'), // 38
  row48('....KDDDDDDDDMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDDK.'), // 39
  row48('....KDDDDDDDDDMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDDDK'), // 40
  row48('....KKDDDDDDDDDMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDDK.'), // 41
  row48('.....KKDDDDDDDDDMMMMDDDDDDDDDDDDDDDDDDDDDDDDDK..'), // 42
  row48('......KKDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK...'), // 43
  row48('........KKKDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK.....'), // 44
  row48('..........KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.......'), // 45
  EMPTY,                                                    // 46
  EMPTY,                                                    // 47
];

const POSES: Record<ActionState, readonly string[]> = {
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
      `[spreadsheet-spider] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[spreadsheet-spider] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function SpreadsheetSpiderSprite({
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
    id: 'spreadsheet-spider',
    name: '試算表蜘蛛',
    englishName: 'Spreadsheet Spider',
    role: 'generic',
    tier: 'major',
    description: '腹部是 Excel 試算表的蜘蛛，腳尖鉛筆狀，吐出格線網。',
  },
  Sprite: SpreadsheetSpiderSprite,
};

export default character;
