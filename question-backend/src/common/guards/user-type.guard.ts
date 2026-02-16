/**
 * 用户类型守卫
 *
 * 检查当前用户的 type 是否在允许列表中
 * 配合 @UserType() 装饰器使用
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE_KEY } from '../decorators/user-type.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由允许的用户类型
    const requiredTypes = this.reflector.getAllAndOverride<string[]>(USER_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置用户类型要求，允许访问
    if (!requiredTypes || requiredTypes.length === 0) {
      return true;
    }

    // 获取当前用户
    const { user } = context.switchToHttp().getRequest();

    if (!user?.type || !requiredTypes.includes(user.type)) {
      throw new ForbiddenException('无权访问此资源');
    }

    return true;
  }
}
