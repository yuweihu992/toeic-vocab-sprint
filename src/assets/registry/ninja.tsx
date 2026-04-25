// Character: 忍者 (Ninja) — stealth assassin, hero tier, faces RIGHT.
// 48x48 pixel grid. Six distinct poses. No animation libraries.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

// Palette key:
//   K = darkest cloth (#0f172a)   D = mid charcoal (#1e293b)
//   d = light charcoal (#334155)  W = white eye slits (#f8fafc)
//   s = skin around eyes light (#fde68a)  S = skin shadow (#fbbf24)
//   r = sash light (#dc2626)  R = sash mid (#b91c1c)  X = sash dark (#991b1b)
//   m = kunai light (#cbd5e1) M = kunai dark (#9ca3af)
//   c = smoke light (#e5e7eb) C = smoke mid (#d1d5db) g = smoke dark (#9ca3af)
const PALETTE: Readonly<Record<string, string>> = {
  K: '#0f172a',
  D: '#1e293b',
  d: '#334155',
  W: '#f8fafc',
  s: '#fde68a',
  S: '#fbbf24',
  r: '#dc2626',
  R: '#b91c1c',
  X: '#991b1b',
  m: '#cbd5e1',
  M: '#9ca3af',
  c: '#e5e7eb',
  C: '#d1d5db',
  g: '#9ca3af',
};

// All rows are exactly 48 chars wide. '.' = transparent.
// Column ruler:        0         1         2         3         4
//                      0123456789012345678901234567890123456789012345678

// ── idle ───────────────────────────────────────────────────────────────
// Low crouch, hood up, eye slits forward, kunai held ready at sides.
const IDLE: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '................................................', // 05
  '................................................', // 06
  '................................................', // 07
  '...................KKKKKKK......................', // 08
  '..................KDDDDDDDK.....................', // 09
  '.................KDdddddddDK....................', // 10
  '.................KDddddddddK....................', // 11
  '.................KDdssssdddK....................', // 12
  '.................KDdsWWsdddK....................', // 13
  '.................KDdsWWsdddK....................', // 14
  '.................KDdSssSdddK....................', // 15
  '.................KKDdddddDKK....................', // 16
  '..................KKDDDDDKK.....................', // 17
  '................KKKKDDDDKKKK....................', // 18
  '...............KDDDKKKKKKDDDK...................', // 19
  '..............KDDdDDDDDDDDdDDK..................', // 20
  '.............KDddDDDDDDDDDDddDK.................', // 21
  '.............KDdddDDDDDDDDdddDK.................', // 22
  '............KDdddDDDDDDDDDDdddDK................', // 23
  '............KDdddRRRRRRRRRRdddDK................', // 24
  '............KDdddrrrRRRRRrrrdddK................', // 25
  '....KMmK....KDdrXrrRRRrrXrdD....KMmK............', // 26
  '....KMmK....KDdRRRRRRRRRRRdD....KMmK............', // 27
  '....KMmK....KDDddDDDDDDddDD.....KMmK............', // 28
  '....KMmK....KDDddDDDDDDddDD.....KMmK............', // 29
  '....KMmK.....KDDdddddddDK.......KMmK............', // 30
  '....KMmK.....KDdddDDdddDK.......KMmK............', // 31
  '....KMmK.....KDddDDDDddDK.......KMmK............', // 32
  '....KMmK......KDdDDDDdDK........KMmK............', // 33
  '....KKKK......KDdDDDDdDK........KKKK............', // 34
  '..............KDDDDDDDDK........................', // 35
  '..............KDDDDDDDDK........................', // 36
  '..............KDDDD.DDDK........................', // 37
  '.............KDDDDD.DDDDK.......................', // 38
  '.............KDDDDD.DDDDK.......................', // 39
  '............KDDdDDD.DDDddK......................', // 40
  '............KDdddDD.DDdddK......................', // 41
  '...........KKDdddDD.DDddDKK.....................', // 42
  '...........KKKKKKKK.KKKKKKK.....................', // 43
  '........KKKKKDDDDKK.KKDDDDKKKKK.................', // 44
  '.......KDDDDDDDDDDK.KDDDDDDDDDDK................', // 45
  '.......KKKKKKKKKKKK.KKKKKKKKKKKK................', // 46
  '................................................', // 47
];

