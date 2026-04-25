import { type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import './animations.css';
import type { ActionState, CharacterArt, CharacterSpriteProps } from './types';

const CANVAS = 48;

// Palette — industrial gray office shredder monster.
// Light source: upper-left.
const PALETTE: Readonly<Record<string, string>> = {
  k: '#1c1917', // darkest outline
  K: '#292524', // dark shadow
  D: '#44403c', // gray shadow
  M: '#78716c', // gray mid
  L: '#a8a29e', // gray light
  s: '#0c0a09', // slot interior dark
  T: '#f1f5f9', // teeth highlight
  t: '#e2e8f0', // teeth shadow
  r: '#dc2626', // LED dark
  R: '#ef4444', // LED bright
  g: '#fca5a5', // LED glow halo
  p: '#fef3c7', // paper bit light
  P: '#fde68a', // paper bit shadow
  c: '#44403c', // power cord (alias of D, kept for clarity)
  y: '#fde047', // spark yellow (defeat only)
  o: '#fef9c3', // spark glow (defeat only)
};

const W = 48;

// All grid rows MUST be exactly 48 characters. The canonical body in IDLE/
// SPECIAL/HIT/DEFEAT occupies columns 8..37 (8 leading dots + 30 body chars +
// 10 trailing dots). ATTACK shifts the body left by 4 (cols 4..33) to depict
// lurching toward the left. DEFEAT rotates the chassis 90° clockwise so the
// slot opens upward.

// ── IDLE ────────────────────────────────────────────────────────────────────
// Standing upright, slot-mouth closed (toothy grin), red LEDs glowing,
// paper bits floating around the chassis.
const IDLE: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 0
  '................p...............................', // 1
  '...............pPp..............p...............', // 2
  '................p..............pPp..............', // 3
  '..........................p.....p...............', // 4
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 5
  '........kLLLLLLLLLLLLLLLLLLLLLLLLLLLLDk.........', // 6
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 7
  '........kLM.gRr................gRr.MDk..........', // 8
  '........kLM.RRR................RRR.MDk..........', // 9
  '........kLM.gRr................gRr.MDk..........', // 10
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 11
  '........kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.........', // 12
  '........ksssssssssssssssssssssssssssssk.........', // 13
  '........ksTtTtTtTtTtTtTtTtTtTtTtTtTtTsk.........', // 14
  '........ksssssssssssssssssssssssssssssk.........', // 15
  '........kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.........', // 16
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 17
  '........kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk........', // 18
  '........kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk........', // 19
  '........kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.......', // 20
  '........kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk.......', // 21
  '........kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk.......', // 22
  '........kLMMLDMLDMMMMMMMMMMMMMDLMDDDLLMDk.......', // 23
  '........kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk.......', // 24
  '........kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk.......', // 25
  '........kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.......', // 26
  '........kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk........', // 27
  '........kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk........', // 28
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDDk........', // 29
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkc........', // 30
  '..........kMMk.....................kMMkc........', // 31
  '..........kMMk.....................kMMk.cc......', // 32
  '..........kMMk.....................kMMk..cc.....', // 33
  '..........kMMk.....................kMMk...cc....', // 34
  '..........kMMk.....................kMMk....c....', // 35
  '..........kMMk.....................kMMk....c....', // 36
  '..........kMMk.....................kMMk....cc...', // 37
  '..........kKKk.....................kKKk.....c...', // 38
  '..........kkkk.....................kkkk.....c...', // 39
  '...........p..........P............P.......cc...', // 40
  '..........pPp........pPp..........pPp......c....', // 41
  '...........p..........P............P............', // 42
  '................................................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── WALK ────────────────────────────────────────────────────────────────────
// Mid-stomp gait. Trailing leg lifted (bent at the knee) and forward leg
// planted. Paper bits trail behind to the right. Body identical to IDLE.
const WALK: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 0
  '..............p.................................', // 1
  '.............pPp...............p................', // 2
  '..............p................p................', // 3
  '...............................p................', // 4
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 5
  '........kLLLLLLLLLLLLLLLLLLLLLLLLLLLLDk.........', // 6
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 7
  '........kLM.gRr................gRr.MDk..........', // 8
  '........kLM.RRR................RRR.MDk..........', // 9
  '........kLM.gRr................gRr.MDk..........', // 10
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 11
  '........kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.........', // 12
  '........ksssssssssssssssssssssssssssssk.........', // 13
  '........ksTtTtTtTtTtTtTtTtTtTtTtTtTtTsk.........', // 14
  '........ksssssssssssssssssssssssssssssk.........', // 15
  '........kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.........', // 16
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.........', // 17
  '........kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk........', // 18
  '........kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk........', // 19
  '........kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.......', // 20
  '........kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk.......', // 21
  '........kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk.......', // 22
  '........kLMMLDMLDMMMMMMMMMMMMMDLMDDDLLMDk.......', // 23
  '........kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk.......', // 24
  '........kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk.......', // 25
  '........kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.......', // 26
  '........kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk........', // 27
  '........kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk........', // 28
  '........kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDDk........', // 29
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkc........', // 30
  '............kMMk................kMMk....cc......', // 31
  '............kMMk................kMMk.....c......', // 32
  '............kMMk................kMMk.....c......', // 33
  '............kMMk................kMMk....cc......', // 34
  '............kMMk................kKKk...cc.......', // 35
  '............kMMk................kkkk..cc........', // 36
  '............kMMk......................p.........', // 37
  '............kKKk....................pPp.........', // 38
  '............kkkk......................p.........', // 39
  '..........p..........................p..........', // 40
  '.........pPp............kkkkkk.....pPp..........', // 41
  '..........p.............kMMMMk......p...........', // 42
  '........................kMMMMk..................', // 43
  '........................kKKKKk..................', // 44
  '........................kkkkkk..................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── ATTACK ──────────────────────────────────────────────────────────────────
// Lurching LEFT — body shifted left (cols 4..33), slot-mouth gaping wide
// vertically with jagged teeth exposed top + bottom, LEDs blazing brighter
// with extra glow ring (gg/RR).
const ATTACK: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 0
  '...p..........................................p.', // 1
  '..pPp........................................pPp', // 2
  '...p..........................................p.', // 3
  '................................................', // 4
  '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..............', // 5
  '....kLLLLLLLLLLLLLLLLLLLLLLLLLLLLDk.............', // 6
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.............', // 7
  '....kLMggRRrr..............ggRRrr.Dk............', // 8
  '....kLMgRRRrr..............gRRRrr.Dk............', // 9
  '....kLMggRRrr..............ggRRrr.Dk............', // 10
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMDk............', // 11
  '....kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk............', // 12
  '....ksssssssssssssssssssssssssssssssk...........', // 13
  '....ksTssTssTssTssTssTssTssTssTssTssk...........', // 14
  '....kssssssssssssssssssssssssssssssssk..........', // 15
  '....ksTsTsTsTsTsTsTsTsTsTsTsTsTsTsTsTk..........', // 16
  '....kssssssssssssssssssssssssssssssssk..........', // 17
  '....ksTssTssTssTssTssTssTssTssTssTssTk..........', // 18
  '....ksssssssssssssssssssssssssssssssk...........', // 19
  '....kssssssssssssssssssssssssssssssk............', // 20
  '....kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk............', // 21
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMDk............', // 22
  '....kLMMLLLLLLLLLLLLLLLLLLLLLLLLLLMDk...........', // 23
  '....kLMMLDDDDDDDDDDDDDDDDDDDDDDDDDLMDk..........', // 24
  '....kLMMLDMMMMMMMMMMMMMMMMMMMMMMMMDLMDk.........', // 25
  '....kLMMLDMLLLLLLLLLLLLLLLLLLLLLLMDDLMDk........', // 26
  '....kLMMLDMMMMMMMMMMMMMMMMMMMMMMMMDDLMDk........', // 27
  '....kLMMLDDDDDDDDDDDDDDDDDDDDDDDDDDDLMDk........', // 28
  '....kLMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDk........', // 29
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDk........', // 30
  '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkc........', // 31
  '......kMMk.........................kMMkc........', // 32
  '......kMMk.........................kMMk.cc......', // 33
  '......kMMk.........................kMMk..cc.....', // 34
  '......kMMk.........................kMMk...cc....', // 35
  '......kMMk.........................kMMk....c....', // 36
  '......kKKk.........................kKKk....c....', // 37
  '......kkkk.........................kkkk....cc...', // 38
  '................................................', // 39
  '................................................', // 40
  '................................................', // 41
  '................................................', // 42
  '................................................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── HIT ─────────────────────────────────────────────────────────────────────
// Body recoiled — chassis is now darker overall (D+M instead of L+M), one
// LED has flickered out (kKk void), the other is dim red (no glow ring).
// Slot is asymmetric, paper bits scatter chaotically.
const HIT: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  '................................................', // 0
  '....p.....................p.....................', // 1
  '...pPp...................pPp....................', // 2
  '....p.....................p.....................', // 3
  '..........p.....................................', // 4
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..........', // 5
  '........kDDDDDDDDDDDDDDDDDDDDDDDDDDDDLLk........', // 6
  '........kDDMMMMMMMMMMMMMMMMMMMMMMMMMMMLk........', // 7
  '........kDDM.kkk...............rrr.MMLk.........', // 8
  '........kDDM.kKk...............rRr.MMLk.........', // 9
  '........kDDM.kkk...............rrr.MMLk.........', // 10
  '........kDDMMMMMMMMMMMMMMMMMMMMMMMMMMMLk........', // 11
  '........kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk........', // 12
  '........ksssssssssssssssssssssssssssssk.........', // 13
  '........ksTtTtTtTtTtTtTtssssssssssssssk.........', // 14
  '........ksssssssssssssssssssssssssssssk.........', // 15
  '........kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk........', // 16
  '........kDDMMMMMMMMMMMMMMMMMMMMMMMMMMMLk........', // 17
  '........kDDMLLLLLLLLLLLLLLLLLLLLLLLLLMMk........', // 18
  '........kDDMLDDDDDDDDDDDDDDDDDDDDDDDLMMk........', // 19
  '........kDDMLDMMMMMMMMMMMMMMMMMMMMDDDLMk........', // 20
  '........kDDMLDMLLLLLLLLLLLLLLLLLMDDDLLMk........', // 21
  '........kDDMLDMLDDDDDDDDDDDDDDDLMDDDLLMk........', // 22
  '........kDDMLDMLDMMMMMMMMMMMMMDLMDDDLLMk........', // 23
  '........kDDMLDMLDDDDDDDDDDDDDDDLMDDDLLMk........', // 24
  '........kDDMLDMLLLLLLLLLLLLLLLLLMDDDLLMk........', // 25
  '........kDDMLDMMMMMMMMMMMMMMMMMMMMDDDLMk........', // 26
  '........kDDMLDDDDDDDDDDDDDDDDDDDDDDDLMMk........', // 27
  '........kDDMLLLLLLLLLLLLLLLLLLLLLLLLLMMk........', // 28
  '........kDDMMMMMMMMMMMMMMMMMMMMMMMMMMMLk........', // 29
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkc........', // 30
  '..........kKKk.....................kMMkc........', // 31
  '..........kKKk.....................kMMk.cc......', // 32
  '..........kKKk.....................kMMk..cc.....', // 33
  '..........kKKk.....................kMMk...cc....', // 34
  '..........kKKk.....................kMMk....c....', // 35
  '..........kKKk.....................kMMk....c....', // 36
  '..........kKKk.....................kMMk....cc...', // 37
  '..........kKKk.....................kKKk.....c...', // 38
  '..........kkkk.....................kkkk.....c...', // 39
  '......p..........p.................p.......cc...', // 40
  '.....pPp........pPp...............pPp......c....', // 41
  '......p..........p.................p............', // 42
  '................................................', // 43
  '................................................', // 44
  '................................................', // 45
  '................................................', // 46
  '................................................', // 47
];

