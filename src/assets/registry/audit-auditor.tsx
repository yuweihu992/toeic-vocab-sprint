// audit-auditor.tsx
// 稽核吸血鬼 — Pale formal vampire IRS auditor.
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
  // hair (slick black with widow's peak)
  K: '#0c0a09', // hair darkest
  k: '#1c1917', // hair highlight
  // pale unhealthy vampire skin
  s: '#e7d3b1', // skin lit
  S: '#cbd5e1', // skin mid (cool grey-blue)
  d: '#94a3b8', // skin shadow (sickly grey-blue)
  // accountant suit (jet black)
  J: '#0c0a09', // suit darkest
  j: '#1c1917', // suit mid
  p: '#292524', // suit highlight / pinstripe
  // cape lining (visible inside) — red
  L: '#7f1d1d',
  // white shirt collar
  W: '#f8fafc',
  // red tie
  T: '#7f1d1d', // tie shadow
  t: '#b91c1c', // tie mid
  // red ink pen / blood
  R: '#dc2626',
  r: '#ef4444',
  // brown ledger book
  B: '#78350f', // ledger dark
  b: '#92400e', // ledger mid
  // ledger pages
  P: '#f8fafc', // page white
  // fang white
  F: '#f1f5f9',
  // glowing red eye highlight
  e: '#fca5a5',
  // black eye base
  E: '#0c0a09',
};

/* ---------------------------- Sprites ---------------------------- *
 * Every grid below is 48 rows of exactly 48 chars. '.' = transparent.
 * Light source = upper-left. Character faces LEFT.
 * ---------------------------------------------------------------- */

// IDLE — ledger open in left hand, pen poised in right, predatory hunch.
const IDLE: readonly string[] = [
  '................................................', // 0
  '................................................', // 1
  '................................................', // 2
  '................................................', // 3
  '....................KKKKKKKK....................', // 4
  '...................KKkkkkkkkK...................', // 5
  '..................KKkkkkkkkkkK..................', // 6
  '.................KKkkkkkkKkkkkK.................', // 7
  '................KKkkKkkkkkkkkkkK................', // 8
  '...............KKkkkKkkkkkkkkkkkK...............', // 9
  '..............KKkkkkKkKKkkkkkkkkkK..............', // 10
  '.............KKkkkkkkkkkKkkkkkkkkkK.............', // 11
  '............KKkkkksssssssKkkkkkkkkkK............', // 12
  '...........KKkkkkssssssssssKKkkkkkkkK...........', // 13
  '...........Kkkksssssssssssssddkkkkkkk...........', // 14
  '...........KkksssEessssssEessdkkkkkkk...........', // 15
  '...........KksssEEsssssssEEssdkkkkkkk...........', // 16
  '...........KksssssssssssssssssdkkkkKK...........', // 17
  '...........Kkssssssssssssssssssddkk.............', // 18
  '............ksssssssFFssFFsssssddk..............', // 19
  '............kssssssssssssssssssdd...............', // 20
  '.............kssssssssssssssssdd................', // 21
  '..............dddssssssssssssdd.................', // 22
  '...............WWWWWWWWWWWWWW...................', // 23
  '...............JTtTJWWWWWWJTtJ..................', // 24
  '..............JJTtTJJWWWWJJTtJJ.................', // 25
  '.............JjjJTtJjjjjjjJTtJjJ................', // 26
  '............JjpjjJTJjjjjjjJTJjjJ.....BBBBBBB....', // 27
  '............JjjjjjJjjjjjjjjJjjjJ....BPPPPPPPB...', // 28
  '...........JjpjjjjjjjjjjjjjjjjjJ...BPPPPPPPPB...', // 29
  '...........JjjjjjjjjjjjjjjjjjjjJ..BBPPPPPPPPB...', // 30
  '...........JjjjjpjjjjjjjjjjjjjjJ.BbPPPPPPPPPB...', // 31
  '...........JjjjjjjjjjjjjjjjjjjjJBbBPPPPPPPPPB...', // 32
  '...........JjpjjjjjjjjjjjjjjjjjJbBPPPPPPPPPPB...', // 33
  '...........LLjjjjjjjjjjjjjjjjjjLLBPPPPPPPPPPB...', // 34
  '...........LLLjpjjjjjjjjjjjjjjLLLBPPPPPPPPPPB...', // 35
  '............LLLjjjjjjjjjjjjjjLLL.BBBBBBBBBBBR...', // 36
  '...........JjjjjjjjjjjjjjjjjjjjJ................', // 37
  '...........JjjjjpjjjjjjjjjjjjjjJ................', // 38
  '...........JjjjjjjjjjjjjjjjjjjjJ................', // 39
  '...........JJJJJJJJJ....JJJJJJJJ................', // 40
  '...........JjjjjjjjJ....JjjjjjjJ................', // 41
  '...........JjpjjjjjJ....JjjjpjjJ................', // 42
  '...........JjjjjjjjJ....JjjjjjjJ................', // 43
  '...........JjjjjpjjJ....JjjpjjjJ................', // 44
  '...........KKKKKKKKK....KKKKKKKK................', // 45
  '...........KKKKKKKKK....KKKKKKKK................', // 46
  '................................................', // 47
];

