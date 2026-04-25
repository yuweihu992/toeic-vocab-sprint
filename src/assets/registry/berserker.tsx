// Berserker — 狂戰士
// Shirtless muscular barbarian, fur loincloth, horned helmet,
// wielding a massive two-handed battle axe. Faces RIGHT.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';
import './animations.css';

/* ── palette ──────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  s: '#a87651', // skin shadow
  S: '#c4906c', // skin mid
  H: '#e0a878', // skin highlight
  x: '#5b1414', // scar / dark red line
  r: '#7f1d1d', // hair shadow / war paint
  R: '#b91c1c', // hair mid
  F: '#ef4444', // hair highlight
  f: '#78350f', // fur shadow
  B: '#92400e', // fur mid
  b: '#d6d3d1', // bone horn shadow
  W: '#fef3c7', // bone horn highlight
  i: '#1c1917', // iron axe shadow
  I: '#44403c', // iron axe mid
  L: '#78716c', // iron axe highlight
  o: '#7c4a1e', // wood handle mid
  w: '#5c2e0a', // wood handle dark
  e: '#0c0a09', // eye black
  g: '#fbbf24', // rage aura yellow
  G: '#dc2626', // rage aura red
  t: '#f87171', // bright rage outline
};

// Each row below MUST be exactly 48 characters.
// Ruler:   0         1         2         3         4
//          012345678901234567890123456789012345678901234567

/* IDLE — axe held at side, chest heaving subtly. */
const IDLE: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '................................................', //  3
  '..............b.....bb..bb.....b................', //  4
  '..............bW....bWbbWb....Wb................', //  5
  '...............bW...bWWWWb...Wb.................', //  6
  '................bbbbbWWWWbbbbb..................', //  7
  '...............rRRRWWWWWWWWRRRr.................', //  8
  '..............rRFFRRWWeeWWRRFFRr................', //  9
  '..............rRFFRsSSeSSsRFFRRr................', // 10
  '..............rRFFsSSHHSSHsFFRRr................', // 11
  '..............rRRRsSHrrHHSSsRRRr................', // 12
  '...............rRsSSHHHHHSSSsRr.................', // 13
  '................sSSHHrrHHSSSs...................', // 14
  '................sSSSSSSSSSSSs...................', // 15
  '...............sSHSSeSSSeSSSSs..................', // 16
  '..............sSHHSSSSSSSSSSSSs.................', // 17
  '............sSSHHSSSSSrrSSSSSSSs................', // 18
  '...........sSSHHSSSSSrrrrSSSSSSSs...............', // 19
  '..........sSHHSSSSSSSrxxrSSSSSSSSs..............', // 20
  '.........sSHHSSSSSSSSrrrrSSSSSSSSs..............', // 21
  '.........sSHHSSSSSSSSSrrSSSSSSSSs....bbbb.......', // 22
  '.........sSHHSSSSSSSSSSSSSSSSSSs....bIIIIIb.....', // 23
  '.........sSHHxxSSSSSSSSSSSSSSSSs...bIILLLILb....', // 24
  '.........sSHHSSSSSSSSSSSSSSSSSs...bIIILLLLILb...', // 25
  '..........sSHSSSSSSSSSSSSSSSSs...bIIILLLLLLILb..', // 26
  '...........sSSSSSSSSSSSSSSSSs....bIIILLLLLLILb..', // 27
  '............sSSSSSSSSSSSSSSs.....bIIIILLLLILb...', // 28
  '............sSSSSffffffSSSSs......bIIIILLILb....', // 29
  '............sSSSffBBBBffSSSs.......bIIIIILb.....', // 30
  '............sSSffBBBBBBffSSs........bIIILb......', // 31
  '............sSffBBBBBBBBffSs.........bILb.......', // 32
  '............sfBBBBBBBBBBBBfs..........ow........', // 33
  '............sfBBBBBBBBBBBBfs..........ow........', // 34
  '............sfBBBffBBffBBBfs..........ow........', // 35
  '............sSffBBBBBBBBffSs..........ow........', // 36
  '............sSSffBBBBBBffSSs..........ow........', // 37
  '............sSSSSffBBffSSSSs..........ow........', // 38
  '............sSSSSSffffSSSSSs..........ow........', // 39
  '...........sSSSSs......sSSSSs.........ow........', // 40
  '...........sSHSs........sSHSs.........ow........', // 41
  '...........sSHSs........sSHSs.........ow........', // 42
  '...........sSSSs........sSSSs.........ow........', // 43
  '..........sSSSs..........sSSSs........ow........', // 44
  '..........ssss............ssss........ow........', // 45
  '......................................ow........', // 46
  '................................................', // 47
];

