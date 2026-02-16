/**
 * 修改学生密码 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeStudentPasswordDto {
  @ApiProperty({ description: '旧密码', example: 'oldpass123' })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: 'newpass123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '新密码长度不能少于 6 位' })
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}