// WALK — slow predatory stride, cape flowing, one leg forward, body lean.
const WALK: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '...................KKKKKKKK.....................',
  '..................KKkkkkkkkK....................',
  '.................KKkkkkkkkkkK...................',
  '................KKkkkkKkkkkkkK..................',
  '...............KKkkKkkkkkkkkkkK.................',
  '..............KKkkkKkKKkkkkkkkkK................',
  '.............KKkkkkkkkkkkkkkkkkkK...............',
  '............KKkkkksssssssKkkkkkkkK..............',
  '...........KKkkkkssssssssssKKkkkkkk.............',
  '...........Kkkksssssssssssssddkkkkk.............',
  '...........KkksssEesssssssEessdkkkkk............',
  '...........KkssssEEsssssssEEsssdkkkk............',
  '...........Kkssssssssssssssssssddkk.............',
  '............ksssssssFFssFFsssssdd...............',
  '............dssssssssssssssssdd.................',
  '.............dddssssssssssssdd..................',
  '..............WWWWWWWWWWWWWW....................',
  '...........LLLJTtJWWWWWWJTtJLL.BBBBBBB..........',
  '..........LLLJJTtJJWWWWJJTtJJLLBPPPPPPB.........',
  '..........LLJjJTtJjjjjjjJTtJjJLBPPPPPPB.........',
  '.........LLJjpjJTJjjjjjjJTJjjJLBPPPPPPB.........',
  '........LLJjjjjjJjjjjjjjjJjjjJLBPPPPPPB.........',
  '........LJjpjjjjjjjjjjjjjjjjjJBBBBBBBBBR........',
  '........LJjjjjjjjjjjjjjjjjjjjJ..................',
  '.........JjjjjpjjjjjjjjjjjjjjJ..................',
  '.........JjjjjjjjjjjjjjjjjjjjJ..................',
  '..........JjpjjjjjjjjjjjjjjjJ...................',
  '..........JjjjjjjjjjjjjjjjjjJ...................',
  '..........JjjjjpjjjjjjjjjjjjJ...................',
  '..........JjjjjjjjjjjjjjjjjjJ...................',
  '..........JjjjjjjjjjJJJJJJJJ....................',
  '..........JjjjjjjjjjJjjjjjjJ....................',
  '..........JJJJJJJJJ.JjpjjjjJ....................',
  '..........JjjjjjjJ..JjjjjjjJ....................',
  '..........JjpjjjjJ..JjjjpjjJ....................',
  '..........JjjjjjjJ..JjjjjjjJ....................',
  '..........JjjjjjjJ..JjjpjjjJ....................',
  '..........JjjpjjjJ..JjjjjjjJ....................',
  '..........JjjjjjjJ...JjjjjJ.....................',
  '..........JjjjjjjJ...JjjjjJ.....................',
  '..........KKKKKKKKK..KKKKKKK....................',
  '.........KKKKKKKKK....KKKKKKKK..................',
  '................................................',
  '................................................',
  '................................................',
];

