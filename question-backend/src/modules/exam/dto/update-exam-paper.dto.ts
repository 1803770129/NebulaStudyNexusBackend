import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateExamPaperItemDto } from './create-exam-paper.dto';

export class UpdateExamPaperDto {
  @ApiPropertyOptional({ description: 'Paper title', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Paper description', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Exam duration in minutes', minimum: 1, maximum: 300 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({
    type: [CreateExamPaperItemDto],
    description: 'Replace full item list when provided',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExamPaperItemDto)
  @IsOptional()
  items?: CreateExamPaperItemDto[];
}
