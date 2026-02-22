import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitManualGradingDto {
  @ApiProperty({ description: '得分', minimum: 0, maximum: 100, example: 78 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: '是否通过', example: true })
  @IsBoolean()
  isPassed: boolean;

  @ApiPropertyOptional({ description: '评语' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @IsOptional()
  tags?: string[];
}
