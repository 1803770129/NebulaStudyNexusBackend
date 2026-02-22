import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateExamPaperItemDto {
  @ApiProperty({ description: 'Question ID' })
  @IsUUID('4')
  questionId: string;

  @ApiProperty({ description: 'Score for this item', minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  score: number;
}

export class CreateExamPaperDto {
  @ApiProperty({ description: 'Paper title', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Paper description', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Exam duration in minutes', minimum: 1, maximum: 300 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  durationMinutes: number;

  @ApiProperty({
    type: [CreateExamPaperItemDto],
    description: 'Paper items ordered by array index',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExamPaperItemDto)
  items: CreateExamPaperItemDto[];
}