// ── walk ──────────────────────────────────────────────────────────────
// Stealthy creep: front (right) foot extended toe-first, back leg bent.
const WALK: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '................................................', // 05
  '................................................', // 06
  '....................KKKKKKK.....................', // 07
  '...................KDDDDDDDK....................', // 08
  '..................KDdddddddDK...................', // 09
  '..................KDddddddddK...................', // 10
  '..................KDdssssdddK...................', // 11
  '..................KDdsWWsdddK...................', // 12
  '..................KDdsWWsdddK...................', // 13
  '..................KDdSssSdddK...................', // 14
  '..................KKDdddddDKK...................', // 15
  '...................KKDDDDDKK....................', // 16
  '..................KKKKDDDKKKKK..................', // 17
  '.................KDDDKKKKKDDDK..................', // 18
  '................KDDdDDDDDDDdDDK.................', // 19
  '...............KDddDDDDDDDDddDK.................', // 20
  '...............KDdddDDDDDDdddDK.................', // 21
  '..............KDdddDDDDDDDDdddDK................', // 22
  '..............KDdddRRRRRRRRdddDK................', // 23
  '..............KDdddrrrRRRrrrdddK................', // 24
  '....KMmK......KDdrXrrRRrrXrdDK..................', // 25
  '....KMmK......KDdRRRRRRRRRRdDK......KMmK........', // 26
  '....KMmK......KDDddDDDDDDddDK.......KMmK........', // 27
  '....KMmK......KDDddDDDDDDddDK.......KMmK........', // 28
  '....KMmK.......KDDdddddddDK.........KMmK........', // 29
  '....KMmK.......KDdddDDdddDK.........KMmK........', // 30
  '....KMmK.......KDddDDDDddDK.........KKKK........', // 31
  '....KMmK........KDdDDDDdDK......................', // 32
  '....KKKK........KDdDDDDdDK......................', // 33
  '................KDDDDDDDDK......................', // 34
  '...............KDDDDDDDDDDK.....................', // 35
  '...............KDDDDDDDDDDK.....................', // 36
  '...............KDDDDD.DDDDK.....................', // 37
  '..............KDDdDDD.DDDddK....................', // 38
  '..............KDdddDD.DDdddK....................', // 39
  '.............KKDdddDD.DDddDKK...................', // 40
  '.............KKKKDDD...DDDKKKK..................', // 41
  '..........KKKKDDDDD.....DDDDKKKK................', // 42
  '.........KDDDDDDDDD......DDDDDDDDDDK............', // 43
  '.........KKKKKKKKKK......KKKKKKKKKKK............', // 44
  '.........................KKKKKKKKKKK............', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── attack ────────────────────────────────────────────────────────────
