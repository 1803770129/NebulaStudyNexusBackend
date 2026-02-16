# 用户管理模块 - 后端开发指南

> 按步骤从上到下执行，每步完成后建议 `npm run start:dev` 检查编译是否通过

---

## Step 1：修改 User 实体 + 创建 Student 实体

> **什么是 Entity（实体）？**
> Entity 是数据库表在 TypeScript 中的映射。你在实体类里定义的每一个 `@Column()` 字段，TypeORM 都会在数据库中创建对应的列。修改实体 = 修改数据库结构。因为 `synchronize: true`（开发环境），改了代码重启后数据库会自动同步。

### 1.1 修改 `src/modules/user/entities/user.entity.ts`

> **为什么加 `isActive`？** 管理员需要“禁用”某个员工账号但不删除数据。`isActive=false` 的用户无法登录（JWT 策略会检查）。比直接删除更安全，可以随时恢复。

在 `role` 字段后面、`@CreateDateColumn()` 前面新增：

```typescript
@Column({ default: true })
isActive: boolean;
```

> [!NOTE]
> 仅加一个字段。`synchronize: true` 会自动同步到数据库。

### 1.2 新建 `src/modules/student/entities/student.entity.ts`

> **这个文件做什么？** 在数据库中创建 `students` 表。每个 `@Column()` 对应表中的一列。
>
> **为什么和 User 分开成两张表？**
>
> - User = 管理后台的员工（登录方式：用户名 + 密码）
> - Student = 小程序的学生（登录方式：微信 / 手机号 + 密码）
> - 两者字段完全不同、生命周期不同、数据量级也不同（学生数 >> 员工数）
>
> **关键设计点：**
>
> - `phone` 和 `wxOpenid` 都是 `nullable + unique` → 微信注册的用户一开始没手机号（null），手机号注册的用户没微信（null），但一旦填了就不能重复
> - `password` 也是 `nullable` → 微信登录用户可能从未设置过密码
> - `@Exclude()` 装饰器 → 序列化时自动隐藏密码字段，防止接口返回密码
> - `@BeforeInsert()` + `@BeforeUpdate()` → TypeORM 实体钩子，在插入/更新前自动加密密码
> - `validatePassword()` → 实例方法，用 bcrypt 比对明文密码和加密密码

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcrypt";

@Entity("students")
export class Student {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** 手机号（手机号登录用） */
  @Column({ length: 20, unique: true, nullable: true })
  phone: string | null;

  /** 密码（手机号注册时设置） */
  @Column({ nullable: true })
  @Exclude()
  password: string | null;

  /** 微信 openid */
  @Column({ length: 100, unique: true, nullable: true })
  wxOpenid: string | null;

  /** 微信 unionid */
  @Column({ length: 100, nullable: true })
  wxUnionid: string | null;

  /** 昵称 */
  @Column({ length: 100, default: "" })
  nickname: string;

  /** 头像 URL */
  @Column({ length: 500, default: "" })
  avatar: string;

  /** 是否启用 */
  @Column({ default: true })
  isActive: boolean;

  /** 最后登录时间 */
  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }
}
```

> [!IMPORTANT]
> `phone` 和 `wxOpenid` 都是 `nullable: true` + `unique: true`。至少一个不为空（注册时校验）。密码加密逻辑同 User 实体。

### 1.3 验证

```bash
npm run start:dev
```

检查控制台日志，TypeORM 应输出 `CREATE TABLE "students"` SQL。到数据库确认表已创建。

---

## Step 2：创建所有 DTO

> **什么是 DTO（Data Transfer Object）？**
> DTO = 请求参数的“合同”。它定义了每个 API 接收什么字段、什么格式。NestJS 的 `ValidationPipe` 会自动根据 DTO 上的装饰器（`@IsString()`、`@IsEmail()`、`@MinLength()` 等）校验请求数据。如果校验不通过，直接返回 `400 Bad Request`，代码根本不会进入 Service 层。
>
> **为什么每个操作单独一个 DTO？** 每个操作接收的字段不同、校验规则不同。比如“修改角色”只接收 `role`，“重置密码”只接收 `newPassword`。如果用一个大的 `UpdateUserDto`，管理员可能通过“修改角色”接口偷偷改密码。拆分后 Swagger 文档也更清晰。

### 2.1 User 管理 DTO

> 以下 4 个 DTO 用于管理员对员工的增删改查操作。

**新建 `src/modules/user/dto/query-user.dto.ts`**

> **作用：** 定义 `GET /users` 列表查询的参数。继承 `PaginationQueryDto` 后自动获得 `page` 和 `pageSize` 参数，只需定义自己特有的筛选字段。`@Transform()` 用于将 URL query string 中的 `"true"` 字符串转为布尔值。

```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { UserRole } from "../enums/user-role.enum";

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "搜索关键词（用户名/邮箱）" })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: "角色筛选", enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: "状态筛选" })
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

**新建 `src/modules/user/dto/update-user-role.dto.ts`**

> **作用：** 用于 `PATCH /users/:id/role`。只接收一个 `role` 字段，`@IsEnum(UserRole)` 确保值必须是 `UserRole` 枚举中的合法值（admin/user），传 `"hacker"` 会直接被拒绝。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

export class UpdateUserRoleDto {
  @ApiProperty({ description: "新角色", enum: UserRole })
  @IsEnum(UserRole, { message: "无效的用户角色" })
  @IsNotEmpty()
  role: UserRole;
}
```

**新建 `src/modules/user/dto/update-user-status.dto.ts`**

> **作用：** 用于 `PATCH /users/:id/status`。只接收 `isActive` 布尔值，控制启用/禁用账号。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateUserStatusDto {
  @ApiProperty({ description: "是否启用" })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
```

**新建 `src/modules/user/dto/reset-password.dto.ts`**

