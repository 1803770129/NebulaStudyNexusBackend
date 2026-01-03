# 从零实现登录认证系统 - 深度学习指南

本文档将带你从计算机网络底层原理开始，一步步理解并实现完整的 JWT 认证系统。

---

## 第一章：计算机网络基础 - 请求是如何到达服务器的？

### 1.1 网络分层模型

当你在浏览器输入 `http://localhost:3003/api/auth/login` 并点击登录时，发生了什么？

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OSI 七层模型 vs TCP/IP 四层模型                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   OSI 模型              TCP/IP 模型           实际数据                   │
│                                                                         │
│  ┌───────────────┐    ┌───────────────┐                                │
│  │ 7. 应用层     │    │               │    HTTP 请求                    │
│  ├───────────────┤    │   应用层      │    POST /api/auth/login        │
│  │ 6. 表示层     │    │               │    { username, password }      │
│  ├───────────────┤    │               │                                │
│  │ 5. 会话层     │    └───────────────┘                                │
│  ├───────────────┤    ┌───────────────┐                                │
│  │ 4. 传输层     │    │   传输层      │    TCP 端口 3003               │
│  ├───────────────┤    └───────────────┘    建立连接、保证可靠传输       │
│  │ 3. 网络层     │    ┌───────────────┐                                │
│  ├───────────────┤    │   网络层      │    IP 地址 127.0.0.1           │
│  │ 2. 数据链路层 │    └───────────────┘    路由寻址                     │
│  ├───────────────┤    ┌───────────────┐                                │
│  │ 1. 物理层     │    │  网络接口层   │    网卡、光纤、电信号           │
│  └───────────────┘    └───────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 一次登录请求的完整旅程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        登录请求的网络旅程                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  浏览器 (前端)                                    服务器 (后端)          │
│      │                                               │                  │
│      │  1. 用户点击登录按钮                          │                  │
│      │     前端构造 HTTP 请求                        │                  │
│      │                                               │                  │
│      │  ┌─────────────────────────────────────────┐  │                  │
│      │  │ POST /api/auth/login HTTP/1.1          │  │                  │
│      │  │ Host: localhost:3003                   │  │                  │
│      │  │ Content-Type: application/json         │  │                  │
│      │  │                                        │  │                  │
│      │  │ {"username":"admin","password":"123"}  │  │                  │
│      │  └─────────────────────────────────────────┘  │                  │
│      │                                               │                  │
│      │  2. DNS 解析 (localhost → 127.0.0.1)         │                  │
│      │                                               │                  │
│      │  3. TCP 三次握手建立连接                      │                  │
│      │  ──────── SYN ────────────────────────────▶  │                  │
│      │  ◀─────── SYN + ACK ──────────────────────   │                  │
│      │  ──────── ACK ────────────────────────────▶  │                  │
│      │                                               │                  │
│      │  4. 发送 HTTP 请求数据                        │                  │
│      │  ════════════════════════════════════════▶   │                  │
│      │                                               │                  │
│      │                                    5. 服务器处理请求             │
│      │                                       - 解析 HTTP               │
│      │                                       - 路由匹配               │
│      │                                       - 执行 Controller        │
│      │                                       - 查询数据库             │
│      │                                       - 生成 JWT               │
│      │                                               │                  │
│      │  6. 返回 HTTP 响应                            │                  │
│      │  ◀════════════════════════════════════════   │                  │
│      │  ┌─────────────────────────────────────────┐  │                  │
│      │  │ HTTP/1.1 200 OK                        │  │                  │
│      │  │ Content-Type: application/json         │  │                  │
│      │  │                                        │  │                  │
│      │  │ {"accessToken":"eyJ...","user":{...}}  │  │                  │
│      │  └─────────────────────────────────────────┘  │                  │
│      │                                               │                  │
│      │  7. TCP 四次挥手断开连接                      │                  │
│      │                                               │                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 HTTP 协议详解

