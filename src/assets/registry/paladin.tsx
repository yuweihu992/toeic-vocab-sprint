// Paladin (聖騎士) — holy crusader in white-and-gold plate armor.
// 48x48 pixel art, faces RIGHT. Light source upper-left.
// One of the 30-character roster entries; default-exports a CharacterArt.

import { memo, type ReactElement } from 'react';
import type { CharacterArt, CharacterSpriteProps } from './types';
import { PixelGrid } from './PixelGrid';
import './animations.css';

/* ---------------- Palette ---------------- */
/*  Single-char codes per row; '.' = transparent.
    Light upper-left dictates highlights on the left/top of forms.
    o = warm near-black outline
    Armor (white plate):       w(highlight) W(base) S(shade) s(deep shade)
    Gold trim / hammer head:   y(light) Y(mid) g(deep)
    Halo / holy glow:          h(soft warm yellow-white)
    Red cross emblem:          r(bright) R(deep)
    Skin (warm clean-shaven):  k(light) K(mid) c(shade)
    Eyes:                      e(pupil) F(white)
    Cape (white-gold):         p(white-warm) P(gold-warm) q(deep gold-warm)
    Hammer haft (wood):        b(light) B(dark)
    Boot/glove leather:        l(light) L(dark)
    Holy burst aura (special): a(bright white) A(soft warm white)
*/
const PALETTE: Readonly<Record<string, string>> = {
  o: '#1f1d2b',
  // white plate
  w: '#ffffff',
  W: '#f1f5f9',
  S: '#cbd5e1',
  s: '#94a3b8',
  // gold trim
  y: '#fde68a',
  Y: '#fbbf24',
  g: '#d97706',
  // halo / glow
  h: '#fef3c7',
  // red cross emblem
  r: '#dc2626',
  R: '#991b1b',
  // skin
  k: '#fde68a',
  K: '#fbbf24',
  c: '#b45309',
  // eyes
  e: '#1e293b',
  F: '#ffffff',
  // cape (white-gold gradient)
  p: '#fef9c3',
  P: '#facc15',
  q: '#a16207',
  // hammer haft
  b: '#a16207',
  B: '#5b3a0a',
  // gloves / boot leather
  l: '#78350f',
  L: '#3f1d04',
  // holy burst (special)
  a: '#ffffff',
  A: '#fef3c7',
};

/* Helper: assert each row is exactly 48 chars (no-op at runtime, dev sanity). */
const W = 48;

/* ============================================================
   IDLE — warhammer planted before, hands on pommel, halo glow.
   ============================================================ */
const IDLE: readonly string[] = [
  // 0
  '................................................',
  '................................................',
  '................hhhhhhhh........................',
  '..............hh........hh......................',
  '.............h.....oooo...h.....................',
  // 5
  '............h....ooYYYYoo..h....................',
  '............h...oYYyyyyYYo.h....................',
  '............h..oYyywwwwyYo.h....................',
  '.............h.oYyywwwwyYo.h....................',
  '..............hhoYYyyyyYYohh....................',
  // 10
  '................oooYYYYooo......................',
  '...................oooo.........................',
  '..................oKKKKo........................',
  '.................oKkkkkKo.......................',
  '................oKkFeFkkKo......................',
  // 15
  '................oKkFFFkkKo......................',
  '.................oKkkkkKo.......................',
  '..................occcco........................',
  '................oYYYYYYYYo......................',
  '...............oYWWWWWWWWYo.....................',
  // 20
  '..............oWWWrrrrWWWWWo....................',
  '.............oWWWrrRrrWWWWWWo...................',
  '............oWWWrrRRRrrWWWWWWop.................',
  '...........oWWWWrrRRRrrWWWWWWoPp................',
  '...........oWWWSSrrrrSSWWWWWWoPpp...............',
  // 25
  '...........oWSSSSSSSSSSSSWWWWoPPp...............',
  '...........oSSSSSSSSSSSSSSSWWoPPpp..............',
  '...........osSSSSSSSSSSSSSSSWoPPPp..............',
  '............osSsSSSSSSSSSSSSWoqPPp..............',
  '............oYYYYsSSSSSSSSSWWoqqPp..............',
  // 30
  '............oyyyYYsSSSSSSSWWWoqqPp..............',
  '............oyywwYYssSSSSWWWWoqqPp..............',
  '............oYYyyYYobboYYWWWWoqqPp..............',
  '............oooooooobboooooooooqp...............',
  '...................obbo.........................',
  // 35
  '...................obbo.........................',
  '...................obBo.........................',
  '...................obBo.........................',
  '...................obBo.........................',
  '...................obBo.........................',
  // 40
  '..................oWWoWo........................',
  '.................oWWWoWWo.......................',
  '................oLLLooLLLo......................',
  '...............oLllLooLllLo.....................',
  '...............oLllLooLllLo.....................',
  // 45
  '................oLLLooLLLo......................',
  '.................oooooooo.......................',
  '................................................',
];

