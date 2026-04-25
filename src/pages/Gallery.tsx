import { useMemo, useState } from 'react';
import {
  CHARACTERS,
  ROLE_ORDER,
  ROLE_LABEL,
  type ActionState,
  type CharacterArt,
} from '../assets/registry';
import type { CharacterRole, CharacterTier } from '../assets/registry/types';

const ALL_STATES: readonly ActionState[] = [
  'idle',
  'walk',
  'attack',
  'hit',
  'special',
  'defeat',
];

const STATE_LABEL: Readonly<Record<ActionState, string>> = {
  idle: '待機',
  walk: '移動',
  attack: '攻擊',
  hit: '受擊',
  special: '必殺',
  defeat: '倒地',
};

const TIER_BADGE: Record<CharacterTier, { label: string; cls: string }> = {
  hero: { label: '英雄', cls: 'bg-amber-900 text-amber-200' },
  minor: { label: '小怪', cls: 'bg-slate-700 text-slate-300' },
  major: { label: '中王', cls: 'bg-orange-900 text-orange-200' },
  boss: { label: 'BOSS', cls: 'bg-rose-900 text-rose-200' },
};

const ROLE_ACCENT: Record<CharacterRole, string> = {
  player: 'text-amber-400',
  'job-hunting': 'text-orange-400',
  regulations: 'text-emerald-400',
  generic: 'text-sky-400',
};

interface Props {
  onExit: () => void;
}

export function Gallery({ onExit }: Props) {
  const [globalState, setGlobalState] = useState<ActionState>('idle');

  const grouped = useMemo(() => {
    const map = new Map<CharacterRole, CharacterArt[]>();
    for (const role of ROLE_ORDER) map.set(role, []);
    for (const c of CHARACTERS) {
      const list = map.get(c.meta.role);
      if (list) list.push(c);
    }
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-stone-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onExit}
            className="text-slate-400 hover:text-slate-100 text-sm"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold tracking-wide">
            角色圖鑑 · {CHARACTERS.length} 名
          </h1>
          <div className="w-12" />
        </div>

        <div className="sticky top-0 z-10 -mx-6 px-6 py-3 mb-6 bg-slate-950/80 backdrop-blur ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs text-slate-400 mr-2">動作：</span>
            {ALL_STATES.map((s) => (
              <button
                key={s}
                onClick={() => setGlobalState(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  globalState === s
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {STATE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {ROLE_ORDER.map((role) => {
          const list = grouped.get(role) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={role} className="mb-10">
              <h2
                className={`text-lg font-bold mb-4 ${ROLE_ACCENT[role]}`}
              >
                {ROLE_LABEL[role]}
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  {list.length} 名
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {list.map((c) => (
                  <CharacterCard
                    key={c.meta.id}
                    art={c}
                    state={globalState}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-center text-xs text-slate-500 mt-10">
          全部 30 名角色 · 6 種動作（待機 / 移動 / 攻擊 / 受擊 / 必殺 / 倒地）
        </p>
      </div>
    </div>
  );
}

function CharacterCard({
  art,
  state,
}: {
  art: CharacterArt;
  state: ActionState;
}) {
  const badge = TIER_BADGE[art.meta.tier];
  const size = art.meta.tier === 'boss' ? 200 : 168;
  const { Sprite, meta } = art;
  return (
    <div className="bg-slate-900/60 ring-1 ring-slate-700 rounded-2xl p-4 flex flex-col items-center">
      <div className="bg-slate-950 rounded-xl p-4 ring-1 ring-slate-800 mb-3 flex items-center justify-center w-full min-h-[220px]">
        <Sprite state={state} size={size} />
      </div>
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-bold text-slate-100 text-sm">{meta.name}</span>
          <span
            className={`text-[10px] tracking-wide px-1.5 py-0.5 rounded ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 italic mb-1">
          {meta.englishName}
        </div>
        <div className="text-xs text-slate-400 leading-snug">
          {meta.description}
        </div>
      </div>
    </div>
  );
}
