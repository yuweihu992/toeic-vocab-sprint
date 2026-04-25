// Character: Coffee Golem (咖啡機巨像)
// A hulking humanoid stone-and-metal golem whose torso is an industrial
// espresso machine: pressure gauge, buttons, drip tray, brass steam wand
// poking out the side. Steam constantly puffs from the top of its head.
// Brown coffee-bean eyes, slouched exhausted posture. Right arm ends in
// a portafilter (espresso handle) that thrusts forward; left arm holds
// a small white espresso cup that drips brown liquid.
// Faces LEFT — drawn so the portafilter arm leads to the viewer's left.

import { memo, type ReactElement } from 'react';
import { PixelGrid } from './PixelGrid';
import type {
  ActionState,
  CharacterArt,
  CharacterSpriteProps,
} from './types';

/* ── Palette ────────────────────────────────────────────────
   Each glyph is exactly one ASCII char so every grid row
   stays at 48 chars (the canvas size in logical pixels).
   Light source: upper-left.
   ───────────────────────────────────────────────────────── */
const PALETTE: Readonly<Record<string, string>> = {
  // Stone body — darkest shadow → mid → highlight
  S: '#292524',
  s: '#44403c',
  m: '#78716c',
  l: '#a8a29e',
  L: '#d6d3d1',
  // Polished steel espresso-machine front (dark → highlight)
  M: '#94a3b8',
  n: '#cbd5e1',
  e: '#e5e7eb',
  E: '#f1f5f9',
  // Brass / copper accents (dark → highlight)
  B: '#d97706',
  o: '#f59e0b',
  b: '#fbbf24',
  // Black buttons / outline / sockets
  K: '#0c0a09',
  // Red power LED
  R: '#dc2626',
  // Coffee / brown bean eyes (dark → mid → highlight)
  C: '#451a03',
  c: '#78350f',
  O: '#92400e',
  // White (steam & espresso cup)
  W: '#f8fafc',
};

/* Each row MUST be exactly 48 chars. '.' = transparent. */
const W_PX = 48;