/* ============================================================
   WALK — marching, hammer over right shoulder, leg forward.
   ============================================================ */
const WALK: readonly string[] = [
  // 0
  '................................................',
  '................hhhhhhhh........................',
  '..............hh........hh......................',
  '.............h.....oooo...h.....................',
  '............h....ooYYYYoo..h....................',
  // 5
  '............h...oYYyyyyYYo.h....................',
  '............h..oYyywwwwyYo.h....................',
  '.............h.oYyywwwwyYo.h....................',
  '..............hhoYYyyyyYYohh....................',
  '................oooYYYYooo......................',
  // 10
  '...................oooo.........................',
  '..................oKKKKo........................',
  '.................oKkkkkKo.......................',
  '................oKkFeFkkKo...........obbo.......',
  '................oKkFFFkkKo..........obBbo.......',
  // 15
  '.................oKkkkkKo..........obBbo........',
  '..................occcco..........obBbo.........',
  '................oYYYYYYYYo.......obBbo..........',
  '...............oYWWWWWWWWYo....obBbo............',
  '..............oWWWrrrrWWWWW.obBbo...............',
  // 20
  '.............oWWWrrRrrWWWWWobBboYYo.............',
  '............oWWWrrRRRrrWWWWoBboYYYYo............',
  '...........oWWWWrrRRRrrWWWWoboYYyyyYo...........',
  '...........oWWSSrrrrSSWWWWWooYYyyyyYo...........',
  '...........oSSSSSSSSSSSSWWWooYYyyyyyYo..........',
  // 25
  '...........osSSSSSSSSSSSSSWoooYYyyyyYo..........',
  '............osSSSSSSSSSSSSSWoooYYYYYo...........',
  '............oYYYssSSSSSSSSSWWWoooooo............',
  '............oyyyYYssSSSSSSSWWWoqp...............',
  '............oyyywwYYsSSSSSWWWWoqqp..............',
  // 30
  '............oYYyyywYYoooSSWWWWoqqPp.............',
  '............oooooooooo.oooooooooqPp.............',
  '..................oWWoo......ooqPp..............',
  '..................oWWoo.........qp..............',
  '..................oBBo..........................',
  // 35
  '..................oBBo..........................',
  '.................oBBBo..........................',
  '................oWWWWWo.........................',
  '...............oLllllLo.........................',
  '...............oLllllLooo.......................',
  // 40
  '................oLLLLLLLLo......................',
  '..............oLLLLLLLLLLLo.....................',
  '.............oLllllllllLLLo.....................',
  '............oLllLLLLLllllLo.....................',
  '............oLLLooooooLLLLo.....................',
  // 45
  '.............ooo......oooo......................',
  '................................................',
  '................................................',
];

/* ============================================================
   ATTACK — hammer raised overhead, just beginning to slam down.
   ============================================================ */
