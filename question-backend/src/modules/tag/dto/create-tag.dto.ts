/**
 * 创建标签 DTO
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '标签名称', example: '重点' })
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  @MaxLength(50, { message: '标签名称不能超过50个字符' })
  name: string;

  @ApiPropertyOptional({ description: '标签颜色（十六进制）', example: '#1890ff' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色格式不正确，应为十六进制格式如 #1890ff' })
  @IsOptional()
  color?: string;
}