> **作用：** 用于 `PATCH /users/:id/reset-password`。管理员重置其他用户的密码，不需要旧密码（和“修改自己密码”区分开）。`@MinLength(6)` 确保新密码至少 6 位。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ description: "新密码", minLength: 6 })
  @IsString()
  @MinLength(6, { message: "密码长度不能少于6位" })
  @IsNotEmpty({ message: "新密码不能为空" })
  newPassword: string;
}
```

**修改 `src/modules/user/dto/index.ts`**

> **作用：** 统一导出所有 DTO。这样其他文件只需 `import { QueryUserDto, ResetPasswordDto } from './dto'` 一行，不用分别 import 多个文件。这是 NestJS 项目中常见的 barrel export 模式。

```typescript
export * from "./create-user.dto";
export * from "./query-user.dto";
export * from "./update-user-role.dto";
export * from "./update-user-status.dto";
export * from "./reset-password.dto";
```

### 2.2 Student 管理 DTO

> 以下 2 个 DTO 用于管理员对学生的管理操作。学生没有角色概念，所以比 User DTO 更简单。

**新建 `src/modules/student/dto/query-student.dto.ts`**

> **作用：** 学生列表查询参数。和 `QueryUserDto` 类似但没有 `role` 筛选（学生没有角色）。关键词搜索匹配昵称和手机号。

```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

export class QueryStudentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "搜索关键词（昵称/手机号）" })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: "状态筛选" })
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

**新建 `src/modules/student/dto/update-student-status.dto.ts`**

> **作用：** 管理员启用/禁用学生账号。和 `UpdateUserStatusDto` 结构一样，但分开定义保持模块独立性。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateStudentStatusDto {
  @ApiProperty({ description: "是否启用" })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
```

**新建 `src/modules/student/dto/index.ts`**

```typescript
export * from "./query-student.dto";
export * from "./update-student-status.dto";
```

### 2.3 学生端认证 DTO

> 以下 7 个 DTO 用于学生端自己的认证操作（登录/注册/修改信息/绑定账号）。属于 `student-auth` 模块而不是 `student` 模块，因为它们处理的是认证相关的业务。

**新建目录 `src/modules/student-auth/dto/`，然后创建以下文件：**

**`wx-login.dto.ts`**

> **作用：** 微信登录接口的请求参数。`code` 是微信小程序调用 `wx.login()` 后返回的临时凭证（有效期 5 分钟），后端拿到 code 后调微信服务器换取 `openid`。`nickname` 和 `avatar` 可选，首次登录时传入用于初始化用户资料。

```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class WxLoginDto {
  @ApiProperty({ description: "微信 wx.login 返回的 code" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: "微信昵称" })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: "微信头像" })
  @IsString()
  @IsOptional()
  avatar?: string;
}
```

**`student-register.dto.ts`**

> **作用：** 手机号注册参数。`@Matches(/^1[3-9]\d{9}$/)` 用正则校验中国大陆手机号格式（1开头 + 第二位3-9 + 后面 9 位数字）。

```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class StudentRegisterDto {
  @ApiProperty({ description: "手机号" })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: "手机号格式不正确" })
  @IsNotEmpty({ message: "手机号不能为空" })
  phone: string;

  @ApiProperty({ description: "密码", minLength: 6 })
  @IsString()
  @MinLength(6, { message: "密码长度不能少于6位" })
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;

  @ApiPropertyOptional({ description: "昵称" })
  @IsString()
  @IsOptional()
  nickname?: string;
}
```

**`student-login.dto.ts`**

> **作用：** 手机号+密码登录参数。和注册 DTO 不同，这里不需要严格的手机号格式校验（不存在的手机号查不到就是了）。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class StudentLoginDto {
  @ApiProperty({ description: "手机号" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "密码" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

**`update-student-profile.dto.ts`**

> **作用：** 学生修改自己的个人资料。所有字段都是 `@IsOptional()`，只传想改的字段即可。`@MaxLength()` 防止存入过长的数据。

```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ description: "昵称" })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: "头像" })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  avatar?: string;
}
```

**`change-student-password.dto.ts`**

> **作用：** 学生修改自己的密码，需要旧密码 + 新密码。注意和管理员的“重置密码”区别：重置密码不需要旧密码（管理员特权），修改密码必须验证旧密码（安全考虑）。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangeStudentPasswordDto {
  @ApiProperty({ description: "旧密码" })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: "新密码", minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
```

**`bind-phone.dto.ts`**

> **作用：** 微信登录的学生绑定手机号。绑定时同时设置密码，这样以后也可以用手机号+密码登录。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class BindPhoneDto {
  @ApiProperty({ description: "手机号" })
  @Matches(/^1[3-9]\d{9}$/, { message: "手机号格式不正确" })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "设置密码", minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
```

**`bind-wechat.dto.ts`**

> **作用：** 手机号注册的学生绑定微信。传入微信 `code`，后端换取 openid 后关联到学生账号。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BindWechatDto {
  @ApiProperty({ description: "微信 code" })
  @IsString()
  @IsNotEmpty()
  code: string;
}
```

**`index.ts`**

> **作用：** Barrel export，统一导出所有 student-auth DTO。

```typescript
export * from "./wx-login.dto";
export * from "./student-register.dto";
export * from "./student-login.dto";
export * from "./update-student-profile.dto";
export * from "./change-student-password.dto";
export * from "./bind-phone.dto";
export * from "./bind-wechat.dto";
```

### 2.4 管理端 Auth 新增 DTO

> 以下 2 个 DTO 用于管理员修改自己的信息（不是管理别人的信息）。

**新建 `src/modules/auth/dto/update-profile.dto.ts`**

> **作用：** 管理员修改自己的用户名。`@Length(2, 50)` 限制长度范围。

```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "用户名" })
  @IsString()
  @Length(2, 50)
  @IsOptional()
  username?: string;
}
```

**新建 `src/modules/auth/dto/change-password.dto.ts`**

> **作用：** 管理员修改自己的密码，需要旧密码验证。

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ description: "旧密码" })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: "新密码", minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
```

**修改 `src/modules/auth/dto/index.ts`** — 追加导出：

```typescript
export * from "./update-profile.dto";
export * from "./change-password.dto";
```

### 2.5 验证

```bash
npm run start:dev
```

确保编译无报错。此时 DTO 文件还没被任何 Service/Controller 引用，不会影响运行。

---

## Step 3：扩展 UserService + 创建 StudentService

> **什么是 Service（服务）？**
> Service 是业务逻辑的“大脑”。所有“怎么做”的逻辑都写在这里：查数据库、判断权限、计算结果。Controller 只负责“接参数 → 调 Service → 返结果”，不做任何业务判断。
>
> **为什么要这样分层？** 如果以后有定时任务也要调用“禁用用户”功能，它可以直接调 Service，不需要经过 HTTP 请求。Service 是唯一可信的业务逻辑来源。

### 3.1 修改 `src/modules/user/user.service.ts`

> **改了什么？** 在已有的 `create/findByUsername/findById/findAll` 4 个方法基础上，新增 7 个方法：
>
> - `findAllPaginated()` — 用 QueryBuilder 拼接 WHERE 条件，分页查询用户列表
> - `updateRole()` / `updateStatus()` / `resetPassword()` / `remove()` — 每个都会检查 `id !== currentUserId`（不能操作自己），这是安全设计
> - `updateProfile()` — 改用户名前先检查新用户名是否已被占用
> - `changePassword()` — 先验证旧密码对不对，对了才允许改
>
> **为什么“不能操作自己”要在 Service 层检查而不是 Controller 层？** Service 是业务逻辑的唯一可信来源。如果以后有其他地方调用 Service（比如定时任务），也能保证安全。

在已有方法后新增以下方法（保留原有方法不动）：

```typescript
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserRole } from './enums/user-role.enum';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';

