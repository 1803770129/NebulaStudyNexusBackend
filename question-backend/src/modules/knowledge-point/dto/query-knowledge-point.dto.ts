/**
 * 查询知识点 DTO
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 查询知识点 DTO
 * 支持分页、搜索和多种筛选条件
 */
export class QueryKnowledgePointDto {
  @ApiPropertyOptional({ description: '页码', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于等于1' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键词（按知识点名称搜索）', example: '二叉树' })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @ApiPropertyOptional({ description: '分类 ID（筛选指定分类下的知识点）' })
  @IsOptional()
  @IsUUID('4', { message: '分类 ID 格式不正确' })
  categoryId?: string;

  @ApiPropertyOptional({ description: '标签 ID（筛选包含指定标签的知识点）' })
  @IsOptional()
  @IsUUID('4', { message: '标签 ID 格式不正确' })
  tagId?: string;

  @ApiPropertyOptional({
    description: '父知识点 ID（筛选指定父节点下的子知识点，传空字符串或null查询顶级知识点）',
  })
  @IsOptional()
  @IsUUID('4', { message: '父知识点 ID 格式不正确' })
  parentId?: string;
}
