import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ExamAttemptStatus } from '../enums';

export class QueryExamAttemptDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Attempt status filter', enum: ExamAttemptStatus })
  @IsEnum(ExamAttemptStatus)
  @IsOptional()
  status?: ExamAttemptStatus;

  @ApiPropertyOptional({ description: 'Paper ID filter' })
  @IsUUID('4')
  @IsOptional()
  paperId?: string;

  @ApiPropertyOptional({ description: 'Student ID filter (admin only)' })
  @IsUUID('4')
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Keyword for paper title or student profile',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  keyword?: string;
}
