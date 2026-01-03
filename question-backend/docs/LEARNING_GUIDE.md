# NestJS 后端开发完整学习指南

## 目录

1. [NestJS 框架核心概念](#1-nestjs-框架核心概念)
2. [项目架构设计](#2-项目架构设计)
3. [模块化开发](#3-模块化开发)
4. [依赖注入原理](#4-依赖注入原理)
5. [TypeORM 数据库操作](#5-typeorm-数据库操作)
6. [DTO 与数据验证](#6-dto-与数据验证)
7. [认证与授权](#7-认证与授权)
8. [异常处理与拦截器](#8-异常处理与拦截器)
9. [Swagger API 文档](#9-swagger-api-文档)
10. [测试策略](#10-测试策略)
11. [最佳实践与技巧](#11-最佳实践与技巧)

---

## 1. NestJS 框架核心概念

### 1.1 什么是 NestJS？

NestJS 是一个用于构建高效、可扩展的 Node.js 服务端应用程序的框架。它使用 TypeScript 构建，结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

**核心特点：**
- 基于 Express/Fastify 构建
- 完全支持 TypeScript
- 模块化架构
- 依赖注入（DI）容器
- 装饰器驱动的开发模式

### 1.2 核心构建块

NestJS 应用由以下核心构建块组成：

```
┌─────────────────────────────────────────────────────────────┐
│                        Module                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Controller  │  │   Service   │  │   Entity    │         │
│  │  (路由处理)  │  │  (业务逻辑)  │  │  (数据模型)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 装饰器（Decorators）

装饰器是 NestJS 的核心特性，用于声明式地定义元数据：

```typescript
// 常用装饰器示例
@Module({})        // 定义模块
@Controller()      // 定义控制器
@Injectable()      // 定义可注入的服务
@Get(), @Post()    // 定义 HTTP 方法
@Body(), @Param()  // 提取请求数据
@UseGuards()       // 应用守卫
@UseInterceptors() // 应用拦截器
```

**装饰器的本质：**
装饰器是一种特殊的声明，可以附加到类、方法、属性或参数上。它们在运行时被调用，接收被装饰的目标作为参数。

```typescript
// 装饰器的底层原理
function Controller(prefix: string) {
  return function (target: Function) {
    // 将路由前缀元数据附加到类上
    Reflect.defineMetadata('path', prefix, target);
  };
}
```

---

## 2. 项目架构设计

### 2.1 目录结构设计原则

```
src/
├── main.ts                    # 应用入口点
├── app.module.ts              # 根模块
├── common/                    # 公共模块（跨模块共享）
│   ├── decorators/           # 自定义装饰器
│   ├── filters/              # 异常过滤器
│   ├── guards/               # 守卫
│   ├── interceptors/         # 拦截器
│   ├── pipes/                # 管道
│   └── dto/                  # 公共 DTO
├── config/                    # 配置模块
├── modules/                   # 业务模块
│   ├── question/             # 题目模块
│   ├── category/             # 分类模块
│   ├── tag/                  # 标签模块
│   ├── auth/                 # 认证模块
│   └── user/                 # 用户模块
└── database/                  # 数据库相关
    ├── migrations/           # 迁移文件
    └── seeds/                # 种子数据
```

**设计原则：**
1. **单一职责**：每个模块只负责一个业务领域
2. **高内聚低耦合**：模块内部紧密相关，模块之间松散耦合
3. **分层架构**：Controller → Service → Repository

### 2.2 请求生命周期

理解 NestJS 的请求处理流程非常重要：

```
客户端请求
    ↓
中间件 (Middleware)
    ↓
守卫 (Guards)
    ↓
拦截器 - 前置 (Interceptors - Before)
    ↓
管道 (Pipes)
    ↓
控制器方法 (Controller Handler)
    ↓
拦截器 - 后置 (Interceptors - After)
    ↓
异常过滤器 (Exception Filters) [如果有异常]
    ↓
响应返回客户端
```

**每个阶段的职责：**

| 阶段 | 职责 | 示例 |
|------|------|------|
| 中间件 | 请求预处理 | 日志记录、CORS |
| 守卫 | 权限验证 | JWT 验证、角色检查 |
| 拦截器 | 请求/响应转换 | 响应格式化、缓存 |
| 管道 | 数据验证/转换 | DTO 验证、类型转换 |
| 过滤器 | 异常处理 | 统一错误响应 |

---

## 3. 模块化开发

### 3.1 模块的定义

模块是 NestJS 组织代码的基本单元：

```typescript
// question.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]), // 注册实体
  ],
  controllers: [QuestionController],       // 注册控制器
  providers: [QuestionService],            // 注册服务
  exports: [QuestionService],              // 导出供其他模块使用
})
export class QuestionModule {}
```

**@Module 装饰器选项：**

| 选项 | 说明 |
|------|------|
| `imports` | 导入其他模块 |
| `controllers` | 该模块的控制器 |
| `providers` | 该模块的服务提供者 |
| `exports` | 导出给其他模块使用的提供者 |

### 3.2 模块间通信

**方式一：导出/导入**

```typescript
// tag.module.ts - 导出 TagService
@Module({
  providers: [TagService],
  exports: [TagService], // 关键：导出服务
})
export class TagModule {}

// question.module.ts - 导入 TagModule
@Module({
  imports: [TagModule], // 导入模块后可使用其导出的服务
  providers: [QuestionService],
})
export class QuestionModule {}

// question.service.ts - 注入 TagService
@Injectable()
export class QuestionService {
  constructor(
    private readonly tagService: TagService, // 可以注入了
  ) {}
}
```

**方式二：全局模块**

```typescript
// database.module.ts
@Global() // 标记为全局模块
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

### 3.3 动态模块

动态模块允许在运行时配置模块：

```typescript
// config.module.ts
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
      global: true,
    };
  }
}

// app.module.ts - 使用动态模块
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

---

## 4. 依赖注入原理

### 4.1 什么是依赖注入？

依赖注入（DI）是一种设计模式，用于实现控制反转（IoC）。对象不自己创建依赖，而是由外部容器注入。

**没有 DI 的代码：**
```typescript
class QuestionService {
  private tagService: TagService;
  
  constructor() {
    // 紧耦合：自己创建依赖
    this.tagService = new TagService();
  }
}
```

**使用 DI 的代码：**
```typescript
@Injectable()
class QuestionService {
  constructor(
    // 松耦合：依赖由容器注入
    private readonly tagService: TagService,
  ) {}
}
```

### 4.2 NestJS DI 容器工作原理

```
1. 扫描所有 @Module 装饰器
2. 收集所有 providers
3. 分析构造函数参数类型
4. 构建依赖图
5. 按正确顺序实例化
6. 注入依赖
```

**Provider 的多种形式：**

```typescript
@Module({
  providers: [
    // 1. 标准形式（类提供者）
    QuestionService,
    
    // 2. 完整形式
    {
      provide: QuestionService,
      useClass: QuestionService,
    },
    
    // 3. 值提供者
    {
      provide: 'API_KEY',
      useValue: 'my-api-key',
    },
    
    // 4. 工厂提供者
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const config = await configService.get('database');
        return createConnection(config);
      },
      inject: [ConfigService], // 工厂函数的依赖
    },
    
    // 5. 别名提供者
    {
      provide: 'AliasService',
      useExisting: QuestionService,
    },
  ],
})
```

### 4.3 作用域

NestJS 支持三种 Provider 作用域：

```typescript
@Injectable({ scope: Scope.DEFAULT })   // 单例（默认）
@Injectable({ scope: Scope.REQUEST })   // 每个请求一个实例
@Injectable({ scope: Scope.TRANSIENT }) // 每次注入一个新实例
```

**选择建议：**
- `DEFAULT`：大多数情况使用，性能最好
- `REQUEST`：需要请求上下文时使用（如多租户）
- `TRANSIENT`：需要独立状态时使用

---

## 5. TypeORM 数据库操作

### 5.1 实体定义

实体是数据库表的 TypeScript 表示：

```typescript
// entities/question.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('questions') // 表名
@Index(['title'])    // 索引
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.SINGLE_CHOICE,
  })
  type: QuestionType;

  // 多对一关系：多个题目属于一个分类
  @ManyToOne(() => Category, category => category.questions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid')
  categoryId: string;

  // 多对多关系：题目和标签
  @ManyToMany(() => Tag, tag => tag.questions)
  @JoinTable({
    name: 'question_tags', // 中间表名
    joinColumn: { name: 'questionId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  // JSON 字段
  @Column('jsonb', { nullable: true })
  options: Option[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.2 关系类型详解

**一对多 / 多对一：**
```typescript
// Category 一对多 Question
@Entity()
export class Category {
  @OneToMany(() => Question, question => question.category)
  questions: Question[];
}

// Question 多对一 Category
@Entity()
export class Question {
  @ManyToOne(() => Category, category => category.questions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
```

**多对多：**
```typescript
// Question 多对多 Tag
@Entity()
export class Question {
  @ManyToMany(() => Tag, tag => tag.questions)
  @JoinTable({ name: 'question_tags' })
  tags: Tag[];
}

@Entity()
export class Tag {
  @ManyToMany(() => Question, question => question.tags)
  questions: Question[];
}
```

**自引用关系（树形结构）：**
```typescript
@Entity()
@Tree('materialized-path') // 物化路径策略
export class Category {
  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];
}
```

### 5.3 Repository 模式

NestJS + TypeORM 使用 Repository 模式进行数据访问：

```typescript
// question.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  // 基本 CRUD 操作
  async findAll(): Promise<Question[]> {
    return this.questionRepository.find();
  }

  async findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne({ where: { id } });
  }

  async create(data: CreateQuestionDto): Promise<Question> {
    const question = this.questionRepository.create(data);
    return this.questionRepository.save(question);
  }

  async update(id: string, data: UpdateQuestionDto): Promise<Question> {
    await this.questionRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
```

### 5.4 复杂查询

**QueryBuilder 使用：**

```typescript
async findWithFilters(query: QueryQuestionDto) {
  const { keyword, categoryId, type, difficulty, tagIds, page, pageSize } = query;

  const qb = this.questionRepository
    .createQueryBuilder('question')
    .leftJoinAndSelect('question.category', 'category')
    .leftJoinAndSelect('question.tags', 'tag');

  // 动态添加条件
  if (keyword) {
    qb.andWhere(
      '(question.title ILIKE :keyword OR question.content ILIKE :keyword)',
      { keyword: `%${keyword}%` },
    );
  }

  if (categoryId) {
    qb.andWhere('question.categoryId = :categoryId', { categoryId });
  }

  if (type) {
    qb.andWhere('question.type = :type', { type });
  }

  if (difficulty) {
    qb.andWhere('question.difficulty = :difficulty', { difficulty });
  }

  if (tagIds?.length) {
    qb.andWhere('tag.id IN (:...tagIds)', { tagIds });
  }

  // 分页
  const [data, total] = await qb
    .orderBy('question.createdAt', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  return { data, total, page, pageSize };
}
```

**事务处理：**

```typescript
async createWithTags(data: CreateQuestionDto): Promise<Question> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 创建题目
    const question = queryRunner.manager.create(Question, data);
    await queryRunner.manager.save(question);

    // 关联标签
    if (data.tagIds?.length) {
      const tags = await queryRunner.manager.findByIds(Tag, data.tagIds);
      question.tags = tags;
      await queryRunner.manager.save(question);
    }

    await queryRunner.commitTransaction();
    return question;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### 5.5 数据库迁移

**创建迁移：**
```bash
# 自动生成迁移（基于实体变化）
npm run typeorm migration:generate -- -n CreateQuestionTable

# 手动创建空迁移
npm run typeorm migration:create -- -n AddIndexToQuestion
```

**迁移文件示例：**
```typescript
// migrations/1234567890-CreateQuestionTable.ts
export class CreateQuestionTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
          },
          // ... 其他列
        ],
      }),
    );

    // 创建索引
    await queryRunner.createIndex(
      'questions',
      new TableIndex({ columnNames: ['title'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('questions');
  }
}
```

---

## 6. DTO 与数据验证

### 6.1 DTO 的作用

DTO（Data Transfer Object）用于：
1. 定义 API 请求/响应的数据结构
2. 数据验证
3. 数据转换
4. API 文档生成

### 6.2 class-validator 验证装饰器

```typescript
// dto/create-question.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  @MaxLength(200, { message: '标题最多200个字符' })
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(QuestionType, { message: '无效的题目类型' })
  type: QuestionType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsUUID('4', { message: '分类ID必须是有效的UUID' })
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true }) // 验证数组中的每个元素
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // 验证嵌套对象
  @Type(() => OptionDto)         // 转换类型
  options?: OptionDto[];

  @IsOptional()
  @IsString()
  explanation?: string;
}

// 嵌套 DTO
export class OptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}
```

### 6.3 常用验证装饰器速查表

| 装饰器 | 说明 | 示例 |
|--------|------|------|
| `@IsString()` | 必须是字符串 | |
| `@IsNumber()` | 必须是数字 | |
| `@IsBoolean()` | 必须是布尔值 | |
| `@IsEnum(enum)` | 必须是枚举值 | `@IsEnum(Status)` |
| `@IsUUID(version)` | 必须是 UUID | `@IsUUID('4')` |
| `@IsEmail()` | 必须是邮箱 | |
| `@IsNotEmpty()` | 不能为空 | |
| `@IsOptional()` | 可选字段 | |
| `@MinLength(n)` | 最小长度 | `@MinLength(6)` |
| `@MaxLength(n)` | 最大长度 | `@MaxLength(100)` |
| `@Min(n)` | 最小值 | `@Min(1)` |
| `@Max(n)` | 最大值 | `@Max(100)` |
| `@IsArray()` | 必须是数组 | |
| `@ArrayMinSize(n)` | 数组最小长度 | |
| `@ValidateNested()` | 验证嵌套对象 | |
| `@Matches(regex)` | 正则匹配 | `@Matches(/^[a-z]+$/)` |

### 6.4 class-transformer 数据转换

```typescript
import { Transform, Exclude, Expose, Type } from 'class-transformer';

export class QueryQuestionDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim()) // 去除空格
  keyword?: string;

  @IsOptional()
  @Type(() => Number)  // 字符串转数字
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value?.split(',')) // 逗号分隔转数组
  @IsArray()
  tagIds?: string[];
}