HTTP 是应用层协议，定义了客户端和服务器之间的通信格式：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HTTP 请求结构                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  请求行    POST /api/auth/login HTTP/1.1                                │
│           ─┬── ───────┬──────── ───┬────                                │
│            │          │            │                                    │
│          方法       路径        协议版本                                 │
│                                                                         │
│  请求头    Host: localhost:3003                                         │
│           Content-Type: application/json     ← 告诉服务器请求体格式     │
│           Content-Length: 42                                            │
│           Authorization: Bearer eyJ...       ← 认证信息（登录后的请求）  │
│                                                                         │
│  空行     \r\n                                                          │
│                                                                         │
│  请求体    {"username":"admin","password":"123456"}                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        HTTP 响应结构                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  状态行    HTTP/1.1 200 OK                                              │
│           ───┬──── ─┬─ ─┬                                               │
│              │      │   │                                               │
│           协议版本 状态码 状态描述                                       │
│                                                                         │
│  常见状态码：                                                            │
│    200 OK           - 请求成功                                          │
│    201 Created      - 创建成功（注册）                                   │
│    400 Bad Request  - 请求参数错误                                       │
│    401 Unauthorized - 未认证（未登录或 Token 无效）                      │
│    403 Forbidden    - 无权限                                            │
│    404 Not Found    - 资源不存在                                        │
│    500 Server Error - 服务器内部错误                                     │
│                                                                         │
│  响应头    Content-Type: application/json                               │
│           Set-Cookie: ...                    ← 设置 Cookie（可选）      │
│                                                                         │
│  响应体    {"accessToken":"eyJ...","refreshToken":"eyJ...","user":{}}   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 第二章：数据库设计 - 用户数据如何存储？

### 2.1 用户表设计

```sql
-- PostgreSQL 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,          -- 存储 bcrypt 哈希后的密码
    role VARCHAR(20) DEFAULT 'user',         -- 用户角色
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 示例数据（密码是 "password123" 的 bcrypt 哈希）
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2b$10$...', 'admin'),
('user1', 'user1@example.com', '$2b$10$...', 'user');
```

### 2.2 TypeORM 实体映射

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    数据库表 ↔ TypeORM 实体 映射                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   数据库表 (users)                    TypeORM 实体 (User)               │
│                                                                         │
│   ┌─────────────────────┐            ┌─────────────────────────────┐   │
│   │ id (UUID)           │ ◀────────▶ │ @PrimaryGeneratedColumn()   │   │
│   │ username (VARCHAR)  │ ◀────────▶ │ @Column({ unique: true })   │   │
│   │ email (VARCHAR)     │ ◀────────▶ │ @Column({ unique: true })   │   │
│   │ password (VARCHAR)  │ ◀────────▶ │ @Column() + @Exclude()      │   │
│   │ role (VARCHAR)      │ ◀────────▶ │ @Column({ enum: UserRole }) │   │
│   │ created_at (TIME)   │ ◀────────▶ │ @CreateDateColumn()         │   │
│   │ updated_at (TIME)   │ ◀────────▶ │ @UpdateDateColumn()         │   │
│   └─────────────────────┘            └─────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 数据库连接配置


```typescript
// question-backend/src/config/configuration.ts
export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',      // 数据库服务器地址
    port: parseInt(process.env.DB_PORT || '5432'), // PostgreSQL 默认端口
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'question_manager',
  },
});

// question-backend/src/app.module.ts 中的数据库连接
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,  // 开发环境自动同步表结构
  }),
  inject: [ConfigService],
}),
```

### 2.4 数据库连接的网络过程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NestJS 应用 ↔ PostgreSQL 连接                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  NestJS 应用                                    PostgreSQL 数据库       │
│  (localhost:3003)                               (localhost:5432)        │
│       │                                              │                  │
│       │  1. 应用启动时，TypeORM 初始化连接池         │                  │
│       │                                              │                  │
│       │  ──────── TCP 连接 (端口 5432) ────────────▶ │                  │
│       │                                              │                  │
│       │  2. 发送认证信息                             │                  │
│       │     username: postgres                       │                  │
│       │     password: ******                         │                  │
│       │     database: question_manager               │                  │
│       │                                              │                  │
│       │  3. 认证成功，保持连接                       │                  │
│       │  ◀═══════════════════════════════════════   │                  │
│       │                                              │                  │
│       │  4. 执行 SQL 查询                            │                  │
│       │  ═══ SELECT * FROM users WHERE ... ═══════▶ │                  │
│       │                                              │                  │
│       │  5. 返回查询结果                             │                  │
│       │  ◀═══════════════════════════════════════   │                  │
│       │                                              │                  │
│  连接池：保持多个连接复用，避免频繁建立/断开连接     │                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 第三章：从零实现认证模块

### 3.1 项目结构

