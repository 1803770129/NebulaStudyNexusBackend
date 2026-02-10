/**
 * 创建题目 DTO
 * 
 * 接收原始 HTML 内容（包含 LaTeX 公式），后端会处理为 RichContent 结构
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { OptionDto } from './option.dto';

export class CreateQuestionDto {
  @ApiProperty({ description: '题目标题', example: '以下哪个是正确的？' })
  @IsString()
  @IsNotEmpty({ message: '题目标题不能为空' })
  @MaxLength(200, { message: '题目标题不能超过200个字符' })
  title: string;

  @ApiProperty({ description: '题目内容（原始 HTML，可包含 LaTeX 公式）', example: '请选择正确的答案...' })
  @IsString()
  @IsNotEmpty({ message: '题目内容不能为空' })
  content: string;

  @ApiProperty({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType, { message: '无效的题目类型' })
  type: QuestionType;

  @ApiProperty({ description: '难度等级', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel, { message: '无效的难度等级' })
  difficulty: DifficultyLevel;

  @ApiProperty({ description: '分类ID' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  categoryId: string;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID格式不正确' })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: '知识点 ID 列表', type: [String] })
  @IsOptional()
  @IsUUID('4', { each: true, message: '知识点ID格式不正确' })
  knowledgePointIds?: string[];

  @ApiPropertyOptional({ description: '选项列表（选择题必填）', type: [OptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];

  @ApiProperty({ description: '答案', oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] })
  @IsNotEmpty({ message: '答案不能为空' })
  answer: string | string[];

  @ApiPropertyOptional({ description: '答案解析（原始 HTML，可包含 LaTeX 公式）' })
  @IsString()
  @IsOptional()
  explanation?: string;
}