// 响应 DTO - 排除敏感字段
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Exclude() // 排除密码字段
  password: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString()) // 日期格式化
  createdAt: Date;
}
```

### 6.5 全局验证管道配置

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 自动剥离非 DTO 定义的属性
      forbidNonWhitelisted: true, // 存在非白名单属性时抛出错误
      transform: true,           // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true, // 隐式类型转换
      },
      exceptionFactory: (errors) => {
        // 自定义错误格式
        const messages = errors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          message: 'Validation failed',
          details: messages,
        });
      },
    }),
  );

  await app.listen(3000);
}
```

---

## 7. 认证与授权

### 7.1 JWT 认证流程

```
┌─────────┐     登录请求      ┌─────────┐
│  客户端  │ ───────────────→ │  服务端  │
└─────────┘                   └─────────┘
                                   │
                              验证用户名密码
                                   │
                              生成 JWT Token
                                   │
┌─────────┐     返回 Token    ┌─────────┐
│  客户端  │ ←─────────────── │  服务端  │
└─────────┘                   └─────────┘
     │
  存储 Token
     │
┌─────────┐  携带 Token 请求  ┌─────────┐
│  客户端  │ ───────────────→ │  服务端  │
└─────────┘                   └─────────┘
                                   │
                              验证 Token
                                   │
                              返回受保护资源
```