```
question-backend/src/modules/auth/
├── auth.module.ts          # 模块定义，组装各个组件
├── auth.controller.ts      # 控制器，处理 HTTP 请求
├── auth.service.ts         # 服务，业务逻辑
├── dto/                    # 数据传输对象
│   ├── login.dto.ts        # 登录请求参数
│   ├── register.dto.ts     # 注册请求参数
│   └── refresh-token.dto.ts
├── guards/                 # 守卫，路由保护
│   ├── jwt-auth.guard.ts   # JWT 认证守卫
│   └── local-auth.guard.ts # 本地认证守卫
└── strategies/             # Passport 策略
    ├── jwt.strategy.ts     # JWT 验证策略
    └── local.strategy.ts   # 用户名密码验证策略
```

### 3.2 Step 1: 创建用户实体 (User Entity)

```typescript
// question-backend/src/modules/user/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * 用户实体
 * 
 * @Entity('users') 告诉 TypeORM 这个类对应数据库的 users 表
 */
@Entity('users')
export class User {
  /**
   * 主键，使用 UUID
   * 数据库会自动生成
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 用户名，唯一
   */
  @Column({ length: 50, unique: true })
  username: string;

  /**
   * 邮箱，唯一
   */
  @Column({ length: 100, unique: true })
  email: string;

  /**
   * 密码
   * @Exclude() 在序列化时排除此字段，防止密码泄露到响应中
   */
  @Column()
  @Exclude()
  password: string;

  /**
   * 用户角色
   */
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
   * 
   * @BeforeInsert 和 @BeforeUpdate 是 TypeORM 的生命周期钩子
   * 在插入或更新数据前自动执行
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // 检查密码是否已经是 bcrypt 哈希格式
    // bcrypt 哈希以 $2b$ 开头
    if (this.password && !this.password.startsWith('$2b$')) {
      // 生成盐值，10 是成本因子（越大越安全但越慢）
      const salt = await bcrypt.genSalt(10);
      // 使用盐值对密码进行哈希
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * 验证密码
   * 
   * @param plainPassword 用户输入的明文密码
   * @returns 密码是否正确
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    // bcrypt.compare 会自动从 this.password 中提取盐值
    // 然后用相同的盐值对 plainPassword 进行哈希
    // 最后比较两个哈希值是否相同
    return bcrypt.compare(plainPassword, this.password);
  }
}
```

### 3.3 Step 2: 创建 DTO (数据传输对象)

```typescript
// question-backend/src/modules/auth/dto/login.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 登录 DTO
 * 
 * DTO 的作用：
 * 1. 定义请求参数的结构
 * 2. 使用 class-validator 进行参数验证
 * 3. 使用 @ApiProperty 生成 Swagger 文档
 */
export class LoginDto {
  @ApiProperty({ 
    description: '用户名', 
    example: 'admin' 
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ 
    description: '密码', 
    example: 'password123' 
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
```

```typescript
// question-backend/src/modules/auth/dto/register.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'newuser' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
```

### 3.4 Step 3: 创建认证服务 (Auth Service)

