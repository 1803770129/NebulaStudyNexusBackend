/**
 * 做题记录查询 DTO
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryPracticeRecordDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '是否正确' })
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsOptional()
  isCorrect?: boolean;

  @ApiPropertyOptional({ description: '题目ID' })
  @IsUUID('4', { message: '题目ID格式不正确' })
  @IsOptional()
  questionId?: string;
}