### 7.2 Passport 策略实现

**Local 策略（用户名密码登录）：**

```typescript
// strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // 指定用户名字段
      passwordField: 'password', // 指定密码字段
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return user; // 返回值会被附加到 request.user
  }
}
```

**JWT 策略（Token 验证）：**

```typescript
// strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;      // 用户 ID
  username: string;
  role: string;
  iat?: number;     // 签发时间
  exp?: number;     // 过期时间
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 从 Authorization: Bearer <token> 提取
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 不忽略过期
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // 返回值会被附加到 request.user
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
```

### 7.3 认证服务实现

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 验证用户
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 登录
  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 注册
  async register(registerDto: RegisterDto) {
    const { password, ...rest } = registerDto;
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.create({
      ...rest,
      password: hashedPassword,
    });

    return this.login(user);
  }

  // 刷新令牌
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 7.4 守卫（Guards）

**JWT 认证守卫：**

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // 公开路由跳过认证
    }

    return super.canActivate(context);
  }
}
```

**角色守卫：**

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../modules/user/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // 没有角色要求，允许访问
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 7.5 自定义装饰器

```typescript
// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/user/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

### 7.6 在控制器中使用

```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // 公开路由
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard) // 使用本地策略验证
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  // 默认需要 JWT 认证
  getProfile(@CurrentUser() user) {
    return user;
  }
}

// question.controller.ts
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard) // 应用守卫
export class QuestionController {
  @Get()
  findAll() {
    // 所有认证用户可访问
  }

  @Post()
  @Roles(UserRole.ADMIN) // 仅管理员可访问
  create(@Body() dto: CreateQuestionDto) {
    // ...
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    // ...
  }
}
```

