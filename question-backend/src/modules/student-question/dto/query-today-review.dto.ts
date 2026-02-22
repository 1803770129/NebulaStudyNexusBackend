import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryTodayReviewDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Whether to include mastered items in due-review list',
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsOptional()
  includeMastered?: boolean = false;
}
