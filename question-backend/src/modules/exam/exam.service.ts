import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';
import { Question } from '@/modules/question/entities/question.entity';
import { QuestionType } from '@/modules/question/enums/question-type.enum';
import {
  CreateExamPaperDto,
  GradeExamAttemptItemDto,
  QueryExamAttemptDto,
  QueryExamPaperDto,
  SubmitExamItemDto,
  UpdateExamPaperDto,
} from './dto';
import { ExamAttempt, ExamAttemptItem, ExamPaper, ExamPaperItem } from './entities';
import { ExamAttemptStatus, ExamPaperStatus } from './enums';

interface PaperItemCountRow {
  paperId: string;
  count: string;
}

interface AttemptScoreRow {
  objectiveScore: string;
  subjectiveScore: string;
  pendingManualCount: string;
  manualCount: string;
}

interface AttemptScoreSummary {
  objectiveScore: number;
  subjectiveScore: number;
  pendingManualCount: number;
  manualCount: number;
}

interface AttemptItemAggregateRow {
  attemptId: string;
  totalCount: string;
  answeredCount: string;
  correctCount: string;
  pendingManualCount: string;
}

interface AttemptItemAggregate {
  totalCount: number;
  answeredCount: number;
  correctCount: number;
  pendingManualCount: number;
}

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamPaper)
    private readonly examPaperRepo: Repository<ExamPaper>,
    @InjectRepository(ExamPaperItem)
    private readonly examPaperItemRepo: Repository<ExamPaperItem>,
    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepo: Repository<ExamAttempt>,
    @InjectRepository(ExamAttemptItem)
    private readonly examAttemptItemRepo: Repository<ExamAttemptItem>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async createPaper(adminUserId: string, dto: CreateExamPaperDto): Promise<any> {
    await this.ensureQuestionIdsValid(dto.items.map((item) => item.questionId));

    const paper = this.examPaperRepo.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
      durationMinutes: dto.durationMinutes,
      totalScore: this.sumItemScores(dto.items),
      status: ExamPaperStatus.DRAFT,
      publishedAt: null,
      createdById: adminUserId,
    });
    const savedPaper = await this.examPaperRepo.save(paper);

    const paperItems = dto.items.map((item, index) =>
      this.examPaperItemRepo.create({
        paperId: savedPaper.id,
        questionId: item.questionId,
        seq: index + 1,
        score: item.score,
      }),
    );
    await this.examPaperItemRepo.save(paperItems);

    return this.getPaperByIdForAdmin(savedPaper.id);
  }

  async updatePaper(paperId: string, dto: UpdateExamPaperDto): Promise<any> {
    const paper = await this.examPaperRepo.findOne({ where: { id: paperId } });
    if (!paper) {
      throw new NotFoundException('Exam paper not found');
    }
    if (paper.status === ExamPaperStatus.PUBLISHED) {
      throw new ConflictException('Published exam paper cannot be modified');
    }

    if (dto.items) {
      await this.ensureQuestionIdsValid(dto.items.map((item) => item.questionId));
      await this.examPaperItemRepo.delete({ paperId });
      const paperItems = dto.items.map((item, index) =>
        this.examPaperItemRepo.create({
          paperId,
          questionId: item.questionId,
          seq: index + 1,
          score: item.score,
        }),
      );
      await this.examPaperItemRepo.save(paperItems);
      paper.totalScore = this.sumItemScores(dto.items);
    }

    if (dto.title !== undefined) {
      paper.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      paper.description = dto.description?.trim() ?? null;
    }
    if (dto.durationMinutes !== undefined) {
      paper.durationMinutes = dto.durationMinutes;
    }

    await this.examPaperRepo.save(paper);
    return this.getPaperByIdForAdmin(paperId);
  }

  async publishPaper(paperId: string): Promise<any> {
    const paper = await this.examPaperRepo.findOne({ where: { id: paperId } });
    if (!paper) {
      throw new NotFoundException('Exam paper not found');
    }

    const itemCount = await this.examPaperItemRepo.count({ where: { paperId } });
    if (itemCount === 0) {
      throw new BadRequestException('Cannot publish empty exam paper');
    }

    if (paper.status === ExamPaperStatus.PUBLISHED) {
      return this.getPaperByIdForAdmin(paperId);
    }

    paper.status = ExamPaperStatus.PUBLISHED;
    paper.publishedAt = new Date();
    await this.examPaperRepo.save(paper);
    return this.getPaperByIdForAdmin(paperId);
  }

  async listAdminPapers(queryDto: QueryExamPaperDto): Promise<PaginationResponseDto<any>> {
    return this.queryPapers(queryDto, false);
  }

  async listStudentPapers(queryDto: QueryExamPaperDto): Promise<PaginationResponseDto<any>> {
    return this.queryPapers(queryDto, true);
  }

  async listStudentAttempts(
    studentId: string,
    queryDto: QueryExamAttemptDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, paperId, keyword } = queryDto;
    const qb = this.examAttemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.paper', 'paper')
      .where('attempt.studentId = :studentId', { studentId });

    if (status) {
      qb.andWhere('attempt.status = :status', { status });
    }
    if (paperId) {
      qb.andWhere('attempt.paperId = :paperId', { paperId });
    }
    if (keyword?.trim()) {
      qb.andWhere('paper.title ILIKE :keyword', { keyword: `%${keyword.trim()}%` });
    }

    qb.orderBy('attempt.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [data, total] = await qb.getManyAndCount();

    const aggregateMap = await this.getAttemptItemAggregateMap(data.map((attempt) => attempt.id));
    const list = data.map((attempt) =>
      this.toAttemptSummary(attempt, aggregateMap.get(attempt.id)),
    );
    return new PaginationResponseDto(list, total, page, pageSize);
  }

  async listAdminAttempts(queryDto: QueryExamAttemptDto): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, paperId, studentId, keyword } = queryDto;
    const qb = this.examAttemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.paper', 'paper')
      .leftJoinAndSelect('attempt.student', 'student');

    if (status) {
      qb.andWhere('attempt.status = :status', { status });
    }
    if (paperId) {
      qb.andWhere('attempt.paperId = :paperId', { paperId });
    }
    if (studentId) {
      qb.andWhere('attempt.studentId = :studentId', { studentId });
    }
    if (keyword?.trim()) {
      const normalized = `%${keyword.trim()}%`;
      qb.andWhere(
        '(paper.title ILIKE :keyword OR student.nickname ILIKE :keyword OR student.phone ILIKE :keyword)',
        { keyword: normalized },
      );
    }

    qb.orderBy('attempt.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [data, total] = await qb.getManyAndCount();

    const aggregateMap = await this.getAttemptItemAggregateMap(data.map((attempt) => attempt.id));
    const list = data.map((attempt) => ({
      ...this.toAttemptSummary(attempt, aggregateMap.get(attempt.id)),
      student: attempt.student
        ? {
            id: attempt.student.id,
            nickname: attempt.student.nickname,
            phone: attempt.student.phone,
            avatar: attempt.student.avatar,
            isActive: attempt.student.isActive,
          }
        : null,
    }));
    return new PaginationResponseDto(list, total, page, pageSize);
  }

  async getPaperByIdForAdmin(paperId: string): Promise<any> {
    const paper = await this.examPaperRepo
      .createQueryBuilder('paper')
      .leftJoinAndSelect('paper.items', 'item')
      .leftJoinAndSelect('item.question', 'question')
      .where('paper.id = :paperId', { paperId })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!paper) {
      throw new NotFoundException('Exam paper not found');
    }

    return this.toPaperDetail(paper);
  }

  async startExam(studentId: string, paperId: string): Promise<any> {
    const paper = await this.examPaperRepo
      .createQueryBuilder('paper')
      .leftJoinAndSelect('paper.items', 'item')
      .leftJoinAndSelect('item.question', 'question')
      .where('paper.id = :paperId', { paperId })
      .andWhere('paper.status = :status', { status: ExamPaperStatus.PUBLISHED })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!paper) {
      throw new NotFoundException('Published exam paper not found');
    }
    if (!paper.items || paper.items.length === 0) {
      throw new BadRequestException('Exam paper has no items');
    }

    const activeAttempt = await this.examAttemptRepo.findOne({
      where: {
        paperId,
        studentId,
        status: ExamAttemptStatus.ACTIVE,
      },
    });
    if (activeAttempt) {
      throw new ConflictException('An active attempt already exists for this exam paper');
    }

    const startedAt = new Date();
    const attempt = this.examAttemptRepo.create({
      paperId,
      studentId,
      status: ExamAttemptStatus.ACTIVE,
      startedAt,
      finishedAt: null,
      durationSeconds: 0,
      totalScore: null,
      objectiveScore: null,
      subjectiveScore: null,
      needsManualGrading: false,
    });
    const savedAttempt = await this.examAttemptRepo.save(attempt);

    const attemptItems = paper.items.map((paperItem) =>
      this.examAttemptItemRepo.create({
        attemptId: savedAttempt.id,
        paperItemId: paperItem.id,
        questionId: paperItem.questionId,
        seq: paperItem.seq,
        fullScore: paperItem.score,
        submittedAnswer: null,
        isCorrect: null,
        score: null,
        needsManualGrading: paperItem.question.type === QuestionType.SHORT_ANSWER,
        submittedAt: null,
        gradedAt: null,
      }),
    );
    await this.examAttemptItemRepo.save(attemptItems);

    return this.getAttemptProgress(studentId, savedAttempt.id);
  }

  async submitAttemptItem(
    studentId: string,
    attemptId: string,
    itemId: string,
    dto: SubmitExamItemDto,
  ): Promise<any> {
    const attempt = await this.examAttemptRepo.findOne({
      where: { id: attemptId, studentId },
    });
    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }
    if (attempt.status !== ExamAttemptStatus.ACTIVE) {
      throw new ConflictException('Exam attempt is not active');
    }

    const item = await this.examAttemptItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.question', 'question')
      .where('item.id = :itemId', { itemId })
      .andWhere('item.attemptId = :attemptId', { attemptId })
      .getOne();
    if (!item) {
      throw new NotFoundException('Exam attempt item not found');
    }
    if (item.submittedAt) {
      throw new ConflictException('Exam attempt item already submitted');
    }

    const judgeResult = this.judgeAnswer(item.question, dto.answer);
    item.submittedAnswer = dto.answer;
    item.submittedAt = new Date();
    if (judgeResult === null) {
      item.needsManualGrading = true;
      item.isCorrect = null;
      item.score = null;
    } else {
      item.isCorrect = judgeResult;
      item.score = judgeResult ? item.fullScore : 0;
    }
    await this.examAttemptItemRepo.save(item);

    const nextItem = await this.examAttemptItemRepo
      .createQueryBuilder('nextItem')
      .where('nextItem.attemptId = :attemptId', { attemptId })
      .andWhere('nextItem.submittedAt IS NULL')
      .orderBy('nextItem.seq', 'ASC')
      .getOne();

    return {
      attemptId,
      itemId: item.id,
      isCorrect: item.isCorrect,
      score: item.score,
      fullScore: item.fullScore,
      needsManualGrading: item.needsManualGrading,
      nextItemId: nextItem?.id ?? null,
      isCompleted: !nextItem,
    };
  }

  async finishExam(studentId: string, attemptId: string): Promise<any> {
    const attempt = await this.examAttemptRepo.findOne({
      where: { id: attemptId, studentId },
    });
    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }
    if (attempt.status !== ExamAttemptStatus.ACTIVE) {
      return this.getExamReport(studentId, attemptId);
    }

    await this.finalizeAttempt(attempt, ExamAttemptStatus.COMPLETED, new Date());

    return this.getExamReport(studentId, attemptId);
  }

  async autoFinishTimeoutAttempt(attemptId: string): Promise<boolean> {
    const attempt = await this.examAttemptRepo.findOne({
      where: { id: attemptId },
      relations: ['paper'],
    });
    if (!attempt || attempt.status !== ExamAttemptStatus.ACTIVE) {
      return false;
    }
    if (!attempt.paper) {
      return false;
    }

    const timeoutAtMs =
      new Date(attempt.startedAt).getTime() + attempt.paper.durationMinutes * 60 * 1000;
    if (timeoutAtMs > Date.now()) {
      return false;
    }

    await this.finalizeAttempt(attempt, ExamAttemptStatus.TIMEOUT, new Date());
    return true;
  }

  async gradeAttemptItem(
    attemptId: string,
    itemId: string,
    dto: GradeExamAttemptItemDto,
  ): Promise<any> {
    const attempt = await this.examAttemptRepo.findOne({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }
    if (attempt.status === ExamAttemptStatus.ACTIVE) {
      throw new ConflictException('Cannot grade an active exam attempt');
    }

    const item = await this.examAttemptItemRepo
      .createQueryBuilder('item')
      .where('item.id = :itemId', { itemId })
      .andWhere('item.attemptId = :attemptId', { attemptId })
      .getOne();
    if (!item) {
      throw new NotFoundException('Exam attempt item not found');
    }
    if (!item.needsManualGrading) {
      throw new BadRequestException('Exam attempt item does not need manual grading');
    }
    if (!item.submittedAt) {
      throw new ConflictException('Cannot grade an unsubmitted exam attempt item');
    }
    if (dto.score > item.fullScore) {
      throw new BadRequestException(`Score cannot exceed full score (${item.fullScore})`);
    }

    item.score = dto.score;
    item.isCorrect = dto.score >= item.fullScore;
    item.gradedAt = new Date();
    await this.examAttemptItemRepo.save(item);

    const updatedAttempt = await this.refreshAttemptScoreSummary(attempt);

    return {
      attemptId: updatedAttempt.id,
      itemId: item.id,
      score: item.score,
      fullScore: item.fullScore,
      isCorrect: item.isCorrect,
      gradedAt: item.gradedAt,
      attempt: {
        status: updatedAttempt.status,
        totalScore: updatedAttempt.totalScore,
        objectiveScore: updatedAttempt.objectiveScore,
        subjectiveScore: updatedAttempt.subjectiveScore,
        needsManualGrading: updatedAttempt.needsManualGrading,
      },
    };
  }

  async getAttemptByIdForAdmin(attemptId: string): Promise<any> {
    const attempt = await this.examAttemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.paper', 'paper')
      .leftJoinAndSelect('attempt.student', 'student')
      .leftJoinAndSelect('attempt.items', 'item')
      .leftJoinAndSelect('item.question', 'question')
      .where('attempt.id = :attemptId', { attemptId })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    return {
      ...this.toAttemptReportPayload(attempt),
      student: attempt.student
        ? {
            id: attempt.student.id,
            nickname: attempt.student.nickname,
            phone: attempt.student.phone,
            avatar: attempt.student.avatar,
            isActive: attempt.student.isActive,
          }
        : null,
    };
  }

  async getAttemptCurrent(studentId: string, attemptId: string): Promise<any> {
    return this.getAttemptProgress(studentId, attemptId);
  }

  async getExamReport(studentId: string, attemptId: string): Promise<any> {
    const attempt = await this.examAttemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.paper', 'paper')
      .leftJoinAndSelect('attempt.items', 'item')
      .leftJoinAndSelect('item.question', 'question')
      .where('attempt.id = :attemptId', { attemptId })
      .andWhere('attempt.studentId = :studentId', { studentId })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    return this.toAttemptReportPayload(attempt);
  }

  private async queryPapers(
    queryDto: QueryExamPaperDto,
    publishedOnly: boolean,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, keyword } = queryDto;

    const qb = this.examPaperRepo.createQueryBuilder('paper');
    if (publishedOnly) {
      qb.andWhere('paper.status = :publishedStatus', {
        publishedStatus: ExamPaperStatus.PUBLISHED,
      });
    } else if (status) {
      qb.andWhere('paper.status = :status', { status });
    }

    if (keyword?.trim()) {
      qb.andWhere('paper.title ILIKE :keyword', { keyword: `%${keyword.trim()}%` });
    }

    qb.orderBy('paper.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    const paperIds = data.map((paper) => paper.id);
    const itemCountMap = await this.getPaperItemCountMap(paperIds);

    const list = data.map((paper) => ({
      id: paper.id,
      title: paper.title,
      description: paper.description,
      durationMinutes: paper.durationMinutes,
      totalScore: paper.totalScore,
      status: paper.status,
      publishedAt: paper.publishedAt,
      createdById: paper.createdById,
      itemCount: itemCountMap.get(paper.id) ?? 0,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
    }));
    return new PaginationResponseDto(list, total, page, pageSize);
  }

  private async getPaperItemCountMap(paperIds: string[]): Promise<Map<string, number>> {
    if (paperIds.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.examPaperItemRepo
      .createQueryBuilder('item')
      .select('item.paperId', 'paperId')
      .addSelect('COUNT(*)', 'count')
      .where('item.paperId IN (:...paperIds)', { paperIds })
      .groupBy('item.paperId')
      .getRawMany<PaperItemCountRow>();

    return new Map(rows.map((row) => [row.paperId, Number(row.count)]));
  }

  private toPaperDetail(paper: ExamPaper): any {
    const sortedItems = [...(paper.items ?? [])].sort((a, b) => a.seq - b.seq);
    return {
      id: paper.id,
      title: paper.title,
      description: paper.description,
      durationMinutes: paper.durationMinutes,
      totalScore: paper.totalScore,
      status: paper.status,
      publishedAt: paper.publishedAt,
      createdById: paper.createdById,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      items: sortedItems.map((item) => ({
        id: item.id,
        seq: item.seq,
        questionId: item.questionId,
        score: item.score,
        question: item.question
          ? {
              id: item.question.id,
              title: item.question.title,
              type: item.question.type,
              difficulty: item.question.difficulty,
            }
          : null,
      })),
    };
  }

  private async getAttemptItemAggregateMap(
    attemptIds: string[],
  ): Promise<Map<string, AttemptItemAggregate>> {
    if (attemptIds.length === 0) {
      return new Map<string, AttemptItemAggregate>();
    }

    const rows = await this.examAttemptItemRepo
      .createQueryBuilder('item')
      .select('item.attemptId', 'attemptId')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect('SUM(CASE WHEN item.submittedAt IS NOT NULL THEN 1 ELSE 0 END)', 'answeredCount')
      .addSelect('SUM(CASE WHEN item.isCorrect = true THEN 1 ELSE 0 END)', 'correctCount')
      .addSelect(
        'SUM(CASE WHEN item.needsManualGrading = true AND item.score IS NULL THEN 1 ELSE 0 END)',
        'pendingManualCount',
      )
      .where('item.attemptId IN (:...attemptIds)', { attemptIds })
      .groupBy('item.attemptId')
      .getRawMany<AttemptItemAggregateRow>();

    return new Map(
      rows.map((row) => [
        row.attemptId,
        {
          totalCount: Number(row.totalCount ?? 0),
          answeredCount: Number(row.answeredCount ?? 0),
          correctCount: Number(row.correctCount ?? 0),
          pendingManualCount: Number(row.pendingManualCount ?? 0),
        },
      ]),
    );
  }

  private toAttemptSummary(attempt: ExamAttempt, aggregate?: AttemptItemAggregate): any {
    const summary = aggregate ?? {
      totalCount: 0,
      answeredCount: 0,
      correctCount: 0,
      pendingManualCount: 0,
    };

    return {
      id: attempt.id,
      paperId: attempt.paperId,
      studentId: attempt.studentId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
      durationSeconds: attempt.durationSeconds,
      totalScore: attempt.totalScore,
      objectiveScore: attempt.objectiveScore,
      subjectiveScore: attempt.subjectiveScore,
      needsManualGrading: attempt.needsManualGrading,
      totalCount: summary.totalCount,
      answeredCount: summary.answeredCount,
      correctCount: summary.correctCount,
      pendingManualCount: summary.pendingManualCount,
      paper: attempt.paper
        ? {
            id: attempt.paper.id,
            title: attempt.paper.title,
            durationMinutes: attempt.paper.durationMinutes,
            totalScore: attempt.paper.totalScore,
            status: attempt.paper.status,
          }
        : null,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    };
  }

  private toAttemptReportPayload(attempt: ExamAttempt): any {
    const items = attempt.items ?? [];
    const totalCount = items.length;
    const answeredCount = items.filter((item) => item.submittedAt).length;
    const correctCount = items.filter((item) => item.isCorrect === true).length;
    const pendingManualCount = items.filter(
      (item) => item.needsManualGrading && item.score === null,
    ).length;
    const objectiveScore = items.reduce(
      (sum, item) => sum + (item.needsManualGrading ? 0 : (item.score ?? 0)),
      0,
    );
    const subjectiveScoreRaw = items.reduce(
      (sum, item) => sum + (item.needsManualGrading ? (item.score ?? 0) : 0),
      0,
    );
    const hasManualItems = items.some((item) => item.needsManualGrading);
    const subjectiveScore = hasManualItems && pendingManualCount === 0 ? subjectiveScoreRaw : null;
    const totalScore = objectiveScore + subjectiveScoreRaw;

    return {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
        durationSeconds: attempt.durationSeconds,
        totalScore: attempt.totalScore ?? totalScore,
        objectiveScore: attempt.objectiveScore ?? objectiveScore,
        subjectiveScore: attempt.subjectiveScore ?? subjectiveScore,
        needsManualGrading: pendingManualCount > 0,
      },
      paper: attempt.paper
        ? {
            id: attempt.paper.id,
            title: attempt.paper.title,
            durationMinutes: attempt.paper.durationMinutes,
            totalScore: attempt.paper.totalScore,
          }
        : null,
      stats: {
        totalCount,
        answeredCount,
        correctCount,
        pendingManualCount,
      },
      items: items.map((item) => ({
        id: item.id,
        seq: item.seq,
        questionId: item.questionId,
        fullScore: item.fullScore,
        score: item.score,
        isCorrect: item.isCorrect,
        needsManualGrading: item.needsManualGrading,
        submittedAt: item.submittedAt,
        submittedAnswer: item.submittedAnswer,
        question: item.question ? this.sanitizeQuestion(item.question) : null,
      })),
    };
  }

  private async getAttemptProgress(studentId: string, attemptId: string): Promise<any> {
    const attempt = await this.examAttemptRepo.findOne({
      where: { id: attemptId, studentId },
      relations: ['paper'],
    });
    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    const [totalCount, answeredCount] = await Promise.all([
      this.examAttemptItemRepo.count({ where: { attemptId } }),
      this.examAttemptItemRepo
        .createQueryBuilder('item')
        .where('item.attemptId = :attemptId', { attemptId })
        .andWhere('item.submittedAt IS NOT NULL')
        .getCount(),
    ]);

    const currentItem = await this.examAttemptItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.question', 'question')
      .where('item.attemptId = :attemptId', { attemptId })
      .andWhere('item.submittedAt IS NULL')
      .orderBy('item.seq', 'ASC')
      .getOne();

    return {
      attempt: {
        id: attempt.id,
        paperId: attempt.paperId,
        status: attempt.status,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
        totalCount,
        answeredCount,
      },
      completed: !currentItem,
      currentItem: currentItem
        ? {
            id: currentItem.id,
            seq: currentItem.seq,
            fullScore: currentItem.fullScore,
            question: currentItem.question ? this.sanitizeQuestion(currentItem.question) : null,
          }
        : null,
    };
  }

  private async ensureQuestionIdsValid(questionIds: string[]): Promise<void> {
    if (questionIds.length === 0) {
      throw new BadRequestException('Exam paper items cannot be empty');
    }

    const uniqueIds = Array.from(new Set(questionIds));
    if (uniqueIds.length !== questionIds.length) {
      throw new BadRequestException('Duplicate question IDs found in exam paper items');
    }

    const total = await this.questionRepo.count({
      where: { id: In(uniqueIds) },
    });
    if (total !== uniqueIds.length) {
      throw new BadRequestException('Some question IDs do not exist');
    }
  }

  private sumItemScores(
    items: Array<{
      score: number;
    }>,
  ): number {
    return items.reduce((sum, item) => sum + item.score, 0);
  }

  private sanitizeQuestion(question: Question): any {
    const { answer, explanation, creator, creatorId, ...safe } = question as any;

    if (safe.options) {
      safe.options = safe.options.map(({ isCorrect, ...opt }: any) => opt);
    }

    if (safe.content?.rendered) {
      safe.content = { rendered: safe.content.rendered };
    }

    return safe;
  }

  private judgeAnswer(question: Question, submitted: any): boolean | null {
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        return submitted === question.answer;
      case QuestionType.MULTIPLE_CHOICE: {
        if (!Array.isArray(submitted) || !Array.isArray(question.answer)) {
          return false;
        }
        const correct = [...(question.answer as string[])].sort();
        const student = [...submitted].sort();
        return JSON.stringify(correct) === JSON.stringify(student);
      }
      case QuestionType.TRUE_FALSE:
        return submitted === question.answer;
      case QuestionType.FILL_BLANK: {
        if (!Array.isArray(submitted) || !Array.isArray(question.answer)) {
          return false;
        }
        return (question.answer as string[]).every(
          (answer, index) =>
            answer.trim().toLowerCase() === submitted[index]?.toString()?.trim()?.toLowerCase(),
        );
      }
      case QuestionType.SHORT_ANSWER:
        return null;
      default:
        return false;
    }
  }

  private async calculateAttemptScore(attemptId: string): Promise<AttemptScoreSummary> {
    const scoreRaw = await this.examAttemptItemRepo
      .createQueryBuilder('item')
      .select(
        'COALESCE(SUM(CASE WHEN item.needsManualGrading = false THEN COALESCE(item.score, 0) ELSE 0 END), 0)',
        'objectiveScore',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN item.needsManualGrading = true THEN COALESCE(item.score, 0) ELSE 0 END), 0)',
        'subjectiveScore',
      )
      .addSelect(
        'SUM(CASE WHEN item.needsManualGrading = true AND item.score IS NULL THEN 1 ELSE 0 END)',
        'pendingManualCount',
      )
      .addSelect('SUM(CASE WHEN item.needsManualGrading = true THEN 1 ELSE 0 END)', 'manualCount')
      .where('item.attemptId = :attemptId', { attemptId })
      .getRawOne<AttemptScoreRow>();

    return {
      objectiveScore: Number(scoreRaw?.objectiveScore ?? 0),
      subjectiveScore: Number(scoreRaw?.subjectiveScore ?? 0),
      pendingManualCount: Number(scoreRaw?.pendingManualCount ?? 0),
      manualCount: Number(scoreRaw?.manualCount ?? 0),
    };
  }

  private async refreshAttemptScoreSummary(attempt: ExamAttempt): Promise<ExamAttempt> {
    const scoreSummary = await this.calculateAttemptScore(attempt.id);
    attempt.objectiveScore = scoreSummary.objectiveScore;
    attempt.totalScore = scoreSummary.objectiveScore + scoreSummary.subjectiveScore;
    attempt.subjectiveScore =
      scoreSummary.manualCount > 0 && scoreSummary.pendingManualCount === 0
        ? scoreSummary.subjectiveScore
        : null;
    attempt.needsManualGrading = scoreSummary.pendingManualCount > 0;
    return this.examAttemptRepo.save(attempt);
  }

  private async finalizeAttempt(
    attempt: ExamAttempt,
    status: ExamAttemptStatus.COMPLETED | ExamAttemptStatus.TIMEOUT,
    finishedAt: Date,
  ): Promise<void> {
    attempt.status = status;
    attempt.finishedAt = finishedAt;
    attempt.durationSeconds = Math.max(
      0,
      Math.floor((finishedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000),
    );
    await this.refreshAttemptScoreSummary(attempt);
  }
}
