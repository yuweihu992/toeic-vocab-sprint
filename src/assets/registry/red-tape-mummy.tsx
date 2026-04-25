import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — humanoid mummy entirely wrapped in red bureaucratic tape with
// yellowed legal-document strips tangled in. Glowing yellow eyes peek through.
// Light source: upper-left.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#1c1917', // darkest outline / gap (where tape doesn't cover)
  K: '#44403c', // dark gap (interior shadow)
  S: '#450a0a', // deep red shadow
  d: '#7f1d1d', // red ribbon shadow
  D: '#991b1b', // red ribbon mid-shadow
  r: '#b91c1c', // red ribbon mid
  R: '#dc2626', // red ribbon highlight
  H: '#ef4444', // red ribbon brightest highlight
  p: '#fef3c7', // yellowed paper light
  P: '#fde68a', // yellowed paper shadow
  a: '#d6d3d1', // aged paper edge
  i: '#1c1917', // ink line on paper
  e: '#facc15', // glowing yellow eye mid
  E: '#fde047', // glowing yellow eye bright
  W: '#ffffff', // eye core white-hot highlight
};

const W = 48;

// Helper layout used throughout the file.
// Canvas indices 0..47.  Each row below is exactly 48 chars.  We build each
// pose as a literal grid; all six poses are visually distinct.

// ── IDLE ────────────────────────────────────────────────────────────────────
// Classic mummy posture: arms raised forward (extending LEFT), stiff body,
// fully wrapped in red tape with yellowed paper strips, glowing eyes.
const IDLE: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '...............kkkkkkkkkkkkkk...................', //  2
  '..............kdDrrRRrRRrrRrDdk.................', //  3
  '.............kdDrrRRRrPPpRrRrDdk................', //  4
  '............kdDrrRRRRrpPpRRRrrDdk...............', //  5
  '...........kdDrrRRrRPpaPpRRrrRrDdk..............', //  6
  '...........kdDrrRRRpaaPpRRrRrRDdk...............', //  7
  '...........kdDrRRrPpaiaPpRRrRRrDdk..............', //  8
  '...........kdDrkeEeRpiaiipRkeEeDdk..............', //  9
  '...........kdDrkEEWeRiiiiRkEEWedk...............', // 10
  '...........kdDrkeEeRRppppRRkeEeDdk..............', // 11
  '...........kdDrrRRrRrPpPPpRRrRRrDdk.............', // 12
  '...........kdDrrRRrPaPPaPPaPRRrrRDdk............', // 13
  '............kdDrrPaaiaaaaaiPRRrRrDdk............', // 14
  '............kdDrPaiiaaiiaaaPRRrRRdk.............', // 15
  '............kdDrPPaaaiiaaaPPRrrRrdk.............', // 16
  '.............kdDrrPPaaaaPPRRrRrDdk..............', // 17
  '.............kdDrrRRPPPPRRrRrRDdk...............', // 18
  '............kdDrrRRrRRrRRrRRrRrDdk..............', // 19
  '..........kdDrrRRrPpPpPpPpRRrRRrRDdk............', // 20
  '.........kdDrrRRrPpaiaiaipPpRRrRrDdk............', // 21
  '........kdDrrRRRPpaiiiiiiapPRRrRRrDdk...........', // 22
  '.......kdDrrRRrRPpaiiiaiiapPRRrRRrRDdk..........', // 23
  '......kdDrrRRrRrPpaiaiiaiapPRRrRRrRrDdk.........', // 24
  '.....kdDrrRRrPaPpaiaaaaiapPaPRRrRRrRrDdk........', // 25
  '....kdDrrRRrPpaaPpaiaiaiapPaaPRRrRRrRrDdk.......', // 26
  '...kdDrrRRrPpaiapPaiiiiiapPaiapRRrRRrRrDdk......', // 27
  '..kdDrrRRrPpaiaaPpaaaaaapPaaiapRRrRRrRrDdk......', // 28
  '.kdDrrRRrPpaaaaPpaiaaaiapPaaaapRRrRRrRrDdk......', // 29
  '.kdDrrRRrPpaaiaPpaaaaaapPaiaaapRRrRRrRrDdk......', // 30
  '.kdDrrRRRrPpaaPpRRRrPpaaapPRRrRRrRrDdk..........', // 31
  '..kdDrrRRRrPaPpRRRrPpaaPpRrRRrRrDdk.............', // 32
  '...kdDrrRRRrRRRrRRRrPaPpRRrRRrRDdk..............', // 33
  '....kdDrrRRRRrRRRrRRRrRRrRRrRRDdk...............', // 34
  '.....kdDrrRRRRrRRRrRRRrRRrRRrDdk................', // 35
  '......kdDrrRRRRrRRRrRRRrRRrRDdk.................', // 36
  '.......kdDrrRRRRrRRRrRRRrRRrDdk.................', // 37
  '........kdDrrRRRRrPaPpRrRRrRDdk.................', // 38
  '........kdDrrRRRRrPpaPpRRrRDdk..................', // 39
  '........kdDrrRRRRrPpaiaPpRRDdk..................', // 40
  '........kdDrrRRRRrPaaaaPpRRDdk..................', // 41
  '........kdDrrRRRRrPpaaPPRRrDdk..................', // 42
  '........kdDrrRRRRrRRRrRRrRDdk...................', // 43
  '........kdDrrRRRRrRRRrRRrDdk....................', // 44
  '........kkkkkkkkkkkkkkkkkkkk....................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Stiff lurching forward LEFT, body tilted slightly, loose tape ends trail
