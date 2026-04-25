// Shared contract for all 30 characters in the registry.
// Each character file under src/assets/registry/<id>.tsx default-exports a CharacterArt.

import type { ComponentType } from 'react';

export type CharacterRole =
  | 'player'
  | 'job-hunting'
  | 'regulations'
  | 'generic';

export type CharacterTier = 'hero' | 'minor' | 'major' | 'boss';

/**
 * Animation states. Every character must support `idle | attack | hit | defeat`.
 * `walk` and `special` are recommended but optional — a character may map them
 * back to `idle`/`attack` poses if the artist runs out of distinct poses.
 */
export type ActionState =
  | 'idle'
  | 'walk'
  | 'attack'
  | 'hit'
  | 'special'
  | 'defeat';

export const ALL_ACTIONS: readonly ActionState[] = [
  'idle',
  'walk',
  'attack',
  'hit',
  'special',
  'defeat',
];

export interface CharacterMeta {
  /** kebab-case unique id (also the filename). */
  id: string;
  /** Chinese display name. */
  name: string;
  englishName: string;
  role: CharacterRole;
  tier: CharacterTier;
  /** Short Chinese description shown in gallery. */
  description: string;
  /** Optional topic tag (e.g. 'job-hunting' to link with vocab.json topic). */
  topic?: string;
}

export interface CharacterSpriteProps {
  state: ActionState;
  /** Display size in CSS pixels. Defaults: hero/minor/major=192, boss=240. */
  size?: number;
}

export interface CharacterArt {
  meta: CharacterMeta;
  Sprite: ComponentType<CharacterSpriteProps>;
}
