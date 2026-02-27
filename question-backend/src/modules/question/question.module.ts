/**
 * 题目模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionRuleEngineService } from './question-rule-engine.service';
import { CategoryModule } from '@/modules/category/category.module';
import { TagModule } from '@/modules/tag/tag.module';
import { ContentModule } from '@/modules/content/content.module';
import { KnowledgePointModule } from '@/modules/knowledge-point/knowledge-point.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    CategoryModule,
    TagModule,
    ContentModule,
    KnowledgePointModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRuleEngineService],
  exports: [QuestionService],
})
export class QuestionModule {}
