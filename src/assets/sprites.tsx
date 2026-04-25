/* ================================================================
   sprites.tsx
   Hand-crafted pixel-art SVG sprites for the TOEIC vocab BATTLE game.
   Aesthetic: ADULT, GRITTY, Happy Wheels-inspired. Grimy desaturated
   palette, visible joint lines for dismemberment legibility, readable
   adult facial features (eyes with whites/pupils, eyebrows, mouths).

   Each sprite is encoded as a 2D string grid where every character
   maps to a palette color. A '.' or ' ' cell is transparent.
   The grid is rendered as one <rect> per visible pixel run.
   ================================================================ */

import { memo, useMemo, type ReactElement } from 'react';
import './sprites.css';

/* ---------------------- Public types ---------------------- */

export type SpriteState = 'idle' | 'attack' | 'hit' | 'defeat';
export type EnemySpriteState = 'idle' | 'hit' | 'defeat';
export type EnemyId =
  | 'goblin-resume'
  | 'hr-manager'
  | 'final-interviewer'
  | 'rule-slime'
  | 'bureaucrat'
  | 'law-dragon';

/* ---------------------- Internal helpers ---------------------- */

type Palette = Record<string, string>;

interface PixelGridProps {
  /** Logical canvas size (48 normal, 64 boss). */
  canvas: number;
  /** Display size in CSS pixels. */
  size: number;
  /** Rows of single-character codes; whitespace/'.' = transparent. */
  rows: string[];
  /** Map of character code -> CSS color. */
  palette: Palette;
  /** Optional extra rects layered on top (e.g. glints, glow). */
  overlay?: ReactElement[];
  /** ARIA label. */
  ariaLabel: string;
}

/**
 * Render a pixel-art grid as <rect> elements.
 * Adjacent same-color pixels in a row are merged into a single rect
 * for SVG efficiency (reduces ~70% of DOM nodes) while preserving
 * exact pixel-art appearance.
 */
function PixelGrid({
  canvas,
  size,
  rows,
  palette,
  overlay,
  ariaLabel,
}: PixelGridProps): JSX.Element {
  const rects = useMemo(() => {
    const out: JSX.Element[] = [];
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y] ?? '';
      let x = 0;
      while (x < canvas) {
        const ch = row[x] ?? '.';
        if (ch === '.' || ch === ' ' || !palette[ch]) {
          x++;
          continue;
        }
        let runLen = 1;
        while (
          x + runLen < canvas &&
          (row[x + runLen] ?? '.') === ch
        ) {
          runLen++;
        }
        out.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={runLen}
            height={1}
            fill={palette[ch]}
          />
        );
        x += runLen;
      }
    }
    return out;
  }, [rows, palette, canvas]);

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${canvas} ${canvas}`}
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
        display: 'block',
      }}
    >
      {rects}
      {overlay}
    </svg>
  );
}

/* Class helper */
function spriteClass(state: string, isBoss = false): string {
  return `sprite-root sprite-state-${state}${isBoss ? ' sprite-boss' : ''}`;
}

/* ================================================================
   1. WARRIOR (48x48, faces RIGHT)
   Gritty mercenary in scratched gunmetal plate, blood-red cape,
   visible leather strap joints, scarred weathered face, nicked
   longsword. NOT a fairy-tale knight.
   ================================================================ */

const WARRIOR_PALETTE: Palette = {
  // outline (warm near-black)
  o: '#0a0908',
  // gunmetal armor
  a: '#2a2f36', // deep shadow
  A: '#4b5563', // shadow
  S: '#6b7280', // mid steel
  H: '#9ca3af', // highlight
  X: '#d6d3d1', // glint
  // leather straps / joints
  l: '#3b1f08',
  L: '#78350f',
  M: '#92400e',
  // skin (weathered tan)
  k: '#6b3818',
  K: '#876043',
  N: '#a87651',
  J: '#c4906c',
  // beard stubble / hair
  h: '#2a1810',
  Z: '#3a2410',
  // eye / scar / mouth
  e: '#0a0908', // pupil/scar lines
  W: '#e7e5e4', // sclera (eye white)
  // cape (deep blood red)
  r: '#5a0d12',
  R: '#7f1d1d',
  Q: '#991b1b',
  P: '#b91c1c',
  // sword (dark steel with nicks)
  s: '#1c1917',
  T: '#44403c',
  U: '#78716c',
  // gold pommel accent
  g: '#7a5310',
  G: '#a16207',
  Y: '#d4a23b',
};

/* 48x48. Warrior faces RIGHT. Gritty mercenary, slight hunch,
   sword in right hand (viewer's right), cape behind. */
const WARRIOR_IDLE_ROWS: string[] = [
  // 0
  '................................................',
  '................................................',
  '................................................',
  '..............oooooo............................',
  '............oohZZhhho...........................',
  // 5
  '...........ohZhZhhhZho..........................',
  '..........ohZZhhhhhhZho.........................',
  '..........oZAAAAAAAAAZo.........................',
  '.........oAJJJJJJJJJZAo.........................',
  '.........oJJNNJJJJJJJAo.........................',
  // 10
  '.........oJNeWeNJeNJJAo.........................',
  '.........oJNWWWNJJJJJAo.........................',
  '.........oJJNNJJJJJJJAo.........................',
  '.........oJJJoJJoeJJJAo.........................',
  '.........oKKJoooooKJKAo.........................',
  // 15
  '..........oZhKKKKKhZZo..........................',
  '...........oooooooooo...........................',
  '........orRoLLLoLLLoLLo.........................',
  '.......orRRoSSSoHHHoSSLo........................',
  '......orRRRoSAAoSSSoSAALo.......................',
  // 20
  '.....orRRRRoSAASoSSHoSAALo......................',
  '....orRQRRRoSAAAoSHHoSAAALo.....................',
  '....orRQQRRoSAAAoSSHoSAAALo.....................',
  '....orRQQRRoSXAAoHSSoSAAALo.....................',
  '....orRQRRRoSAAAoSSSoSAAALo...........TT........',
  // 25
  '....orRQQRRoSAAAoSSSoSAAALo..........TUUT.......',
  '....orRRRRRoSAAAoSHSoSAAALo.........TUUUT.......',
  '....orRRRRRoSAAAoooSoSAAALo........TUUUUT.......',
  '.....orRRRRoooSAAoLoSAAAoLo.......TUUUUUT.......',
  '......orRRoLLoSAAoLoSAALoLo......TUUUUUT........',
  // 30
  '.......oooLLLoSSAoLoSAALo.o.....TUUUUUT.........',
  '..........oLLooooLLooooo.......TUUUUUT..........',
  '...........oLooLLLooLo........TUUUUUT...........',
  '...........oLLLLAAALLLo.GGo..TUUUUUT............',
  '..........oAAAALAAAAAAo.oGGoTUUUUUT.............',
  // 35
  '..........oAAAAoAAAAAAo.GGoTUUUUUT..............',
  '..........oSSSAoASSSSAo.oTUUUUUUT...............',
  '..........oSSSAoASSSSAoTUUUUUUUT................',
  '..........oSSSAoASSSSAoUUUUUUUTo................',
  '..........oAAAAoAAAAAAoUUUUUUTo.................',
  // 40
  '..........oLLLLoLLLLLLoUUUUUTo..................',
  '..........oMMMMoMMMMMMoUUUUTo...................',
  '..........oLLLLoLLLLLLoUUUTo....................',
  '..........osssSosssSSSooUUTo....................',
  '..........osTTSosTTSSSo.oTo.....................',
  // 45
  '..........osTTSosTTSSSo..o......................',
  '..........oooooooooooo..........................',
  '................................................',
];

/* Attack: lunging forward, sword raised high & forward. Cape trails. */
const WARRIOR_ATTACK_ROWS: string[] = [
  // 0
  '................................................',
  '................................................',
  '..............................................TT',
  '.............................................TUT',
  '............................................TUUT',
  // 5
  '...........................................TUUUT',
  '..........................................TUUUUT',
  '.........................................TUUUUT.',
  '.........................................TUUUT..',
  '..............oooooo....................TUUUUT..',
  // 10
  '............oohZZhhho..................TUUUUT...',
  '...........ohZhZhhhZho................TUUUUT....',
  '..........ohZZhhhhhhZho..............TUUUUT.....',
  '..........oZAAAAAAAAAZo.............TUUUUT......',
  '.........oAJJJJJJJJJZAo............TUUUUT.......',
  // 15
  '.........oJJNNJJJJJJJAo...........TUUUUT........',
  '.........oJNeWeNJeNJJAo..........TUUUUT.........',
  '.........oJNWWWNJJJJJAo.........TUUUUT..........',
  '.........oJJNNJJJJJJJAo........TUUUUT...........',
  '.........oJJoJJoooJJJAo.......TUUUUT............',
  // 20
  '.........oKKJoooKJKKKAo.....TUUUUUT.............',
  '..........oZhKKKKhZZZo.....TUUUUTo..............',
  '...........oooooooooo.....TUUUTo................',
  '........orRoLLLoLLLoLLoTTUUUTo..................',
  '.......orRRoSSSoHHHoSAAUTTo.....................',
  // 25
  '......orRRRoSAAoSSSoSAAALo......................',
  '.....orRRRRoSAASoSSHoSAAALo.....................',
  '....orRQRRRoSAAAoSHHoSAAALo.....................',
  '....orRQQRRoSAAAoSSHoSAAALo.....................',
  '....orRQQRRoSXAAoHSSoSAAALo.....................',
  // 30
  '....orRQRRRoSAAAoSSSoSAAALo.....................',
  '....orRQQRRoSAAAoSSSoSAAALo.....................',
  '....orRRRRRoSAAAoSHSoSAAALo.....................',
  '....orRRRRRoSAAAoooSoSAAALo.....................',
  '.....orRRRRoooSAAoLoSAAAoLo.....................',
  // 35
  '......orRRoLLoSAAoLoSAALoLo.....................',
  '.......oooLLLoSSAoLoSAALo.o.....................',
  '..........oLLooooLLooooo........................',
  '...........oLooLLLooLo..........................',
  '...........oLLLLAAALLLo.........................',
  // 40
  '..........oAAAALAAAAAAo.........................',
  '..........oAAAAoAAAAAAo.........................',
  '..........oSSSAoASSSSAo.........................',
  '..........oSSSAoASSSSAo.........................',
  '..........oAAAAoAAAAAAo.........................',
  // 45
  '..........oLLLLoLLLLLLo.........................',
  '..........oMMMMoMMMMMMo.........................',
  '..........oooooooooooo..........................',
];

/* Hit: head jerked back, cape flapped, sword dropping. */
const WARRIOR_HIT_ROWS: string[] = [
  // 0
  '................................................',
  '................................................',
  '................................................',
  '..............................oooooo............',
  '...........................oohhhZZho............',
  // 5
  '..........................ohZhhhZhZho...........',
  '.........................ohZhhhhhhZZo...........',
  '.........................oZAAAAAAAAZo...........',
  '.........................oAZJJJJJJJJAo..........',
  '.........................oAJJJJJJJNNJo..........',
  // 10
  '.........................oAJJNeJNeWeNJo.........',
  '.........................oAJJJJJNWWWNJo.........',
  '.........................oAJJJJJJJNNJJo.........',
  '..............oooooo.....oAJJJoeJJoJJJo.........',
  '............oohZZhhho....oAKJKoooooJKKo.........',
  // 15
  '...........ohZhZhhhZho....oZZZhKKKKhZo..........',
  '..........ohZZhhhhhhZho....oooooooooo...........',
  '..........oZAAAAAAAAAZo.........................',
  '.........oAJJJJJJJJJZAo.........................',
  '.........oJJNNJJJJJJJAoorRoLLLoLLLoLLo..........',
  // 20
  '.........oJNeWeNJeNJJAoorRRoSSSoHHHoSSLo........',
  '.........oJNWWWNJJJJJAorRRRoSAAoSSSoSAALo.......',
  '.........oJJNNJJJJJJJAorRRRRoSAASoSSHoSAALo.....',
  '.........oJJJoJJoeJJJAorRQRRRoSAAAoSHHoSAAALo...',
  '.........oKKJoooooKJKAorRQQRRoSAAAoSSHoSAAALo...',
  // 25
  '..........oZhKKKKKhZZo.orRQQRRoSXAAoHSSoSAAALo..',
  '...........oooooooooo..orRQRRRoSAAAoSSSoSAAALo..',
  '........orRoLLLoLLLoLLo.orRQQRRoSAAAoSSSoSAAALo.',
  '.......orRRoSSSoHHHoSSLooorRRRRRoSAAAoSHSoSAAALo',
  '......orRRRoSAAoSSSoSAALooorRRRRoSAAAoooSoSAAALo',
  // 30
  '.....orRRRRoSAASoSSHoSAALo.orRRoLLoSAAoLoSAAAoLo',
  '....orRQRRRoSAAAoSHHoSAAALooooLLLoSAAoLoSAALoLo.',
  '....orRQQRRoSAAAoSSHoSAAALo..oLLooooLLooooo.....',
  '....orRQQRRoSXAAoHSSoSAAALo...oLooLLLooLo.......',
  '....orRQRRRoSAAAoSSSoSAAALo...oLLLLAAALLLo......',
  // 35
  '....orRQQRRoSAAAoSSSoSAAALo..oAAAALAAAAAAo......',
  '....orRRRRRoSAAAoSHSoSAAALo..oAAAAoAAAAAAo......',
  '....orRRRRRoSAAAoooSoSAAALo..oSSSAoASSSSAo......',
  '.....orRRRRoooSAAoLoSAAAoLo..oSSSAoASSSSAo......',
  '......orRRoLLoSAAoLoSAALoLo..oSSSAoASSSSAo......',
  // 40
  '.......oooLLLoSSAoLoSAALo.o..oAAAAoAAAAAAo......',
  '..........oLLooooLLooooo.....oLLLLoLLLLLLo......',
  '...........oLooLLLooLo.......oMMMMoMMMMMMo......',
  '...........oLLLLAAALLLo......oLLLLoLLLLLLo......',
  '..........oAAAALAAAAAAo......oooooooooooo.......',
  // 45
  '..........oAAAAoAAAAAAo.........................',
  '..........oSSSAoASSSSAo.........................',
  '..........oooooooooooo..........................',
];

/* Defeat: collapsed forward (brief - gibs replace this) */
const WARRIOR_DEFEAT_ROWS: string[] = [
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
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '...........orRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRo....',
  '..........orQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQRo...',
  '.........orRRoooooooooooooooooooooooooooQQQRo...',
  '........oohhhZhZho..........oooooo......oQRRo...',
  '.......ohZhhhhhZZo........oZAAAAAZo.....orRRo...',
  '......ohhhJJJJJZho.......oZAAAAAZAo......orRo...',
  '.....oJJNNJWeNJZho......oZAAAAAAAAo.......oo....',
  '....oJNJJJJJJJJZho.....oZSSSSSSSSAo.............',
  '....oJJNNJJoJoJJZo....oZSAAAAAAAAAo.............',
  '....oKKKJoeoooKKZo....oZAAAAAAAAAAo.............',
  '.....oZhKKKKhZZZo.....oLLLLLLLLLLLo.............',
  '......oooooooooo......oMMMMMMMMMMMo.............',
  '......................oLLLLLLLLLLLo.............',
  '......................oooooooooooo..............',
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
];

const WARRIOR_OVERLAY: ReactElement = (
  <g key="warrior-overlay">
    {/* Eye glint */}
    <rect x={12} y={10} width={1} height={1} fill="#fffbe7" />
    {/* Scar over right cheek */}
    <rect x={15} y={11} width={1} height={1} fill="#7f1d1d" />
    <rect x={15} y={12} width={1} height={1} fill="#7f1d1d" />
    {/* Sword nicks (highlights on blade) */}
    <rect x={37} y={28} width={1} height={1} fill="#e7e5e4" />
    <rect x={36} y={32} width={1} height={1} fill="#e7e5e4" />
    {/* Gold pommel accent */}
    <rect x={43} y={37} width={1} height={1} fill="#d4a23b" />
  </g>
);

export const WarriorSprite = memo(function WarriorSprite({
  state,
  size = 192,
}: {
  state: SpriteState;
  size?: number;
}): JSX.Element {
  const rows =
    state === 'attack'
      ? WARRIOR_ATTACK_ROWS
      : state === 'hit'
      ? WARRIOR_HIT_ROWS
      : state === 'defeat'
      ? WARRIOR_DEFEAT_ROWS
      : WARRIOR_IDLE_ROWS;

  return (
    <div className={spriteClass(state)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={48}
        size={size}
        rows={rows}
        palette={WARRIOR_PALETTE}
        overlay={state === 'idle' ? [WARRIOR_OVERLAY] : undefined}
        ariaLabel={`Warrior mercenary, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   2. GOBLIN-RESUME (48x48, faces LEFT)
   Sleazy desperate adult man job-hunter. Cheap stained suit,
   greasy black hair, sweat, yellowed teeth, crumpled resume.
   NOT a green goblin.
   ================================================================ */