// ... 保留已有的 constructor, create, findByUsername, findById, findAll ...

/** 分页查询用户 */
async findAllPaginated(queryDto: QueryUserDto): Promise<PaginationResponseDto<User>> {
  const { page = 1, pageSize = 10, keyword, role, isActive } = queryDto;
  const qb = this.userRepository.createQueryBuilder('user');

  if (keyword) {
    qb.andWhere(
      '(user.username ILIKE :kw OR user.email ILIKE :kw)',
      { kw: `%${keyword}%` },
    );
  }
  if (role) {
    qb.andWhere('user.role = :role', { role });
  }
  if (isActive !== undefined) {
    qb.andWhere('user.isActive = :isActive', { isActive });
  }

  qb.orderBy('user.createdAt', 'DESC');
  qb.skip((page - 1) * pageSize).take(pageSize);

  const [data, total] = await qb.getManyAndCount();
  return new PaginationResponseDto(data, total, page, pageSize);
}

/** 修改角色 */
async updateRole(id: string, role: UserRole, currentUserId: string): Promise<User> {
  if (id === currentUserId) {
    throw new ForbiddenException('不能修改自己的角色');
  }
  const user = await this.findById(id);
  user.role = role;
  return this.userRepository.save(user);
}

/** 启用/禁用 */
async updateStatus(id: string, isActive: boolean, currentUserId: string): Promise<User> {
  if (id === currentUserId) {
    throw new ForbiddenException('不能修改自己的状态');
  }
  const user = await this.findById(id);
  user.isActive = isActive;
  return this.userRepository.save(user);
}

/** 重置密码 */
async resetPassword(id: string, newPassword: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) {
    throw new ForbiddenException('不能重置自己的密码，请使用修改密码功能');
  }
  const user = await this.findById(id);
  user.password = newPassword; // @BeforeUpdate 会自动哈希
  await this.userRepository.save(user);
}

/** 删除用户 */
async remove(id: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) {
    throw new ForbiddenException('不能删除自己的账号');
  }
  const user = await this.findById(id);
  await this.userRepository.remove(user);
}

/** 修改个人信息 */
async updateProfile(id: string, data: { username?: string }): Promise<User> {
  const user = await this.findById(id);
  if (data.username && data.username !== user.username) {
    const existing = await this.findByUsername(data.username);
    if (existing) throw new ConflictException('用户名已存在');
    user.username = data.username;
  }
  return this.userRepository.save(user);
}

