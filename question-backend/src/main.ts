/**
 * 应用入口文件
 *
 * 职责：
 * 1. 创建 NestJS 应用实例
 * 2. 配置全局中间件、管道、过滤器
 * 3. 配置 Swagger API 文档
 * 4. 启动 HTTP 服务器
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule);

  // 获取配置服务
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api';

  // 设置全局 API 前缀
  app.setGlobalPrefix(apiPrefix);

  // 启用 CORS（跨域资源共享）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局验证管道 - 自动验证请求参数
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离非 DTO 定义的属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 禁止非白名单属性
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );

  // 全局异常过滤器 - 统一错误响应格式
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器 - 统一成功响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置 Swagger API 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('题目管理系统 API')
    .setDescription('题目后台管理系统的 RESTful API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT 令牌',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', '管理员认证')
    .addTag('student-auth', '学生端认证')
    .addTag('users', '员工管理')
    .addTag('students', '学生管理')
    .addTag('questions', '题目管理')
    .addTag('categories', '分类管理')
    .addTag('tags', '标签管理')
    .addTag('student-categories', '学生端分类字典')
    .addTag('student-tags', '学生端标签字典')
    .addTag('student-knowledge-points', '学生端知识点字典')
    .addTag('student-upload', '学生端图片上传')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // 启动服务器
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
