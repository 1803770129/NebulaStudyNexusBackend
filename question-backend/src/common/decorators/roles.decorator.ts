/**
 * 角色装饰器
 *
 * 用于标记路由所需的角色权限
 * 配合 RolesGuard 使用实现 RBAC
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/user/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * @Roles() 装饰器
 *
 * 使用示例：
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * remove(@Param('id') id: string) {
 *   return this.service.remove(id);
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
