import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — fuzzy black-purple spider body, yellow predator eyes with red
// pupils, small white fangs, plus per-tool accent colors. Light source: UL.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#1c1917', // outline / deep body shadow
  D: '#44403c', // body shadow
  M: '#78716c', // body mid (fuzz highlight)
  P: '#581c87', // purple body highlight
  Y: '#fde047', // eye highlight
  y: '#facc15', // eye mid
  R: '#dc2626', // red pupil / tie red
  r: '#991b1b', // tie red shadow
  B: '#1d4ed8', // tie blue
  b: '#1e3a8a', // tie blue shadow
  w: '#e2e8f0', // fangs / business cards / paper light
  W: '#ffffff', // bright white (web / cards highlight)
  s: '#94a3b8', // smartphone body
  S: '#475569', // smartphone shadow
  c: '#0ea5e9', // smartphone screen
  p: '#1e293b', // pen barrel dark
  t: '#a16207', // latte cup brown
  T: '#f5deb3', // latte foam
  o: '#7c2d12', // briefcase dark
  O: '#c2410c', // briefcase mid
  g: '#16a34a', // headset/calendar accent green
  G: '#22c55e', // calendar highlight
  l: '#fef9c3', // contract paper light
  L: '#facc15', // contract seal yellow
};

const W = 48;

// Each row below is exactly 48 chars. Layout convention:
//   cols  0..12  : left margin / left arms + tools
//   cols 13..34  : body (22 cells wide, dome+eyes+belly+tie)
//   cols 35..47  : right margin / right arms + tools (13 cols)
// Note: 13 + 22 + 13 = 48.

// Helper: assertion-safe row builder. Centers a body segment of width 22 at
// columns 13..34 with a left prefix of width 13 and a right suffix of width 13.
function row(left: string, body: string, right: string): string {
  if (left.length !== 13 || body.length !== 22 || right.length !== 13) {
    throw new Error(
      `[recruiter-spider] row assembly: lens ${left.length}/${body.length}/${right.length}, want 13/22/13`,
    );
  }
  return left + body + right;
}

// Empty band lines used in many places.
const EMPTY = '.'.repeat(48);

// Body band silhouette (22 cells wide). Reused horizontally across poses.
// 9 rows tall: dome top -> eyes -> fangs -> belly -> base.
const BODY_DOME_0 = 'kkkkDDDDDDDDDDDDDDkkkk';
const BODY_DOME_1 = 'kDPPPMMMMMMMMMMMMPPDDk';
const BODY_EYES_2 = 'kDPMYyyYRRDDDDDPPMPPDk'; // left eye + part of head
const BODY_EYES_3 = 'kDPMYRRRYwwwDDDPMMMPDk'; // continuation + fangs ww
const BODY_HEAD_4 = 'kDDPMyYYywwDDDPMMMMPDk';
const BODY_HEAD_5 = 'kDDPPMyyywDDDPPMMMMPDk';
const BODY_HEAD_6 = 'kDDDPPMMMMMMDDPMMMPPDk';
const BODY_HEAD_7 = 'kkDDDDPPMMPPPPDPPPDDkk';
const BODY_BASE_8 = 'kkkkkDDDPPPPPPPDDDkkk.'; // tail edge

// Tie strip (22 cells wide), rows 9..12.
const BODY_TIE_0 = '...kRBBBBRRRRBBBBRk...';
const BODY_TIE_1 = '...kRBBBBRRRRBBBBRk...';
const BODY_TIE_2 = '....kRRBBBBBBBBRRk....';
const BODY_TIE_3 = '.....kkRRRRRRRRkk.....';

// Belly underside band 22 cells wide.
const BODY_BELLY_0 = '......kkkkkkkkk.......';
const BODY_BELLY_1 = '.....k.DDDDDDD.k......';
const BODY_BELLY_2 = '....kk.DPPPPPD.kk.....';
const BODY_BELLY_3 = '.....k.DPPPPPD..k.....';
const BODY_BELLY_4 = '.....k.DPPPPPD..k.....';
const BODY_BELLY_5 = '.....kkDDDDDDDkk......';
const BODY_BELLY_6 = '.....k.kkkkkkk.k......';