/** 修改密码 */
async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await this.findById(id);
  const isValid = await user.validatePassword(oldPassword);
  if (!isValid) {
    throw new ForbiddenException('旧密码不正确');
  }
  user.password = newPassword;
  await this.userRepository.save(user);
}
```

> [!WARNING]
> `resetPassword` 和 `changePassword` 都直接赋值 `user.password = newPassword`，依赖实体的 `@BeforeUpdate hashPassword()` 自动加密。注意 TypeORM 的 `save()` 方法会触发 `@BeforeUpdate`，但 `update()` 方法**不会**。

### 3.2 新建 `src/modules/student/student.service.ts`

> **这个文件做什么？** 处理所有学生相关的业务逻辑。包含三类方法：
>
> - **认证相关：** `findByWxOpenid` / `findByPhone` / `createWxStudent` / `createPhoneStudent` — 给 StudentAuthService 调用
> - **管理相关：** `findAllPaginated` / `updateStatus` / `remove` — 给 StudentController（管理员）调用
> - **学生自操作：** `updateProfile` / `changePassword` / `bindPhone` / `bindWechat` — 给 StudentAuthController 调用
>
> **为什么 `updateLastLogin` 用 `update()` 而不是 `save()`？** 更新最后登录时间不涉及密码，不需要触发 `@BeforeUpdate` 钩子。`update()` 性能更好（一条 SQL，不需要先查再存）。

```typescript
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity";
import { QueryStudentDto } from "./dto/query-student.dto";
import { PaginationResponseDto } from "@/common/dto/pagination-response.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  /** 根据 wxOpenid 查找 */
  async findByWxOpenid(openid: string): Promise<Student | null> {
    return this.studentRepo.findOne({ where: { wxOpenid: openid } });
  }

  /** 根据手机号查找 */
  async findByPhone(phone: string): Promise<Student | null> {
    return this.studentRepo.findOne({ where: { phone } });
  }

  /** 根据 ID 查找 */
  async findById(id: string): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException("学生不存在");
    return student;
  }

  /** 创建微信用户 */
  async createWxStudent(data: {
    wxOpenid: string;
    wxUnionid?: string | null;
    nickname?: string;
    avatar?: string;
  }): Promise<Student> {
    const student = this.studentRepo.create({
      wxOpenid: data.wxOpenid,
      wxUnionid: data.wxUnionid || null,
      nickname: data.nickname || "",
      avatar: data.avatar || "",
    });
    return this.studentRepo.save(student);
  }

  /** 创建手机号用户 */
  async createPhoneStudent(data: {
    phone: string;
    password: string;
    nickname?: string;
  }): Promise<Student> {
    const existing = await this.findByPhone(data.phone);
    if (existing) throw new ConflictException("手机号已被注册");

    const student = this.studentRepo.create({
      phone: data.phone,
      password: data.password,
      nickname: data.nickname || `用户${data.phone.slice(-4)}`,
    });
    return this.studentRepo.save(student);
  }

  /** 更新最后登录时间 */
  async updateLastLogin(id: string): Promise<void> {
    await this.studentRepo.update(id, { lastLoginAt: new Date() });
  }

  /** 分页查询（Admin） */
  async findAllPaginated(
    queryDto: QueryStudentDto,
  ): Promise<PaginationResponseDto<Student>> {
    const { page = 1, pageSize = 10, keyword, isActive } = queryDto;
    const qb = this.studentRepo.createQueryBuilder("student");

    if (keyword) {
      qb.andWhere("(student.nickname ILIKE :kw OR student.phone ILIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }
    if (isActive !== undefined) {
      qb.andWhere("student.isActive = :isActive", { isActive });
    }

    qb.orderBy("student.createdAt", "DESC");
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return new PaginationResponseDto(data, total, page, pageSize);
  }

  /** 启用/禁用（Admin） */
  async updateStatus(id: string, isActive: boolean): Promise<Student> {
    const student = await this.findById(id);
    student.isActive = isActive;
    return this.studentRepo.save(student);
  }

  /** 删除（Admin） */
  async remove(id: string): Promise<void> {
    const student = await this.findById(id);
    await this.studentRepo.remove(student);
  }

  /** 修改个人信息 */
  async updateProfile(
    id: string,
    data: { nickname?: string; avatar?: string },
  ): Promise<Student> {
    const student = await this.findById(id);
    if (data.nickname !== undefined) student.nickname = data.nickname;
    if (data.avatar !== undefined) student.avatar = data.avatar;
    return this.studentRepo.save(student);
  }

  /** 修改密码 */
  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const student = await this.findById(id);
    if (!student.password) {
      throw new ForbiddenException("微信用户请先绑定手机号设置密码");
    }
    const isValid = await student.validatePassword(oldPassword);
    if (!isValid) throw new ForbiddenException("旧密码不正确");
    student.password = newPassword;
    await this.studentRepo.save(student);
  }

  /** 绑定手机号（微信用户） */
  async bindPhone(
    id: string,
    phone: string,
    password: string,
  ): Promise<Student> {
    const student = await this.findById(id);
    if (student.phone) throw new ConflictException("已绑定手机号");

    const phoneExists = await this.findByPhone(phone);
    if (phoneExists) throw new ConflictException("手机号已被其他用户绑定");

    student.phone = phone;
    student.password = password; // @BeforeUpdate 自动哈希
    return this.studentRepo.save(student);
  }

  /** 绑定微信（手机号用户，需在 Controller 层先获取 openid） */
  async bindWechat(
    id: string,
    wxOpenid: string,
    wxUnionid?: string,
  ): Promise<Student> {
    const student = await this.findById(id);
    if (student.wxOpenid) throw new ConflictException("已绑定微信");

    const wxExists = await this.findByWxOpenid(wxOpenid);
    if (wxExists) throw new ConflictException("该微信已被其他用户绑定");

    student.wxOpenid = wxOpenid;
    student.wxUnionid = wxUnionid || null;
    return this.studentRepo.save(student);
  }
}
```

### 3.3 新建 `src/modules/student/student.module.ts`

> **什么是 Module？** Module 是 NestJS 的组织单元，把相关的 Entity、Service、Controller 打包在一起。
>
> - `imports: [TypeOrmModule.forFeature([Student])]` → 注册 Student 实体，让 Service 能用 `@InjectRepository(Student)` 注入数据库仓库
> - `providers: [StudentService]` → 注册 Service，让 NestJS 能自动创建它的实例（依赖注入）
> - `exports: [StudentService]` → 导出 Service，让其他模块（如 StudentAuthModule）能导入并使用它

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "./entities/student.entity";
import { StudentService } from "./student.service";

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
```

### 3.4 验证

```bash
npm run start:dev
```

编译通过即可。StudentModule 还未在 AppModule 中导入，下一步处理。

---

## Step 4：创建 Controller + 注册模块

> **什么是 Controller（控制器）？**
> Controller 是路由入口，定义 URL 路径和 HTTP 方法。每个方法 = 一个 API 接口。职责很单一：接收参数 → 调 Service → 返回结果。不做任何业务判断。
>
> **关键装饰器解释：**
>
> - `@ApiTags('用户管理')` → Swagger 分组名，让 API 文档更清晰
> - `@ApiBearerAuth()` → Swagger 中显示“需要 Token”
> - `@Controller('users')` → 所有路由前缀是 `/users`
> - `@UseGuards(RolesGuard)` → 启用角色守卫
> - `@Roles(UserRole.ADMIN)` → 整个 Controller 只有管理员能访问
> - `@Param('id', ParseUUIDPipe)` → 自动校验 id 是合法 UUID 格式，不合法直接返回 400
> - `@CurrentUser()` → 从 JWT 中提取当前登录用户信息

### 4.1 新建 `src/modules/user/user.controller.ts`

