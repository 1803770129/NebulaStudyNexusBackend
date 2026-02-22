import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { PracticeSessionMode, PracticeSessionStatus } from '../enums';

export class QueryPracticeSessionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '会话状态', enum: PracticeSessionStatus })
  @IsEnum(PracticeSessionStatus)
  @IsOptional()
  status?: PracticeSessionStatus;

  @ApiPropertyOptional({ description: '会话模式', enum: PracticeSessionMode })
  @IsEnum(PracticeSessionMode)
  @IsOptional()
  mode?: PracticeSessionMode;
}