---

## 8. 异常处理与拦截器

### 8.1 内置异常类

NestJS 提供了丰富的 HTTP 异常类：

```typescript
import {
  BadRequestException,      // 400
  UnauthorizedException,    // 401
  ForbiddenException,       // 403
  NotFoundException,        // 404
  ConflictException,        // 409
  InternalServerErrorException, // 500
} from '@nestjs/common';

// 使用示例
throw new NotFoundException('题目不存在');
throw new BadRequestException('参数验证失败');
throw new ConflictException('标签名称已存在');
```

### 8.2 自定义异常

```typescript
// exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// 使用
throw new BusinessException(
  '分类层级不能超过3级',
  'CATEGORY_LEVEL_EXCEEDED',
);
```

### 8.3 全局异常过滤器

```typescript
// filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // 统一错误响应格式
    const errorResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status],
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 生产环境隐藏堆栈信息
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
```

### 8.4 拦截器（Interceptors）

拦截器可以在请求处理前后执行逻辑：

**响应转换拦截器：**

```typescript
// interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 0,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**日志拦截器：**

```typescript
// interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.log(`← ${method} ${url} ${Date.now() - now}ms`);
        },
        error: (error) => {
          this.logger.error(`← ${method} ${url} ${Date.now() - now}ms - ${error.message}`);
        },
      }),
    );
  }
}
```

**缓存拦截器：**

```typescript
// interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = `${request.method}:${request.url}`;

    // 只缓存 GET 请求
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cached = this.cache.get(key);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(response => {
        this.cache.set(key, response);
        // 5分钟后过期
        setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
      }),
    );
  }
}
```

### 8.5 注册全局过滤器和拦截器

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  await app.listen(3000);
}
```