```typescript
import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserService } from "./user.service";
import {
  QueryUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ResetPasswordDto,
} from "./dto";
import { Roles } from "@/common/decorators/roles.decorator";
import { RolesGuard } from "@/common/guards/roles.guard";
import {
  CurrentUser,
  JwtPayload,
} from "@/common/decorators/current-user.decorator";
import { UserRole } from "./enums/user-role.enum";

@ApiTags("用户管理（Admin）")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "用户列表" })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAllPaginated(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "用户详情" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "修改角色" })
  updateRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.userService.updateRole(id, dto.role, currentUser.sub);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "启用/禁用" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.userService.updateStatus(id, dto.isActive, currentUser.sub);
  }

  @Patch(":id/reset-password")
  @ApiOperation({ summary: "重置密码" })
  resetPassword(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.userService.resetPassword(id, dto.newPassword, currentUser.sub);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.userService.remove(id, currentUser.sub);
  }
}
```

### 4.2 修改 `src/modules/user/user.module.ts`

> **为什么要在 Module 里注册 Controller？** NestJS 是模块化架构，“你有什么”必须在 Module 里声明。不注册 Controller = NestJS 不知道它存在 = 路由不生效。`controllers` 注册 Controller，`providers` 注册 Service，`imports` 导入其他模块。

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController], // 新增
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### 4.3 新建 `src/modules/student/student.controller.ts`

> **和 UserController 的区别？** 只有列表、详情、启用/禁用、删除 4 个操作。没有改角色、改密码，因为管理员不需要管学生的密码和角色。同样需要 `@Roles(UserRole.ADMIN)` 限制只有管理员能访问。

```typescript
import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StudentService } from "./student.service";
import { QueryStudentDto, UpdateStudentStatusDto } from "./dto";
import { Roles } from "@/common/decorators/roles.decorator";
import { RolesGuard } from "@/common/guards/roles.guard";
import { UserRole } from "@/modules/user/enums/user-role.enum";

@ApiTags("学生管理（Admin）")
@ApiBearerAuth("JWT-auth")
@Controller("students")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: "学生列表" })
  findAll(@Query() queryDto: QueryStudentDto) {
    return this.studentService.findAllPaginated(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "学生详情" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentService.findById(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "启用/禁用学生" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentStatusDto,
  ) {
    return this.studentService.updateStatus(id, dto.isActive);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除学生" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentService.remove(id);
  }
}
```

### 4.4 修改 `src/modules/student/student.module.ts`

> **做什么？** 把 StudentController 注册到 StudentModule 中，让学生管理路由生效。和 UserModule 加 UserController 一样的道理。

```diff
+ import { StudentController } from './student.controller';

  @Module({
    imports: [TypeOrmModule.forFeature([Student])],
+   controllers: [StudentController],
    providers: [StudentService],
    exports: [StudentService],
  })
```

### 4.5 修改 `src/app.module.ts`

> **做什么？** 两件事：
>
> 1. 导入 `StudentModule` → 让 NestJS 知道 Student 模块存在
> 2. 全局注册 `RolesGuard` → 每个请求都经过角色检查。但不会影响现有接口，因为 RolesGuard 的逻辑是：没有 `@Roles()` 装饰器的接口直接放行，有 `@Roles()` 的才检查角色

新增导入 + 全局注册 RolesGuard：

```diff
+ import { StudentModule } from './modules/student/student.module';
+ import { RolesGuard } from './common/guards/roles.guard';

  @Module({
    imports: [
      // ...已有模块
      AuthModule,
      UserModule,
+     StudentModule,
      QuestionModule,
      // ...
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
+     {
+       provide: APP_GUARD,
+       useClass: RolesGuard,
+     },
    ],
  })
```

> [!WARNING]
> 注册 RolesGuard 为全局守卫后，**所有接口都会经过角色检查**。但 RolesGuard 的逻辑是：如果没有 `@Roles()` 装饰器则直接放行，所以不影响现有没加 `@Roles` 的接口。

### 4.6 验证

```bash
npm run start:dev
```

打开 Swagger (`http://localhost:3000/api/docs`)，应能看到 "用户管理（Admin）" 和 "学生管理（Admin）" 分组。

---

## Step 5：JWT 策略改造

> **这是最核心的改造。** JWT 策略决定了“每次请求到达时，怎么确认这个人是谁”。改造前只支持管理员，改造后需要同时支持管理员和学生。
>
> **认证流程（每次 API 请求）：**
>
> 1. 客户端发请求，头部带 `Authorization: Bearer <token>`
> 2. `JwtAuthGuard` 检查是否有 `@Public()` 装饰器 → 有则直接放行
> 3. `JwtStrategy` 解析 token → 验证签名和过期时间
> 4. `validate()` 方法根据 `payload.type` 查 User 表或 Student 表
> 5. 确认用户存在且 `isActive=true` → 将 payload 挂到 `request.user`
> 6. Controller 通过 `@CurrentUser()` 拿到 `request.user`

这是最关键的一步，需要改造 JWT payload 以支持双用户类型。

### 5.1 修改 `src/modules/auth/strategies/jwt.strategy.ts`

> **改了什么？**
>
> - 原来：`validate()` 只查 User 表
> - 现在：根据 `payload.type` 判断查 User 表还是 Student 表
> - `JwtPayload` 变成联合类型：`AdminJwtPayload`（含 username + role） | `StudentJwtPayload`（含 nickname）
> - 对旧的没有 `type` 字段的 token 做了兼容处理，默认当做 admin，这样改造期间已登录的管理员不会被踢出

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "@/modules/user/user.service";
import { StudentService } from "@/modules/student/student.service";

/** 管理端 JWT Payload */
export interface AdminJwtPayload {
  sub: string;
  type: "admin";
  username: string;
  role: string;
}

/** 学生端 JWT Payload */
export interface StudentJwtPayload {
  sub: string;
  type: "student";
  nickname: string;
}

