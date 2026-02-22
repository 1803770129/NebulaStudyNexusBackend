import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryReviewHistoryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Question ID filter' })
  @IsUUID('4')
  @IsOptional()
  questionId?: string;

  @ApiPropertyOptional({ description: 'Start datetime (ISO8601)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'End datetime (ISO8601)' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
