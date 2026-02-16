/**
 * 重置密码 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: '新密码', example: 'newpass123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}
