import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAttempt } from './entities';
import { ExamAttemptStatus } from './enums';
import { ExamService } from './exam.service';

const TIMEOUT_SCAN_INTERVAL_MS = 60 * 1000;

export interface ExamTimeoutScanResult {
  trigger: 'startup' | 'timer' | 'manual';
  scannedCount: number;
  timeoutCount: number;
  autoFinishedCount: number;
  scannedAt: string;
}

@Injectable()
export class ExamTimeoutSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExamTimeoutSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepo: Repository<ExamAttempt>,
    private readonly examService: ExamService,
  ) {}

  onModuleInit(): void {
    void this.scanAndAutoFinish('startup');
    this.timer = setInterval(() => {
      void this.scanAndAutoFinish('timer');
    }, TIMEOUT_SCAN_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async manualScan(): Promise<ExamTimeoutScanResult> {
    return this.scanAndAutoFinish('manual');
  }

  async getTimeoutSummary(): Promise<{
    activeCount: number;
    timeoutCount: number;
    checkedAt: string;
  }> {
    const activeAttempts = await this.loadActiveAttemptsWithPaper();
    const timeoutAttempts = this.pickTimeoutAttempts(activeAttempts, Date.now());
    return {
      activeCount: activeAttempts.length,
      timeoutCount: timeoutAttempts.length,
      checkedAt: new Date().toISOString(),
    };
  }

  private async scanAndAutoFinish(
    trigger: 'startup' | 'timer' | 'manual',
  ): Promise<ExamTimeoutScanResult> {
    if (this.running) {
      return {
        trigger,
        scannedCount: 0,
        timeoutCount: 0,
        autoFinishedCount: 0,
        scannedAt: new Date().toISOString(),
      };
    }

    this.running = true;
    try {
      const activeAttempts = await this.loadActiveAttemptsWithPaper();
      const timeoutAttempts = this.pickTimeoutAttempts(activeAttempts, Date.now());

      let autoFinishedCount = 0;
      for (const attempt of timeoutAttempts) {
        const finished = await this.examService.autoFinishTimeoutAttempt(attempt.id);
        if (finished) {
          autoFinishedCount += 1;
        }
      }

      const result: ExamTimeoutScanResult = {
        trigger,
        scannedCount: activeAttempts.length,
        timeoutCount: timeoutAttempts.length,
        autoFinishedCount,
        scannedAt: new Date().toISOString(),
      };
      if (autoFinishedCount > 0) {
        this.logger.log(
          `[${trigger}] auto-finished ${autoFinishedCount}/${timeoutAttempts.length} timeout exam attempts`,
        );
      }
      return result;
    } finally {
      this.running = false;
    }
  }

  private async loadActiveAttemptsWithPaper(): Promise<ExamAttempt[]> {
    return this.examAttemptRepo
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.paper', 'paper')
      .where('attempt.status = :status', { status: ExamAttemptStatus.ACTIVE })
      .getMany();
  }

  private pickTimeoutAttempts(activeAttempts: ExamAttempt[], nowMs: number): ExamAttempt[] {
    return activeAttempts.filter((attempt) => {
      const durationMinutes = attempt.paper?.durationMinutes ?? 0;
      const timeoutAtMs = new Date(attempt.startedAt).getTime() + durationMinutes * 60 * 1000;
      return timeoutAtMs <= nowMs;
    });
  }
}
