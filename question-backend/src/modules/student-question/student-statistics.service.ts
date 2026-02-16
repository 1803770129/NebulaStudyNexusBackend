/**
 * 学生端统计服务
 *
 * 提供做题统计概览：总做题数、正确率、今日数据、近7天趋势
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeRecord } from './entities/practice-record.entity';
import { Favorite } from './entities/favorite.entity';
import { WrongBook } from './entities/wrong-book.entity';

@Injectable()
export class StudentStatisticsService {
  constructor(
    @InjectRepository(PracticeRecord)
    private readonly practiceRecordRepo: Repository<PracticeRecord>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(WrongBook)
    private readonly wrongBookRepo: Repository<WrongBook>,
  ) {}

  /**
   * 获取做题统计概览
   */
  async getStatistics(studentId: string) {
    // ── 总做题数 & 总正确数 ──
    const totalPracticed = await this.practiceRecordRepo.count({
      where: { studentId },
    });

    const totalCorrect = await this.practiceRecordRepo.count({
      where: { studentId, isCorrect: true },
    });

    const correctRate = totalPracticed > 0 ? totalCorrect / totalPracticed : 0;

    // ── 收藏数 & 错题数 ──
    const totalFavorites = await this.favoriteRepo.count({
      where: { studentId },
    });

    const totalWrong = await this.wrongBookRepo.count({
      where: { studentId, isMastered: false },
    });

    // ── 今日数据 ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPracticed = await this.practiceRecordRepo
      .createQueryBuilder('record')
      .where('record.studentId = :studentId', { studentId })
      .andWhere('record.createdAt >= :today', { today })
      .getCount();

    const todayCorrect = await this.practiceRecordRepo
      .createQueryBuilder('record')
      .where('record.studentId = :studentId', { studentId })
      .andWhere('record.isCorrect = true')
      .andWhere('record.createdAt >= :today', { today })
      .getCount();

    // ── 近 7 天趋势 ──
    const weeklyTrend = await this.getWeeklyTrend(studentId);

    return {
      totalPracticed,
      totalCorrect,
      correctRate: Math.round(correctRate * 10000) / 10000, // 保留 4 位小数
      totalFavorites,
      totalWrong,
      todayPracticed,
      todayCorrect,
      weeklyTrend,
    };
  }

  /**
   * 获取近 7 天做题趋势
   */
  private async getWeeklyTrend(studentId: string) {
    const result: { date: string; practiced: number; correct: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateStr = date.toISOString().split('T')[0];

      const practiced = await this.practiceRecordRepo
        .createQueryBuilder('record')
        .where('record.studentId = :studentId', { studentId })
        .andWhere('record.createdAt >= :start', { start: date })
        .andWhere('record.createdAt < :end', { end: nextDate })
        .getCount();

      const correct = await this.practiceRecordRepo
        .createQueryBuilder('record')
        .where('record.studentId = :studentId', { studentId })
        .andWhere('record.isCorrect = true')
        .andWhere('record.createdAt >= :start', { start: date })
        .andWhere('record.createdAt < :end', { end: nextDate })
        .getCount();

      result.push({ date: dateStr, practiced, correct });
    }

    return result;
  }
}
