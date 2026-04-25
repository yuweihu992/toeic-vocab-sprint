// hr-manager.tsx
// 兇悍 HR 經理 — Cold corporate executor.
// 48x48 pixel-art sprite with 6 distinct poses (idle/walk/attack/hit/special/defeat).

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ---------------------------- Palette ---------------------------- */

const PALETTE: Readonly<Record<string, string>> = {
  // hair
  K: '#0c0a09', // severe black
  k: '#1c1917', // hair highlight
  // skin
  s: '#f5e6d3', // pale corporate skin
  S: '#e7c9a3', // skin shadow
  // pinstripe charcoal suit
  J: '#1e293b', // jacket dark
  j: '#334155', // jacket mid
  p: '#475569', // pinstripe (lighter line)
  // shirt
  W: '#f8fafc',
  w: '#e2e8f0',
  // lipstick
  L: '#7f1d1d',
  l: '#991b1b',
  // red badge / pen / X marks / ink splatter
  R: '#dc2626',
  r: '#ef4444',
  // wood clipboard
  B: '#92400e',
  b: '#78350f',
  // eye / pupil pin-prick
  E: '#000000',
};

/* --------------------- Row construction helper ------------------- *
 * `pad(s)` pads a row with trailing '.' so it is exactly 48 chars,
 * and asserts (in dev) that it never starts longer than 48.
 * Computed once at module load for each pose.
 * ---------------------------------------------------------------- */

const CANVAS = 48;
function pad(s: string): string {
  if (s.length >= CANVAS) return s.slice(0, CANVAS);
  return s + '.'.repeat(CANVAS - s.length);
}
function blank(): string {
  return '.'.repeat(CANVAS);
}

/* ---------------------------- Sprites ---------------------------- *
 * Each pose is built from `pad(...)` so every row is exactly 48 chars
 * regardless of how the source string was edited.
 * Light source = upper-left.
 * ---------------------------------------------------------------- */

// IDLE — clipboard at chest, judgmental stance, perfectly still bun.
const IDLE: readonly string[] = [
  blank(),
  blank(),
  blank(),
  pad('....................KKKKKK'),
  pad('..................KKkkkkkkKK'),
  pad('.................KkkkkkkkkkkK'),
  pad('.................KkkkkkkkkkkK'),
  pad('................KKkkkkkkkkkkKK'),
  pad('...............KKkkkkkkkkkkkkKK'),
  pad('..............KKkkssssssssssKKKK'),
  pad('..............KkksssssssssssSkKK'),
  pad('.............KkksssEsssssEsssSkK'),
  pad('.............KkksssEEsssEEsssSkK'),
  pad('.............KkssssssssssssssSkK'),
  pad('.............KkssssssLLLLssssSkK'),
  pad('..............KkssssLllllLssSkK'),
  pad('...............KksssssLLLLssSkK'),
  pad('................KkssssssssSkK'),
  pad('.................KKKsssssKK'),
  pad('..................WWWWWWWW'),
  pad('................JWWWWWWWWWWJ'),
  pad('...............JjWWRRRRRWWWjJ'),
  pad('..............JjjjWWRrrRRWWjjjJ'),
  pad('.............JjpjjWWWWWWWWWjpjjJ'),
  pad('............JjjjjjBBBBBBBBBjjjjjJ'),
  pad('............JjpjjjBwwwwwwwBjjjpjJ'),
  pad('............JjjjjjBwXwwXwwBjjjjjJ'),
  pad('............JjjjpjBwwwwwwwBjjpjjJ'),
  pad('............JjjjjjBwXwwXwwBjjjjjJ'),
  pad('............JjpjjjBwwwwwwwBjjjpjJ'),
  pad('............JjjjjjBBBBBBBBBjjjjjJ'),
  pad('............JjjjpjjjjjjjjjjjpjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjpjjjjjjjjjjjjjjjpjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjjjjpjjjjjjjjpjjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JJJJJJJJ....JJJJJJJJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjpjjjjJ....JjjjpjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjjpjjjJ....JjjpjjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............KKKKKKKK....KKKKKKKK'),
  pad('............KKKKKKKK....KKKKKKKK'),
  blank(),
];

