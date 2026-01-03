# NestJS 后端项目深度解析文档

> 本文档按照项目搭建开发的顺序，从函数颗粒度对每个文件进行详细分析，涵盖设计思想、知识点、技巧和关键代码解析。

## 目录

1. [项目概述与技术栈](#1-项目概述与技术栈)
2. [项目配置层](#2-项目配置层)
3. [应用入口与根模块](#3-应用入口与根模块)
4. [通用模块（Common）](#4-通用模块common)
5. [数据库层](#5-数据库层)
6. [用户模块（User）](#6-用户模块user)
7. [认证模块（Auth）](#7-认证模块auth)
8. [分类模块（Category）](#8-分类模块category)
9. [标签模块（Tag）](#9-标签模块tag)
10. [题目模块（Question）](#10-题目模块question)

---

## 1. 项目概述与技术栈

### 1.1 项目简介

这是一个基于 NestJS 框架构建的题目后台管理系统后端服务，采用 TypeORM 作为 ORM 框架，PostgreSQL 作为数据库。

### 1.2 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | ^10.0.0 | 后端框架 |
| TypeORM | ^0.3.17 | ORM 框架 |
| PostgreSQL | - | 关系型数据库 |
| Passport | ^0.7.0 | 认证中间件 |
| JWT | ^10.2.0 | 令牌认证 |
| class-validator | ^0.14.0 | 数据验证 |
| class-transformer | ^0.5.1 | 数据转换 |
| Swagger | ^7.1.17 | API 文档 |

### 1.3 项目架构图


```
question-backend/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── app.module.ts           # 根模块
│   ├── config/                 # 配置层
│   ├── common/                 # 通用模块
│   │   ├── decorators/         # 自定义装饰器
│   │   ├── dto/                # 通用 DTO
│   │   ├── filters/            # 异常过滤器
│   │   ├── guards/             # 守卫
│   │   └── interceptors/       # 拦截器
│   ├── database/               # 数据库层
│   └── modules/                # 业务模块
│       ├── auth/               # 认证模块
│       ├── user/               # 用户模块
│       ├── question/           # 题目模块
│       ├── category/           # 分类模块
│       └── tag/                # 标签模块
```

---

## 2. 项目配置层

### 2.1 package.json - 项目依赖配置

#### 核心脚本命令解析

```json
{
  "scripts": {
    "start:dev": "nest start --watch",      // 开发模式，热重载
    "start:prod": "node dist/main",         // 生产模式
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/data-source.ts",
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/index.ts"
  }
}
```

**知识点**：
- `--watch` 参数启用文件监听，代码变更自动重启
- `-r tsconfig-paths/register` 注册路径别名，支持 `@/` 导入
- TypeORM CLI 命令用于数据库迁移管理

#### 依赖分类

**核心框架依赖**：
- `@nestjs/core`, `@nestjs/common`: NestJS 核心
- `@nestjs/platform-express`: Express 适配器

**数据库相关**：
- `typeorm`: ORM 框架
- `@nestjs/typeorm`: NestJS TypeORM 集成
- `pg`: PostgreSQL 驱动

**认证相关**：
- `passport`, `passport-jwt`, `passport-local`: 认证策略
- `@nestjs/jwt`: JWT 支持
- `bcrypt`: 密码加密

**验证与转换**：
- `class-validator`: 装饰器验证
- `class-transformer`: 对象转换


### 2.2 tsconfig.json - TypeScript 配置

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,      // 发射装饰器元数据（NestJS 依赖注入必需）
    "experimentalDecorators": true,      // 启用装饰器语法
    "paths": {
      "@/*": ["src/*"]                   // 路径别名配置
    }
  }
}
```

**关键配置解析**：

| 配置项 | 值 | 作用 |
|--------|-----|------|
| `emitDecoratorMetadata` | true | 生成装饰器元数据，DI 容器需要 |
| `experimentalDecorators` | true | 启用 TypeScript 装饰器 |
| `strictNullChecks` | false | 关闭严格空检查（简化开发） |
| `esModuleInterop` | true | 允许 CommonJS/ES 模块互操作 |

### 2.3 .env.example - 环境变量模板

```bash
# 应用配置
NODE_ENV=development
PORT=3003
API_PREFIX=api

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=question_manager

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**安全技巧**：
- 生产环境必须更换 `JWT_SECRET`
- 使用 `.env.local` 覆盖本地配置
- 敏感信息不要提交到版本控制

### 2.4 configuration.ts - 配置工厂函数

**文件路径**: `src/config/configuration.ts`

```typescript
export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    // ...
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
```

**设计思想**：
- **工厂函数模式**：返回配置对象，支持动态计算
- **默认值兜底**：每个配置都有默认值，防止启动失败
- **类型转换**：`parseInt` 确保端口号为数字类型
- **结构化配置**：按功能分组（database、jwt），便于管理


---

## 3. 应用入口与根模块

### 3.1 main.ts - 应用入口文件

**文件路径**: `src/main.ts`

这是整个应用的启动入口，负责创建应用实例并配置全局中间件。

#### 函数解析：bootstrap()

```typescript
async function bootstrap() {
  // 1. 创建应用实例
  const app = await NestFactory.create(AppModule);
  
  // 2. 获取配置服务
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  
  // 3. 设置全局 API 前缀
  app.setGlobalPrefix(apiPrefix);
  
  // 4. 启用 CORS
  app.enableCors({ origin: true, credentials: true });
  
  // 5. 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // 剥离非 DTO 属性
    transform: true,           // 自动类型转换
    forbidNonWhitelisted: true // 禁止非白名单属性
  }));
  
  // 6. 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // 7. 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 8. 配置 Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('题目管理系统 API')
    .addBearerAuth(/* JWT 配置 */)
    .build();
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // 9. 启动服务器
  await app.listen(port);
}
```

**关键知识点**：

1. **NestFactory.create()**: 创建 NestJS 应用实例，接收根模块作为参数

2. **ValidationPipe 配置详解**：
   - `whitelist: true` - 自动移除 DTO 中未定义的属性，防止注入攻击
   - `transform: true` - 自动将请求参数转换为 DTO 实例
   - `forbidNonWhitelisted: true` - 如果请求包含未定义属性，直接报错
   - `enableImplicitConversion: true` - 启用隐式类型转换（字符串转数字等）

3. **CORS 配置**：
   - `origin: true` - 允许所有来源（开发环境）
   - `credentials: true` - 允许携带 Cookie

4. **Swagger 配置技巧**：
   - `addBearerAuth()` - 添加 JWT 认证支持
   - `addTag()` - 为 API 分组


### 3.2 app.module.ts - 根模块

**文件路径**: `src/app.module.ts`

根模块是应用的入口模块，负责组装所有功能模块。

```typescript
@Module({
  imports: [
    // 1. 配置模块 - 全局可用
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // 2. TypeORM 数据库模块 - 异步配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 3. 功能模块
    AuthModule,
    UserModule,
    QuestionModule,
    CategoryModule,
    TagModule,
  ],
  providers: [
    // 4. 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

**核心概念解析**：

#### 3.2.1 ConfigModule.forRoot() - 配置模块

| 配置项 | 作用 |
|--------|------|
| `isGlobal: true` | 全局注册，无需在每个模块导入 |
| `load: [configuration]` | 加载配置工厂函数 |
| `envFilePath` | 环境变量文件路径，按顺序加载 |

#### 3.2.2 TypeOrmModule.forRootAsync() - 异步数据库配置

**为什么使用异步配置？**
- 需要注入 `ConfigService` 获取配置
- 配置值在运行时才能确定

**关键配置**：
- `entities`: 实体文件路径，使用 glob 模式自动扫描
- `synchronize`: 开发环境自动同步数据库结构（生产环境必须关闭！）
- `logging`: 开发环境打印 SQL 日志

#### 3.2.3 APP_GUARD - 全局守卫注册

```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

**技巧**：使用 `APP_GUARD` 令牌注册全局守卫，所有路由默认需要认证，配合 `@Public()` 装饰器标记公开路由。


---

## 4. 通用模块（Common）

通用模块包含可复用的装饰器、DTO、过滤器、守卫和拦截器。

### 4.1 异常过滤器 - all-exceptions.filter.ts

**文件路径**: `src/common/filters/all-exceptions.filter.ts`

#### 设计目的
统一所有异常的响应格式，提供一致的错误处理体验。

#### 核心代码解析

```typescript
@Catch()  // 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. 确定状态码和错误信息
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // 处理 class-validator 验证错误
      if (Array.isArray(responseObj.message)) {
        message = '请求参数验证失败';
        details = { validationErrors: responseObj.message };
      }
    }

    // 2. 记录错误日志
    this.logger.error(`${request.method} ${request.url} - ${status}`);

    // 3. 返回统一格式
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**知识点**：

1. **@Catch() 装饰器**：不传参数表示捕获所有异常类型

2. **ArgumentsHost**：执行上下文，可切换到 HTTP/WebSocket/RPC 上下文

3. **异常类型判断**：
   - `HttpException`: NestJS 内置 HTTP 异常
   - `Error`: 普通 JavaScript 错误
   - 其他: 未知异常

4. **安全技巧**：生产环境不暴露错误堆栈
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     details = { stack: exception.stack };
   }
   ```


### 4.2 响应拦截器 - transform.interceptor.ts

**文件路径**: `src/common/interceptors/transform.interceptor.ts`

#### 设计目的
统一成功响应格式，添加响应时间记录。

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    return next.handle().pipe(
      // 1. 记录响应时间
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.debug(`${request.method} ${request.url} - ${responseTime}ms`);
      }),
      // 2. 转换响应格式
      map((data) => ({
        statusCode: 200,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**RxJS 操作符解析**：

| 操作符 | 作用 |
|--------|------|
| `tap()` | 副作用操作，不修改数据流（记录日志） |
| `map()` | 转换数据流（包装响应格式） |

**拦截器执行流程**：
```
请求 → 拦截器前置逻辑 → 控制器 → 拦截器后置逻辑 → 响应
```

### 4.3 分页 DTO - pagination-query.dto.ts

**文件路径**: `src/common/dto/pagination-query.dto.ts`

```typescript
export class PaginationQueryDto {
  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @Type(() => Number)      // 字符串转数字
  @IsInt()                 // 必须是整数
  @Min(1)                  // 最小值 1
  @IsOptional()            // 可选参数
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)                // 限制最大值，防止查询过多数据
  @IsOptional()
  pageSize?: number = 10;
}
```

**设计技巧**：

1. **@Type(() => Number)**: Query 参数默认是字符串，需要转换
2. **默认值**: 使用 `= 1` 设置默认值
3. **范围限制**: `@Max(100)` 防止一次查询过多数据
4. **继承复用**: 其他查询 DTO 可以继承此类


### 4.4 自定义装饰器

#### 4.4.1 @CurrentUser() - 当前用户装饰器

**文件路径**: `src/common/decorators/current-user.decorator.ts`

```typescript
export interface JwtPayload {
  sub: string;      // 用户 ID
  username: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // 如果指定了属性名，返回该属性值
    if (data) {
      return user?.[data];
    }
    return user;
  },
);
```

**使用示例**：
```typescript
// 获取完整用户信息
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) { }

// 只获取用户 ID
@Get('my-id')
getMyId(@CurrentUser('sub') userId: string) { }
```

**设计思想**：
- 简化控制器代码，避免重复的 `request.user` 访问
- 支持获取完整对象或单个属性
- 类型安全，通过泛型约束属性名

#### 4.4.2 @Public() - 公开路由装饰器

**文件路径**: `src/common/decorators/public.decorator.ts`

```typescript
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**原理**：使用 `SetMetadata` 在路由上设置元数据，守卫通过 `Reflector` 读取。

#### 4.4.3 @Roles() - 角色装饰器

**文件路径**: `src/common/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

**使用示例**：
```typescript
@Roles(UserRole.ADMIN)
@Delete(':id')
remove(@Param('id') id: string) { }
```

### 4.5 角色守卫 - roles.guard.ts

**文件路径**: `src/common/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 获取路由所需角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),  // 方法级元数据
      context.getClass(),    // 类级元数据
    ]);

    // 2. 无角色要求，允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. 检查用户角色
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
```

**Reflector 方法解析**：
- `getAllAndOverride()`: 获取元数据，方法级优先于类级
- `getAllAndMerge()`: 合并方法级和类级元数据


---

## 5. 数据库层

### 5.1 data-source.ts - TypeORM 数据源配置

**文件路径**: `src/database/data-source.ts`

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,  // CLI 模式下必须关闭
  logging: true,
});
```

**用途**：
- 供 TypeORM CLI 使用（迁移命令）
- 独立于 NestJS 应用运行

**与 app.module.ts 配置的区别**：
| 配置位置 | 用途 | synchronize |
|----------|------|-------------|
| app.module.ts | 应用运行时 | 开发环境可开启 |
| data-source.ts | CLI 命令 | 必须关闭 |

### 5.2 seeds/index.ts - 种子数据

**文件路径**: `src/database/seeds/index.ts`

```typescript
async function seed() {
  // 1. 初始化数据源
  await AppDataSource.initialize();

  // 2. 获取仓库
  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);

  // 3. 清空数据（按依赖顺序）
  await questionRepo.delete({});
  await tagRepo.delete({});
  await categoryRepo.delete({});
  await userRepo.delete({});

  // 4. 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepo.create({
    username: 'admin',
    email: 'admin@example.com',
    password: adminPassword,
    role: UserRole.ADMIN,
  });
  await userRepo.save(admin);

  // 5. 创建分类（树形结构）
  const mathCategory = categoryRepo.create({
    name: '数学',
    level: 1,
    path: '',
  });
  await categoryRepo.save(mathCategory);

  const algebraCategory = categoryRepo.create({
    name: '代数',
    parentId: mathCategory.id,
    level: 2,
    path: mathCategory.id,  // 路径记录父级 ID
  });
  await categoryRepo.save(algebraCategory);

  // 6. 关闭连接
  await AppDataSource.destroy();
}
```

**关键技巧**：

1. **删除顺序**：先删除有外键依赖的表（questions → tags → categories → users）

2. **树形结构处理**：
   - `level`: 记录层级深度
   - `path`: 记录祖先路径，便于查询子孙节点

3. **密码加密**：使用 bcrypt 加密，salt rounds = 10


---

## 6. 用户模块（User）

用户模块是基础模块，提供用户实体和基本的用户管理功能。

### 6.1 user.entity.ts - 用户实体

**文件路径**: `src/modules/user/entities/user.entity.ts`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  @Exclude()  // 序列化时排除密码
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 密码加密钩子
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // 只有当密码被修改时才加密（避免重复加密）
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * 验证密码
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
```

**TypeORM 装饰器详解**：

| 装饰器 | 作用 |
|--------|------|
| `@Entity('users')` | 定义实体，映射到 users 表 |
| `@PrimaryGeneratedColumn('uuid')` | UUID 主键，自动生成 |
| `@Column({ unique: true })` | 唯一约束 |
| `@CreateDateColumn()` | 自动填充创建时间 |
| `@UpdateDateColumn()` | 自动更新修改时间 |
| `@BeforeInsert()` | 插入前钩子 |
| `@BeforeUpdate()` | 更新前钩子 |

**安全技巧**：

1. **@Exclude() 装饰器**：配合 `class-transformer` 使用，序列化时自动排除密码字段

2. **密码加密判断**：`!this.password.startsWith('$2b$')` 检查是否已加密，避免重复加密

3. **bcrypt 参数**：salt rounds = 10 是安全性和性能的平衡点


### 6.2 user.service.ts - 用户服务

**文件路径**: `src/modules/user/user.service.ts`

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 2. 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 3. 创建并保存用户
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
}
```

**Repository 方法解析**：

| 方法 | 作用 | 返回值 |
|------|------|--------|
| `create()` | 创建实体实例（不保存） | Entity |
| `save()` | 保存实体到数据库 | Entity |
| `findOne()` | 查找单个实体 | Entity \| null |
| `find()` | 查找多个实体 | Entity[] |

**异常处理模式**：
- `ConflictException` (409): 资源冲突（重复）
- `NotFoundException` (404): 资源不存在

### 6.3 user.module.ts - 用户模块

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // 注册实体
  providers: [UserService],
  exports: [UserService],  // 导出服务供其他模块使用
})
export class UserModule {}
```

**模块设计原则**：
- `imports`: 导入依赖模块
- `providers`: 注册服务
- `exports`: 导出供其他模块使用的服务


---

## 7. 认证模块（Auth）

认证模块实现 JWT 认证和本地登录策略。

### 7.1 auth.module.ts - 认证模块配置

```typescript
@Module({
  imports: [
    UserModule,  // 依赖用户模块
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**JwtModule 配置**：
- `secret`: JWT 签名密钥
- `expiresIn`: 令牌过期时间

### 7.2 local.strategy.ts - 本地认证策略

**文件路径**: `src/modules/auth/strategies/local.strategy.ts`

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',  // 指定用户名字段
      passwordField: 'password',  // 指定密码字段
    });
  }

  /**
   * 验证用户凭证
   * Passport 自动调用此方法
   */
  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return user;  // 返回值会被附加到 request.user
  }
}
```

**Passport 策略工作流程**：
1. 请求到达 `LocalAuthGuard` 保护的路由
2. Guard 触发 `LocalStrategy.validate()`
3. 验证成功，用户对象附加到 `request.user`
4. 验证失败，抛出 `UnauthorizedException`

### 7.3 jwt.strategy.ts - JWT 认证策略

**文件路径**: `src/modules/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      // 从 Authorization Bearer 头提取令牌
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,  // 不忽略过期时间
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * 验证 JWT payload
   */
  async validate(payload: JwtPayload) {
    // 可选：验证用户是否仍然存在
    try {
      await this.userService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
```

**JWT 提取方式**：
- `fromAuthHeaderAsBearerToken()`: 从 `Authorization: Bearer <token>` 提取
- `fromBodyField('token')`: 从请求体提取
- `fromUrlQueryParameter('token')`: 从 URL 参数提取


### 7.4 auth.service.ts - 认证服务

**文件路径**: `src/modules/auth/auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 验证用户凭证
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.userService.create(registerDto);
    return this.generateTokens(user);
  }

  /**
   * 用户登录
   */
  async login(user: User): Promise<LoginResponse> {
    return this.generateTokens(user);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // 获取用户信息并生成新令牌
      const user = await this.userService.findById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private generateTokens(user: User): LoginResponse {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

**双令牌机制**：

| 令牌类型 | 有效期 | 用途 |
|----------|--------|------|
| accessToken | 1h | API 请求认证 |
| refreshToken | 7d | 刷新 accessToken |

**安全优势**：
- accessToken 短期有效，泄露风险低
- refreshToken 长期有效，减少登录频率
- 刷新时可以检查用户状态（是否被禁用）


### 7.5 jwt-auth.guard.ts - JWT 认证守卫

**文件路径**: `src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
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

    // 公开路由跳过认证
    if (isPublic) {
      return true;
    }

    // 执行 JWT 认证
    return super.canActivate(context);
  }
}
```

**设计技巧**：
- 继承 `AuthGuard('jwt')` 复用 Passport JWT 策略
- 通过 `Reflector` 读取 `@Public()` 元数据
- 公开路由直接放行，其他路由执行 JWT 验证

### 7.6 auth.controller.ts - 认证控制器

**文件路径**: `src/modules/auth/auth.controller.ts`

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()  // 公开路由
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)  // 使用本地认证守卫
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() _loginDto: LoginDto, @Request() req: { user: any }) {
    // LocalAuthGuard 验证成功后，用户信息在 req.user
    return this.authService.login(req.user);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')  // Swagger 显示需要认证
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
```

**控制器设计要点**：

1. **@Public() 装饰器**：标记不需要认证的路由

2. **@UseGuards(LocalAuthGuard)**：登录接口使用本地认证守卫

3. **@ApiBearerAuth('JWT-auth')**：Swagger 文档显示需要 JWT 认证

4. **参数获取**：
   - `@Body()`: 请求体
   - `@Request()`: 完整请求对象
   - `@CurrentUser()`: 自定义装饰器获取用户


---

## 8. 分类模块（Category）

分类模块实现树形结构的分类管理，支持最多三级分类。

### 8.1 category.entity.ts - 分类实体

**文件路径**: `src/modules/category/entities/category.entity.ts`

```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  // 自关联：父分类
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',  // 父分类删除时，子分类的 parentId 设为 null
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  // 自关联：子分类
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ default: 1 })
  level: number;  // 层级深度

  @Column({ default: '' })
  path: string;   // 祖先路径

  @Column({ default: 0 })
  questionCount: number;  // 题目数量（冗余字段）

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**树形结构设计**：

| 字段 | 作用 | 示例 |
|------|------|------|
| `parentId` | 父节点 ID | `uuid-of-parent` |
| `level` | 层级深度 | 1, 2, 3 |
| `path` | 祖先路径 | `grandparent-id/parent-id` |

**自关联关系**：
- `@ManyToOne`: 多个子分类对应一个父分类
- `@OneToMany`: 一个父分类对应多个子分类
- `onDelete: 'SET NULL'`: 级联删除策略

**冗余字段设计**：
- `questionCount`: 避免每次查询都 COUNT，提高性能
- 需要在题目增删时同步更新


### 8.2 category.service.ts - 分类服务

**文件路径**: `src/modules/category/category.service.ts`

#### 8.2.1 create() - 创建分类

```typescript
async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
  const { name, parentId } = createCategoryDto;

  // 1. 检查同级分类名称是否重复
  const existingCategory = await this.categoryRepository.findOne({
    where: { name, parentId: parentId || null },
  });
  if (existingCategory) {
    throw new ConflictException('同级分类名称已存在');
  }

  let level = 1;
  let path = '';

  // 2. 如果有父分类，验证层级
  if (parentId) {
    const parent = await this.findById(parentId);
    if (parent.level >= this.MAX_LEVEL) {
      throw new BadRequestException(`分类层级不能超过${this.MAX_LEVEL}级`);
    }
    level = parent.level + 1;
    path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
  }

  // 3. 创建并保存
  const category = this.categoryRepository.create({
    name,
    parentId: parentId || null,
    level,
    path,
  });

  return this.categoryRepository.save(category);
}
```

**业务规则**：
- 同级分类名称不能重复
- 最多支持三级分类
- 自动计算 level 和 path

#### 8.2.2 findTree() - 获取分类树

```typescript
async findTree(): Promise<CategoryTreeNode[]> {
  const categories = await this.categoryRepository.find({
    order: { level: 'ASC', createdAt: 'ASC' },
  });

  return this.buildTree(categories);
}

/**
 * 构建分类树
 */
private buildTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // 1. 创建节点映射
  categories.forEach((category) => {
    map.set(category.id, {
      id: category.id,
      name: category.name,
      level: category.level,
      path: category.path,
      questionCount: category.questionCount,
      children: [],
    });
  });

  // 2. 构建树结构
  categories.forEach((category) => {
    const node = map.get(category.id)!;
    if (category.parentId) {
      const parent = map.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

**算法思路**：
1. 一次查询获取所有分类
2. 使用 Map 建立 id → node 映射
3. 遍历分类，将子节点添加到父节点的 children 数组
4. 返回根节点数组

**时间复杂度**：O(n)，只需遍历两次


#### 8.2.3 update() - 更新分类

```typescript
async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
  const category = await this.findById(id);
  const { name, parentId } = updateCategoryDto;

  // 1. 检查名称是否与同级其他分类重复
  if (name && name !== category.name) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name, parentId: parentId ?? category.parentId },
    });
    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException('同级分类名称已存在');
    }
  }

  // 2. 如果更改父分类，验证层级
  if (parentId !== undefined && parentId !== category.parentId) {
    // 不能将分类设为自己的子分类
    if (parentId === id) {
      throw new BadRequestException('不能将分类设为自己的子分类');
    }

    if (parentId) {
      const parent = await this.findById(parentId);
      if (parent.level >= this.MAX_LEVEL) {
        throw new BadRequestException(`分类层级不能超过${this.MAX_LEVEL}级`);
      }
      category.level = parent.level + 1;
      category.path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
    } else {
      category.level = 1;
      category.path = '';
    }
    category.parentId = parentId;
  }

  if (name) {
    category.name = name;
  }

  return this.categoryRepository.save(category);
}
```

**边界条件处理**：
- 防止循环引用（自己设为自己的子分类）
- 更改父分类时重新计算 level 和 path

#### 8.2.4 remove() - 删除分类

```typescript
async remove(id: string): Promise<void> {
  const category = await this.findById(id);

  // 1. 检查是否有子分类
  const childCount = await this.categoryRepository.count({
    where: { parentId: id },
  });
  if (childCount > 0) {
    throw new BadRequestException('请先删除子分类');
  }

  // 2. 检查是否有关联题目
  if (category.questionCount > 0) {
    throw new BadRequestException('该分类下有题目，请先处理相关题目');
  }

  await this.categoryRepository.remove(category);
}
```

**删除保护**：
- 有子分类时不能删除
- 有关联题目时不能删除

#### 8.2.5 updateQuestionCount() - 更新题目数量

```typescript
async updateQuestionCount(id: string, delta: number): Promise<void> {
  await this.categoryRepository.increment({ id }, 'questionCount', delta);
}
```

**技巧**：使用 `increment()` 方法原子性地增减计数，避免并发问题。


### 8.3 category.controller.ts - 分类控制器

```typescript
@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树' })
  findTree() {
    return this.categoryService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分类' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
```

**RESTful API 设计**：

| 方法 | 路径 | 作用 |
|------|------|------|
| POST | /categories | 创建分类 |
| GET | /categories | 获取列表 |
| GET | /categories/tree | 获取树形结构 |
| GET | /categories/:id | 获取详情 |
| PATCH | /categories/:id | 更新分类 |
| DELETE | /categories/:id | 删除分类 |

**ParseUUIDPipe**：自动验证 UUID 格式，无效时返回 400 错误。

---

## 9. 标签模块（Tag）

标签模块实现扁平化的标签管理。

### 9.1 tag.entity.ts - 标签实体

```typescript
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 7, default: '#1890ff' })
  color: string;  // 十六进制颜色

  @Column({ default: 0 })
  questionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**设计特点**：
- 标签名称全局唯一
- 支持自定义颜色
- 冗余存储题目数量


### 9.2 tag.service.ts - 标签服务

```typescript
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 根据 ID 列表查找标签
   */
  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.tagRepository.find({
      where: { id: In(ids) },  // 使用 In 操作符
    });
  }

  /**
   * 批量更新标签题目数量
   */
  async updateQuestionCounts(ids: string[], delta: number): Promise<void> {
    if (ids.length === 0) return;
    await this.tagRepository
      .createQueryBuilder()
      .update(Tag)
      .set({ questionCount: () => `"questionCount" + ${delta}` })
      .whereInIds(ids)
      .execute();
  }
}
```

**TypeORM 高级用法**：

1. **In 操作符**：`where: { id: In(ids) }` 生成 `WHERE id IN (...)`

2. **QueryBuilder 批量更新**：
   ```typescript
   .set({ questionCount: () => `"questionCount" + ${delta}` })
   ```
   使用原始 SQL 表达式实现原子性增减

### 9.3 create-tag.dto.ts - 创建标签 DTO

```typescript
export class CreateTagDto {
  @ApiProperty({ description: '标签名称', example: '重点' })
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  @MaxLength(50, { message: '标签名称不能超过50个字符' })
  name: string;

  @ApiPropertyOptional({ description: '标签颜色（十六进制）', example: '#1890ff' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色格式不正确，应为十六进制格式如 #1890ff' })
  @IsOptional()
  color?: string;
}
```

**验证装饰器**：
- `@Matches()`: 正则表达式验证，确保颜色格式正确
- `@MaxLength()`: 限制字符串长度


---

## 10. 题目模块（Question）

题目模块是核心业务模块，实现题目的 CRUD 和复杂查询。

### 10.1 question.entity.ts - 题目实体

```typescript
/**
 * 选项接口
 */
export interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
}

@Entity('questions')
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
  })
  type: QuestionType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty: DifficultyLevel;

  // 多对一：题目 → 分类
  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  // 多对多：题目 ↔ 标签
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'question_tags',  // 中间表名
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column('jsonb', { nullable: true })
  options: Option[];  // 选择题选项

  @Column('jsonb')
  answer: string | string[];  // 答案（支持多选）

  @Column('text', { nullable: true })
  explanation: string;  // 答案解析

  // 多对一：题目 → 创建者
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'uuid' })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**关系映射详解**：