```typescript
// question-backend/src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';
import { User } from '@/modules/user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

/**
 * JWT Payload 接口
 * 这是存储在 JWT 中的数据结构
 */
export interface JwtPayload {
  sub: string;      // subject，通常是用户 ID
  username: string;
  role: string;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,    // 注入用户服务
    private jwtService: JwtService,       // 注入 JWT 服务
    private configService: ConfigService, // 注入配置服务
  ) {}

  /**
   * 验证用户凭证
   * 
   * 这个方法被 LocalStrategy 调用
   * 
   * @param username 用户名
   * @param password 明文密码
   * @returns 验证成功返回用户对象，失败返回 null
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    // 1. 从数据库查询用户
    //    SQL: SELECT * FROM users WHERE username = 'admin'
    const user = await this.userService.findByUsername(username);
    
    // 2. 如果用户存在，验证密码
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    
    return null;
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // 1. 创建用户（密码会在 Entity 的 @BeforeInsert 钩子中自动加密）
    //    SQL: INSERT INTO users (username, email, password) VALUES (...)
    const user = await this.userService.create(registerDto);
    
    // 2. 生成 Token 并返回
    return this.generateTokens(user);
  }

  /**
   * 用户登录
   * 
   * 注意：这里的 user 参数已经是验证过的用户对象
   * 验证工作在 LocalStrategy 中完成
   */
  async login(user: User): Promise<LoginResponse> {
    return this.generateTokens(user);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // 1. 验证 Refresh Token 的签名和有效期
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // 2. 获取用户信息（确保用户仍然存在且有效）
      const user = await this.userService.findById(payload.sub);
      
      // 3. 生成新的 Token
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 生成访问令牌和刷新令牌
   * 
   * 这是 JWT 生成的核心方法
   */
  private generateTokens(user: User): LoginResponse {
    // 1. 构造 JWT Payload
    //    注意：不要在 Payload 中放敏感信息，因为它可以被解码
    const payload: JwtPayload = {
      sub: user.id,           // 用户 ID
      username: user.username,
      role: user.role,
    };

    // 2. 生成 Access Token（短期有效）
    //    jwtService.sign() 会：
    //    - 将 payload 转为 JSON
    //    - Base64Url 编码 header 和 payload
    //    - 使用 secret 生成签名
    //    - 拼接成 header.payload.signature
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'), // 1h
    });

    // 3. 生成 Refresh Token（长期有效）
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'), // 7d
    });

    // 4. 返回 Token 和用户信息
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

### 3.5 Step 4: 创建 Passport 策略

#### LocalStrategy - 用户名密码验证

```typescript
// question-backend/src/modules/auth/strategies/local.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * 本地策略
 * 
 * 用于处理用户名密码登录
 * 当使用 @UseGuards(LocalAuthGuard) 时，Passport 会调用这个策略
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // 调用父类构造函数，配置策略选项
    super({
      usernameField: 'username', // 指定请求体中用户名字段的名称
      passwordField: 'password', // 指定请求体中密码字段的名称
    });
  }

  /**
   * 验证方法
   * 
   * Passport 会自动从请求体中提取 username 和 password
   * 然后调用这个方法进行验证
   * 
   * @param username 用户名（从请求体自动提取）
   * @param password 密码（从请求体自动提取）
   * @returns 验证成功返回用户对象，会被附加到 req.user
   * @throws UnauthorizedException 验证失败时抛出
   */
  async validate(username: string, password: string) {
    // 调用 AuthService 验证用户凭证
    const user = await this.authService.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    
    // 返回的用户对象会被 Passport 附加到 req.user
    return user;
  }
}
```

#### JwtStrategy - JWT Token 验证

```typescript
// question-backend/src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

