// Auto-aggregated registry of all 30 characters.
// Each character file under this folder default-exports a CharacterArt.

import type { CharacterArt, CharacterRole } from './types';

import knight from './knight';
import mage from './mage';
import ninja from './ninja';
import berserker from './berserker';
import paladin from './paladin';

import goblinResume from './goblin-resume';
import hrManager from './hr-manager';
import finalInterviewer from './final-interviewer';
import networkKnight from './network-knight';
import recruiterSpider from './recruiter-spider';
import resumeShredder from './resume-shredder';
import salaryCrab from './salary-crab';
import ceoDragon from './ceo-dragon';

import ruleSlime from './rule-slime';
import bureaucrat from './bureaucrat';
import auditAuditor from './audit-auditor';
import policyBot from './policy-bot';
import stampGoblin from './stamp-goblin';
import redTapeMummy from './red-tape-mummy';
import complianceWizard from './compliance-wizard';
import lawDragon from './law-dragon';

import meetingDemon from './meeting-demon';
import emailSpectre from './email-spectre';
import deadlineReaper from './deadline-reaper';
import taxFiend from './tax-fiend';
import spreadsheetSpider from './spreadsheet-spider';
import flightDelayDemon from './flight-delay-demon';
import conciergeVampire from './concierge-vampire';
import marketingImp from './marketing-imp';
import coffeeGolem from './coffee-golem';

export const CHARACTERS: readonly CharacterArt[] = [
  knight,
  mage,
  ninja,
  berserker,
  paladin,

  goblinResume,
  hrManager,
  finalInterviewer,
  networkKnight,
  recruiterSpider,
  resumeShredder,
  salaryCrab,
  ceoDragon,

  ruleSlime,
  bureaucrat,
  auditAuditor,
  policyBot,
  stampGoblin,
  redTapeMummy,
  complianceWizard,
  lawDragon,

  meetingDemon,
  emailSpectre,
  deadlineReaper,
  taxFiend,
  spreadsheetSpider,
  flightDelayDemon,
  conciergeVampire,
  marketingImp,
  coffeeGolem,
];

export const CHARACTERS_BY_ID: Readonly<Record<string, CharacterArt>> =
  Object.freeze(
    Object.fromEntries(CHARACTERS.map((c) => [c.meta.id, c])),
  );

export const ROLE_ORDER: readonly CharacterRole[] = [
  'player',
  'job-hunting',
  'regulations',
  'generic',
];

export const ROLE_LABEL: Readonly<Record<CharacterRole, string>> = {
  player: '玩家角色',
  'job-hunting': '求職關卡',
  regulations: '法規關卡',
  generic: '通用敵人',
};

export type { CharacterArt, CharacterMeta, ActionState } from './types';