| 关系类型 | 装饰器 | 说明 |
|----------|--------|------|
| 多对一 | `@ManyToOne` | 多个题目属于一个分类 |
| 多对多 | `@ManyToMany` | 题目和标签多对多关系 |
| 中间表 | `@JoinTable` | 定义多对多中间表结构 |

**JSONB 字段**：
- PostgreSQL 特有类型，支持 JSON 查询
- 用于存储选项和答案等结构化数据


### 10.2 question.service.ts - 题目服务

#### 10.2.1 create() - 创建题目

```typescript
async create(createQuestionDto: CreateQuestionDto, creatorId: string): Promise<Question> {
  const { tagIds, categoryId, ...questionData } = createQuestionDto;

  // 1. 验证分类存在
  await this.categoryService.findById(categoryId);

  // 2. 获取标签实体
  const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

  // 3. 创建题目
  const question = this.questionRepository.create({
    ...questionData,
    categoryId,
    tags,
    creatorId,
  });

  const savedQuestion = await this.questionRepository.save(question);

  // 4. 更新分类和标签的题目数量
  await this.categoryService.updateQuestionCount(categoryId, 1);
  if (tagIds && tagIds.length > 0) {
    await this.tagService.updateQuestionCounts(tagIds, 1);
  }

  return savedQuestion;
}
```

