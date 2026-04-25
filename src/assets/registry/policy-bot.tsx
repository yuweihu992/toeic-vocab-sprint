// policy-bot.tsx
// 政策機器人 — Clunky retro 1950s sci-fi robot dispensing rejection slips.
// 48x48 pixel-art sprite with 6 distinct poses (idle/walk/attack/hit/special/defeat).
// Faces LEFT.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ---------------------------- Palette ---------------------------- */

const PALETTE: Readonly<Record<string, string>> = {
  // silver-gray robot body
  M: '#e5e7eb', // highlight metal (upper-left lit)
  m: '#cbd5e1', // mid metal
  N: '#9ca3af', // base metal
  n: '#475569', // shadow metal
  // dark joints / bezel
  J: '#1c1917', // deep metal joint
  j: '#44403c', // mid joint
  // rivets
  o: '#0c0a09', // rivet dot
  // CRT red screen
  R: '#dc2626', // red screen base
  r: '#ef4444', // red screen mid
  P: '#fca5a5', // red screen highlight
  // screen text
  T: '#f1f5f9', // text white
  // antenna red bulb
  B: '#dc2626', // bulb base
  b: '#fca5a5', // bulb shine
  // paper printouts
  W: '#f8fafc', // paper white
  // pincer claws
  C: '#44403c', // claw dark
  c: '#78716c', // claw mid
};

/* ---------------------------- Sprites ---------------------------- *
 * Every grid below is 48 rows of exactly 48 chars. '.' = transparent.
 * Light source = upper-left. Character faces LEFT.
 * ---------------------------------------------------------------- */

