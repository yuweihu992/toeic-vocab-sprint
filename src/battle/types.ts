// Battle game logic types.
//
// The app is a TOEIC vocab practice tool wrapped in a battle layer. The user
// is a warrior, correct answers damage the enemy, wrong answers damage the
// player. Variable rewards (crits, near-misses) drive engagement.

export type EnemyId =
  | 'goblin-resume'
  | 'hr-manager'
  | 'final-interviewer'
  | 'rule-slime'
  | 'bureaucrat'
  | 'law-dragon';

export type Tier = 'minor' | 'major' | 'boss';
export type Topic = 'job-hunting' | 'regulations';

export interface Enemy {
  id: EnemyId;
  /** Chinese display name. */
  name: string;
  topic: Topic;
  tier: Tier;
  maxHp: number;
  /** Damage to player on a wrong answer (full hit, not a near-miss). */
  attackPower: number;
  /** Optional Chinese flavor text. */
  description?: string;
}

export type HitType =
  | 'normal' // standard hit
  | 'critical' // crit (~25 dmg)
  | 'double' // hit twice
  | 'finisher' // instant kill
  | 'miss'; // near-miss (player picked confusable, half damage)

export interface Hit {
  type: HitType;
  damage: number;
  /** true if the damage was to the player, false if to the enemy. */
  isPlayerDamaged: boolean;
  timestamp: number;
}

export type BattleStatus = 'fighting' | 'victory' | 'defeat';

export interface BattleState {
  enemy: Enemy;
  enemyHp: number;
  playerHp: number;
  playerMaxHp: number;
  questionsAnswered: number;
  questionsCorrect: number;
  hits: Hit[];
  status: BattleStatus;
}

export type BattleAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER'; isNearMiss: boolean }
  | { type: 'SKIP' }
  | { type: 'RESET'; enemy: Enemy; playerMaxHp?: number };
