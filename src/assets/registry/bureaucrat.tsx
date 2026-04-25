// Bureaucrat — 公文官員
// Burned-out clerk after 72h of forms. Faces LEFT.
// 48x48, 6 distinct poses. Light from upper-left.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

// Palette (17 colors used)
//   K = outline / dark line             #1c1917
//   D = mid shadow                      #292524
//   s = pale skin highlight             #e7d3b1
//   m = pale skin midtone               #c8a479
//   o = skin shadow                     #8b6f47
//   h = hair highlight                  #78716c
//   H = hair dark                       #44403c  (also tie dark, brow)
//   T = tie midtone                     #57534e
//   w = shirt highlight                 #f1f5f9
//   W = shirt midtone                   #e5e7eb
//   S = shirt shadow / wrinkle          #cbd5e1
//   y = ink-stain pale yellow           #fef3c7  (also paper highlight)
//   Y = ink-stain yellow / paper mid    #fde68a
//   p = paper shadow / line             #d6c285
//   r = red ink bright                  #dc2626
//   R = red ink mid                     #b91c1c
//   X = red ink dark                    #7f1d1d
//   u = wood handle light               #92400e
//   U = wood handle dark                #78350f
//   b = bloodshot red line              #ef4444
//   e = eye-bag purple-black            #581c87
//   E = eye-bag dark purple             #3b0764
//   v = eye-bag rim                     #6b21a8
//   z = sweat / off-white shine         #bae6fd
//   . = transparent
const PALETTE: Readonly<Record<string, string>> = {
  K: '#1c1917',
  D: '#292524',
  s: '#e7d3b1',
  m: '#c8a479',
  o: '#8b6f47',
  h: '#78716c',
  H: '#44403c',
  T: '#57534e',
  w: '#f1f5f9',
  W: '#e5e7eb',
  S: '#cbd5e1',
  y: '#fef3c7',
  Y: '#fde68a',
  p: '#d6c285',
  r: '#dc2626',
  R: '#b91c1c',
  X: '#7f1d1d',
  u: '#92400e',
  U: '#78350f',
  b: '#ef4444',
  e: '#581c87',
  E: '#3b0764',
  v: '#6b21a8',
  z: '#bae6fd',
};

// Each row is EXACTLY 48 chars. Column ruler:
// 0         1         2         3         4
// 0123456789012345678901234567890123456789012345678

// ── IDLE ─────────────────────────────────────────────
// Hunched, stamp held at chest, papers shaking on side
const IDLE: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '...........................YYYY.................', //  3
  '..........................YyyyYp................', //  4
  '...................YYYY...YyyyYp.....YYYY.......', //  5
  '..................YyyyYp..YYYYpp....YyyyYp......', //  6
  '..................YYYYpp...........YYYYpp.......', //  7
  '............KKKKKKKK............................', //  8
  '...........KHHhhhhHKK...........................', //  9
  '..........KHhhhhhhhHHK.......YYYY...............', // 10
  '.........KHhhsssshhhHK......YyyyYp..............', // 11
  '.........KhssmmmsshhHK......YYYYpp..............', // 12
  '........KHsmmsssmmsoHK..........................', // 13
  '........KHsmsHsHsmsoHK..........................', // 14
  '........KHsmsbsbsmmoHK..........................', // 15
  '........KHsoEEoEEsmoK...........................', // 16
  '........KHseeEseeesoK...........................', // 17
  '........KHsvvvvvvvsoK...........................', // 18
  '........KHsmmoosmmsoK...........................', // 19
  '.........KHsmoKomssK............................', // 20
  '.........KHsmoooosoKz...........................', // 21
  '..........KHsmmmmsoK............................', // 22
  '...........KHHTTHHK.............................', // 23
  '...........KwHTTTHwK............................', // 24
  '..........KwwHTTTHwwK....YYYY...................', // 25
  '.........KwwSWTTTWSwwK..YyyyYp..................', // 26
  '........KwwSWWyyyWWSwwK.YYYYpp..................', // 27
  '........KwSWWyyyyyWWSwK.........................', // 28
  '........KwSWWWUUUWWWSwK.........................', // 29
  '........KwSWWWUuuWWWSwK.........................', // 30
  '........KwSWWXrrXWWSwwK.........................', // 31
  '........KwSWWrrrrWWSwK..........................', // 32
  '........KwSWWXrrXWWSwK..........................', // 33
  '........KwwSWmmmmWSwwK..........................', // 34
  '........KKwSmsssmmSwKK..........................', // 35
  '..........KSomssomoSK...........................', // 36
  '..........KSoooHHooSK...........................', // 37
  '..........KHHHKKHHHHK...........................', // 38
  '..........KHHK..KHHHK...........................', // 39
  '.........KHHK....KHHK...........................', // 40
  '.........KHHK....KHHK...........................', // 41
  '........KHHHK....KHHK...........................', // 42
  '........KKKK......KKKK..........................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── WALK ─────────────────────────────────────────────
