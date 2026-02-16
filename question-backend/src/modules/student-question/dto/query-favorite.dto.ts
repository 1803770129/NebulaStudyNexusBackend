/**
 * 收藏查询 DTO
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryFavoriteDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词（搜索题目标题）' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
