/**
 * 根模块 - 应用的入口模块
 *
 * 职责：
 * 1. 导入所有功能模块
 * 2. 配置全局提供者
 * 3. 配置数据库连接
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

// 配置
import configuration from './config/configuration';

// 功能模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StudentModule } from './modules/student/student.module';
import { StudentAuthModule } from './modules/student-auth/student-auth.module';
import { QuestionModule } from './modules/question/question.module';
import { StudentQuestionModule } from './modules/student-question/student-question.module';
import { CategoryModule } from './modules/category/category.module';
import { TagModule } from './modules/tag/tag.module';
import { UploadModule } from './modules/upload/upload.module';

// 守卫
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserTypeGuard } from './common/guards/user-type.guard';

@Module({
  imports: [
    // 配置模块 - 加载环境变量和配置
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用，无需在每个模块导入
      load: [configuration], // 加载配置函数
      envFilePath: ['.env.local', '.env'], // 环境变量文件路径
    }),

    // TypeORM 数据库模块 - 异步配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('nodeEnv') === 'development', // 开发环境自动同步
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 功能模块
    AuthModule,
    UserModule,
    StudentModule,
    StudentAuthModule,
    QuestionModule,
    StudentQuestionModule,
    CategoryModule,
    TagModule,
    UploadModule,
  ],
  providers: [
    // 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局角色守卫
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 全局用户类型守卫
    {
      provide: APP_GUARD,
      useClass: UserTypeGuard,
    },
  ],
})
export class AppModule {}