// WALK — mid-stride, brisk, heels clicking. One leg forward, slight tilt.
const WALK: readonly string[] = [
  blank(),
  blank(),
  pad('.....................KKKKKK'),
  pad('...................KKkkkkkkKK'),
  pad('..................KkkkkkkkkkkK'),
  pad('..................KkkkkkkkkkkK'),
  pad('..................KKkkkkkkkkKK'),
  pad('...................KKkkkkkkKK'),
  pad('................KKkksssssssKK'),
  pad('...............KkksssssssssSkKK'),
  pad('..............KkksssEsssssEsSkK'),
  pad('..............KksssEEsssEEssSkK'),
  pad('..............KkssssssssssssSkK'),
  pad('..............KksssssLLLLLssSkK'),
  pad('...............KkssssLlllLsSkK'),
  pad('................KkssssLLLsSkK'),
  pad('.................KKKsssssKK'),
  pad('................JWWWWWWWWWWJ'),
  pad('...............JjWWWRRRRRWWjJ'),
  pad('..............JjjWWWRrrRRWWjjJ'),
  pad('.............JjpjWWWWWWWWWWjpjJ'),
  pad('............JjjjjBBBBBBBBBBjjjjJ'),
  pad('............JjpjjBwwwwwwwwBjjpjJ'),
  pad('............JjjjjBwXwwXwwwBjjjjJ'),
  pad('............JjjjpBwwwwwwwwBjjpjJ'),
  pad('............JjjjjBBBBBBBBBBjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjpjjjjjjjjjjjjjpjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjjjjpjjjjjjjpjjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjJ'),
  pad('.............Jjjjjjjjjjjjjjjjjj'),
  pad('.............Jjjjjjjjjjjjjjjjjj'),
  pad('..............JJJJJJJ..JJJJJJJ'),
  pad('..............JjjjjjJ..JjjjjjJ'),
  pad('..............JjpjjjJ..JjjjpjJ'),
  pad('...............JjjjjJ..JjjjjJ'),
  pad('...............JjjjjJ..JjjjjJ'),
  pad('................JjjjJ..JjjjJ'),
  pad('................JjjjJ...JjjJ'),
  pad('...............JjjjjJ....JjjJ'),
  pad('..............JjjjjjJ.....JjjJ'),
  pad('............KKKKKKKKK......KKKKKK'),
  pad('...........KKKKKKKKK........KKKKKK'),
  pad('............kkkkk...........kkkkk'),
  blank(),
  blank(),
  blank(),
];

