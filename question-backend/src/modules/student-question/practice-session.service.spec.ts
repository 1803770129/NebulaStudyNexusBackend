import { PracticeSessionService } from './practice-session.service';
import { PracticeSessionMode, PracticeSessionStatus } from './enums';
import type { PracticeSession } from './entities/practice-session.entity';
import { NotFoundException } from '@nestjs/common';

function createMockRepo() {
  return {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
}

function createSession(overrides?: Partial<PracticeSession>): PracticeSession {
  const base: PracticeSession = {
    id: 'session-1',
    student: null as any,
    studentId: 'student-1',
    mode: PracticeSessionMode.RANDOM,
    config: {},
    status: PracticeSessionStatus.COMPLETED,
    totalCount: 10,
    answeredCount: 8,
    correctCount: 6,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    endedAt: new Date('2026-01-01T00:10:00.000Z'),
    items: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:10:00.000Z'),
  };

  return { ...base, ...(overrides ?? {}) };
}

describe('PracticeSessionService summary metrics', () => {
  let service: PracticeSessionService;

  beforeEach(() => {
    const questionRepo = createMockRepo();
    const wrongBookRepo = createMockRepo();
    const reviewDailyTaskRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const sessionItemRepo = createMockRepo();
    const practiceRecordRepo = createMockRepo();
    const studentQuestionService = {
      submitAnswer: jest.fn(),
      findById: jest.fn(),
    };

    service = new PracticeSessionService(
      questionRepo as any,
      wrongBookRepo as any,
      reviewDailyTaskRepo as any,
      sessionRepo as any,
      sessionItemRepo as any,
      practiceRecordRepo as any,
      studentQuestionService as any,
    );
  });

  it('uses endedAt-startedAt as fallback totalDuration when no practice records', async () => {
    const session = createSession({
      id: 'session-fallback',
      startedAt: new Date('2026-01-01T08:00:00.000Z'),
      endedAt: new Date('2026-01-01T08:03:20.000Z'),
    });

    jest.spyOn(service as any, 'querySessionDurations').mockResolvedValue([]);
    jest.spyOn(service as any, 'querySessionKnowledgePointStats').mockResolvedValue([]);

    const metricsMap = await (service as any).buildSessionMetricsMap([session]);
    const metrics = metricsMap.get('session-fallback');

    expect(metrics).toBeDefined();
    expect(metrics.totalDuration).toBe(200);
    expect(metrics.weakKnowledgePoints).toEqual([]);
  });

  it('uses aggregated record duration and returns sorted weak knowledge points', async () => {
    const session = createSession({
      id: 'session-agg',
      startedAt: new Date('2026-01-01T09:00:00.000Z'),
      endedAt: new Date('2026-01-01T09:01:00.000Z'),
    });

    jest
      .spyOn(service as any, 'querySessionDurations')
      .mockResolvedValue([{ sessionId: 'session-agg', totalDuration: '450' }]);

    jest.spyOn(service as any, 'querySessionKnowledgePointStats').mockResolvedValue([
      {
        sessionId: 'session-agg',
        knowledgePointId: 'kp-1',
        knowledgePointName: '函数',
        total: '10',
        correct: '2',
      },
      {
        sessionId: 'session-agg',
        knowledgePointId: 'kp-2',
        knowledgePointName: '数组',
        total: '8',
        correct: '4',
      },
      {
        sessionId: 'session-agg',
        knowledgePointId: 'kp-3',
        knowledgePointName: '对象',
        total: '5',
        correct: '5',
      },
    ]);

    const metricsMap = await (service as any).buildSessionMetricsMap([session]);
    const metrics = metricsMap.get('session-agg');

    expect(metrics).toBeDefined();
    expect(metrics.totalDuration).toBe(450);
    expect(metrics.weakKnowledgePoints).toHaveLength(2);
    expect(metrics.weakKnowledgePoints[0]).toMatchObject({
      id: 'kp-1',
      total: 10,
      correct: 2,
      correctRate: 0.2,
    });
    expect(metrics.weakKnowledgePoints[1]).toMatchObject({
      id: 'kp-2',
      total: 8,
      correct: 4,
      correctRate: 0.5,
    });
  });

  it('embeds totalDuration and weakKnowledgePoints in session summary output', () => {
    const session = createSession({
      id: 'session-summary',
      answeredCount: 4,
      correctCount: 3,
    });

    const summary = (service as any).toSessionSummary(session, {
      totalDuration: 123,
      weakKnowledgePoints: [
        {
          id: 'kp-summary',
          name: '集合',
          total: 4,
          correct: 1,
          correctRate: 0.25,
        },
      ],
    });

    expect(summary.id).toBe('session-summary');
    expect(summary.correctRate).toBe(0.75);
    expect(summary.totalDuration).toBe(123);
    expect(summary.weakKnowledgePoints).toHaveLength(1);
    expect(summary.weakKnowledgePoints[0].id).toBe('kp-summary');
  });

  it('finds review session item by itemId and delegates to submitItem', async () => {
    const getOne = jest.fn().mockResolvedValue({
      id: 'review-item-1',
      sessionId: 'review-session-1',
    });
    const reviewItemQb = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne,
    };
    (service as any).sessionItemRepo.createQueryBuilder.mockReturnValue(reviewItemQb);

    const submitResult = {
      session: { id: 'review-session-1' },
      isCompleted: false,
      nextItemId: 'next-item-2',
      result: { isCorrect: true },
    };
    const submitSpy = jest
      .spyOn(service, 'submitItem')
      .mockResolvedValue(submitResult as unknown as any);

    const payload = { answer: 'A', duration: 12 } as any;
    const response = await service.submitReviewItem('student-1', 'review-item-1', payload);

    expect(submitSpy).toHaveBeenCalledWith(
      'student-1',
      'review-session-1',
      'review-item-1',
      payload,
    );
    expect(response).toBe(submitResult);
  });

  it('throws not found when review item does not belong to student review session', async () => {
    const getOne = jest.fn().mockResolvedValue(null);
    const reviewItemQb = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne,
    };
    (service as any).sessionItemRepo.createQueryBuilder.mockReturnValue(reviewItemQb);

    await expect(
      service.submitReviewItem('student-1', 'review-item-x', { answer: 'A' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