export type JwtPayload = AdminJwtPayload | StudentJwtPayload;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private studentService: StudentService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === "student") {
      try {
        const student = await this.studentService.findById(payload.sub);
        if (!student.isActive) {
          throw new UnauthorizedException("账号已被禁用");
        }
      } catch {
        throw new UnauthorizedException("用户不存在或已被禁用");
      }
      return payload; // 附加到 request.user
    }

    // 默认 admin 类型（兼容旧 token 没有 type 字段）
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user.isActive) {
        throw new UnauthorizedException("账号已被禁用");
      }
    } catch {
      throw new UnauthorizedException("用户不存在或已被禁用");
    }

    return { ...payload, type: "admin" as const };
  }
}
```

> [!IMPORTANT]
>
> 1. JwtStrategy 注入了 `StudentService`，需要确保 `AuthModule` 导入 `StudentModule`。
> 2. 对旧的没有 `type` 字段的 token 做了兼容，默认当做 `admin`。
> 3. 验证时同时检查 `isActive`，被禁用的用户 token 也无法使用。

### 5.2 修改 `src/modules/auth/auth.module.ts`

> **为什么要导入 StudentModule？** 因为 JwtStrategy 现在需要注入 StudentService 来查学生表。NestJS 的依赖注入要求：你要用别的模块的 Service，就必须先 import 那个模块。

```diff
+ import { StudentModule } from '@/modules/student/student.module';

  @Module({
    imports: [
      UserModule,
+     StudentModule,
      PassportModule,
      JwtModule.registerAsync({ ... }),
    ],
    // ...
  })
```

### 5.3 修改 `src/common/decorators/current-user.decorator.ts`

> **这个装饰器做什么？** 从 `request.user` 中提取当前登录用户信息。Controller 方法里写 `@CurrentUser() user` 就能拿到用户信息，不用每次手动写 `request.user`。
>
> **改了什么？** JwtPayload 类型从只有 admin 变成了 `admin | student` 联合类型。Controller 里需要根据 `user.type` 判断属于哪种用户。

更新 JwtPayload 类型：

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// 重新导出，方便其他文件引用
export type {
  JwtPayload,
  AdminJwtPayload,
  StudentJwtPayload,
} from "@/modules/auth/strategies/jwt.strategy";
import type { JwtPayload } from "@/modules/auth/strategies/jwt.strategy";

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    if (data) return user?.[data as string];
    return user;
  },
);
```

> [!NOTE]
> 如果遇到循环依赖，可以把 JwtPayload 类型定义提取到 `src/common/interfaces/jwt-payload.interface.ts`。

### 5.4 修改 `src/modules/auth/auth.service.ts` — generateTokens

> **为什么要加 `type: 'admin'`？** 原来生成的 JWT payload 没有 type 字段。加上后，后端解析 token 时能明确区分“这是管理员还是学生”。`as const` 是 TypeScript 的常量断言，让类型为字面量 `'admin'` 而不是宽泛的 `string`。

修改 `generateTokens` 方法，payload 中加入 `type: 'admin'`：

```diff
  private generateTokens(user: User): LoginResponse {
    const payload = {
      sub: user.id,
+     type: 'admin' as const,
      username: user.username,
      role: user.role,
    };
    // ... 其余不变
  }
```

### 5.5 验证

```bash
npm run start:dev
```

用现有账号登录，检查返回的 JWT 解码后包含 `type: "admin"`。

---

## Step 6：学生端认证模块

> **这个模块是做什么的？** 专门处理学生的登录、注册、个人信息修改等认证相关操作。和管理端的 `AuthModule` 完全独立，互不影响。
>
> **为什么不把学生认证放到现有的 AuthModule 里？** 完全隔离的好处：
>
> - 管理端和学生端的认证逻辑完全不同（学生有微信登录，管理员没有）
> - 如果以后学生端要换认证方式，不影响管理端
> - 代码职责清晰，新人看代码也知道哪个是哪个

### 6.1 修改 `src/config/configuration.ts`

> **为什么要加微信配置？** 微信登录需要 AppID 和 AppSecret，这两个值从微信公众平台获取，通过环境变量传入。存在 `configuration.ts` 里统一管理，而不是在代码里写死。

在导出对象中新增：

```typescript
wechat: {
  appid: process.env.WECHAT_APPID || '',
  secret: process.env.WECHAT_APP_SECRET || '',
},
```

### 6.2 新建 `src/modules/student-auth/student-auth.service.ts`

> **这个 Service 包含哪些方法？**
>
> - `login()` — 手机号登录：查手机号 → 验证密码 → 检查 isActive → 生成 JWT
> - `register()` — 手机号注册：创建学生 → 生成 JWT（注册即登录）
> - `wxLogin()` — **微信登录核心流程：**
>   1. 小程序调 `wx.login()` 获取临时 `code`
>   2. 后端拿着 `code + AppID + AppSecret` 调微信服务器的 `jscode2session` 接口
>   3. 微信返回 `openid`（用户唯一标识）
>   4. 用 openid 查数据库 → 存在就登录，不存在就自动注册
> - `refreshToken()` — 刷新令牌：验证旧 Token → 检查 type=student → 生成新 Token
> - `generateTokens()` — 生成 access + refresh 两个 JWT，payload 包含 `type: 'student'`
>
> **为什么需要 HttpModule？** 小程序的 `wx.login()` 只能拿到一个临时 code，code 不能直接用。必须后端发 HTTP 请求到微信服务器换取 openid。HttpModule 是 NestJS 内置的 HTTP 客户端（基于 axios）。

