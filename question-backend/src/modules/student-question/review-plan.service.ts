import { Injectable } from '@nestjs/common';

interface ReviewScheduleResult {
  reviewLevel: number;
  nextReviewAt: Date;
}

const LEVEL_MAX = 3;
const REVIEW_INTERVAL_DAYS_BY_LEVEL: Record<number, number> = {
  0: 1,
  1: 3,
  2: 7,
  3: 15,
};

@Injectable()
export class ReviewPlanService {
  getIntervalDays(level: number): number {
    const normalized = this.normalizeLevel(level);
    return REVIEW_INTERVAL_DAYS_BY_LEVEL[normalized];
  }

  planAfterWrongAnswer(now: Date = new Date()): ReviewScheduleResult {
    const reviewLevel = 0;
    return {
      reviewLevel,
      nextReviewAt: this.addDays(now, this.getIntervalDays(reviewLevel)),
    };
  }

  planAfterReview(
    currentLevel: number,
    isCorrect: boolean,
    now: Date = new Date(),
  ): ReviewScheduleResult {
    const normalized = this.normalizeLevel(currentLevel);
    const nextLevel = isCorrect ? Math.min(normalized + 1, LEVEL_MAX) : Math.max(normalized - 1, 0);

    return {
      reviewLevel: nextLevel,
      nextReviewAt: this.addDays(now, this.getIntervalDays(nextLevel)),
    };
  }

  shouldAutoMaster(reviewLevel: number): boolean {
    return this.normalizeLevel(reviewLevel) >= LEVEL_MAX;
  }

  private normalizeLevel(level: number): number {
    if (!Number.isFinite(level)) {
      return 0;
    }
    if (level < 0) {
      return 0;
    }
    if (level > LEVEL_MAX) {
      return LEVEL_MAX;
    }
    return Math.floor(level);
  }

  private addDays(base: Date, days: number): Date {
    const result = new Date(base);
    result.setDate(result.getDate() + days);
    return result;
  }
}