function assertGrid(rows: readonly string[], label: string): readonly string[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? '';
    if (r.length !== W_PX) {
      throw new Error(
        `coffee-golem ${label} row ${i} has length ${r.length}, expected ${W_PX}`,
      );
    }
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   IDLE — slouched standing, espresso-machine torso facing
   viewer's left, steam drifting up from the top of its head,
   portafilter arm dangling forward, cup arm hanging back with
   a slow drip of dark coffee.
   ───────────────────────────────────────────────────────────── */
const IDLE: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '..............W.......W.........................',
    /* 02 */ '............WWWW....WWWW........................',
    /* 03 */ '...........W.WWWW..WWWW.W.......................',
    /* 04 */ '............WWW.WWWWW.WWW.......................',
    /* 05 */ '..............WWWWWWWWW.........................',
    /* 06 */ '...............WWWWWWWW.........................',
    /* 07 */ '...........SSSSSSSSSSSSSS.......................',
    /* 08 */ '..........SsssmmmmllLlmmsS......................',
    /* 09 */ '.........SsmmllLLLLLlllmsS......................',
    /* 10 */ '........SsmlLLLLLLLLlllmmsS.....................',
    /* 11 */ '........SmlLLLCCLLLCCllmmmsS....................',
    /* 12 */ '........SmlLLCCCLLLCCCllmmS.....................',
    /* 13 */ '........SmlLLLLLLLLLLLLlmmS.....................',
    /* 14 */ '........SmlLLLLLKKLLLLLlmsS.....................',
    /* 15 */ '........SsmlllLKKKKLlllmsS......................',
    /* 16 */ '.........SsmmmmllllllmmsS.......................',
    /* 17 */ '.........SssmmmmmmmmmmsSS.......................',
    /* 18 */ '........SSKKKKKKKKKKKKKKKSS.....................',
    /* 19 */ '.......SKMMMnnnnnnnnnnnMMK......................',
    /* 20 */ '.......SKMnnEEeeeeeeennnMK......................',
    /* 21 */ '.......SKMnEEnnnnEEnnnneMK....BBBB..............',
    /* 22 */ '.......SKMnEnRbBnEnnnnneMK...BoooB..............',
    /* 23 */ '.......SKMnEnbbBnEnnnnneMK..BoooooB.............',
    /* 24 */ '.......SKMnEnnnnnEKKnnneMK..BobbboB.............',
    /* 25 */ '.......SKMnEEEEEEEEKKnneMK...BoooB..............',
    /* 26 */ '.......SKMnnKnKnKnnKKKnnMK....BBBB..............',
    /* 27 */ '.......SKMMnKnKnKnnnnnnMMK......................',
    /* 28 */ '.......SKMMnnnnnnnnnnnMMMK......................',
    /* 29 */ '.......SKMMMMMMMMMMMMMMMMK......................',
    /* 30 */ '.......SKKKKKKKKKKKKKKKKKKK.....................',
    /* 31 */ '.......SKnnEnEnEnEnEnEnEnK......................',
    /* 32 */ '.......SKMMMMMMMMMMMMMMMMK......................',
    /* 33 */ '.......SKKKKKKKKKKKKKKKKKK......................',
    /* 34 */ '........SsssmmmmmmmmmmmsS.......................',
    /* 35 */ '......SSsmmlllllllllllmmS.......................',
    /* 36 */ '.....SslmllllLLLLLLlllmmS.......................',
    /* 37 */ '....SslmllLLLLLLLllllmmsS.......................',
    /* 38 */ '...SslmllllllllllllmmsSSWWW.....................',
    /* 39 */ '..SslmlllllllmmmsssSSS.WEW......................',
    /* 40 */ '..SsmllmmmmsssSSS......WWW......................',
    /* 41 */ '...SSssSSSS............WEW......................',
    /* 42 */ '.......................WEW......................',
    /* 43 */ '......................WWWWW.....................',
    /* 44 */ '......................WEEEW.....................',
    /* 45 */ '......................WWWWW.....................',
    /* 46 */ '..........................c.....................',
    /* 47 */ '..........................c.....................',
  ],
  'idle',
);

/* ─────────────────────────────────────────────────────────────
   WALK — heavy lurching to the viewer's left. Body tilts
   forward, near leg lifted mid-stride, far leg planted; coffee
   drips trailing from the cup hand. Steam still rises but
   tilted by motion.
   ───────────────────────────────────────────────────────────── */