/**
 * JWT 策略
 * 
 * 用于验证请求中的 JWT Token
 * 当使用 @UseGuards(JwtAuthGuard) 时，Passport 会调用这个策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      // 指定如何从请求中提取 JWT
      // fromAuthHeaderAsBearerToken() 表示从 Authorization: Bearer <token> 头提取
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 是否忽略过期时间
      // false 表示过期的 Token 会被拒绝
      ignoreExpiration: false,
      
      // JWT 签名密钥
      // 必须与生成 Token 时使用的密钥相同
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * 验证方法
   * 
   * 当 JWT 签名验证通过后，Passport 会调用这个方法
   * payload 是 JWT 解码后的内容
   * 
   * @param payload JWT 解码后的 payload
   * @returns 返回的对象会被附加到 req.user
   */
  async validate(payload: JwtPayload) {
    // 可选：验证用户是否仍然存在
    // 这可以处理用户被删除或禁用的情况
    try {
      await this.userService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 返回的对象会被附加到 req.user
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
```

### 3.6 Step 5: 创建守卫 (Guards)

```typescript
// question-backend/src/modules/auth/guards/local-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 本地认证守卫
 * 
 * 继承自 AuthGuard('local')，表示使用名为 'local' 的 Passport 策略
 * 当路由使用 @UseGuards(LocalAuthGuard) 时：
 * 1. Passport 会查找 LocalStrategy
 * 2. 调用 LocalStrategy.validate() 方法
 * 3. 验证成功后，将用户对象附加到 req.user
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

```typescript
// question-backend/src/modules/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

/**
 * JWT 认证守卫
 * 
 * 这个守卫通常设置为全局守卫，保护所有路由
 * 支持 @Public() 装饰器跳过认证
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 判断是否允许访问
   * 
   * @param context 执行上下文，包含请求信息
   * @returns true 允许访问，false 拒绝访问
   */
  canActivate(context: ExecutionContext) {
    // 使用 Reflector 获取路由或控制器上的元数据
    // getAllAndOverride 会先检查方法级别，再检查类级别
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 当前处理方法
      context.getClass(),   // 当前控制器类
    ]);

    // 如果标记为公开路由，跳过 JWT 认证
    if (isPublic) {
      return true;
    }

    // 否则执行 JWT 认证
    // super.canActivate() 会：
    // 1. 从请求头提取 Token
    // 2. 验证 Token 签名
    // 3. 检查 Token 是否过期
    // 4. 调用 JwtStrategy.validate()
    return super.canActivate(context);
  }
}
```

### 3.7 Step 6: 创建公开路由装饰器

```typescript
// question-backend/src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

// 元数据的键名
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() 装饰器
 * 
 * 用于标记不需要认证的路由
 * 
 * 原理：
 * SetMetadata 会在路由处理方法上设置元数据
 * JwtAuthGuard 通过 Reflector 读取这个元数据
 * 如果存在且为 true，则跳过认证
 * 
 * 使用示例：
 * @Public()
 * @Post('login')
 * async login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 3.8 Step 7: 创建控制器 (Controller)

```typescript
// question-backend/src/modules/auth/auth.controller.ts

import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('auth')  // Swagger 分组标签
@Controller('auth')  // 路由前缀 /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   * 
   * POST /api/auth/register
   * 
   * @Public() 标记为公开路由，不需要认证
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 用户登录
   * 
   * POST /api/auth/login
   * 
   * 流程：
   * 1. @Public() 跳过 JWT 认证
   * 2. @UseGuards(LocalAuthGuard) 触发 LocalStrategy
   * 3. LocalStrategy.validate() 验证用户名密码
   * 4. 验证成功后，用户对象被附加到 req.user
   * 5. 控制器方法执行，调用 authService.login()
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(
    @Body() _loginDto: LoginDto,  // 用于 Swagger 文档和参数验证
    @Request() req: { user: any }, // req.user 由 LocalStrategy 注入
  ) {
    // req.user 是 LocalStrategy.validate() 返回的用户对象
    return this.authService.login(req.user);
  }

  /**
   * 刷新访问令牌
   * 
   * POST /api/auth/refresh
   */
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * 获取当前用户信息
   * 
   * GET /api/auth/profile
   * 
   * 这个路由需要认证（没有 @Public()）
   * JwtAuthGuard 会验证 Token 并将用户信息附加到 req.user
   */
  @Get('profile')
  @ApiBearerAuth('JWT-auth')  // Swagger 显示需要 Bearer Token
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    // @CurrentUser() 是自定义装饰器，从 req.user 提取用户信息
    return user;
  }
}
```

### 3.9 Step 8: 组装模块 (Module)

```typescript
// question-backend/src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    // 导入用户模块，以便使用 UserService
    UserModule,
    
    // 导入 Passport 模块
    PassportModule,
    
    // 异步配置 JWT 模块
    // 使用 registerAsync 可以注入 ConfigService 读取配置
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // JWT 签名密钥
        secret: configService.get<string>('jwt.secret'),
        // 默认签名选项
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,    // 注册 JWT 策略
    LocalStrategy,  // 注册本地策略
  ],
  exports: [AuthService],  // 导出 AuthService 供其他模块使用
})
export class AuthModule {}
```

### 3.10 Step 9: 全局配置 JWT 守卫

```typescript
// question-backend/src/main.ts

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置全局路由前缀
  app.setGlobalPrefix('api');
  
  // 设置全局验证管道
  // 自动验证 DTO 中的装饰器规则
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // 自动剥离非 DTO 定义的属性
    transform: true,      // 自动转换类型
    forbidNonWhitelisted: true,  // 存在非白名单属性时抛出错误
  }));
  
  // 设置全局 JWT 认证守卫
  // 所有路由默认需要认证，除非使用 @Public() 装饰器
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  
  await app.listen(3003);
}
bootstrap();
```

---

## 第四章：完整请求流程图解

### 4.1 登录请求完整流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        登录请求完整流程                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  前端                           NestJS                      数据库      │
│    │                              │                           │        │
│    │  POST /api/auth/login        │                           │        │
│    │  {username, password}        │                           │        │
│    │ ────────────────────────────▶│                           │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 1. 路由匹配       │                 │        │
│    │                    │    /api/auth/login│                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 2. JwtAuthGuard   │                 │        │
│    │                    │    检查 @Public() │                 │        │
│    │                    │    → 跳过 JWT 验证│                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 3. LocalAuthGuard │                 │        │
│    │                    │    触发本地策略   │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 4. LocalStrategy  │                 │        │
│    │                    │    .validate()    │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 5. AuthService    │                 │        │
│    │                    │    .validateUser()│                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                              │  SELECT * FROM users      │        │
│    │                              │  WHERE username = ?       │        │
│    │                              │ ─────────────────────────▶│        │
│    │                              │                           │        │
│    │                              │  返回用户记录             │        │
│    │                              │ ◀─────────────────────────│        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 6. bcrypt.compare │                 │        │
│    │                    │    验证密码       │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 7. 验证通过       │                 │        │
│    │                    │    user → req.user│                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 8. ValidationPipe │                 │        │
│    │                    │    验证 DTO       │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 9. AuthController │                 │        │
│    │                    │    .login()       │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 10. AuthService   │                 │        │
│    │                    │     .login()      │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 11. JwtService    │                 │        │
│    │                    │     .sign()       │                 │        │
│    │                    │     生成 JWT      │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │  { accessToken, refreshToken, user }                     │        │
│    │ ◀────────────────────────────│                           │        │
│    │                              │                           │        │
│    │  存储 Token 到 localStorage  │                           │        │
│    │                              │                           │        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 认证请求完整流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        认证请求完整流程                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  前端                           NestJS                      数据库      │
│    │                              │                           │        │
│    │  GET /api/questions          │                           │        │
│    │  Authorization: Bearer eyJ... │                           │        │
│    │ ────────────────────────────▶│                           │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 1. JwtAuthGuard   │                 │        │
│    │                    │    检查 @Public() │                 │        │
│    │                    │    → 未标记，需认证│                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 2. 提取 Token     │                 │        │
│    │                    │    从 Authorization│                │        │
│    │                    │    Bearer 头提取  │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 3. 验证 JWT 签名  │                 │        │
│    │                    │    使用 secret    │                 │        │
│    │                    │    验证未被篡改   │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 4. 检查过期时间   │                 │        │
│    │                    │    exp claim      │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 5. JwtStrategy    │                 │        │
│    │                    │    .validate()    │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                              │  SELECT * FROM users      │        │
│    │                              │  WHERE id = ?             │        │
│    │                              │ ─────────────────────────▶│        │
│    │                              │                           │        │
│    │                              │  确认用户存在             │        │
│    │                              │ ◀─────────────────────────│        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 6. payload → req.user               │        │
│    │                    │    { sub, username, role }          │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │                    ┌─────────┴─────────┐                 │        │
│    │                    │ 7. Controller     │                 │        │
│    │                    │    执行业务逻辑   │                 │        │
│    │                    └─────────┬─────────┘                 │        │
│    │                              │                           │        │
│    │  { data: [...] }             │                           │        │
│    │ ◀────────────────────────────│                           │        │
│    │                              │                           │        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 第五章：前端实现

### 5.1 API 客户端封装

```typescript
// question-managing/src/lib/apiClient.ts

