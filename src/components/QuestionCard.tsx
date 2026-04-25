import { useState, useEffect } from 'react';
import type { Question } from '../practice/generator';

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
  onSkip: () => void;
}

const REVEAL_DELAY_MS = 1100;

export function QuestionCard({ question, onAnswer, onSkip }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question]);

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const correct = option === question.correctAnswer;
    setTimeout(() => onAnswer(correct), REVEAL_DELAY_MS);
  }

  function renderPrompt() {
    if (question.type === 'cloze') {
      const parts = question.prompt.split('___');
      return (
        <div className="text-2xl leading-relaxed text-slate-800 text-left">
          {parts[0]}
          <span className="inline-block min-w-[80px] border-b-2 border-slate-400 mx-1 align-baseline">
            &nbsp;
          </span>
          {parts[1] ?? ''}
        </div>
      );
    }
    return (
      <div className="text-3xl text-slate-800 font-medium text-center">
        {question.prompt}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6 min-h-[160px] flex items-center justify-center">
        {renderPrompt()}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === question.correctAnswer;
          let bg = 'bg-white hover:bg-slate-50 border-slate-200 active:scale-95';
          if (revealed) {
            if (isCorrect) bg = 'bg-emerald-100 border-emerald-400';
            else if (isSelected) bg = 'bg-rose-100 border-rose-400';
            else bg = 'bg-white border-slate-200 opacity-40';
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
              className={`px-4 py-4 rounded-xl border-2 text-lg text-slate-800 transition-all duration-200 ${bg}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-4 text-center text-sm text-slate-600">
          <span className="font-medium">{question.word.word}</span>{' '}
          <span className="text-slate-400">{question.word.ipa}</span>{' '}
          — {question.word.zh}
        </div>
      )}

      {!revealed && question.type === 'cloze' && question.promptZh && (
        <p className="text-sm text-slate-400 mt-4 text-center italic">
          {question.promptZh}
        </p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={onSkip}
          disabled={revealed}
          className="text-slate-400 hover:text-slate-600 text-sm disabled:opacity-40"
        >
          跳過 →
        </button>
      </div>
    </div>
  );
}