---

## 9. Swagger API 文档

### 9.1 基础配置

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('题目管理系统 API')
    .setDescription('题目后台管理系统的 RESTful API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '输入 JWT Token',
      },
      'JWT-auth', // 安全方案名称
    )
    .addTag('questions', '题目管理')
    .addTag('categories', '分类管理')
    .addTag('tags', '标签管理')
    .addTag('auth', '用户认证')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持认证状态
    },
  });

  await app.listen(3000);
}
```

### 9.2 控制器装饰器

```typescript
// question.controller.ts
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('questions')
@ApiBearerAuth('JWT-auth') // 需要 JWT 认证
@Controller('questions')
export class QuestionController {
  @Get()
  @ApiOperation({ summary: '获取题目列表', description: '支持分页和多条件筛选' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'type', required: false, enum: QuestionType, description: '题目类型' })
  @ApiQuery({ name: 'difficulty', required: false, enum: DifficultyLevel })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: '成功返回题目列表', type: PaginatedQuestionResponse })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(@Query() query: QueryQuestionDto) {
    return this.questionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  @ApiParam({ name: 'id', description: '题目ID', type: String })
  @ApiResponse({ status: 200, description: '成功返回题目详情', type: Question })
  @ApiResponse({ status: 404, description: '题目不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建题目' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: '创建成功', type: Question })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }
}
```

### 9.3 DTO 装饰器

```typescript
// dto/create-question.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    description: '题目标题',
    example: '以下哪个是 JavaScript 的原始类型？',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '题目内容/题干',
    example: '请选择正确的答案',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '题目类型',
    enum: QuestionType,
    example: QuestionType.SINGLE_CHOICE,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: '难度等级',
    enum: DifficultyLevel,
    example: DifficultyLevel.MEDIUM,
  })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty({
    description: '分类ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: '标签ID列表',
    type: [String],
    example: ['tag-id-1', 'tag-id-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: '选项列表（选择题必填）',
    type: [OptionDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}

// 响应 DTO
export class PaginatedQuestionResponse {
  @ApiProperty({ type: [Question] })
  data: Question[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}
```

### 9.4 实体装饰器

```typescript
// entities/question.entity.ts
import { ApiProperty } from '@nestjs/swagger';

@Entity('questions')
export class Question {
  @ApiProperty({ description: '题目ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '题目标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '题目类型', enum: QuestionType })
  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 10. 测试策略

### 10.1 测试类型概览

| 测试类型 | 目的 | 工具 |
|----------|------|------|
| 单元测试 | 测试单个函数/方法 | Jest |
| 集成测试 | 测试模块间交互 | Jest + Supertest |
| E2E 测试 | 测试完整 API 流程 | Jest + Supertest |
| 属性测试 | 测试通用属性 | fast-check |

### 10.2 单元测试

```typescript
// question.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';

describe('QuestionService', () => {
  let service: QuestionService;
  let repository: Repository<Question>;

  // Mock Repository
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    repository = module.get<Repository<Question>>(getRepositoryToken(Question));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a question when found', async () => {
      const mockQuestion = {
        id: 'test-id',
        title: 'Test Question',
      };
      mockRepository.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findOne('test-id');

      expect(result).toEqual(mockQuestion);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['category', 'tags'],
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a question successfully', async () => {
      const createDto = {
        title: 'New Question',
        content: 'Content',
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        categoryId: 'category-id',
      };
      const mockQuestion = { id: 'new-id', ...createDto };

      mockRepository.create.mockReturnValue(mockQuestion);
      mockRepository.save.mockResolvedValue(mockQuestion);

      const result = await service.create(createDto);

      expect(result).toEqual(mockQuestion);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

### 10.3 E2E 测试

```typescript
// test/question.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('QuestionController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });
    
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/questions (GET)', () => {
    it('should return paginated questions', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('pageSize', 10);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by keyword', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ keyword: 'JavaScript' })
        .expect(200)
        .expect(res => {
          res.body.data.forEach(question => {
            expect(
              question.title.includes('JavaScript') ||
              question.content.includes('JavaScript')
            ).toBe(true);
          });
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .expect(401);
    });
  });

  describe('/questions (POST)', () => {
    it('should create a question', () => {
      const createDto = {
        title: 'E2E Test Question',
        content: 'Test content',
        type: 'single_choice',
        difficulty: 'easy',
        categoryId: 'valid-category-id',
        options: [
          { id: '1', content: 'Option A', isCorrect: true },
          { id: '2', content: 'Option B', isCorrect: false },
        ],
        answer: '1',
      };

      return request(app.getHttpServer())
        .post('/questions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(createDto.title);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/questions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '' }) // 缺少必填字段
        .expect(400);
    });
  });
});
```

### 10.4 属性测试（Property-Based Testing）

```typescript
// question.property.spec.ts
import * as fc from 'fast-check';
import { QuestionService } from './question.service';

describe('QuestionService Property Tests', () => {
  let service: QuestionService;

  // Property 1: 分页数据一致性
  describe('Pagination Consistency', () => {
    it('should return data length <= pageSize', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }), // pageSize
          fc.integer({ min: 1, max: 10 }),  // page
          async (pageSize, page) => {
            const result = await service.findAll({ page, pageSize });
            
            // 返回数据量不超过 pageSize
            expect(result.data.length).toBeLessThanOrEqual(pageSize);
            
            // total 应该是非负整数
            expect(result.total).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(result.total)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Property 2: 筛选结果正确性
  describe('Filter Correctness', () => {
    it('should return only questions matching difficulty filter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('easy', 'medium', 'hard'),
          async (difficulty) => {
            const result = await service.findAll({ 
              difficulty, 
              page: 1, 
              pageSize: 100 
            });
            
            // 所有返回的题目都应该匹配筛选条件
            result.data.forEach(question => {
              expect(question.difficulty).toBe(difficulty);
            });
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  // Property 3: 创建后可查询
  describe('Create-Read Consistency', () => {
    it('should be able to find created question', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }),
            content: fc.string({ minLength: 1 }),
            type: fc.constantFrom('single_choice', 'multiple_choice'),
            difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          }),
          async (questionData) => {
            // 创建题目
            const created = await service.create({
              ...questionData,
              categoryId: 'test-category-id',
            });
            
            // 查询题目
            const found = await service.findOne(created.id);
            
            // 验证数据一致性
            expect(found.title).toBe(questionData.title);
            expect(found.content).toBe(questionData.content);
            expect(found.type).toBe(questionData.type);
            expect(found.difficulty).toBe(questionData.difficulty);
            
            // 清理
            await service.remove(created.id);
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});
```

### 10.5 测试配置

```typescript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

---

## 11. 最佳实践与技巧

### 11.1 代码组织技巧

**1. 使用 barrel 文件简化导入：**

```typescript
// modules/question/dto/index.ts
export * from './create-question.dto';
export * from './update-question.dto';
export * from './query-question.dto';

// 使用时
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
```

**2. 使用路径别名：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}

// 使用
import { JwtAuthGuard } from '@common/guards';
import { QuestionService } from '@modules/question';
```

### 11.2 性能优化技巧

**1. 使用索引优化查询：**

```typescript
@Entity()
@Index(['title'])
@Index(['categoryId', 'difficulty']) // 复合索引
export class Question {
  // ...
}
```

**2. 使用 select 减少数据传输：**

```typescript
// 只查询需要的字段
const questions = await this.questionRepository.find({
  select: ['id', 'title', 'type', 'difficulty'],
  where: { categoryId },
});
```

**3. 使用 QueryBuilder 优化关联查询：**

```typescript
// 避免 N+1 问题
const questions = await this.questionRepository
  .createQueryBuilder('question')
  .leftJoinAndSelect('question.category', 'category')
  .leftJoinAndSelect('question.tags', 'tag')
  .where('question.categoryId = :categoryId', { categoryId })
  .getMany();
```

**4. 使用缓存：**

```typescript
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // 60秒
      max: 100, // 最多100条
    }),
  ],
})
export class AppModule {}

@Controller('questions')
@UseInterceptors(CacheInterceptor)
export class QuestionController {
  @Get()
  @CacheTTL(30) // 30秒缓存
  findAll() {}
}
```

### 11.3 安全最佳实践

**1. 密码安全：**

```typescript
import * as bcrypt from 'bcrypt';

// 加密密码
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// 验证密码
const isMatch = await bcrypt.compare(password, hashedPassword);
```

**2. 防止 SQL 注入：**

```typescript
// ❌ 危险：字符串拼接
const query = `SELECT * FROM users WHERE name = '${name}'`;

// ✅ 安全：参数化查询
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.name = :name', { name })
  .getMany();
```

**3. 输入验证和清理：**

```typescript
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export class CreateQuestionDto {
  @Transform(({ value }) => sanitizeHtml(value)) // XSS 防护
  @IsString()
  content: string;
}
```

**4. 速率限制：**

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,    // 时间窗口（秒）
      limit: 100, // 最大请求数
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 11.4 错误处理技巧

**1. 使用自定义业务异常：**

```typescript
// exceptions/category.exception.ts
export class CategoryLevelExceededException extends BadRequestException {
  constructor() {
    super({
      message: '分类层级不能超过3级',
      errorCode: 'CATEGORY_LEVEL_EXCEEDED',
    });
  }
}

export class CategoryHasQuestionsException extends BadRequestException {
  constructor(count: number) {
    super({
      message: `该分类下有 ${count} 道题目，请先处理相关题目`,
      errorCode: 'CATEGORY_HAS_QUESTIONS',
    });
  }
}

// 使用
if (category.level >= 3) {
  throw new CategoryLevelExceededException();
}
```

**2. 统一错误码管理：**

```typescript
// constants/error-codes.ts
export const ErrorCodes = {
  // 通用错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // 业务错误
  CATEGORY_LEVEL_EXCEEDED: 'CATEGORY_LEVEL_EXCEEDED',
  CATEGORY_HAS_QUESTIONS: 'CATEGORY_HAS_QUESTIONS',
  TAG_NAME_DUPLICATE: 'TAG_NAME_DUPLICATE',
} as const;
```

### 11.5 日志最佳实践

```typescript
// 使用 NestJS 内置 Logger
import { Logger } from '@nestjs/common';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);

  async create(dto: CreateQuestionDto) {
    this.logger.log(`Creating question: ${dto.title}`);
    
    try {
      const question = await this.questionRepository.save(dto);
      this.logger.log(`Question created: ${question.id}`);
      return question;
    } catch (error) {
      this.logger.error(`Failed to create question: ${error.message}`, error.stack);
      throw error;
    }
  }
}

// 配置日志级别
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

### 11.6 配置管理技巧

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});