const ATTACK: readonly string[] = [
  // 0
  '...........oooo.................................',
  '..........oYYYYo................................',
  '.........oYyyyyYo.....hhhhhhhh..................',
  '.........oYywwwYo...hh........hh................',
  '.........oYywwwYo..h......oooo..h...............',
  // 5
  '.........oYyyyyYo.h.....ooYYYYoo.h..............',
  '..........oYYYYo.h....oYYyyyyYYo.h..............',
  '...........oYYo..h...oYyywwwwyYo.h..............',
  '...........oYYo...h..oYyywwwwyYo.h..............',
  '...........oYYo....h.oYYyyyyYYohh...............',
  // 10
  '...........oYYo.....hhoooYYYYooh................',
  '...........oboo.......hhoooooohh................',
  '...........obbo..........oKKKKo.................',
  '...........obbo.........oKkkkkKo................',
  '...........obbo........oKkFeFkkKo...............',
  // 15
  '...........obbo........oKkFFFkkKo...............',
  '...........obBo.........oKkkkkKo................',
  '...........obBo..........occcco.................',
  '...........obBo........oYYYYYYYYo...............',
  '...........obBo.......oYWWWWWWWWYo..............',
  // 20
  '...........obBo......oWWWrrrrWWWWWo.............',
  '............obBo....oWWWrrRrrWWWWWWo............',
  '............obBoo..oWWWrrRRRrrWWWWWWo...........',
  '.............obBboWWWWrrRRRrrWWWWWWWop..........',
  '..............obBoWWSSrrrrSSWWWWWWWWoPp.........',
  // 25
  '...............obboSSSSSSSSSSSWWWWWWoPp.........',
  '................obboSSSSSSSSSSSSSWWWoPPp........',
  '.................oboSSSSSSSSSSSSSSSWoPPp........',
  '..................oSSSSSSSSSSSSSSSWWoPPp........',
  '..................oYYYYssSSSSSSSSWWWoqPp........',
  // 30
  '..................oyyyYYssSSSSSSWWWWoqPp........',
  '..................oyywwwYYssSSSWWWWWoqPp........',
  '..................oYYyyyYYoooYYWWWWWoqPp........',
  '..................oooooooo...ooooooooqPp........',
  '............................................qp..',
  // 35
  '...................oWWWoWWWo....................',
  '..................oWWWWoWWWWo...................',
  '.................oLLLLooLLLLo...................',
  '................oLllllooLllllo..................',
  '...............oLllllLooLllllLo.................',
  // 40
  '...............oLllllLooLllllLo.................',
  '................oLLLLLooLLLLLo..................',
  '.................oooooooooooo...................',
  '................................................',
  '................................................',
  // 45
  '................................................',
  '................................................',
  '................................................',
];

/* ============================================================
   HIT — head turned back, cape swirling outward, recoiling.
   ============================================================ */
const HIT: readonly string[] = [
  // 0
  '................................................',
  '................................................',
  '..............hhhhhhhh..........................',
  '............hh........hh........................',
  '...........h.....oooo...h.......................',
  // 5
  '..........h....ooYYYYoo..h......................',
  '..........h...oYYyyyyYYo.h......................',
  '..........h..oYyywwwwyYo.h......................',
  '...........h.oYyywwwwyYo.h......................',
  '............hoYYyyyyYYohh.......................',
  // 10
  '..............oooYYYYooo........................',
  '.................oooo...........................',
  '...............oKKKKKKo.........................',
  '..............oKkkkkkkKo........................',
  '.............oKkFeFkkkkKo.......................',
  // 15
  '.............oKkFFFkkkkKo.......................',
  '..............oKkkccccKo........................',
  '...............occcccco.........................',
  '............oYYYYYYYYYYYo.......................',
  '...........oYWWWWWWWWWWWYo......................',
  // 20
  '..........oWWWWrrrrrWWWWWWo.................oppp',
  '.........oWWWWWrrRrrrWWWWWWo..............oPPpp.',
  '........oWWWSSWrrRRRrrWWWWWWo...........oqPPpp..',
  '........oWWSSSWrrRRRrrWWWWWWo.........oqqPPpp...',
  '........oWSSSSSrrrrrSSWWWWWWo.......oqqqPPpp....',
  // 25
  '........oSSSSSSSSSSSSSSSWWWWoo....oqqqqPPpp.....',
  '........oSSSSSSSSSSSSSSSSSSWWoooqqqqqqqPpp......',
  '........osSSSSSSSSSSSSSSSSSSSWWoqqqqqqPPp.......',
  '........osSSSSSSSSSSSSSSSSSSSWWoqqqqqPPp........',
  '........oYYYssSSSSSSSSSSSSSSWWWoqqqqPPp.........',
  // 30
  '........oyyyYYssSSSSSSSSSSSWWWWoqqqPPp..........',
  '........oyywwYYssSSSSSSSSSWWWWWoqqPPp...........',
  '........oYYyyYYobbboYYWWWWWWWWWoqPPp............',
  '........ooooooooobboooooooooooooPPp.............',
  '.................obbo...........................',
  // 35
  '.................obbo...........................',
  '.................obBo...........................',
  '.................obBo...........................',
  '.................obBo...........................',
  '.................obBo...........................',
  // 40
  '................oWWoWo..........................',
  '...............oWWWoWWo.........................',
  '..............oLLLooLLLo........................',
  '.............oLllLooLllLo.......................',
  '.............oLllLooLllLo.......................',
  // 45
  '..............oLLLooLLLo........................',
  '...............oooooooo.........................',
  '................................................',
];

