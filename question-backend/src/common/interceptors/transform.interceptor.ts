/**
 * 响应转换拦截器
 *
 * 职责：
 * 1. 统一成功响应格式
 * 2. 添加响应时间记录
 * 3. 包装响应数据
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * 统一成功响应接口
 */
export interface SuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    return next.handle().pipe(
      // 记录响应时间
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.debug(`${request.method} ${request.url} - ${responseTime}ms`);
      }),
      // 转换响应格式
      map((data) => ({
        statusCode: 200,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
