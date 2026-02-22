import { ReviewPlanService } from './review-plan.service';

describe('ReviewPlanService', () => {
  let service: ReviewPlanService;

  beforeEach(() => {
    service = new ReviewPlanService();
  });

  it('returns expected interval days for each normalized level', () => {
    expect(service.getIntervalDays(-1)).toBe(1);
    expect(service.getIntervalDays(0)).toBe(1);
    expect(service.getIntervalDays(1)).toBe(3);
    expect(service.getIntervalDays(2)).toBe(7);
    expect(service.getIntervalDays(3)).toBe(15);
    expect(service.getIntervalDays(99)).toBe(15);
  });

  it('resets to level 0 after wrong answer and schedules next day', () => {
    const now = new Date('2026-02-01T00:00:00.000Z');
    const plan = service.planAfterWrongAnswer(now);

    expect(plan.reviewLevel).toBe(0);
    expect(plan.nextReviewAt.toISOString()).toBe('2026-02-02T00:00:00.000Z');
  });

  it('upgrades level after correct review and caps at max level', () => {
    const now = new Date('2026-02-01T00:00:00.000Z');

    const upgraded = service.planAfterReview(0, true, now);
    expect(upgraded.reviewLevel).toBe(1);
    expect(upgraded.nextReviewAt.toISOString()).toBe('2026-02-04T00:00:00.000Z');

    const capped = service.planAfterReview(3, true, now);
    expect(capped.reviewLevel).toBe(3);
    expect(capped.nextReviewAt.toISOString()).toBe('2026-02-16T00:00:00.000Z');
  });

  it('downgrades level after wrong review and never goes below 0', () => {
    const now = new Date('2026-02-01T00:00:00.000Z');

    const downgraded = service.planAfterReview(2, false, now);
    expect(downgraded.reviewLevel).toBe(1);
    expect(downgraded.nextReviewAt.toISOString()).toBe('2026-02-04T00:00:00.000Z');

    const floored = service.planAfterReview(0, false, now);
    expect(floored.reviewLevel).toBe(0);
    expect(floored.nextReviewAt.toISOString()).toBe('2026-02-02T00:00:00.000Z');
  });

  it('marks level 3 as auto-mastered', () => {
    expect(service.shouldAutoMaster(0)).toBe(false);
    expect(service.shouldAutoMaster(2)).toBe(false);
    expect(service.shouldAutoMaster(3)).toBe(true);
    expect(service.shouldAutoMaster(10)).toBe(true);
  });
});