/* WALK — heavy stomping stride, axe at side, leaning forward. */
const WALK: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '..............b.....bb..bb.....b................', //  3
  '..............bW....bWbbWb....Wb................', //  4
  '...............bW...bWWWWb...Wb.................', //  5
  '................bbbbbWWWWbbbbb..................', //  6
  '...............rRRRWWWWWWWWRRRr.................', //  7
  '..............rRFFRRWWeeWWRRFFRr................', //  8
  '..............rRFFRsSSeSSsRFFRRr................', //  9
  '..............rRFFsSSHHSSHsFFRRr................', // 10
  '..............rRRRsSHrrHHSSsRRRr................', // 11
  '...............rRsSSHHHHHSSSsRr.................', // 12
  '................sSSHHrrHHSSSs...................', // 13
  '................sSSSSSSSSSSSs...................', // 14
  '...............sSHSSeSSSeSSSSs..................', // 15
  '..............sSHHSSSSSSSSSSSSs.................', // 16
  '...........sSSSHHSSSSSrSSSSSSSSs................', // 17
  '.........sSSSHHHSSSSSrrrrSSSSSSSs...............', // 18
  '........sSSHHHSSSSSSSrxxrSSSSSSSSs..............', // 19
  '.......sSSHHHSSSSSSSSrrrrSSSSSSSSs..............', // 20
  '......sSHHSSSSSSSSSSSSrrSSSSSSSs....bbbb........', // 21
  '.....sSHHSSSSSSSSSSSSSSSSSSSSSs....bIIIIIb......', // 22
  '....sSHHxxSSSSSSSSSSSSSSSSSSSs....bIILLLILb.....', // 23
  '....sSHHSSSSSSSSSSSSSSSSSSSSs....bIIILLLLILb....', // 24
  '....ssSSSSSSSSSSSSSSSSSSSSSs....bIIILLLLLLILb...', // 25
  '......sSSSSSSSSSSSSSSSSSSs.....bIIILLLLLLILb....', // 26
  '.......sSSSSSSSSSSSSSSSs......bIIIILLLLILb......', // 27
  '........sSSSSffffffSSSSs......bIIIILLILb........', // 28
  '........sSSSffBBBBffSSSs.......bIIIIILb.........', // 29
  '.......sSSffBBBBBBffSSSSs.......bIIILb..........', // 30
  '......sSffBBBBBBBBffSSSSs........bILb...........', // 31
  '.....sfBBBBBBBBBBBBffSSSs.........ow............', // 32
  '....sfBBBBBBBBBBBBfSSSSs..........ow............', // 33
  '....sfBBBffBBffBBBfSSSs...........ow............', // 34
  '....sSffBBBBBBBBffSSs.............ow............', // 35
  '....sSSffBBBBBBffSSs..............ow............', // 36
  '....sSSSSffBBffSSSs...............ow............', // 37
  '....sSSSSSffffSSSs................ow............', // 38
  '....sSSSSs.........sSSSSSs........ow............', // 39
  '....sSHSs.........sSSHHSSs........ow............', // 40
  '....sSHSs........sSSHHHHSs........ow............', // 41
  '....sSSSs........sSSSHHHSs........ow............', // 42
  '....sSSSs........sSSSSSSSSs.......ow............', // 43
  '....ssss.........sssssssss........ow............', // 44
  '..................................ow............', // 45
  '................................................', // 46
  '................................................', // 47
];

