/**
 * 用户类型装饰器
 *
 * 用于标记路由允许的用户类型（admin / student）
 * 配合 UserTypeGuard 使用
 */
import { SetMetadata } from '@nestjs/common';

export const USER_TYPE_KEY = 'userTypes';

/**
 * @UserType() 装饰器
 *
 * 使用示例：
 * @UserType('admin')       // 仅允许管理端用户
 * @UserType('student')     // 仅允许学生端用户
 * @UserType('admin', 'student') // 两者都允许
 * // 不加则允许所有已认证用户
 */
export const UserType = (...types: ('admin' | 'student')[]) => SetMetadata(USER_TYPE_KEY, types);