const GOBLIN_PALETTE: Palette = {
  o: '#0a0908',
  // skin (sallow, sweaty)
  k: '#6b3818',
  K: '#876043',
  N: '#a87651',
  J: '#c4906c',
  // sweat (light blue-white)
  q: '#bae6fd',
  // greasy black hair
  h: '#0c0a09',
  H: '#1c1917',
  Z: '#292524',
  // eye (yellow sclera, pinprick pupil)
  W: '#e7e5e4',
  Y: '#d4a23b', // sallow yellow tint
  e: '#0a0908',
  // teeth (yellowed)
  t: '#a89968',
  T: '#d6c896',
  // bruise / sunken eye purple
  u: '#3b2057',
  // suit (cheap stained brown)
  s: '#3b1f08',
  S: '#5a3318',
  M: '#78350f',
  // shirt (off-white, sweat-stained)
  w: '#a89e88',
  // tie (loosened, drab green-gold)
  i: '#5a4818',
  I: '#856e26',
  // belt buckle / button brass
  g: '#7a5310',
  G: '#a16207',
  // resume paper (yellowed, crumpled)
  p: '#a89968',
  P: '#d6c896',
  Q: '#e7e0c0',
  // ink lines on resume
  d: '#1c1917',
  // loafers
  l: '#1c1917',
  L: '#3b2410',
};