// ATTACK — pen thrust forward like a stake to the LEFT, red ink splatter.
const ATTACK: readonly string[] = [
  '................................................',
  '................................................',
  '................................................',
  '......................KKKKKKKK..................',
  '.....................KKkkkkkkkK.................',
  '....................KKkkkkkkkkkK................',
  '...................KKkkkkKkkkkkkK...............',
  '..................KKkkKkkkkkkkkkkK..............',
  '.................KKkkkKkKKkkkkkkkkK.............',
  '................KKkkkkkkkkkkkkkkkkkK............',
  '...............KKkkkksssssssKkkkkkkkK...........',
  '..............KKkkkkssssssssssKKkkkkkk..........',
  '..............Kkkkssssssssssssssddkkkk..........',
  '..............KkkssEEsssssssEEssdkkkkk..........',
  '..............KksssEEsssssssEEsssdkkkk..........',
  '..............Kksssssssssssssssssddkk...........',
  '...............kssssFFFFFFFFFFssdd..............',
  'rR.............kssssssssssssssssdd..............',
  '.Rrr............dddsssssssssssdd................',
  '...rrR...........WWWWWWWWWWWWW..................',
  'rRr..rRrr....LLJTtJWWWWWWJTtJLL.BBBBBBB.........',
  '.RrrR....rrrRLJJTtJJWWWWJJTtJJLLBPPPPPPB........',
  'rR..rrrrR.....LJjJTtJjjjjjjJTtJJBPPPPPPB........',
  '.rRR.....rrR..JjpjJTJjjjjjjJTJjJBPPPPPPB........',
  'R.................JjjjjjjjjJjjjJBPPPPPPB........',
  'R..rrrrrR........JjpjjjjjjjjjjjJBBBBBBBBR.......',
  '.RrR.....RrrR....JjjjjjjjjjjjjjJ................',
  'r........R..R...JjjjjpjjjjjjjjjJ................',
  'rrrR..rrrR..R...JjjjjjjjjjjjjjJ.................',
  '...RrrR.........JjpjjjjjjjjjjjJ.................',
  'R..............LLjjjjjjjjjjjjjLL................',
  '.Rrrrr.........LLLjjpjjjjjjjjLLL................',
  'rRR....rRr......LLjjjjjjjjjjLL..................',
  '...rrrR..R......JjjjjjjjjjjjjjJ.................',
  'rRR.....RrR.....JjjjpjjjjjjjjjJ.................',
  '...rrrrr...R....JJJJJJJJJ.JJJJJ.................',
  'R...........R...JjjjjjjjJ.JjjjJ.................',
  '.RrrrR..RrrR....JjpjjjjjJ.JjjpJ.................',
  '..r.RrrR........JjjjjjjjJ.JjjjJ.................',
  '................JjjjjjpjJ.JjpjJ.................',
  '................JjjjjjjjJ.JjjjJ.................',
  '................JjpjjjjjJ.JjjpJ.................',
  '................JjjjjjjjJ.JjjjJ.................',
  '................JjjjjjjjJ.JjjjJ.................',
  '................KKKKKKKKK.KKKKK.................',
  '................KKKKKKKKK.KKKKK.................',
  '................................................',
  '................................................',
];

