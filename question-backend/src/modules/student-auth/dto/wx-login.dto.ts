/**
 * 微信登录 DTO
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class WxLoginDto {
  @ApiProperty({ description: '微信登录 code', example: 'wx_code_xxx' })
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
