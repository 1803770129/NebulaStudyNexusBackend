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
import { PracticeSession } from './entities/practice-session.entity';
import { PracticeSessionItem } from './entities/practice-session-item.entity';
import { ManualGradingTask } from './entities/manual-grading-task.entity';
import { ReviewDailyTask } from './entities/review-daily-task.entity';
import { StudentQuestionService } from './student-question.service';
import { StudentStatisticsService } from './student-statistics.service';
import { StudentQuestionController } from './student-question.controller';
import { PracticeSessionController } from './practice-session.controller';
import { PracticeSessionAdminController } from './practice-session-admin.controller';
import { PracticeSessionService } from './practice-session.service';
import { ManualGradingService } from './manual-grading.service';
import { ManualGradingAdminController } from './manual-grading-admin.controller';
import { ReviewPlanService } from './review-plan.service';
import { ReviewTaskSchedulerService } from './review-task-scheduler.service';
import { ReviewTaskAdminController } from './review-task-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      PracticeRecord,
      Favorite,
      WrongBook,
      PracticeSession,
      PracticeSessionItem,
      ManualGradingTask,
      ReviewDailyTask,
    ]),
  ],
  controllers: [
    StudentQuestionController,
    PracticeSessionController,
    PracticeSessionAdminController,
    ManualGradingAdminController,
    ReviewTaskAdminController,
  ],
  providers: [
    StudentQuestionService,
    StudentStatisticsService,
    PracticeSessionService,
    ManualGradingService,
    ReviewPlanService,
    ReviewTaskSchedulerService,
  ],
  exports: [
    StudentQuestionService,
    StudentStatisticsService,
    PracticeSessionService,
    ManualGradingService,
    ReviewPlanService,
    ReviewTaskSchedulerService,
  ],
})
export class StudentQuestionModule {}