// HIT — cape flapping wildly, fangs bared, head jerked back.
const HIT: readonly string[] = [
  '..r.............................................',
  '...r.....r......................................',
  'r........R...........KKKKKK.....................',
  '..r.....r..........KKKkkkkkKK...................',
  '....r.r...........KKkkkkkkkkkK..................',
  '.....r...........KKkkKkKKkkkkkK....r............',
  '..r.............KKkkkKkkkkkkkkkK................',
  '.....r..........Kkkkkkkkkkkkkkkk........r.......',
  '...........LL.LKkkksssssssKkkkkk....r...........',
  '..........LLLLLkksssssssssddkkkk................',
  '.........LLLLLLkSEEsssssEEssdkkk.....r..........',
  '........LLLLLLLkSsEEsssEEsssdkkk................',
  '........LLLLLLLkSssssssssssddkk....r..r.........',
  '........LLLLLLLkSsFFFFFFFFsdd.....r.............',
  '........LLLLLLLLkSsssssssddd....................',
  '.........LLLLLLLLddddddddd......................',
  '..........LLLLLLLWWWWWWWWWW.....................',
  '..........LLLLLLJTtTJWWWWWWJTtJ.................',
  '..........LLLLLJJTtTJJWWWWJJTtJJ................',
  '..........LLLLJjjJTtJjjjjjjJTtJjJ......r........',
  '..........LLLJjpjjJTJjjjjjjJTJjjJ.r.............',
  '...........LLJjjjjjJjjjjjjjjJjjjJ...............',
  '............LJjpjjjjjjjjjjjjjjjjJ......r........',
  '.............JjjjjjjjjjjjjjjjjjjJ.r.............',
  '............JjjjjpjjjjjjjjjjjjjjJ...............',
  '............JjjjjjjjjjjjjjjjjjjjJ......r........',
  '............JjpjjjjjjjjjjjjjjjjjJ.r.............',
  '............LLjjjjjjjjjjjjjjjjjLL...............',
  '...........LLLjpjjjjjjjjjjjjjjLLL...............',
  '..........LLLLjjjjjjjjjjjjjjjLLLL...............',
  '............LLjjjjjpjjjjjjjjLL..................',
  '............JjjjjjjjjjjjjjjjjJ..................',
  '............JjjjjjjjjjjjjjjjjJ..................',
  '............JJJJJJJJ....JJJJJJ..................',
  '............JjjjjjjJ....JjjjjJ..................',
  '............JjpjjjjJ....JjjjpJ..................',
  '............JjjjjjjJ....JjjjjJ..................',
  '............JjjjpjjJ....JjjpjJ..................',
  '............JjjjjjjJ....JjjjjJ..................',
  '............JjpjjjjJ....JjjjpJ..................',
  '............JjjjjjjJ....JjjjjJ..................',
  '............KKKKKKKK....KKKKKK..................',
  '............KKKKKKKK....KKKKKK..................',
  '..r.....r........................r..............',
  '....r.r.......r.................................',
  '..r..........................r.....r............',
  '................................................',
  '................................................',
];

// SPECIAL — BLOOD AUDIT: floating, eyes glowing red, red ink spiraling around.
const SPECIAL: readonly string[] = [
  '................r.....rR........................',
  '......rR.....rRr...rrR..rRr.....................',
  '.....r.rRr..r..rRrr.......rRr.r.................',
  '....r....r.r.....KKKKKKKK...rRr.................',
  '....R...rR......KKkkkkkkkK..r.r.................',
  '.....rRrR......KKkkkkkkkkkK..R..................',
  '.....r........KKkkkkKkkkkkkK....................',
  '....R........KKkkKkkkkkkkkkkK...................',
  '...rRr......KKkkkKkKKkkkkkkkkK...rRr............',
  '..rR.rR....KKkkkkkkkkkkkkkkkkkK.r..rR...........',
  '..r...r...KKkkkksssssssKkkkkkkkK....r...........',
  '...rRrR..KKkkkkssssssssssKKkkkkkk...R...........',
  '....r....Kkkkssssssssssssssddkkkkk.rR...........',
  '...R.....KkksseeeesssssseeeesdkkkkkR............',
  '..rRr....KksssEeEEsssssEeEsssdkkkkr.............',
  '.r..r....KkssssssssssssssssssddkR...............',
  '..rRr.....ksssssFFssFFsssssddR..r...............',
  '...r......dssssssssssssssssddrR.................',
  '..R........dddssssssssssssddR...................',
  '..r.........WWWWWWWWWWWWWW.r....................',
  '...rR....LLLJTtJWWWWWWJTtJLL.r..................',
  '...r.r..LLLJJTtJJWWWWJJTtJJLLR..................',
  '...R..R.LLJjJTtJjjjjjjJTtJjJLrR.....rRr.........',
  '....rRr.LJjpjJTJjjjjjjJTJjjJL.r....r..rR........',
  '.r......LJjjjjjJjjjjjjjjJjjjJrR....rRr.r........',
  '..rRr...LJjpjjjjjjjjjjjjjjjjJ.r.....r.R.........',
  '...r....LJjjjjjjjjjjjjjjjjjjJrR....r.rR.........',
  '..R......JjjjjpjjjjjjjjjjjjjJ.r.....R...........',
  '..rRr....JjjjjjjjjjjjjjjjjjjJrR.................',
  '...r......JjpjjjjjjjjjjjjjjjJ.r.................',
  '..R.......LLjjjjjjjjjjjjjjjLL.R..rRr............',
  '..rRr....LLLjpjjjjjjjjjjjjLLL.r..r.r............',
  '...r......LLjjjjjjjjjjjjjjLL...rRr.R............',
  '..R.......JjjjjjjjjjjjjjjjjJ.r..r.r.............',
  '..rRr.....JjjjjpjjjjjjjjjjjJrR.rRrRr............',
  '...r......JJJJJJJJJ.JJJJJJJJ.r..................',
  '..R.......................r.....................',
  '...rRr...rRr.r..rRr....rRr.R..rRr...............',
  '..r..rR.r..rR.r.r.rR..r..rRr.r..rR..............',
  '..rRr.r..rRr.R..rRr.r..rRr.r...rRr..............',
  '...........................r....................',
  '...........JjpjjjjjJ...JjjjjpjJ.................',
  '...........JjjjjjjjJ...JjjjjjjJ.................',
  '...........KKKKKKKKK...KKKKKKKK.................',
  '...........KKKKKKKKK...KKKKKKKK.................',
  '................................................',
  '................................................',
  '................................................',
];