// Lunging right, kunai thrust forward, blade extended past body.
const ATTACK: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '................................................', // 05
  '..............KKKKKKK...........................', // 06
  '.............KDDDDDDDK..........................', // 07
  '............KDdddddddDK.........................', // 08
  '............KDddddddddK.........................', // 09
  '............KDdssssdddK.........................', // 10
  '............KDdsWWsdddK.........................', // 11
  '............KDdsWWsdddK.........................', // 12
  '............KDdSssSdddK.........................', // 13
  '............KKDdddddDKK.........................', // 14
  '.............KKDDDDDKK..........................', // 15
  '..........KKKKKKDDDKKKKKKK......................', // 16
  '.........KDDDDDKKKKKDDDDDDK.....................', // 17
  '........KDDdDDDDDDDDDDDDDDDK....................', // 18
  '.......KDddDDDDDDRRRRRDDDDDDK...................', // 19
  '.......KDdddDDDDRrrrrrRDDDDDK...................', // 20
  '......KDdddDDDDRrXRRrXrRDDDDDK..................', // 21
  '......KDdddDDDDRrrRRRRrRDDDDDK..................', // 22
  '......KDdddDDDDRRRRRRRRRDDDDDKMmKKKKKKKK........', // 23
  '......KKDdddDDDDDDDDDDDDDDDDDDKMmMMmMMmMK.......', // 24 placeholder fix below
  '.......KKDdddDDDDDDDDDDDDDDDDDKKKKKKKKKKK.......', // 25 placeholder fix below
  '........KKDddDDDDDDDDDDDDDDDDDK.................', // 26
  '.........KKDdDDDDDDDDDDDDDDDDK..................', // 27
  '..........KKDDDDDDDDDDDDDDDDK...................', // 28
  '...........KKDDDDDDDDDDDDDDK....................', // 29
  '....KMmK...KDDDDDDDDDDDDDDK.....................', // 30
  '....KMmK...KDDDDDDDDDDDDDK......................', // 31
  '....KMmK...KKDDDDDDDDDDDDK......................', // 32
  '....KMmK....KDDDDDDDDDDDK.......................', // 33
  '....KMmK.....KDDDDDDDDDK........................', // 34
  '....KKKK......KDDDDDDDK.........................', // 35
  '..............KDDDDDDDK.........................', // 36
  '.............KDDDD.DDDK.........................', // 37
  '............KDDDDD.DDDK.........................', // 38
  '............KDDDDD.DDDK.........................', // 39
  '...........KDDdDDD.DDDdK........................', // 40
  '...........KDdddDD.DDddK........................', // 41
  '..........KKDdddDD.DDddKK.......................', // 42
  '.......KKKKKDDDKK..KKDDKKKKK....................', // 43
  '......KDDDDDDDDDK..KDDDDDDDDDK..................', // 44
  '......KKKKKKKKKKK..KKKKKKKKKKK..................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── hit ───────────────────────────────────────────────────────────────
// Jerked back mid-air, body arched, arms flung outward, legs off ground.
const HIT: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '................................................', // 02
  '................................................', // 03
  '................................................', // 04
  '................................................', // 05
  '................................................', // 06
  '................................................', // 07
  '...........................KKKKKKK..............', // 08
  '..........................KDDDDDDDK.............', // 09
  '.........................KDdddddddDK............', // 10
  '.........................KDddddddddK............', // 11
  '.........................KDdsSSSdddK............', // 12
  '.........................KDdsWWsdddK............', // 13
  '.........................KDdSWWSdddK............', // 14
  '.........................KDdSssSdddK............', // 15
  '.........................KKDdddddDKK............', // 16
  '..........................KKDDDDDKK.............', // 17
  '....KKKK................KKKKKDDDKKKK............', // 18
  '....KMmK..............KKDDDDKKKKKDDDK...........', // 19
  '....KMmK............KKDDdDDDDDDDDDDDDK..........', // 20
  '....KMmK..........KKDDddDDDDDDDDDDDDDK..........', // 21
  '....KMmK........KKDDDdddRRRRRRRRDDDDDK..........', // 22
  '....KMmK......KKDDDDdddrrrRRRrrrDDDDDK..........', // 23
  '....KKKK....KKDDDDDDdddrXrRRRrXrDDDDDK..........', // 24
  '..........KDDDDDDDDDDddRRRRRRRRRRDDDDK..........', // 25
  '..........KKDDDDDDDDDdDDDDDDDDDDDDDDDK..........', // 26
  '...........KKDDDDDDDDDDDDDDDDDDDDDDDK...........', // 27
  '............KKDDDDDDDDDDDDDDDDDDDDDK............', // 28
  '.............KKDDDDDDDDDDDDDDDDDDDK.............', // 29
  '..............KKDDDDDDDDDDDDDDDDDK..............', // 30
  '..............KDDDDDDDDDDD.DDDDDDK..............', // 31
  '..............KDDDDDDDDDD...DDDDDK..............', // 32
  '..............KKDDDDDDDDD...DDDDKK..............', // 33
  '...............KKDDDDDDDD...DDDDKK..............', // 34
  '................KKDDDDDDD...DDDDKK..............', // 35
  '.................KKDDDDDD...DDDDKK..............', // 36
  '..................KKDDDDD...DDDKKK..............', // 37
  '...................KKDDDD...DDKKK...............', // 38
  '....................KKDDD...DKKK................', // 39
  '.....................KKDD...DKK.................', // 40
  '......................KKDD.DKK..................', // 41
  '.......................KKDDDKK..................', // 42
  '........................KKDKK...................', // 43
  '.........................KKK....................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── special ───────────────────────────────────────────────────────────
