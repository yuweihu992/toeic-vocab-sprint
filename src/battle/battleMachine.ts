import { rollEnemyAttack, rollPlayerAttack } from './damage';
import type { BattleAction, BattleState, Enemy, Hit } from './types';

const DEFAULT_PLAYER_MAX_HP = 50;

/**
 * Builds a fresh battle state for the given enemy. Defaults the player's max
 * HP to 50 if not specified.
 */
export function startBattle(
  enemy: Enemy,
  playerMaxHp: number = DEFAULT_PLAYER_MAX_HP,
): BattleState {
  return {
    enemy,
    enemyHp: enemy.maxHp,
    playerHp: playerMaxHp,
    playerMaxHp,
    questionsAnswered: 0,
    questionsCorrect: 0,
    hits: [],
    status: 'fighting',
  };
}

/**
 * Pure reducer: given current state and an action, returns the next state.
 *
 * Contract:
 *  - CORRECT_ANSWER: roll player attack, decrement enemyHp, transition to
 *    'victory' if enemyHp ≤ 0, append the hit, bump answered & correct.
 *  - WRONG_ANSWER:   roll enemy attack (honoring isNearMiss), decrement
 *    playerHp, transition to 'defeat' if playerHp ≤ 0, append the hit, bump
 *    answered.
 *  - SKIP:           bump questionsAnswered only — no HP change, no hit.
 *  - RESET:          rebuild a fresh state (also valid in non-fighting status).
 *
 * If the battle is already over (status !== 'fighting'), all actions except
 * RESET are no-ops (the same state is returned) to prevent further mutation.
 *
 * The RNG is injectable for deterministic tests; defaults to Math.random.
 */
export function applyAction(
  state: BattleState,
  action: BattleAction,
  rng: () => number = Math.random,
): BattleState {
  // RESET is always allowed, even after victory/defeat.
  if (action.type === 'RESET') {
    return startBattle(action.enemy, action.playerMaxHp);
  }

  // All other actions are no-ops once the fight is decided.
  if (state.status !== 'fighting') {
    return state;
  }

  switch (action.type) {
    case 'CORRECT_ANSWER': {
      const roll = rollPlayerAttack(rng);
      const enemyHp = Math.max(0, state.enemyHp - roll.damage);
      const hit: Hit = {
        type: roll.type,
        damage: roll.damage,
        isPlayerDamaged: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        enemyHp,
        questionsAnswered: state.questionsAnswered + 1,
        questionsCorrect: state.questionsCorrect + 1,
        hits: [...state.hits, hit],
        status: enemyHp <= 0 ? 'victory' : 'fighting',
      };
    }

    case 'WRONG_ANSWER': {
      const roll = rollEnemyAttack(state.enemy, action.isNearMiss);
      const playerHp = Math.max(0, state.playerHp - roll.damage);
      const hit: Hit = {
        type: roll.type,
        damage: roll.damage,
        isPlayerDamaged: true,
        timestamp: Date.now(),
      };
      return {
        ...state,
        playerHp,
        questionsAnswered: state.questionsAnswered + 1,
        hits: [...state.hits, hit],
        status: playerHp <= 0 ? 'defeat' : 'fighting',
      };
    }

    case 'SKIP': {
      return {
        ...state,
        questionsAnswered: state.questionsAnswered + 1,
      };
    }
  }
}
