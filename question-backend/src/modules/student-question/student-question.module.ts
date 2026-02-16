/**
 * 学生端题目模块
 *
 * 注册实体、服务和控制器，导入 Question 实体用于关联查询
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { PracticeRecord } from './entities/practice-record.entity';
import { Favorite } from './entities/favorite.entity';
import { WrongBook } from './entities/wrong-book.entity';
import { StudentQuestionService } from './student-question.service';
import { StudentStatisticsService } from './student-statistics.service';
import { StudentQuestionController } from './student-question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question, PracticeRecord, Favorite, WrongBook])],
  controllers: [StudentQuestionController],
  providers: [StudentQuestionService, StudentStatisticsService],
  exports: [StudentQuestionService, StudentStatisticsService],
})
export class StudentQuestionModule {}
