/**
 * 公开路由装饰器
 *
 * 用于标记不需要认证的路由
 * 被此装饰器标记的路由将跳过 JWT 认证
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() 装饰器
 *
 * 使用示例：
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