**设计要点**：
- 解构 DTO，分离关联 ID 和普通字段
- 先验证关联实体存在
- 保存后更新冗余计数

#### 10.2.2 findAll() - 分页查询

```typescript
async findAll(queryDto: QueryQuestionDto): Promise<PaginationResponseDto<Question>> {
  const { page = 1, pageSize = 10, keyword, categoryId, type, difficulty, tagIds } = queryDto;

  const queryBuilder = this.questionRepository
    .createQueryBuilder('question')
    .leftJoinAndSelect('question.category', 'category')
    .leftJoinAndSelect('question.tags', 'tag')
    .leftJoinAndSelect('question.creator', 'creator');

  // 关键词搜索（标题和内容）
  if (keyword) {
    queryBuilder.andWhere(
      '(question.title ILIKE :keyword OR question.content ILIKE :keyword)',
      { keyword: `%${keyword}%` },
    );
  }

  // 分类筛选
  if (categoryId) {
    queryBuilder.andWhere('question.categoryId = :categoryId', { categoryId });
  }

  // 类型筛选
  if (type) {
    queryBuilder.andWhere('question.type = :type', { type });
  }

  // 难度筛选
  if (difficulty) {
    queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty });
  }

  // 标签筛选（子查询）
  if (tagIds && tagIds.length > 0) {
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('qt.questionId')
        .from('question_tags', 'qt')
        .where('qt.tagId IN (:...tagIds)')
        .getQuery();
      return `question.id IN ${subQuery}`;
    }).setParameter('tagIds', tagIds);
  }

  // 排序和分页
  queryBuilder.orderBy('question.createdAt', 'DESC');
  const skip = (page - 1) * pageSize;
  queryBuilder.skip(skip).take(pageSize);

  // 执行查询
  const [data, total] = await queryBuilder.getManyAndCount();

  return new PaginationResponseDto(data, total, page, pageSize);
}
```

