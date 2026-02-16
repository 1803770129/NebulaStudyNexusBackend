/**
 * 员工管理控制器（Admin 管理端）
 *
 * 提供管理员对员工的管理操作
 */
import { Controller, Get, Param, Patch, Delete, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { QueryUserDto, UpdateUserRoleDto, UpdateUserStatusDto, ResetPasswordDto } from './dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AdminJwtPayload } from '@/modules/auth/strategies/jwt.strategy';
import { UserRole } from './enums/user-role.enum';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '员工列表（分页+搜索+筛选）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryUserDto) {
    return this.userService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '员工详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: '修改员工角色' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 403, description: '不能修改自己的角色' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AdminJwtPayload,
  ) {
    return this.userService.updateRole(id, dto.role, user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '启用/禁用员工' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 403, description: '不能修改自己的状态' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AdminJwtPayload,
  ) {
    return this.userService.updateStatus(id, dto.isActive, user.sub);
  }

  @Patch(':id/reset-password')
  @ApiOperation({ summary: '重置员工密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 403, description: '不能重置自己的密码' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: AdminJwtPayload,
  ) {
    await this.userService.resetPassword(id, dto.newPassword, user.sub);
    return { message: '密码重置成功' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除员工' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '不能删除自己' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AdminJwtPayload) {
    await this.userService.remove(id, user.sub);
    return { message: '删除成功' };
  }
}