// Weary shuffle, body tilted, one foot dragging
const WALK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '................................................', //  3
  '..............................YYYY..............', //  4
  '.............................YyyyYp.............', //  5
  '...................YYYY......YYYYpp.............', //  6
  '..................YyyyYp........................', //  7
  '..................YYYYpp........................', //  8
  '............KKKKKKKK............................', //  9
  '...........KHhhhhhhKK...........................', // 10
  '..........KHhhhhhhhhHK..........................', // 11
  '.........KHhhsssshhhHK..........................', // 12
  '.........KhssmmmsshhHK..........................', // 13
  '........KHsmmsssmmsoHK..........................', // 14
  '........KHsmsHsHsmsoHK..........................', // 15
  '........KHsmsbsbsmmoHK..........................', // 16
  '........KHsoEEoEEsmoK...........................', // 17
  '........KHseeEseeesoK...........................', // 18
  '........KHsvvvvvvvsoK...........................', // 19
  '........KHsmmoosmmsoK...........................', // 20
  '.........KHsmoKomssK............................', // 21
  '..........KHsmoooosK............................', // 22
  '..........KHsmmmmsoK............................', // 23
  '..........KHHTTHHKKK............................', // 24
  '..........KwHTTTHwK.............................', // 25
  '.........KwwHTTTHwwK............................', // 26
  '........KwwSWTTTWSwwK...........................', // 27
  '........KwSWWyyyWWSwK...........................', // 28
  '........KwSWWyyyyWWSwK..........................', // 29
  '.......KwSWWWUUUWWWSwK..........................', // 30
  '.......KwSWWWUuuWWSwwK..........................', // 31
  '.......KwSWWXrrXWWSwwK..........................', // 32
  '.......KwSWWrrrrWWSwK...........................', // 33
  '.......KwwSWXrrXWSwwK...........................', // 34
  '........KwSWWmmmmWSwK...........................', // 35
  '........KKwSmsssmsSwKK..........................', // 36
  '..........KSomsmsmoSK...........................', // 37
  '..........KSoooHHooSK...........................', // 38
  '..........KHHHK.KHHKK...........................', // 39
  '..........KHHK..KHHHK...........................', // 40
  '.........KHHK....KHHK...........................', // 41
  '........KHHHK.....KHK...........................', // 42
  '........KHHK......KHHK..........................', // 43
  '.......KHHK........KHHK.........................', // 44
  '.......KKKK........KKKK.........................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── ATTACK ───────────────────────────────────────────
// Stamp slammed forward (LEFT), red ink splatter
const ATTACK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '................................................', //  3
  '................................................', //  4
  '................................................', //  5
  '................................................', //  6
  '..............KKKKKKKK..........................', //  7
  '.............KHhhhhhhKK.........................', //  8
  '............KHhhhhhhhhHK........................', //  9
  '...........KHhhsssshhhHK........................', // 10
  '...........KhssmmmsshhHK........................', // 11
  '..........KHsmmsssmmsoHK........................', // 12
  '..........KHsmsHsHsmsoHK........................', // 13
  '..r.......KHsmsbsbsmmoHK........................', // 14
  '..........KHsoEEoEEsmoK.........................', // 15
  '..r.r.....KHseeEseeesoK.........................', // 16
  'r.........KHsvvvvvvvsoKKK.......................', // 17
  '..r.......KHsmmoosmmsoKwwK......................', // 18
  '...r.....KKHsmoKomssKwwwwK......................', // 19
  '..rrr...KHsmoooooosoKwSWSwK.....................', // 20
  '.rrrrr.KHmsmmmmmmmmoKWyyyWwK....................', // 21
  'rrXrrrXKsoTTHHHHHHKKWyyyyyWK....................', // 22
  'rXrXrXrKToTTHHHKKKKWyWUUUWSwK...................', // 23
  'rrrrrrr.UUUUUKwwwwSWWWUuuWSwK...................', // 24
  '.rXrXr..uuuuKKwSwwSWWXrrXWSwK...................', // 25
  '..rrr....KKKKwSWwSWWrrrrWWSwK...................', // 26
  '.........KwSWWWWWWXrrXWWWSwK....................', // 27
  '.........KwSWWWWWmmmmWWWSwwK....................', // 28
  '..........KwSWWmsssmsWSwwK......................', // 29
  '..........KKwSomssomoSwKK.......................', // 30
  '............KSooooHooSK.........................', // 31
  '............KHHHHKHHHHK.........................', // 32
  '............KHHK..KHHHK.........................', // 33
  '...........KHHK....KHHK.........................', // 34
  '...........KHHK....KHHK.........................', // 35
  '..........KHHHK....KHHK.........................', // 36
  '..........KKKK......KKKK........................', // 37
  '................................................', // 38
  '................................................', // 39
  '...rr...........................................', // 40
  '..rXr..........rr...............................', // 41
  '...r..........rXXr..............................', // 42
  '...............rr...............................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── HIT ──────────────────────────────────────────────
