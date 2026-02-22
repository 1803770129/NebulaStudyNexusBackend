import { QuestionType } from '@/modules/question/enums/question-type.enum';
import { ExamService } from './exam.service';
import { ExamAttemptStatus } from './enums';

function createMockRepo() {
  return {
    create: jest.fn((input) => input),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    countBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('ExamService submitAttemptItem', () => {
  let examPaperRepo: ReturnType<typeof createMockRepo>;
  let examPaperItemRepo: ReturnType<typeof createMockRepo>;
  let examAttemptRepo: ReturnType<typeof createMockRepo>;
  let examAttemptItemRepo: ReturnType<typeof createMockRepo>;
  let questionRepo: ReturnType<typeof createMockRepo>;
  let service: ExamService;

  beforeEach(() => {
    examPaperRepo = createMockRepo();
    examPaperItemRepo = createMockRepo();
    examAttemptRepo = createMockRepo();
    examAttemptItemRepo = createMockRepo();
    questionRepo = createMockRepo();

    service = new ExamService(
      examPaperRepo as any,
      examPaperItemRepo as any,
      examAttemptRepo as any,
      examAttemptItemRepo as any,
      questionRepo as any,
    );
  });

  it('auto grades objective questions and returns full score when correct', async () => {
    examAttemptRepo.findOne.mockResolvedValue({
      id: 'attempt-1',
      studentId: 'student-1',
      status: ExamAttemptStatus.ACTIVE,
    });

    const item = {
      id: 'item-1',
      attemptId: 'attempt-1',
      questionId: 'question-1',
      fullScore: 5,
      needsManualGrading: false,
      submittedAt: null,
      score: null,
      isCorrect: null,
      question: {
        type: QuestionType.SINGLE_CHOICE,
        answer: 'A',
      },
    };

    const targetItemQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(item),
    };
    const nextItemQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    examAttemptItemRepo.createQueryBuilder
      .mockImplementationOnce(() => targetItemQb)
      .mockImplementationOnce(() => nextItemQb);
    examAttemptItemRepo.save.mockImplementation(async (value) => value);

    const response = await service.submitAttemptItem('student-1', 'attempt-1', 'item-1', {
      answer: 'A',
      duration: 8,
    });

    expect(response).toMatchObject({
      attemptId: 'attempt-1',
      itemId: 'item-1',
      isCorrect: true,
      score: 5,
      fullScore: 5,
      needsManualGrading: false,
      nextItemId: null,
      isCompleted: true,
    });
  });

  it('keeps short-answer items pending manual grading', async () => {
    examAttemptRepo.findOne.mockResolvedValue({
      id: 'attempt-2',
      studentId: 'student-1',
      status: ExamAttemptStatus.ACTIVE,
    });

    const item = {
      id: 'item-2',
      attemptId: 'attempt-2',
      questionId: 'question-2',
      fullScore: 10,
      needsManualGrading: false,
      submittedAt: null,
      score: null,
      isCorrect: null,
      question: {
        type: QuestionType.SHORT_ANSWER,
        answer: 'manual',
      },
    };

    const targetItemQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(item),
    };
    const nextItemQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    examAttemptItemRepo.createQueryBuilder
      .mockImplementationOnce(() => targetItemQb)
      .mockImplementationOnce(() => nextItemQb);
    examAttemptItemRepo.save.mockImplementation(async (value) => value);

    const response = await service.submitAttemptItem('student-1', 'attempt-2', 'item-2', {
      answer: 'free text',
    });

    expect(response).toMatchObject({
      attemptId: 'attempt-2',
      itemId: 'item-2',
      isCorrect: null,
      score: null,
      fullScore: 10,
      needsManualGrading: true,
      nextItemId: null,
      isCompleted: true,
    });
  });

  it('grades subjective items and refreshes attempt score summary', async () => {
    examAttemptRepo.findOne.mockResolvedValue({
      id: 'attempt-3',
      status: ExamAttemptStatus.COMPLETED,
      objectiveScore: 25,
      subjectiveScore: null,
      totalScore: 25,
      needsManualGrading: true,
    });

    const item = {
      id: 'item-3',
      attemptId: 'attempt-3',
      fullScore: 10,
      needsManualGrading: true,
      submittedAt: new Date('2026-02-21T10:00:00.000Z'),
      score: null,
      isCorrect: null,
      gradedAt: null,
    };

    const itemQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(item),
    };
    const scoreQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        objectiveScore: '30',
        subjectiveScore: '8',
        pendingManualCount: '0',
        manualCount: '1',
      }),
    };
    examAttemptItemRepo.createQueryBuilder
      .mockImplementationOnce(() => itemQb)
      .mockImplementationOnce(() => scoreQb);
    examAttemptItemRepo.save.mockImplementation(async (value) => value);
    examAttemptRepo.save.mockImplementation(async (value) => value);

    const response = await service.gradeAttemptItem('attempt-3', 'item-3', { score: 8 });

    expect(response).toMatchObject({
      attemptId: 'attempt-3',
      itemId: 'item-3',
      score: 8,
      fullScore: 10,
      isCorrect: false,
      attempt: {
        status: ExamAttemptStatus.COMPLETED,
        totalScore: 38,
        objectiveScore: 30,
        subjectiveScore: 8,
        needsManualGrading: false,
      },
    });
  });

  it('rejects grading when attempt is still active', async () => {
    examAttemptRepo.findOne.mockResolvedValue({
      id: 'attempt-4',
      status: ExamAttemptStatus.ACTIVE,
    });

    await expect(
      service.gradeAttemptItem('attempt-4', 'item-4', {
        score: 5,
      }),
    ).rejects.toThrow('Cannot grade an active exam attempt');
  });
});
