import { useEffect, useRef, useState } from 'react';
import { getAllWords } from '../data/loadVocab';
import {
  db,
  getDueWordIds,
  getOrCreateProgress,
  saveProgress,
} from '../db/dexie';
import { generateQuestion, type Question } from '../practice/generator';
import { reviewCard } from '../fsrs/scheduler';
import { BattleScene } from '../components/BattleScene';
import { startBattle, applyAction } from '../battle/battleMachine';
import { getEnemyForSession } from '../battle/enemies';
import { isNearMiss } from '../battle/damage';
import type { BattleState, Topic, HitType } from '../battle/types';
import type { SpriteState, EnemySpriteState } from '../assets/sprites';
import {
  useScreenShake,
  Particles,
  FloatingNumber,
  CriticalText,
  Vignette,
  BloodSplatter,
  GibsExplosion,
  ScreenFlash,
  ChromaticAberration,
  PachinkoLights,
  ComboBadge,
  FeverOverlay,
} from '../effects';
import { sfx } from '../audio/sfx';
import type { Word } from '../types/vocabulary';

const SPRINT_TIME_CAP_MS = 5 * 60 * 1000;
const FEVER_THRESHOLD = 5;

type ParticleVariant = 'blood' | 'gold' | 'bone' | 'rainbow' | 'spark';
type CritVariant = 'critical' | 'brutal' | 'overkill' | 'rampage' | 'fever';
type FloatType = 'damage' | 'crit' | 'heal' | 'miss';

interface ParticleBurst {
  id: string;
  x: number;
  y: number;
  count: number;
  color?: string;
  spread?: number;
  variant?: ParticleVariant;
}

interface FloatingNum {
  id: string;
  value: number;
  x: number;
  y: number;
  type: FloatType;
}

interface SplatterFx {
  id: string;
  x: number;
  y: number;
  intensity: 'light' | 'heavy';
  size?: number;
}

interface GibsFx {
  id: string;
  x: number;
  y: number;
  count: number;
  color: string;
  size?: number;
}

interface ActiveCriticalText {
  id: number;
  variant: CritVariant;
}

interface Props {
  onExit: () => void;
}

