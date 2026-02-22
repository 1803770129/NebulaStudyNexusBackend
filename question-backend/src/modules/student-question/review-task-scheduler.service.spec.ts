import { ReviewTaskSchedulerService } from './review-task-scheduler.service';
import { ReviewDailyTaskStatus } from './enums';

function createMockRepo() {
  return {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };
}

describe('ReviewTaskSchedulerService', () => {
  let wrongBookRepo: ReturnType<typeof createMockRepo>;
  let reviewDailyTaskRepo: ReturnType<typeof createMockRepo>;
  let service: ReviewTaskSchedulerService;

  beforeEach(() => {
    wrongBookRepo = createMockRepo();
    reviewDailyTaskRepo = createMockRepo();

    service = new ReviewTaskSchedulerService(wrongBookRepo as any, reviewDailyTaskRepo as any);
  });

  it('returns summary counts for a run date', async () => {
    reviewDailyTaskRepo.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);

    const summary = await service.getSummary('2026-02-21');

    expect(summary).toEqual({
      runDate: '2026-02-21',
      total: 5,
      pending: 3,
      done: 2,
    });
    expect(reviewDailyTaskRepo.count).toHaveBeenNthCalledWith(1, {
      where: { runDate: '2026-02-21' },
    });
    expect(reviewDailyTaskRepo.count).toHaveBeenNthCalledWith(2, {
      where: { runDate: '2026-02-21', status: ReviewDailyTaskStatus.PENDING },
    });
    expect(reviewDailyTaskRepo.count).toHaveBeenNthCalledWith(3, {
      where: { runDate: '2026-02-21', status: ReviewDailyTaskStatus.DONE },
    });
  });

  it('generates daily tasks by replacing same-day records', async () => {
    const getMany = jest.fn().mockResolvedValue([
      {
        id: 'wb-1',
        studentId: 'student-1',
        questionId: 'question-1',
        nextReviewAt: new Date('2026-02-20T12:00:00.000Z'),
      },
      {
        id: 'wb-2',
        studentId: 'student-2',
        questionId: 'question-2',
        nextReviewAt: null,
      },
    ]);

    wrongBookRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany,
    });

    const deleteMock = jest.fn();
    const createMock = jest.fn((input) => input);
    const saveMock = jest.fn();

    reviewDailyTaskRepo.manager.transaction.mockImplementation(async (callback) =>
      callback({
        getRepository: jest.fn().mockReturnValue({
          delete: deleteMock,
          create: createMock,
          save: saveMock,
        }),
      }),
    );

    const result = await service.manualGenerate('2026-02-21');

    expect(result.runDate).toBe('2026-02-21');
    expect(result.generatedCount).toBe(2);
    expect(deleteMock).toHaveBeenCalledWith({ runDate: '2026-02-21' });
    expect(createMock).toHaveBeenCalledTimes(2);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('uses run-date end-of-day boundary when querying due wrong books', async () => {
    const andWhere = jest.fn().mockReturnThis();
    wrongBookRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere,
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });

    reviewDailyTaskRepo.manager.transaction.mockImplementation(async (callback) =>
      callback({
        getRepository: jest.fn().mockReturnValue({
          delete: jest.fn(),
          create: jest.fn((input) => input),
          save: jest.fn(),
        }),
      }),
    );

    await service.manualGenerate('2026-02-21');

    const dueCall = andWhere.mock.calls.find((call) =>
      String(call[0]).includes('wrongBook.nextReviewAt <= :endOfDay'),
    );
    expect(dueCall).toBeDefined();
    expect(dueCall[1].endOfDay.toISOString()).toBe('2026-02-21T23:59:59.999Z');
  });

  it('retries generation and succeeds on a later attempt', async () => {
    wrongBookRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });

    reviewDailyTaskRepo.manager.transaction
      .mockImplementationOnce(async () => {
        throw new Error('temporary db error');
      })
      .mockImplementation(async (callback) =>
        callback({
          getRepository: jest.fn().mockReturnValue({
            delete: jest.fn(),
            create: jest.fn((input) => input),
            save: jest.fn(),
          }),
        }),
      );

    const result = await service.manualGenerate('2026-02-21');

    expect(result.generatedCount).toBe(0);
    expect(result.attempts).toBe(2);
    expect(reviewDailyTaskRepo.manager.transaction).toHaveBeenCalledTimes(2);
  });
});