const WALK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '............W..........W........................',
    /* 02 */ '..........WWWW.......WWWW.......................',
    /* 03 */ '.........W.WWWWW...WWWWW.W......................',
    /* 04 */ '..........WWWWWWWWWWWWWWWW......................',
    /* 05 */ '...........WWWWWWWWWWWWWW.......................',
    /* 06 */ '.........SSSSSSSSSSSSSS.........................',
    /* 07 */ '........SsssmmmmllLlmmsS........................',
    /* 08 */ '.......SsmmllLLLLLlllmsS........................',
    /* 09 */ '......SsmlLLLLLLLLlllmmsS.......................',
    /* 10 */ '......SmlLLLCCLLLCCllmmmsS......................',
    /* 11 */ '......SmlLLCCCLLLCCCllmmS.......................',
    /* 12 */ '......SmlLLLLLLLLLLLLlmmS.......................',
    /* 13 */ '......SmlLLLLLKKLLLLLlmsS.......................',
    /* 14 */ '......SsmlllLKKKKLlllmsS........................',
    /* 15 */ '.......SsmmmmllllllmmsS.........................',
    /* 16 */ '.......SssmmmmmmmmmmsSS.........................',
    /* 17 */ '......SSKKKKKKKKKKKKKKKSS.......................',
    /* 18 */ '.....SKMMMnnnnnnnnnnnMMK........................',
    /* 19 */ '.....SKMnnEEeeeeeeennnMK........................',
    /* 20 */ '.....SKMnEEnnnnEEnnnneMK......BBBB..............',
    /* 21 */ '.....SKMnEnRbBnEnnnnneMK.....BoooB..............',
    /* 22 */ '.....SKMnEnbbBnEnnnnneMK....BoooooB.............',
    /* 23 */ '.....SKMnEnnnnnEKKnnneMK....BobbboB.............',
    /* 24 */ '.....SKMnEEEEEEEEKKnneMK.....BoooB..............',
    /* 25 */ '.....SKMnnKnKnKnnKKKnnMK......BBBB..............',
    /* 26 */ '.....SKMMnKnKnKnnnnnnMMK........................',
    /* 27 */ '.....SKMMnnnnnnnnnnnMMMK........................',
    /* 28 */ '.....SKMMMMMMMMMMMMMMMMK........................',
    /* 29 */ '.....SKKKKKKKKKKKKKKKKKKK.......................',
    /* 30 */ '.....SKnnEnEnEnEnEnEnEnK........................',
    /* 31 */ '.....SKMMMMMMMMMMMMMMMMK........................',
    /* 32 */ '.....SKKKKKKKKKKKKKKKKKK........................',
    /* 33 */ '......SsssmmmmmmmmmmmsS.........................',
    /* 34 */ '....SSsmmlllllllllllmmS.........................',
    /* 35 */ '...SslmllllLLLLLLlllmmS.........................',
    /* 36 */ '...SslmllLLLLLLLllllmmsS......WWW...............',
    /* 37 */ '.SSslmlllllllllllllmmsSS.....WEW................',
    /* 38 */ 'SslmllllllSSSSss.SSss........WWW................',
    /* 39 */ 'SsmmmmllSSS......SsmmmllSSS..WEW................',
    /* 40 */ '.SSssSSS..........SsmllmmsS.WWWWW...............',
    /* 41 */ '..................SSsmmmsSSWEEEW................',
    /* 42 */ '....................SSSSS..WWWWW................',
    /* 43 */ '...........c..........................c.........',
    /* 44 */ '..........O.c........................c..........',
    /* 45 */ '..........c..........................c..........',
    /* 46 */ '..........O..........................O..........',
    /* 47 */ '...........c..........................c.........',
  ],
  'walk',
);

/* ─────────────────────────────────────────────────────────────
   ATTACK — portafilter arm thrust forward to viewer's left,
   espresso shot blasting out as a thick brown stream/jet.
   Body leans into the strike, brass wand still steaming.
   ───────────────────────────────────────────────────────────── */
