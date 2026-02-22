/**
 * 角色守卫
 *
 * 实现基于角色的访问控制 (RBAC)
 * 检查用户是否具有访问特定路由所需的角色
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置角色要求，允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取当前用户
    const { user } = context.switchToHttp().getRequest();

    // 检查用户是否具有所需角色
    return requiredRoles.includes(user?.role);
  }
}
