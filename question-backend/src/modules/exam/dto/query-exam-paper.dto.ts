import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ExamPaperStatus } from '../enums';

export class QueryExamPaperDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Paper status filter', enum: ExamPaperStatus })
  @IsEnum(ExamPaperStatus)
  @IsOptional()
  status?: ExamPaperStatus;

  @ApiPropertyOptional({ description: 'Keyword search for title', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  keyword?: string;
}