```typescript
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { StudentService } from "@/modules/student/student.service";
import { StudentLoginDto } from "./dto/student-login.dto";
import { StudentRegisterDto } from "./dto/student-register.dto";
import { WxLoginDto } from "./dto/wx-login.dto";
import type { StudentJwtPayload } from "@/modules/auth/strategies/jwt.strategy";

@Injectable()
export class StudentAuthService {
  constructor(
    private studentService: StudentService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  /** 手机号+密码登录 */
  async login(dto: StudentLoginDto) {
    const student = await this.studentService.findByPhone(dto.phone);
    if (!student || !student.password) {
      throw new UnauthorizedException("手机号或密码错误");
    }
    if (!student.isActive) {
      throw new ForbiddenException("账号已被禁用");
    }
    const valid = await student.validatePassword(dto.password);
    if (!valid) throw new UnauthorizedException("手机号或密码错误");

    await this.studentService.updateLastLogin(student.id);
    return { ...this.generateTokens(student), isNewUser: false };
  }

  /** 手机号注册 */
  async register(dto: StudentRegisterDto) {
    const student = await this.studentService.createPhoneStudent({
      phone: dto.phone,
      password: dto.password,
      nickname: dto.nickname,
    });
    return { ...this.generateTokens(student), isNewUser: true };
  }

  /** 微信登录 */
  async wxLogin(dto: WxLoginDto) {
    const appid = this.configService.get<string>("wechat.appid");
    const secret = this.configService.get<string>("wechat.secret");
    if (!appid || !secret) {
      throw new ServiceUnavailableException("微信登录未配置");
    }

    // 调用微信 code2session
    const url = "https://api.weixin.qq.com/sns/jscode2session";
    const { data: wxRes } = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          appid,
          secret,
          js_code: dto.code,
          grant_type: "authorization_code",
        },
      }),
    );

    if (!wxRes.openid) {
      throw new UnauthorizedException(wxRes.errmsg || "微信登录失败");
    }

    let student = await this.studentService.findByWxOpenid(wxRes.openid);
    let isNewUser = false;

    if (!student) {
      student = await this.studentService.createWxStudent({
        wxOpenid: wxRes.openid,
        wxUnionid: wxRes.unionid || null,
        nickname: dto.nickname,
        avatar: dto.avatar,
      });
      isNewUser = true;
    } else {
      if (!student.isActive) throw new ForbiddenException("账号已被禁用");
      await this.studentService.updateLastLogin(student.id);
    }

    return { ...this.generateTokens(student), isNewUser };
  }

  /** 刷新令牌 */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<StudentJwtPayload>(refreshToken, {
        secret: this.configService.get<string>("jwt.secret"),
      });
      if (payload.type !== "student") throw new Error();
      const student = await this.studentService.findById(payload.sub);
      if (!student.isActive) throw new Error();
      return this.generateTokens(student);
    } catch {
      throw new UnauthorizedException("刷新令牌无效或已过期");
    }
  }

  private generateTokens(student: any) {
    const payload: StudentJwtPayload = {
      sub: student.id,
      type: "student",
      nickname: student.nickname || "",
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>("jwt.expiresIn"),
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>("jwt.refreshExpiresIn"),
      }),
      student: {
        id: student.id,
        nickname: student.nickname,
        avatar: student.avatar,
        phone: student.phone,
      },
    };
  }
}
```

### 6.3 新建 `src/modules/student-auth/student-auth.controller.ts`

> **路由设计说明：**
>
> - 路由前缀：`/student-auth`，和管理端的 `/auth` 完全分开
> - 公开接口（`@Public()`）：wx-login、register、login、refresh — 不需要登录就能调用
> - 需要认证的接口：profile、password、bind-phone — 必须登录后才能调用
>
> **为什么 profile/password 不需要 `@Roles()`？** 这些是“操作自己的数据”，只需要认证（登录了就行），不需要特定角色权限。通过 `@CurrentUser()` 拿到的 `user.sub` 就是自己的 ID。

```typescript
import { Controller, Post, Get, Patch, Body } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StudentAuthService } from "./student-auth.service";
import { StudentService } from "@/modules/student/student.service";
import {
  WxLoginDto,
  StudentRegisterDto,
  StudentLoginDto,
  UpdateStudentProfileDto,
  ChangeStudentPasswordDto,
  BindPhoneDto,
  BindWechatDto,
} from "./dto";
import { Public } from "@/common/decorators/public.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { StudentJwtPayload } from "@/modules/auth/strategies/jwt.strategy";
import { RefreshTokenDto } from "@/modules/auth/dto";

@ApiTags("学生端认证")
@Controller("student-auth")
export class StudentAuthController {
  constructor(
    private readonly authService: StudentAuthService,
    private readonly studentService: StudentService,
  ) {}

  @Public()
  @Post("wx-login")
  @ApiOperation({ summary: "微信登录" })
  wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto);
  }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "手机号注册" })
  register(@Body() dto: StudentRegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "手机号登录" })
  login(@Body() dto: StudentLoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "刷新令牌" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "获取个人信息" })
  async getProfile(@CurrentUser() user: StudentJwtPayload) {
    return this.studentService.findById(user.sub);
  }

  @Patch("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "修改个人信息" })
  updateProfile(
    @CurrentUser() user: StudentJwtPayload,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentService.updateProfile(user.sub, dto);
  }

  @Patch("password")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "修改密码" })
  changePassword(
    @CurrentUser() user: StudentJwtPayload,
    @Body() dto: ChangeStudentPasswordDto,
  ) {
    return this.studentService.changePassword(
      user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Patch("bind-phone")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "绑定手机号" })
  bindPhone(@CurrentUser() user: StudentJwtPayload, @Body() dto: BindPhoneDto) {
    return this.studentService.bindPhone(user.sub, dto.phone, dto.password);
  }
}
```

> [!NOTE]
> `bind-wechat` 接口逻辑类似 wxLogin（需要先调微信接口换 openid），可参照 wxLogin 实现，此处省略。

### 6.4 新建 `src/modules/student-auth/student-auth.module.ts`

> **这个 Module 导入了什么？**
>
> - `StudentModule` — 需要用 StudentService 操作学生数据
> - `HttpModule` — 需要发 HTTP 请求调微信 API（`@nestjs/axios` 提供）
> - `JwtModule` — 需要用 JwtService 生成/验证 Token（和 AuthModule 中的 JwtModule 是独立的实例，但配置相同）

```typescript
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StudentAuthController } from "./student-auth.controller";
import { StudentAuthService } from "./student-auth.service";
import { StudentModule } from "@/modules/student/student.module";

@Module({
  imports: [
    StudentModule,
    HttpModule, // 用于调用微信 API
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: {
          expiresIn: configService.get<string>("jwt.expiresIn"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StudentAuthController],
  providers: [StudentAuthService],
})
export class StudentAuthModule {}
```

