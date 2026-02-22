import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ManualGradingTaskStatus } from '../enums';

export class QueryManualGradingTaskDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '任务状态', enum: ManualGradingTaskStatus })
  @IsEnum(ManualGradingTaskStatus)
  @IsOptional()
  status?: ManualGradingTaskStatus;

  @ApiPropertyOptional({ description: '批改员ID' })
  @IsUUID('4')
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: '关键词（学生昵称/手机号/题目标题）' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  keyword?: string;
}