// DEFEAT — cape covering body collapsed on side, pen broken, scattered pages.
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
  '................................................',
  '................................................',
  '...........................r....................',
  '..........................rR....................',
  '............PPPP..........rR....................',
  '...........PPPPPP........R.r....................',
  '............PPPP..........R.....................',
  '..............PP.........rR.....................',
  '...kk...........................................',
  '..kkKk..kk......................................',
  '.kkKKKkkKKkk....................................',
  'kKKKkKkkkkkkkkk.............rR.r................',
  '.kKKkkdSSSdkkkkk............rR..................',
  '..kkdSEessssseSdkkk....LLLLLLLLLLLL.............',
  '...kSEEsssssssEEdkk...LLLLLLLLLLLLLL............',
  '...kssssFFFFFFssdk...LLLLLLLLLLLLLLLL...........',
  '...ksssssssssssddk..LLLLLLLLLLLLLLLLLLL.........',
  '....dddddddddddd...LLLLLLLLLLLLLLLLLLLLL........',
  '......WWWWWWWWWW..LLJjjjjjjjjjjjjjjjjjjJL.......',
  '.....JTtJWWWWJTt.LLJjpjjjjjjjjjjjjjjjjjJL.......',
  '....JJTtJJWWJJTtJJLJjjjjjjjjjjjjjjjjjjjJL.......',
  '...JjJTtJjjjjJTtJjLLLjjjjjjjjjjjjjjjjjLL........',
  '...JjpJTJjjjjJTJjjLLLLLLLLLLLLLLLLLLLLLL........',
  '....JjjJjjjjjjJjjJLLLLLLLLLLLLLLLLLLLLL.........',
  '....JjjjjjjjjjjjjJLLLLLLLLLLLLLLLLLLL...........',
  '.....KKKKKKKK.KKKK..............................',
  '......KKKKKK..KKK.....BBBBB.....................',
  '......................BPPPB....................R',
  '......BBBR.............BBB...............R...rRr',
  '......B.B...........R............R.....rRrr.....',
  '.......R.R.....rRr.................r..rR........',
  '.................r.r........................rR.r',
  '................................................',
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

const AuditAuditorSprite = memo(function AuditAuditorSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = POSE_BY_STATE[state] ?? IDLE;
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
      aria-label="稽核吸血鬼"
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

const auditAuditor: CharacterArt = {
  meta: {
    id: 'audit-auditor',
    name: '稽核吸血鬼',
    englishName: 'Audit Auditor',
    role: 'regulations',
    tier: 'major',
    topic: 'regulations',
    description: '穿黑西裝戴尖牙的稽核員，紅墨筆當尖樁、紅披風。',
  },
  Sprite: AuditAuditorSprite,
};

export default auditAuditor;
