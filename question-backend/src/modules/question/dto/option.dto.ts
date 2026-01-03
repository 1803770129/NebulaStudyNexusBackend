/**
 * 选项 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

/**
 * 选项 DTO - 接收原始 HTML 内容
 * 后端会将 content 处理为 RichContent 结构
 */
export class OptionDto {
  @ApiProperty({ description: '选项ID', example: 'A' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: '选项内容（原始 HTML）', example: '选项A的内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '是否为正确答案', example: true })
  @IsBoolean()
  isCorrect: boolean;
}