// behind to the right. Legs split (one ahead, one behind).
const WALK: readonly string[] = [
  '................................................', //  0
  '..............kkkkkkkkkkkkkk....................', //  1
  '.............kdDrrRRrRRrrRrDdk..................', //  2
  '............kdDrrRRRrPPpRrRrDdk.................', //  3
  '...........kdDrrRRRRrpPpRRRrrDdk................', //  4
  '..........kdDrrRRrRPpaPpRRrrRrDdk...............', //  5
  '..........kdDrrRRRpaaPpRRrRrRDdk................', //  6
  '..........kdDrRRrPpaiaPpRRrRRrDdk...............', //  7
  '..........kdDrkeEeRpiaiipRkeEeDdk...............', //  8
  '..........kdDrkEEWeRiiiiRkEEWedk................', //  9
  '..........kdDrkeEeRRppppRRkeEeDdk...............', // 10
  '..........kdDrrRRrRrPpPPpRRrRRrDdk..............', // 11
  '..........kdDrrRRrPaPPaPPaPRRrrRDdk.............', // 12
  '...........kdDrrPaaiaaaaaiPRRrRrDdk.............', // 13
  '...........kdDrPaiiaaiiaaaPRRrRRdk..............', // 14
  '...........kdDrPPaaaiiaaaPPRrrRrdk..............', // 15
  '............kdDrrPPaaaaPPRRrRrDdk.rR............', // 16
  '............kdDrrRRPPPPRRrRrRDdk.rRr............', // 17
  '...........kdDrrRRrRRrRRrRRrRrDdk.rR............', // 18
  '.........kdDrrRRrPpPpPpPpRRrRRrRDdkr............', // 19
  '........kdDrrRRrPpaiaiaipPpRRrRrDdk.............', // 20
  '.......kdDrrRRRPpaiiiiiiapPRRrRRrDdk............', // 21
  '......kdDrrRRrRPpaiiiaiiapPRRrRRrRDdk...........', // 22
  '.....kdDrrRRrRrPpaiaiiaiapPRRrRRrRrDdk..........', // 23
  '....kdDrrRRrPaPpaiaaaaiapPaPRRrRRrRrDdk.........', // 24
  '...kdDrrRRrPpaaPpaiaiaiapPaaPRRrRRrRrDdk........', // 25
  '..kdDrrRRrPpaiapPaiiiiiapPaiapRRrRRrRrDdk.rR....', // 26
  '.kdDrrRRrPpaiaaPpaaaaaapPaaiapRRrRRrRrDdk.rRr...', // 27
  'kdDrrRRrPpaaaaPpaiaaaiapPaaaapRRrRRrRrDdk.rR....', // 28
  'kdDrrRRrPpaaiaPpaaaaaapPaiaaapRRrRRrRrDdkr......', // 29
  'kdDrrRRRrPpaaPpRRrPpaaPpRRrRRrRrrDdk............', // 30
  '.kdDrrRRRrPaPpRRrPaPpRRrRRrRrDdk................', // 31
  '..kdDrrRRRrRrRRRrRRrRRrRRrRrDdk.................', // 32
  '..kdDrrRRRRrRRRrRRRrRRrRRrRrDdk.................', // 33
  '..kdDrrRRRRrRRRrRRrRRrRRrRrDdk..................', // 34
  '..kdDrrRRrPaPpRRrRRrPaPpRRrDdk..................', // 35
  '..kdDrrRRrPpaPpRRrRRrPpaPpRDdk..................', // 36
  '..kdDrrRRrPaaaPRRrRRrPaaaPRDdk..................', // 37
  '..kdDrrRRrPpaiaPRrRRrPpaiaPDdk..................', // 38
  '..kdDrrRRrPaaaaPRrRRrPaaaaPDdk..................', // 39
  '..kdDrrRRrPpaaPPRrRRrPpaaPPDdk..................', // 40
  '..kdDrrRRrRRrRRrRRrRRrRRrRrDdk..................', // 41
  '..kdDrrRRrRRrRRrRRrRRrRRrrDdk...................', // 42
  '..kkkkkkkkkkkk....kkkkkkkkkkk...................', // 43
  '..kdDrrRRrRrDdk...kdDrrRRrRrDk..................', // 44
  '..kkkkkkkkkkkk....kkkkkkkkkkk...................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Front arm extended LEFT, red tape lashes out like a long whip across the
// canvas. Eyes blazing brighter (extra bright pixels).
const ATTACK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '..................kkkkkkkkkkkkkk................', //  2
  '.................kdDrrRRrRRrrRrDdk..............', //  3
  '................kdDrrRRRrPPpRrRrDdk.............', //  4
  '...............kdDrrRRRRrpPpRRRrrDdk............', //  5
  '..............kdDrrRRrRPpaPpRRrrRrDdk...........', //  6
  '..............kdDrkeEEeRpaaPpRkeEEeDdk..........', //  7
  '..............kdDrkEWWeRiaiiRkEWWeDdk...........', //  8
  '..............kdDrkeEEeRppppRkeEEeDdk...........', //  9
  '..............kdDrrRRrRrPpPPpRRrRRrDdk..........', // 10
  '..............kdDrrRRrPaPPaPPaPRRrrRDdk.........', // 11
  '...............kdDrrPaaiaaaaaiPRRrRrDdk.........', // 12
  '...............kdDrPaiiaaiiaaaPRRrRRdk..........', // 13
  '...............kdDrPPaaaiiaaaPPRrrRrdk..........', // 14
  '................kdDrrPPaaaaPPRRrRrDdk...........', // 15
  '...................kdDrrRRPPPRRrRrDdk...........', // 16
  'rrrrrrrrrrrrrrrrrrrkdDrrRRrRRrRRrRrDdk..........', // 17
  'RRRRRRRRRRRRRRRRRRrkddrRRrRRrRRrRRrDdk..........', // 18
  'HHHHHHHHHHHHHHHHHHrkdrrRpPPpRRrRRrRRrDdk........', // 19
  'RRRRRRRRRRRRRRRRRRrkdDrrRpaiapPpRRrRRrDdk.......', // 20
  'rrrrrrrrrrrrrrrrrrrkdDrrRpaiiapPRRrRRrDdk.......', // 21
  '...................kdDrrRpaiiaiiapRRrRRrDdk.....', // 22
  '..................kdDrrRRpaiaiiaipRRrRRrRDdk....', // 23
  '.................kdDrrRRrPpaaaapPRRrRRrRRrDdk...', // 24
  '................kdDrrRRrPpaiaiapPRRrRRrRRrrDdk..', // 25
  '...............kdDrrRRrPpaiiiiapPRRrRRrRRrRrDdk.', // 26
  '..............kdDrrRRrPpaiaaaiaPRRrRRrRRrRRrDdk.', // 27
  '.............kdDrrRRrPpaaaaaaaPRRrRRrRRrRRrRDdk.', // 28
  '............kdDrrRRrPpaaiapPaPRRrRRrRRrRRrRrDdk.', // 29
  '...........kdDrrRRRrPaPpRRRrPpRRrRRrRRrRRrRrDdk.', // 30
  '............kdDrrRRRrRRrRRrRRrRRrRRrRRrRrDdk....', // 31
  '............kdDrrRRRrRRRrRRrRRrRRrRRrRrDdk......', // 32
  '............kdDrrRRRRrRRRrRRrRRrRRrRRrDdk.......', // 33
  '............kdDrrRRRRrRRRrRRrRRrRRrRDdk.........', // 34
  '............kdDrrRRRRrPaPpRRrRRrRRrDdk..........', // 35
  '............kdDrrRRRRrPpaPpRRrRRrRDdk...........', // 36
  '............kdDrrRRRRrPpaiaPpRRrRDdk............', // 37
  '............kdDrrRRRRrPaaaaPpRRrDdk.............', // 38
  '............kdDrrRRRRrPpaaPPRRrDdk..............', // 39
  '............kdDrrRRRRrRRRrRRrDdk................', // 40
  '............kdDrrRRRRrRRRrRRDdk.................', // 41
  '............kkkkkkkkkkkkkkkkkk..................', // 42
  '................................................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Body recoiling RIGHT with shock, tape unravels (loose strands flying off),
// paper strips dislodging. One eye dimmed (replaced with dark/dull pixels).
const HIT: readonly string[] = [
  '................................................', //  0
  '...r.....p..............................r......p', //  1
  '..rR....pPp.............................Rr....pP', //  2
  '...r.....p..............................r......p', //  3
  '................kkkkkkkkkkkkkk..................', //  4
  '...............kdDrrRRrRRrrRrDdk....rRr.........', //  5
  '..............kdDrrRRRrPPpRrRrDdk...rR..........', //  6
  '.............kdDrrRRRRrpPpRRRrrDdk..r...........', //  7
  '............kdDrrRRrRPpaPpRRrrRrDdk.............', //  8
  '............kdDrrRRRpaaPpRRrRrRDdk......a.......', //  9
  '............kdDrRRrPpaiaPpRRrRRrDdk....pPa......', // 10
  '............kdDrkddrRpiaiipRkeEeDdk....paap.....', // 11
  '............kdDrkddrRiiiiRkEEWedk......p..p.....', // 12
  '............kdDrkddrRRppppRRkeEeDdk....app......', // 13
  '............kdDrrRRrRrPpPPpRRrRRrDdk............', // 14
  '............kdDrrRRrPaPPaPPaPRRrrRDdk...........', // 15
  '.............kdDrrPaaiaaaaaiPRRrRrDdk...........', // 16
  '.............kdDrPaiiaaiiaaaPRRrRRdk............', // 17
  '.............kdDrPPaaaiiaaaPPRrrRrdk............', // 18
  '..............kdDrrPPaaaaPPRRrRrDdk........R....', // 19
  '..............kdDrrRRPPPPRRrRrRDdk.........rR...', // 20
  '.............kdDrrRRrRRrRRrRRrRrDdk.........Rr..', // 21
  '...........kdDrrRRrPpPpPpPpRRrRRrRDdk.......r...', // 22
  '..........kdDrrRRrPpaiaiaipPpRRrRrDdk...........', // 23
  '.........kdDrrRRRPpaiiiiiiapPRRrRRrDdk..........', // 24
  '........kdDrrRRrRPpaiiiaiiapPRRrRRrRDdk.........', // 25
  '.......kdDrrRRrRrPpaiaiiaiapPRRrRRrRrDdk........', // 26
  '......kdDrrRRrPaPpaiaaaaiapPaPRRrRRrRrDdk.......', // 27
  '.....kdDrrRRrPpaaPpaiaiaiapPaaPRRrRRrRrDdk......', // 28
  '....kdDrrRRrPpaiapPaiiiiiapPaiapRRrRRrRrDdk.....', // 29
  '...kdDrrRRrPpaiaaPpaaaaaapPaaiapRRrRRrRrDdk.....', // 30
  '..kdDrrRRrPpaaaaPpaiaaaiapPaaaapRRrRRrRrDdk.....', // 31
  '..kdDrrRRrPpaaiaPpaaaaaapPaiaaapRRrRRrRrDdk.....', // 32
  '..kdDrrRRRrPpaaPpRRRrPpaaapPRRrRRrRrDdk.........', // 33
  '...kdDrrRRRrPaPpRRRrPpaaPpRrRRrRrDdk............', // 34
  '....kdDrrRRRrRRRrRRRrPaPpRRrRRrRDdk.............', // 35
  '.....kdDrrRRRRrRRRrRRRrRRrRRrRRDdk..............', // 36
  '......kdDrrRRRRrRRRrRRRrRRrRRrDdk...............', // 37
  '.......kdDrrRRRRrRRRrRRRrRRrRDdk................', // 38
  '........kdDrrRRRRrRRRrRRRrRRrDdk................', // 39
  '.........kdDrrRRRRrPaPpRrRRrRDdk................', // 40
  '.........kdDrrRRRRrPpaPpRRrRDdk.................', // 41
  '.........kdDrrRRRRrPpaiaPpRRDdk.................', // 42
  '.........kdDrrRRRRrPaaaaPpRRDdk.................', // 43
  '.........kdDrrRRRRrPpaaPPRRrDdk.................', // 44
  '.........kkkkkkkkkkkkkkkkkkkkk..................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// TANGLE — body releases red tape that whirls in a vortex around the figure.
// Spiraling tape ribbons orbit, paper strips swirl, eyes blaze white-hot.
const SPECIAL: readonly string[] = [
  '....rrrrrrrrrrrrrrrr....rrrrrrrrrr...rrrrrr.....', //  0
  'rRrR................rRrR..........rRr.......rRr.', //  1
  'r..rRrrrrrrrrrrr....r..rRrrrrrrr....rRrrrr...rR.', //  2
  'r.rR...........rRr..r.rR.......rRr............rR', //  3
  'r.r.rrrrrrrrrr...rRrr.r..rrrrr....rRrrrrrrr...rR', //  4
  'r.r.r........rRr...r.rR.r...rR....rR.......rR.rR', //  5
  'r.r.rR........rR....rR.rR....rR..rR..........rRr', //  6
  'r.r..rR........rR....rR.rR....rR.rR...........r.', //  7
  'r.r...rR........rR....rR.rR....rR.rR..kkkkkkk.r.', //  8
  'r.r....rR........rR....rR.rR....rRrkdDrrRRrDdkr.', //  9
  'rR..rRr.rR........rR....rR.rR..rRr.kdrRrRRrDdk..', // 10
  '.rR..rRr.rRr.......rR....rR.rR.r.kdDrrRRrRRrDdk.', // 11
  '..rR..rRr..rRr.....rR.rRr.rR.r.kdDrrRRrRRrrRrDdk', // 12
  '...rR..rR...rR.....rR..rRr.r.kdDrkEWWeRPpPpRRrDk', // 13
  '....rR..rR...rR....rR....rkdDrkWWWWeRpaiapRRrRDk', // 14
  '....rR...rR..rR...rR....rRkdrkEWWeRRppppRkeEEeDk', // 15
  '...rR....rR...rR.rR....rRkdDrrRRrRrPpPPpRkEEWWDk', // 16
  '..rR....rR....rRr.rR..rRkdDrrRRrPaPPaPPaRkeEEedk', // 17
  '..rR....rR.....rRrR..rRkdDrrPaaiaaaaaiPRRrRrrDdk', // 18
  '...rR....rR.....rR.rRkdDrPaiiaaiiaaaPRRrRRrRDdk.', // 19
  '....rR....rR.....rRkdDrPPaaaiiaaaPPRrrRrRDdk....', // 20
  '....rR....rR..rRkdDrrPPaaaaPPRRrRrRDdk..........', // 21
  '....rR....rR.kdDrrRRrPPPPRRrRrRrDdk.....rR......', // 22
  '...rR....rR.kdDrrRRrRRrRRrRRrRrDdk.......rR.....', // 23
  '...rR...rR.kdDrrRRrPpPpPpPpRRrRRrDdk......rR....', // 24
  '..rR..rRr.kdDrrRRrPpaiaiaiPpRRrRrDdk.......rR...', // 25
  '.rR..rRr.kdDrrRRRPpaiiiiiiapPRRrRRDdk.......rRr.', // 26
  'rR..rRr.kdDrrRRrRPpaiiiaiiapPRRrRRrRDdk......rR.', // 27
  '.rRr.kdDrrRRrRrPpaiaiiaiapPRRrRRrRRDdk....rR....', // 28
  '..rkdDrrRRrPaPpaiaaaaiapPaPRRrRRrRRrDdk.rR......', // 29
  'kdDrrRRrPpaaPpaiaiaiapPaaPRRrRRrRRrrDdk.r.......', // 30
  'kdDrrRRrPpaiapPaiiiiiapPaiapRRrRRrRRrDdk........', // 31
  'kdDrrRRrPpaiaaPpaaaaaapPaaiapRRrRRrRRrDdk.......', // 32
  'kdDrrRRrPpaaaaPpaiaaaiapPaaaapRRrRRrRRrDdk......', // 33
  'kdDrrRRrPpaaiaPpaaaaaapPaiaaapRRrRRrRRrDdk......', // 34
  'kdDrrRRRrPpaaPpRRRrPpaaapPRRrRRrRRrDdk..........', // 35
  '.kdDrrRRRrPaPpRRRrPpaaPpRrRRrRRrDdk.............', // 36
  '..kdDrrRRRrRRRrRRRrPaPpRRrRRrRDdk...............', // 37
  '...kdDrrRRRRrRRRrRRRrRRrRRrRRDdk................', // 38
  '....kdDrrRRRRrRRRrRRRrRRrRRrDdk.................', // 39
  '.....kdDrrRRRRrRRRrRRRrRRrRDdk..................', // 40
  '......kdDrrRRRRrPaPpRRRrRRrDdk..................', // 41
  '.......kdDrrRRRRrRRRrRRrRDdk....................', // 42
  '........kdDrrRRRRrRRrRRDdk......................', // 43
  '.........kkkkkkkkkkkkkkkk.......................', // 44
  '....rR.....rR......rR.....rR.....rR.............', // 45
  '...rRr....rRr.....rRr....rRr....rRr.............', // 46
  '....r......r.......r......r......r..............', // 47
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Collapsed flat on the ground, tape unspooled in a messy pile, paper strips
// scattered, eyes dark/closed. Body lies horizontal across the bottom rows.
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
  '...rrr.....rrr....pPp..................rrrrr....', // 23
  '..rRrR....rRrR...paiap................rRrrRr....', // 24
  '..rRRr...rRRrR....pPp........rrr.....rRRrRRr....', // 25
  '...rrr...rRrrR..............rRrR......rRrrR.....', // 26
  '.........rRRrr...rrrr.......rRrR......rrrrr.....', // 27
  '..pPp....rrRrr..rrRrR........rrr................', // 28
  '.paiaP..........rRRrR...........................', // 29
  '.PaiaP....rrr....rRrr...rrrr.....rrr...rrrrr....', // 30
  '..pPp....rrRr....rrrr..rRrrR....rRrR...rRRrR....', // 31
  '.........rrrr...........rRrR....rrRr...rrrrr....', // 32
  '..rrr...........rrrr....rrrr....rRrr....rrr.....', // 33
  '.rRrR....pPp...rRRrR.....pPp.....rrr............', // 34
  '.rRRr...paiap..rrRrR....paiaP...........rrrr....', // 35
  '..rrr....pPp...rRrrR....paiaP....pPp...rRRrR....', // 36
  '...............rrRrr.....pPp...paiap....rrRrR...', // 37
  '..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..pPp..rRrrR....', // 38
  '.rRrrRrrRrrRrrRrrRrrRrrRrrRrrRrrR......rRRrR....', // 39
  'rRRrkkkkkkkkkkkkkkkkkkkkkkkkkkkkkrR.....rrrr....', // 40
  'rRRkdDrrRRrPpaPpRRrRRrPpaPpRRrRRrDdkR...........', // 41
  'rRkdDrrRRrPpaiaPpRRrRRrPpaiaPpRRrRrDdk.....pPp..', // 42
  'rkdDrrRRrPpaaaaPpRRrRRrPpaaaaPpRRrRrDdk...paiap.', // 43
  'kdDrrRRrPpaaiaaPRRrRRrRPpaaiaaPRRrRRrDdk...pPp..', // 44
  'kdDrrRRrPpaaaaPRRrRRrRRrPpaaaaPRrRRrRrDdk.......', // 45
  'kdDrrRRrPaPPaPRRrRRrRRrRRrRRrRRrRRrRRrDdk.......', // 46
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.......', // 47
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
      `[red-tape-mummy] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[red-tape-mummy] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function RedTapeMummySprite({
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
    id: 'red-tape-mummy',
    name: '紅膠木乃伊',
    englishName: 'Red Tape Mummy',
    role: 'regulations',
    tier: 'minor',
    topic: 'regulations',
    description: '被紅色官僚膠帶纏滿全身的木乃伊，黃眼透過縫隙發光。',
  },
  Sprite: RedTapeMummySprite,
};

export default character;
