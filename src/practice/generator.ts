import type { Word } from '../types/vocabulary';
import { getAllWords } from '../data/loadVocab';

export type QuestionType = 'cloze' | 'zh-to-en';

export interface Question {
  type: QuestionType;
  word: Word;
  prompt: string;
  promptZh?: string;
  options: string[];
  correctAnswer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function buildOptions(correctAnswer: string, word: Word): string[] {
  const distractors = pickN(
    (word.confusables ?? []).filter((c) => c !== correctAnswer),
    3,
  );
  if (distractors.length < 3) {
    const all = getAllWords();
    while (distractors.length < 3) {
      const pick = all[Math.floor(Math.random() * all.length)];
      if (pick.word !== correctAnswer && !distractors.includes(pick.word)) {
        distractors.push(pick.word);
      }
    }
  }
  return shuffle([correctAnswer, ...distractors]);
}

export function generateQuestion(word: Word, type?: QuestionType): Question {
  const chosenType = type ?? (Math.random() < 0.5 ? 'cloze' : 'zh-to-en');

  if (chosenType === 'cloze') {
    const example = word.examples[0];
    return {
      type: 'cloze',
      word,
      prompt: example.en,
      promptZh: example.zh,
      options: buildOptions(example.answer, word),
      correctAnswer: example.answer,
    };
  }

  return {
    type: 'zh-to-en',
    word,
    prompt: word.zh,
    options: buildOptions(word.word, word),
    correctAnswer: word.word,
  };
}

export function generateSprintQuestions(words: Word[]): Question[] {
  return shuffle(words.map((w) => generateQuestion(w)));
}
