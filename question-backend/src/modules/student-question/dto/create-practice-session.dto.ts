import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { QuestionType } from '@/modules/question/enums/question-type.enum';
import { DifficultyLevel } from '@/modules/question/enums/difficulty-level.enum';
import { PracticeSessionMode } from '../enums';

export class CreatePracticeSessionDto {
  @ApiProperty({
    description: '练习模式',
    enum: PracticeSessionMode,
    example: PracticeSessionMode.RANDOM,
  })
  @IsEnum(PracticeSessionMode)
  mode: PracticeSessionMode;

  @ApiPropertyOptional({ description: '题量', default: 10, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  questionCount?: number = 10;

  @ApiPropertyOptional({ description: '分类ID（分类练时必填）' })
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '知识点ID列表（知识点练时必填）', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsOptional()
  knowledgePointIds?: string[];

  @ApiPropertyOptional({ description: '题型筛选', enum: QuestionType })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ description: '难度筛选', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsOptional()
  tagIds?: string[];
}