const ATTACK: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '..................W.......W.....................',
    /* 02 */ '................WWWW....WWWW....................',
    /* 03 */ '...............W.WWWW..WWWW.W...................',
    /* 04 */ '................WWWWWWWWWWWW....................',
    /* 05 */ '.................WWWWWWWWWW.....................',
    /* 06 */ '.............SSSSSSSSSSSSSS.....................',
    /* 07 */ '............SsssmmmmllLlmmsS....................',
    /* 08 */ '...........SsmmllLLLLLlllmsS....................',
    /* 09 */ '..........SsmlLLLLLLLLlllmmsS...................',
    /* 10 */ '..........SmlLLLCCLLLCCllmmmsS..................',
    /* 11 */ '..........SmlLLCCCLLLCCCllmmS...................',
    /* 12 */ '..........SmlLLLLLLLLLLLLlmmS...................',
    /* 13 */ '..........SmlLLKKLKKLLLLLlmsS...................',
    /* 14 */ '..........SsmlKKKKKKKLlllmsS....................',
    /* 15 */ '...........SsmmmmllllllmmsS.....................',
    /* 16 */ '...........SssmmmmmmmmmmsSS.....................',
    /* 17 */ '..........SSKKKKKKKKKKKKKKKSS...................',
    /* 18 */ '.........SKMMMnnnnnnnnnnnMMK....................',
    /* 19 */ '.........SKMnnEEeeeeeeennnMK....................',
    /* 20 */ '.........SKMnEEnnnnEEnnnneMK........BBBB........',
    /* 21 */ '.........SKMnEnRbBnEnnnnneMK.......BoooB........',
    /* 22 */ '.........SKMnEnbbBnEnnnnneMK......BoooooB.......',
    /* 23 */ '.........SKMnEnnnnnEKKnnneMK......BobbboB.......',
    /* 24 */ '.........SKMnEEEEEEEEKKnneMK.......BoooB........',
    /* 25 */ '.........SKMnnKnKnKnnKKKnnMK........BBBB........',
    /* 26 */ '.........SKMMnKnKnKnnnnnnMMK....................',
    /* 27 */ 'KKKK.....SKMMnnnnnnnnnnnMMMK....................',
    /* 28 */ 'KBBBKK...SKMMMMMMMMMMMMMMMMK....................',
    /* 29 */ 'KBoBobBKKSKKKKKKKKKKKKKKKKKKK...................',
    /* 30 */ 'KBoBobBKKSKnnEnEnEnEnEnEnEnK....................',
    /* 31 */ 'KBBBKKK..SKMMMMMMMMMMMMMMMMK....................',
    /* 32 */ '.KKK.....SKKKKKKKKKKKKKKKKKK....................',
    /* 33 */ 'cccc......SsssmmmmmmmmmmmsS.....................',
    /* 34 */ 'CCcccc..SSsmmlllllllllllmmS.....................',
    /* 35 */ 'cCcCcccSslmllllLLLLLLlllmmS.....................',
    /* 36 */ 'CCcccCSslmllLLLLLLLllllmmsS........WWW..........',
    /* 37 */ 'cccc.SSslmlllllllllllllmmsSS......WEW...........',
    /* 38 */ 'cc..SslmllllllllllllllmmsS........WWW...........',
    /* 39 */ '...SslmlllllllllmmmsssSSS.........WEW...........',
    /* 40 */ '...SsmllmmmmsssSSS...............WWWWW..........',
    /* 41 */ '....SSssSSSS.....................WEEEW..........',
    /* 42 */ '.................................WWWWW..........',
    /* 43 */ '....................................c...........',
    /* 44 */ '...................................Oc...........',
    /* 45 */ '....................................c...........',
    /* 46 */ '....................................O...........',
    /* 47 */ '....................................c...........',
  ],
  'attack',
);

/* ─────────────────────────────────────────────────────────────
   HIT — staggered backward, steam venting violently from
   ruptures in the side. Body cracked across the head and torso
   (visible black crack lines), red LED flashing. Eyes wide.
   ───────────────────────────────────────────────────────────── */
