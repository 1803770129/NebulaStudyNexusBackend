import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';
import { ManualGradingTask } from './entities/manual-grading-task.entity';
import { PracticeRecord } from './entities/practice-record.entity';
import { ManualGradingTaskStatus } from './enums';
import { QueryManualGradingTaskDto, ReopenManualGradingDto, SubmitManualGradingDto } from './dto';

@Injectable()
export class ManualGradingService {
  constructor(
    @InjectRepository(ManualGradingTask)
    private readonly taskRepo: Repository<ManualGradingTask>,
    @InjectRepository(PracticeRecord)
    private readonly practiceRecordRepo: Repository<PracticeRecord>,
  ) {}

  async findAll(queryDto: QueryManualGradingTaskDto): Promise<PaginationResponseDto<any>> {
    const { page = 1, pageSize = 10, status, assigneeId, keyword } = queryDto;
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.student', 'student')
      .leftJoinAndSelect('task.question', 'question')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.practiceRecord', 'record');

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (assigneeId) {
      qb.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (keyword?.trim()) {
      const normalized = `%${keyword.trim()}%`;
      qb.andWhere(
        '(student.nickname ILIKE :keyword OR student.phone ILIKE :keyword OR question.title ILIKE :keyword)',
        { keyword: normalized },
      );
    }

    qb.orderBy('task.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    const taskList = data.map((task) => this.toTaskSummary(task));
    return new PaginationResponseDto(taskList, total, page, pageSize);
  }

  async findById(taskId: string): Promise<any> {
    const task = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.student', 'student')
      .leftJoinAndSelect('task.question', 'question')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.practiceRecord', 'record')
      .where('task.id = :taskId', { taskId })
      .getOne();

    if (!task) {
      throw new NotFoundException('Resource not found');
    }

    return this.toTaskDetail(task);
  }

  async claimTask(taskId: string, assigneeId: string): Promise<any> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Resource not found');
    }

    if (task.status === ManualGradingTaskStatus.DONE) {
      throw new ConflictException('任务已完成，不能领取');
    }

    if (task.assigneeId && task.assigneeId !== assigneeId) {
      throw new ConflictException('任务已被其他批改员领取');
    }

    if (task.status !== ManualGradingTaskStatus.ASSIGNED || task.assigneeId !== assigneeId) {
      task.status = ManualGradingTaskStatus.ASSIGNED;
      task.assigneeId = assigneeId;
      task.assignedAt = task.assignedAt ?? new Date();
      await this.taskRepo.save(task);
    }

    return this.findById(task.id);
  }

  async submitTask(taskId: string, graderId: string, dto: SubmitManualGradingDto): Promise<any> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Resource not found');
    }

    if (task.status === ManualGradingTaskStatus.DONE) {
      throw new ConflictException('任务已完成，不能重复提交');
    }

    if (task.assigneeId && task.assigneeId !== graderId) {
      throw new ConflictException('当前任务不属于该批改员');
    }

    const practiceRecord = await this.practiceRecordRepo.findOne({
      where: { id: task.practiceRecordId },
    });
    if (!practiceRecord) {
      throw new NotFoundException('Resource not found');
    }

    const now = new Date();
    task.status = ManualGradingTaskStatus.DONE;
    task.assigneeId = graderId;
    task.assignedAt = task.assignedAt ?? now;
    task.score = dto.score;
    task.feedback = dto.feedback?.trim() || null;
    task.tags = dto.tags?.length ? dto.tags : null;
    task.isPassed = dto.isPassed;
    task.submittedAt = now;

    practiceRecord.score = dto.score;
    practiceRecord.gradingFeedback = dto.feedback?.trim() || null;
    practiceRecord.gradingTags = dto.tags?.length ? dto.tags : null;
    practiceRecord.isPassed = dto.isPassed;
    practiceRecord.gradedBy = graderId;
    practiceRecord.gradedAt = now;
    practiceRecord.isCorrect = dto.isPassed;

    await this.taskRepo.manager.transaction(async (manager) => {
      await manager.getRepository(ManualGradingTask).save(task);
      await manager.getRepository(PracticeRecord).save(practiceRecord);
    });

    return this.findById(task.id);
  }

  async reopenTask(taskId: string, dto: ReopenManualGradingDto): Promise<any> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Resource not found');
    }

    if (task.status !== ManualGradingTaskStatus.DONE) {
      throw new ConflictException('仅已完成任务可重开');
    }

    const practiceRecord = await this.practiceRecordRepo.findOne({
      where: { id: task.practiceRecordId },
    });
    if (!practiceRecord) {
      throw new NotFoundException('Resource not found');
    }

    task.status = ManualGradingTaskStatus.REOPEN;
    task.score = null;
    task.feedback = dto.reason?.trim() ? `【重开原因】${dto.reason.trim()}` : null;
    task.tags = null;
    task.isPassed = null;
    task.submittedAt = null;

    practiceRecord.score = null;
    practiceRecord.gradingFeedback = null;
    practiceRecord.gradingTags = null;
    practiceRecord.isPassed = null;
    practiceRecord.gradedBy = null;
    practiceRecord.gradedAt = null;
    practiceRecord.isCorrect = null;

    await this.taskRepo.manager.transaction(async (manager) => {
      await manager.getRepository(ManualGradingTask).save(task);
      await manager.getRepository(PracticeRecord).save(practiceRecord);
    });

    return this.findById(task.id);
  }

  async createTaskFromPracticeRecord(practiceRecord: PracticeRecord): Promise<ManualGradingTask> {
    const exists = await this.taskRepo.findOne({
      where: { practiceRecordId: practiceRecord.id },
      select: ['id'],
    });
    if (exists) {
      return this.taskRepo.findOneOrFail({ where: { id: exists.id } });
    }

    const task = this.taskRepo.create({
      practiceRecordId: practiceRecord.id,
      studentId: practiceRecord.studentId,
      questionId: practiceRecord.questionId,
      status: ManualGradingTaskStatus.PENDING,
      assigneeId: null,
      assignedAt: null,
      score: null,
      feedback: null,
      tags: null,
      isPassed: null,
      submittedAt: null,
    });

    return this.taskRepo.save(task);
  }

  private toTaskSummary(task: ManualGradingTask): any {
    return {
      id: task.id,
      practiceRecordId: task.practiceRecordId,
      status: task.status,
      assigneeId: task.assigneeId,
      assignedAt: task.assignedAt,
      score: task.score,
      isPassed: task.isPassed,
      submittedAt: task.submittedAt,
      student: task.student
        ? {
            id: task.student.id,
            nickname: task.student.nickname,
            phone: task.student.phone,
          }
        : null,
      question: task.question
        ? {
            id: task.question.id,
            title: task.question.title,
            type: task.question.type,
          }
        : null,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            username: task.assignee.username,
          }
        : null,
      practiceRecord: (task as any).practiceRecord
        ? {
            id: (task as any).practiceRecord.id,
            submittedAnswer: (task as any).practiceRecord.submittedAnswer,
            duration: (task as any).practiceRecord.duration,
            createdAt: (task as any).practiceRecord.createdAt,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private toTaskDetail(task: ManualGradingTask): any {
    return {
      ...this.toTaskSummary(task),
      feedback: task.feedback,
      tags: task.tags ?? [],
      question: task.question
        ? {
            id: task.question.id,
            title: task.question.title,
            content: task.question.content,
            answer: task.question.answer,
            explanation: task.question.explanation,
            type: task.question.type,
            difficulty: task.question.difficulty,
          }
        : null,
    };
  }
}
