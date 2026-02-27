/**
 * 标签模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { StudentTagController } from './student-tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagController, StudentTagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
