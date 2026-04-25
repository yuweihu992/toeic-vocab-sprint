import vocabulary from '../../data/vocabulary.json';
import type { VocabularyData, Word } from '../types/vocabulary';

const data = vocabulary as VocabularyData;

export function getAllWords(): Word[] {
  return data.words;
}

export function getWordById(id: string): Word | undefined {
  return data.words.find((w) => w.id === id);
}

export function getTopics() {
  return data.topics;
}

export function getStats() {
  return {
    total: data.words.length,
    byTopic: data.topics.map((t) => ({
      ...t,
      count: data.words.filter((w) => w.topic === t.id).length,
    })),
    byDifficulty: [1, 2, 3, 4, 5].map((d) => ({
      level: d,
      count: data.words.filter((w) => w.difficulty === d).length,
    })),
    spellingErrors: data.words.filter((w) => w.source?.userWroteAs).length,
  };
}
