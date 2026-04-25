import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — 16 colors.
// Light source: upper-left.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#0c0a09', // outline / eyes / eye stalks
  S: '#450a0a', // shell deep shadow
  R: '#7f1d1d', // shell deep red
  r: '#b91c1c', // shell mid red
  e: '#dc2626', // shell bright red
  E: '#ef4444', // shell highlight
  H: '#fecaca', // shell glossy specular
  g: '#14532d', // money bag shadow
  G: '#166534', // money bag mid
  w: '#ffffff', // bag tie / $ symbol
  y: '#fbbf24', // gold coin highlight
  Y: '#f59e0b', // gold coin mid
  o: '#d97706', // gold coin shadow
  c: '#44403c', // calculator dark frame
  C: '#78716c', // calculator light body
  L: '#22c55e', // calculator LCD green
};

const W = 48;

// Each row below is exactly 48 chars (12 groups of 4).
// Layout reference, columns 0..47:
//   ....|....|....|....|....|....|....|....|....|....|....|....

// ── IDLE ────────────────────────────────────────────────────────────────────
// Crab faces LEFT. Both claws raised symmetrically — money bag (left)
// and calculator (right). Six legs underneath. Eye stalks alert.
const IDLE: readonly string[] = [
  //....|....|....|....|....|....|....|....|....|....|....|....
  '................................................', // 00
  '................................................', // 01
  '..........kkkk....................kkkk..........', // 02
  '.........kggggk..................kCCCCk.........', // 03
  '........kgGGGGgk................kCCCCCCk........', // 04
  '.......kgGwGGGGgk..............kcLLLLLLck.......', // 05
  '.......kgGGwGGGGk..............kcLLLLLLck.......', // 06
  '.......kgwwwwwwgk..............kcCcCcCcck.......', // 07
  '.......kgGGwGGGGk..............kcCcCcCcck.......', // 08
  '.......kgGGGGGGgk..............kccccccck........', // 09
  '........kggggggk................kkkkkkk.........', // 10
  '.........kkkkkk..................kkkkkk.........', // 11
  '..........kkkk....................kkkk..........', // 12
  '...........kk......................kk...........', // 13
  '...........kk......................kk...........', // 14
  '...........kk......................kk...........', // 15
  '..........kkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 16
  '.........kSRRrrrreeeeeeeeeeeerrrrRRSSk..........', // 17
  '........kSRRrreeeEEEEEEEEEEEEeeeerrRRSk.........', // 18
  '.......kSRrreeEEEEEEHHHHHHEEEEEEeeerrRSk........', // 19
  '......kSRrreeEEEEHHHHHHHHHHHHEEEEEerrRSk........', // 20
  '......kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSSk.......', // 21
  '.....kSRRrreEEEEHHHHHHHHHHHHHHEEEEErrrRRSk......', // 22
  '.....kSRRrreEEEEEHHHHHHHHHHHHEEEEEErrrRRSk......', // 23
  '.....kSRRrreeEEEEEEHHHHHHHHEEEEEEEerrrRRSSk.....', // 24
  '.....kSRRrreeeEEEEEEEHHHHEEEEEEEEerrrRRSSk......', // 25
  '......kSRRrrreeeEEEEEEEEEEEEEEEeerrrRRSSk.......', // 26
  '......kSSRRrrreeeeEEEEEEEEEEeeeerrrRRSSk........', // 27
  '.......kSSRRrrrreeeeeeeeeeeerrrrRRRSSkk.........', // 28
  '........kkSSRRRrrrrrrrrrrrrrRRRRSSkk............', // 29
  '..........kkSSSRRRRRRRRRRRRSSSkk................', // 30
  '............kkkkSSSSSSSSkkkk....................', // 31
  '..........kk....kkkkkkkk....kk..................', // 32
  '.........k.kk....k....k....kk.k.................', // 33
  '.........k..kk...k....k...kk..k.................', // 34
  '.........k...kk..k....k..kk...k.................', // 35
  '.........kk...kk.k....k.kk...kk.................', // 36
  '..........k....kkk....kkk....k..................', // 37
  '..........kk....k......k....kk..................', // 38
  '...........k....k......k....k...................', // 39
  '...........kk...k......k...kk...................', // 40
  '............k...k......k...k....................', // 41
  '...........kk...kk....kk...kk...................', // 42
  '..........kk.....k....k.....kk..................', // 43
  '..........k......k....k......k..................', // 44
  '.........kk......k....k......kk.................', // 45
  '.........k.......k....k.......k.................', // 46
  '................................................', // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Sideways scuttle: body shifted one column right, legs cycling
// (alternating leg phase from idle). Claws lowered.
const WALK: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '..........kkkk....................kkkk..........', // 05
  '.........kggggk..................kCCCCk.........', // 06
  '........kgGGGGgk................kCCCCCCk........', // 07
  '........kgGwGGgk................kcLLLLLLk.......', // 08
  '........kgGGwGGk................kcLLLLLLk.......', // 09
  '........kgwwwwgk................kcCcCcCck.......', // 10
  '........kgGGwGGk................kcCcCcCck.......', // 11
  '........kgGGGGgk................kccccccck.......', // 12
  '.........kggggk..................kkkkkkk........', // 13
  '..........kkkk....................kkkk..........', // 14
  '...........kk......................kk...........', // 15
  '...........kk......................kk...........', // 16
  '..........kkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 17
  '.........kSRRrrrreeeeeeeeeeeerrrrRRSSk..........', // 18
  '........kSRRrreeeEEEEEEEEEEEEeeeerrRRSk.........', // 19
  '.......kSRrreeEEEEEEHHHHHHEEEEEEeeerrRSk........', // 20
  '......kSRrreeEEEEHHHHHHHHHHHHEEEEEerrRSk........', // 21
  '......kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSSk.......', // 22
  '.....kSRRrreEEEEHHHHHHHHHHHHHHEEEEErrrRRSk......', // 23
  '.....kSRRrreEEEEEHHHHHHHHHHHHEEEEEErrrRRSk......', // 24
  '.....kSRRrreeEEEEEEHHHHHHHHEEEEEEEerrrRRSSk.....', // 25
  '.....kSRRrreeeEEEEEEEHHHHEEEEEEEEerrrRRSSk......', // 26
  '......kSRRrrreeeEEEEEEEEEEEEEEEeerrrRRSSk.......', // 27
  '......kSSRRrrreeeeEEEEEEEEEEeeeerrrRRSSk........', // 28
  '.......kSSRRrrrreeeeeeeeeeeerrrrRRRSSkk.........', // 29
  '........kkSSRRRrrrrrrrrrrrrrRRRRSSkk............', // 30
  '..........kkSSSRRRRRRRRRRRRSSSkk................', // 31
  '............kkkkSSSSSSSSkkkk....................', // 32
  '.........kk....kkkkkkkk....kk...................', // 33
  '........k.k....k......k....k.k..................', // 34
  '.......k..k....k......k....k..k.................', // 35
  '......k...k....k......k....k...k................', // 36
  '.....k....kk...k......k...kk....k...............', // 37
  '....k......k...k......k...k......k..............', // 38
  '...k.......kk..k......k..kk.......k.............', // 39
  '..k.........k..k......k..k.........k............', // 40
  '..k.........kk.kk....kk.kk.........k............', // 41
  '..k..........kkk......kkk..........k............', // 42
  '...k..........k........k..........k.............', // 43
  '....k.........k........k.........k..............', // 44
  '.....k........k........k........k...............', // 45
  '......kkkkkkkkk........kkkkkkkkkk...............', // 46
  '................................................', // 47
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Money-bag claw thrust forward LEFT (facing direction). Bag enlarged
// and extended further left. Right calculator claw pulled in tighter.
const ATTACK: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '..kkkk..........................................', // 02
  '.kggggk.........................................', // 03
  'kgGGGGgk........................................', // 04
  'kgGwGGGgk.......................................', // 05
  'kgGwwGGGgk......................................', // 06
  'kgwwwwGGGgk.....................................', // 07
  'kgwwwwGGGgk.....................................', // 08
  'kgGwGGGGGGgk....................................', // 09
  '.kgGGGGGGgk.....................................', // 10
  '..kggggggk......................................', // 11
  '...kkkkkkk......................................', // 12
  '......kkkk............................kkkk......', // 13
  '........kkk..........................kCCCCk.....', // 14
  '..........kkkk......................kCCCCCCk....', // 15
  '............kkkkkkkkkkkkkkkkkkkkkkkkkcLLLLLLk...', // 16
  '...........kSRRrreeeeeeeeeeeerrrrRRSSkLLLLLLk...', // 17
  '..........kSRrreeeEEEEEEEEEEEEeeerrRSkcCcCcCck..', // 18
  '.........kSRrreeEEEEEEHHHHHHEEEEEEeerrRSkccccck.', // 19
  '........kSRrreeEEEEHHHHHHHHHHHHEEEEEerrRSkkkkkk.', // 20
  '........kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSSk.....', // 21
  '.......kSRRrreEEEEHHHHHHHHHHHHHHEEEEErrrRRSk....', // 22
  '.......kSRRrreEEEEEHHHHHHHHHHHHEEEEEErrrRRSk....', // 23
  '.......kSRRrreeEEEEEEHHHHHHHHEEEEEEEerrrRRSSk...', // 24
  '.......kSRRrreeeEEEEEEEHHHHEEEEEEEEerrrRRSSk....', // 25
  '........kSRRrrreeeEEEEEEEEEEEEEEEeerrrRRSSk.....', // 26
  '........kSSRRrrreeeeEEEEEEEEEEeeeerrrRRSSk......', // 27
  '.........kSSRRrrrreeeeeeeeeeeerrrrRRRSSkk.......', // 28
  '..........kkSSRRRrrrrrrrrrrrrrRRRRSSkk..........', // 29
  '............kkSSSRRRRRRRRRRRRSSSkk..............', // 30
  '..............kkkkSSSSSSSSkkkk..................', // 31
  '............kk....kkkkkkkk....kk................', // 32
  '...........k.kk....k....k....kk.k...............', // 33
  '...........k..kk...k....k...kk..k...............', // 34
  '...........k...kk..k....k..kk...k...............', // 35
  '...........kk...kk.k....k.kk...kk...............', // 36
  '............k....kkk....kkk....k................', // 37
  '............kk....k......k....kk................', // 38
  '.............k....k......k....k.................', // 39
  '.............kk...k......k...kk.................', // 40
  '..............k...k......k...k..................', // 41
  '.............kk...kk....kk...kk.................', // 42
  '............kk.....k....k.....kk................', // 43
  '............k......k....k......k................', // 44
  '...........kk......k....k......kk...............', // 45
  '...........k.......k....k.......k...............', // 46
  '................................................', // 47
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Claws recoil backward, body flinches sideways; coins spill from bag.
// Eye stalks splayed sideways from impact.
const HIT: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '....yo......................................oy..', // 02
  '...oyYo....kkkk....................kkkk....oYyo.', // 03
  '...oYyo...kggggk..................kCCCCk...oyYo.', // 04
  '....yo...kgGGGGgk................kCCCCCCk....yo.', // 05
  '........kgGwwwGGk..............kcLcLcLcLck......', // 06
  '........kGwwwwwgk..............kccccccccck......', // 07
  '.........kgwwwgk................kcCcCcCcck...yo.', // 08
  '..........kgGgk..................kcCcCcck...oyY.', // 09
  '...........kgk....................kkkkkkk....yo.', // 10
  '..........kkkkk....................kkkkk........', // 11
  '..........k...k....................k...k........', // 12
  '.........kk...kk..................kk...kk.......', // 13
  'yo.......k.....k..................k.....k.....oy', // 14
  '.........kk....kkkkkkkkkkkkkkkkkkkk....kk....oYy', // 15
  '.........k.SSRRRrrrreeeeeeeeeerrrrRRSSk.k....oyY', // 16
  '........kk.kSRrrrreeeeEEEEEEEEEeeerrRSk.kk.....y', // 17
  '.......k..kSRrreeEEEEEHHHHHHEEEEEEeerrRSk.k.....', // 18
  '......kk..kSRrreeEEEHHHHHHHHHHHHEEEEEerrRSk.k...', // 19
  '......k...kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSSk.k.', // 20
  '......k..kSRRrreEEEEHHHHHHHHHHHHHHEEEEErrrRRSkk.', // 21
  '......kk.kSRRrreEEEEEHHHHHHHHHHHHEEEEEErrrRRSk..', // 22
  '.....k...kSRRrreeEEEEEEHHHHHHHHEEEEEEEerrrRRSSk.', // 23
  '....kk...kSRRrreeeEEEEEEEHHHHEEEEEEEEerrrRRSSk..', // 24
  '....k....kSRRrrreeeEEEEEEEEEEEEEEEeerrrRRSSk....', // 25
  '...kk....kSSRRrrreeeeEEEEEEEEEEeeeerrrRRSSk.....', // 26
  '.........kSSRRrrrreeeeeeeeeeeerrrrRRRSSkk.......', // 27
  '..........kkSSRRRrrrrrrrrrrrrrRRRRSSkk..........', // 28
  '............kkSSSRRRRRRRRRRRRSSSkk..............', // 29
  '..............kkkkSSSSSSSSkkkk..................', // 30
  '............kk....kkkkkkkk....kk................', // 31
  '..........k..kk...k.....k...kk..k...............', // 32
  '.........k....k...k.....k...k....k..............', // 33
  '........k.....kk..k.....k..kk.....k.............', // 34
  '.......k.......k..k.....k..k.......k............', // 35
  '......k........kkkk.....kkkk........k...........', // 36
  '......k...........k.....k...........k...........', // 37
  '......k...........k.....k...........k...........', // 38
  '.......k..........k.....k..........k............', // 39
  '........k.........k.....k.........k.............', // 40
  '.........k........k.....k........k..............', // 41
  '..........k.......kk...kk.......k...............', // 42
  '...........k.......k...k.......k................', // 43
  '............k......k...k......k.................', // 44
  '.............k.....k...k.....k..................', // 45
  '..............k....k...k....k...................', // 46
  '................................................', // 47
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// COIN STORM — both claws raised high; gold coins exploding upward in arc.
// Body in confident stance; eye stalks straight up.
const SPECIAL: readonly string[] = [
  '..........yo.......yYo......yYo........oy.......', // 00
  '.........oyYo.....yYYYo....yYYYo......oYy.......', // 01
  '..........yo......yYo.......yYo........yo.......', // 02
  '..yo................................oy....yYo...', // 03
  '.yYYo......yo......................yo.....yYYo..', // 04
  '..yo.......yYo....................yYo.......yo..', // 05
  '............yo....................yo............', // 06
  '....yo......................................yo..', // 07
  '...yYYo...kkkk....................kkkk....yYYo..', // 08
  '....yo...kggggk..................kCCCCk....yo...', // 09
  '........kgGGGGgk................kCCCCCCk........', // 10
  '.......kgGwGGGGgk..............kcLLLLLLLk.......', // 11
  '.......kgGGwGGGGk..............kcLLLLLLLk.......', // 12
  '.......kgwwwwwwgk..............kcCcCcCcck.......', // 13
  '.......kgGGwGGGGk..............kcCcCcCcck.......', // 14
  '........kgGGGGGgk...............kccccccck.......', // 15
  '.........kggggggk................kkkkkkk........', // 16
  '..........kkkkkk..................kkkkk.........', // 17
  '............kk......................kk..........', // 18
  '..........kkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 19
  '.........kSRRrrrreeeeeeeeeeeerrrrRRSSk..........', // 20
  '........kSRRrreeeEEEEEEEEEEEEeeeerrRRSk.........', // 21
  '.......kSRrreeEEEEEEHHHHHHEEEEEEeeerrRSk........', // 22
  '......kSRrreeEEEEHHHHHHHHHHHHEEEEEerrRSk........', // 23
  '......kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSSk.......', // 24
  '.....kSRRrreEEEEHHHHHHHHHHHHHHEEEEErrrRRSk......', // 25
  '.....kSRRrreEEEEEHHHHHHHHHHHHEEEEEErrrRRSk......', // 26
  '.....kSRRrreeEEEEEEHHHHHHHHEEEEEEEerrrRRSSk.....', // 27
  '.....kSRRrreeeEEEEEEEHHHHEEEEEEEEerrrRRSSk......', // 28
  '......kSRRrrreeeEEEEEEEEEEEEEEEeerrrRRSSk.......', // 29
  '......kSSRRrrreeeeEEEEEEEEEEeeeerrrRRSSk........', // 30
  '.......kSSRRrrrreeeeeeeeeeeerrrrRRRSSkk.........', // 31
  '........kkSSRRRrrrrrrrrrrrrrRRRRSSkk............', // 32
  '..........kkSSSRRRRRRRRRRRRSSSkk................', // 33
  '............kkkkSSSSSSSSkkkk....................', // 34
  '..........kk....kkkkkkkk....kk..................', // 35
  '.........k.kk....k....k....kk.k.................', // 36
  '.........k..kk...k....k...kk..k.................', // 37
  '.........k...kk..k....k..kk...k.................', // 38
  '.........kk...kk.k....k.kk...kk.................', // 39
  '..........k....kkk....kkk....k..................', // 40
  '..........kk....k......k....kk..................', // 41
  '...........k....k......k....k...................', // 42
  '...........kk...k......k...kk...................', // 43
  '............k...k......k...k....................', // 44
  '...........kk...kk....kk...kk...................', // 45
  '..........kk.....k....k.....kk..................', // 46
  '..........k......k....k......k..................', // 47
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Belly-up, upside-down. Shell at bottom (showing underside), legs splayed
// up, claws splayed limp to the sides. Eyes X-shaped (k crosses).
const DEFEAT: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '..........k........k....k........k..............', // 02
  '..........kk.......k....k.......kk..............', // 03
  '...........k......kk....kk......k...............', // 04
  '...........kk.....k......k.....kk...............', // 05
  '............k.....k......k.....k................', // 06
  '............kk....k......k....kk................', // 07
  '.............k....k......k....k.................', // 08
  '.............kk...k......k...kk.................', // 09
  '..............k...kk....kk...k..................', // 10
  '..............kk..k......k..kk..................', // 11
  '...............k..k......k..k...................', // 12
  '...............kk.kk....kk.kk...................', // 13
  '................k..k....k..k....................', // 14
  '................kk.kk..kk.kk....................', // 15
  '.................k..kkkk..k.....................', // 16
  '.................kk..kk..kk.....................', // 17
  '..................kk....kk......................', // 18
  '...........kkkkkkkkkkkkkkkkkkkkkkkk.............', // 19
  '..........kSSRRRrrrrrrrrrrrrrRRRRSSk............', // 20
  '.........kSSRRRrreeeeeeeeeerrrrrRRSSk...........', // 21
  '........kSRRrreeeEEEEEEEEEEeeeerrRRSk...........', // 22
  '.......kSRrreeEEEEEEEEEEEEEEEEeeerrRSk..........', // 23
  '......kSRrreEEEEEEEHHHHHHEEEEEEEeerrRSk.........', // 24
  '.....kSRrreEEEEHHHHHHHHHHHHEEEEEeerrRSk.........', // 25
  '.....kSRrreeEEEHHHHHHHHHHHHHHEEEEerrRSk.........', // 26
  '.....kSRRrreEEEEEHHHHHHHHHHEEEEEEerrRSk.........', // 27
  '.....kSRRrreeEEEEEEEEHHHHEEEEEEEEerrRSk.........', // 28
  '.....kSRRrreeeEEEEEEEEEEEEEEEEEeerrRRSk.........', // 29
  '......kSRRrrreeeeEEEEEEEEEEEEeeeerrRRSk.........', // 30
  '.......kSSRRrrreeeeeEEEEEEeeeerrrrRRSSk.........', // 31
  '........kkSSRRRrrrrrrrrrrrrrrrRRRRSSkk..........', // 32
  '...........kkSSSSRRRRRRRRRRRSSSSkk..............', // 33
  '..............kkkkSSSSSSSSkkkk..................', // 34
  '..kkkk......................................kkkk', // 35
  '.kggggk....yo......................oYy....kCCCCk', // 36
  'kgGGGGgk..oyYo....yo........yo....yYy....kCLLLLk', // 37
  'kgwwwGgk...yo....oyYo......oyY....yo......kcccck', // 38
  'kgGwGGgk........oyYYo.....oyYYo...........kkkkkk', // 39
  '.kgGGGgk........oYy.......oYy...................', // 40
  '..kggggk.........yo........yo...................', // 41
  '...kkkk.........................................', // 42
  '................................................', // 43
  '......yo................................yo......', // 44
  '.....oYy................................oYy.....', // 45
  '......yo................................yo......', // 46
  '................................................', // 47
];

const POSES: Record<ActionState, readonly string[]> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

// Validate row dimensions at module load — surfaces mistakes immediately.
function assertGrid(name: string, rows: readonly string[]): void {
  if (rows.length !== W) {
    throw new Error(
      `[salary-crab] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[salary-crab] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function SalaryCrabSprite({
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
    id: 'salary-crab',
    name: '薪資螃蟹',
    englishName: 'Salary Crab',
    role: 'job-hunting',
    tier: 'minor',
    topic: 'job-hunting',
    description: '巨型紅蟹，左鉗抓錢袋、右鉗是計算機，吐金幣噴錢。',
  },
  Sprite: SalaryCrabSprite,
};

export default character;
