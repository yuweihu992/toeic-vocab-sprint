export interface Example {
  en: string;
  answer: string;
  zh: string;
}

export interface WordSource {
  pdf?: string;
  page?: number;
  userWroteAs?: string;
}

export interface Word {
  id: string;
  word: string;
  pos: string;
  ipa: string;
  zh: string;
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  examples: Example[];
  confusables?: string[];
  source?: WordSource;
  doodle?: string;
}

export interface Topic {
  id: string;
  name: string;
  source?: string;
}

export interface NeedsReviewEntry {
  context: string;
  userWroteAs: string;
  note: string;
}

export interface VocabularyData {
  version: number;
  lastUpdated: string;
  topics: Topic[];
  words: Word[];
  needsReview?: NeedsReviewEntry[];
}
