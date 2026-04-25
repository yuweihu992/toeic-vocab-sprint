import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — 14-22 colors. Light source: upper-left.
// LinkedIn-themed knight: silver-blue armor, navy suit, gold accents,
// white shirt, red tie, white business cards, skin tones.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#0f172a', // outline / dark
  D: '#475569', // armor shadow (silver-blue)
  M: '#64748b', // armor mid
  L: '#94a3b8', // armor light / highlight
  n: '#1e3a8a', // navy suit shadow / briefcase shadow
  N: '#1e40af', // navy suit mid / briefcase mid
  g: '#f59e0b', // gold mid (emblem / buttons)
  G: '#fbbf24', // gold highlight
  W: '#f8fafc', // white shirt / card highlight
  w: '#ffffff', // pure white card
  e: '#e5e7eb', // card shadow / shirt shadow
  r: '#dc2626', // red tie
  R: '#991b1b', // tie shadow
  s: '#fde68a', // skin
  S: '#c98e6b', // skin shadow
  h: '#78350f', // hair dark
  H: '#a16207', // hair mid (professionally styled brown)
  Y: '#fcd34d', // hair highlight
  T: '#f3f4f6', // tooth/grin highlight
};

const W = 48;

// ── IDLE ────────────────────────────────────────────────────────────────────
// Faces LEFT. Briefcase-shield raised on right side (his left arm),
// business cards stack held at side on left side (his right hand).
// Smiling fake-friendly toothy grin.
const IDLE: readonly string[] = [
  // 0
  '................................................', // 0
  '................................................', // 1
  '................................................', // 2
  '................................................', // 3
  '................................................', // 4
  '................................................', // 5
  '................kkkkkkk.........................', // 6
  '...............kHHHHHHHk........................', // 7
  '..............kHYYHHHHHk........................', // 8
  '.............kHYYHHHHHHHk.......................', // 9
  '.............khhHHHHHHHhk.......................', // 10
  '............khsssssssshk........................', // 11
  '............kSskssssksSk........................', // 12
  '............ksssssssssSk........................', // 13
  '............kssTTTTTsssk........................', // 14
  '............kssTwTwTsssk........................', // 15
  '.............kSsssssSk..........................', // 16
  '..............kkkkkkk...........................', // 17
  '............kDDLLLLLLDDk........................', // 18
  '...........kDLWWWWWWWWLDk.......................', // 19
  '..........kDLWeWrrrrWeWLDk......................', // 20
  '.........kDLWWeWRRrrWeWWLDk.....................', // 21
  '........kDLLLWeWRRrrWeWLLLDk....................', // 22
  '.......kDDLLLWeWrrrrWeWLLLDDk...................', // 23
  '......kDDLLLWWeWrrrrWeWWLLLDDk..................', // 24
  '.....kkkkkkk.kWeWrrrrWeWk.kkkkkk................', // 25
  '....kwwwwwwk.kWeWrrrrWeWk.kNNNnnk...............', // 26
  '....kwweeewk.kWeWrrrrWeWk.knNNGnnk..............', // 27
  '....kwwwwwwk.kWeWrrrrWeWk.knNGGGnnk.............', // 28
  '....kwweeewk.kWWeWrrWeWWk.knNGwwGnk.............', // 29
  '....kwwwwwwk.kWWeWWWWeWWk.knNGwGGnk.............', // 30
  '....kwweeewk.kWWWeeeeWWWk.knNGGGGnk.............', // 31
  '....kwwwwwwk.knNNNNNNNNnk.knNGGGGnk.............', // 32
  '....kwweeewk.knNNNNNNNNnk.knnnnnnnk.............', // 33
  '....kwwwwwwk.knNNNNNNNNnk..khhhhhk..............', // 34
  '....kkkkkkkk.knNNNNNNNNnk..khhhhhk..............', // 35
  '.............knNNNNNNNNnk..khsskhk..............', // 36
  '.............kknnnnnnnnkk..khsskhk..............', // 37
  '..............kDLLLLLLDk....khhhhk..............', // 38
  '..............kDLLLLLLDk....kkkkkk..............', // 39
  '..............kDLLLLLLDk........................', // 40
  '..............khhhhhhhhk........................', // 41
  '..............khhkkkkhhk........................', // 42
  '..............khhk..khhk........................', // 43
  '..............kkkk..kkkk........................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Striding LEFT, smiling, briefcase raised, cards forward,
// one leg lifted forward (left), slight forward lean.
const WALK: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '...............kkkkkkk..........................',
  '..............kHHHHHHHk.........................',
  '.............kHYYHHHHHk.........................',
  '............kHYYHHHHHHHk........................',
  '............khhHHHHHHHhk........................',
  '...........khsssssssshk.........................',
  '...........kSskssssksSk.........................',
  '...........ksssssssssSk.........................',
  '...........kssTTTTTsssk.........................',
  '...........kssTwTwTsssk.........................',
  '............kSsssssSk...........................',
  '.............kkkkkkk............................',
  '...........kDDLLLLLLDDk.........................',
  '..........kDLWWWWWWWWLDk........................',
  '.........kDLWeWrrrrWeWLDk.......................',
  '........kDLWWeWRRrrWeWWLDk......................',
  '.......kDLLLWeWRRrrWeWLLLDk.....................',
  '......kDDLLLWeWrrrrWeWLLLDDk....................',
  '.....kDDLLLWWeWrrrrWeWWLLLDDk...................',
  '....kkkkkkk.kWeWrrrrWeWk.kkkkkk.................',
  '...kwwwwwwk.kWeWrrrrWeWk.kNNNnnk................',
  '...kwweeewk.kWeWrrrrWeWk.knNNGnnk...............',
  '...kwwwwwwk.kWeWrrrrWeWk.knNGGGnnk..............',
  '...kwweeewk.kWWeWrrWeWWk.knNGwwGnk..............',
  '...kwwwwwwk.kWWeWWWWeWWk.knNGwGGnk..............',
  '...kwweeewk.kWWWeeeeWWWk.knNGGGGnk..............',
  '...kwwwwwwk.knNNNNNNNNnk.knNGGGGnk..............',
  '...kwweeewk.knNNNNNNNNnk.knnnnnnnk..............',
  '...kwwwwwwk.knNNNNNNNNnk..khhhhhk...............',
  '...kkkkkkkk.knNNNNNNNNnk..khhhhhk...............',
  '............knNNNNNNNNnk..khsskhk...............',
  '............kknnnnnnnnkk..khsskhk...............',
  '..............kDLLLLLDk....khhhhk...............',
  '..............kDLLLLLDk....kkkkkk...............',
  '..............kDLLLLLDk.........................',
  '............kkhhhhhhhk..........................',
  '...........khhhhhhkkkk..........................',
  '..........khhkkhhk..............................',
  '.........khhk.kkkk..........kkkk................',
  '.........kkkk..............khhhhk...............',
  '...........................khsskk...............',
  '............................khhhk...............',
  '............................kkkkk...............',
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Business-card stack thrust forward (LEFT) like a sword strike.
// Body leans left, briefcase pulled close, cards extending far left.
const ATTACK: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..................kkkkkkk.......................',
  '.................kHHHHHHHk......................',
  '................kHYYHHHHHk......................',
  '...............kHYYHHHHHHHk.....................',
  '...............khhHHHHHHHhk.....................',
  '..............khsssssssshk......................',
  '..............kSskssssksSk......................',
  '..............ksssssssssSk......................',
  '..............kssTTTTTsssk......................',
  '..............kssTwTwTsssk......................',
  '...............kSsssssSk........................',
  '................kkkkkkk.........................',
  '..............kDDLLLLLLDDk......................',
  '.............kDLWWWWWWWWLDk.....................',
  '...kkkkkkkkkkkLLLeerrrreeLLLLDk.................',
  '...kwwwwwwwwwwwwwerrrrreLLLLLDk.................',
  '...kweeewweeewwwwerrrrreLLLLLDk.................',
  '...kwwwwwwwwwwwwwerrrrreLLLLLDk.................',
  '...kweeewweeewwwwerrrrreeLLLLDk.................',
  '...kwwwwwwwwwwwwwwwwwwwweLLLLDk.................',
  '...kweeewweeewwwwerrrrreeWWLLDk.................',
  '...kwwwwwwwwwwwwwerrrrreeWLLDDk....kkkkkk.......',
  '...kweeewweeewwwwerrrrreeWWLLDk....kNNNnnk......',
  '...kkkkkkkkkkkkkkkrrrrreeWWLLDk....knNNGnnk.....',
  '..............kDLWWWWWWWWLLDDDk....knNGGGnnk....',
  '..............kDLLLLLLLLLLLLDDk....knNGwwGnk....',
  '...............kkkkkkkkkkkkkkk.....knNGwGGnk....',
  '...............kDLLLLLLDk..........knNGGGGnk....',
  '...............kDLLLLLLDk..........knNGGGGnk....',
  '...............kDLLLLLLDk..........knnnnnnnk....',
  '...............khhhhhhhhk...........kkkkkkk.....',
  '...............khhhkkhhhk.......................',
  '...............khhk.khhhk.......................',
  '..............khhkk..khhk.......................',
  '..............kkkk....kkk.......................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Hair messed up (sticking out), briefcase opened with cards spilling,
// head jerked, surprised mouth.
const HIT: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '..................kk............................',
  '...............kk.kHk..k........................',
  '...............kHkHHHkkHk.......................',
  '...............kHHYHHHHHk.......................',
  '..............kkHYYHHHHHHkk.....................',
  '.............kHYHHHHHHHHHHHk....................',
  '............kHYYHHHHHHHHHHhk....................',
  '............khhHHHHHHHHHHHhk....................',
  '...........khsssssssssssshk.....................',
  '...........kSskssssksssksSk.....................',
  '...........ksssssssssssssSk.....................',
  '...........ksssTTwwTTsssssk.....................',
  '...........kssTTTwwTTTssssk.....................',
  '............kSsssssssSk.........................',
  '.............kkkkkkkkk..........................',
  '...........kDDLLLLLLDDk.........................',
  '..........kDLWWWWWWWWLDk........................',
  '.........kDLWeWrrrrWeWLDk.......................',
  '........kDLWWeWRRRRWeWWLDk......................',
  '.......kDLLLWeWRrrRWeWLLLDk.....................',
  '......kDDLLLWeWrRrRWeWLLLDDk....................',
  '.....kDDLLLWWeWrrRrWeWWLLLDDk...................',
  '....kkkkkk..kWeWrrrrWeWk........................',
  '....kwwwww..kWeWrrrrWeWk........................',
  '....kweeew..kWeWrrrrWeWk....kw..................',
  '....wwwww...kWeWrrrrWeWk...kwk..................',
  '...weew....kkWWeWrrWeWWkk.kwwk..................',
  '..wwww....kkkWWeWWWWeWWkkk.kwk..................',
  '..eew....kNNNWWWeeeeWWWNNNkkk...................',
  '..www...kNNGGknNNNNNNNNnkGGNk...................',
  '..ee....kNGwwGknNNNNNNNNnkGwGk..................',
  '...w....kNGwwGknNNNNNNNNnkGwGNk.................',
  '........kNGGGGknNNNNNNNNnkGGGNk.................',
  '........kNGGGGkknnnnnnnnkkGGGNk.................',
  '........knnnnnk.kDLLLLDk.knnnnk.................',
  '........kkkkkkk.kDLLLLDk..kkkk..................',
  '................kDLLLLDk........................',
  '...............khhkkkkhhk.......................',
  '...............khhk..khhk.......................',
  '...............khhk..khhk.......................',
  '...............kkkk..kkkk.......................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// Throwing business cards in fan pattern - multiple white cards radiating
// outward from his throwing hand (left side).
const SPECIAL: readonly string[] = [
  '................................................',
  '..ww............................................',
  '..wwk......ww...................................',
  '..wwk....kkwwk..................................',
  '..kkk....wwwwk..ww...kkkkkkk....................',
  '.........kkkk..kwwk.kHHHHHHHk...................',
  '...............kwwk.kHYYHHHHk...................',
  '...........ww..kkkkkHYYHHHHHk...................',
  '..........kwwk.....khhHHHHHhk...................',
  '..........kwwk....khsssssshk....................',
  '..........kkkk....kSskssksSk....................',
  '..ww..............ksssssssSk....................',
  '..wwk....ww.......kssTTTTTsk....................',
  '..wwk...kwwk......kssTwTwTsk....................',
  '..kkk...kwwk.......kSsssssk.....................',
  '........kkkk........kkkkkkk.....................',
  '..ww................kDLLLLDk....................',
  '..wwk....ww........kDLWWWWWLDk..................',
  '..wwk...kwwk......kDLWeerrWeLDk.................',
  '..kkk...kwwk.....kDLLWeRRrrWLLDk................',
  '........kkkk....kDLLLWerrrrWLLLDk...............',
  '...............kDDLLLWerrrrWLLLDDk..............',
  '..............kDDLLLWWerrrrWWLLLDDk.............',
  '...........kkkkkkkkkk.WerrrrW.kkkkkk............',
  '..........kwwwwwwwwwk.WerrrrW.kNNNnnk...........',
  '..........kweeeweeewk.WerrrrW.knNGGnnk..........',
  '..........kwwwwwwwwwk.WerrrrW.knNGGGGnk.........',
  '..........kweeeweeewk.WWeerWWWknNGwwGGnk........',
  '..........kwwwwwwwwwk.WWeWWWWWknNGwGGGnk........',
  '..........kweeeweeewk.WWWeeeWWknNGGGGGnk........',
  '..........kwwwwwwwwwk.nNNNNNNNknNGGGGGnk........',
  '..........kweeeweeewk.nNNNNNNNknnnnnnnnk........',
  '..........kwwwwwwwwwk.nNNNNNNNk.khhhhhk.........',
  '..........kkkkkkkkkkk.nNNNNNNNk.khhhhhk.........',
  '......................nNNNNNNNk.khsskhk.........',
  '.....................knnnnnnnnk.khsskhk.........',
  '.....................kDLLLLLLDk.khhhhhk.........',
  '.....................kDLLLLLLDk.kkkkkkk.........',
  '.....................kDLLLLLLDk.................',
  '.....................khhhhhhhk..................',
  '.....................khhkkkkhk..................',
  '.....................khhk.khhk..................',
  '.....................kkkk.kkkk..................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Sprawled on ground, cards scattered around, briefcase open.
const DEFEAT: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..ww.....................w......................',
  '..wwk....ww............kwwk......ww.............',
  '..kkk...kwwk...........kwwk.....kwwk............',
  '........kwwk....ww......kkk.....kwwk............',
  '........kkkk...kwwk.............kkkk............',
  '..............kkwwkk............................',
  '...........kkkkkkkkkkkk.........................',
  '..........kHHHHHHHHHHHhk.kk.....................',
  '.........khhYYHHHHHHHHhkkHk.....................',
  '........khsssssssssssshhHk......................',
  '........kSskssssksskssSSsk......................',
  '........ksssssssssssssSSsk......................',
  '........ksskkkkkkksssssssk......................',
  '........kssssssssssssssssk......................',
  '.........kkSsssssssssssSk.......................',
  '..........kkkkkkkkkkkkkkk.......................',
  '...kkkkkkkkkkkkkkkkkkkkkkkk.....................',
  '..kDLWWWWWWWWWWWWWWWWWWWWLDDk...................',
  '..kDLWeerrrrrrrrrrrrrrrreWLDk...................',
  '..kDLWWeRRRRRRRRRRRRRRRReWLDk...................',
  '..kDLLWWeerrrrrrrrrrrrrreLLDk....ww.............',
  '..kDLLLWWWWWWWWWWWWWWWWWWLLDk...kwwk............',
  '..kDLLLLLLLLLLLLLLLLLLLLLLLLDk..kwwk............',
  '..kDDLLLLLLLLLLLLLLLLLLLLLLLDDk.kkkk............',
  '...kkkkkkkkkkkkkkkkkkkkkkkkkkk..................',
  '....kNNNnnk.kkkkkkk.....kkkkkkk.................',
  '....knNGGGnk.kwwwwk....kwwwwwwk.................',
  '....knNGwGnk.kwwwwk....kweeeewk.................',
  '....knNGGGnk.kwwwwk....kwwwwwwk.................',
  '....knnnnnnk.kkkkkk....kkkkkkkk.................',
  '...kkhhhhkkk....................................',
  '...khhhhhhhk....................................',
  '...kkkkkkkkk....................................',
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
      `[network-knight] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[network-knight] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function NetworkKnightSprite({
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
    id: 'network-knight',
    name: '人脈騎士',
    englishName: 'Network Knight',
    role: 'job-hunting',
    tier: 'major',
    topic: 'job-hunting',
    description: '穿西裝戴半甲、公事包當盾、名片如劍的職涯騎士。',
  },
  Sprite: NetworkKnightSprite,
};

export default character;
