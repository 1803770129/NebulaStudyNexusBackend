/**
 * 创建分类 DTO
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', example: '数学' })
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  @MaxLength(100, { message: '分类名称不能超过100个字符' })
  name: string;

  @ApiPropertyOptional({ description: '父分类ID' })
  @IsUUID('4', { message: '父分类ID格式不正确' })
  @IsOptional()
  parentId?: string;
}
