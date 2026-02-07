# 标签模块 (Tag Module)

## 模块概述

标签模块管理题目的标签，支持颜色自定义和题目数量统计。

## 文件结构

```
modules/tag/
├── tag.module.ts
├── tag.controller.ts
├── tag.service.ts
├── dto/
│   ├── create-tag.dto.ts
│   └── update-tag.dto.ts
└── entities/
    └── tag.entity.ts
```

## 数据模型

```typescript
// entities/tag.entity.ts
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30, unique: true })
  name: string;

  @Column({ length: 7, default: '#1890ff' })
  color: string;  // 十六进制颜色

  @Column({ default: 0 })
  questionCount: number;  // 关联题目数量

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## DTO 定义

```typescript
// dto/create-tag.dto.ts
export class CreateTagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色格式不正确' })
  color?: string;
}
```

## 核心功能

### 创建标签

```typescript
async create(dto: CreateTagDto): Promise<Tag> {
  // 检查名称重复
  const existing = await this.tagRepository.findOne({
    where: { name: dto.name },
  });
  if (existing) {
    throw new ConflictException('标签名称已存在');
  }

  const tag = this.tagRepository.create({
    name: dto.name,
    color: dto.color || '#1890ff',
  });

  return this.tagRepository.save(tag);
}
```

### 批量查询

```typescript
async findByIds(ids: string[]): Promise<Tag[]> {
  if (!ids.length) return [];
  return this.tagRepository.findBy({ id: In(ids) });
}
```

### 更新题目数量

```typescript
async updateQuestionCounts(tagIds: string[], delta: number): Promise<void> {
  if (!tagIds.length) return;
  
  await this.tagRepository
    .createQueryBuilder()
    .update(Tag)
    .set({ questionCount: () => `"questionCount" + ${delta}` })
    .whereInIds(tagIds)
    .execute();
}
```

### 删除标签

```typescript
async remove(id: string): Promise<void> {
  const tag = await this.findById(id);
  
  // 标签可以直接删除，题目的标签关联会自动解除
  await this.tagRepository.remove(tag);
}
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /tags | 获取所有标签 |
| GET | /tags/:id | 获取单个标签 |
| POST | /tags | 创建标签 |
| PATCH | /tags/:id | 更新标签 |
| DELETE | /tags/:id | 删除标签 |

## 控制器

```typescript
@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTagDto) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.remove(id);
  }
}
```

## 与题目的关联

题目和标签是多对多关系，通过中间表 `question_tags` 关联：

```typescript
// question.entity.ts
@ManyToMany(() => Tag)
@JoinTable({
  name: 'question_tags',
  joinColumn: { name: 'questionId' },
  inverseJoinColumn: { name: 'tagId' },
})
tags: Tag[];
```

创建/更新题目时自动维护关联：

```typescript
// question.service.ts
async create(dto: CreateQuestionDto): Promise<Question> {
  const tags = dto.tagIds ? await this.tagService.findByIds(dto.tagIds) : [];
  
  const question = this.questionRepository.create({
    ...dto,
    tags,
  });
  
  await this.questionRepository.save(question);
  
  // 更新标签的题目数量
  if (dto.tagIds?.length) {
    await this.tagService.updateQuestionCounts(dto.tagIds, 1);
  }
  
  return question;
}
```