const HIT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ 'W....W.....W..........W.....W..W.........W......',
    /* 02 */ 'WW.WWW...WWWW...W..WWWWWWWWWWWWWW.....WWWW......',
    /* 03 */ 'WWWWW.W.WWWWW.WWW.WWWWWWWWWWWWWWWWW..WWWWW.W....',
    /* 04 */ '.WWWWWWWWWWWWWWWWW...WWWWWWWWWWWWWWWWWWWWWWWWW..',
    /* 05 */ '..WWWWWWWWWWWWWWW.....WWWWWWWWWWWWWWWWWWWWWW....',
    /* 06 */ '...........SSSSKSSSSKSSSS.......................',
    /* 07 */ '..........SsssmKmmllLlmmsS......................',
    /* 08 */ '.........SsmmllKLLLLlllmsS......................',
    /* 09 */ '........SsmlLLLKLLLLlllmmsS.....................',
    /* 10 */ '........SmlLLLCKLLLCCllmmmsS....................',
    /* 11 */ '........SmlLLCCCLLLCCCllmmS.....................',
    /* 12 */ '........SmKKKKKKKKKKKKKKKmmS....................',
    /* 13 */ '........SmlLLLLLLLLLLLLLlmsS....................',
    /* 14 */ '........SsmlllLLLLLLLlllmsS.....................',
    /* 15 */ '.........SsmmmmllllllmmsS.......................',
    /* 16 */ '.........SssmmmmmmmmmmsSS.......................',
    /* 17 */ '........SSKKKKKKKKKKKKKKKSS.....................',
    /* 18 */ '.......SKMMMnnnnnnnnnnnMMK......................',
    /* 19 */ '.......SKMnnEEeeKeeeeennnMK.....................',
    /* 20 */ '.......SKMnEEnnKnEEnnnneMK....BBBB..............',
    /* 21 */ '.....WWSKMnEnRRRnEnnnnneMK...BoooB.....WW.......',
    /* 22 */ 'WWWWWWWSKMnEnRRRnEnnnnneMK..BoooooB...WWWWW.....',
    /* 23 */ 'WWWWWWWSKMnEnnnnnEKKnnneMK..BobbboB...WWWWWW....',
    /* 24 */ 'WWWWWWWSKMnEEEEEEEEKKnneMK...BoooB....WWWWWW....',
    /* 25 */ '.WWWWW.SKMnnKnKnKnnKKKnnMK....BBBB.....WWWW.....',
    /* 26 */ '.......SKMMnKKKKKKKnnnnMMK......................',
    /* 27 */ '.......SKMMnnnnnnnnnnnMMMK......................',
    /* 28 */ '.......SKMMMMMMMMMMMMMMMMK......................',
    /* 29 */ '.......SKKKKKKKKKKKKKKKKKKK.....................',
    /* 30 */ '.......SKnnEnEnEnEnEnEnEnK......................',
    /* 31 */ '.......SKMMMMMMMMMMMMMMMMK......................',
    /* 32 */ '.......SKKKKKKKKKKKKKKKKKK......................',
    /* 33 */ '........SsssmmmmKmmmmmmmsS......................',
    /* 34 */ '......SSsmmlllllKllllllmmS......................',
    /* 35 */ '.....SslmllllLLLLLLLlllmmS......................',
    /* 36 */ '....SslmllLLLLLLLllllmmsS.......................',
    /* 37 */ '...SslmlllllllllllllmmsSS....WWW................',
    /* 38 */ '..SslmllllllllllllllmmsS.....WEW................',
    /* 39 */ '..SslmllllllllmmmsssSSS......WWW................',
    /* 40 */ '..SsmllmmmmsssSSS............WEW................',
    /* 41 */ '...SSssSSSS.................WWWWW...............',
    /* 42 */ '............................WEEEW...............',
    /* 43 */ '............................WWWWW...............',
    /* 44 */ '................................c...............',
    /* 45 */ '...............................Oc...............',
    /* 46 */ '................................O...............',
    /* 47 */ '................................c...............',
  ],
  'hit',
);

/* ─────────────────────────────────────────────────────────────
   SPECIAL — CAFFEINE OVERLOAD. Whole body radiates a brown-
   orange glow (warm coffee aura framing the silhouette), steam
   erupting in every direction off the torso & head, espresso
   cup overflowing into a plume of dark coffee.
   ───────────────────────────────────────────────────────────── */
