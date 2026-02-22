import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { ExamAttemptAdminController } from './exam-attempt-admin.controller';
import { ExamAdminController } from './exam-admin.controller';
import { ExamTimeoutSchedulerService } from './exam-timeout-scheduler.service';
import { StudentExamController } from './student-exam.controller';
import { ExamService } from './exam.service';
import { ExamAttempt, ExamAttemptItem, ExamPaper, ExamPaperItem } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, ExamPaper, ExamPaperItem, ExamAttempt, ExamAttemptItem]),
  ],
  controllers: [ExamAdminController, ExamAttemptAdminController, StudentExamController],
  providers: [ExamService, ExamTimeoutSchedulerService],
  exports: [ExamService, ExamTimeoutSchedulerService],
})
export class ExamModule {}