const GOBLIN_IDLE_ROWS: string[] = [
  // 0
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..............oooooooo..........................',
  // 5
  '............oohhhhhhhhho........................',
  '...........ohHhhhhhhhhHho.......................',
  '..........ohHhZHhhhhhZHHho......................',
  '..........oHZZHhhhhhZZHHHo......................',
  '..........oZHHhhhhhhhhHHZo......................',
  // 10
  '..........oZJJJJJJJJJJJZo.......................',
  '..........oJJJJJJJJJJJJZo.......................',
  '..........oJJuuJJJJuuJJZo.......................',
  '.........oJJueWeJJueWeJJZo......................',
  '.........oJJuWYWuJuWYWuJJo......................',
  // 15
  '.........oJJuYWYuJuYWYuJJo......................',
  '.........oJJueWeJJueWeJJZo......................',
  '..........oJJuuJJJJuuJJZo.......................',
  '..........oJJJJJJoeJJJJZo.......................',
  '..........oJJJJoooooJJJZo.......................',
  // 20
  '..........oJJKKoTtTtoJJJZo......................',
  '..........oJJKoTtTtTtoJJZo......................',
  '..........oJZJoTTTttToJZZo......................',
  '...........oZJooooooooZZo.......................',
  '...........ooZZZZZZZZZZZo.......................',
  // 25
  '...........oSwwwwwwwwwwSo.......................',
  '...........oSwwIIIIIwwSSo.......................',
  '..........oSSwIIiiiIIwSSSo......................',
  '.........oSSSwIiPPPiIwwSSSo.....................',
  '........oSSSwwIiPPPPiIwwSSSo....................',
  // 30
  '.......oSSSSwwIiPPdPPiIwSSSSo...................',
  '......oSSMMSwwIiPPPPPiIwSMMSSo..................',
  '......oSSMMSwIiPdPdPdiIwSMMSSo..................',
  '......oSSSSSwIiPPPPPPiIwSSSSSo..................',
  '......oSSSSSSwIiPdPdPiIwSSSSSo..................',
  // 35
  '......oSSSSSSwIiPPPPPiIwSSSSSo..................',
  '......oSSMSSSwIiPdPdPiIwSSMSSo..................',
  '......oSSSSSSwIiPPPPPiIwSSSSSo..................',
  '......oSSSSSSwwIIIIIIIwwSSSSSo..................',
  '......oSSSSSSSSwgwGwgwSSSSSSSo..................',
  // 40
  '......oSSSSSSSSooooooSSSSSSSSo..................',
  '......oSSSSSSSo......oSSSSSSSo..................',
  '......oSSSSSSo........oSSSSSSo..................',
  '......oSSSSSo..........oSSSSSo..................',
  '......oSSSSo............oSSSSo..................',
  // 45
  '......oLLLLo............oLLLLo..................',
  '......olllllo..........olllllo..................',
  '......oooooo............oooooo..................',
];

const GOBLIN_HIT_ROWS: string[] = [
  '................................................',
  '................................................',
  '................................................',
  '..............oooooooo..........................',
  '............oohhhhhhhhho........................',
  '...........ohHhhhhhhhhHho.......................',
  '..........ohHhZHhhhhhZHHho......................',
  '..........oHZZHhhhhhZZHHHo......................',
  '..........oZHHhhhhhhhhHHZo......................',
  '..........oZJJJJJJJJJJJZo.......................',
  '..........oJJJJJJJJJJJJZo.......................',
  '..........oJJYYJJJJYYJJZo.......................',
  '.........oJJYWWWJJYWWWJJZo......................',
  '.........oJJWeWeWJWeWeWJJo......................',
  '.........oJJWWeWWJWWeWWJJo......................',
  '.........oJJYWWWWJYWWWWJJZo.....................',
  '..........oJJYYJJJJYYJJZo.......................',
  '..........oJJJJJoooJJJJZo.......................',
  '..........oJJJoTtTtToJJZo.......................',
  '..........oJJoTtTTtTtoJZo.......................',
  '..........oJZoTTttTtToJZo.......................',
  '..........oJZJoooooooJZZo.......................',
  '...........oZJZZZZZZZZZo........................',
  '...........ooZZZZZZZZZZo........................',
  '...........oSwwwwwwwwwwSo.......................',
  '...........oSwwIIIIIwwSSo.......................',
  '..........oSSwIIiiiIIwSSSo......................',
  '.........oSSSwIiPPPiIwwSSSo.....................',
  '........oSSSwwIiPPPPiIwwSSSo....................',
  '.......oSSSSwwIiPPdPPiIwSSSSo...................',
  '......oSSMMSwwIiPPPPPiIwSMMSSo..................',
  '......oSSMMSwIiPdPdPdiIwSMMSSo..................',
  '......oSSSSSwIiPPPPPPiIwSSSSSo..................',
  '......oSSSSSSwIiPdPdPiIwSSSSSo..................',
  '......oSSSSSSwIiPPPPPiIwSSSSSo..................',
  '......oSSMSSSwIiPdPdPiIwSSMSSo..................',
  '......oSSSSSSwIiPPPPPiIwSSSSSo..................',
  '......oSSSSSSwwIIIIIIIwwSSSSSo..................',
  '......oSSSSSSSSwgwGwgwSSSSSSSo..................',
  '......oSSSSSSSSooooooSSSSSSSSo..................',
  '......oSSSSSSSo......oSSSSSSSo..................',
  '......oSSSSSSo........oSSSSSSo..................',
  '......oSSSSSo..........oSSSSSo..................',
  '......oSSSSo............oSSSSo..................',
  '......oLLLLo............oLLLLo..................',
  '......olllllo..........olllllo..................',
  '......oooooo............oooooo..................',
  '................................................',
];

const GOBLIN_OVERLAY: ReactElement = (
  <g key="goblin-overlay">
    {/* Sweat drops on brow */}
    <rect x={11} y={9} width={1} height={1} fill="#bae6fd" />
    <rect x={20} y={9} width={1} height={1} fill="#bae6fd" />
    {/* Greasy hair shine */}
    <rect x={15} y={6} width={1} height={1} fill="#57534e" />
  </g>
);