**QueryBuilder 技巧**：

1. **leftJoinAndSelect**：左连接并选择关联数据
   ```typescript
   .leftJoinAndSelect('question.category', 'category')
   ```

2. **ILIKE**：PostgreSQL 不区分大小写的模糊匹配

3. **子查询筛选标签**：
   ```typescript
   .andWhere((qb) => {
     const subQuery = qb.subQuery()
       .select('qt.questionId')
       .from('question_tags', 'qt')
       .where('qt.tagId IN (:...tagIds)')
       .getQuery();
     return `question.id IN ${subQuery}`;
   })
   ```

4. **getManyAndCount**：一次查询获取数据和总数


#### 10.2.3 update() - 更新题目

```typescript
async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
  const question = await this.findById(id);
  const { tagIds, categoryId, ...updateData } = updateQuestionDto;

  // 1. 如果更改分类
  if (categoryId && categoryId !== question.categoryId) {
    await this.categoryService.findById(categoryId);
    // 更新旧分类和新分类的题目数量
    await this.categoryService.updateQuestionCount(question.categoryId, -1);
    await this.categoryService.updateQuestionCount(categoryId, 1);
    question.categoryId = categoryId;
  }

  // 2. 如果更改标签
  if (tagIds !== undefined) {
    const oldTagIds = question.tags.map((t) => t.id);
    const newTags = await this.tagService.findByIds(tagIds);

    // 计算需要增减的标签
    const removedTagIds = oldTagIds.filter((id) => !tagIds.includes(id));
    const addedTagIds = tagIds.filter((id) => !oldTagIds.includes(id));

    // 更新标签计数
    if (removedTagIds.length > 0) {
      await this.tagService.updateQuestionCounts(removedTagIds, -1);
    }
    if (addedTagIds.length > 0) {
      await this.tagService.updateQuestionCounts(addedTagIds, 1);
    }

    question.tags = newTags;
  }

  // 3. 更新其他字段
  Object.assign(question, updateData);

  return this.questionRepository.save(question);
}
```

