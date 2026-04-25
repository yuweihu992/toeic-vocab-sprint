import { forwardRef, type CSSProperties } from 'react';
import {
  WarriorSprite,
  EnemySprite,
  type SpriteState,
  type EnemySpriteState,
} from '../assets/sprites';
import type { BattleState } from '../battle/types';

interface Props {
  battle: BattleState;
  warriorState: SpriteState;
  enemyState: EnemySpriteState;
  warriorRef: React.RefObject<HTMLDivElement>;
  enemyRef: React.RefObject<HTMLDivElement>;
  shakeStyle: CSSProperties;
}

interface HpBarProps {
  label: string;
  current: number;
  max: number;
  variant: 'player' | 'enemy';
  align: 'left' | 'right';
}

function HpBar({ label, current, max, variant, align }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const lowHp = pct <= 25;
  const fillColor =
    variant === 'player'
      ? lowHp
        ? 'bg-rose-500'
        : 'bg-emerald-500'
      : 'bg-rose-500';

  return (
    <div className={`w-44 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span
          className={`text-sm font-bold text-slate-100 drop-shadow ${align === 'right' ? 'order-2' : ''}`}
        >
          {label}
        </span>
        <span
          className={`text-xs tabular-nums text-slate-300 ${align === 'right' ? 'order-1' : ''}`}
        >
          {current}/{max}
        </span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-500 shadow-inner">
        <div
          className={`h-full ${fillColor} transition-all duration-500 ease-out ${lowHp ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export const BattleScene = forwardRef<HTMLDivElement, Props>(function BattleScene(
  { battle, warriorState, enemyState, warriorRef, enemyRef, shakeStyle },
  ref,
) {
  const enemySize = battle.enemy.tier === 'boss' ? 220 : 160;

  return (
    <div ref={ref} style={shakeStyle} className="relative w-full">
      {/* Dramatic ground glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center bottom, rgba(127, 29, 29, 0.35), transparent 60%)',
        }}
      />

      {/* HP Bars row */}
      <div className="flex justify-between items-start px-6 pt-4 pb-2 relative z-10">
        <HpBar
          label="戰士"
          current={battle.playerHp}
          max={battle.playerMaxHp}
          variant="player"
          align="left"
        />
        <HpBar
          label={battle.enemy.name}
          current={battle.enemyHp}
          max={battle.enemy.maxHp}
          variant="enemy"
          align="right"
        />
      </div>

      {/* Battle field */}
      <div className="flex justify-around items-end px-6 py-4 min-h-[260px] relative">
        <div ref={warriorRef} className="flex-shrink-0">
          <WarriorSprite state={warriorState} size={160} />
        </div>
        <div ref={enemyRef} className="flex-shrink-0">
          <EnemySprite id={battle.enemy.id} state={enemyState} size={enemySize} />
        </div>
      </div>
    </div>
  );
});