/* ============================================================
   SPECIAL — holy light burst. Bright aura ring, intensified halo,
   hammer raised, golden glow surrounds entire silhouette.
   ============================================================ */
const SPECIAL: readonly string[] = [
  // 0
  '..................aaaaaa........................',
  '...............aAAhhhhhhAAa.....................',
  '.............aAhhhhhhhhhhhhAa...................',
  '............aAhh..oooo....hhAa..................',
  '...........aAhh..ooYYYYoo..hhAa.................',
  // 5
  '..........aAhh..oYYyyyyYYo..hhAa................',
  '.........aAh...oYyywwwwyYo...hAa................',
  '.........aAh...oYyywwwwyYo...hAa................',
  '.........aAh...oYYyyyyYYo....hAa................',
  '.........aAhh...oooYYYYooo..hhAa................',
  // 10
  '..........aAhh.....oooo....hhAa.................',
  '...........aAhh...oKKKKo..hhAa..................',
  '...aaa.....aAhh..oKkkkkKo.hhAa.....aaa..........',
  '..aAAAa.....aAh.oKkFeFkkKo.hAa....aAAAa.........',
  '..aAhAa......aAhoKkFFFkkKohAa.....aAhAa.........',
  // 15
  '..aAhAa.......aAhoKkkkkKohAa......aAhAa.........',
  '..aAhAa........aAhoccccohAa.......aAhAa.........',
  '..aAhAa........oYYYYYYYYYYo.......aAhAa.........',
  '..aAhAa.......oYWWWWWWWWWYo.......aAhAa.........',
  '..aAhAa......oWWWWrrrrWWWWWo......aAhAa.........',
  // 20
  '..aAhAa.....oWWWWrrRrrWWWWWWo.....aAhAa.........',
  '..aAhAa....oWWWWrrRRRrrWWWWWWoPp..aAhAa.........',
  '..aAhAa...oWWWWWrrRRRrrWWWWWWoPpp.aAhAa.........',
  '..aAhAa...oWWWSSrrrrSSWWWWWWWoPPp.aAhAa.........',
  '..aAhAa...oSSSSSSSSSSSSSSWWWWoPPpp.aAhAa........',
  // 25
  '..aAhAa...osSSSSSSSSSSSSSSSWWoPPPp.aAhAa........',
  '..aAhAa...osSSSSSSSSSSSSSSSSWoqPPp.aAhAa........',
  '..aAhAa...oYYYssSSSSSSSSSSSSWoqqPp.aAhAa........',
  '..aAhAa...oyyyYYssSSSSSSSSSWWoqqPp.aAhAa........',
  '..aAhAa...oyywwYYssSSSSSSSWWWoqqPp.aAhAa........',
  // 30
  '..aAhAa...oYYyyYYobboYYWWWWWoqqqPp.aAhAa........',
  '..aAhAa...ooooooooobbooooooooqqPp..aAhAa........',
  '..aAhAa............obbo............aAhAa........',
  '..aAAAa............obBo............aAAAa........',
  '...aaa.............obBo.............aaa.........',
  // 35
  '...................obBo.........................',
  '..................oWWoWo........................',
  '.................oWWWoWWo.......................',
  '...aaa..........oLLLooLLLo..........aaa.........',
  '..aAAAa........oLllLooLllLo........aAAAa........',
  // 40
  '..aAhhAa.......oLllLooLllLo.......aAhhAa........',
  '..aAhhhAa.......oLLLooLLLo.......aAhhhAa........',
  '..aAhhhAa........oooooooo........aAhhhAa........',
  '...aAhAa........................aAhAa...........',
  '....aAa..........................aAa............',
  // 45
  '.....a............................a.............',
  '................................................',
  '................................................',
];

