/**
 * 错题本查询 DTO
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryWrongBookDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '是否已掌握' })
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsOptional()
  isMastered?: boolean;
}