// ATTACK — clipboard slammed forward, red pen jabbed to the right.
const ATTACK: readonly string[] = [
  blank(),
  blank(),
  blank(),
  pad('...................KKKKKK'),
  pad('.................KKkkkkkkKK'),
  pad('................KkkkkkkkkkkK'),
  pad('................KkkkkkkkkkkK'),
  pad('...............KKkkkkkkkkkkKK'),
  pad('..............KKkkkkkkkkkkkkKK'),
  pad('.............KKkkssssssssssKKK'),
  pad('.............KkksssssssssssSkK'),
  pad('............KkksssEEsssssEEsSkK'),
  pad('............KkssEEEsssssEEEsSkK'),
  pad('............KkssssssssssssssSkK'),
  pad('............KksssssLLLLLLLssSkK'),
  pad('.............KkssssLllllllLsSkK'),
  pad('..............KksssssLLLLssSkK'),
  pad('...............KKKsssssssK'),
  pad('................WWWWWWWWW'),
  pad('...............JWWWWWWWWWJ'),
  pad('..............JjWWRRRRRWWWjJ'),
  pad('.............JjjWWRrrRRWWWWjJ'),
  pad('............JjpjWWWWWWWWWWWWjJBBBBBBBBBBBBB'),
  pad('...........JjjjjjWWWWWWWWWWWjBwwwwwwwwwwwwB'),
  pad('...........JjpjjjjWWWWWWWWWWBwXXXwwwwXXwwwB'),
  pad('...........JjjjjjjjjWWWWWWWWBwXwwwwwwwwwXwBrrr'),
  pad('...........JjjjpjjjjjjjjjjjjBwwXwwwwXwwwwwBrrr'),
  pad('...........JjjjjjjjjjjjjjjjjBwwwwXwwwwXwwwBR'),
  pad('...........JjpjjjjjjjjjjjjjjBBBBBBBBBBBBBBBR'),
  pad('...........JjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('...........JjjjjpjjjjjjjjjjjjjjjjjjjjjpjjjJ'),
  pad('...........JjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('............JJJJJJJJ....JJJJJJJJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjpjjjjJ....JjjjpjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjjjpjjJ....JjjpjjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjpjjjjJ....JjjjpjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............JjjjjjjJ....JjjjjjjJ'),
  pad('............KKKKKKKK....KKKKKKKK'),
  pad('............KKKKKKKK....KKKKKKKK'),
  blank(),
  blank(),
  blank(),
  blank(),
];

// HIT — pearls flying, hair coming loose, head jerked back.
const HIT: readonly string[] = [
  blank(),
  pad('..........W'),
  pad('...............W'),
  pad('....................KkKkKK'),
  pad('...kk.............KkkkkkkkkKK'),
  pad('....k.k..........KkkkkkkkkkkK'),
  pad('......k.........KkkkkkkkkkkkkK..W'),
  pad('.......k.......KKkkkkkkkkkkkkKK'),
  pad('........k.....KKkksssssSsssSKKKK'),
  pad('..............KkksssssSsssSSskK....W'),
  pad('.............KkSEEsssssEsssSskK'),
  pad('.............KkSssEsssssEssSskK......W'),
  pad('.............KkSssssssssssssSkK'),
  pad('.............KkSssLlLsssssssSkK'),
  pad('..............KkSsLLLSSSSSskK........W'),
  pad('...............KkSSSSSSSSskK'),
  pad('................KKWWWWWWWKK'),
  pad('...............JWWWWWWWWWWJ........W'),
  pad('..............JjWWRRRRRWWWjJ'),
  pad('.............JjpjWWRrrRRWWWjjJ........W'),
  pad('.............JjjjjWWWWWWWWWWjjJ'),
  pad('............JjjjjjBBBBBBBBBBjjjJ'),
  pad('...........JjjjpjjBwXwwwwwwBjjjjJ'),
  pad('...........JjjjjjjBwwwwXwwwBjjjjJ'),
  pad('...........JjpjjjjBBBBBBBBBBjjjjJ'),
  pad('...........JjjjjjjjjjjjjjjjjjjjjJ'),
  pad('...........JjjjjjpjjjjjjjjjpjjjjJ'),
  pad('...........JjjjjjjjjjjjjjjjjjjjjJ'),
  pad('...........JjpjjjjjjjjjjjjjjjjjjJ'),
  pad('...........JjjjjjjjjjjjjjjjjpjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjJ'),
  pad('............JjjjjpjjjjjjjjjjjjjJ'),
  pad('............JjjjjjjjjjjjjjjjjjjJ'),
  pad('............JJJJJJJJ....JJJJJJJ'),
  pad('............JjjjjjjJ....JjjjjjJ'),
  pad('............JjpjjjjJ....JjjjjpJ'),
  pad('............JjjjjjjJ....JjjjjjJ'),
  pad('............JjjjpjjJ....JjjpjjJ'),
  pad('............JjjjjjjJ....JjjjjjJ'),
  pad('............JjpjjjjJ....JjjjjpJ'),
  pad('............JjjjjjjJ....JjjjjjJ'),
  pad('............KKKKKKKK....KKKKKK'),
  pad('............KKKKKKKK....KKKKKK'),
  pad('..W.......W..............W......W'),
  pad('.....W.W.....................W'),
  pad('...W..............W..........W'),
  blank(),
  blank(),
];

// SPECIAL — stamping "REJECTED" — clipboard up, red ink splatter, mouth open shouting.
const SPECIAL: readonly string[] = [
  pad('..r..R..r..R..r..R..r..R..r..R..r..R..r..R'),
  pad('.RrR.rRr.RrR.rRr.RrR.rRr.RrR.rRr.RrR.rRr.RrR'),
  pad('..r..R..r..R..r..R..r..R..r..R..r..R..r..R'),
  pad('...................KKKKKK'),
  pad('.................KKkkkkkkKK'),
  pad('................KkkkkkkkkkkK'),
  pad('................KkkkkkkkkkkK'),
  pad('...............KKkkkkkkkkkkKK..r'),
  pad('..............KKkkkkkkkkkkkkKK.R'),
  pad('.............KKkkssssssssssKKK..r'),
  pad('.............KkksssssssssssSkK.R'),
  pad('............KkksssEsssssEsssSkK'),
  pad('............KkssssssssssssssSkK..r'),
  pad('............KkssLLLLLLLLLLLLSkK..R'),
  pad('............KkssLlllllllllllSkK'),
  pad('............KkssLLLllllllLLLSkK..r'),
  pad('............KkssssLLLLLLLLssSkK..R'),
  pad('.............KKKWWWWWWWWWWWKK'),
  pad('............WWWWWWWWWWWWWWWWW....r'),
  pad('...........JWWWBBBBBBBBBBBBBJ....R'),
  pad('..........JjWWWBwwwwwwwwwwwBJj'),
  pad('.........JjjWWWBwXXXXXXXXXwBjjJ...r'),
  pad('........JjpjjWWBwXrrrrrrrXwBjjjJ.R'),
  pad('.......JjjjjjjBBwXrrrrrrrXwBBjjJ'),
  pad('.......JjpjjjjjBwXrrrrrrrXwBjjjJ...r'),
  pad('.......JjjjjjjjBwXXXXXXXXXwBjjjJ...R'),
  pad('.......JjjjpjjjBwwwwwwwwwwwBjjjJ'),
  pad('.......JjjjjjjjBBBBBBBBBBBBBjjjJ...r'),
  pad('.......JjpjjjjjjjjjjjjjjjjjjjjjJ...R'),
  pad('.......JjjjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('.......JjjjjpjjjjjjjjjjjjjpjjjjJ'),
  pad('.......JjjjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('........JjpjjjjjjjjjjjjjjjpjjjJ'),
  pad('........JjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('........JjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('........JjjjjpjjjjjjjjjjjpjjjjJ'),
  pad('........JjjjjjjjjjjjjjjjjjjjjjJ'),
  pad('.........JjjjjjjjJ....JjjjjjjJ'),
  pad('.........JJJJJJJJJ....JJJJJJJJ'),
  pad('.........JjjjjjjjJ....JjjjjjjJ'),
  pad('.........JjpjjjjjJ....JjjjjpjJ'),
  pad('.........JjjjjjjjJ....JjjjjjjJ'),
  pad('.........JjjjjpjjJ....JjjpjjjJ'),
  pad('.........JjjjjjjjJ....JjjjjjjJ'),
  pad('.........JjpjjjjjJ....JjjjjpjJ'),
  pad('.........KKKKKKKKK....KKKKKKKK'),
  pad('.........KKKKKKKKK....KKKKKKKK'),
  blank(),
];

// DEFEAT — collapsed on the floor, clipboard scattered, bun undone, lipstick smudged.
const DEFEAT: readonly string[] = [
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  pad('...kk'),
  pad('..kkKk...kk'),
  pad('.kkKKKkkkKKkk'),
  pad('kkKKKkkkkKKKKkk...........BBBBBBB'),
  pad('.kKKkkSSSskKKkkk.........BwwwwwwwB'),
  pad('..kkSSEsssEsSSkkk.......BwXwwwXwwBR'),
  pad('...kSssssssssSSkk......BwwwwwwwwwBR'),
  pad('....SssLLLLLssSk......BBBBBBBBBBBBR'),
  pad('....SsLllllLssWWWJJ'),
  pad('...WWWLLLLLWWWWWJjjJJ'),
  pad('..WWWWRRRRRWWWWWjjjjJJ'),
  pad('.JWWWWRrrRRWWWWWjjjjjJJ'),
  pad('JjWWWWWWWWWWWWWWjjjjjjJ......BBBBBB'),
  pad('JjjjjjjjjjjjjjjjjjjjjjJJ....BwwwwwwwB'),
  pad('JjpjjjjjjjjjjjjjjjjjjjjJ...BwXwwwwwB'),
  pad('JjjjjjjjjjjjjjjjjjjjjjjJ..BBBBBBBBBBBR'),
  pad('.JjjjjjjJJjjjjjjJjjjjjJ..R...........R'),
  pad('..JjjjjjJ.JjjjjJ..JjjjJ..R..r......R'),
  pad('...KKKKKK..KKKKK...KKKK....r........R'),
  pad('....KKKK....KKK.....KK.................R.r'),
  pad('...........................r'),
  blank(),
  blank(),
  blank(),
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

const HrManagerSprite = memo(function HrManagerSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = POSE_BY_STATE[state] ?? IDLE;
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
      aria-label="兇悍 HR 經理"
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

const hrManager: CharacterArt = {
  meta: {
    id: 'hr-manager',
    name: '兇悍 HR 經理',
    englishName: 'HR Manager',
    role: 'job-hunting',
    tier: 'major',
    topic: 'job-hunting',
    description: '冷酷企業劊子手，髮髻、針條紋西裝、紅筆評分板。',
  },
  Sprite: HrManagerSprite,
};

export default hrManager;