/* ATTACK — axe raised overhead, ready to chop. */
const ATTACK: readonly string[] = [
  '..........bIIIIIIIIIIIIIIIIIIIIIIb..............', //  0
  '.........bILLLLLLLLLLLLLLLLLLLLLILb.............', //  1
  '........bILLLLLLLLLLLLLLLLLLLLLLLILb............', //  2
  '.......bIILLLLLLLLLLLLLLLLLLLLLLLILb............', //  3
  '.......bIILLLLLLLLLLLLLLLLLLLLLLLLLb............', //  4
  '........bIILLLLLLLLLLLLLLLLLLLLLILb.............', //  5
  '.........bIIILLLLLLLLLLLLLLLLLLILb..............', //  6
  '..........bIIIIIIIIIIIIIIIILLLLILb..............', //  7
  '............bbbbbbbbbbbbb..ow.bb................', //  8
  '...........................ow...................', //  9
  '.....b.....bb..bb.....b....ow...................', // 10
  '.....bW....bWbbWb....Wb....ow...................', // 11
  '......bW...bWWWWb...Wb.....ow...................', // 12
  '.......bbbbbWWWWbbbbb......ow...................', // 13
  '......rRRRWWWWWWWWRRRr.....ow...................', // 14
  '.....rRFFRRWWeeWWRRFFRr....ow...................', // 15
  '.....rRFFRsSSeSSsRFFRRr....ow...................', // 16
  '.....rRFFsSSHHSSHsFFRRr....ow...................', // 17
  '.....rRRRsSHrrHHSSsRRRr....ow...................', // 18
  '......rRsSSHHHHHSSSsRr.....ow...................', // 19
  '.......sSSHHrrHHSSSs.......ow...................', // 20
  '.......sSSSSSSSSSSSs.......ow...................', // 21
  '......sSHSSeSSSeSSSSs......ow...................', // 22
  '.....sSHHSSSSSSSSSSSSs.....ow...................', // 23
  '...sSSHHSSSSSrrSSSSSSSSs...ow...................', // 24
  '..sSSHHSSSSSrrrrSSSSSSSSs..ow...................', // 25
  '.sSHHSSSSSSSrxxrSSSSSSSSSs.ow...................', // 26
  'sSHHSSSSSSSSrrrrSSSSSSSSSsow....................', // 27
  'sSHHSSSSSSSSSrrSSSSSSSSSSs......................', // 28
  'sSHHSSSSSSSSSSSSSSSSSSSSSs......................', // 29
  'sSHHxxSSSSSSSSSSSSSSSSSSs.......................', // 30
  'sSHHSSSSSSSSSSSSSSSSSSSs........................', // 31
  '.sSHSSSSSSSSSSSSSSSSSSs.........................', // 32
  '..sSSSSSSSSSSSSSSSSSs...........................', // 33
  '...sSSSSSSSSSSSSSSs.............................', // 34
  '....sSSSSffffffSSs..............................', // 35
  '....sSSSffBBBBffSs..............................', // 36
  '....sSSffBBBBBBffSs.............................', // 37
  '....sSffBBBBBBBBffSs............................', // 38
  '....sfBBBBBBBBBBBBfs............................', // 39
  '....sfBBBBBBBBBBBBfs............................', // 40
  '....sfBBBffBBffBBBfs............................', // 41
  '....sSffBBBBBBBBffSs............................', // 42
  '....sSSffBBBBBBffSSs............................', // 43
  '....sSSSSffBBffSSSSs............................', // 44
  '....sSSSSSffffSSSSSs............................', // 45
  '...sSSSSs......sSSSSs...........................', // 46
  '...ssss..........ssss...........................', // 47
];