// ── SPECIAL ─────────────────────────────────────────────────────────────────
// PAPER STORM — chassis upright, LEDs blazing, paper bits exploding outward
// in concentric rings filling the entire canvas.
const SPECIAL: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
  'p.....p.....p..............p.....p.....p.....p..', // 0
  '.pPp...pPp...pPp..........pPp...pPp...pPp...pPp.', // 1
  'p..p....p.....p.....p.....p.....p....p..p.....p.', // 2
  '..p..................pPp..........p..p..p.....p.', // 3
  '.p..p..............p..p..p..............p......p', // 4
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk....p.....', // 5
  '........kLLLLLLLLLLLLLLLLLLLLLLLLLLLLDk...pPp..p', // 6
  'p.......kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk....p..pP', // 7
  'pPp.....kLMggRRrr...........ggRRrr.MDk........p.', // 8
  'p.......kLMgRRRrr...........gRRRrr.MDk........p.', // 9
  '........kLMggRRrr...........ggRRrr.MDk..........', // 10
  '....p...kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk....p....', // 11
  '...pPp..kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk...pPp...', // 12
  '....p...ksssssssssssssssssssssssssssssk....p....', // 13
  '........ksTtTtTtTtTtTtTtTtTtTtTtTtTtTsk.........', // 14
  'p.......ksssssssssssssssssssssssssssssk........p', // 15
  'pPp.....kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.......pP', // 16
  'p.......kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDk........p', // 17
  '........kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk........', // 18
  '....p...kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk...p....', // 19
  '...pPp..kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.pPp...', // 20
  '....p...kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk..p....', // 21
  '........kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk.......', // 22
  '..p.....kLMMLDMLDMMMMMMMMMMMMMDLMDDDLLMDk....p..', // 23
  '.pPp....kLMMLDMLDDDDDDDDDDDDDDDLMDDDLLMDk...pPp.', // 24
  '..p.....kLMMLDMLLLLLLLLLLLLLLLLLMDDDLLMDk....p..', // 25
  '........kLMMLDMMMMMMMMMMMMMMMMMMMMDDDLMDk.......', // 26
  '....p...kLMMLDDDDDDDDDDDDDDDDDDDDDDDLMDk...p....', // 27
  '...pPp..kLMMLLLLLLLLLLLLLLLLLLLLLLLLMMDk..pPp...', // 28
  '....p...kLMMMMMMMMMMMMMMMMMMMMMMMMMMMDDk...p....', // 29
  '........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkc........', // 30
  '..........kMMk.....................kMMkc..p.....', // 31
  '....p.....kMMk.....................kMMk.c.pPp...', // 32
  '...pPp....kMMk.....................kMMk..cc.p...', // 33
  '....p.....kMMk.....................kMMk...cc....', // 34
  '..........kMMk.....................kMMk....c....', // 35
  '..p.......kMMk.....................kMMk....c....', // 36
  '.pPp......kMMk.....................kMMk....cc...', // 37
  '..p.......kKKk.....................kKKk.....c...', // 38
  '..........kkkk.....................kkkk.....c...', // 39
  '.....p.....p..........P............P.......cc...', // 40
  '....pPp...pPp........pPp..........pPp......c....', // 41
  '.....p.....p..........P............P............', // 42
  '..p..p.....p.....p..p.................p.....p...', // 43
  '.pPp...p..pPp.pPp..pPp...p..p..pPp..p..pPp..pPp.', // 44
  '..p...pPp..p.p..p...p...pPp....p...pPp..p...p...', // 45
  'p.....p.p.p..p.p.....p...p..p..p.....p.p..p...P.'.slice(0, 48), // 46
  '.pPp....p..p.p..p.....p...p....p.p..p..p.....pPp', // 47
];