**更新逻辑要点**：
- 分类变更时，同时更新新旧分类的计数
- 标签变更时，计算差集，只更新变化的标签计数
- 使用 `Object.assign` 合并更新字段

#### 10.2.4 remove() - 删除题目

```typescript
async remove(id: string): Promise<void> {
  const question = await this.findById(id);

  // 更新分类和标签的题目数量
  await this.categoryService.updateQuestionCount(question.categoryId, -1);
  const tagIds = question.tags.map((t) => t.id);
  if (tagIds.length > 0) {
    await this.tagService.updateQuestionCounts(tagIds, -1);
  }

  await this.questionRepository.remove(question);
}
```

**删除时的数据一致性**：
- 先更新关联实体的计数
- 再删除题目本身


### 10.3 query-question.dto.ts - 查询 DTO

```typescript
export class QueryQuestionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType, { message: '无效的题目类型' })
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ description: '难度等级', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel, { message: '无效的难度等级' })
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID格式不正确' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsOptional()
  tagIds?: string[];
}
```

**DTO 设计技巧**：

1. **继承分页 DTO**：复用分页参数定义

2. **@Transform 装饰器**：
   ```typescript
   @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
   ```
   处理单个值和数组的兼容性（`?tagIds=id1` vs `?tagIds=id1&tagIds=id2`）

