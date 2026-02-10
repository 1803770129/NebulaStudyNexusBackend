/**
 * 创建知识点 DTO
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 富文本内容 DTO
 */
export class RichContentDto {
  @ApiProperty({ description: '原始内容', example: '二叉树遍历是指按照某种顺序访问树中的所有节点...' })
  @IsString()
  @IsNotEmpty({ message: '原始内容不能为空' })
  raw: string;

  @ApiProperty({ description: '渲染后内容', example: '<p>二叉树遍历是指按照某种顺序访问树中的所有节点...</p>' })
  @IsString()
  @IsNotEmpty({ message: '渲染后内容不能为空' })
  rendered: string;
}

/**
 * 创建知识点 DTO
 */
export class CreateKnowledgePointDto {
  @ApiProperty({ description: '知识点名称', maxLength: 100, example: '二叉树遍历' })
  @IsString()
  @IsNotEmpty({ message: '知识点名称不能为空' })
  @MaxLength(100, { message: '知识点名称不能超过100个字符' })
  name: string;

  @ApiProperty({ description: '知识点内容', type: RichContentDto })
  @ValidateNested()
  @Type(() => RichContentDto)
  content: RichContentDto;

  @ApiPropertyOptional({ description: '拓展内容', type: RichContentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RichContentDto)
  extension?: RichContentDto;

  @ApiPropertyOptional({ description: '分类 ID' })
  @IsOptional()
  @IsUUID('4', { message: '分类 ID 格式不正确' })
  categoryId?: string;

  @ApiPropertyOptional({ description: '父知识点 ID' })
  @IsOptional()
  @IsUUID('4', { message: '父知识点 ID 格式不正确' })
  parentId?: string;

  @ApiPropertyOptional({ description: '标签 ID 列表', type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsOptional()
  @IsUUID('4', { each: true, message: '标签 ID 格式不正确' })
  tagIds?: string[];
}
