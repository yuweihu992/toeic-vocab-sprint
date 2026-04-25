import type { Enemy, Tier, Topic } from './types';

/**
 * The full enemy roster, two topics × three tiers.
 *
 * Tuning notes (player baseline: 50 HP, ~10 dmg per normal hit):
 *  - minor (~3 hits to kill, low atk): warm-up fights
 *  - major (~7 hits to kill, mid atk): real challenge
 *  - boss  (~13 hits to kill, high atk): pacing peak
 */
export const ENEMIES: readonly Enemy[] = [
  // Job-hunting topic
  {
    id: 'goblin-resume',
    name: '哥布林履歷怪',
    topic: 'job-hunting',
    tier: 'minor',
    maxHp: 30,
    attackPower: 5,
    description: '一隻拿著皺巴巴履歷的小哥布林,專門攻擊找工作的勇者。',
  },
  {
    id: 'hr-manager',
    name: '兇悍 HR 經理',
    topic: 'job-hunting',
    tier: 'major',
    maxHp: 70,
    attackPower: 8,
    description: '冷漠的眼神能讓人瞬間失去自信,擅長拋出刁鑽的行為面試題。',
  },
  {
    id: 'final-interviewer',
    name: '終極面試官',
    topic: 'job-hunting',
    tier: 'boss',
    maxHp: 130,
    attackPower: 12,
    description: '掌握你錄取與否的最終 Boss,每一個追問都直擊靈魂。',
  },
  // Regulations topic
  {
    id: 'rule-slime',
    name: '規定史萊姆',
    topic: 'regulations',
    tier: 'minor',
    maxHp: 30,
    attackPower: 5,
    description: '由無數條雜亂條文凝結而成的史萊姆,看似柔軟卻黏人煩人。',
  },
  {
    id: 'bureaucrat',
    name: '公文官員',
    topic: 'regulations',
    tier: 'major',
    maxHp: 70,
    attackPower: 8,
    description: '手中永遠有一疊蓋不完的章,用程序正義拖垮每一位挑戰者。',
  },
  {
    id: 'law-dragon',
    name: '法規巨龍',
    topic: 'regulations',
    tier: 'boss',
    maxHp: 130,
    attackPower: 12,
    description: '盤踞於法典之巔的古龍,每一次吐息都吐出冰冷的條款。',
  },
];

/**
 * Returns the enemy that matches the given topic and tier.
 * Throws if no such enemy exists in the roster (should never happen given
 * the typed unions, but guards against future drift).
 */
export function pickEnemy(topic: Topic, tier: Tier): Enemy {
  const found = ENEMIES.find((e) => e.topic === topic && e.tier === tier);
  if (!found) {
    throw new Error(`No enemy found for topic=${topic} tier=${tier}`);
  }
  return found;
}

/**
 * Picks an enemy that escalates with how many sessions the user has
 * completed. The cycle:
 *   sessions  0..2 → minor
 *   sessions  3..6 → major
 *   sessions  7+   → boss
 *
 * The provided topic is used directly; callers can cycle topics externally
 * (e.g. session % 2).
 */
export function getEnemyForSession(topic: Topic, sessionCount: number): Enemy {
  const tier: Tier =
    sessionCount <= 2 ? 'minor' : sessionCount <= 6 ? 'major' : 'boss';
  return pickEnemy(topic, tier);
}