// Smoke-cloud appearance: ninja silhouette behind drifting smoke pixels.
const SPECIAL: readonly string[] = [
  '................................................', // 00
  '................................................', // 01
  '..........c.....c..c.....c....c.................', // 02
  '.........cCc..ccCcc.cCc.cCc..cCc................', // 03
  '........cCccccCCCcccCCccCCcccCCc................', // 04
  '.......cCCgCCCgCCggCCgCCgCCgCCCg................', // 05
  '......cCCgCCggCCggCCgCCgCCggCCCgCc..............', // 06
  '.....cCCggCCKKKKKKKgCCgCCgCCggCCgC..............', // 07
  '....cCCggCCKDDDDDDDKgCCgCCgCCggCCgC.............', // 08
  '...cCCggCgKDdddddddDKgCgCCgCCggCCggCc...........', // 09
  '...cCggCCCKDdsdddddDKCgCCgCCgCCggCCgC...........', // 10
  '..cCCggCCgKDdsWWsddDKgCCgCCgCCggCCgCC...........', // 11
  '..cCgCCggCKDdsWWsddDKCggCCgCCgCCggCCgC..........', // 12
  '..cCggCCggKKDdSsSdDKKggCCgCCgCCggCCggC..........', // 13
  '...cCgCCggCKKDdddDKKgCCgCCgCCgCCggCCggC.........', // 14
  '...cCggCgCCKKKDDDKKKCggCCggCCggCCggCCgC.........', // 15
  '....cCggCCgKKDDDDDKKgCCggCCggCCgCCggCCc.........', // 16
  '.....cCggCKDDDDDDDDDKgCCggCCggCCggCCgCc.........', // 17
  '......cCggKDdDDDDDDdDKgCCggCCgCCggCCggC.........', // 18
  '.....cCgCKDddDDDDDDddDKCggCCggCCggCCgCc.........', // 19
  '....cCggCKDddRRRRRRddDKgCCggCCggCCggCCc.........', // 20
  '...cCggCCKDddrXRRrXddDKCggCCggCCgCCggCc.........', // 21
  '..cCgCCggKDddRRRRRRddDKggCCggCCggCCggCc.........', // 22
  '..cCggCCgKKDddDDDDDddKKggCCggCCggCCgCCc.........', // 23
  '..cCgCCggCKKDddDDDddDKCggCCggCCggCCggCc.........', // 24
  '...cCggCCgCKDddddddDKgCCggCCgCCggCCgCCc.........', // 25
  '....cCgCCggKDdddDdddKgCCggCCggCCggCCgCc.........', // 26
  '.....cCggCCKDddDDDddKCggCCggCCgCCggCCCc.........', // 27
  '......cCgCCKKDdDDDdDKKggCCggCCggCCgCCCc.........', // 28
  '......cCggCCKDDDDDDDKCggCCggCCggCCggCCc.........', // 29
  '.....cCgCCggKDDDDDDDKgCCggCCggCCggCCgCc.........', // 30
  '....cCggCCgCKDDDD.DDDKgCCggCCggCCggCCCc.........', // 31
  '...cCgCCggCCKDDDD.DDDKCggCCggCCgCCggCCc.........', // 32
  '...cCggCCgCCKDDdD.DddKgCCggCCggCCggCCgC.........', // 33
  '....cCgCCggCKDddD.DddKCggCCggCCggCCggCC.........', // 34
  '.....cCggCCKKDddD.DddKKgCCggCCggCCggCCgC........', // 35
  '......cCgCKKKDDDK.KDDKKKgCCggCCgCCggCCgC........', // 36
  '.......cCcKDDDDKK.KKDDDDKCggCCggCCggCCgC........', // 37
  '......cCggKKKKKKK.KKKKKKKgCCggCCggCCgCCC........', // 38
  '.....cCgCCgCCggCCgCCggCCgCCggCCgCCggCCgCc.......', // 39
  '....cCggCCgCCggCCggCCgCCggCCggCCggCCggCCc.......', // 40
  '...cCgCCggCCgCCggCCgCCggCCgCCggCCggCCgCc........', // 41
  '....cCggCCcCCccCCccCCccCCccCCccCCccCCcCc........', // 42
  '.....cCgCcccCcccCcccCcccCcccCcccCcccCcc.........', // 43
  '......cCccccccccccccccccccccccccccccc...........', // 44
  '.......cccc.cccc.cccc.cccc.cccc.cccc............', // 45
  '........cc...cc...cc...cc...cc...cc.............', // 46
  '................................................', // 47
];