export function Sprint({ onExit }: Props) {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [muted, setMuted] = useState(sfx.isMuted());

  const [warriorState, setWarriorState] = useState<SpriteState>('idle');
  const [enemyState, setEnemyState] = useState<EnemySpriteState>('idle');

  // Effects
  const { trigger: triggerShake, shakeStyle } = useScreenShake();
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [floatingNums, setFloatingNums] = useState<FloatingNum[]>([]);
  const [splatters, setSplatters] = useState<SplatterFx[]>([]);
  const [gibs, setGibs] = useState<GibsFx[]>([]);
  const [criticalText, setCriticalText] = useState<ActiveCriticalText | null>(null);
  const [vignetteActive, setVignetteActive] = useState(false);
  const [chromaActive, setChromaActive] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [flashColor, setFlashColor] = useState<string>('rgba(255,255,255,1)');
  const [flashIntensity, setFlashIntensity] = useState(0.6);

  // Combo + fever
  const [combo, setCombo] = useState(0);
  const [feverActive, setFeverActive] = useState(false);

  // Session
  const [startedAt] = useState(Date.now());
  const [topicLocked, setTopicLocked] = useState<Topic>('job-hunting');
  const [timeUp, setTimeUp] = useState(false);

  const warriorRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const seenWordIds = useRef<Set<string>>(new Set());
  const chromaTimeoutRef = useRef<number | null>(null);

  // Init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionCount = await db.sessions.count();
      const topic: Topic =
        sessionCount % 2 === 0 ? 'job-hunting' : 'regulations';
      const enemy = getEnemyForSession(topic, sessionCount);
      const newBattle = startBattle(enemy);
      if (cancelled) return;
      setTopicLocked(topic);
      setBattle(newBattle);
      await loadNextQuestion(topic);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 5-min cap
  useEffect(() => {
    const timer = setTimeout(() => setTimeUp(true), SPRINT_TIME_CAP_MS);
    return () => clearTimeout(timer);
  }, []);

  // Save session record
  useEffect(() => {
    if (!battle) return;
    if (battle.status === 'fighting' && !timeUp) return;
    db.sessions.add({
      startedAt,
      endedAt: Date.now(),
      wordsReviewed: battle.questionsAnswered,
      correctCount: battle.questionsCorrect,
    });
  }, [battle?.status, timeUp]);

  async function loadNextQuestion(topic: Topic): Promise<void> {
    const allWords = getAllWords();
    const topicWords = allWords.filter((w) => w.topic === topic);
    const dueIds = await getDueWordIds(50);
    const dueSet = new Set(dueIds);

    const dueInTopic = topicWords.filter((w) => dueSet.has(w.id));
    const newInTopic = topicWords
      .filter((w) => !dueSet.has(w.id) && !seenWordIds.current.has(w.id))
      .sort((a, b) => a.difficulty - b.difficulty);

    const pool: Word[] = dueInTopic.length > 0 ? dueInTopic : newInTopic;
    const fallback = pool.length === 0 ? topicWords : pool;
    const word = fallback[Math.floor(Math.random() * fallback.length)];
    if (!word) return;

    seenWordIds.current.add(word.id);
    await getOrCreateProgress(word.id);
    setCurrentQuestion(generateQuestion(word));
    setSelectedOption(null);
    setRevealed(false);
  }

  function getSpritePos(ref: React.RefObject<HTMLDivElement>): {
    x: number;
    y: number;
  } {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function newId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function spawnBurst(b: Omit<ParticleBurst, 'id'>): void {
    setBursts((prev) => [...prev, { ...b, id: newId('b') }]);
  }
  function spawnFloating(n: Omit<FloatingNum, 'id'>): void {
    setFloatingNums((prev) => [...prev, { ...n, id: newId('f') }]);
  }
  function spawnSplatter(s: Omit<SplatterFx, 'id'>): void {
    setSplatters((prev) => [...prev, { ...s, id: newId('s') }]);
  }
  function spawnGibs(g: Omit<GibsFx, 'id'>): void {
    setGibs((prev) => [...prev, { ...g, id: newId('g') }]);
  }
  function showCrit(variant: CritVariant): void {
    setCriticalText({ id: Date.now(), variant });
  }
  function flashScreen(color: string, intensity: number): void {
    setFlashColor(color);
    setFlashIntensity(intensity);
    setFlashKey((k) => k + 1);
  }
  function pulseChroma(durationMs: number): void {
    setChromaActive(true);
    if (chromaTimeoutRef.current) window.clearTimeout(chromaTimeoutRef.current);
    chromaTimeoutRef.current = window.setTimeout(() => {
      setChromaActive(false);
    }, durationMs);
  }

  async function persistFsrsResult(word: Word, correct: boolean): Promise<void> {
    const progress = await getOrCreateProgress(word.id);
    progress.card = reviewCard(progress.card, correct ? 'good' : 'again');
    progress.reviewCount += 1;
    if (correct) progress.correctCount += 1;
    progress.lastReviewed = Date.now();
    progress.nextDue = progress.card.due.getTime();
    await saveProgress(progress);
  }

  function handleHitVisuals(
    hitType: HitType,
    pos: { x: number; y: number },
    damage: number,
    isFeverNow: boolean,
  ): void {
    const useRainbow = isFeverNow;

    switch (hitType) {
      case 'normal': {
        sfx.hit();
        if (isFeverNow) sfx.bloodSplat();
        triggerShake('light');
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: useRainbow ? 22 : 16,
          variant: useRainbow ? 'rainbow' : 'blood',
        });
        spawnSplatter({ x: pos.x, y: pos.y + 30, intensity: 'light', size: 70 });
        spawnFloating({
          value: damage,
          x: pos.x,
          y: pos.y - 30,
          type: useRainbow ? 'crit' : 'damage',
        });
        break;
      }
      case 'critical': {
        sfx.critical();
        sfx.bloodSplat();
        triggerShake('heavy');
        flashScreen('rgba(255,255,255,1)', 0.55);
        pulseChroma(500);
        showCrit(isFeverNow ? 'rampage' : 'critical');
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 30,
          variant: 'gold',
          spread: 110,
        });
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 18,
          variant: useRainbow ? 'rainbow' : 'blood',
          spread: 90,
        });
        spawnSplatter({ x: pos.x, y: pos.y + 30, intensity: 'heavy', size: 110 });
        spawnFloating({ value: damage, x: pos.x, y: pos.y - 30, type: 'crit' });
        break;
      }
      case 'double': {
        sfx.brutal();
        sfx.gibSplat();
        triggerShake('heavy');
        flashScreen('rgba(220,38,38,1)', 0.5);
        pulseChroma(450);
        showCrit('brutal');
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 28,
          variant: useRainbow ? 'rainbow' : 'blood',
          spread: 100,
        });
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 12,
          variant: 'bone',
          spread: 110,
        });
        spawnSplatter({ x: pos.x, y: pos.y + 30, intensity: 'heavy', size: 130 });
        spawnFloating({ value: damage, x: pos.x, y: pos.y - 30, type: 'crit' });
        break;
      }
      case 'finisher': {
        sfx.overkill();
        sfx.gibSplat();
        triggerShake('devastating');
        flashScreen('rgba(250,204,21,1)', 0.85);
        pulseChroma(900);
        showCrit('overkill');
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 60,
          variant: 'rainbow',
          spread: 180,
        });
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 35,
          variant: 'gold',
          spread: 150,
        });
        spawnBurst({
          x: pos.x,
          y: pos.y,
          count: 20,
          variant: 'bone',
          spread: 160,
        });
        spawnSplatter({ x: pos.x, y: pos.y + 30, intensity: 'heavy', size: 180 });
        spawnGibs({
          x: pos.x,
          y: pos.y,
          count: 9,
          color: '#86efac',
          size: 16,
        });
        spawnFloating({
          value: damage === 9999 ? 999 : damage,
          x: pos.x,
          y: pos.y - 40,
          type: 'crit',
        });
        break;
      }
      case 'miss': {
        // miss is only used for ENEMY-on-player near-miss; not relevant here for player-on-enemy
        sfx.hit();
        triggerShake('light');
        spawnFloating({ value: damage, x: pos.x, y: pos.y - 30, type: 'miss' });
        break;
      }
    }
  }

  function handlePlayerDamageVisuals(
    hitType: HitType,
    pos: { x: number; y: number },
    damage: number,
  ): void {
    sfx.hurt();
    setVignetteActive(true);
    setTimeout(() => setVignetteActive(false), 100);

    if (hitType === 'miss') {
      triggerShake('light');
      spawnFloating({ value: damage, x: pos.x, y: pos.y - 30, type: 'miss' });
    } else {
      triggerShake('light');
      sfx.bloodSplat();
      spawnBurst({
        x: pos.x,
        y: pos.y,
        count: 14,
        variant: 'blood',
      });
      spawnSplatter({ x: pos.x, y: pos.y + 20, intensity: 'light', size: 70 });
      spawnFloating({ value: damage, x: pos.x, y: pos.y - 30, type: 'damage' });
    }
  }

  async function handleAnswer(option: string): Promise<void> {
    if (!battle || !currentQuestion || revealed) return;
    if (battle.status !== 'fighting') return;

    sfx.select();
    setSelectedOption(option);
    setRevealed(true);

    const correct = option === currentQuestion.correctAnswer;
    const word = currentQuestion.word;
    void persistFsrsResult(word, correct);

    if (correct) {
      const newCombo = combo + 1;
      const justEnteredFever = !feverActive && newCombo >= FEVER_THRESHOLD;
      const isFeverNow = feverActive || justEnteredFever;

      setCombo(newCombo);
      sfx.comboTick(newCombo);

      if (justEnteredFever) {
        setFeverActive(true);
        sfx.feverStart();
        setTimeout(() => showCrit('fever'), 200);
      }

      const action = { type: 'CORRECT_ANSWER' } as const;
      const newBattle = applyAction(battle, action);
      const lastHit = newBattle.hits[newBattle.hits.length - 1];
      setBattle(newBattle);

      // Player attacks
      setWarriorState('attack');
      sfx.swordSwing();

      setTimeout(() => {
        const ePos = getSpritePos(enemyRef);
        setEnemyState('hit');
        if (lastHit) {
          handleHitVisuals(lastHit.type, ePos, lastHit.damage, isFeverNow);
        }
      }, 200);

      setTimeout(() => {
        setWarriorState('idle');
        if (newBattle.status === 'victory') {
          setEnemyState('defeat');
          // On non-finisher victory, still spawn modest celebration gibs
          if (lastHit && lastHit.type !== 'finisher') {
            const ePos = getSpritePos(enemyRef);
            spawnGibs({
              x: ePos.x,
              y: ePos.y,
              count: 5,
              color: '#86efac',
              size: 12,
            });
          }
        } else {
          setEnemyState('idle');
        }
      }, 700);

      setTimeout(() => {
        if (newBattle.status === 'victory') {
          sfx.victory();
        } else {
          void loadNextQuestion(topicLocked);
        }
      }, 1300);
    } else {
      // Wrong answer
      const wasInFever = feverActive;
      setCombo(0);
      if (wasInFever) {
        setFeverActive(false);
        sfx.feverEnd();
      }

      const isMiss = isNearMiss(option, currentQuestion.correctAnswer, word.confusables ?? []);
      const action = { type: 'WRONG_ANSWER', isNearMiss: isMiss } as const;
      const newBattle = applyAction(battle, action);
      const lastHit = newBattle.hits[newBattle.hits.length - 1];
      setBattle(newBattle);

      setTimeout(() => {
        const pPos = getSpritePos(warriorRef);
        setWarriorState('hit');
        if (lastHit) {
          handlePlayerDamageVisuals(lastHit.type, pPos, lastHit.damage);
        }
      }, 200);

      setTimeout(() => {
        if (newBattle.status === 'defeat') {
          setWarriorState('defeat');
          const pPos = getSpritePos(warriorRef);
          // Player gibbed: dramatic finish
          triggerShake('devastating');
          flashScreen('rgba(220,38,38,1)', 0.85);
          spawnGibs({
            x: pPos.x,
            y: pPos.y,
            count: 9,
            color: '#94a3b8',
            size: 16,
          });
          spawnSplatter({
            x: pPos.x,
            y: pPos.y + 30,
            intensity: 'heavy',
            size: 180,
          });
          spawnBurst({
            x: pPos.x,
            y: pPos.y,
            count: 40,
            variant: 'blood',
            spread: 150,
          });
        } else {
          setWarriorState('idle');
        }
      }, 700);

      setTimeout(() => {
        if (newBattle.status === 'defeat') {
          sfx.defeat();
        } else {
          void loadNextQuestion(topicLocked);
        }
      }, 1300);
    }
  }

  function handleSkip(): void {
    if (!battle || revealed) return;
    if (battle.status !== 'fighting') return;
    setBattle(applyAction(battle, { type: 'SKIP' }));
    void loadNextQuestion(topicLocked);
  }

  async function handleRetry(): Promise<void> {
    if (!battle) return;
    seenWordIds.current.clear();
    setBattle(startBattle(battle.enemy));
    setWarriorState('idle');
    setEnemyState('idle');
    setRevealed(false);
    setSelectedOption(null);
    setCombo(0);
    setFeverActive(false);
    await loadNextQuestion(topicLocked);
  }

  async function handleNextBattle(): Promise<void> {
    const sessionCount = await db.sessions.count();
    const topic: Topic =
      sessionCount % 2 === 0 ? 'job-hunting' : 'regulations';
    const enemy = getEnemyForSession(topic, sessionCount);
    setTopicLocked(topic);
    setBattle(startBattle(enemy));
    setWarriorState('idle');
    setEnemyState('idle');
    setRevealed(false);
    setSelectedOption(null);
    setCombo(0);
    setFeverActive(false);
    await loadNextQuestion(topic);
  }

  function toggleMute(): void {
    const next = !muted;
    sfx.setMuted(next);
    setMuted(next);
  }

  if (!battle) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        準備戰鬥中...
      </div>
    );
  }

  const status = battle.status;
  const isFighting = status === 'fighting' && !timeUp;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-stone-900">
      <PachinkoLights active={feverActive} intensity="crazy" />
      <FeverOverlay active={feverActive} />

      {/* Top bar (does not shake) */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <button
          onClick={onExit}
          className="text-slate-300 hover:text-white text-sm"
        >
          ← 離開
        </button>
        <div className="text-xs text-slate-400 tabular-nums">
          答題 {battle.questionsAnswered} · 命中 {battle.questionsCorrect}
          {feverActive && <span className="ml-2 text-amber-300 font-bold">FEVER!</span>}
        </div>
        <button
          onClick={toggleMute}
          className="text-slate-300 hover:text-white text-lg"
          title={muted ? '取消靜音' : '靜音'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <ComboBadge count={combo} />

      {/* Battle scene (shakes) */}
      <div className="pt-12 relative z-10">
        <BattleScene
          battle={battle}
          warriorState={warriorState}
          enemyState={enemyState}
          warriorRef={warriorRef}
          enemyRef={enemyRef}
          shakeStyle={shakeStyle}
        />
      </div>

      {/* Bottom panel (does not shake) */}
      <div className="px-4 pb-6 pt-2 max-w-2xl mx-auto w-full relative z-20">
        {isFighting && currentQuestion ? (
          <QuestionPanel
            question={currentQuestion}
            selected={selectedOption}
            revealed={revealed}
            onSelect={handleAnswer}
            onSkip={handleSkip}
          />
        ) : status === 'victory' ? (
          <ResultPanel
            kind="victory"
            battle={battle}
            onPrimary={handleNextBattle}
            onExit={onExit}
          />
        ) : status === 'defeat' ? (
          <ResultPanel
            kind="defeat"
            battle={battle}
            onPrimary={handleRetry}
            onExit={onExit}
          />
        ) : timeUp ? (
          <ResultPanel
            kind="timeup"
            battle={battle}
            onPrimary={onExit}
            onExit={onExit}
          />
        ) : null}
      </div>

      {/* Effect overlays */}
      {bursts.map((b) => (
        <Particles
          key={b.id}
          x={b.x}
          y={b.y}
          count={b.count}
          color={b.color}
          spread={b.spread}
          variant={b.variant}
          onComplete={() => setBursts((p) => p.filter((x) => x.id !== b.id))}
        />
      ))}
      {splatters.map((s) => (
        <BloodSplatter
          key={s.id}
          x={s.x}
          y={s.y}
          intensity={s.intensity}
          size={s.size}
          onComplete={() => setSplatters((p) => p.filter((x) => x.id !== s.id))}
        />
      ))}
      {gibs.map((g) => (
        <GibsExplosion
          key={g.id}
          x={g.x}
          y={g.y}
          count={g.count}
          color={g.color}
          size={g.size}
          onComplete={() => setGibs((p) => p.filter((x) => x.id !== g.id))}
        />
      ))}
      {floatingNums.map((f) => (
        <FloatingNumber
          key={f.id}
          value={f.value}
          x={f.x}
          y={f.y}
          type={f.type}
          onComplete={() => setFloatingNums((p) => p.filter((x) => x.id !== f.id))}
        />
      ))}
      {criticalText && (
        <CriticalText
          key={criticalText.id}
          variant={criticalText.variant}
          onComplete={() => setCriticalText(null)}
        />
      )}
      <Vignette active={vignetteActive} intensity={0.55} />
      <ChromaticAberration active={chromaActive} intensity={5} />
      <ScreenFlash
        triggerKey={flashKey}
        color={flashColor}
        intensity={flashIntensity}
        duration={220}
      />
    </div>
  );
}

