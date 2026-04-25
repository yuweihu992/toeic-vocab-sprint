import type { Enemy, HitType } from './types';

export interface DamageRoll {
  type: HitType;
  damage: number;
}

/**
 * Rolls a player attack outcome. Distribution:
 *   60% normal   : 10 dmg
 *   25% critical : 25 dmg
 *   10% double   : 30 dmg total (15 × 2 — surfaced as a single 'double' roll)
 *    5% finisher : 9999 dmg (instant kill any enemy)
 *
 * The RNG is injectable so callers can pass a seeded source for testing /
 * deterministic playback. Defaults to Math.random.
 */
export function rollPlayerAttack(rng: () => number = Math.random): DamageRoll {
  const r = rng();
  if (r < 0.6) {
    return { type: 'normal', damage: 10 };
  }
  if (r < 0.85) {
    return { type: 'critical', damage: 25 };
  }
  if (r < 0.95) {
    return { type: 'double', damage: 30 };
  }
  return { type: 'finisher', damage: 9999 };
}

/**
 * Rolls an enemy attack on the player.
 *  - If `isNearMiss` is true, the player picked a confusable: half damage,
 *    type 'miss'. Damage is rounded up so a 5-atk enemy still does 3 (not 2).
 *  - Otherwise, full enemy.attackPower damage, type 'normal'.
 */
export function rollEnemyAttack(enemy: Enemy, isNearMiss: boolean): DamageRoll {
  if (isNearMiss) {
    return { type: 'miss', damage: Math.ceil(enemy.attackPower / 2) };
  }
  return { type: 'normal', damage: enemy.attackPower };
}

/**
 * Did the user "almost get it right"? True iff the user's selected answer is
 * one of the correct word's confusables (case-insensitive, trimmed).
 *
 * Pure: no side effects, no I/O.
 */
export function isNearMiss(
  selectedAnswer: string,
  correctAnswer: string,
  confusables: readonly string[],
): boolean {
  const sel = selectedAnswer.trim().toLowerCase();
  if (sel.length === 0) return false;
  // The selection must NOT be the correct answer (that would be a hit, not a miss).
  if (sel === correctAnswer.trim().toLowerCase()) return false;
  return confusables.some((c) => c.trim().toLowerCase() === sel);
}