// Stamp dropping, papers flying everywhere
const HIT: readonly string[] = [
  '................................................', //  0
  '..YYYY...........YYYY..........YYYY.............', //  1
  '.YyyyYp.........YyyyYp........YyyyYp............', //  2
  '..YYYYpp.........YYYYpp........YYYYpp...........', //  3
  '......................YYYY......................', //  4
  '..............YYYY...YyyyYp.........YYYY........', //  5
  '.............YyyyYp...YYYYpp.......YyyyYp.......', //  6
  '..............YYYYpp................YYYYpp......', //  7
  '............KKKKKKKK............................', //  8
  '...........KHhhhhhhKK...........................', //  9
  '..........KHhhhhhhhhHK..........................', // 10
  '.........KHhhsssshhhHK..........................', // 11
  '.........KhssmmmsshhHK........YYYY..............', // 12
  '........KHsmmsssmmsoHK.......YyyyYp.............', // 13
  '........KHsmsXsXsmsoHK........YYYYpp............', // 14
  '........KHsmsbsbsmmoHK..........................', // 15
  '........KHsoEEoEEsmoK...........................', // 16
  '........KHseeEseeesoK...........................', // 17
  '........KHsvvvvvvvsoKzz.........................', // 18
  '........KHsoooooooooKz..........................', // 19
  '.........KHsmmHHmmsoK...........................', // 20
  '..........KHHTTTTHHK............................', // 21
  '.........KwwHTTTHwwK............................', // 22
  '........KwwSWTTTWSwwK...........................', // 23
  '........KwSWWyyyWWSwwK..........................', // 24
  '.......KwwSWyyyyyWSwwK..........................', // 25
  '.......KwSWWWWWWWWWSwK..........................', // 26
  '.......KwSWWWWWWWWWSwK..........................', // 27
  '.......KwSWWWWWWWWWSwK..........................', // 28
  '.......KwwSWWmmmmWWSwK..YYYY....................', // 29
  '........KwSmsssmmsSwwK.YyyyYp...................', // 30
  '........KKwSomssomoSwK..YYYYpp..................', // 31
  '..........KSoooHHooSKK..........................', // 32
  '..........KHHHKKHHHHK...........................', // 33
  '.........KHHK...KHHHK...........................', // 34
  '.........KHHK....KHHK...........................', // 35
  '........KHHK......KHHK..........................', // 36
  '........KHHK......KHHK..........................', // 37
  '.......KKKK........KKKK.........................', // 38
  '................................................', // 39
  '......................YYYY......................', // 40
  '............YYYY.....YyyyYp.......YYYY..........', // 41
  '...........YyyyYp.....YYYYpp.....YyyyYp.........', // 42
  '............YYYYpp................YYYYpp........', // 43
  '...UUuuU........................................', // 44
  '...UuuuU.........rr.....rr......................', // 45
  '...KKKK..........rrr...rrr......................', // 46
  '...........rr.....rrrrrrr.......................', // 47
];

