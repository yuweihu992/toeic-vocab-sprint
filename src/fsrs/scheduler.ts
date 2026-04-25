import { fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';

const params = generatorParameters({
  enable_fuzz: true,
  request_retention: 0.9,
});
const scheduler = fsrs(params);

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

const ratingMap: Record<ReviewRating, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
};

export function reviewCard(card: Card, rating: ReviewRating): Card {
  const now = new Date();
  const result = scheduler.next(card, now, ratingMap[rating]);
  return result.card;
}