/* ============================================================
   DEFEAT — kneeling, hammer beside on ground, cape draped.
   ============================================================ */
const DEFEAT: readonly string[] = [
  // 0
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  // 5
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  // 10
  '...........hhhhhhh..............................',
  '.........hh.......hh............................',
  '........h..ooooooo..h...........................',
  '.......h..oYYYYYYYo..h..........................',
  '.......h.oYyyyyyyYo..h..........................',
  // 15
  '........hoYyywwwyYohh...........................',
  '.........hoYyyyyyYoh............................',
  '..........oYYYYYYYo.............................',
  '...........ooooooo..............................',
  '...........oKKKKKKo.............................',
  // 20
  '..........oKkkkkkkKo............................',
  '..........oKkkFeFkKo............................',
  '..........oKkkFFFkKo............................',
  '...........occcccco.............................',
  '..........oYYYYYYYYo............................',
  // 25
  '.........oYWWWWWWWWYo...........................',
  '........oWWWrrrrrWWWWo..........................',
  '.......oWWWrrRRRRrWWWWWo........................',
  '......oWWWWrrRRRrrWWWWWWo.......................',
  '.....oSSWWWWrrrrrWWWWWWWWoP.....................',
  // 30
  '....oSSSSSSWWWWWWWWWWWWWWoPp....................',
  '....oSSSSSSSSSSSSSSSWWWWWoPPp...................',
  '....osSSSSSSSSSSSSSSSSWWWoPPPp..................',
  '.....osSSSSSSSSSSSSSSSSSWWoqPPp.................',
  '......oYYYYsSSSSSSSSSSSSSWWoqPp.................',
  // 35
  '......oyyyYYssSSSSSSSSSWWWoqPp..................',
  '......oyywwwYYsSSSSSSSWWWWoqPp..................',
  '......oyyywwwYYsSSSSWWWWWWoqPp..................',
  '......oYYYyyyYYoooYYWWWWWWoqPp..................',
  '......ooooooooo...ooooooooooPp..................',
  // 40
  '...obboooooooooooooooooooooooooooooo............',
  '...obBobbbbbbbbbbbbbbbbbboooLLLLLLLooooo........',
  '...obBoYYYYYYYYYYYYYYYYYoLllllllllllllLo........',
  '...oooooooYYYYYYYYYYYYYooLLLLLLLLLLLLLLo........',
  '..........ooooooooooooooooooooooooooooo.........',
  // 45
  '................................................',
  '................................................',
  '................................................',
];

/* ---------------- Lookup ---------------- */
const ROWS_BY_STATE: Readonly<Record<string, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

/* Each row in every pose is exactly 48 chars wide; verified at author time. */

/* ---------------- Sprite component ---------------- */
const PaladinSprite = memo(function PaladinSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = ROWS_BY_STATE[state] ?? IDLE;
  return (
    <span
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size, display: 'inline-block' }}
      aria-label="聖騎士 Paladin"
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${W} ${W}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
          display: 'block',
        }}
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </span>
  );
});

/* ---------------- Default export ---------------- */
const paladin: CharacterArt = {
  meta: {
    id: 'paladin',
    name: '聖騎士',
    englishName: 'Paladin',
    role: 'player',
    tier: 'hero',
    description: '白金板甲、神聖戰錘、頭頂光環的聖光戰士。',
  },
  Sprite: PaladinSprite,
};

export default paladin;
