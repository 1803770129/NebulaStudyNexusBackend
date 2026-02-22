import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { WrongBook } from './entities/wrong-book.entity';
import { ReviewDailyTask } from './entities/review-daily-task.entity';
import { PracticeSession } from './entities/practice-session.entity';
import { PracticeSessionItem } from './entities/practice-session-item.entity';
import { PracticeRecord } from './entities/practice-record.entity';
import { StudentQuestionService, SubmitAnswerContext } from './student-question.service';
import {
  PracticeAttemptType,
  PracticeSessionItemSourceType,
  PracticeSessionItemStatus,
  PracticeSessionMode,
  PracticeSessionStatus,
  ReviewDailyTaskStatus,
} from './enums';
import {
  CreatePracticeSessionDto,
  QueryAdminPracticeSessionDto,
  QueryPracticeSessionDto,
  SubmitPracticeSessionItemDto,
} from './dto';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';

interface SessionQuestionCandidate {
  questionId: string;
  sourceType: PracticeSessionItemSourceType;
  sourceRefId: string | null;
}

interface SessionWeakKnowledgePoint {
  id: string;
  name: string;
  total: number;
  correct: number;
  correctRate: number;
}

interface SessionSummaryMetrics {
  totalDuration: number;
  weakKnowledgePoints: SessionWeakKnowledgePoint[];
}

interface SessionDurationRow {
  sessionId: string | null;
  totalDuration: string;
}

interface SessionKnowledgePointStatRow {
  sessionId: string | null;
  knowledgePointId: string;
  knowledgePointName: string;
  total: string;
  correct: string;
}

const WEAK_KNOWLEDGE_POINT_LIMIT = 5;

