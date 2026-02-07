# NestJS 完整开发指南

> 从零开始学习 NestJS，以 question-backend 项目的 question 模块为例

## 目录

1. [NestJS 简介](#1-nestjs-简介)
2. [项目初始化](#2-项目初始化)
3. [核心概念](#3-核心概念)
4. [模块开发流程](#4-模块开发流程)
5. [Question 模块详解](#5-question-模块详解)
6. [数据库集成](#6-数据库集成)
7. [API 文档](#7-api-文档)
8. [测试](#8-测试)
9. [最佳实践](#9-最佳实践)

---

## 1. NestJS 简介

### 1.1 什么是 NestJS？

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用渐进式 JavaScript，完全支持 TypeScript，并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

### 1.2 核心特性

- **模块化架构**：将应用程序组织成模块
- **依赖注入**：自动管理依赖关系
- **装饰器**：使用装饰器定义路由、验证等
- **TypeScript 支持**：完整的类型安全
- **内置功能**：认证、验证、ORM 集成等

### 1.3 技术栈

本项目使用的技术栈：
- **NestJS 10.x**：后端框架
- **TypeORM 0.3.x**：ORM 框架
- **PostgreSQL**：数据库
- **JWT**：身份认证
- **Swagger**：API 文档

---

## 2. 项目初始化

### 2.1 安装 NestJS CLI

```bash
npm install -g @nestjs/cli
```

### 2.2 创建新项目

```bash
nest new question-backend
cd question-backend
```


### 2.3 安装必要依赖

```bash
# TypeORM 和 PostgreSQL
npm install @nestjs/typeorm typeorm pg

# 配置管理
npm install @nestjs/config

# 验证
npm install class-validator class-transformer

# JWT 认证
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt

# Swagger API 文档
npm install @nestjs/swagger

# 其他工具
npm install bcrypt uuid
npm install -D @types/bcrypt @types/uuid
```

### 2.4 项目结构

```
question-backend/
├── src/
│   ├── common/              # 公共模块（装饰器、过滤器、拦截器等）
│   ├── config/              # 配置文件
│   ├── database/            # 数据库配置和迁移
│   ├── modules/             # 业务模块
│   │   ├── auth/           # 认证模块
│   │   ├── user/           # 用户模块
│   │   ├── category/       # 分类模块
│   │   ├── tag/            # 标签模块
│   │   └── question/       # 题目模块 ⭐
│   ├── app.module.ts       # 根模块
│   └── main.ts             # 入口文件
├── test/                    # 测试文件
├── .env                     # 环境变量
└── package.json
```

---

## 3. 核心概念

### 3.1 模块（Module）

模块是组织应用程序的基本单元。每个模块都是一个用 `@Module()` 装饰器注解的类。

```typescript
@Module({
  imports: [],      // 导入其他模块
  controllers: [],  // 控制器
  providers: [],    // 服务提供者
  exports: []       // 导出的服务（供其他模块使用）
})
export class QuestionModule {}
```

### 3.2 控制器（Controller）

控制器负责处理传入的请求并返回响应。

```typescript
@Controller('questions')  // 路由前缀
export class QuestionController {
  @Get()                  // GET /questions
  findAll() {}
  
  @Post()                 // POST /questions
  create() {}
}
```

### 3.3 服务（Service/Provider）

服务包含业务逻辑，通过依赖注入提供给控制器使用。

```typescript
@Injectable()
export class QuestionService {
  // 业务逻辑
}
```


### 3.4 实体（Entity）

实体是数据库表的映射，使用 TypeORM 装饰器定义。

```typescript
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  title: string;
}
```

### 3.5 DTO（Data Transfer Object）

DTO 用于定义数据传输对象，包含验证规则。

```typescript
export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
```

### 3.6 依赖注入

NestJS 使用构造函数注入依赖：

```typescript
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService
  ) {}
}
```

---

## 4. 模块开发流程

### 4.1 开发步骤总览

开发一个完整的 NestJS 模块通常遵循以下步骤：

```
1. 创建模块骨架
   ↓
2. 定义实体（Entity）
   ↓
3. 创建 DTO（数据传输对象）
   ↓
4. 实现服务（Service）
   ↓
5. 实现控制器（Controller）
   ↓
6. 配置模块（Module）
   ↓
7. 添加验证和文档
   ↓
8. 编写测试
```

### 4.2 使用 CLI 生成代码

NestJS CLI 提供了快速生成代码的命令：

```bash
# 生成完整的 CRUD 资源
nest g resource question

# 单独生成各个部分
nest g module question        # 生成模块
nest g controller question    # 生成控制器
nest g service question       # 生成服务
```

---

## 5. Question 模块详解

现在我们以 question 模块为例，详细讲解每个部分的实现。

### 5.1 第一步：创建模块结构

首先创建模块的目录结构：

```
src/modules/question/
├── dto/                    # 数据传输对象
│   ├── create-question.dto.ts
│   ├── update-question.dto.ts
│   ├── query-question.dto.ts
│   ├── option.dto.ts
│   └── index.ts
├── entities/               # 实体
│   └── question.entity.ts
├── enums/                  # 枚举
│   ├── question-type.enum.ts
│   ├── difficulty-level.enum.ts
│   └── index.ts
├── question.controller.ts  # 控制器
├── question.service.ts     # 服务
└── question.module.ts      # 模块
```


### 5.2 第二步：定义枚举类型

**文件：`enums/question-type.enum.ts`**

```typescript
/**
 * 题目类型枚举
 */
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',    // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TRUE_FALSE = 'true_false',          // 判断题
  SHORT_ANSWER = 'short_answer',      // 简答题
}
```

**文件：`enums/difficulty-level.enum.ts`**

```typescript
/**
 * 难度等级枚举
 */
export enum DifficultyLevel {
  EASY = 'easy',       // 简单
  MEDIUM = 'medium',   // 中等
  HARD = 'hard',       // 困难
}
```

**文件：`enums/index.ts`**

```typescript
export * from './question-type.enum';
export * from './difficulty-level.enum';
```

### 5.3 第三步：定义实体（Entity）

**文件：`entities/question.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { QuestionType } from '../enums/question-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { Category } from '@/modules/category/entities/category.entity';
import { Tag } from '@/modules/tag/entities/tag.entity';
import { User } from '@/modules/user/entities/user.entity';

/**
 * 富文本内容结构
 */
export interface RichContent {
  raw: string;       // 原始内容
  rendered: string;  // 渲染后内容
}

/**
 * 选项接口
 */
export interface Option {
  id: string;
  content: RichContent;
  isCorrect: boolean;
}

@Entity('questions')
export class Question {
  // 主键 - UUID 类型
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 题目标题
  @Column({ length: 200 })
  title: string;

  // 题目内容 - 使用 JSONB 存储富文本
  @Column('jsonb')
  content: RichContent;

  // 题目类型 - 枚举
  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  // 难度等级 - 枚举
  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty: DifficultyLevel;

  // 多对一关系：题目属于一个分类
  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  // 多对多关系：题目可以有多个标签
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'question_tags',
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // 选项 - JSONB 数组
  @Column('jsonb', { nullable: true })
  options: Option[];

  // 答案 - 可以是字符串或字符串数组
  @Column('jsonb')
  answer: string | string[];

  // 答案解析
  @Column('jsonb', { nullable: true })
  explanation: RichContent | null;

  // 多对一关系：题目创建者
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'uuid' })
  creatorId: string;

  // 时间戳
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**关键点说明：**

1. **装饰器**：
   - `@Entity('questions')`：定义表名
   - `@PrimaryGeneratedColumn('uuid')`：自动生成 UUID 主键
   - `@Column()`：定义列
   - `@CreateDateColumn()`：自动管理创建时间
   - `@UpdateDateColumn()`：自动管理更新时间

2. **关系映射**：
   - `@ManyToOne()`：多对一关系（多个题目属于一个分类）
   - `@ManyToMany()`：多对多关系（题目和标签）
   - `@JoinColumn()`：指定外键列
   - `@JoinTable()`：指定中间表

3. **数据类型**：
   - `'jsonb'`：PostgreSQL 的 JSON 类型，支持索引和查询
   - `'enum'`：枚举类型
   - `'uuid'`：UUID 类型


### 5.4 第四步：创建 DTO

**文件：`dto/option.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

/**
 * 选项 DTO
 */
export class OptionDto {
  @ApiProperty({ description: '选项ID', example: 'A' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: '选项内容（原始 HTML）' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '是否为正确答案' })
  @IsBoolean()
  isCorrect: boolean;
}
```

**文件：`dto/create-question.dto.ts`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { OptionDto } from './option.dto';

export class CreateQuestionDto {
  @ApiProperty({ description: '题目标题', example: '以下哪个是正确的？' })
  @IsString()
  @IsNotEmpty({ message: '题目标题不能为空' })
  @MaxLength(200, { message: '题目标题不能超过200个字符' })
  title: string;

  @ApiProperty({ description: '题目内容' })
  @IsString()
  @IsNotEmpty({ message: '题目内容不能为空' })
  content: string;

  @ApiProperty({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType, { message: '无效的题目类型' })
  type: QuestionType;

  @ApiProperty({ description: '难度等级', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel, { message: '无效的难度等级' })
  difficulty: DifficultyLevel;

  @ApiProperty({ description: '分类ID' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  categoryId: string;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID格式不正确' })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: '选项列表', type: [OptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];

  @ApiProperty({ description: '答案' })
  @IsNotEmpty({ message: '答案不能为空' })
  answer: string | string[];

  @ApiPropertyOptional({ description: '答案解析' })
  @IsString()
  @IsOptional()
  explanation?: string;
}
```

**文件：`dto/update-question.dto.ts`**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

/**
 * 更新题目 DTO
 * 使用 PartialType 使所有字段变为可选
 */
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
```

**文件：`dto/query-question.dto.ts`**

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

/**
 * 查询题目 DTO
 */
export class QueryQuestionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ description: '难度等级', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  @IsOptional()
  tagIds?: string[];
}
```

**DTO 关键点：**

1. **验证装饰器**：
   - `@IsString()`：验证是否为字符串
   - `@IsNotEmpty()`：验证非空
   - `@IsEnum()`：验证枚举值
   - `@IsUUID()`：验证 UUID 格式
   - `@MaxLength()`：验证最大长度

2. **Swagger 装饰器**：
   - `@ApiProperty()`：必填字段
   - `@ApiPropertyOptional()`：可选字段

3. **嵌套验证**：
   - `@ValidateNested()`：验证嵌套对象
   - `@Type()`：类型转换


### 5.5 第五步：实现服务（Service）

**文件：`question.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto } from './dto';
import { CategoryService } from '@/modules/category/category.service';
import { TagService } from '@/modules/tag/tag.service';
import { ContentService } from '@/modules/content/content.service';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';

@Injectable()
export class QuestionService {
  constructor(
    // 注入 Repository
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    // 注入其他服务
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly contentService: ContentService,
  ) {}

  /**
   * 创建题目
   */
  async create(createQuestionDto: CreateQuestionDto, creatorId: string): Promise<Question> {
    const { tagIds, categoryId, content, explanation, options, ...questionData } = createQuestionDto;

    // 1. 验证分类存在
    await this.categoryService.findById(categoryId);

    // 2. 获取标签
    const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

    // 3. 处理富文本内容
    const processedContent = await this.contentService.processContent(content);
    const processedExplanation = explanation 
      ? await this.contentService.processContent(explanation)
      : null;
    const processedOptions = await this.processOptions(options);

    // 4. 创建题目实体
    const question = this.questionRepository.create({
      ...questionData,
      content: processedContent,
      explanation: processedExplanation,
      options: processedOptions,
      categoryId,
      tags,
      creatorId,
    });

    // 5. 保存到数据库
    const savedQuestion = await this.questionRepository.save(question);

    // 6. 更新关联数据的计数
    await this.categoryService.updateQuestionCount(categoryId, 1);
    if (tagIds && tagIds.length > 0) {
      await this.tagService.updateQuestionCounts(tagIds, 1);
    }

    return savedQuestion;
  }

  /**
   * 分页查询题目列表
   */
  async findAll(queryDto: QueryQuestionDto): Promise<PaginationResponseDto<Question>> {
    const { page = 1, pageSize = 10, keyword, categoryId, type, difficulty, tagIds } = queryDto;

    // 1. 创建查询构建器
    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.creator', 'creator');

    // 2. 添加搜索条件
    if (keyword) {
      queryBuilder.andWhere(
        "(question.title ILIKE :keyword OR question.content->>'raw' ILIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('question.categoryId = :categoryId', { categoryId });
    }

    if (type) {
      queryBuilder.andWhere('question.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty });
    }

    // 3. 标签筛选（子查询）
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

    // 4. 排序
    queryBuilder.orderBy('question.createdAt', 'DESC');

    // 5. 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 6. 执行查询
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(data, total, page, pageSize);
  }

  /**
   * 根据 ID 查找题目
   */
  async findById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'creator'],
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return question;
  }

  /**
   * 更新题目
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findById(id);
    const { tagIds, categoryId, content, explanation, options, ...updateData } = updateQuestionDto;

    // 1. 更新分类
    if (categoryId && categoryId !== question.categoryId) {
      await this.categoryService.findById(categoryId);
      await this.categoryService.updateQuestionCount(question.categoryId, -1);
      await this.categoryService.updateQuestionCount(categoryId, 1);
      question.categoryId = categoryId;
    }

    // 2. 更新标签
    if (tagIds !== undefined) {
      const oldTagIds = question.tags.map((t) => t.id);
      const newTags = await this.tagService.findByIds(tagIds);

      const removedTagIds = oldTagIds.filter((id) => !tagIds.includes(id));
      const addedTagIds = tagIds.filter((id) => !oldTagIds.includes(id));

      if (removedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(removedTagIds, -1);
      }
      if (addedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(addedTagIds, 1);
      }

      question.tags = newTags;
    }

    // 3. 更新内容
    if (content !== undefined) {
      question.content = await this.contentService.processContent(content);
    }

    if (explanation !== undefined) {
      question.explanation = explanation 
        ? await this.contentService.processContent(explanation)
        : null;
    }

    if (options !== undefined) {
      question.options = await this.processOptions(options) ?? null;
    }

    // 4. 更新其他字段
    Object.assign(question, updateData);

    return this.questionRepository.save(question);
  }

  /**
   * 删除题目
   */
  async remove(id: string): Promise<void> {
    const question = await this.findById(id);

    // 更新关联数据的计数
    await this.categoryService.updateQuestionCount(question.categoryId, -1);
    const tagIds = question.tags.map((t) => t.id);
    if (tagIds.length > 0) {
      await this.tagService.updateQuestionCounts(tagIds, -1);
    }

    await this.questionRepository.remove(question);
  }

  /**
   * 私有方法：处理选项
   */
  private async processOptions(options?: OptionDto[]): Promise<Option[] | undefined> {
    if (!options || options.length === 0) {
      return undefined;
    }

    const processedOptions: Option[] = [];
    for (const option of options) {
      const richContent = await this.contentService.processContent(option.content);
      processedOptions.push({
        id: option.id,
        content: richContent,
        isCorrect: option.isCorrect,
      });
    }
    return processedOptions;
  }
}
```

**Service 关键点：**

1. **依赖注入**：
   - `@InjectRepository()`：注入 TypeORM Repository
   - 构造函数注入其他服务

2. **Repository 方法**：
   - `create()`：创建实体实例（不保存）
   - `save()`：保存到数据库
   - `findOne()`：查找单个记录
   - `remove()`：删除记录

3. **QueryBuilder**：
   - 复杂查询使用 QueryBuilder
   - 支持联表、条件、排序、分页

4. **异常处理**：
   - 使用 `NotFoundException` 等内置异常


### 5.6 第六步：实现控制器（Controller）

**文件：`question.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto } from './dto';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('questions')              // Swagger 分组
@ApiBearerAuth('JWT-auth')         // 需要 JWT 认证
@Controller('questions')           // 路由前缀：/questions
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 创建题目
   * POST /questions
   */
  @Post()
  @ApiOperation({ summary: '创建题目' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.questionService.create(createQuestionDto, user.sub);
  }

  /**
   * 获取题目列表
   * GET /questions?page=1&pageSize=10&keyword=xxx
   */
  @Get()
  @ApiOperation({ summary: '获取题目列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryQuestionDto) {
    return this.questionService.findAll(queryDto);
  }

  /**
   * 获取题目详情
   * GET /questions/:id
   */
  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findById(id);
  }

  /**
   * 更新题目
   * PATCH /questions/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新题目' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  /**
   * 删除题目
   * DELETE /questions/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除题目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.remove(id);
  }
}
```

**Controller 关键点：**

1. **HTTP 方法装饰器**：
   - `@Get()`：处理 GET 请求
   - `@Post()`：处理 POST 请求
   - `@Patch()`：处理 PATCH 请求
   - `@Delete()`：处理 DELETE 请求

2. **参数装饰器**：
   - `@Body()`：获取请求体
   - `@Query()`：获取查询参数
   - `@Param()`：获取路径参数
   - `@CurrentUser()`：自定义装饰器，获取当前用户

3. **管道（Pipe）**：
   - `ParseUUIDPipe`：验证并转换 UUID

4. **Swagger 文档**：
   - `@ApiTags()`：API 分组
   - `@ApiOperation()`：操作描述
   - `@ApiResponse()`：响应描述

### 5.7 第七步：配置模块（Module）

**文件：`question.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { CategoryModule } from '@/modules/category/category.module';
import { TagModule } from '@/modules/tag/tag.module';
import { ContentModule } from '@/modules/content/content.module';

@Module({
  imports: [
    // 注册实体
    TypeOrmModule.forFeature([Question]),
    // 导入依赖的模块
    CategoryModule,
    TagModule,
    ContentModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],  // 导出服务供其他模块使用
})
export class QuestionModule {}
```

**Module 关键点：**

1. **imports**：导入其他模块
   - `TypeOrmModule.forFeature()`：注册实体

2. **controllers**：注册控制器

3. **providers**：注册服务提供者

4. **exports**：导出服务供其他模块使用

### 5.8 第八步：在根模块中注册

**文件：`app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionModule } from './modules/question/question.module';
// ... 其他模块

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    // 业务模块
    QuestionModule,
    // ... 其他模块
  ],
})
export class AppModule {}
```


---

## 6. 数据库集成

### 6.1 配置 TypeORM

**文件：`.env`**

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=question_db

# JWT 配置
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

**文件：`src/config/configuration.ts`**

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
```

### 6.2 数据库迁移

TypeORM 支持数据库迁移来管理数据库结构变更。

**生成迁移文件：**

```bash
npm run typeorm migration:generate -- src/database/migrations/CreateQuestionTable
```

**运行迁移：**

```bash
npm run typeorm migration:run
```

**回滚迁移：**

```bash
npm run typeorm migration:revert
```

### 6.3 数据库关系

在 question 模块中，我们使用了以下关系：

1. **多对一（ManyToOne）**：
   - 多个题目属于一个分类
   - 多个题目属于一个创建者

2. **多对多（ManyToMany）**：
   - 题目和标签是多对多关系
   - 需要中间表 `question_tags`

**关系图：**

```
┌─────────────┐       ┌──────────────┐       ┌─────────┐
│  Question   │ N   1 │   Category   │       │   Tag   │
│             ├───────┤              │       │         │
│  - id       │       │  - id        │       │  - id   │
│  - title    │       │  - name      │       │  - name │
│  - content  │       └──────────────┘       └─────────┘
│  - type     │                                    ▲
│  - ...      │                                    │
└─────────────┘                                    │
      │                                            │
      │ N                                        N │
      │                                            │
      │         ┌──────────────────┐               │
      └─────────┤ question_tags    ├───────────────┘
                │                  │
                │  - questionId    │
                │  - tagId         │
                └──────────────────┘
```

---

## 7. API 文档

### 7.1 配置 Swagger

**文件：`src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 自动删除非白名单属性
      forbidNonWhitelisted: true, // 禁止非白名单属性
      transform: true,            // 自动类型转换
    }),
  );

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('题目管理系统 API')
    .setDescription('题目管理系统后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger documentation: http://localhost:3000/api');
}
bootstrap();
```

### 7.2 访问 API 文档

启动应用后，访问：`http://localhost:3000/api`

你会看到自动生成的 API 文档，包括：
- 所有 API 端点
- 请求参数
- 响应格式
- 可以直接测试 API

---

## 8. 测试

### 8.1 单元测试

**文件：`question.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';

describe('QuestionService', () => {
  let service: QuestionService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepository,
        },
        // Mock 其他依赖
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a question', async () => {
      const createDto = {
        title: 'Test Question',
        content: 'Test Content',
        // ...
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: '1', ...createDto });

      const result = await service.create(createDto, 'user-id');
      expect(result).toHaveProperty('id');
    });
  });
});
```

### 8.2 E2E 测试

**文件：`test/question.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('QuestionController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test', password: 'test123' });
    
    authToken = loginResponse.body.accessToken;
  });

  it('/questions (POST)', () => {
    return request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Question',
        content: 'Test Content',
        type: 'single_choice',
        difficulty: 'easy',
        categoryId: 'category-id',
        answer: 'A',
      })
      .expect(201);
  });

  it('/questions (GET)', () => {
    return request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### 8.3 运行测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```


---

## 9. 最佳实践

### 9.1 项目结构

```
src/
├── common/                    # 公共模块
│   ├── decorators/           # 自定义装饰器
│   ├── dto/                  # 公共 DTO
│   ├── filters/              # 异常过滤器
│   ├── guards/               # 守卫
│   ├── interceptors/         # 拦截器
│   └── pipes/                # 管道
├── config/                    # 配置
├── database/                  # 数据库
│   ├── migrations/           # 迁移文件
│   └── seeds/                # 种子数据
├── modules/                   # 业务模块
│   └── question/             # 题目模块
│       ├── dto/              # 数据传输对象
│       ├── entities/         # 实体
│       ├── enums/            # 枚举
│       ├── question.controller.ts
│       ├── question.service.ts
│       ├── question.module.ts
│       └── question.service.spec.ts
├── app.module.ts
└── main.ts
```

### 9.2 命名规范

1. **文件命名**：
   - 使用 kebab-case：`question.service.ts`
   - 测试文件：`question.service.spec.ts`
   - E2E 测试：`question.e2e-spec.ts`

2. **类命名**：
   - 使用 PascalCase：`QuestionService`
   - 添加后缀：`QuestionController`, `CreateQuestionDto`

3. **变量命名**：
   - 使用 camelCase：`questionService`
   - 常量使用 UPPER_SNAKE_CASE：`MAX_PAGE_SIZE`

### 9.3 代码组织

1. **单一职责原则**：
   - Controller 只负责路由和参数处理
   - Service 负责业务逻辑
   - Repository 负责数据访问

2. **依赖注入**：
   - 使用构造函数注入
   - 避免循环依赖

3. **异常处理**：
   - 使用内置异常类
   - 创建自定义异常过滤器

### 9.4 验证和转换

**全局验证管道：**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // 删除非白名单属性
    forbidNonWhitelisted: true, // 禁止非白名单属性
    transform: true,            // 自动类型转换
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### 9.5 错误处理

**创建全局异常过滤器：**

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

**在 main.ts 中使用：**

```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

### 9.6 响应拦截器

**统一响应格式：**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
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
      map((data) => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
      })),
    );
  }
}
```

### 9.7 自定义装饰器

**获取当前用户：**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**使用：**

```typescript
@Post()
create(
  @Body() createDto: CreateQuestionDto,
  @CurrentUser() user: JwtPayload,
) {
  return this.questionService.create(createDto, user.sub);
}
```

### 9.8 环境配置

**使用 ConfigModule：**

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}
```

**在服务中使用：**

```typescript
constructor(private configService: ConfigService) {
  const dbHost = this.configService.get<string>('DB_HOST');
}
```

### 9.9 日志

**使用内置 Logger：**

```typescript
import { Logger } from '@nestjs/common';

export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);

  async create(dto: CreateQuestionDto) {
    this.logger.log('Creating question...');
    // ...
  }
}
```

### 9.10 性能优化

1. **数据库查询优化**：
   - 使用 select 只查询需要的字段
   - 合理使用索引
   - 避免 N+1 查询问题

2. **缓存**：
   - 使用 Redis 缓存热点数据
   - 使用 @nestjs/cache-manager

3. **分页**：
   - 始终对列表查询进行分页
   - 限制最大页面大小

---

## 10. 常用命令速查

### 10.1 NestJS CLI

```bash
# 生成模块
nest g module question

# 生成控制器
nest g controller question

# 生成服务
nest g service question

# 生成完整资源（CRUD）
nest g resource question

# 生成守卫
nest g guard auth

# 生成拦截器
nest g interceptor transform

# 生成过滤器
nest g filter all-exceptions

# 生成管道
nest g pipe validation
```

### 10.2 开发命令

```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod

# 调试模式
npm run start:debug

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 10.3 数据库命令

```bash
# 生成迁移
npm run typeorm migration:generate -- src/database/migrations/MigrationName

# 运行迁移
npm run typeorm migration:run

# 回滚迁移
npm run typeorm migration:revert

# 运行种子数据
npm run seed
```

---

## 11. 学习路径建议

### 11.1 初级阶段（1-2周）

1. **理解核心概念**：
   - 模块、控制器、服务
   - 依赖注入
   - 装饰器

2. **实践项目**：
   - 创建简单的 CRUD API
   - 使用 TypeORM 连接数据库
   - 添加基本验证

### 11.2 中级阶段（2-4周）

1. **深入学习**：
   - 中间件、守卫、拦截器、管道
   - JWT 认证和授权
   - 异常处理

2. **实践项目**：
   - 实现完整的认证系统
   - 添加角色权限控制
   - 集成 Swagger 文档

### 11.3 高级阶段（4-8周）

1. **高级特性**：
   - 微服务架构
   - WebSocket
   - 任务调度
   - 缓存策略

2. **实践项目**：
   - 构建复杂的业务系统
   - 性能优化
   - 部署和运维

---

## 12. 参考资源

### 12.1 官方文档

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 官方文档](https://typeorm.io/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

### 12.2 推荐学习资源

- NestJS 官方课程
- TypeScript 深入学习
- 设计模式和架构

### 12.3 社区资源

- [NestJS GitHub](https://github.com/nestjs/nest)
- [NestJS Discord](https://discord.gg/nestjs)
- Stack Overflow

---

## 总结

通过本指南，你应该已经掌握了：

1. ✅ NestJS 的核心概念和架构
2. ✅ 如何创建一个完整的模块（以 question 模块为例）
3. ✅ 实体、DTO、服务、控制器的实现
4. ✅ TypeORM 数据库集成
5. ✅ API 文档和测试
6. ✅ 最佳实践和常用技巧

**下一步建议**：

1. 动手实践：按照本指南创建自己的模块
2. 阅读项目代码：深入理解 question-backend 项目
3. 扩展功能：尝试添加新功能（如评论、收藏等）
4. 学习进阶：探索微服务、WebSocket 等高级特性

祝你学习愉快！🚀