export const GoblinResume = memo(function GoblinResume({
  state,
  size = 192,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? GOBLIN_HIT_ROWS : GOBLIN_IDLE_ROWS;
  return (
    <div className={spriteClass(state)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={48}
        size={size}
        rows={rows}
        palette={GOBLIN_PALETTE}
        overlay={state === 'idle' ? [GOBLIN_OVERLAY] : undefined}
        ariaLabel={`Sleazy resume spammer, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   3. HR-MANAGER (48x48, faces LEFT)
   Stern adult woman, severe tight bun, sharp pinstripe suit,
   cold dead eyes, thin lips, clipboard with red-pen marks,
   corporate ID badge. Soulless executioner energy.
   ================================================================ */

const HR_PALETTE: Palette = {
  o: '#0a0908',
  // pinstripe suit
  s: '#0c1220',
  S: '#1e293b',
  M: '#334155',
  i: '#475569', // pinstripe accent
  // crisp white shirt
  w: '#d6d3d1',
  W: '#e7e5e4',
  // skin (cold pale)
  k: '#5a3a28',
  K: '#876043',
  N: '#a87651',
  J: '#c4906c',
  // hair (severe black bun)
  h: '#0a0908',
  H: '#1c1917',
  Z: '#292524',
  // eyes (cold)
  e: '#0a0908', // pupil
  E: '#e7e5e4', // sclera
  // lipstick (dark red)
  r: '#7f1d1d',
  R: '#991b1b',
  // ID badge (corporate red)
  Q: '#b91c1c',
  // clipboard
  c: '#3b1f08',
  C: '#78350f',
  P: '#d6c896', // paper
  Y: '#e7e0c0', // paper hi
  // red pen marks
  X: '#dc2626',
  // pearl earring / button glint
  g: '#d4a23b',
};

const HR_IDLE_ROWS: string[] = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '...............oooooooo.........................',
  '..............oHHHHHHHho........................',
  '............oohHHHhHHHho........................',
  '...........ohHhHHHhHHHHho.......................',
  '..........ohZHhHHHHHHhHHho......................',
  '..........oHHZooooooooHHHo......................',
  '..........oHHoNJKKKKJNoHHo......................',
  '..........oHooJJJJJJJJJoo.......................',
  '..........oooJJKKKKKKJJZo.......................',
  '..........ooJJKeEKKKEeKJZo......................',
  '..........oJJJKEEKKKEEKJJo......................',
  '..........oJJJKKEoKoEKKJJo......................',
  '..........oJJJJKKKKKKKJJZo......................',
  '..........oJJJKoKKKKKoKJJo......................',
  '..........oJJJJoorRroJJJZo......................',
  '..........oJZJJJJrRrJJJZZo......................',
  '..........oZJZJJJJJJJZZZo.......................',
  '...........oZZJZNNJZZZZo........................',
  '............ooZNNNNNZZo.........................',
  '............oooooooooooo........................',
  '..........oSSWWooQoooWWSSo......................',
  '.........oSSWWWWoQQoWWWWSSo.....................',
  '........oSSSWWWWoQQoWWWWSSSo....................',
  '.......oSSSiSWWWoooWWWWSiSSSo...................',
  '......oSSSSSSWWWWoWWWWWSSSSSSo..................',
  '......oSSSSSWWWoWoWoWWSSSSSSSo..................',
  '......oSSiSSSWWWoWoWWSSSSSiSSo..................',
  '......oSSSSSSWWWWoWWWWWSSSSSSo......ooooooooo...',
  '......oSSSSSSSWWWoWWWWSSSSSSSo.....oCCCCCCCCCo..',
  '......oSSiSSSSSWWoWWSSSSSSiSSo.....oCPPPPPPPPCo.',
  '......oSSSSSSSSSSoSSSSSSSSSSSo.....oCPYYYYYYPCo.',
  '......oSSSSSSSiSSoSSiSSSSSSSSo.....oCPYXXXYYPCo.',
  '......oSSSSSSSSSSoSSSSSSSSSSSo.....oCPYYYYXYPCo.',
  '......oSSSSiSSSSSoSSSSSiSSSSSo.....oCPYYXXXYPCo.',
  '......oSSSSSSSSSSoSSSSSSSSSSSo.....oCPYYYYYYPCo.',
  '......oSSSSSSSSSSoSSSSSSSSSSSo.....oCPYXYXYYPCo.',
  '......oSSSSSSSSSooSSSSSSSSSSSo.....oCPYYYYYYPCo.',
  '......oSSSSSSSSSooSSSSSSSSSSSo.....oCCCCCCCCCo..',
  '......oSSSSSSSSo..oSSSSSSSSSSo......ooooooooo...',
  '......oSSSSSSSo....oSSSSSSSSSo..................',
  '......oSSSSSSo......oSSSSSSSSo..................',
  '......oSSSSSo........oSSSSSSSo..................',
  '......oooooo..........oooooooo..................',
  '................................................',
];

const HR_HIT_ROWS: string[] = [
  '................................................',
  '................................................',
  '..................oooooooo......................',
  '.................oHHHHHHHho.....................',
  '...............oohHHHhHHHho.....................',
  '..............ohHhHHHhHHHHho....................',
  '.............ohZHhHHHHHHhHHho...................',
  '.............oHHZooooooooHHHo...................',
  '.............oHHoNJKKKKJNoHHo...................',
  '.............oHooJJJJJJJJJoo....................',
  '.............oooJJKKKKKKJJZo....................',
  '.............ooJJKEEEKKEEEKJZo..................',
  '.............oJJJKEeoEoeEKJJo...................',
  '.............oJJJKEoEEEoEKJJo...................',
  '.............oJJJJKKKKKKKJJZo...................',
  '.............oJJJKoKKKKKoKJJo...................',
  '.............oJJJJoorRroJJJZo...................',
  '.............oJZJJJJrRrJJJZZo...................',
  '.............oZJZJJJJJJJZZZo....................',
  '..............oZZJZNNJZZZZo.....................',
  '...............ooZNNNNNZZo......................',
  '...............oooooooooooo.....................',
  '.............oSSWWooQoooWWSSo...................',
  '............oSSWWWWoQQoWWWWSSo..................',
  '...........oSSSWWWWoQQoWWWWSSSo.................',
  '..........oSSSiSWWWoooWWWWSiSSSo................',
  '.........oSSSSSSWWWWoWWWWWSSSSSSo...............',
  '.........oSSSSSWWWoWoWoWWSSSSSSSo...............',
  '.........oSSiSSSWWWoWoWWSSSSSiSSo...............',
  '.........oSSSSSSWWWWoWWWWWSSSSSSo...ooooooooo...',
  '.........oSSSSSSSWWWoWWWWSSSSSSSo..oCCCCCCCCCo..',
  '.........oSSiSSSSSWWoWWSSSSSSiSSo..oCPPPPPPPPCo.',
  '.........oSSSSSSSSSSoSSSSSSSSSSSo..oCPYYYYYYPCo.',
  '.........oSSSSSSSiSSoSSiSSSSSSSSo..oCPYXXXYYPCo.',
  '.........oSSSSSSSSSSoSSSSSSSSSSSo..oCPYYYYXYPCo.',
  '.........oSSSSiSSSSSoSSSSSiSSSSSo..oCPYYXXXYPCo.',
  '.........oSSSSSSSSSSoSSSSSSSSSSSo..oCPYYYYYYPCo.',
  '.........oSSSSSSSSSSoSSSSSSSSSSSo..oCPYXYXYYPCo.',
  '.........oSSSSSSSSSooSSSSSSSSSSSo..oCPYYYYYYPCo.',
  '.........oSSSSSSSSSooSSSSSSSSSSSo..oCCCCCCCCCo..',
  '.........oSSSSSSSSo..oSSSSSSSSSSo...ooooooooo...',
  '.........oSSSSSSSo....oSSSSSSSSSo...............',
  '.........oSSSSSSo......oSSSSSSSSo...............',
  '.........oSSSSSo........oSSSSSSSo...............',
  '.........oooooo..........oooooooo...............',
  '................................................',
  '................................................',
  '................................................',
];

const HR_OVERLAY: ReactElement = (
  <g key="hr-overlay">
    {/* Pearl earring */}
    <rect x={20} y={15} width={1} height={1} fill="#e7e5e4" />
    {/* ID badge corner glint */}
    <rect x={22} y={26} width={1} height={1} fill="#d4a23b" />
    {/* Eye glint - tiny pinprick of cold focus */}
    <rect x={13} y={13} width={1} height={1} fill="#e7e5e4" />
    <rect x={19} y={13} width={1} height={1} fill="#e7e5e4" />
  </g>
);

export const HRManager = memo(function HRManager({
  state,
  size = 192,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? HR_HIT_ROWS : HR_IDLE_ROWS;
  return (
    <div className={spriteClass(state)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={48}
        size={size}
        rows={rows}
        palette={HR_PALETTE}
        overlay={state === 'idle' ? [HR_OVERLAY] : undefined}
        ariaLabel={`HR manager, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   4. FINAL-INTERVIEWER (64x64 BOSS, faces LEFT)
   Heavyset older predator-CEO. Charcoal pinstripe three-piece suit,
   red power tie, gold pocket-watch chain, slicked salt-and-pepper hair,
   scarred face, ONE GOLD TOOTH, big cigar with smoke wisps.
   Behind: hint of leather executive chair + mahogany desk.
   ================================================================ */

const INTERVIEWER_PALETTE: Palette = {
  o: '#050405',
  // chair leather (deep burgundy)
  c: '#3b0a0c',
  C: '#5a0d12',
  J: '#7f1d1d',
  // chair brass
  g: '#7a5310',
  G: '#a16207',
  Y: '#d4a23b',
  // suit (charcoal pinstripe)
  s: '#0a0a0a',
  S: '#1c1917',
  M: '#292524',
  i: '#44403c', // pinstripe
  // vest (slightly darker)
  v: '#1c1917',
  V: '#292524',
  // shirt (off-white)
  w: '#a8a29e',
  W: '#d6d3d1',
  // red power tie
  r: '#5a0d12',
  R: '#991b1b',
  Q: '#b91c1c',
  // skin (weathered older)
  k: '#5a3818',
  K: '#876043',
  N: '#a87651',
  // hair (salt-and-pepper)
  h: '#1c1917',
  H: '#44403c',
  Z: '#78716c',
  X: '#a8a29e',
  // eyes
  e: '#0a0908',
  E: '#d6d3d1',
  // bushy eyebrow black
  b: '#0a0908',
  // gold tooth
  T: '#d4a23b',
  // teeth (yellowed)
  t: '#a89968',
  // cigar
  d: '#3b1f08',
  D: '#5a3318',
  // cigar ember
  q: '#dc2626',
  // smoke wisps
  z: '#a8a29e',
  // mahogany desk
  m: '#3b0a0c',
  P: '#5a1414',
  // scar across face
  L: '#7f1d1d',
};

/* 64x64. Boss villain framed by chair behind, desk below. */
const INTERVIEWER_IDLE_ROWS: string[] = [
  // 0..63
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '..............oooooooooooooooooooooooooooooooooo................',
  '............oogYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYgo...............',
  '...........ogGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGgo..............',
  '..........oCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCo..............',
  '.........oCJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJCo.............',
  '........oCJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJCo............',
  '.......oCJJJJJJJJJJoooooooooooooooooooJJJJJJJJJJJJJCo...........',
  '.......oCJJJJJJJJoohHHhHHHHHHHHHHHhHHhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJJJoohHZHHHHHHHHHHHHHHZHHhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJoohHHZXHHHHHHHHHHHHZHHHhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJohZZHHXZHHHHHHHHHHHHHHZhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJoNKKKKKKKKKKKKKKKKKKKKhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKKKKKKKKKKKKKKKKKhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKbbbKKKKKKbbbKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKbbbKKKKKKbbbKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKLKKKKKKKKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKLKEeKKKKKKEeKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKLKEEKKKKKKEEKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKKKKKKKKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKoKKKKKKoKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKoNoKKKKKoNoKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKoNNoKoKKoNoKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKoNoKoKoNoKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKoooooooooKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKotTtttttoKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKooooooKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNNKKKKKKKKKKKKKKKKKKKNNhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoooooooooooooooooooooooooJJJJJJJJJJJCo............',
  '.......oCJJJJJoSSSSSWWWWWWWWWWWWWWSSSSSoJJJJJJJJJJJCo...........',
  '.......oCJJJJoSSSSSWWWoooQQQooooWWWWSSSSoJJJJJJJJJCCo...........',
  '.......oCJJJoSSSSSiSWWoQQRRRQQoWWWWWSSSSSoJJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSWWoQRRQRRRQoWWWWWWSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSWWoQQRRRRRRRQoWWWWSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSWWoQRRRRRRRRQoWWWSSiSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSiSSSWWoQQRRRRRRRQoWWWSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSWWoQRRRRRRQoWWWWSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSWoYYYYYYYoWWWWSSSSiSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSSoYGYGYGYoWWWSSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSiSSSSSSSooooooSSSSSiSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSVVVSSSSSSSSSSSSVVVSSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSiSSSSSSSSSSSSSSSiSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoJJJJJJJCCo...........',
  '....oooCJJoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoJJJJJCCCooo.........',
  '...oGGGoCoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoCCCCCoGGGo.........',
  '..oGYYGoooooooooooooooooooooooooooooooooooooooooooGYYGo.........',
  '..oGYYYGoPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGYYYGo........',
  '.oGYYYYGoPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmoGYYYYGo.......',
  '.oGYYYYGoPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPoGYYYGo.......',
  '.oGGYYGGoPmmmPmmmPmmmmmmmmmmmmmmPmmmmmmPmmmmmmmmmmoGGYYGGo......',
  '..oGGGGoooPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPooGGGGo.......',
  '..oooooo..oPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmoooooooo.......',
  '..........oPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPo..............',
  '..........omPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmPmmo..............',
  '..........ommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmo..............',
  '..........oooooooooooooooooooooooooooooooooooooooo..............',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
];

const INTERVIEWER_HIT_ROWS: string[] = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '..............oooooooooooooooooooooooooooooooooo................',
  '............oogYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYgo...............',
  '...........ogGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGgo..............',
  '..........oCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCo..............',
  '.........oCJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJCo.............',
  '........oCJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJCo............',
  '.......oCJJJJJJJJJJoooooooooooooooooooJJJJJJJJJJJJJCo...........',
  '.......oCJJJJJJJJoohHHhHHHHHHHHHHHhHHhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJJJoohHZHHHHHHHHHHHHHHZHHhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJoohHHZXHHHHHHHHHHHHZHHHhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJohZZHHXZHHHHHHHHHHHHHHZhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJJoNKKKKKKKKKKKKKKKKKKKKhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKKKKKKKKKKKKKKKKKhooJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKbbbbbKKKKKKbbbbbKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKLLKKKKKKKKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKLEEoEoEEoEEEoEoEEKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKLEEEEoEEEEEEEoEEEEKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKLEEEoEoEEEEEoEoEEEKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKKKKKKKKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKoKKKKKKoKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKoNoKKKKKoNoKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKoooooooooKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKottttttToKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNKKKKKooooooKKKKKKKKKKKhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoNNKKKKKKKKKKKKKKKKKKKNNhoJJJJJJJJJJJCo...........',
  '.......oCJJJJJoooooooooooooooooooooooooJJJJJJJJJJJCo............',
  '.......oCJJJJJoSSSSSWWWWWWWWWWWWWWSSSSSoJJJJJJJJJJJCo...........',
  '.......oCJJJJoSSSSSWWWoooQQQooooWWWWSSSSoJJJJJJJJJCCo...........',
  '.......oCJJJoSSSSSiSWWoQQRRRQQoWWWWWSSSSSoJJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSWWoQRRQRRRQoWWWWWWSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSWWoQQRRRRRRRQoWWWWSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSWWoQRRRRRRRRQoWWWSSiSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSiSSSWWoQQRRRRRRRQoWWWSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSWWoQRRRRRRQoWWWWSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSWoYYYYYYYoWWWWSSSSiSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSSoYGYGYGYoWWWSSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSiSSSSSSSooooooSSSSSiSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSVVVSSSSSSSSSSSSVVVSSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSiSSSSSSSSSSSSSSSiSSSSSSSSoJJJJJJJCCo...........',
  '.......oCJJoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoJJJJJJJCCo...........',
  '....oooCJJoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoJJJJJCCCooo.........',
  '...oGGGoCoSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoCCCCCoGGGo.........',
  '..oGYYGoooooooooooooooooooooooooooooooooooooooooooGYYGo.........',
  '..oGYYYGoPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPGYYYGo........',
  '.oGYYYYGoPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmoGYYYYGo.......',
  '.oGYYYYGoPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPoGYYYGo.......',
  '.oGGYYGGoPmmmPmmmPmmmmmmmmmmmmmmPmmmmmmPmmmmmmmmmmoGGYYGGo......',
  '..oGGGGoooPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPooGGGGo.......',
  '..oooooo..oPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmoooooooo.......',
  '..........oPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPo..............',
  '..........omPmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmPmmo..............',
  '..........ommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmo..............',
  '..........oooooooooooooooooooooooooooooooooooooooo..............',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
];

const INTERVIEWER_OVERLAY: ReactElement = (
  <g key="interviewer-overlay">
    {/* Cigar ember glow */}
    <rect x={20} y={28} width={1} height={1} fill="#dc2626" />
    <rect x={19} y={28} width={1} height={1} fill="#fbbf24" opacity={0.9} />
    {/* Smoke wisps rising from cigar */}
    <rect x={18} y={26} width={1} height={1} fill="#a8a29e" opacity={0.55} />
    <rect x={17} y={24} width={1} height={1} fill="#a8a29e" opacity={0.4} />
    <rect x={16} y={22} width={1} height={1} fill="#a8a29e" opacity={0.3} />
    <rect x={18} y={20} width={1} height={1} fill="#a8a29e" opacity={0.25} />
    {/* Gold tooth glint */}
    <rect x={26} y={28} width={1} height={1} fill="#fde68a" />
    {/* Eye pinprick highlights (cold) */}
    <rect x={26} y={20} width={1} height={1} fill="#e7e5e4" />
    <rect x={32} y={20} width={1} height={1} fill="#e7e5e4" />
    {/* Pocket-watch chain glints */}
    <rect x={31} y={40} width={1} height={1} fill="#fde68a" />
    <rect x={35} y={40} width={1} height={1} fill="#fde68a" />
    {/* Tie-pin glint */}
    <rect x={31} y={37} width={1} height={1} fill="#fde68a" />
  </g>
);

export const FinalInterviewer = memo(function FinalInterviewer({
  state,
  size = 240,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? INTERVIEWER_HIT_ROWS : INTERVIEWER_IDLE_ROWS;
  return (
    <div className={spriteClass(state, true)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={64}
        size={size}
        rows={rows}
        palette={INTERVIEWER_PALETTE}
        overlay={state === 'idle' ? [INTERVIEWER_OVERLAY] : undefined}
        ariaLabel={`Predatory CEO interviewer, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   5. RULE-SLIME (48x48, faces LEFT)
   Congealed mass of stained legal documents wadded into a humanoid
   shape. Multiple eyeballs, dripping ink, dried-blood-red wax seal,
   torn-paper "mouth" with jagged teeth-edges. Bureaucratic horror.
   ================================================================ */

const SLIME_PALETTE: Palette = {
  o: '#0a0908',
  // yellowed paper
  p: '#a89e88',
  P: '#d6d3d1',
  Q: '#e7e5e4',
  // dark ink stains
  i: '#1c1917',
  I: '#292524',
  // dried-blood-red wax seal
  r: '#5a0d12',
  R: '#7f1d1d',
  X: '#991b1b',
  // ink drip lines
  k: '#0a0908',
  // eyes (multiple)
  e: '#0a0908', // pupil
  W: '#e7e5e4', // sclera
  Y: '#a89968', // sickly yellow eye
  // jagged paper teeth
  t: '#d6c896',
  T: '#e7e0c0',
  // mouth interior (dark wet)
  m: '#1c1917',
  // text-line ghosting on paper
  l: '#78716c',
  // gold (legal seal text)
  g: '#7a5310',
  G: '#a16207',
};

const SLIME_IDLE_ROWS: string[] = [
  '................................................',
  '................................................',
  '................................................',
  '..............ooo..o..ooo.......................',
  '............ooppoooppoppoo......................',
  '...........opPpPPpPPPpPPPpo.....................',
  '..........opPlPPPlPPpPPPpPpo....................',
  '.........opPPpPlPPPPPPPPPpPPo...................',
  '........opPPPlPPpPPlPPPpPPPpPo..................',
  '........opPPpPPPlPPPpPPPlPPPpo..................',
  '.......opPlPPPpPPPPPPPpPPPpPPPo.................',
  '.......opPpPPPPlPPpPPPPpPPPlPPpo................',
  '......opPPPPlPpPpPPPPlPPpPPPpPPPo...............',
  '......opPlPPPpPpPPPpPPPpPPlPPPpPo...............',
  '.....opPpPPPPPpYWYpPPPlPPpPPPpPPpo..............',
  '.....opPPPlPPPpYeYpPPPpPlPPPpPPPPo..............',
  '.....opPPpPPPpPpYpPPPpPPPpPPPlPPPo..............',
  '....opPPPpPlPpPPpPPlPPlPPpPlPPpPPpo.............',
  '....opPlPPPpPpPPPpPPpPPpPPPpPPPpPpo.............',
  '....opPpPPPYWYpPPpPPPpPPpPPPpYWYPPo.............',
  '....opPPPPpYeWpPpPlPPpPpPPPpPYeYPpo.............',
  '....opPlPPPYWYpPPpPPPpPpPPPlPYWWPo..............',
  '....opPpPPPpPlPPPpPPpPPPlPPPpPPpPPo.............',
  '....opPPPPpPPPpPPPpPlPPPpPPPpPPPPPo.............',
  '....opPlPPPpPPpPPPpPPpPPPpPPPlPPPpo.............',
  '....opPpPPPPpPlPPPpPPPlPPpPPPpPPPpo.............',
  '....opPPPPlPPPpPPpPPPpPPpPPlPPPpPPo.............',
  '....opPPpPPPpPPPlPpPPPpPPPpPPpPPPPo.............',
  '....opPPPlPPpooooooooooooopPPlPPpPo.............',
  '....opPlPPPpoTtTtTtTtTtTtToPPPpPPpo.............',
  '.....opPpPPotmmmmmmmmmmmmtoPPPlPPpo.............',
  '.....opPPlPotmmmmmmmmmmmmtoPlPPpPo..............',
  '.....opPPpPoTtTtTtTtTtTtToPPpPPpPo..............',
  '......opPlPpoooooooooooopPPlPPpPo...............',
  '......opPpPPpPlPPPpPPPpPPpPPPpPPo...............',
  '.......opPPlPPPpPPPpPPPpPPpPlPPo................',
  '.......opPpPPpPPpPPlPPpPPPpPPPo.................',
  '........opPlPPPpPPPpPPpPPlPPpPo.................',
  '........opPpPPPlPPPpPPPpPPPpPo..................',
  '.........opPPpPPpPlPPpPPpPlPo...................',
  '..........opPlPPpPPpPPlPPpPo....................',
  '...........opPpPPpPPpPPpPPo.....................',
  '............opPPlPPpPlPPo.......................',
  '.............opPpPPpPpPo........................',
  '..............opPPpPPpo.........................',
  '...............opPpPo...........................',
  '................oo..oo..........................',
  '................................................',
];

const SLIME_HIT_ROWS: string[] = [
  '................................................',
  '................................................',
  '..............ooo..o..ooo.......................',
  '............ooppoooppoppoo......................',
  '...........opPpPPpPPPpPPPpo.....................',
  '..........opPlPPPlPPpPPPpPpo....................',
  '.........opPPpPlPPPPPPPPPpPPo...................',
  '........opPPPlPPpPPlPPPpPPPpPo..................',
  '........opPPpPPPlPPPpPPPlPPPpo..................',
  '.......opPlPPPpPPPPPPPpPPPpPPPo.................',
  '.......opPpPPPPlPPpPPPPpPPPlPPpo................',
  '......opPPPPlPpPpPPPPlPPpPPPpPPPo...............',
  '......opPlPPPpPpPPPpPPPpPPlPPPpPo...............',
  '.....opPpPPPPpYWWWpPPPlPPpPPPpPPpo..............',
  '.....opPPPlPPpYeWepPPPpPlPPPpPPPPo..............',
  '.....opPPpPPpPYWWWpPPpPPPpPPPlPPPo..............',
  '....opPPPpPlPpPpPpPPlPPlPPpPlPPpPPpo............',
  '....opPlPPPpPpPPPpPPpPPpPPPpPPPpPpo.............',
  '....opPpPPYWWWpPPpPPPpPPpPPPpYWWWPo.............',
  '....opPPPYWeWWpPPpPlPPpPpPPPYWeWWPo.............',
  '....opPlPYWWWWpPPpPPPpPpPPPlYWWWWo..............',
  '....opPpPPPpPlPPPpPPpPPPlPPPpPPpPPo.............',
  '....opPPPPpPPPpPPPpPlPPPpPPPpPPPPPo.............',
  '....opPlPPPpPPpPPPpPPpPPPpPPPlPPPpo.............',
  '....opPpPPPPpPlPPPpPPPlPPpPPPpPPPpo.............',
  '....opPPPPlPPPpPPpPPPpPPpPPlPPPpPPo.............',
  '....opPPpPPPpPPPlPpPPPpPPPpPPpPPPPo.............',
  '....opPPPlPPpooooooooooooopPPlPPpPo.............',
  '....opPlPPPpoTtTtTtTtTtTtToPPPpPPpo.............',
  '.....opPpPPotmmmmmmmmmmmmtoPPPlPPpo.............',
  '.....opPPlPotmmmmmmmmmmmmtoPlPPpPo..............',
  '.....opPPpPoTtTtTtTtTtTtToPPpPPpPo..............',
  '......opPlPpoooooooooooopPPlPPpPo...............',
  '......opPpPPpPlPPPpPPPpPPpPPPpPPo...............',
  '.......opPPlPPPpPPPpPPPpPPpPlPPo................',
  '.......opPpPPpPPpPPlPPpPPPpPPPo.................',
  '........opPlPPPpPPPpPPpPPlPPpPo.................',
  '........opPpPPPlPPPpPPPpPPPpPo..................',
  '.........opPPpPPpPlPPpPPpPlPo...................',
  '..........opPlPPpPPpPPlPPpPo....................',
  '...........opPpPPpPPpPPpPPo.....................',
  '............opPPlPPpPlPPo.......................',
  '.............opPpPPpPpPo........................',
  '..............opPPpPPpo.........................',
  '...............opPpPo...........................',
  '................oo..oo..........................',
  '................................................',
  '................................................',
];

const SLIME_OVERLAY: ReactElement = (
  <g key="slime-overlay">
    {/* Wax seal (red) on the body */}
    <rect x={28} y={6} width={3} height={3} fill="#7f1d1d" />
    <rect x={29} y={6} width={1} height={1} fill="#991b1b" />
    <rect x={28} y={7} width={1} height={1} fill="#991b1b" />
    <rect x={30} y={8} width={1} height={1} fill="#5a0d12" />
    {/* Faux gold seal text dot */}
    <rect x={29} y={7} width={1} height={1} fill="#a16207" />
    {/* Ink drip lines */}
    <rect x={11} y={45} width={1} height={2} fill="#0a0908" opacity={0.85} />
    <rect x={36} y={45} width={1} height={2} fill="#0a0908" opacity={0.85} />
    <rect x={22} y={47} width={1} height={1} fill="#0a0908" opacity={0.7} />
    {/* Eye glints (multiple eyeballs) */}
    <rect x={15} y={14} width={1} height={1} fill="#fffbe7" opacity={0.9} />
    <rect x={37} y={19} width={1} height={1} fill="#fffbe7" opacity={0.9} />
    <rect x={11} y={19} width={1} height={1} fill="#fffbe7" opacity={0.9} />
  </g>
);

export const RuleSlime = memo(function RuleSlime({
  state,
  size = 192,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? SLIME_HIT_ROWS : SLIME_IDLE_ROWS;
  return (
    <div className={spriteClass(state)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={48}
        size={size}
        rows={rows}
        palette={SLIME_PALETTE}
        overlay={state === 'idle' ? [SLIME_OVERLAY] : undefined}
        ariaLabel={`Bureaucratic paper-mass slime, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   6. BUREAUCRAT (48x48, faces LEFT)
   Burned-out middle-aged adult. Pale sweaty exhausted face,
   massive purple eye bags, comb-over, rolled sleeves, ink-stained
   shirt, twitchy posture, holding a dripping red rubber stamp,
   precarious file towers around him. 72 hours of forms straight.
   ================================================================ */

const BUREAUCRAT_PALETTE: Palette = {
  o: '#0a0908',
  // pale sleep-deprived skin
  k: '#5a3818',
  K: '#876043',
  N: '#a87651',
  J: '#c4906c',
  // sweat
  q: '#bae6fd',
  // greasy hair (comb-over thinning)
  h: '#1c1917',
  H: '#292524',
  Z: '#44403c',
  // eye bags (purple/bruised)
  u: '#3b2057',
  U: '#5b3b78',
  // bloodshot eye
  e: '#0a0908', // pupil
  E: '#dc2626', // bloodshot
  W: '#d6d3d1', // sclera (slightly off-white)
  // wrinkled white shirt (ink-stained)
  w: '#a8a29e',
  W2: '#d6d3d1',
  // ink stains
  i: '#1c1917',
  // suit (wrinkled drab brown)
  s: '#3b1f08',
  S: '#5a3318',
  M: '#78350f',
  // tie (loose, gray-blue)
  t: '#1e293b',
  T: '#334155',
  // stamp wood handle
  r: '#3b1f08',
  R: '#78350f',
  // stamp head metal
  g: '#44403c',
  G: '#6b7280',
  // stamp red ink
  X: '#7f1d1d',
  Y: '#dc2626',
  // file stack paper
  p: '#a89968',
  P: '#d6c896',
  Q: '#e7e0c0',
  // pen behind ear (blue)
  b: '#1e3a8a',
  B: '#3b82f6',
};

const BUREAUCRAT_IDLE_ROWS: string[] = [
  '................................................',
  '..........ooooooooooooo.........................',
  '.........oQQQQPPPPPPPPo.........................',
  '........oQPpPPPPPPPpPPo.........................',
  '........oPPPPpPPPPPPPpo.........................',
  '........oQPPPPPpPPPPPPo.........................',
  '........oPpPPPPPPPpPPPo.........................',
  '........oQPPPpPPPPPPPPo.........................',
  '........oPPPPPPPpPPpPPo.........................',
  '........oQPPpPPPPPPPPPo.........................',
  '........oooooooooooooo..........................',
  '..............oooooo............................',
  '...........oohhhHhhho...........................',
  '..........oHHhhhHHhhho..........................',
  '..........oHZhHHhhHHHo..........................',
  '..........oNJKKKKKKho...........................',
  '.........oNuuJJuuJJKho..........................',
  '.........oNUuJJUuJJKKho.........................',
  '.........oNJUEeUUEeJKKo.........................',
  '.........oJJEEeEEeEEKKo.........................',
  '.........oJJJJoeeoJJJJo..........oRRoBBo........',
  '..........oJJJJJJJJJJo...........oRRoBBo........',
  '..........oJJtTTttTKKo...........oRRoBBo........',
  '..........oJJtTtTtTKKo...........oRRoBBo........',
  '...........oNNJJJJJNo............oRRoBBo........',
  '............ooooooooo............oRRoBBo........',
  '...........oSSSwwiwSSSo..........oRRooooo.......',
  '..........oSSwwwwwiSSSSo........oRRRRRRRoo......',
  '.........oSSSwwwiiwwSSSSo......oRRRRRRRRRo......',
  '........oSSSwwwiwiwwwSSSSo....ooGGGGGGGGGGo.....',
  '.......oSSSSwwwiwwwwwSSSSSo..oXYYYYYYYYYYXo.....',
  '......oSSSSSwwwwwwwwSSSSSSSooXYXXXYYYXXXXYXo....',
  '......oSSMSSSwwwwwwSSSSSMSSoXYYXXYYXXYYYYYXo....',
  '......oSSMSSSSwwwwSSSSSSMSSoXYXXYYYXXYXXYYYo....',
  '......oSSSSSSSSwwSSSSSSSSSSoXXYXXXYYYXYXXYXo....',
  '......oSSSSSSSiSSSSSSSSSSSSoXYYYXYXXXYYYYXYo....',
  '......oSSSSSSSSSSiSSSSSSSSSooYYXYYYYYYYXYYXo....',
  '......oSSMSSSSSSSSSSSSSSMSSo.oXYXXYYXXYYXYo.....',
  '......oSSSSSSSSSSSSSSSSSSSSo..oYXYYYXYYYXo......',
  '......oSSSSSSSSSSSSSSSSSSSSo...oXYXXYXYXo.......',
  '......oSSSSSSSSSSSSSSSSSSSSo....oYYXXYYo........',
  '......oSSSSSSSSSooSSSSSSSSSo.....oXYXYo.........',
  '......oSSSSSSSSooooSSSSSSSSo......oXYo..........',
  '......oSSSSSSSo....oSSSSSSSo.......oo...........',
  '......oSSSSSSo......oSSSSSSo....................',
  '......oSSSSSo........oSSSSSo....................',
  '......oooooo..........oooooo....................',
  '................................................',
];

const BUREAUCRAT_HIT_ROWS: string[] = [
  '................................................',
  '..........ooooooooooooo.........................',
  '.........oQQQQPPPPPPPPo.........................',
  '........oQPpPPPPPPPpPPo.........................',
  '........oPPPPpPPPPPPPpo.........................',
  '........oQPPPPPpPPPPPPo.........................',
  '........oPpPPPPPPPpPPPo.........................',
  '........oQPPPpPPPPPPPPo.........................',
  '........oPPPPPPPpPPpPPo.........................',
  '........oQPPpPPPPPPPPPo.........................',
  '........oooooooooooooo..........................',
  '..............oooooo............................',
  '...........oohhhHhhho...........................',
  '..........oHHhhhHHhhho..........................',
  '..........oHZhHHhhHHHo..........................',
  '..........oNJKKKKKKho...........................',
  '.........oNuuJJuuuuJJho.........................',
  '.........oNUuJWWuJWWuKho........................',
  '.........oNJUWeWUUWeWJKKo.......................',
  '.........oJJWWeWEEWWeWKKo.......................',
  '.........oJJUWWWoeoWWWJJo........oRRoBBo........',
  '..........oJJJJJJoooJJJo.........oRRoBBo........',
  '..........oJJtTTttTKKKo..........oRRoBBo........',
  '..........oJJtTtTtTKKo...........oRRoBBo........',
  '...........oNNJJJJJNo............oRRoBBo........',
  '............ooooooooo............oRRoBBo........',
  '...........oSSSwwiwSSSo..........oRRooooo.......',
  '..........oSSwwwwwiSSSSo........oRRRRRRRoo......',
  '.........oSSSwwwiiwwSSSSo......oRRRRRRRRRo......',
  '........oSSSwwwiwiwwwSSSSo....ooGGGGGGGGGGo.....',
  '.......oSSSSwwwiwwwwwSSSSSo..oXYYYYYYYYYYXo.....',
  '......oSSSSSwwwwwwwwSSSSSSSooXYXXXYYYXXXXYXo....',
  '......oSSMSSSwwwwwwSSSSSMSSoXYYXXYYXXYYYYYXo....',
  '......oSSMSSSSwwwwSSSSSSMSSoXYXXYYYXXYXXYYYo....',
  '......oSSSSSSSSwwSSSSSSSSSSoXXYXXXYYYXYXXYXo....',
  '......oSSSSSSSiSSSSSSSSSSSSoXYYYXYXXXYYYYXYo....',
  '......oSSSSSSSSSSiSSSSSSSSSooYYXYYYYYYYXYYXo....',
  '......oSSMSSSSSSSSSSSSSSMSSo.oXYXXYYXXYYXYo.....',
  '......oSSSSSSSSSSSSSSSSSSSSo..oYXYYYXYYYXo......',
  '......oSSSSSSSSSSSSSSSSSSSSo...oXYXXYXYXo.......',
  '......oSSSSSSSSSSSSSSSSSSSSo....oYYXXYYo........',
  '......oSSSSSSSSSooSSSSSSSSSo.....oXYXYo.........',
  '......oSSSSSSSSooooSSSSSSSSo......oXYo..........',
  '......oSSSSSSSo....oSSSSSSSo.......oo...........',
  '......oSSSSSSo......oSSSSSSo....................',
  '......oSSSSSo........oSSSSSo....................',
  '......oooooo..........oooooo....................',
  '................................................',
];

const BUREAUCRAT_OVERLAY: ReactElement = (
  <g key="bureaucrat-overlay">
    {/* Sweat on brow */}
    <rect x={11} y={13} width={1} height={1} fill="#bae6fd" />
    <rect x={20} y={13} width={1} height={1} fill="#bae6fd" />
    {/* Pen tip glint behind ear */}
    <rect x={37} y={20} width={1} height={1} fill="#dbeafe" />
    {/* Stamp drips of red ink falling */}
    <rect x={36} y={42} width={1} height={2} fill="#dc2626" />
    <rect x={42} y={43} width={1} height={2} fill="#7f1d1d" />
    {/* Random ink stain on shirt */}
    <rect x={17} y={32} width={2} height={1} fill="#0a0908" opacity={0.85} />
  </g>
);

export const Bureaucrat = memo(function Bureaucrat({
  state,
  size = 192,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? BUREAUCRAT_HIT_ROWS : BUREAUCRAT_IDLE_ROWS;
  return (
    <div className={spriteClass(state)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={48}
        size={size}
        rows={rows}
        palette={BUREAUCRAT_PALETTE}
        overlay={state === 'idle' ? [BUREAUCRAT_OVERLAY] : undefined}
        ariaLabel={`Burned-out clerk, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   7. LAW-DRAGON (64x64 BOSS, faces LEFT)
   Imposing serpentine dragon, scales of legal documents with ink
   text lines, JUDGE'S WIG (white powdered curls), glowing GOLD eyes,
   bared fangs, tail tipped with a heavy WOODEN GAVEL, legal chain
   with scales-of-justice pendant. Charcoal scales w/ parchment areas.
   Ancient and dreadful.
   ================================================================ */

const DRAGON_PALETTE: Palette = {
  o: '#050405',
  // dark charcoal scales
  d: '#0a0908',
  D: '#1c1917',
  Z: '#292524',
  z: '#44403c',
  // parchment scale areas
  p: '#a89e88',
  P: '#d6d3d1',
  Q: '#e7e5e4',
  // ink text lines on scales
  k: '#0a0908',
  // judge wig (off-white powdered curls)
  w: '#a8a29e',
  W: '#d6d3d1',
  X: '#e7e5e4',
  // gold eyes / ornaments
  g: '#7a5310',
  G: '#a16207',
  Y: '#d4a23b',
  H: '#fde68a',
  // bared fangs (off-white with black)
  t: '#d6d3d1',
  T: '#e7e5e4',
  // mouth interior (red glow)
  r: '#5a0d12',
  R: '#991b1b',
  E: '#dc2626',
  // gavel mahogany
  m: '#3b0a0c',
  M: '#5a1414',
  // gavel band brass
  b: '#7a5310',
  B: '#a16207',
  // chain steel
  c: '#44403c',
  C: '#78716c',
  // scales-of-justice pendant gold
  J: '#d4a23b',
};

/* 64x64. Coiled dragon, head reared looking down/left, judge's wig
   on top, body coiling away to right with gavel-tipped tail. */
const DRAGON_IDLE_ROWS: string[] = [
  // 0..63
  '................................................................',
  '................................................................',
  '...................oooooooooooo.................................',
  '..................oWXXWWWWWWWWXo................................',
  '.................oWXWWXXWWXXWWWWo...............................',
  '................oWWXWWWWWWXXWWWWWo..............................',
  '...............oXWXWXWWXWWWWXXWXWWo.............................',
  '...............oWWWXWXWWWWXWXWWXWWo.............................',
  '...............oWXWXWXWXWXWXWXWXWXo.............................',
  '...............ooXWWXWWXWWXWWXWWXoo.............................',
  '..............oZZooooooooooooooooZZo............................',
  '.............oDZZdoooDDDDDDDDDoooZZDo...........................',
  '............oDDZdoYHYodDDDDDDDoYHYoZDDo.........................',
  '...........oDDZodGYGYodDPpPDDDoGYGYoZDDo........................',
  '..........oDDZdoGYHYGodDPkPPDDoGYHYGodDDo.......................',
  '.........oDDZZdoYGgGYodDpPPpDDoYGgGYodZZDo......................',
  '.........oDDZdooHYGYHooDPPpPDDoHYGYHoodZDo......................',
  '.........oDDZodddoooddoDpPPPPDddoooddZdZDo......................',
  '.........oDDZdoozzzzooDPPpPPpPDoozzzzodZDo......................',
  '.........oDDZdooooooDDDPPPPPPPDDDoooooodZDo.....................',
  '..........oDDDDDDDDDPPPpPPPpPPPPPDDDDDDDDDo.....................',
  '...........oDDPPPPPPPPPpPPPPPPpPPPPPPPPPDDo.....................',
  '...........oDPPPPPpPPPPPPPpPPPPPPPpPPPPPPDo.....................',
  '...........oDoooooopPPPpPPPPPpPPPpoooooooDo.....................',
  '...........oDoTttttoPPPPpPPPpPPPPotttttToDo.....................',
  '...........oDotrErrtoPPPPPPPPPPPotrrErrtoDo.....................',
  '...........oDoTrEEERtoPpPPPpPPPotrEEEErtoDo.....................',
  '...........oDoTrrrrrtooooooooooooTrrrrrrToDo....................',
  '...........oDoTtTttToPPPPpPPPPPPoTttTtTtTo.Do...................',
  '...........oDoooooooPPPpPPPpPPPPoooooooPo.zDo...................',
  '...........oDPPpPPPPPPPPPPPPpPPPPpPPPPPPo.zZDo..................',
  '............oDPPPpPPPpPPPpPPPPPPPPPpPPPo.zZZDDo.................',
  '............oDDPPPPPPPPPPPPPPpPPPpPPPPPozZDDDDo.................',
  '.............oDDPPpPPPpPPPpPPPPPPPPPPPo.zZZZDDoo................',
  '..............oDDPPPPPPPPPPPPPPPpPPPPPo.zZDDDoo.................',
  '...............oDDPPpPPPpPPPpPPPPPPPPPo.zZDDDo..................',
  '................oDDPPPPPPPPPPPPpPPPpPPo.zZZDoo..................',
  '.................oDDPPpPPPpPPPPPPPPPPPo.zZDDoo..................',
  '..................oDDPPPPPPPPPpPPPpPPPo.zZZDo...................',
  '...................oDPPpPPPpPPPPPPPPPPo.zZDoo...................',
  '....................oDPPPPPPPPPPPpPPPPozZDDoo...................',
  '.....................oDPPpPPPpPPPPPPPPozZDDo....................',
  '......................oDPPPPPPPPPPPPPpozZDDoo...................',
  '.......................oDPPPPPpPPPpPPPozDDoo....................',
  '........................oDPPPPPPPPPPPpzDDoo.....................',
  '........................oDPPPpPPPpPPPDDDoo......................',
  '.........................oDPPPPPPPPPDDDoo.......................',
  '..........................oDPPPpPPPPDDoo........................',
  '...........................oDPPPPPPDDoo.........................',
  '............................oDPPPPDDoo..........................',
  '............................oDDPPDDoo...........................',
  '.............................oDDDDoo............................',
  '..............................oDDDoo............................',
  '..............................oDDoo.............................',
  '...............................oooBBBBBoo.......................',
  '..............................oBbbbbbbbbBBo.....................',
  '.............................oBbMMMMMMMMMbBo....................',
  '............................oBbMmmMMmMmMMMbBo...................',
  '............................oBbMMmMMMmmMmMbBo...................',
  '............................oBbMmMmMmMMMmMbBo...................',
  '............................oBbMMmMmMMmMmMbBo...................',
  '............................oBbbbbbbbbbbbbBo....................',
  '.............................oBBBBBBBBBBBBo.....................',
  '..............................oooooooooooo......................',
];

const DRAGON_HIT_ROWS: string[] = [
  '................................................................',
  '................................................................',
  '...................oooooooooooo.................................',
  '..................oWXXWWWWWWWWXo................................',
  '.................oWXWWXXWWXXWWWWo...............................',
  '................oWWXWWWWWWXXWWWWWo..............................',
  '...............oXWXWXWWXWWWWXXWXWWo.............................',
  '...............oWWWXWXWWWWXWXWWXWWo.............................',
  '...............oWXWXWXWXWXWXWXWXWXo.............................',
  '...............ooXWWXWWXWWXWWXWWXoo.............................',
  '..............oZZooooooooooooooooZZo............................',
  '.............oDZZdoooDDDDDDDDDoooZZDo...........................',
  '............oDDZdoHHHodDDDDDDDoHHHoZDDo.........................',
  '...........oDDZodHHHHHodPpPDDoHHHHHoZDDo........................',
  '..........oDDZdoHHHHHHHodPkPDoHHHHHHHodDDo......................',
  '.........oDDZZdoHHYHYHHodPPpDoHHYHYHHodZZDo.....................',
  '.........oDDZdoHHHYYYHHooDPpooHHYYYHHHodZDo.....................',
  '.........oDDZodddoooddoDDPPPDDddoooddZdZDo......................',
  '.........oDDZdoozzzzooDPPpPPpPDoozzzzodZDo......................',
  '.........oDDZdooooooDDDPPPPPPPDDDoooooodZDo.....................',
  '..........oDDDDDDDDDPPPpPPPpPPPPPDDDDDDDDDo.....................',
  '...........oDDPPPPPPPPPpPPPPPPpPPPPPPPPPDDo.....................',
  '...........oDPPPPPpPPPPPPPpPPPPPPPpPPPPPPDo.....................',
  '...........oDoooooopPPPpPPPPPpPPPpoooooooDo.....................',
  '...........oDoTttttoPPPPpPPPpPPPPotttttToDo.....................',
  '...........oDotrEEEtoPPPPPPPPPPPotEEEErtoDo.....................',
  '...........oDoTrEEEEtoPpPPPpPPPotrEEEEEtoDo.....................',
  '...........oDoTrEEEEtooooooooooooTrEEEErToDo....................',
  '...........oDoTtTttToPPPPpPPPPPPoTttTtTtTo.Do...................',
  '...........oDoooooooPPPpPPPpPPPPoooooooPo.zDo...................',
  '...........oDPPpPPPPPPPPPPPPpPPPPpPPPPPPo.zZDo..................',
  '............oDPPPpPPPpPPPpPPPPPPPPPpPPPo.zZZDDo.................',
  '............oDDPPPPPPPPPPPPPPpPPPpPPPPPozZDDDDo.................',
  '.............oDDPPpPPPpPPPpPPPPPPPPPPPo.zZZZDDoo................',
  '..............oDDPPPPPPPPPPPPPPPpPPPPPo.zZDDDoo.................',
  '...............oDDPPpPPPpPPPpPPPPPPPPPo.zZDDDo..................',
  '................oDDPPPPPPPPPPPPpPPPpPPo.zZZDoo..................',
  '.................oDDPPpPPPpPPPPPPPPPPPo.zZDDoo..................',
  '..................oDDPPPPPPPPPpPPPpPPPo.zZZDo...................',
  '...................oDPPpPPPpPPPPPPPPPPo.zZDoo...................',
  '....................oDPPPPPPPPPPPpPPPPozZDDoo...................',
  '.....................oDPPpPPPpPPPPPPPPozZDDo....................',
  '......................oDPPPPPPPPPPPPPpozZDDoo...................',
  '.......................oDPPPPPpPPPpPPPozDDoo....................',
  '........................oDPPPPPPPPPPPpzDDoo.....................',
  '........................oDPPPpPPPpPPPDDDoo......................',
  '.........................oDPPPPPPPPPDDDoo.......................',
  '..........................oDPPPpPPPPDDoo........................',
  '...........................oDPPPPPPDDoo.........................',
  '............................oDPPPPDDoo..........................',
  '............................oDDPPDDoo...........................',
  '.............................oDDDDoo............................',
  '..............................oDDDoo............................',
  '..............................oDDoo.............................',
  '...............................oooBBBBBoo.......................',
  '..............................oBbbbbbbbbBBo.....................',
  '.............................oBbMMMMMMMMMbBo....................',
  '............................oBbMmmMMmMmMMMbBo...................',
  '............................oBbMMmMMMmmMmMbBo...................',
  '............................oBbMmMmMmMMMmMbBo...................',
  '............................oBbMMmMmMMmMmMbBo...................',
  '............................oBbbbbbbbbbbbbBo....................',
  '.............................oBBBBBBBBBBBBo.....................',
  '..............................oooooooooooo......................',
];

const DRAGON_OVERLAY: ReactElement = (
  <g key="dragon-overlay">
    {/* Glowing gold eye highlights */}
    <rect x={14} y={14} width={1} height={1} fill="#fef3c7" />
    <rect x={49} y={14} width={1} height={1} fill="#fef3c7" />
    {/* Red mouth inner glow */}
    <rect x={20} y={26} width={1} height={1} fill="#fbbf24" opacity={0.55} />
    <rect x={45} y={26} width={1} height={1} fill="#fbbf24" opacity={0.55} />
    {/* Tiny ink legal-text dots scattered on parchment scales */}
    <rect x={26} y={31} width={2} height={1} fill="#0a0908" opacity={0.7} />
    <rect x={36} y={32} width={2} height={1} fill="#0a0908" opacity={0.7} />
    <rect x={28} y={36} width={2} height={1} fill="#0a0908" opacity={0.6} />
    <rect x={32} y={42} width={2} height={1} fill="#0a0908" opacity={0.65} />
    <rect x={25} y={45} width={2} height={1} fill="#0a0908" opacity={0.6} />
    {/* Scales-of-justice pendant on chain */}
    <rect x={31} y={50} width={2} height={1} fill="#d4a23b" />
    <rect x={30} y={51} width={4} height={1} fill="#d4a23b" />
    <rect x={31} y={52} width={2} height={1} fill="#a16207" />
    {/* Chain segments going up to neck */}
    <rect x={28} y={48} width={1} height={1} fill="#78716c" />
    <rect x={30} y={47} width={1} height={1} fill="#78716c" />
    <rect x={32} y={46} width={1} height={1} fill="#78716c" />
    <rect x={34} y={47} width={1} height={1} fill="#78716c" />
    <rect x={36} y={48} width={1} height={1} fill="#78716c" />
    {/* Wig curls extra detail */}
    <rect x={20} y={4} width={1} height={1} fill="#fffbe7" />
    <rect x={28} y={5} width={1} height={1} fill="#fffbe7" />
    <rect x={36} y={4} width={1} height={1} fill="#fffbe7" />
  </g>
);

export const LawDragon = memo(function LawDragon({
  state,
  size = 240,
}: {
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  const rows = state === 'hit' ? DRAGON_HIT_ROWS : DRAGON_IDLE_ROWS;
  return (
    <div className={spriteClass(state, true)} style={{ width: size, height: size }}>
      <PixelGrid
        canvas={64}
        size={size}
        rows={rows}
        palette={DRAGON_PALETTE}
        overlay={state === 'idle' ? [DRAGON_OVERLAY] : undefined}
        ariaLabel={`Law dragon boss, ${state}`}
      />
    </div>
  );
});

/* ================================================================
   Enemy router
   ================================================================ */

export function EnemySprite({
  id,
  state,
  size,
}: {
  id: EnemyId;
  state: EnemySpriteState;
  size?: number;
}): JSX.Element {
  switch (id) {
    case 'goblin-resume':
      return <GoblinResume state={state} size={size} />;
    case 'hr-manager':
      return <HRManager state={state} size={size} />;
    case 'final-interviewer':
      return <FinalInterviewer state={state} size={size} />;
    case 'rule-slime':
      return <RuleSlime state={state} size={size} />;
    case 'bureaucrat':
      return <Bureaucrat state={state} size={size} />;
    case 'law-dragon':
      return <LawDragon state={state} size={size} />;
  }
}