// ── DEFEAT ──────────────────────────────────────────────────────────────────
// Collapsed sideways onto its right side (visually rotated 90° so the slot
// faces UP). LEDs dark (kKk), sparks flying off the body, power cord limp.
const DEFEAT: readonly string[] = [
  //        012345678901234567890123456789012345678901234567
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
  '...........................o....................', // 10
  '..........................yoy..........o........', // 11
  '...........................oy.........yoy.......', // 12
  '............................o..........oy.......', // 13
  '..........................................o.....', // 14
  '................................................', // 15
  '................................................', // 16
  '................................................', // 17
  '................................................', // 18
  '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk........', // 19
  '....kLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLDk.......', // 20
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.......', // 21
  '....kLM.kkk......kkk....................MDk.....', // 22
  '....kLM.kKk......kKk....................MDk.....', // 23
  '....kLM.kkk......kkk....................MDk.....', // 24
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.....', // 25
  '....kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.....', // 26
  '....ksssssssssssssssssssssssssssssssssssssk.....', // 27
  '....ksTtTtTtTtTtTtTtTtTtTtTtTtTtTtTtTtTtTtsk....', // 28
  '....ksssssssssssssssssssssssssssssssssssssk.....', // 29
  '....kLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.....', // 30
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDk.....', // 31
  '....kLMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMDk...', // 32
  '....kLMMLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDLLMDk..', // 33
  '....kLMMLDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDLLMDk.', // 34
  '....kLMMLDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDDDLMDk.', // 35
  '....kLMMLDMLDDDDDDDDDDDDDDDDDDDDDDDDDDDLMDDDLMDk', // 36
  '....kLMMLDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDDDLMDk.', // 37
  '....kLMMLDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDLLMDk.', // 38
  '....kLMMLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDLLMDk..', // 39
  '....kLMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMDk..', // 40
  '....kLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDk..', // 41
  '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk...', // 42
  '....kKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKk...', // 43
  '....kkkk................................kkkk....', // 44
  '..........................................ccc...', // 45
  '............................................c...', // 46
  '............................................cc..', // 47
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
      `[resume-shredder] pose "${name}" must have ${W} rows, got ${rows.length}`,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W) {
      throw new Error(
        `[resume-shredder] pose "${name}" row ${i} must be ${W} chars, got ${r.length}`,
      );
    }
  }
}
(Object.keys(POSES) as ActionState[]).forEach((k) => assertGrid(k, POSES[k]));

function ResumeShredderSprite({
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
    id: 'resume-shredder',
    name: '履歷碎紙獸',
    englishName: 'Resume Shredder',
    role: 'job-hunting',
    tier: 'minor',
    topic: 'job-hunting',
    description: '雙足直立的工業碎紙機怪物，紅色眼睛、滿口利齒。',
  },
  Sprite: ResumeShredderSprite,
};

export default character;
