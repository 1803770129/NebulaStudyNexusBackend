# 用户模块教程

## 模块概述

用户模块是系统的基础模块，负责用户数据的存储和管理。它不直接暴露 API 接口，而是作为内部服务被认证模块调用。

## 目录结构

```
src/modules/user/
├── dto/
│   └── create-user.dto.ts    # 创建用户 DTO
├── entities/
│   └── user.entity.ts        # 用户实体
├── enums/
│   └── user-role.enum.ts     # 用户角色枚举
├── user.module.ts            # 模块定义
└── user.service.ts           # 用户服务
```

## 核心文件详解

### 1. 用户角色枚举 (user-role.enum.ts)

定义系统中的用户角色类型：

```typescript
export enum UserRole {
  /** 管理员 - 拥有所有权限 */
  ADMIN = 'admin',
  /** 普通用户 - 基本操作权限 */
  USER = 'user',
}
```

### 2. 用户实体 (user.entity.ts)

用户实体定义了数据库表结构和业务逻辑：

```typescript
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
import { UserRole } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  @Exclude()  // 序列化时排除密码字段
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
   * 在插入和更新前自动加密密码
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
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

关键设计点：

| 特性 | 说明 |
|------|------|
| `@Exclude()` | 使用 class-transformer 在序列化时排除密码 |
| `@BeforeInsert/@BeforeUpdate` | TypeORM 生命周期钩子，自动加密密码 |
| `validatePassword()` | 实例方法，用于登录时验证密码 |
| UUID 主键 | 使用 UUID 而非自增 ID，更安全 |

### 3. 创建用户 DTO (create-user.dto.ts)

使用 class-validator 进行数据验证：

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRole })
  @IsEnum(UserRole, { message: '无效的用户角色' })
  @IsOptional()
  role?: UserRole;
}
```

### 4. 用户服务 (user.service.ts)

提供用户相关的业务逻辑：

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
    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 创建用户实体
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

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

### 5. 用户模块 (user.module.ts)

模块定义和依赖注入配置：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],  // 导出服务供其他模块使用
})
export class UserModule {}
```

## 模块关系

```
┌─────────────────┐
│   AuthModule    │
│                 │
│  imports:       │
│  - UserModule   │
└────────┬────────┘
         │ 使用
         ▼
┌─────────────────┐
│   UserModule    │
│                 │
│  exports:       │
│  - UserService  │
└─────────────────┘
```

用户模块不直接暴露 Controller，而是通过 `exports` 将 `UserService` 提供给认证模块使用。

## 密码安全

### bcrypt 加密流程

```
用户输入密码 → bcrypt.genSalt(10) → bcrypt.hash() → 存储到数据库
                    ↓
              生成随机盐值
```

### 密码验证流程

```
用户输入密码 → bcrypt.compare(输入, 存储的hash) → true/false
```

### 为什么使用 bcrypt？

1. 自动加盐，防止彩虹表攻击
2. 可配置的计算成本（rounds），抵抗暴力破解
3. 业界标准，经过充分验证

## 数据库表结构

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 扩展建议

### 添加用户管理 API

如果需要管理员管理用户，可以添加 Controller：

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

### 添加用户头像

```typescript
// user.entity.ts
@Column({ nullable: true })
avatar?: string;

// 配合上传模块使用
```

### 添加软删除

```typescript
import { DeleteDateColumn } from 'typeorm';

@Entity('users')
export class User {
  // ...
  
  @DeleteDateColumn()
  deletedAt?: Date;
}
```