// IDLE — antenna up with red bulb, arms at sides, screen shows "DENIED",
// receipt paper poking out of chest slot.
const IDLE: readonly string[] = [
  '................................................', // 0
  '................................................', // 1
  '......................bB........................', // 2
  '.....................bBBB.......................', // 3
  '......................BB........................', // 4
  '......................JJ........................', // 5
  '......................JJ........................', // 6
  '......................JJ........................', // 7
  '..................JJJJJJJJJJ....................', // 8
  '.................JMMMMMMMmmnJ...................', // 9
  '................JMMMMMMMmmmnnJ..................', // 10
  '................JMoMMMMMmmmmnJ..................', // 11
  '................JMMMMMMMmmmmnJ..................', // 12
  '................JMMMMMoMMmmmnJ..................', // 13
  '................JJJJJJJJJJJJJJ..................', // 14
  '...............JMMMMMMMMmmmmmnJ.................', // 15
  '..............JMMJJJJJJJJJJJnnnJ................', // 16
  '..............JMJRRrrrrrrRRRJmnJ................', // 17
  '..............JMJrTTrrrrrTrrJmnJ................', // 18
  '..............JMJrTrrTrTrTrPJmnJ................', // 19
  '..............JMJrTrTTrTrTrPJmnJ................', // 20
  '..............JMJrTrrTrTrTrPJmnJ................', // 21
  '..............JMJrTTrrrrrTrPJmnJ................', // 22
  '..............JMJRRrrrrrrRRPJmnJ................', // 23
  '..............JMJJJJJJJJJJJJJmnJ................', // 24
  '............JJJMmoMMMMMMMMMmmmnJJJ..............', // 25
  '...........JCCJMMMMMMMmmmmmmmmnnJCCJ............', // 26
  '...........JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 27
  '...........JCcJMMJWWWWWWWWWJmmnnJCcJ............', // 28
  '...........JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 29
  '...........JCcJMMoMMMMMMMmmmmmnnJCcJ............', // 30
  '...........JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 31
  '...........JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 32
  '...........JCcJMMMoMMMMMmmmmoMnnJCcJ............', // 33
  '...........JCcJJJJJJJJJJJJJJJJJJJCcJ............', // 34
  '...........JCcJMMmmnnJ....JMMmmnnJJJ............', // 35
  '...........JJJJMMmmnnJ....JMMmmnnJ..............', // 36
  '...............JMMmmnnJ....JMMmmnnJ.............', // 37
  '...............JMoMmmnJ....JMMomnnJ.............', // 38
  '...............JMMmmmnJ....JMMmmnnJ.............', // 39
  '...............JJJJJJJJ....JJJJJJJJ.............', // 40
  '...............JCCCCCCJ....JCCCCCCJ.............', // 41
  '...............JCccccCJ....JCccccCJ.............', // 42
  '...............JCCCCCCJ....JCCCCCCJ.............', // 43
  '...............JJJJJJJJ....JJJJJJJJ.............', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// WALK — clunky forward march, left foot stomped forward, body tilted,
// arms swinging slightly. Antenna leans from motion.
const WALK: readonly string[] = [
  '................................................', // 0
  '....................bB..........................', // 1
  '...................bBBB.........................', // 2
  '....................BB..........................', // 3
  '....................JJ..........................', // 4
  '....................JJ..........................', // 5
  '.....................JJ.........................', // 6
  '.................JJJJJJJJJJ.....................', // 7
  '................JMMMMMMMmmnJ....................', // 8
  '...............JMMoMMMMmmmnnJ...................', // 9
  '...............JMMMMMMMmmmmnJ...................', // 10
  '...............JMMMMMMoMmmmnJ...................', // 11
  '...............JMMMMMMMmmmmnJ...................', // 12
  '...............JJJJJJJJJJJJJJ...................', // 13
  '..............JMMMMMMMMmmmmmnJ..................', // 14
  '.............JMMJJJJJJJJJJJnnnJ.................', // 15
  '.............JMJRRrrrrrrRRRJmnJ.................', // 16
  '.............JMJrTTrrrrrTrrJmnJ.................', // 17
  '.............JMJrTrrTrTrTrPJmnJ.................', // 18
  '.............JMJrTrTTrTrTrPJmnJ.................', // 19
  '.............JMJrTrrTrTrTrPJmnJ.................', // 20
  '.............JMJrTTrrrrrTrPJmnJ.................', // 21
  '.............JMJRRrrrrrrRRPJmnJ.................', // 22
  '.............JMJJJJJJJJJJJJJmnJ.................', // 23
  '..........JJJMMmoMMMMMMMMMmmmnJJJ...............', // 24
  '.........JCCJMMMMMMMmmmmmmmmnnJCCJ..............', // 25
  '.........JCcJMMJJJJJJJJJJJmmnnJCcJ..............', // 26
  '.........JCcJMMJWWWWWWWWWJmmnnJCcJ..............', // 27
  '..........JJJMMJJJJJJJJJJJmmnnJJJ...............', // 28
  '.............MMoMMMMMMMmmmmmnn..................', // 29
  '.............MMMMMMMMMmmmmmmnn..................', // 30
  '.............MMMMMMMMMmmmmmmnn..................', // 31
  '.............MMMoMMMMMmmmmoMnn..................', // 32
  '.............JJJJJJJJJJJJJJJJJ..................', // 33
  '.............JMMmnJ........JMMmnnJ..............', // 34
  '............JMMmnnJ.........JMMmnnJ.............', // 35
  '...........JMMmmnnJ..........JMmmnnJ............', // 36
  '..........JMMomnnnJ..........JMMomnnJ...........', // 37
  '..........JMMmmnnJ............JMMmmnJ...........', // 38
  '..........JJJJJJJJ............JJJJJJJ...........', // 39
  '..........JCCCCCCJ............JCCCCCJ...........', // 40
  '..........JCccccCJ............JCcccCJ...........', // 41
  '..........JCCCCCCJ............JCCCCCJ...........', // 42
  '..........JJJJJJJJ............JJJJJJJ...........', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ATTACK — pincer claw thrust forward to the LEFT, screen flashing brighter,
// other arm pulled back, body braced.
const ATTACK: readonly string[] = [
  '................................................', // 0
  '......................bB........................', // 1
  '.....................bBBBb......................', // 2
  '....................rbBBBbr.....................', // 3
  '......................JJ........................', // 4
  '......................JJ........................', // 5
  '......................JJ........................', // 6
  '..................JJJJJJJJJJ....................', // 7
  '.................JMMMMMMMmmnJ...................', // 8
  '................JMMoMMMMmmmnnJ..................', // 9
  '................JMMMMMMMmmmmnJ..................', // 10
  '................JMMMMMMoMmmmnJ..................', // 11
  '................JMMMMMMMmmmmnJ..................', // 12
  '................JJJJJJJJJJJJJJ..................', // 13
  '...............JMMMMMMMMmmmmmnJ.................', // 14
  '..............JMMJJJJJJJJJJJnnnJ................', // 15
  '..............JMJPPPPPPPPPPPJmnJ................', // 16
  '..............JMJPTTPPPPPTPPJmnJ................', // 17
  '..............JMJPTPPTPTPTPPJmnJ................', // 18
  '..............JMJPTPTTPTPTPPJmnJ................', // 19
  '..............JMJPTPPTPTPTPPJmnJ................', // 20
  '..............JMJPTTPPPPPTPPJmnJ................', // 21
  '..............JMJPPPPPPPPPPPJmnJ................', // 22
  '..............JMJJJJJJJJJJJJJmnJ................', // 23
  '....JJJ.....JJJMMmoMMMMMMMMMmmmnJJJ.............', // 24
  '...JCcJ....JCCJMMMMMMMmmmmmmmmnnJCCJ............', // 25
  '..JCcJ.....JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 26
  '.JCcJJJJJJJJCcJMMJWWWWWWWWWJmmnnJCcJ............', // 27
  '.JCcJjjjjjjJCcJMMJJJJJJJJJJJmmnnJCcJ............', // 28
  '.JCcJJJJJJJJCcJMMoMMMMMMMmmmmmnnJCcJ............', // 29
  '..JCcJ.....JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 30
  '...JCcJ....JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 31
  '....JJJ....JCcJMMMoMMMMMmmmmoMnnJCcJ............', // 32
  '...........JCcJJJJJJJJJJJJJJJJJJJCcJ............', // 33
  '...........JCcJMMmmnnJ....JMMmmnnJJJ............', // 34
  '...........JJJJMMmmnnJ....JMMmmnnJ..............', // 35
  '...............JMMmmnnJ....JMMmmnnJ.............', // 36
  '...............JMoMmmnJ....JMMomnnJ.............', // 37
  '...............JMMmmmnJ....JMMmmnnJ.............', // 38
  '...............JJJJJJJJ....JJJJJJJJ.............', // 39
  '...............JCCCCCCJ....JCCCCCCJ.............', // 40
  '...............JCccccCJ....JCccccCJ.............', // 41
  '...............JCCCCCCJ....JCCCCCCJ.............', // 42
  '...............JJJJJJJJ....JJJJJJJJ.............', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// HIT — head/screen tilted right, antenna bent, sparks flying around head,
// screen text glitches, body recoils.
const HIT: readonly string[] = [
  '................................................', // 0
  '...P.....................b......................', // 1
  '..P..............P......bBb....r................', // 2
  '....P...........P.......bBb....R................', // 3
  '.P...............P.......BB....r................', // 4
  '....P..........P.........JJ.....................', // 5
  '...P............................................', // 6
  '....................JJJJJJJJJJ..................', // 7
  '...................JMMMMMMMmmnJ.................', // 8
  '....r.............JMMooMMMMmmnnJ................', // 9
  '...R.............JMMMMMMMmmmmnnJ................', // 10
  '....r............JMMMMMMoMmmmmnJ................', // 11
  '.................JMMMMMMMmmmmnnJ................', // 12
  '.................JJJJJJJJJJJJJJJ................', // 13
  '................JMMMMMMMMmmmmmnJ................', // 14
  '...............JMMJJJJJJJJJJJnnnJ...............', // 15
  '...............JMJrPrrrrrrPPrJmnJ...............', // 16
  '...............JMJrTrrrrPTrrrJmnJ...............', // 17
  '...............JMJPPrrTrPrTrrJmnJ......r........', // 18
  '...............JMJPrTPPrTrTrPJmnJ......R........', // 19
  '...............JMJrTrrTrPrTrPJmnJ......r........', // 20
  '...............JMJrPPrrrrPTrPJmnJ...............', // 21
  '...............JMJPPrrrrrrrrrJmnJ...............', // 22
  '...............JMJJJJJJJJJJJJJmnJ...............', // 23
  '............JJJMMmoMMMMMMMMMmmmnJJJ.............', // 24
  '...........JCCJMMMMMMMmmmmmmmmnnJCCJ............', // 25
  '...........JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 26
  '...........JCcJMMJWWWWWWWWWJmmnnJCcJ............', // 27
  '...........JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 28
  '...........JCcJMMoMMMMMMMmmmmmnnJCcJ............', // 29
  '...........JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 30
  '...........JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 31
  '...........JCcJMMMoMMMMMmmmmoMnnJCcJ............', // 32
  '...........JCcJJJJJJJJJJJJJJJJJJJCcJ............', // 33
  '...........JCcJMMmmnnJ....JMMmmnnJJJ............', // 34
  '...........JJJJMMmmnnJ....JMMmmnnJ..............', // 35
  '...............JMMmmnnJ....JMMmmnnJ.............', // 36
  '...............JMoMmmnJ....JMMomnnJ.............', // 37
  '...............JMMmmmnJ....JMMmmnnJ.............', // 38
  '...............JJJJJJJJ....JJJJJJJJ.............', // 39
  '...............JCCCCCCJ....JCCCCCCJ.............', // 40
  '...............JCccccCJ....JCccccCJ.............', // 41
  '...............JCCCCCCJ....JCCCCCCJ.............', // 42
  '...............JJJJJJJJ....JJJJJJJJ.............', // 43
  '......r..................r......................', // 44
  '...R.........R........R.....R...................', // 45
  '......r........r..........r..........r..........', // 46
  '................................................', // 47
];

// SPECIAL — SHOOT POLICIES: receipt slot on chest erupts with denial papers
// flying out to the LEFT, multiple rejected forms scattered.
const SPECIAL: readonly string[] = [
  '................................................', // 0
  '......................bB........................', // 1
  '.....................bBBB.......................', // 2
  '......................BB........................', // 3
  '......................JJ........................', // 4
  '......................JJ........................', // 5
  '......................JJ........................', // 6
  '..................JJJJJJJJJJ....................', // 7
  '.................JMMMMMMMmmnJ...................', // 8
  '................JMMoMMMMmmmnnJ..................', // 9
  '................JMMMMMMMmmmmnJ..................', // 10
  '................JMMMMMMoMmmmnJ..................', // 11
  '................JMMMMMMMmmmmnJ..................', // 12
  '................JJJJJJJJJJJJJJ..................', // 13
  '...............JMMMMMMMMmmmmmnJ.................', // 14
  '..............JMMJJJJJJJJJJJnnnJ................', // 15
  '..............JMJPPPPPPPPPPPJmnJ................', // 16
  '..............JMJPTTPPPPPTPPJmnJ................', // 17
  '..............JMJPTPPTPTPTPPJmnJ................', // 18
  '..............JMJPTPTTPTPTPPJmnJ................', // 19
  '..............JMJPTPPTPTPTPPJmnJ................', // 20
  '..............JMJPTTPPPPPTPPJmnJ................', // 21
  '..............JMJPPPPPPPPPPPJmnJ................', // 22
  '..............JMJJJJJJJJJJJJJmnJ................', // 23
  '............JJJMMmoMMMMMMMMMmmmnJJJ.............', // 24
  'WWWWW......JCCJMMMMMMMmmmmmmmmnnJCCJ............', // 25
  'WrWWW.WWW..JCcJMMJJJJJJJJJJJmmnnJCcJ............', // 26
  'WWrWW.WrW.WWWWWWWWWWWWWWWWWJmmnnJCcJ............', // 27
  'WWWWW.WWW.WrrWrWrWrWrrrrWrWWmmnnJCcJ............', // 28
  '.WWW.......WWWWWWWWWWWWWWWWWmmnnJCcJ............', // 29
  '...........JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 30
  '..WWW......JCcJMMMMMMMMMmmmmmmnnJCcJ............', // 31
  '.WrWW.WWW..JCcJMMMoMMMMMmmmmoMnnJCcJ............', // 32
  '.WWWW.WrWWWWWWWWWWWWWWWWWWWWWWWWWCcJ............', // 33
  '.WWW..WWWWWWrrWWrWrrWrWrWWrrWrrWWJJ.............', // 34
  '...........JJJJWWWWWWWWWWWWWWWWWW...............', // 35
  '...............JMMmmnnJ.W.WJMMmmnnJ.............', // 36
  '....WWW........JMoMmmnJ....JMMomnnJ.............', // 37
  '...WrWW.WWW....JMMmmmnJ....JMMmmnnJ.............', // 38
  '...WWWW.WrW....JJJJJJJJ....JJJJJJJJ.............', // 39
  '....WWW.WWW....JCCCCCCJ....JCCCCCCJ.............', // 40
  '...............JCccccCJ....JCccccCJ.............', // 41
  '...............JCCCCCCJ....JCCCCCCJ.............', // 42
  '...............JJJJJJJJ....JJJJJJJJ.............', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// DEFEAT — head fallen off to the left, body slumped right, sparks at neck,
// antenna detached, screen dark.
const DEFEAT: readonly string[] = [
  '................................................', // 0
  '................................................', // 1
  '................................................', // 2
  '................................................', // 3
  '................................................', // 4
  '................................................', // 5
  '................................................', // 6
  '................................................', // 7
  '................................................', // 8
  '................................................', // 9
  '................................................', // 10
  '................................................', // 11
  '................................................', // 12
  '....bB..........................................', // 13
  '...bBBb.........................................', // 14
  '....BB..........................................', // 15
  '....JJ..........................................', // 16
  '....JJ.......................r..................', // 17
  '..JJJJJJJJJJ.................R..................', // 18
  '.JMMMMMMMmmnJ.............r..r..................', // 19
  'JMMooMMMMmmnnJ............R.....................', // 20
  'JMMMMMMMmmmmnJ.....r......r.....................', // 21
  'JMMMMMMoMmmmnJ.....R............................', // 22
  'JJJJJJJJJJJJJJ..................................', // 23
  'JJnnnnnnnnnJJJ.....r..r.........................', // 24
  'JMnnnnnnnnnnJMJ....R..R...JJJJJJJJJJJJJJJJ......', // 25
  'JMnRrrrrrrRrJMJ....r.....JJMMMMMMmmmmmmnnnJJJ...', // 26
  'JMnrrrrrrrrrJMJ.........JCCJMMmmmmmmmmnnnnJCCJ..', // 27
  'JMnRRrrrrrrRJMJ........JCcJMMJJJJJJJJJJnnnJCcJ..', // 28
  'JMnJJJJJJJJJJMJ........JCcJMMJWWWWWWWWWJnnJCcJ..', // 29
  'JJJJJJJJJJJJJJJ........JCcJMMJJJJJJJJJJJnnJCcJ..', // 30
  '.......................JCcJMMmmmmmmmmnnnnnJCcJ..', // 31
  '.......................JCcJMMmmmmmmmmnnnnnJCcJ..', // 32
  '.......................JCcJMMMoMMMMMmmmmonnJCcJ.', // 33
  '.......................JCcJJJJJJJJJJJJJJJJJCcJ..', // 34
  '.......................JCcJMMmmnnJ..JMMmnnJJJ...', // 35
  '.......................JJJJMMmmnnJ..JMMmnnJ.....', // 36
  '...........................JMMmmnnJ.JMMmnnJ.....', // 37
  '...........................JMoMmmnJ.JMomnnJ.....', // 38
  '...........................JJJJJJJJ.JJJJJJJ.....', // 39
  '...........................JCCCCCCJ.JCCCCCJ.....', // 40
  '...........................JCccccCJ.JCcccCJ.....', // 41
  '...........................JCCCCCCJ.JCCCCCJ.....', // 42
  '...........................JJJJJJJJ.JJJJJJJ.....', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ------------------------ Sprite component ------------------------ */

const POSE_BY_STATE: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

const PolicyBotSprite = memo(function PolicyBotSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = POSE_BY_STATE[state] ?? IDLE;
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
      aria-label="政策機器人"
      role="img"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

/* --------------------------- CharacterArt --------------------------- */

const policyBot: CharacterArt = {
  meta: {
    id: 'policy-bot',
    name: '政策機器人',
    englishName: 'Policy Bot',
    role: 'regulations',
    tier: 'major',
    topic: 'regulations',
    description: '復古鐵皮機器人，胸口螢幕亮著「DENIED」、不停吐拒絕單。',
  },
  Sprite: PolicyBotSprite,
};

export default policyBot;
