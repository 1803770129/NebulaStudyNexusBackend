import { ManualGradingService } from './manual-grading.service';
import { ManualGradingTaskStatus } from './enums';
import type { ManualGradingTask } from './entities/manual-grading-task.entity';
import type { PracticeRecord } from './entities/practice-record.entity';

function createMockRepo() {
  return {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };
}

describe('ManualGradingService', () => {
  let taskRepo: ReturnType<typeof createMockRepo>;
  let practiceRecordRepo: ReturnType<typeof createMockRepo>;
  let service: ManualGradingService;

  beforeEach(() => {
    taskRepo = createMockRepo();
    practiceRecordRepo = createMockRepo();
    service = new ManualGradingService(taskRepo as any, practiceRecordRepo as any);
  });

  it('returns existing task when practice record already has grading task', async () => {
    const record = { id: 'record-1' } as PracticeRecord;
    const existingTask = { id: 'task-1' } as ManualGradingTask;

    taskRepo.findOne.mockResolvedValue({ id: 'task-1' });
    taskRepo.findOneOrFail.mockResolvedValue(existingTask);

    const result = await service.createTaskFromPracticeRecord(record);

    expect(taskRepo.create).not.toHaveBeenCalled();
    expect(taskRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual(existingTask);
  });

  it('creates a pending task when practice record has no grading task', async () => {
    const record = {
      id: 'record-2',
      studentId: 'student-1',
      questionId: 'question-1',
    } as PracticeRecord;

    taskRepo.findOne.mockResolvedValue(null);
    taskRepo.create.mockImplementation((input) => input);
    taskRepo.save.mockImplementation(async (input) => ({ id: 'task-2', ...input }));

    const result = await service.createTaskFromPracticeRecord(record);

    expect(taskRepo.create).toHaveBeenCalledTimes(1);
    expect(taskRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        practiceRecordId: 'record-2',
        studentId: 'student-1',
        questionId: 'question-1',
        status: ManualGradingTaskStatus.PENDING,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'task-2',
        practiceRecordId: 'record-2',
      }),
    );
  });

  it('submits grading result and writes back to practice record', async () => {
    const task = {
      id: 'task-submit',
      practiceRecordId: 'record-submit',
      status: ManualGradingTaskStatus.ASSIGNED,
      assigneeId: 'grader-1',
      assignedAt: new Date('2026-02-21T10:00:00.000Z'),
      score: null,
      feedback: null,
      tags: null,
      isPassed: null,
      submittedAt: null,
    } as ManualGradingTask;

    const record = {
      id: 'record-submit',
      isCorrect: null,
      score: null,
      gradingFeedback: null,
      gradingTags: null,
      isPassed: null,
      gradedBy: null,
      gradedAt: null,
    } as PracticeRecord;

    const saveTask = jest.fn();
    const saveRecord = jest.fn();
    const mockManager = {
      getRepository: jest.fn((entity) => {
        if (entity.name === 'ManualGradingTask') {
          return { save: saveTask };
        }
        return { save: saveRecord };
      }),
    };

    taskRepo.findOne.mockResolvedValue(task);
    practiceRecordRepo.findOne.mockResolvedValue(record);
    taskRepo.manager.transaction.mockImplementation(async (callback) => callback(mockManager));
    jest
      .spyOn(service, 'findById')
      .mockResolvedValue({ id: 'task-submit', status: ManualGradingTaskStatus.DONE });

    const result = await service.submitTask('task-submit', 'grader-1', {
      score: 88,
      isPassed: true,
      feedback: '答案完整，逻辑清晰',
      tags: ['结构完整'],
    });

    expect(task.status).toBe(ManualGradingTaskStatus.DONE);
    expect(task.score).toBe(88);
    expect(task.isPassed).toBe(true);
    expect(record.score).toBe(88);
    expect(record.isCorrect).toBe(true);
    expect(record.gradedBy).toBe('grader-1');
    expect(saveTask).toHaveBeenCalledTimes(1);
    expect(saveRecord).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'task-submit', status: ManualGradingTaskStatus.DONE });
  });
});
