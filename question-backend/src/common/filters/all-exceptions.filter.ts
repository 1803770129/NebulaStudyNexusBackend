/**
 * 全局异常过滤器
 * 
 * 职责：
 * 1. 捕获所有未处理的异常
 * 2. 统一错误响应格式
 * 3. 记录错误日志
 * 4. 生产环境隐藏敏感信息
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 统一错误响应接口
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 确定 HTTP 状态码
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let error = 'Internal Server Error';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        error = (responseObj.error as string) || HttpStatus[status];
        details = responseObj.details as Record<string, unknown>;

        // 处理 class-validator 的验证错误
        if (Array.isArray(responseObj.message)) {
          message = '请求参数验证失败';
          details = { validationErrors: responseObj.message };
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // 生产环境不暴露错误堆栈
      if (process.env.NODE_ENV === 'development') {
        details = { stack: exception.stack };
      }
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // 构建错误响应
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: error || HttpStatus[status],
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