const SPECIAL: readonly string[] = assertGrid(
  [
    /* 00 */ 'W....W....W.....W..W....W.....W..W.....W....W..W',
    /* 01 */ 'WW..WWW..WWW...WWWW.WW.WWW...WWWW.WW...WWW..WWWW',
    /* 02 */ '.WW.WWWW.WWWW.WWWW...WWWWWWW.WWWW..WW.WWWWW.WWWW',
    /* 03 */ '..WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    /* 04 */ 'BBBB...WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.BBB',
    /* 05 */ 'BooBB...WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.BoBB',
    /* 06 */ 'BooooB...........SSSSSSSSSSSSSS............BoooB',
    /* 07 */ 'BobbboB.........SsssmmmmllLlmmsS..........BobboB',
    /* 08 */ 'BoooooB........SsmmllLLLLLlllmsS..........BoooBB',
    /* 09 */ '.BoooB........SsmlLLLLLLLLlllmmsS..........BBBBB',
    /* 10 */ '..BBB.........SmlLLLCCLLLCCllmmmsS........BBoBB.',
    /* 11 */ 'B....BB.......SmlLLCCCLLLCCCllmmS........BoooBB.',
    /* 12 */ 'BoBBBoBB......SmlLLLLLLLLLLLLlmmS........BoboBoB',
    /* 13 */ 'BboBoBBoB.....SmlLLLLLKKLLLLLlmsS........BBoBoBB',
    /* 14 */ 'BBBBBBoBB.....SsmlllLKKKKLlllmsS..........BBoBB.',
    /* 15 */ '..BBBBB........SsmmmmllllllmmsS............BBB..',
    /* 16 */ '...BB..........SssmmmmmmmmmmsSS............BBB..',
    /* 17 */ 'B.BBoBB.......SSKKKKKKKKKKKKKKKSS.........BBoBB.',
    /* 18 */ 'BoBoBoBB.....SKMMMnnnnnnnnnnnMMK.........BoBoBoB',
    /* 19 */ 'BoBBBBoBB....SKMnnEEeeeeeeennnMK........BBoBBoBB',
    /* 20 */ 'BBBBoBBBB....SKMnEEnnnnEEnnnneMK........BBoBBBBB',
    /* 21 */ '..BBoBB......SKMnEnRbBnEnnnnneMK..........BBoBB.',
    /* 22 */ '...BB........SKMnEnbbBnEnnnnneMK............BB..',
    /* 23 */ 'B.BoBB.......SKMnEnnnnnEKKnnneMK..........BBoBB.',
    /* 24 */ 'BoBoBB.......SKMnEEEEEEEEKKnneMK..........BoBoB.',
    /* 25 */ 'BBBBBB.......SKMnnKnKnKnnKKKnnMK..........BBBBB.',
    /* 26 */ '.BBBoB.......SKMMnKnKnKnnnnnnMMK..........BoBBB.',
    /* 27 */ '..BBB........SKMMnnnnnnnnnnnMMMK...........BBB..',
    /* 28 */ '.............SKMMMMMMMMMMMMMMMMK................',
    /* 29 */ '.BBoBB.......SKKKKKKKKKKKKKKKKKKK.......BBoBB...',
    /* 30 */ 'BoBoBoB......SKnnEnEnEnEnEnEnEnK........BoBoBoBB',
    /* 31 */ 'BBoBoBB......SKMMMMMMMMMMMMMMMMK........BBoBoBB.',
    /* 32 */ '.BoBBoB......SKKKKKKKKKKKKKKKKKK........BBoBBoB.',
    /* 33 */ '..BBBB........SsssmmmmmmmmmmmsS..........BBBBB..',
    /* 34 */ '...BB.......SSsmmlllllllllllmmS............BBB..',
    /* 35 */ 'BBoBB......SslmllllLLLLLLlllmmS..........BBoBB..',
    /* 36 */ 'BoBoBB....SslmllLLLLLLLllllmmsS..........BoBoBBB',
    /* 37 */ 'BBoBoBB..SslmlllllllllllllmmsSSWWW......BBoBBoBB',
    /* 38 */ '.BBoBBB.SslmllllllllllllllmmsS.WEW.......BBBoBB.',
    /* 39 */ '..BBB..SslmlllllllmmmsssSSS....WWW........BBB...',
    /* 40 */ '.......SsmllmmmmsssSSS........WWcWW.............',
    /* 41 */ '........SSssSSSS.............WccCccW............',
    /* 42 */ '..........BBoBB..............WCcCcCW............',
    /* 43 */ '.........BBoBoB..............WccCccW............',
    /* 44 */ '..........BBBB................WCcCW.....c.......',
    /* 45 */ '............................c..C.....OOc........',
    /* 46 */ '............................OcOcCccc.cOcccc.....',
    /* 47 */ '............................ccccCCCccCCccCcc....',
  ],
  'special',
);

/* ─────────────────────────────────────────────────────────────
   DEFEAT — collapsed forward face-down on the floor. Steam
   sputters weakly out the broken side wand. Espresso cup lies
   shattered to one side, with brown coffee pooled across the
   ground. Body cracked along the head & torso.
   ───────────────────────────────────────────────────────────── */