// Token 存储的键名
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

/**
 * API 客户端类
 * 
 * 封装 HTTP 请求，自动处理：
 * 1. Token 的存储和发送
 * 2. Token 过期时自动刷新
 * 3. 统一的错误处理
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 获取存储的 Access Token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  /**
   * 存储 Token
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * 清除 Token（登出时调用）
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * 发送请求
   * 
   * 自动添加 Authorization 头
   */
  async request<T>(
    method: string,
    path: string,
    data?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    // 构造请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 如果有 Token，添加到请求头
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 发送请求
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    // 处理 401 错误（Token 过期）
    if (response.status === 401) {
      // 尝试刷新 Token
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // 刷新成功，重试原请求
        return this.request<T>(method, path, data);
      }
      // 刷新失败，清除 Token 并抛出错误
      this.clearTokens();
      throw new Error('认证已过期，请重新登录');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '请求失败');
    }

    return response.json();
  }

  /**
   * 尝试刷新 Token
   */
  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch {
      // 刷新失败
    }

    return false;
  }

  // 便捷方法
  get<T>(path: string) { return this.request<T>('GET', path); }
  post<T>(path: string, data: unknown) { return this.request<T>('POST', path, data); }
  put<T>(path: string, data: unknown) { return this.request<T>('PUT', path, data); }
  delete<T>(path: string) { return this.request<T>('DELETE', path); }
}

