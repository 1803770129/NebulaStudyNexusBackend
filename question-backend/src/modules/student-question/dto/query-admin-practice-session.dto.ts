import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPracticeSessionDto } from './query-practice-session.dto';

export class QueryAdminPracticeSessionDto extends QueryPracticeSessionDto {
  @ApiPropertyOptional({ description: '学生 ID 过滤' })
  @IsUUID('4')
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: '学生昵称/手机号模糊搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
