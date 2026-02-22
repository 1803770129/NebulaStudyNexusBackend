/**
 * 学生端题目服务
 *
 * 核心业务逻辑：题目查询（答案隐藏）、提交答案、自动判题、
 * 收藏管理、错题本管理、做题记录查询
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { QuestionType } from '@/modules/question/enums/question-type.enum';
import { PracticeRecord } from './entities/practice-record.entity';
import { Favorite } from './entities/favorite.entity';
import { WrongBook } from './entities/wrong-book.entity';
import { ReviewDailyTask } from './entities/review-daily-task.entity';
import {
  StudentQueryQuestionDto,
  SubmitAnswerDto,
  QueryPracticeRecordDto,
  QueryFavoriteDto,
  QueryWrongBookDto,
  QueryTodayReviewDto,
  QueryReviewHistoryDto,
} from './dto';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';
import { PracticeAttemptType, ReviewDailyTaskStatus } from './enums';
import { ManualGradingService } from './manual-grading.service';
import { ReviewPlanService } from './review-plan.service';

export interface SubmitAnswerContext {
  sessionId?: string;
  sessionItemId?: string;
  attemptType?: PracticeAttemptType;
}

@Injectable()
export class StudentQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(PracticeRecord)
    private readonly practiceRecordRepo: Repository<PracticeRecord>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(WrongBook)
    private readonly wrongBookRepo: Repository<WrongBook>,
    @InjectRepository(ReviewDailyTask)
    private readonly reviewDailyTaskRepo: Repository<ReviewDailyTask>,
    private readonly manualGradingService: ManualGradingService,
    private readonly reviewPlanService: ReviewPlanService,
  ) {}

  // ─── 题目查询 ──────────────────────────────────────────────

  /**
   * 题目列表（分页，不含答案/解析）
   */
  async findAll(queryDto: StudentQueryQuestionDto): Promise<PaginationResponseDto<any>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryId,
      type,
      difficulty,
      tagIds,
      knowledgePointIds,
    } = queryDto;

    const qb = this.questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.knowledgePoints', 'knowledgePoints');

    if (keyword) {
      qb.andWhere("(question.title ILIKE :keyword OR question.content->>'raw' ILIKE :keyword)", {
        keyword: `%${keyword}%`,
      });
    }

    if (categoryId) {
      qb.andWhere('question.categoryId = :categoryId', { categoryId });
    }

    if (type) {
      qb.andWhere('question.type = :type', { type });
    }

    if (difficulty) {
      qb.andWhere('question.difficulty = :difficulty', { difficulty });
    }

    if (tagIds && tagIds.length > 0) {
      qb.andWhere((sub) => {
        const subQuery = sub
          .subQuery()
          .select('qt.questionId')
          .from('question_tags', 'qt')
          .where('qt.tagId IN (:...tagIds)')
          .getQuery();
        return `question.id IN ${subQuery}`;
      }).setParameter('tagIds', tagIds);
    }

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      qb.innerJoin('question.knowledgePoints', 'kp').andWhere('kp.id IN (:...knowledgePointIds)', {
        knowledgePointIds,
      });
    }

    qb.orderBy('question.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    // 隐藏答案/解析/creator
    const sanitized = data.map((q) => this.sanitizeQuestion(q));

    return new PaginationResponseDto(sanitized, total, page, pageSize);
  }

  /**
   * 题目详情（不含答案/解析）
   */
  async findById(questionId: string): Promise<any> {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
      relations: ['category', 'tags', 'knowledgePoints'],
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return this.sanitizeQuestion(question);
  }

  // ─── 提交答案 ──────────────────────────────────────────────

  /**
   * 提交答案 → 自动判题 → 写入做题记录 → 答错写入错题本
   */
  async submitAnswer(
    studentId: string,
    questionId: string,
    dto: SubmitAnswerDto,
    context?: SubmitAnswerContext,
  ) {
    // 1. 查询题目（含答案）
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    // 2. 自动判题
    const isCorrect = this.judgeAnswer(question, dto.answer);

    // 3. 写入做题记录
    const record = this.practiceRecordRepo.create({
      studentId,
      questionId,
      sessionId: context?.sessionId ?? null,
      sessionItemId: context?.sessionItemId ?? null,
      attemptType: context?.attemptType ?? PracticeAttemptType.PRACTICE,
      submittedAnswer: dto.answer,
      isCorrect,
      duration: dto.duration ?? 0,
      score: null,
      gradingFeedback: null,
      gradingTags: null,
      isPassed: null,
      gradedBy: null,
      gradedAt: null,
    });
    const savedRecord = await this.practiceRecordRepo.save(record);

    let manualGradingTaskId: string | null = null;
    if (question.type === QuestionType.SHORT_ANSWER) {
      const task = await this.manualGradingService.createTaskFromPracticeRecord(savedRecord);
      manualGradingTaskId = task.id;
    }

    // 4. 答错 → 写入或更新错题本
    if (context?.attemptType === PracticeAttemptType.REVIEW && isCorrect !== null) {
      await this.applyReviewResult(studentId, questionId, dto.answer, isCorrect);
    } else if (isCorrect === false) {
      await this.upsertWrongBook(studentId, questionId, dto.answer);
    }

    // 5. 返回结果
    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
      options: question.options ?? undefined,
      practiceRecordId: savedRecord.id,
      manualGradingTaskId,
      isManualGradingPending: question.type === QuestionType.SHORT_ANSWER,
    };
  }

  // ─── 收藏 ─────────────────────────────────────────────────

  /**
   * 收藏 toggle（已收藏则取消收藏，未收藏则添加）
   */
  async toggleFavorite(studentId: string, questionId: string): Promise<{ isFavorited: boolean }> {
    // 验证题目存在
    const questionExists = await this.questionRepo.count({ where: { id: questionId } });
    if (!questionExists) {
      throw new NotFoundException('题目不存在');
    }

    const existing = await this.favoriteRepo.findOne({
      where: { studentId, questionId },
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { isFavorited: false };
    }

    await this.favoriteRepo.save({ studentId, questionId });
    return { isFavorited: true };
  }

  /**
   * 收藏列表（分页）
   */
  async getFavorites(
    studentId: string,
    queryDto: QueryFavoriteDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, keyword } = queryDto;

    const qb = this.favoriteRepo
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .where('favorite.studentId = :studentId', { studentId });

    if (keyword) {
      qb.andWhere('question.title ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    qb.orderBy('favorite.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    // 对收藏中的题目也隐藏答案
    const sanitized = data.map((fav) => ({
      ...fav,
      question: fav.question ? this.sanitizeQuestion(fav.question) : null,
    }));

    return new PaginationResponseDto(sanitized, total, page, pageSize);
  }

  // ─── 错题本 ────────────────────────────────────────────────

  /**
   * 错题列表（分页）
   */
  async getWrongBook(
    studentId: string,
    queryDto: QueryWrongBookDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, isMastered } = queryDto;

    const qb = this.wrongBookRepo
      .createQueryBuilder('wrongBook')
      .leftJoinAndSelect('wrongBook.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .where('wrongBook.studentId = :studentId', { studentId });

    if (isMastered !== undefined) {
      qb.andWhere('wrongBook.isMastered = :isMastered', { isMastered });
    }

    qb.orderBy('wrongBook.lastWrongAt', 'DESC');

    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    // 错题列表中的题目也隐藏答案
    const sanitized = data.map((wb) => ({
      ...wb,
      question: wb.question ? this.sanitizeQuestion(wb.question) : null,
    }));

    return new PaginationResponseDto(sanitized, total, page, pageSize);
  }

  /**
   * 获取今日到期待复习列表
   */
  async getTodayReviewQueue(
    studentId: string,
    queryDto: QueryTodayReviewDto,
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, includeMastered = false } = queryDto;
    const runDate = this.getRunDateKey(new Date());
    const now = new Date();

    const taskQb = this.reviewDailyTaskRepo
      .createQueryBuilder('task')
      .innerJoinAndSelect('task.wrongBook', 'wrongBook')
      .leftJoinAndSelect('wrongBook.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .where('task.studentId = :studentId', { studentId })
      .andWhere('task.runDate = :runDate', { runDate })
      .andWhere('task.status = :taskStatus', { taskStatus: ReviewDailyTaskStatus.PENDING });

    if (!includeMastered) {
      taskQb.andWhere('wrongBook.isMastered = :isMastered', { isMastered: false });
    }

    taskQb.orderBy('task.dueAt', 'ASC', 'NULLS FIRST');
    taskQb.addOrderBy('wrongBook.lastWrongAt', 'DESC');
    taskQb.skip((page - 1) * pageSize).take(pageSize);

    const [taskRows, taskTotal] = await taskQb.getManyAndCount();
    if (taskTotal > 0) {
      const list = taskRows.map((task) => ({
        ...task.wrongBook,
        dailyTaskId: task.id,
        dailyTaskStatus: task.status,
        question: task.wrongBook.question ? this.sanitizeQuestion(task.wrongBook.question) : null,
      }));
      return new PaginationResponseDto(list, taskTotal, page, pageSize);
    }

    const fallbackQb = this.wrongBookRepo
      .createQueryBuilder('wrongBook')
      .leftJoinAndSelect('wrongBook.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .where('wrongBook.studentId = :studentId', { studentId })
      .andWhere('(wrongBook.nextReviewAt IS NULL OR wrongBook.nextReviewAt <= :now)', { now });

    if (!includeMastered) {
      fallbackQb.andWhere('wrongBook.isMastered = :isMastered', { isMastered: false });
    }

    fallbackQb.orderBy('wrongBook.nextReviewAt', 'ASC', 'NULLS FIRST');
    fallbackQb.addOrderBy('wrongBook.lastWrongAt', 'DESC');
    fallbackQb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await fallbackQb.getManyAndCount();
    const sanitized = data.map((item) => ({
      ...item,
      question: item.question ? this.sanitizeQuestion(item.question) : null,
    }));

    return new PaginationResponseDto(sanitized, total, page, pageSize);
  }

  /**
   * 标记已掌握 / 取消掌握
   */
  async toggleMastered(studentId: string, wrongBookId: string): Promise<WrongBook> {
    const item = await this.wrongBookRepo.findOne({
      where: { id: wrongBookId, studentId },
    });

    if (!item) {
      throw new NotFoundException('错题记录不存在');
    }

    item.isMastered = !item.isMastered;
    return this.wrongBookRepo.save(item);
  }

  /**
   * 从错题本移除
   */
  async removeFromWrongBook(studentId: string, wrongBookId: string): Promise<void> {
    const item = await this.wrongBookRepo.findOne({
      where: { id: wrongBookId, studentId },
    });

    if (!item) {
      throw new NotFoundException('错题记录不存在');
    }

    await this.wrongBookRepo.remove(item);
  }

  // ─── 做题记录 ──────────────────────────────────────────────

  /**
   * 做题记录列表（分页）
   */
  async getPracticeRecords(
    studentId: string,
    queryDto: QueryPracticeRecordDto,
  ): Promise<PaginationResponseDto<PracticeRecord>> {
    const { page = 1, pageSize = 10, isCorrect, questionId } = queryDto;

    const qb = this.practiceRecordRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.question', 'question')
      .where('record.studentId = :studentId', { studentId });

    if (isCorrect !== undefined) {
      qb.andWhere('record.isCorrect = :isCorrect', { isCorrect });
    }

    if (questionId) {
      qb.andWhere('record.questionId = :questionId', { questionId });
    }

    qb.orderBy('record.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return new PaginationResponseDto(data, total, page, pageSize);
  }
  async getReviewHistory(
    studentId: string,
    queryDto: QueryReviewHistoryDto,
  ): Promise<PaginationResponseDto<PracticeRecord>> {
    const { page = 1, pageSize = 10, questionId, from, to } = queryDto;

    const qb = this.practiceRecordRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.question', 'question')
      .where('record.studentId = :studentId', { studentId })
      .andWhere('record.attemptType = :attemptType', { attemptType: PracticeAttemptType.REVIEW });

    if (questionId) {
      qb.andWhere('record.questionId = :questionId', { questionId });
    }

    if (from) {
      qb.andWhere('record.createdAt >= :from', { from: new Date(from) });
    }

    if (to) {
      qb.andWhere('record.createdAt <= :to', { to: new Date(to) });
    }

    qb.orderBy('record.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return new PaginationResponseDto(data, total, page, pageSize);
  }

  // ─── 私有方法 ──────────────────────────────────────────────

  /**
   * 隐藏答案、解析、creator 和选项中的 isCorrect
   */
  async getPracticeRecordById(studentId: string, recordId: string): Promise<PracticeRecord> {
    const record = await this.practiceRecordRepo.findOne({
      where: { id: recordId, studentId },
      relations: ['question'],
    });

    if (!record) {
      throw new NotFoundException('Resource not found');
    }

    return record;
  }

  private sanitizeQuestion(question: Question): any {
    const { answer, explanation, creator, creatorId, ...safe } = question as any;

    // 移除选项中的 isCorrect
    if (safe.options) {
      safe.options = safe.options.map(({ isCorrect, ...opt }: any) => opt);
    }

    // 只返回 rendered 内容
    if (safe.content?.rendered) {
      safe.content = { rendered: safe.content.rendered };
    }

    return safe;
  }

  /**
   * 自动判题
   */
  private judgeAnswer(question: Question, submitted: any): boolean | null {
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        return submitted === question.answer;

      case QuestionType.MULTIPLE_CHOICE: {
        if (!Array.isArray(submitted) || !Array.isArray(question.answer)) return false;
        const correct = [...(question.answer as string[])].sort();
        const student = [...submitted].sort();
        return JSON.stringify(correct) === JSON.stringify(student);
      }

      case QuestionType.TRUE_FALSE:
        return submitted === question.answer;

      case QuestionType.FILL_BLANK: {
        if (!Array.isArray(submitted) || !Array.isArray(question.answer)) return false;
        return (question.answer as string[]).every(
          (a, i) => a.trim().toLowerCase() === submitted[i]?.trim()?.toLowerCase(),
        );
      }

      case QuestionType.SHORT_ANSWER:
        // 简答题不自动判，返回 null 表示需人工评阅
        return null;

      default:
        return false;
    }
  }

  /**
   * 写入或更新错题本
   */
  private async upsertWrongBook(
    studentId: string,
    questionId: string,
    wrongAnswer: any,
  ): Promise<void> {
    const now = new Date();
    const schedule = this.reviewPlanService.planAfterWrongAnswer(now);
    const existing = await this.wrongBookRepo.findOne({
      where: { studentId, questionId },
    });

    if (existing) {
      existing.wrongCount += 1;
      existing.lastWrongAt = now;
      existing.lastWrongAnswer = wrongAnswer;
      existing.isMastered = false;
      existing.reviewLevel = schedule.reviewLevel;
      existing.nextReviewAt = schedule.nextReviewAt;
      existing.lastReviewResult = null;
      existing.lastReviewedAt = null;
      await this.wrongBookRepo.save(existing);
    } else {
      await this.wrongBookRepo.save({
        studentId,
        questionId,
        wrongCount: 1,
        lastWrongAt: now,
        lastWrongAnswer: wrongAnswer,
        isMastered: false,
        reviewLevel: schedule.reviewLevel,
        nextReviewAt: schedule.nextReviewAt,
        lastReviewResult: null,
        lastReviewedAt: null,
      });
    }
  }

  private async applyReviewResult(
    studentId: string,
    questionId: string,
    submittedAnswer: any,
    isCorrect: boolean,
  ): Promise<void> {
    const now = new Date();
    const existing = await this.wrongBookRepo.findOne({
      where: { studentId, questionId },
    });

    if (!existing) {
      if (isCorrect) {
        await this.markTodayReviewTaskDone(studentId, questionId, now);
        return;
      }

      const schedule = this.reviewPlanService.planAfterWrongAnswer(now);
      await this.wrongBookRepo.save({
        studentId,
        questionId,
        wrongCount: 1,
        lastWrongAt: now,
        lastWrongAnswer: submittedAnswer,
        isMastered: false,
        reviewLevel: schedule.reviewLevel,
        nextReviewAt: schedule.nextReviewAt,
        lastReviewResult: false,
        lastReviewedAt: now,
      });
      await this.markTodayReviewTaskDone(studentId, questionId, now);
      return;
    }

    const schedule = this.reviewPlanService.planAfterReview(existing.reviewLevel, isCorrect, now);
    existing.reviewLevel = schedule.reviewLevel;
    existing.nextReviewAt = schedule.nextReviewAt;
    existing.lastReviewResult = isCorrect;
    existing.lastReviewedAt = now;

    if (isCorrect) {
      if (this.reviewPlanService.shouldAutoMaster(schedule.reviewLevel)) {
        existing.isMastered = true;
      }
    } else {
      existing.wrongCount += 1;
      existing.lastWrongAt = now;
      existing.lastWrongAnswer = submittedAnswer;
      existing.isMastered = false;
    }

    await this.wrongBookRepo.save(existing);
    await this.markTodayReviewTaskDone(studentId, questionId, now);
  }

  private async markTodayReviewTaskDone(
    studentId: string,
    questionId: string,
    completedAt: Date,
  ): Promise<void> {
    const runDate = this.getRunDateKey(completedAt);
    await this.reviewDailyTaskRepo
      .createQueryBuilder()
      .update(ReviewDailyTask)
      .set({
        status: ReviewDailyTaskStatus.DONE,
        completedAt,
      })
      .where('studentId = :studentId', { studentId })
      .andWhere('questionId = :questionId', { questionId })
      .andWhere('runDate = :runDate', { runDate })
      .andWhere('status = :status', { status: ReviewDailyTaskStatus.PENDING })
      .execute();
  }

  private getRunDateKey(now: Date): string {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const date = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }
}