// 使用配置
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return this.configService.get<number>('port');
  }

  getDatabaseConfig() {
    return this.configService.get('database');
  }
}

// 配置验证
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 总结

### 核心要点回顾

1. **模块化设计**：每个功能域一个模块，高内聚低耦合
2. **依赖注入**：使用 DI 容器管理依赖，提高可测试性
3. **装饰器驱动**：声明式编程，代码更清晰
4. **分层架构**：Controller → Service → Repository
5. **数据验证**：使用 DTO + class-validator 确保数据安全
6. **统一异常处理**：全局过滤器统一错误响应
7. **认证授权**：JWT + Guards 实现安全访问控制
8. **API 文档**：Swagger 自动生成交互式文档
9. **测试覆盖**：单元测试 + E2E 测试 + 属性测试

### 学习路径建议

1. 先理解 NestJS 核心概念（模块、控制器、服务）
2. 掌握 TypeORM 实体定义和关系映射
3. 学习 DTO 验证和数据转换
4. 实现认证授权流程
5. 添加异常处理和拦截器
6. 配置 Swagger 文档
7. 编写测试用例

### 推荐资源

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 官方文档](https://typeorm.io/)
- [class-validator 文档](https://github.com/typestack/class-validator)
- [Passport.js 文档](http://www.passportjs.org/)