// ── SPECIAL ──────────────────────────────────────────
// PAPERWORK AVALANCHE — body buried under raining paper stacks
const SPECIAL: readonly string[] = [
  'YYYY...YYYY....YYYY...YYYY..YYYY...YYYY.....YYYY', //  0
  'yyyYp.YyyyYp..YyyyYpYyyyYp.YyyyYp.YyyyYp...YyyyY', //  1
  'YYYpp..YYYYpp..YYYYppYYYYp.YYYYpp..YYYYpp..YYYYp', //  2
  '...YYYY......YYYY.....YYYY......YYYY..........YY', //  3
  '..YyyyYp....YyyyYp...YyyyYp....YyyyYp.....YyyyYp', //  4
  '...YYYYpp....YYYYpp...YYYYpp....YYYYpp.....YYYYp', //  5
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', //  6
  'Yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', //  7
  'YyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', //  8
  'YyypYYpyypyyypyypyyypyypyyypyypyyypyypyyypyypyyy', //  9
  'YyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // 10
  'Yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', // 11
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // 12
  'pYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpY', // 13
  '......YYYY......YYYY.......YYYY.....YYYY........', // 14
  '.....YyyyYp....YyyyYp.....YyyyYp...YyyyYp.......', // 15
  '......YYYYpp....YYYYpp....YYYYpp....YYYYpp......', // 16
  '.....YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY......', // 17
  '....YyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyYp.....', // 18
  '....YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYpp.....', // 19
  '............KKKKKKKK............................', // 20
  '...........KHhhhhhhKK...........................', // 21
  '..........KHhhsssshhHKK.........................', // 22
  '.........KHsmsHsHsmsoHK.........................', // 23
  '........KHsoEEoEEsmoHK..........................', // 24
  '........KHsvvvvvvvsoK...........................', // 25
  'YYYYY...KHHmmoosmmsoKK..YYYYY...................', // 26
  'yyyyYp..KHHTTTTHHHKK....YyyyYp..................', // 27
  'YYYYYpp.KwwHTTTHwwK.....YYYYYpp.................', // 28
  '......YYYwSWTTTWSwwYYYY.........................', // 29
  '.....YyyyyWWyyyWWSwYyyyYp.......................', // 30
  '.....YYYYYYWWyWWWSwYYYYYpp......................', // 31
  '....YYYYYYYYYUUWSwwYYYYYYY......................', // 32
  '...YyyyyyyyyyyUuWSwYyyyyyYp.....................', // 33
  '...YYYYYYYYYYYYWSwwYYYYYYYpp....................', // 34
  '..YYYYYYYYYYYYYYWSwYYYYYYYYY....................', // 35
  '..YyyyyyyyyyyyyyyySwYyyyyyyYp...................', // 36
  '..YYYYYYYYYYYYYYYYYYYYYYYYYYpp..................', // 37
  '.YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY.................', // 38
  'YyyyyyyyyyyyyyyyyyyyyyyyyyyyyyYp................', // 39
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYpp...............', // 40
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY............', // 41
  'YyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyYp...........', // 42
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYpp.........', // 43
  'pYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpYpY......', // 44
  '..KHHK..KHHK....KHHK......KHHK..................', // 45
  '..KHHK..KHHK....KHHK......KHHK..................', // 46
  '..KKKK..KKKK....KKKK......KKKK..................', // 47
];

// ── DEFEAT ───────────────────────────────────────────
// Face-planted on desk surface (drawn at bottom), papers covering body
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
  '....YYYY....YYYY................................', // 13
  '...YyyyYp..YyyyYp...............................', // 14
  '....YYYYpp..YYYYpp..............................', // 15
  '...........YYYY.................YYYY............', // 16
  '..........YyyyYp...............YyyyYp...........', // 17
  '...........YYYYpp...............YYYYpp..........', // 18
  '...............YYYY.............................', // 19
  '...............YyyyYp...........................', // 20
  '...............YYYYpp...YYYY....................', // 21
  '.......................YyyyYp...................', // 22
  '...KKKKKKKKKKK..........YYYYpp..................', // 23
  '..KHhhhhhhhhhHK.................................', // 24
  '.KHhhsssssshhhHK................................', // 25
  'KHhsommmmoommsohHK..............................', // 26
  'KHsoEEvvvvEEosoHHK..............YYYY............', // 27
  'KHseeevsvseesmsoHK.............YyyyYp...........', // 28
  'KHmmmmsmsmmmmmsoK...............YYYYpp..........', // 29
  '.KHHTTTHHHHHHHHK................................', // 30
  '.KKwHTTTHwwwwwwK................................', // 31
  '..KwwSWTTTWSwwK....YYYY.........................', // 32
  '..KwSWWyyyWWSwwK..YyyyYp........................', // 33
  '.KwSWWyyyyyWWSwK...YYYYpp.......................', // 34
  '.KwSWWWUUUWWWSwwK...............................', // 35
  '.KwSWWXrrXWWWSwwK............YYYY...............', // 36
  '.KwSWWrrrrXWWWSwK...........YyyyYp..............', // 37
  '.KwwSWXrrXWWWSwwK............YYYYpp.............', // 38
  '.YYwSWmmmmWWSwwYYYY.............................', // 39
  'YyyYWmsssmmWSwwYyyyYp...........................', // 40
  'YYYYwSomssomoSYYYYYpp...........................', // 41
  'YyyyySoooHHooSyyyyyYp...........................', // 42
  'YYYYHHHKKHHHHHHKYYYYpp..........................', // 43
  'pppHHpppppKHHHHHHHHpppppppppppppppppppppppppppp.', // 44
  'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', // 45
  'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu', // 46
  'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', // 47
];

const FRAMES: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

const GRID_SIZE = 48;

const Sprite = memo(function BureaucratSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = FRAMES[state];
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const bureaucrat: CharacterArt = {
  meta: {
    id: 'bureaucrat',
    name: '公文官員',
    englishName: 'Bureaucrat',
    role: 'regulations',
    tier: 'major',
    description: '過勞文書，紫色黑眼圈、滴血紅章、永遠蓋不完的公文。',
    topic: 'regulations',
  },
  Sprite,
};

export default bureaucrat;
