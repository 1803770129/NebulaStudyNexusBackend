import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WrongBook } from './entities/wrong-book.entity';
import { ReviewDailyTask } from './entities/review-daily-task.entity';
import { ReviewDailyTaskStatus } from './enums';

const DAILY_CHECK_INTERVAL_MS = 60 * 1000;
const RETRY_DELAYS_MS = [0, 1000, 3000];

export interface ReviewDailyTaskGenerationResult {
  runDate: string;
  generatedCount: number;
  trigger: 'startup' | 'timer' | 'manual';
  attempts: number;
}

@Injectable()
export class ReviewTaskSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReviewTaskSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastGeneratedRunDate: string | null = null;
  private isGenerating = false;

  constructor(
    @InjectRepository(WrongBook)
    private readonly wrongBookRepo: Repository<WrongBook>,
    @InjectRepository(ReviewDailyTask)
    private readonly reviewDailyTaskRepo: Repository<ReviewDailyTask>,
  ) {}

  onModuleInit(): void {
    void this.generateTodayIfNeeded('startup');
    this.timer = setInterval(() => {
      void this.generateTodayIfNeeded('timer');
    }, DAILY_CHECK_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async manualGenerate(runDateInput?: string): Promise<ReviewDailyTaskGenerationResult> {
    const runDate = this.normalizeRunDate(runDateInput);
    return this.generateWithRetry(runDate, 'manual');
  }

  async getSummary(runDateInput?: string): Promise<{
    runDate: string;
    total: number;
    pending: number;
    done: number;
  }> {
    const runDate = this.normalizeRunDate(runDateInput);

    const [total, pending, done] = await Promise.all([
      this.reviewDailyTaskRepo.count({ where: { runDate } }),
      this.reviewDailyTaskRepo.count({
        where: { runDate, status: ReviewDailyTaskStatus.PENDING },
      }),
      this.reviewDailyTaskRepo.count({
        where: { runDate, status: ReviewDailyTaskStatus.DONE },
      }),
    ]);

    return { runDate, total, pending, done };
  }

  private async generateTodayIfNeeded(trigger: 'startup' | 'timer'): Promise<void> {
    const runDate = this.getRunDateKey(new Date());
    if (this.lastGeneratedRunDate === runDate) {
      return;
    }

    try {
      await this.generateWithRetry(runDate, trigger);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate review daily tasks for ${runDate}: ${message}`);
    }
  }

  private async generateWithRetry(
    runDate: string,
    trigger: 'startup' | 'timer' | 'manual',
  ): Promise<ReviewDailyTaskGenerationResult> {
    if (this.isGenerating) {
      throw new BadRequestException('Daily review task generation is running');
    }

    this.isGenerating = true;
    let lastError: unknown;

    try {
      for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
        if (RETRY_DELAYS_MS[attempt] > 0) {
          await this.delay(RETRY_DELAYS_MS[attempt]);
        }

        try {
          const generatedCount = await this.generateForRunDate(runDate);
          this.lastGeneratedRunDate = runDate;
          this.logger.log(
            `[${trigger}] generated ${generatedCount} review daily tasks for ${runDate} (attempt ${
              attempt + 1
            })`,
          );
          return {
            runDate,
            generatedCount,
            trigger,
            attempts: attempt + 1,
          };
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `generate review daily tasks failed for ${runDate}, attempt ${attempt + 1}: ${message}`,
          );
        }
      }
    } finally {
      this.isGenerating = false;
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Unknown error during review daily task generation');
  }

  private async generateForRunDate(runDate: string): Promise<number> {
    const endOfDay = this.getRunDateEnd(runDate);
    const dueWrongBooks = await this.wrongBookRepo
      .createQueryBuilder('wrongBook')
      .select([
        'wrongBook.id',
        'wrongBook.studentId',
        'wrongBook.questionId',
        'wrongBook.nextReviewAt',
        'wrongBook.lastWrongAt',
      ])
      .where('wrongBook.isMastered = :isMastered', { isMastered: false })
      .andWhere('(wrongBook.nextReviewAt IS NULL OR wrongBook.nextReviewAt <= :endOfDay)', {
        endOfDay,
      })
      .orderBy('wrongBook.nextReviewAt', 'ASC', 'NULLS FIRST')
      .addOrderBy('wrongBook.lastWrongAt', 'DESC')
      .getMany();

    await this.reviewDailyTaskRepo.manager.transaction(async (manager) => {
      const taskRepo = manager.getRepository(ReviewDailyTask);
      await taskRepo.delete({ runDate });

      if (dueWrongBooks.length === 0) {
        return;
      }

      const tasks = dueWrongBooks.map((item) =>
        taskRepo.create({
          runDate,
          studentId: item.studentId,
          wrongBookId: item.id,
          questionId: item.questionId,
          dueAt: item.nextReviewAt ?? null,
          status: ReviewDailyTaskStatus.PENDING,
          completedAt: null,
        }),
      );
      await taskRepo.save(tasks);
    });

    return dueWrongBooks.length;
  }

  private normalizeRunDate(runDateInput?: string): string {
    if (!runDateInput) {
      return this.getRunDateKey(new Date());
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(runDateInput)) {
      throw new BadRequestException('runDate must be formatted as YYYY-MM-DD');
    }

    const candidate = new Date(`${runDateInput}T00:00:00.000Z`);
    if (Number.isNaN(candidate.getTime())) {
      throw new BadRequestException('Invalid runDate');
    }

    return runDateInput;
  }

  private getRunDateEnd(runDate: string): Date {
    return new Date(`${runDate}T23:59:59.999Z`);
  }

  private getRunDateKey(now: Date): string {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const date = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