// Quick sanity for body templates above.
[
  BODY_DOME_0, BODY_DOME_1, BODY_EYES_2, BODY_EYES_3, BODY_HEAD_4,
  BODY_HEAD_5, BODY_HEAD_6, BODY_HEAD_7, BODY_BASE_8,
  BODY_TIE_0, BODY_TIE_1, BODY_TIE_2, BODY_TIE_3,
  BODY_BELLY_0, BODY_BELLY_1, BODY_BELLY_2, BODY_BELLY_3,
  BODY_BELLY_4, BODY_BELLY_5, BODY_BELLY_6,
].forEach((seg, i) => {
  if (seg.length !== 22) {
    throw new Error(`[recruiter-spider] body seg ${i} len=${seg.length}, want 22`);
  }
});

// Now build every pose using row(left, body, right). Each left/right is 13.

const IDLE_ROWS: readonly string[] = [
  EMPTY, // 0
  row('.............', '......................', '.........lLll'), // 1 contract scroll right
  row('...sSs.......', '......................', '..........lll'), // 2 phone left
  row('....s........', '......................', '...........l.'), // 3
  row('....M........', '......................', '............w'), // 4
  row('..tTt........', '......................', '............w'), // 5 latte
  row('...tt..M.....', '......................', '...........MM'), // 6
  row('....p...M....', '......................', '..........M..'), // 7 pen
  row('...pPp...MM..', '......................', '.........MM.g'), // 8
  row('....p......MM', '......................', '.......MMM.gG'), // 9 headset
  row('.............', BODY_DOME_0, '..........gg.'), // 10
  row('.............', BODY_DOME_1, '.............'), // 11
  row('.............', BODY_EYES_2, '.............'), // 12
  row('.............', BODY_EYES_3, '.............'), // 13
  row('.............', BODY_HEAD_4, '.............'), // 14
  row('.............', BODY_HEAD_5, '.............'), // 15
  row('.............', BODY_HEAD_6, '.............'), // 16
  row('.............', BODY_HEAD_7, '.............'), // 17
  row('.............', BODY_BASE_8, '.............'), // 18
  row('.............', BODY_TIE_0, '.............'), // 19
  row('.............', BODY_TIE_1, '.............'), // 20
  row('.............', BODY_TIE_2, '.............'), // 21
  row('.............', BODY_TIE_3, '.............'), // 22
  row('.............', BODY_BELLY_0, '.............'), // 23
  row('...wW........', BODY_BELLY_1, '.........oOOo'), // 24 cards / briefcase
  row('...wWw.......', BODY_BELLY_2, '.........oOOO'), // 25
  row('...wWw.......', BODY_BELLY_3, '..........oOO'), // 26
  row('...wWw.......', BODY_BELLY_4, '...........oo'), // 27
  row('....ww.......', BODY_BELLY_5, '.............'), // 28
  row('.............', BODY_BELLY_6, '.............'), // 29
  // Spider legs spread out below
  row('....k........', '..k........k..........', '....k........'), // 30
  row('.....k.......', '..k........k..........', '.....k.......'), // 31
  row('......k......', '..k........k..........', '......k......'), // 32
  row('.......k.....', '..k........k..........', '.......k.....'), // 33
  row('........k....', '..k........k..........', '........k....'), // 34
  row('.........k...', '..k........k..........', '.........k...'), // 35
  row('..........k..', '..k........k..........', '..........k..'), // 36
  row('...........k.', '..k........k..........', '...........k.'), // 37
  row('............k', '..k........k..........', '............k'), // 38
  EMPTY, // 39
  EMPTY, // 40
  EMPTY, // 41
  EMPTY, // 42
  EMPTY, // 43
  EMPTY, // 44
  EMPTY, // 45
  EMPTY, // 46
  EMPTY, // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Front legs forward (left), back legs trailing. Body at same height; legs
// staggered to suggest stepping motion.
const WALK_ROWS: readonly string[] = [
  EMPTY, // 0
  row('.............', '......................', '.........lLll'), // 1
  row('...sSs.......', '......................', '..........lll'), // 2
  row('....s........', '......................', '...........l.'), // 3
  row('....M........', '......................', '............w'), // 4
  row('..tTt........', '......................', '............w'), // 5
  row('...tt..M.....', '......................', '...........MM'), // 6
  row('....p...M....', '......................', '..........M..'), // 7
  row('...pPp...MM..', '......................', '.........MM.g'), // 8
  row('....p......MM', '......................', '.......MMM.gG'), // 9
  row('.............', BODY_DOME_0, '..........gg.'), // 10
  row('.............', BODY_DOME_1, '.............'), // 11
  row('.............', BODY_EYES_2, '.............'), // 12
  row('.............', BODY_EYES_3, '.............'), // 13
  row('.............', BODY_HEAD_4, '.............'), // 14
  row('.............', BODY_HEAD_5, '.............'), // 15
  row('.............', BODY_HEAD_6, '.............'), // 16
  row('.............', BODY_HEAD_7, '.............'), // 17
  row('.............', BODY_BASE_8, '.............'), // 18
  row('.............', BODY_TIE_0, '.............'), // 19
  row('.............', BODY_TIE_1, '.............'), // 20
  row('.............', BODY_TIE_2, '.............'), // 21
  row('.............', BODY_TIE_3, '.............'), // 22
  row('.............', BODY_BELLY_0, '.............'), // 23
  row('...wW........', BODY_BELLY_1, '.........oOOo'), // 24
  row('...wWw.......', BODY_BELLY_2, '.........oOOO'), // 25
  row('...wWw.......', BODY_BELLY_3, '..........oOO'), // 26
  row('...wWw.......', BODY_BELLY_4, '...........oo'), // 27
  row('....ww.......', BODY_BELLY_5, '.............'), // 28
  row('.............', BODY_BELLY_6, '.............'), // 29
  // Walking legs (different stagger from IDLE)
  row('....k........', '..k........k..........', '.....k.......'), // 30
  row('....k........', '...k......k...........', '....k........'), // 31
  row('....kk.......', '....k....k............', '......k......'), // 32
  row('.....k.......', '.....k..k.............', '.......k.....'), // 33
  row('......k......', '......kk..............', '........k....'), // 34
  row('.......k.....', '......kk..............', '.........k...'), // 35
  row('........k....', '.....k..k.............', '..........k..'), // 36
  row('.........k...', '....k....k............', '...........k.'), // 37
  row('..........k..', '...k......k...........', '............k'), // 38
  EMPTY, // 39
  EMPTY, // 40
  EMPTY, // 41
  EMPTY, // 42
  EMPTY, // 43
  EMPTY, // 44
  EMPTY, // 45
  EMPTY, // 46
  EMPTY, // 47
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Four arms thrust forward LEFT all at once: smartphone, business cards,
// pen, contract scroll fly out as projectiles. Body leans left.
// Eyes brighter (BODY_EYES with extra Y).
const ATTACK_BODY_EYES_2 = 'kDPMYYYRRDDDDDDPPMPPDk';
const ATTACK_BODY_EYES_3 = 'kDPMYYRRYwwwDDDPMMMPDk';
[ATTACK_BODY_EYES_2, ATTACK_BODY_EYES_3].forEach((s) => {
  if (s.length !== 22) {
    throw new Error(`attack eye seg len=${s.length}, want 22`);
  }
});

const ATTACK_ROWS: readonly string[] = [
  EMPTY, // 0
  row('sSs..........', '......................', '....lLll.....'), // 1 phone projectile
  row('.s...........', '......................', '.....lll.....'), // 2 contract projectile
  row('sSs..........', '......................', '......l......'), // 3
  row('.s...........', '......................', '......w......'), // 4
  row('pPp..........', '......................', '......w......'), // 5 pen projectile
  row('.p...........', '......................', '............g'), // 6
  row('pPp.MM.......', '......................', '...........gG'), // 7
  row('.p...MM......', '......................', '..........gg.'), // 8
  row('wW....M......', BODY_DOME_0, '.............'), // 9 cards projectile
  row('wWw...M......', BODY_DOME_1, '.............'), // 10
  row('wWw....M.....', ATTACK_BODY_EYES_2, '.............'), // 11
  row('.ww..........', ATTACK_BODY_EYES_3, '.............'), // 12
  row('.............', BODY_HEAD_4, '.............'), // 13
  row('.............', BODY_HEAD_5, '.............'), // 14
  row('.............', BODY_HEAD_6, '.............'), // 15
  row('.............', BODY_HEAD_7, '.............'), // 16
  row('.............', BODY_BASE_8, '.............'), // 17
  row('.............', BODY_TIE_0, '.............'), // 18
  row('.............', BODY_TIE_1, '.............'), // 19
  row('.............', BODY_TIE_2, '.............'), // 20
  row('.............', BODY_TIE_3, '.............'), // 21
  row('.............', BODY_BELLY_0, '.............'), // 22
  row('.............', BODY_BELLY_1, '.........oOOo'), // 23
  row('.............', BODY_BELLY_2, '.........oOOO'), // 24
  row('.............', BODY_BELLY_3, '..........oOO'), // 25
  row('.............', BODY_BELLY_4, '...........oo'), // 26
  row('.............', BODY_BELLY_5, '.............'), // 27
  row('.............', BODY_BELLY_6, '.............'), // 28
  row('.............', '..k........k..........', '....k........'), // 29 legs (lifted left for thrust)
  row('.............', '..k........k..........', '.....k.......'), // 30
  row('.............', '..k........k..........', '......k......'), // 31
  row('.............', '..k........k..........', '.......k.....'), // 32
  row('.............', '..k........k..........', '........k....'), // 33
  row('.............', '..k........k..........', '.........k...'), // 34
  row('.............', '..k........k..........', '..........k..'), // 35
  row('.............', '..k........k..........', '...........k.'), // 36
  row('.............', '..k........k..........', '............k'), // 37
  EMPTY, // 38
  EMPTY, // 39
  EMPTY, // 40
  EMPTY, // 41
  EMPTY, // 42
  EMPTY, // 43
  EMPTY, // 44
  EMPTY, // 45
  EMPTY, // 46
  EMPTY, // 47
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Body shifted right (recoil), arms recoiled inward, eyes squinting (only y).
const HIT_BODY_EYES_2 = 'kDPMyyyyRRDDDDDPPMPPDk';
const HIT_BODY_EYES_3 = 'kDPMyyRRyDDDwwwPMMMPDk';
[HIT_BODY_EYES_2, HIT_BODY_EYES_3].forEach((s) => {
  if (s.length !== 22) {
    throw new Error(`hit eye seg len=${s.length}, want 22`);
  }
});

const HIT_ROWS: readonly string[] = [
  EMPTY, // 0
  EMPTY, // 1
  EMPTY, // 2
  EMPTY, // 3
  EMPTY, // 4
  row('.............', '......................', '......lLll...'), // 5 contract still right
  row('......sSs....', '......................', '.......lll...'), // 6 phone close
  row('.......s.....', '......................', '........l....'), // 7
  row('......tTt....', '......................', '.........w...'), // 8
  row('.......tt..M.', '......................', '.........w...'), // 9
  row('........p...M', '......................', '..........M..'), // 10 pen close
  row('.......pPp..M', '......................', '..........MMg'), // 11
  row('........p..MM', '......................', '.........MM.g'), // 12
  row('...wW......MM', BODY_DOME_0, '...........gG'), // 13 cards close
  row('...wWw.......', BODY_DOME_1, '..........gg.'), // 14
  row('...wWw.......', HIT_BODY_EYES_2, '.............'), // 15
  row('...wWw.......', HIT_BODY_EYES_3, '.............'), // 16
  row('....ww.......', BODY_HEAD_4, '.............'), // 17
  row('.............', BODY_HEAD_5, '.............'), // 18
  row('.............', BODY_HEAD_6, '.............'), // 19
  row('.............', BODY_HEAD_7, '.............'), // 20
  row('.............', BODY_BASE_8, '.............'), // 21
  row('.............', BODY_TIE_0, '.............'), // 22
  row('.............', BODY_TIE_1, '.............'), // 23
  row('.............', BODY_TIE_2, '.............'), // 24
  row('.............', BODY_TIE_3, '.............'), // 25
  row('.............', BODY_BELLY_0, '.............'), // 26
  row('.............', BODY_BELLY_1, '......oOOo...'), // 27
  row('.............', BODY_BELLY_2, '......oOOO...'), // 28
  row('.............', BODY_BELLY_3, '.......oOO...'), // 29
  row('.............', BODY_BELLY_4, '........oo...'), // 30
  row('.............', BODY_BELLY_5, '.............'), // 31
  row('.............', BODY_BELLY_6, '.............'), // 32
  // Legs jerked, splayed unevenly
  row('...kkkk......', '..k........k..........', '....kkkk.....'), // 33
  row('...k..kk.....', '...k......k...........', '....kk..k....'), // 34
  row('...k....kk...', '....k....k............', '....k....k...'), // 35
  row('...k......kk.', '.....k..k.............', '....k.....k..'), // 36
  row('...k........k', '......kk..............', '....k......k.'), // 37
  row('...kkkkkkkkkk', '......kk..............', '....kkkkkkkkk'), // 38
  EMPTY, // 39
  EMPTY, // 40
  EMPTY, // 41
  EMPTY, // 42
  EMPTY, // 43
  EMPTY, // 44
  EMPTY, // 45
  EMPTY, // 46
  EMPTY, // 47
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// WEB ATTACK. Eight arms outstretched casting a paper-resume web. A white
// 4-step grid of W's surrounds the body. Eyes bright (full Y).
const SPECIAL_BODY_EYES_2 = 'kDPMYYYYRRDDDDDPPMPPDk';
const SPECIAL_BODY_EYES_3 = 'kDPMYYRRYwwwDDDPMMMPDk';
[SPECIAL_BODY_EYES_2, SPECIAL_BODY_EYES_3].forEach((s) => {
  if (s.length !== 22) {
    throw new Error(`special eye seg len=${s.length}, want 22`);
  }
});

// 48-char web bands (alternating pattern).
const WEB_A = 'W...W...W...W...W...W...W...W...W...W...W...W...';
const WEB_B = '..W...W...W...W...W...W...W...W...W...W...W...W.';
[WEB_A, WEB_B].forEach((s) => {
  if (s.length !== 48) {
    throw new Error(`web band len=${s.length}, want 48`);
  }
});

const SPECIAL_ROWS: readonly string[] = [
  WEB_A, // 0
  WEB_B, // 1
  WEB_A, // 2
  WEB_B, // 3
  WEB_A, // 4
  WEB_B, // 5
  WEB_A, // 6
  WEB_B, // 7
  WEB_A, // 8
  // Body band rows (centered in middle of canvas).
  row('.............', BODY_DOME_0, '.............'), // 9
  row('.............', BODY_DOME_1, '.............'), // 10
  row('.............', SPECIAL_BODY_EYES_2, '.............'), // 11
  row('.............', SPECIAL_BODY_EYES_3, '.............'), // 12
  row('.............', BODY_HEAD_4, '.............'), // 13
  row('.............', BODY_HEAD_5, '.............'), // 14
  row('.............', BODY_HEAD_6, '.............'), // 15
  row('.............', BODY_HEAD_7, '.............'), // 16
  row('.............', BODY_BASE_8, '.............'), // 17
  row('.............', BODY_TIE_0, '.............'), // 18
  row('.............', BODY_TIE_1, '.............'), // 19
  row('.............', BODY_TIE_2, '.............'), // 20
  row('.............', BODY_TIE_3, '.............'), // 21
  row('.............', BODY_BELLY_0, '.............'), // 22
  row('.............', BODY_BELLY_1, '.............'), // 23
  row('.............', BODY_BELLY_2, '.............'), // 24
  row('.............', BODY_BELLY_3, '.............'), // 25
  row('.............', BODY_BELLY_4, '.............'), // 26
  row('.............', BODY_BELLY_5, '.............'), // 27
  row('.............', BODY_BELLY_6, '.............'), // 28
  // Outstretched arms reaching to web nodes
  row('.k..........k', '..k........k..........', 'k..........k.'), // 29
  row('..k........k.', '..k........k..........', '.k........k..'), // 30
  row('...k......k..', '..k........k..........', '..k......k...'), // 31
  row('....k....k...', '..k........k..........', '...k....k....'), // 32
  row('.....k..k....', '..k........k..........', '....k..k.....'), // 33
  WEB_B, // 34
  WEB_A, // 35
  WEB_B, // 36
  WEB_A, // 37
  WEB_B, // 38
  WEB_A, // 39
  WEB_B, // 40
  WEB_A, // 41
  WEB_B, // 42
  WEB_A, // 43
  WEB_B, // 44
  WEB_A, // 45
  WEB_B, // 46
  WEB_A, // 47
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Body crumpled flat near the bottom of canvas, arms collapsed inward and
// limp. Eyes closed (just dark slits).
const DEFEAT_EYES_2 = 'kDPMkkkkkkDDDDDPPMPPDk'; // closed eye slits
const DEFEAT_EYES_3 = 'kDPMkkkkkwwwDDDPMMMPDk';
[DEFEAT_EYES_2, DEFEAT_EYES_3].forEach((s) => {
  if (s.length !== 22) {
    throw new Error(`defeat eye seg len=${s.length}, want 22`);
  }
});

// 48-char tools-scattered band (used at very bottom).
const DEFEAT_TOOLS = '.kttkpllllksksklllllkllllkOOOOkggggkk...........';
const DEFEAT_TOOLS_2 = '.kTTtkllllksksklLllLkllllkOoOOkgGggk............';
const DEFEAT_TOOLS_3 = '.kttpkllllkSkSklllllkllllkOoOOkggggk............';
const DEFEAT_TOOLS_4 = '.kpppkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk............';
[DEFEAT_TOOLS, DEFEAT_TOOLS_2, DEFEAT_TOOLS_3, DEFEAT_TOOLS_4].forEach((s, i) => {
  if (s.length !== 48) {
    throw new Error(`defeat tools band ${i} len=${s.length}, want 48`);
  }
});

const DEFEAT_ROWS: readonly string[] = [
  EMPTY, // 0
  EMPTY, // 1
  EMPTY, // 2
  EMPTY, // 3
  EMPTY, // 4
  EMPTY, // 5
  EMPTY, // 6
  EMPTY, // 7
  EMPTY, // 8
  EMPTY, // 9
  EMPTY, // 10
  EMPTY, // 11
  EMPTY, // 12
  EMPTY, // 13
  EMPTY, // 14
  EMPTY, // 15
  EMPTY, // 16
  EMPTY, // 17
  EMPTY, // 18
  EMPTY, // 19
  EMPTY, // 20
  EMPTY, // 21
  EMPTY, // 22
  EMPTY, // 23
  EMPTY, // 24
  EMPTY, // 25
  EMPTY, // 26
  EMPTY, // 27
  // Crumpled body rows, vertically squashed.
  row('.............', BODY_DOME_0, '.............'), // 28
  row('.............', BODY_DOME_1, '.............'), // 29
  row('.............', DEFEAT_EYES_2, '.............'), // 30
  row('.............', DEFEAT_EYES_3, '.............'), // 31
  row('.............', BODY_HEAD_5, '.............'), // 32
  row('.............', BODY_HEAD_6, '.............'), // 33
  row('.............', BODY_HEAD_7, '.............'), // 34
  row('.............', BODY_BASE_8, '.............'), // 35
  row('.............', BODY_TIE_0, '.............'), // 36
  row('.............', BODY_TIE_3, '.............'), // 37
  // Arms collapsed inward in a tight ring around the body
  row('....kkkkkkkkk', 'kkkkkkkkkkkkkkkkkkkkkk', 'kkkkkkkkk....'), // 38
  DEFEAT_TOOLS, // 39
  DEFEAT_TOOLS_2, // 40
  DEFEAT_TOOLS_3, // 41
  DEFEAT_TOOLS_4, // 42
  EMPTY, // 43
  EMPTY, // 44
  EMPTY, // 45
  EMPTY, // 46
  EMPTY, // 47
];

const POSES: Record<ActionState, readonly string[]> = {
  idle: IDLE_ROWS,
  walk: WALK_ROWS,
  attack: ATTACK_ROWS,
  hit: HIT_ROWS,
  special: SPECIAL_ROWS,
  defeat: DEFEAT_ROWS,
};

function assertGrid(name: string, rows: readonly string[]): void {
  if (rows.length !== W) {
    throw new Error(
      `[recruiter-spider] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[recruiter-spider] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function RecruiterSpiderSprite({
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
    id: 'recruiter-spider',
    name: '獵頭蜘蛛',
    englishName: 'Recruiter Spider',
    role: 'job-hunting',
    tier: 'major',
    topic: 'job-hunting',
    description: '八臂蜘蛛，每隻手持一樣求職工具，黃眼睛紅瞳孔。',
  },
  Sprite: RecruiterSpiderSprite,
};

export default character;