3. **@IsUUID('4', { each: true })**：验证数组中每个元素都是 UUID

### 10.4 枚举定义

#### question-type.enum.ts

```typescript
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',    // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TRUE_FALSE = 'true_false',          // 判断题
  FILL_BLANK = 'fill_blank',          // 填空题
  SHORT_ANSWER = 'short_answer',      // 简答题
}
```

#### difficulty-level.enum.ts

```typescript
export enum DifficultyLevel {
  EASY = 'easy',     // 简单
  MEDIUM = 'medium', // 中等
  HARD = 'hard',     // 困难
}
```

**枚举设计原则**：
- 使用字符串值而非数字，便于阅读和调试
- 使用小写下划线命名，与数据库存储一致


---

## 总结

### 项目架构亮点

1. **模块化设计**：每个功能模块独立，职责清晰
2. **分层架构**：Controller → Service → Repository
3. **统一响应格式**：通过拦截器和过滤器实现
4. **类型安全**：TypeScript + class-validator 双重保障
5. **安全认证**：JWT + Passport 实现无状态认证

### 核心设计模式

| 模式 | 应用场景 |
|------|----------|
| 依赖注入 | 服务之间的解耦 |
| 装饰器模式 | 路由、验证、权限控制 |
| 工厂模式 | 配置加载、模块注册 |
| 策略模式 | Passport 认证策略 |
| 拦截器模式 | 响应转换、日志记录 |

### 开发顺序建议

1. **基础配置** → 环境变量、TypeScript、数据库连接
2. **通用模块** → 异常过滤器、响应拦截器、装饰器
3. **用户模块** → 用户实体、基本 CRUD
4. **认证模块** → JWT 策略、登录注册
5. **业务模块** → 分类、标签、题目

### 最佳实践

- 使用 DTO 进行数据验证和转换
- 使用枚举定义常量值
- 使用冗余字段优化查询性能
- 使用事务保证数据一致性
- 使用 QueryBuilder 构建复杂查询
- 使用 Swagger 自动生成 API 文档

---

*文档生成时间：2024年12月*
