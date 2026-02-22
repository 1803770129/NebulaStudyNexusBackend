import { ExamTimeoutSchedulerService } from './exam-timeout-scheduler.service';

function createMockRepo() {
  return {
    createQueryBuilder: jest.fn(),
  };
}

describe('ExamTimeoutSchedulerService', () => {
  let examAttemptRepo: ReturnType<typeof createMockRepo>;
  let examService: { autoFinishTimeoutAttempt: jest.Mock };
  let service: ExamTimeoutSchedulerService;

  beforeEach(() => {
    examAttemptRepo = createMockRepo();
    examService = {
      autoFinishTimeoutAttempt: jest.fn(),
    };

    service = new ExamTimeoutSchedulerService(examAttemptRepo as any, examService as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('manualScan auto-finishes timeout attempts', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-02-21T12:00:00.000Z').getTime());

    const getMany = jest.fn().mockResolvedValue([
      {
        id: 'attempt-timeout',
        startedAt: new Date('2026-02-21T11:40:00.000Z'),
        paper: { durationMinutes: 10 },
      },
      {
        id: 'attempt-active',
        startedAt: new Date('2026-02-21T11:55:00.000Z'),
        paper: { durationMinutes: 10 },
      },
    ]);

    examAttemptRepo.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany,
    });
    examService.autoFinishTimeoutAttempt.mockResolvedValue(true);

    const result = await service.manualScan();

    expect(result.scannedCount).toBe(2);
    expect(result.timeoutCount).toBe(1);
    expect(result.autoFinishedCount).toBe(1);
    expect(examService.autoFinishTimeoutAttempt).toHaveBeenCalledWith('attempt-timeout');
  });
});
