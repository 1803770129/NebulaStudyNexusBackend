import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgePoint } from './entities/knowledge-point.entity';
import { KnowledgePointController } from './knowledge-point.controller';
import { KnowledgePointService } from './knowledge-point.service';
import { CategoryModule } from '@/modules/category/category.module';
import { TagModule } from '@/modules/tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgePoint]),
    CategoryModule,
    TagModule,
  ],
  controllers: [KnowledgePointController],
  providers: [KnowledgePointService],
  exports: [KnowledgePointService],
})
export class KnowledgePointModule {}
