/**
 * 公式渲染模块
 */
import { Module } from '@nestjs/common';
import { FormulaService } from './formula.service';

@Module({
  providers: [FormulaService],
  exports: [FormulaService],
})
export class FormulaModule {}
