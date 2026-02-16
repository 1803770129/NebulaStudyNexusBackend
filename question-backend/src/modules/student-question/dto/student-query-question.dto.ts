/**
 * 学生端题目查询 DTO
 *
 * 继承分页基类，提供题目筛选参数
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { QuestionType } from '@/modules/question/enums/question-type.enum';
import { DifficultyLevel } from '@/modules/question/enums/difficulty-level.enum';

export class StudentQueryQuestionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType, { message: '无效的题目类型' })
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ description: '难度等级', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel, { message: '无效的难度等级' })
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID格式不正确' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: '知识点ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true, message: '知识点ID格式不正确' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsOptional()
  knowledgePointIds?: string[];
}
