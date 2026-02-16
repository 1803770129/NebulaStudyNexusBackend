/**
 * 绑定微信 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BindWechatDto {
  @ApiProperty({ description: '微信登录 code', example: 'wx_code_xxx' })
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}