@Injectable()
export class PracticeSessionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(WrongBook)
    private readonly wrongBookRepo: Repository<WrongBook>,
    @InjectRepository(ReviewDailyTask)
    private readonly reviewDailyTaskRepo: Repository<ReviewDailyTask>,
    @InjectRepository(PracticeSession)
    private readonly sessionRepo: Repository<PracticeSession>,
    @InjectRepository(PracticeSessionItem)
    private readonly sessionItemRepo: Repository<PracticeSessionItem>,
    @InjectRepository(PracticeRecord)
    private readonly practiceRecordRepo: Repository<PracticeRecord>,
    private readonly studentQuestionService: StudentQuestionService,
  ) {}

  async createSession(studentId: string, dto: CreatePracticeSessionDto): Promise<any> {
    this.validateSessionCreatePayload(dto);

    const candidates = await this.selectQuestionCandidates(studentId, dto);
    if (candidates.length === 0) {
      throw new NotFoundException('Resource not found');
    }

    const now = new Date();
    const session = this.sessionRepo.create({
      studentId,
      mode: dto.mode,
      config: {
        questionCount: dto.questionCount ?? 10,
        categoryId: dto.categoryId ?? null,
        knowledgePointIds: dto.knowledgePointIds ?? [],
        type: dto.type ?? null,
        difficulty: dto.difficulty ?? null,
        tagIds: dto.tagIds ?? [],
      },
      status: PracticeSessionStatus.ACTIVE,
      totalCount: candidates.length,
      answeredCount: 0,
      correctCount: 0,
      startedAt: now,
      endedAt: null,
    });
    const savedSession = await this.sessionRepo.save(session);

    const sessionItems = candidates.map((candidate, index) =>
      this.sessionItemRepo.create({
        sessionId: savedSession.id,
        questionId: candidate.questionId,
        seq: index + 1,
        sourceType: candidate.sourceType,
        sourceRefId: candidate.sourceRefId,
        status: PracticeSessionItemStatus.PENDING,
        answeredAt: null,
      }),
    );
    await this.sessionItemRepo.save(sessionItems);

    return this.findById(studentId, savedSession.id);
  }

  async findAll(
    studentId: string,
    queryDto: QueryPracticeSessionDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, mode } = queryDto;
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .where('session.studentId = :studentId', { studentId });

    if (status) {
      qb.andWhere('session.status = :status', { status });
    }

    if (mode) {
      qb.andWhere('session.mode = :mode', { mode });
    }

    qb.orderBy('session.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    const metricsMap = await this.buildSessionMetricsMap(data);
    const sessionList = data.map((session) =>
      this.toSessionSummary(session, metricsMap.get(session.id)),
    );
    return new PaginationResponseDto(sessionList, total, page, pageSize);
  }

  async findAllForAdmin(
    queryDto: QueryAdminPracticeSessionDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, mode, studentId, keyword } = queryDto;
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.student', 'student');

    if (status) {
      qb.andWhere('session.status = :status', { status });
    }

    if (mode) {
      qb.andWhere('session.mode = :mode', { mode });
    }

    if (studentId) {
      qb.andWhere('session.studentId = :studentId', { studentId });
    }

    if (keyword?.trim()) {
      const normalized = `%${keyword.trim()}%`;
      qb.andWhere('(student.nickname ILIKE :keyword OR student.phone ILIKE :keyword)', {
        keyword: normalized,
      });
    }

    qb.orderBy('session.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    const metricsMap = await this.buildSessionMetricsMap(data);
    const sessionList = data.map((session) => ({
      ...this.toSessionSummary(session, metricsMap.get(session.id)),
      student: session.student
        ? {
            id: session.student.id,
            nickname: session.student.nickname,
            phone: session.student.phone,
            avatar: session.student.avatar,
            isActive: session.student.isActive,
          }
        : null,
    }));

    return new PaginationResponseDto(sessionList, total, page, pageSize);
  }

  async findById(studentId: string, sessionId: string): Promise<any> {
    const session = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.items', 'item')
      .where('session.id = :sessionId', { sessionId })
      .andWhere('session.studentId = :studentId', { studentId })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!session) {
      throw new NotFoundException('Resource not found');
    }

    return this.toSessionDetailWithMetrics(session);
  }

  async findByIdForAdmin(sessionId: string): Promise<any> {
    const session = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.items', 'item')
      .leftJoinAndSelect('session.student', 'student')
      .where('session.id = :sessionId', { sessionId })
      .orderBy('item.seq', 'ASC')
      .getOne();

    if (!session) {
      throw new NotFoundException('Resource not found');
    }

    const detail = await this.toSessionDetailWithMetrics(session);

    return {
      ...detail,
      student: session.student
        ? {
            id: session.student.id,
            nickname: session.student.nickname,
            phone: session.student.phone,
            avatar: session.student.avatar,
            isActive: session.student.isActive,
          }
        : null,
    };
  }

  async getAdminStats(): Promise<any> {
    const statsRaw = await this.sessionRepo
      .createQueryBuilder('session')
      .select('COUNT(*)', 'totalSessions')
      .addSelect("SUM(CASE WHEN session.status = 'active' THEN 1 ELSE 0 END)", 'activeSessions')
      .addSelect(
        "SUM(CASE WHEN session.status = 'completed' THEN 1 ELSE 0 END)",
        'completedSessions',
      )
      .addSelect(
        "SUM(CASE WHEN session.status = 'abandoned' THEN 1 ELSE 0 END)",
        'abandonedSessions',
      )
      .addSelect('COALESCE(SUM(session.correctCount), 0)', 'totalCorrectCount')
      .addSelect('COALESCE(SUM(session.answeredCount), 0)', 'totalAnsweredCount')
      .addSelect(
        'SUM(CASE WHEN DATE(session.createdAt) = CURRENT_DATE THEN 1 ELSE 0 END)',
        'todayCreatedSessions',
      )
      .getRawOne<{
        totalSessions: string;
        activeSessions: string;
        completedSessions: string;
        abandonedSessions: string;
        totalCorrectCount: string;
        totalAnsweredCount: string;
        todayCreatedSessions: string;
      }>();

    const modeRows = await this.sessionRepo
      .createQueryBuilder('session')
      .select('session.mode', 'mode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.mode')
      .orderBy('count', 'DESC')
      .getRawMany<{ mode: string; count: string }>();

    const totalAnsweredCount = Number(statsRaw?.totalAnsweredCount ?? 0);
    const totalCorrectCount = Number(statsRaw?.totalCorrectCount ?? 0);
    const avgCorrectRate =
      totalAnsweredCount > 0 ? Number((totalCorrectCount / totalAnsweredCount).toFixed(4)) : 0;

    return {
      totalSessions: Number(statsRaw?.totalSessions ?? 0),
      activeSessions: Number(statsRaw?.activeSessions ?? 0),
      completedSessions: Number(statsRaw?.completedSessions ?? 0),
      abandonedSessions: Number(statsRaw?.abandonedSessions ?? 0),
      todayCreatedSessions: Number(statsRaw?.todayCreatedSessions ?? 0),
      avgCorrectRate,
      byMode: modeRows.map((row) => ({
        mode: row.mode,
        count: Number(row.count),
      })),
    };
  }

  async getCurrentItem(studentId: string, sessionId: string): Promise<any> {
    const session = await this.findOwnedSession(studentId, sessionId);
    const nextItem = await this.sessionItemRepo.findOne({
      where: { sessionId: session.id, status: PracticeSessionItemStatus.PENDING },
      order: { seq: 'ASC' },
    });

    if (!nextItem) {
      if (session.status === PracticeSessionStatus.ACTIVE) {
        session.status = PracticeSessionStatus.COMPLETED;
        session.endedAt = new Date();
        await this.sessionRepo.save(session);
      }

      return {
        session: await this.toSessionSummaryWithMetrics(session),
        completed: true,
        item: null,
      };
    }

    const question = await this.studentQuestionService.findById(nextItem.questionId);
    return {
      session: await this.toSessionSummaryWithMetrics(session),
      completed: false,
      item: {
        id: nextItem.id,
        seq: nextItem.seq,
        status: nextItem.status,
        sourceType: nextItem.sourceType,
        sourceRefId: nextItem.sourceRefId,
        question,
      },
    };
  }

  async submitItem(
    studentId: string,
    sessionId: string,
    itemId: string,
    dto: SubmitPracticeSessionItemDto,
  ): Promise<any> {
    const session = await this.findOwnedSession(studentId, sessionId);
    if (session.status !== PracticeSessionStatus.ACTIVE) {
      throw new ConflictException('褰撳墠浼氳瘽宸茬粨鏉燂紝鏃犳硶缁х画鎻愪氦');
    }

    const item = await this.sessionItemRepo.findOne({
      where: { id: itemId, sessionId: session.id },
    });
    if (!item) {
      throw new NotFoundException('Resource not found');
    }
    if (item.status === PracticeSessionItemStatus.ANSWERED) {
      throw new ConflictException('璇ラ宸叉彁浜わ紝璇峰嬁閲嶅鎻愪氦');
    }

    const context: SubmitAnswerContext = {
      sessionId: session.id,
      sessionItemId: item.id,
      attemptType:
        session.mode === PracticeSessionMode.REVIEW
          ? PracticeAttemptType.REVIEW
          : PracticeAttemptType.PRACTICE,
    };
    const result = await this.studentQuestionService.submitAnswer(
      studentId,
      item.questionId,
      dto,
      context,
    );

    item.status = PracticeSessionItemStatus.ANSWERED;
    item.answeredAt = new Date();
    session.answeredCount += 1;
    if (result.isCorrect === true) {
      session.correctCount += 1;
    }
    if (session.answeredCount >= session.totalCount) {
      session.status = PracticeSessionStatus.COMPLETED;
      session.endedAt = new Date();
    }

    await Promise.all([this.sessionItemRepo.save(item), this.sessionRepo.save(session)]);

    const nextItem = await this.sessionItemRepo.findOne({
      where: { sessionId: session.id, status: PracticeSessionItemStatus.PENDING },
      order: { seq: 'ASC' },
    });

    return {
      session: await this.toSessionSummaryWithMetrics(session),
      isCompleted: session.status === PracticeSessionStatus.COMPLETED,
      nextItemId: nextItem?.id ?? null,
      result,
    };
  }

  async submitReviewItem(
    studentId: string,
    itemId: string,
    dto: SubmitPracticeSessionItemDto,
  ): Promise<any> {
    const item = await this.sessionItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.session', 'session')
      .where('item.id = :itemId', { itemId })
      .andWhere('session.studentId = :studentId', { studentId })
      .andWhere('session.mode = :mode', { mode: PracticeSessionMode.REVIEW })
      .select(['item.id', 'item.sessionId'])
      .getOne();

    if (!item) {
      throw new NotFoundException('Resource not found');
    }

    return this.submitItem(studentId, item.sessionId, item.id, dto);
  }

  async completeSession(studentId: string, sessionId: string): Promise<any> {
    const session = await this.findOwnedSession(studentId, sessionId);
    if (session.status === PracticeSessionStatus.COMPLETED) {
      return this.toSessionSummaryWithMetrics(session);
    }

    session.status = PracticeSessionStatus.COMPLETED;
    session.endedAt = session.endedAt ?? new Date();
    await this.sessionRepo.save(session);
    return this.toSessionSummaryWithMetrics(session);
  }

  private validateSessionCreatePayload(dto: CreatePracticeSessionDto): void {
    if (dto.mode === PracticeSessionMode.CATEGORY && !dto.categoryId) {
      throw new BadRequestException('鍒嗙被缁冩ā寮忓繀椤讳紶 categoryId');
    }

    if (
      dto.mode === PracticeSessionMode.KNOWLEDGE &&
      (!dto.knowledgePointIds || dto.knowledgePointIds.length === 0)
    ) {
      throw new BadRequestException('鐭ヨ瘑鐐圭粌妯″紡蹇呴』浼?knowledgePointIds');
    }
  }

  private async selectQuestionCandidates(
    studentId: string,
    dto: CreatePracticeSessionDto,
  ): Promise<SessionQuestionCandidate[]> {
    if (dto.mode === PracticeSessionMode.REVIEW) {
      return this.selectReviewCandidates(studentId, dto.questionCount ?? 10);
    }

    const questionCount = dto.questionCount ?? 10;
    const qb = this.questionRepo.createQueryBuilder('question').select(['question.id']);

    if (dto.mode === PracticeSessionMode.CATEGORY && dto.categoryId) {
      qb.andWhere('question.categoryId = :categoryId', { categoryId: dto.categoryId });
    }

    if (dto.type) {
      qb.andWhere('question.type = :type', { type: dto.type });
    }

    if (dto.difficulty) {
      qb.andWhere('question.difficulty = :difficulty', { difficulty: dto.difficulty });
    }

    if (dto.tagIds?.length) {
      qb.andWhere((subQueryBuilder) => {
        const subQuery = subQueryBuilder
          .subQuery()
          .select('qt.questionId')
          .from('question_tags', 'qt')
          .where('qt.tagId IN (:...tagIds)')
          .getQuery();
        return `question.id IN ${subQuery}`;
      }).setParameter('tagIds', dto.tagIds);
    }

    if (dto.knowledgePointIds?.length) {
      qb.innerJoin('question.knowledgePoints', 'kp').andWhere('kp.id IN (:...knowledgePointIds)', {
        knowledgePointIds: dto.knowledgePointIds,
      });
    }

    qb.orderBy('RANDOM()').take(questionCount);
    const questions = await qb.getMany();

    return questions.map((question) => ({
      questionId: question.id,
      sourceType: PracticeSessionItemSourceType.NORMAL,
      sourceRefId: null,
    }));
  }

  private async selectReviewCandidates(
    studentId: string,
    questionCount: number,
  ): Promise<SessionQuestionCandidate[]> {
    const runDate = this.getRunDateKey(new Date());
    const dailyTasks = await this.reviewDailyTaskRepo
      .createQueryBuilder('task')
      .where('task.studentId = :studentId', { studentId })
      .andWhere('task.runDate = :runDate', { runDate })
      .andWhere('task.status = :status', { status: ReviewDailyTaskStatus.PENDING })
      .orderBy('task.dueAt', 'ASC', 'NULLS FIRST')
      .take(questionCount)
      .getMany();

    if (dailyTasks.length > 0) {
      return dailyTasks.map((task) => ({
        questionId: task.questionId,
        sourceType: PracticeSessionItemSourceType.REVIEW,
        sourceRefId: task.wrongBookId,
      }));
    }

    const now = new Date();
    const wrongBooks = await this.wrongBookRepo
      .createQueryBuilder('wrongBook')
      .where('wrongBook.studentId = :studentId', { studentId })
      .andWhere('wrongBook.isMastered = :isMastered', { isMastered: false })
      .andWhere('(wrongBook.nextReviewAt IS NULL OR wrongBook.nextReviewAt <= :now)', { now })
      .orderBy('wrongBook.nextReviewAt', 'ASC', 'NULLS FIRST')
      .addOrderBy('wrongBook.lastWrongAt', 'DESC')
      .take(questionCount)
      .getMany();

    return wrongBooks.map((item) => ({
      questionId: item.questionId,
      sourceType: PracticeSessionItemSourceType.REVIEW,
      sourceRefId: item.id,
    }));
  }

  private getRunDateKey(now: Date): string {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const date = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  private async findOwnedSession(studentId: string, sessionId: string): Promise<PracticeSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, studentId },
    });
    if (!session) {
      throw new NotFoundException('Resource not found');
    }
    return session;
  }

  private async toSessionSummaryWithMetrics(session: PracticeSession): Promise<any> {
    const metricsMap = await this.buildSessionMetricsMap([session]);
    return this.toSessionSummary(session, metricsMap.get(session.id));
  }

  private async toSessionDetailWithMetrics(session: PracticeSession): Promise<any> {
    const metricsMap = await this.buildSessionMetricsMap([session]);
    return this.toSessionDetail(session, metricsMap.get(session.id));
  }

  private async buildSessionMetricsMap(
    sessions: PracticeSession[],
  ): Promise<Map<string, SessionSummaryMetrics>> {
    const metricsMap = new Map<string, SessionSummaryMetrics>();
    if (sessions.length === 0) {
      return metricsMap;
    }

    const sessionIds = sessions.map((session) => session.id);
    for (const session of sessions) {
      metricsMap.set(session.id, {
        totalDuration: this.getFallbackTotalDuration(session),
        weakKnowledgePoints: [],
      });
    }

    const [durationRows, knowledgePointRows] = await Promise.all([
      this.querySessionDurations(sessionIds),
      this.querySessionKnowledgePointStats(sessionIds),
    ]);

    for (const row of durationRows) {
      if (!row.sessionId) {
        continue;
      }

      const metrics = metricsMap.get(row.sessionId);
      if (!metrics) {
        continue;
      }

      const totalDuration = Number(row.totalDuration ?? 0);
      if (Number.isFinite(totalDuration) && totalDuration > 0) {
        metrics.totalDuration = Math.round(totalDuration);
      }
    }

    const groupedWeakPoints = new Map<string, SessionWeakKnowledgePoint[]>();
    for (const row of knowledgePointRows) {
      if (!row.sessionId) {
        continue;
      }

      const total = Number(row.total ?? 0);
      if (!Number.isFinite(total) || total <= 0) {
        continue;
      }

      const correct = Number(row.correct ?? 0);
      const weakItem: SessionWeakKnowledgePoint = {
        id: row.knowledgePointId,
        name: row.knowledgePointName,
        total,
        correct,
        correctRate: Number((correct / total).toFixed(4)),
      };

      if (!groupedWeakPoints.has(row.sessionId)) {
        groupedWeakPoints.set(row.sessionId, []);
      }
      groupedWeakPoints.get(row.sessionId)!.push(weakItem);
    }

    for (const [sessionId, weakItems] of groupedWeakPoints.entries()) {
      const metrics = metricsMap.get(sessionId);
      if (!metrics) {
        continue;
      }

      metrics.weakKnowledgePoints = weakItems
        .filter((item) => item.correctRate < 1)
        .sort((a, b) => {
          if (a.correctRate !== b.correctRate) {
            return a.correctRate - b.correctRate;
          }
          if (a.total !== b.total) {
            return b.total - a.total;
          }
          return a.name.localeCompare(b.name);
        })
        .slice(0, WEAK_KNOWLEDGE_POINT_LIMIT);
    }

    return metricsMap;
  }

  private async querySessionDurations(sessionIds: string[]): Promise<SessionDurationRow[]> {
    if (sessionIds.length === 0) {
      return [];
    }

    return this.practiceRecordRepo
      .createQueryBuilder('record')
      .select('record.sessionId', 'sessionId')
      .addSelect('COALESCE(SUM(record.duration), 0)', 'totalDuration')
      .where('record.sessionId IN (:...sessionIds)', { sessionIds })
      .groupBy('record.sessionId')
      .getRawMany<SessionDurationRow>();
  }

  private async querySessionKnowledgePointStats(
    sessionIds: string[],
  ): Promise<SessionKnowledgePointStatRow[]> {
    if (sessionIds.length === 0) {
      return [];
    }

    return this.practiceRecordRepo
      .createQueryBuilder('record')
      .select('record.sessionId', 'sessionId')
      .addSelect('kp.id', 'knowledgePointId')
      .addSelect('kp.name', 'knowledgePointName')
      .addSelect('COUNT(record.id)', 'total')
      .addSelect('SUM(CASE WHEN record.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
      .innerJoin('question_knowledge_points', 'qkp', 'qkp."questionId" = record."questionId"')
      .innerJoin('knowledge_points', 'kp', 'kp.id = qkp."knowledgePointId"')
      .where('record.sessionId IN (:...sessionIds)', { sessionIds })
      .groupBy('record.sessionId')
      .addGroupBy('kp.id')
      .addGroupBy('kp.name')
      .getRawMany<SessionKnowledgePointStatRow>();
  }

  private getFallbackTotalDuration(session: PracticeSession): number {
    if (!session.startedAt || !session.endedAt) {
      return 0;
    }

    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.endedAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return 0;
    }

    return Math.round((end - start) / 1000);
  }

  private toSessionSummary(session: PracticeSession, metrics?: SessionSummaryMetrics): any {
    const correctRate =
      session.answeredCount > 0 ? session.correctCount / session.answeredCount : 0;
    const summaryMetrics = metrics ?? {
      totalDuration: this.getFallbackTotalDuration(session),
      weakKnowledgePoints: [],
    };

    return {
      id: session.id,
      studentId: session.studentId,
      mode: session.mode,
      status: session.status,
      config: session.config,
      totalCount: session.totalCount,
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      correctRate: Number(correctRate.toFixed(4)),
      totalDuration: summaryMetrics.totalDuration,
      weakKnowledgePoints: summaryMetrics.weakKnowledgePoints,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private toSessionDetail(session: PracticeSession, metrics?: SessionSummaryMetrics): any {
    const nextPendingItem = (session.items ?? []).find(
      (item) => item.status === PracticeSessionItemStatus.PENDING,
    );

    return {
      ...this.toSessionSummary(session, metrics),
      nextPendingSeq: nextPendingItem?.seq ?? null,
      items: (session.items ?? []).map((item) => ({
        id: item.id,
        questionId: item.questionId,
        seq: item.seq,
        sourceType: item.sourceType,
        sourceRefId: item.sourceRefId,
        status: item.status,
        answeredAt: item.answeredAt,
      })),
    };
  }
}
