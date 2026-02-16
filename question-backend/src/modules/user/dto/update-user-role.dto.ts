/**
 * 修改用户角色 DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({ description: '角色', enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;
}
