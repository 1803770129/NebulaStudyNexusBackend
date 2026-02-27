import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgePoint } from './entities/knowledge-point.entity';
import { KnowledgePointController } from './knowledge-point.controller';
import { KnowledgePointService } from './knowledge-point.service';
import { CategoryModule } from '@/modules/category/category.module';
import { TagModule } from '@/modules/tag/tag.module';
import { StudentKnowledgePointController } from './student-knowledge-point.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgePoint]), CategoryModule, TagModule],
  controllers: [KnowledgePointController, StudentKnowledgePointController],
  providers: [KnowledgePointService],
  exports: [KnowledgePointService],
})
export class KnowledgePointModule {}