> [!IMPORTANT]
> 需要安装 `@nestjs/axios` 和 `axios`：
>
> ```bash
> npm install @nestjs/axios axios
> ```

### 6.5 修改 `src/app.module.ts` — 导入 StudentAuthModule

> **做什么？** 把 StudentAuthModule 注册到根模块中，让学生认证相关的路由生效。和之前注册 StudentModule 一样的道理。

```diff
+ import { StudentAuthModule } from './modules/student-auth/student-auth.module';

  imports: [
    // ...
    StudentModule,
+   StudentAuthModule,
    // ...
  ],
```

### 6.6 验证

```bash
npm run start:dev
```

打开 Swagger，应看到"学生端认证"分组，包含 wx-login、register、login 等接口。用手机号注册测试：

```http
POST /api/student-auth/register
{ "phone": "13800138000", "password": "123456" }
```

---

## Step 7：扩展 AuthController（管理端个人信息）

> **这一步做什么？** 给管理端的 AuthController 加两个接口：
>
> - `PATCH /auth/profile` — 管理员修改自己的用户名
> - `PATCH /auth/password` — 管理员修改自己的密码
>
> **为什么放在 AuthController 而不是 UserController？** 因为这是“操作自己”的接口，不需要 `@Roles(ADMIN)` 权限。UserController 是“管理员管理其他用户”的接口，需要管理员权限。两者职责不同。

### 7.1 修改 `src/modules/auth/auth.controller.ts`

> **注意：** AuthController 需要注入 UserService。检查已有的 constructor 是否已注入。如果只有 AuthService，需要加上 `private readonly userService: UserService`。

在已有的 `getProfile` 方法后新增：

```typescript
import { UpdateProfileDto, ChangePasswordDto } from './dto';

@Patch('profile')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '修改个人信息' })
updateProfile(
  @CurrentUser() user: JwtPayload,
  @Body() dto: UpdateProfileDto,
) {
  return this.userService.updateProfile(user.sub, dto);
}

@Patch('password')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '修改密码' })
changePassword(
  @CurrentUser() user: JwtPayload,
  @Body() dto: ChangePasswordDto,
) {
  return this.userService.changePassword(user.sub, dto.oldPassword, dto.newPassword);
}
```

> [!NOTE]
> AuthController 需要注入 UserService。检查已有的 constructor 是否已注入 AuthService，还需要导入 UserService。如果 AuthService 已经注入了 UserService，也可以通过 AuthService 代理调用。

### 7.2 验证

```bash
npm run start:dev
```

Swagger 中 auth 分组应新增 `PATCH /auth/profile` 和 `PATCH /auth/password`。

---

## Step 8：完成后的目录结构

```text
src/
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts       (已有)
│   │   │   ├── query-user.dto.ts        (新建)
│   │   │   ├── update-user-role.dto.ts  (新建)
│   │   │   ├── update-user-status.dto.ts(新建)
│   │   │   ├── reset-password.dto.ts    (新建)
│   │   │   └── index.ts                 (修改)
│   │   ├── entities/
│   │   │   └── user.entity.ts           (修改 +isActive)
│   │   ├── enums/
│   │   │   └── user-role.enum.ts        (不变)
│   │   ├── user.controller.ts           (新建)
│   │   ├── user.module.ts               (修改)
│   │   └── user.service.ts              (修改)
│   ├── student/
│   │   ├── dto/
│   │   │   ├── query-student.dto.ts     (新建)
│   │   │   ├── update-student-status.dto.ts (新建)
│   │   │   └── index.ts                 (新建)
│   │   ├── entities/
│   │   │   └── student.entity.ts        (新建)
│   │   ├── student.controller.ts        (新建)
│   │   ├── student.module.ts            (新建)
│   │   └── student.service.ts           (新建)
│   ├── student-auth/
│   │   ├── dto/
│   │   │   ├── wx-login.dto.ts          (新建)
│   │   │   ├── student-register.dto.ts  (新建)
│   │   │   ├── student-login.dto.ts     (新建)
│   │   │   ├── update-student-profile.dto.ts (新建)
│   │   │   ├── change-student-password.dto.ts (新建)
│   │   │   ├── bind-phone.dto.ts        (新建)
│   │   │   ├── bind-wechat.dto.ts       (新建)
│   │   │   └── index.ts                 (新建)
│   │   ├── student-auth.controller.ts   (新建)
│   │   ├── student-auth.module.ts       (新建)
│   │   └── student-auth.service.ts      (新建)
│   └── auth/
│       ├── dto/
│       │   ├── update-profile.dto.ts    (新建)
│       │   ├── change-password.dto.ts   (新建)
│       │   └── index.ts                 (修改)
│       ├── strategies/
│       │   └── jwt.strategy.ts          (修改)
│       ├── auth.controller.ts           (修改)
│       ├── auth.module.ts               (修改)
│       └── auth.service.ts              (修改)
├── common/
│   └── decorators/
│       └── current-user.decorator.ts    (修改)
├── config/
│   └── configuration.ts                 (修改)
└── app.module.ts                        (修改)
```

---

## 常见问题

### Q: 循环依赖怎么办？

`JwtStrategy` 注入 `StudentService`，而 `StudentAuthModule` 也导入 `JwtModule`。如果出现循环依赖，使用 `forwardRef`：

```typescript
// auth.module.ts
imports: [forwardRef(() => StudentModule), ...]
```

### Q: 旧的管理员 Token 登录后还能用吗？

可以。Step 5.1 中 `jwt.strategy.ts` 的 `validate` 方法对没有 `type` 字段的 payload 默认当做 `admin` 处理。

### Q: 被禁用的用户 Token 还能用吗？

不能。`jwt.strategy.ts` 每次都会查表确认 `isActive === true`。

### Q: `@BeforeUpdate` 什么时候不触发？

TypeORM 的 `Repository.update()` 和 `QueryBuilder.update()` **不会**触发实体钩子。只有 `save()` 方法才会。所以修改密码时一定要用 `save()` 而不是 `update()`。
