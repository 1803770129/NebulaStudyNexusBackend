/**
 * 更新管理员个人信息 DTO
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({ description: '邮箱', example: 'new@example.com' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;
}