/* HIT — jerked back, axe held defensively in front. */
const HIT: readonly string[] = [
  '................................................', //  0
  '................................................', //  1
  '................................................', //  2
  '..............................b.....bb..bb.....b', //  3
  '..............................bW....bWbbWb....Wb', //  4
  '...............................bW...bWWWWb...Wb.', //  5
  '................................bbbbbWWWWbbbbb..', //  6
  '...............................rRRRWWWWWWWWRRRr.', //  7
  '..............b...............rRFFRRWWeeWWRRFFRr', //  8
  '.............bIb..............rRFFRsSSeSSsRFFRRr', //  9
  '............bILIb.............rRFFsSSHHSSHsFFRRr', // 10
  '...........bIILLIb............rRRRsSHrrHHSSsRRRr', // 11
  '..........bIILLLLIb............rRsSSHHHHHSSSsRr.', // 12
  '.........bIILLLLLLIb............sSSHHrrHHSSSs...', // 13
  '........bIILLLLLLLLIb...........sSSSSSSSSSSSs...', // 14
  '........bILLLLLLLLLILb.........sSHSSeSSSeSSSSs..', // 15
  '........bIILLLLLLLLILb........sSHHSSSSSSSSSSSSs.', // 16
  '.........bILLLLLLLLILb......sSSHHSSSSSrSSSSSSSSs', // 17
  '..........bILLLLLLLILb.....sSSHHSSSSSrrrrSSSSSSs', // 18
  '...........bILLLLLILb......sSHHSSSSSSrxxrSSSSSSs', // 19
  '............bILLLILb.......sSHHSSSSSSrrrrSSSSSSs', // 20
  '.............bILILb........sSHHSSSSSSSrrSSSSSSSs', // 21
  '..............bILb.........sSHHSSSSSSSSSSSSSSSs.', // 22
  '...............ow..........sSHHxxSSSSSSSSSSSSs..', // 23
  '...............ow..........sSHHSSSSSSSSSSSSSs...', // 24
  '...............ow...........sSHSSSSSSSSSSSSs....', // 25
  '...............ow............sSSSSSSSSSSSSs.....', // 26
  '...............ow............sSSSSffffffSSs.....', // 27
  '...............ow............sSSSffBBBBffSs.....', // 28
  '...............ow............sSSffBBBBBBffs.....', // 29
  '...............ow............sSffBBBBBBBBfs.....', // 30
  '...............ow............sfBBBBBBBBBBfs.....', // 31
  '...............ow............sfBBBBBBBBBBfs.....', // 32
  '...............ow............sfBBBffBBffBfs.....', // 33
  '...............ow............sSffBBBBBBffSs.....', // 34
  '...............ow............sSSffBBBBffSSs.....', // 35
  '...............ow............sSSSSffBBffSSs.....', // 36
  '...............ow...........sSSSSSffffSSSSs.....', // 37
  '...............ow...........sSSSs......sSSs.....', // 38
  '...............ow...........sSHSs......sSHs.....', // 39
  '............................sSHSs......sSHs.....', // 40
  '............................sSSSs......sSSs.....', // 41
  '............................sSSSs......sSSs.....', // 42
  '............................ssss........sss.....', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

/* SPECIAL — RAGE MODE: glowing red aura, axe spinning, mouth roaring. */
const SPECIAL: readonly string[] = [
  '....g....g....g....g....g....g....g....g........', //  0
  '..g....g....g....g....g....g....g....g....g.....', //  1
  '....gggggggggggggggggggggggggggggggg............', //  2
  '..gGtttttttttttttttttttttttttttttttttGg.........', //  3
  '..gtb.....bb..bb.....b..............ttGg........', //  4
  '...tbW....bWbbWb....Wb...............tg.........', //  5
  '..gtbW....bWWWWb....Wb...............tGg........', //  6
  '...tbbbbbbWWWWWWbbbbbb...............tg.........', //  7
  '..gtrRRRWWWWWWWWWWWWRRRr.............tGg........', //  8
  '..gtrRFFRRWWggggWWRRFFRr.............tg.........', //  9
  '..gtrRFFRsSSggggSSsRFFRr.............tGg.iiii...', // 10
  '..gtrRFFsSSttttttsSHsFFRr............tg.iIILILi.', // 11
  '..gtrRRRsSttttttttsSsRRRr............tg.iIILLLLi', // 12
  '..gtrRsSttttttttttSSsRr..............tGg.iLLLILi', // 13
  '..gtsSStttttttttttSSSs...............tg..iIILILi', // 14
  '..gtsSSttttettettttSSSSs.............tGg..iIILi.', // 15
  '..gtsSHHttttttttttttSSSSSs...........tg...iLLLi.', // 16
  '..gtsSHHHSSSSSSSrSSSSSSSSSs..........tGg..iLILi.', // 17
  '..gtsSHHSSSSSSSrrrrSSSSSSSSs.........tg....iLi..', // 18
  '..gtsSHHSSSSSSSrxxrSSSSSSSSSSs.......tGg...ii...', // 19
  '..gtsSHHSSSSSSSrrrrSSSSSSSSSSSs......tg.........', // 20
  '..gtsSHHSSSSSSSSrrSSSSSSSSSSSSSs.....tGg...ow...', // 21
  '..gtsSHHSSSSSSSSSSSSSSSSSSSSSSSSs....tg....ow...', // 22
  '..gtsSHHxxSSSSSSSSSSSSSSSSSSSSSs.....tGg...ow...', // 23
  '..gtsSHHSSSSSSSSSSSSSSSSSSSSSSs......tg....ow...', // 24
  '..gtsSHSSSSSSSSSSSSSSSSSSSSSSs.......tGg...ow...', // 25
  '..gtsSSSSSSSSSSSSSSSSSSSSSSs.........tg....ow...', // 26
  '..gtsSSSSSSSSSSSSSSSSSSSSSs..........tGg...ow...', // 27
  '..gtsSSSSffffffSSSSSSSSs.............tg....ow...', // 28
  '..gtsSSSffBBBBffSSSSSSs..............tGg...ow...', // 29
  '..gtsSSffBBBBBBffSSSSs...............tg....ow...', // 30
  '..gtsSffBBBBBBBBffSSs................tGg...ow...', // 31
  '..gtsfBBBBBBBBBBBBfs.................tg....ow...', // 32
  '..gtsfBBBBBBBBBBBBfs.................tGg...ow...', // 33
  '..gtsfBBBffBBffBBBfs.................tg....ow...', // 34
  '..gtsSffBBBBBBBBffSs.................tGg...ow...', // 35
  '..gtsSSffBBBBBBffSSs.................tg....o....', // 36
  '..gtsSSSSffBBffSSSSs.................tGg..g.....', // 37
  '..gtsSSSSSffffSSSSSs.................tg.........', // 38
  '..gtsSSSs........sSSSs...............tGg........', // 39
  '..gtsSHSs..........sSHSs.............tg.........', // 40
  '..gtsSHSs..........sSHSs.............tGg........', // 41
  '..gtsSSSs..........sSSSs.............tg.........', // 42
  '..gtssss............ssss.............tGg........', // 43
  '..gttttttttttttttttttttttttttttttttttttg........', // 44
  '..ggggggggggggggggggggggggggggggggggggg.........', // 45
  '....g....g....g....g....g....g....g....g........', // 46
  '..g....g....g....g....g....g....g....g....g.....', // 47
];

/* DEFEAT — face-down, axe planted in ground beside body. */
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
  '..........................bbbb..................', // 14
  '.........................bIIIIb.................', // 15
  '........................bIILILb.................', // 16
  '.......................bIILLLLb.................', // 17
  '.......................bIILLLLLb................', // 18
  '.......................bIILLLLILb...............', // 19
  '........................bILLLLILb...............', // 20
  '.........................bILLLILb...............', // 21
  '..........................bILLILb...............', // 22
  '...........................bILILb...............', // 23
  '............................bILb................', // 24
  '............................bow.................', // 25
  '............................ow..................', // 26
  '............................ow..................', // 27
  '...........................rRow.................', // 28
  '..........................rRFow.................', // 29
  '..ssssss.................rRRRow.................', // 30
  '.sSSSSSSss..............rRFFFow.................', // 31
  'sSSHHHHSSSss...........rRFFRRow.................', // 32
  'sSHHrrxxHHSss.........rRFFRRRow.................', // 33
  'sSHrrrrrxrxSSss.......rRFFRRow..................', // 34
  'sSSrrxxrrrrSSSss.....rRRRRRow...................', // 35
  '.sSSrrrrrSSSSSSss...rRRRWWow....................', // 36
  '..sSSSSSSSSSSSSSss.bbbWWWWow....................', // 37
  '..ssSSSSSSSSSSSSbWbbWWWWWow.....................', // 38
  '...sssSSSSffffffbWWWWWWow.......................', // 39
  '.....sssSffBBBBffsbWWeWow.......................', // 40
  '.......sffBBBBBBffsbeeWow.......................', // 41
  '........sfBBBBBBBBffsbWow.......................', // 42
  '.........sfBBBBBBBBffsbow.......................', // 43
  '..........sffBBBBBBBffsow.......................', // 44
  '...........ssffBBBBffsow........................', // 45
  '.............sssffffsow.........................', // 46
  '...............ssssow...........................', // 47
];

/* ── per-state grid resolver ───────────────────────────────────── */
function gridFor(state: ActionState): readonly string[] {
  switch (state) {
    case 'idle':
      return IDLE;
    case 'walk':
      return WALK;
    case 'attack':
      return ATTACK;
    case 'hit':
      return HIT;
    case 'special':
      return SPECIAL;
    case 'defeat':
      return DEFEAT;
  }
}

/* ── sprite component ──────────────────────────────────────────── */
const BerserkerSprite = memo(function BerserkerSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = gridFor(state);
  return (
    <span
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size, lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        role="img"
        aria-label="Berserker 狂戰士"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </span>
  );
});

/* ── exported CharacterArt ─────────────────────────────────────── */
const berserker: CharacterArt = {
  meta: {
    id: 'berserker',
    name: '狂戰士',
    englishName: 'Berserker',
    role: 'player',
    tier: 'hero',
    description: '赤膊野蠻人，雙手戰斧、紅髮披身、戰意狂暴。',
  },
  Sprite: BerserkerSprite,
};

export default berserker;
