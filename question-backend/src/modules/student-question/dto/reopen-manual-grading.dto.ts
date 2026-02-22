import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReopenManualGradingDto {
  @ApiPropertyOptional({ description: '重开原因' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}