interface QuestionPanelProps {
  question: Question;
  selected: string | null;
  revealed: boolean;
  onSelect: (opt: string) => void;
  onSkip: () => void;
}

function QuestionPanel({
  question,
  selected,
  revealed,
  onSelect,
  onSkip,
}: QuestionPanelProps) {
  function renderPrompt() {
    if (question.type === 'cloze') {
      const parts = question.prompt.split('___');
      return (
        <div className="text-xl leading-relaxed text-slate-100">
          {parts[0]}
          <span className="inline-block min-w-[64px] border-b-2 border-slate-400 mx-1 align-baseline">
            &nbsp;
          </span>
          {parts[1] ?? ''}
        </div>
      );
    }
    return (
      <div className="text-2xl text-slate-100 font-medium text-center">
        {question.prompt}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/85 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-700 p-5">
      <div className="min-h-[80px] mb-4 flex items-center justify-center">
        {renderPrompt()}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === question.correctAnswer;
          let cls =
            'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-100 active:scale-95';
          if (revealed) {
            if (isCorrect)
              cls = 'bg-emerald-500/30 border-emerald-400 text-emerald-100';
            else if (isSelected)
              cls = 'bg-rose-600/40 border-rose-400 text-rose-100';
            else cls = 'bg-slate-800 border-slate-700 text-slate-500 opacity-50';
          }
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              disabled={revealed}
              className={`px-3 py-3.5 rounded-xl border-2 text-base font-medium transition-all duration-150 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 text-center text-xs text-slate-300">
          <span className="font-bold text-slate-100">{question.word.word}</span>{' '}
          <span className="text-slate-500">{question.word.ipa}</span>
          <span> — {question.word.zh}</span>
        </div>
      )}
      {!revealed && question.type === 'cloze' && question.promptZh && (
        <p className="text-xs text-slate-500 mt-3 text-center italic">
          {question.promptZh}
        </p>
      )}
      <div className="flex justify-center mt-3">
        <button
          onClick={onSkip}
          disabled={revealed}
          className="text-slate-500 hover:text-slate-300 text-xs disabled:opacity-40"
        >
          跳過 →
        </button>
      </div>
    </div>
  );
}

interface ResultPanelProps {
  kind: 'victory' | 'defeat' | 'timeup';
  battle: BattleState;
  onPrimary: () => void;
  onExit: () => void;
}

function ResultPanel({ kind, battle, onPrimary, onExit }: ResultPanelProps) {
  const acc =
    battle.questionsAnswered > 0
      ? Math.round((battle.questionsCorrect / battle.questionsAnswered) * 100)
      : 0;

  const config = {
    victory: {
      title: '勝利！',
      sub: `擊敗 ${battle.enemy.name}`,
      primary: '挑戰下一隻 →',
      ring: 'ring-emerald-500/40',
      titleClass: 'text-emerald-400',
    },
    defeat: {
      title: '被打倒了',
      sub: `${battle.enemy.name} 太強了，但你不會失去任何進度`,
      primary: '再戰一次 ⚔️',
      ring: 'ring-rose-500/40',
      titleClass: 'text-rose-400',
    },
    timeup: {
      title: '時間到',
      sub: '今日的 5 分鐘 Sprint 完成，明天再來吧',
      primary: '回首頁',
      ring: 'ring-sky-500/40',
      titleClass: 'text-sky-400',
    },
  } as const;

  const c = config[kind];

  return (
    <div
      className={`rounded-2xl bg-slate-900/90 backdrop-blur ring-2 ${c.ring} p-6 text-center shadow-xl`}
    >
      <h2 className={`text-3xl font-bold mb-1 ${c.titleClass}`}>{c.title}</h2>
      <p className="text-sm text-slate-300 mb-4">{c.sub}</p>
      <div className="flex justify-center gap-6 mb-5 text-sm">
        <div>
          <div className="text-2xl font-bold tabular-nums text-slate-100">
            {battle.questionsCorrect}/{battle.questionsAnswered}
          </div>
          <div className="text-xs text-slate-400">正確</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-slate-100">
            {acc}%
          </div>
          <div className="text-xs text-slate-400">命中率</div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl border-2 border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          回首頁
        </button>
        <button
          onClick={onPrimary}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 shadow-md"
        >
          {c.primary}
        </button>
      </div>
    </div>
  );
}
