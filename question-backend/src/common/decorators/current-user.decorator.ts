/**
 * 当前用户装饰器
 * 
 * 用于从请求中提取当前登录用户信息
 * 简化控制器中获取用户信息的代码
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  sub: string;      // 用户 ID
  username: string; // 用户名
  role: string;     // 用户角色
}

/**
 * @CurrentUser() 装饰器
 * 
 * 使用示例：
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return this.userService.findById(user.sub);
 * }
 * 
 * // 获取特定属性
 * @Get('my-id')
 * getMyId(@CurrentUser('sub') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // 如果指定了属性名，返回该属性值
    if (data) {
      return user?.[data];
    }

    // 否则返回整个用户对象
    return user;
  },
);
