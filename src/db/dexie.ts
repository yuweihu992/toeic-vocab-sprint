import Dexie, { type Table } from 'dexie';
import { createEmptyCard, type Card } from 'ts-fsrs';

export interface ProgressRecord {
  wordId: string;
  card: Card;
  reviewCount: number;
  correctCount: number;
  lastReviewed: number;
  nextDue: number;
  createdAt: number;
}

export interface SessionRecord {
  id?: number;
  startedAt: number;
  endedAt: number;
  wordsReviewed: number;
  correctCount: number;
}

class VocabDB extends Dexie {
  progress!: Table<ProgressRecord, string>;
  sessions!: Table<SessionRecord, number>;

  constructor() {
    super('toeic-vocab');
    this.version(1).stores({
      progress: 'wordId, nextDue, lastReviewed',
      sessions: '++id, startedAt',
    });
  }
}

export const db = new VocabDB();

export async function getOrCreateProgress(wordId: string): Promise<ProgressRecord> {
  const existing = await db.progress.get(wordId);
  if (existing) return existing;

  const now = Date.now();
  const newRecord: ProgressRecord = {
    wordId,
    card: createEmptyCard(new Date()),
    reviewCount: 0,
    correctCount: 0,
    lastReviewed: 0,
    nextDue: now,
    createdAt: now,
  };
  await db.progress.put(newRecord);
  return newRecord;
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  await db.progress.put(record);
}

export async function getDueWordIds(limit = 7): Promise<string[]> {
  const now = Date.now();
  const due = await db.progress.where('nextDue').belowOrEqual(now).toArray();
  due.sort((a, b) => a.nextDue - b.nextDue);
  return due.slice(0, limit).map((r) => r.wordId);
}
