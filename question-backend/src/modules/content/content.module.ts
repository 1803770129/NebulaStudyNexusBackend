/**
 * 内容处理模块
 */
import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { FormulaModule } from '@/modules/formula/formula.module';

@Module({
  imports: [FormulaModule],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