// ── defeat ────────────────────────────────────────────────────────────
// Kneeling forward, head bowed, kunai dropped on the ground.
const DEFEAT: readonly string[] = [
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
  '....................KKKKKKK.....................', // 18
  '...................KDDDDDDDK....................', // 19
  '..................KDdddddddDK...................', // 20
  '..................KDdddddddDK...................', // 21
  '..................KDdsssssdDK...................', // 22
  '..................KDdsWWWsdDK...................', // 23
  '..................KDdSsssSdDK...................', // 24
  '..................KKDddddDKK....................', // 25
  '...................KKDDDDKK.....................', // 26
  '..................KKKDDDDKKK....................', // 27
  '.................KDDDDDDDDDDK...................', // 28
  '................KDDdDDDDDDDdDK..................', // 29
  '...............KDDdddRRRRRdddDK.................', // 30
  '..............KDDdddrXRRRXrddDDK................', // 31
  '.............KDDddddRRRRRRRddddDK...............', // 32
  '............KDDdddddRRRRRRRRddddDK..............', // 33
  '...........KDDDdddddDDDDDDDDDddddDK.............', // 34
  '..........KDDDDddddDDDDDDDDDDDDddDDK............', // 35
  '.........KDDDDDDddDDDDDDDDDDDDDDDDDDK...........', // 36
  '........KDDDDDDDDDDDDDDDDDDDDDDDDDDDDK..........', // 37
  '........KKDDDDDDDDDDDDDDDDDDDDDDDDDDDK..........', // 38
  '.........KKDDDDDDDDDDDDDDDDDDDDDDDDDKK..........', // 39
  '..........KKDDDDDDDDDDDDDDDDDDDDDDDKK...........', // 40
  '...........KKDDDDDDDDDDDDDDDDDDDDDKK............', // 41
  '............KKKKKKKKKKKKKKKKKKKKKKK.............', // 42
  '..........KMMmmmK..................KMMmmmK......', // 43
  '.........KMMmmmmmK................KMMmmmmmK.....', // 44
  '..........KMMmmmK..................KMMmmmK......', // 45
  '...........KKKKK....................KKKKK.......', // 46
  '................................................', // 47
];

const SPRITES: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

const NinjaSprite = memo(function NinjaSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = SPRITES[state];
  return (
    <span
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size, display: 'inline-block' }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </span>
  );
});

const ninja: CharacterArt = {
  meta: {
    id: 'ninja',
    name: '忍者',
    englishName: 'Ninja',
    role: 'player',
    tier: 'hero',
    description: '黑衣暗殺者，雙苦無、紅腰帶、煙幕特技。',
  },
  Sprite: NinjaSprite,
};

export default ninja;