const DEFEAT: readonly string[] = assertGrid(
  [
    /* 00 */ '................................................',
    /* 01 */ '................................................',
    /* 02 */ '................................................',
    /* 03 */ '................................................',
    /* 04 */ '................................................',
    /* 05 */ '................................................',
    /* 06 */ '................................................',
    /* 07 */ '................................................',
    /* 08 */ '................................................',
    /* 09 */ '................................................',
    /* 10 */ '................................................',
    /* 11 */ '................................................',
    /* 12 */ '................................................',
    /* 13 */ '................................................',
    /* 14 */ '................................................',
    /* 15 */ '................................................',
    /* 16 */ '................................................',
    /* 17 */ '............W....W..............................',
    /* 18 */ '............WW.WWW..............................',
    /* 19 */ '.............WWWW...............................',
    /* 20 */ '..............WW................................',
    /* 21 */ '.................W..............................',
    /* 22 */ '...............WWW..............................',
    /* 23 */ '..............WW.W..............................',
    /* 24 */ '...............WWW..............................',
    /* 25 */ '................................................',
    /* 26 */ '................................................',
    /* 27 */ '................................................',
    /* 28 */ '................................................',
    /* 29 */ '...............SSSSSSSSSSSSSS...................',
    /* 30 */ '..............SsssmmmKmmmmmmsS..................',
    /* 31 */ '.............SsmmlllKlllllmmsS..................',
    /* 32 */ '.............SmlLLLLKLLLLlllmS..................',
    /* 33 */ '.............SmlLLCCLLLCCLllmS..................',
    /* 34 */ '.............SmlLCCCLLCCCLlmsS..................',
    /* 35 */ '.............SsmllLLLLLLlllmS...................',
    /* 36 */ '..............SsmmmmmmmmmmsS....................',
    /* 37 */ '.SSKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.............',
    /* 38 */ 'SKMMnEnEnEnEnEnEnEnEnEnEnEnEnEnEnK..............',
    /* 39 */ 'SKMnnnnEEnnnnEEnnnnnnEnRbBnnnnnnMK..............',
    /* 40 */ 'SKMnEEEEEEEnnnEEnnEEEEEnbbBnnnneMK....BBBB......',
    /* 41 */ 'SKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..BoooB......',
    /* 42 */ 'SKnEnEnEnEnEnEnEnEnEnEnEnEnEnEnEnK..............',
    /* 43 */ 'SKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.............',
    /* 44 */ '..SsslmlllllllllmmmsssSSS.......................',
    /* 45 */ '...SsmllllmmsssSSS........WWW..W................',
    /* 46 */ '....SSsssSSS........cccc..W.W.W.................',
    /* 47 */ '...........ccccCccCcCccCccCccCccCcCcccc.........',
  ],
  'defeat',
);

const FRAMES: Readonly<Record<ActionState, readonly string[]>> = {
  idle: IDLE,
  walk: WALK,
  attack: ATTACK,
  hit: HIT,
  special: SPECIAL,
  defeat: DEFEAT,
};

const Sprite = memo(function CoffeeGolemSprite({
  state,
  size = 192,
}: CharacterSpriteProps): ReactElement {
  const rows = FRAMES[state];
  return (
    <div
      className={`cs-root cs-state-${state}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${W_PX} ${W_PX}`}
        width={size}
        height={size}
        role="img"
        aria-label="Coffee Golem — 咖啡機巨像"
        shapeRendering="crispEdges"
      >
        <PixelGrid rows={rows} palette={PALETTE} />
      </svg>
    </div>
  );
});

const CoffeeGolem: CharacterArt = {
  meta: {
    id: 'coffee-golem',
    name: '咖啡機巨像',
    englishName: 'Coffee Golem',
    role: 'generic',
    tier: 'major',
    description: '以義式咖啡機為軀幹的石巨像，蒸氣不斷、滴落黑咖啡、疲倦駝背。',
  },
  Sprite,
};

export default CoffeeGolem;