// 单例模式
let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient('http://localhost:3003/api');
  }
  return apiClient;
}
```

### 5.2 认证服务

```typescript
// question-managing/src/services/authService.ts

import { getApiClient } from '@/lib/apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const api = getApiClient();
  
  // 发送登录请求
  const response = await api.post<AuthResponse>('/auth/login', data);
  
  // 存储 Token
  api.setTokens(response.accessToken, response.refreshToken);
  
  return response;
}

/**
 * 用户登出
 */
export function logout(): void {
  const api = getApiClient();
  api.clearTokens();
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  const api = getApiClient();
  return api.getAccessToken() !== null;
}
```

### 5.3 React Hook 封装

```typescript
// question-managing/src/hooks/useAuth.ts

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  login as loginApi,
  logout as logoutApi,
  isAuthenticated as checkAuth,
  type LoginRequest,
  type AuthResponse,
} from '@/services/authService';

export function useAuth() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());

  // 登录 Mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response: AuthResponse) => {
      setIsAuthenticated(true);
      // 缓存用户信息
      queryClient.setQueryData(['auth', 'profile'], {
        sub: response.user.id,
        username: response.user.username,
        role: response.user.role,
      });
    },
  });

  // 登出
  const logout = useCallback(() => {
    logoutApi();
    setIsAuthenticated(false);
    queryClient.clear();  // 清除所有缓存
  }, [queryClient]);

  return {
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
```

---

## 第六章：安全最佳实践

### 6.1 密码安全

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        密码安全检查清单                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ✓ 使用 bcrypt 加密存储密码                                             │
│    - 成本因子至少为 10                                                  │
│    - 每个密码使用随机盐                                                 │
│                                                                         │
│  ✓ 永远不要明文存储密码                                                 │
│                                                                         │
│  ✓ 永远不要在日志中记录密码                                             │
│                                                                         │
│  ✓ 使用 HTTPS 传输密码                                                  │
│                                                                         │
│  ✓ 实施密码强度要求                                                     │
│    - 最小长度 6-8 位                                                    │
│    - 包含大小写字母、数字、特殊字符                                     │
│                                                                         │
│  ✓ 实施登录失败限制                                                     │
│    - 防止暴力破解                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 JWT 安全

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JWT 安全检查清单                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ✓ 使用强密钥                                                           │
│    - 至少 256 位随机字符串                                              │
│    - 从环境变量读取，不要硬编码                                         │
│                                                                         │
│  ✓ 设置合理的过期时间                                                   │
│    - Access Token: 15分钟 - 1小时                                       │
│    - Refresh Token: 7天 - 30天                                          │
│                                                                         │
│  ✓ 不要在 Payload 中存储敏感信息                                        │
│    - Payload 可以被 Base64 解码                                         │
│    - 只存储必要的用户标识信息                                           │
│                                                                         │
│  ✓ 使用 HTTPS 传输 Token                                                │
│                                                                         │
│  ✓ 前端安全存储 Token                                                   │
│    - localStorage 容易受 XSS 攻击                                       │
│    - 考虑使用 HttpOnly Cookie                                           │
│                                                                         │
│  ✓ 实现 Token 刷新机制                                                  │
│    - 避免用户频繁重新登录                                               │
│                                                                         │
│  ⚠ 考虑实现 Token 黑名单                                                │
│    - 用于强制登出场景                                                   │
│    - 需要额外的存储（如 Redis）                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 环境变量配置

```bash
# .env 文件（不要提交到版本控制）

# JWT 配置
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-database-password
DB_DATABASE=question_manager
```

---

## 总结

通过这个文档，你应该理解了：

1. **网络层面**：HTTP 请求如何从浏览器到达服务器，TCP 连接的建立过程
2. **数据库层面**：用户数据如何存储，TypeORM 如何映射实体到数据库表
3. **认证流程**：从用户输入密码到获得 JWT Token 的完整过程
4. **代码实现**：NestJS 中 Passport、Guard、Strategy 的协作方式
5. **安全实践**：密码加密、Token 管理、安全配置

关键概念回顾：
- **JWT** = Header + Payload + Signature，签名保证数据不被篡改
- **bcrypt** = 单向哈希 + 随机盐，保证密码安全存储
- **Passport Strategy** = 策略模式，支持多种认证方式
- **Guard** = 路由守卫，控制访问权限
- **双 Token 机制** = Access Token (短期) + Refresh Token (长期)
