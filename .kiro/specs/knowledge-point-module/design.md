# 知识点模块设计文档

## 1. 架构设计

### 1.1 模块结构

```
modules/knowledge-point/
├── knowledge-point.module.ts          # 模块定义
├── knowledge-point.controller.ts      # 控制器
├── knowledge-point.service.ts         # 服务层
├── dto/
│   ├── index.ts
│   ├── create-knowledge-point.dto.ts  # 创建 DTO
│   ├── update-knowledge-point.dto.ts  # 更新 DTO
│   └── query-knowledge-point.dto.ts   # 查询 DTO
└── entities/
    └── knowledge-point.entity.ts      # 实体定义
```

### 1.2 依赖关系

```
KnowledgePointModule
├── imports: [TypeOrmModule, CategoryModule, TagModule]
├── controllers: [KnowledgePointController]
├── providers: [KnowledgePointService]
└── exports: [KnowledgePointService]
```

## 2. 数据库设计

### 2.1 实体定义

```typescript
// entities/knowledge-point.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Category } from '@/modules/category/entities/category.entity';
import { Tag } from '@/modules/tag/entities/tag.entity';

/**
 * 富文本内容结构
 */
export interface RichContent {
  raw: string;      // 原始内容
  rendered: string; // 渲染后内容
}

@Entity('knowledge_points')
export class KnowledgePoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('jsonb')
  content: RichContent;

  @Column('jsonb', { nullable: true })
  extension: RichContent | null;

  // 分类关联（多对一）
  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  // 标签关联（多对多）
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'knowledge_point_tags',
    joinColumn: { name: 'knowledgePointId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // 父子关系（树形结构）
  @ManyToOne(() => KnowledgePoint, kp => kp.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: KnowledgePoint | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => KnowledgePoint, kp => kp.parent)
  children: KnowledgePoint[];

  @Column({ default: 1 })
  level: number;

  @Column({ default: '' })
  path: string;

  @Column({ default: 0 })
  questionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```


### 2.2 Question 实体更新

```typescript
// question.entity.ts 中添加
import { KnowledgePoint } from '@/modules/knowledge-point/entities/knowledge-point.entity';

@Entity('questions')
export class Question {
  // ... 现有字段 ...

  // 知识点关联（多对多）
  @ManyToMany(() => KnowledgePoint, { cascade: true })
  @JoinTable({
    name: 'question_knowledge_points',
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'knowledgePointId', referencedColumnName: 'id' },
  })
  knowledgePoints: KnowledgePoint[];
}
```

### 2.3 数据库表结构

#### knowledge_points 表
```sql
CREATE TABLE knowledge_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  content JSONB NOT NULL,
  extension JSONB,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES knowledge_points(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  path VARCHAR(255) DEFAULT '',
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kp_category ON knowledge_points(category_id);
CREATE INDEX idx_kp_parent ON knowledge_points(parent_id);
CREATE INDEX idx_kp_name ON knowledge_points(name);
```


#### question_knowledge_points 表（中间表）
```sql
CREATE TABLE question_knowledge_points (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  knowledge_point_id UUID REFERENCES knowledge_points(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, knowledge_point_id)
);

CREATE INDEX idx_qkp_question ON question_knowledge_points(question_id);
CREATE INDEX idx_qkp_kp ON question_knowledge_points(knowledge_point_id);
```

#### knowledge_point_tags 表（中间表）
```sql
CREATE TABLE knowledge_point_tags (
  knowledge_point_id UUID REFERENCES knowledge_points(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (knowledge_point_id, tag_id)
);

CREATE INDEX idx_kpt_kp ON knowledge_point_tags(knowledge_point_id);
CREATE INDEX idx_kpt_tag ON knowledge_point_tags(tag_id);
```

## 3. DTO 设计

### 3.1 创建知识点 DTO

```typescript
// dto/create-knowledge-point.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RichContentDto {
  @ApiProperty({ description: '原始内容' })
  @IsString()
  @IsNotEmpty()
  raw: string;

  @ApiProperty({ description: '渲染后内容' })
  @IsString()
  @IsNotEmpty()
  rendered: string;
}


export class CreateKnowledgePointDto {
  @ApiProperty({ description: '知识点名称', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: '知识点名称不能为空' })
  @MaxLength(100, { message: '知识点名称不能超过100个字符' })
  name: string;

  @ApiProperty({ description: '知识点内容', type: RichContentDto })
  @ValidateNested()
  @Type(() => RichContentDto)
  content: RichContentDto;

  @ApiPropertyOptional({ description: '拓展内容', type: RichContentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RichContentDto)
  extension?: RichContentDto;

  @ApiPropertyOptional({ description: '分类 ID' })
  @IsOptional()
  @IsUUID('4', { message: '分类 ID 格式不正确' })
  categoryId?: string;

  @ApiPropertyOptional({ description: '父知识点 ID' })
  @IsOptional()
  @IsUUID('4', { message: '父知识点 ID 格式不正确' })
  parentId?: string;

  @ApiPropertyOptional({ description: '标签 ID 列表', type: [String] })
  @IsOptional()
  @IsUUID('4', { each: true, message: '标签 ID 格式不正确' })
  tagIds?: string[];
}
```

### 3.2 更新知识点 DTO

```typescript
// dto/update-knowledge-point.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgePointDto } from './create-knowledge-point.dto';

export class UpdateKnowledgePointDto extends PartialType(CreateKnowledgePointDto) {}
```


### 3.3 查询知识点 DTO

```typescript
// dto/query-knowledge-point.dto.ts
import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryKnowledgePointDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '分类 ID' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ description: '标签 ID' })
  @IsOptional()
  @IsUUID('4')
  tagId?: string;

  @ApiPropertyOptional({ description: '父知识点 ID' })
  @IsOptional()
  @IsUUID('4')
  parentId?: string;
}
```

## 4. Service 层设计

### 4.1 核心方法

```typescript
// knowledge-point.service.ts
export interface KnowledgePointTreeNode {
  id: string;
  name: string;
  level: number;
  path: string;
  questionCount: number;
  categoryId: string | null;
  children: KnowledgePointTreeNode[];
}


@Injectable()
export class KnowledgePointService {
  private readonly MAX_LEVEL = 3;

  constructor(
    @InjectRepository(KnowledgePoint)
    private readonly kpRepository: Repository<KnowledgePoint>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  // 创建知识点
  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint>

  // 获取知识点列表（分页）
  async findAll(query: QueryKnowledgePointDto): Promise<PaginationResponse<KnowledgePoint>>

  // 获取知识点树
  async findTree(categoryId?: string): Promise<KnowledgePointTreeNode[]>

  // 根据 ID 查找
  async findById(id: string): Promise<KnowledgePoint>

  // 根据 ID 列表查找
  async findByIds(ids: string[]): Promise<KnowledgePoint[]>

  // 更新知识点
  async update(id: string, dto: UpdateKnowledgePointDto): Promise<KnowledgePoint>

  // 删除知识点
  async remove(id: string): Promise<void>

  // 更新题目数量
  async updateQuestionCount(id: string, delta: number): Promise<void>

  // 批量更新题目数量
  async updateQuestionCounts(ids: string[], delta: number): Promise<void>

  // 获取知识点关联的题目
  async getQuestions(id: string, query: PaginationQueryDto): Promise<PaginationResponse<Question>>

  // 构建树形结构
  private buildTree(kps: KnowledgePoint[]): KnowledgePointTreeNode[]
}
```


### 4.2 创建知识点逻辑

```typescript
async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
  const { name, content, extension, categoryId, parentId, tagIds } = dto;

  // 1. 检查同级名称重复
  const existing = await this.kpRepository.findOne({
    where: { name, parentId: parentId || null },
  });
  if (existing) {
    throw new ConflictException('同级知识点名称已存在');
  }

  // 2. 验证分类
  if (categoryId) {
    await this.categoryService.findById(categoryId);
  }

  // 3. 计算层级和路径
  let level = 1;
  let path = '';
  if (parentId) {
    const parent = await this.findById(parentId);
    if (parent.level >= this.MAX_LEVEL) {
      throw new BadRequestException(`知识点层级不能超过${this.MAX_LEVEL}级`);
    }
    level = parent.level + 1;
    path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
  }

  // 4. 获取标签
  const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

  // 5. 创建知识点
  const kp = this.kpRepository.create({
    name,
    content,
    extension: extension || null,
    categoryId: categoryId || null,
    parentId: parentId || null,
    level,
    path,
    tags,
  });

  return this.kpRepository.save(kp);
}
```


### 4.3 查询知识点列表逻辑

```typescript
async findAll(query: QueryKnowledgePointDto): Promise<PaginationResponse<KnowledgePoint>> {
  const { page = 1, limit = 20, search, categoryId, tagId, parentId } = query;

  const qb = this.kpRepository
    .createQueryBuilder('kp')
    .leftJoinAndSelect('kp.category', 'category')
    .leftJoinAndSelect('kp.tags', 'tags');

  // 搜索
  if (search) {
    qb.andWhere('kp.name ILIKE :search', { search: `%${search}%` });
  }

  // 按分类筛选
  if (categoryId) {
    qb.andWhere('kp.categoryId = :categoryId', { categoryId });
  }

  // 按标签筛选
  if (tagId) {
    qb.andWhere('tags.id = :tagId', { tagId });
  }

  // 按父知识点筛选
  if (parentId !== undefined) {
    if (parentId === null || parentId === '') {
      qb.andWhere('kp.parentId IS NULL');
    } else {
      qb.andWhere('kp.parentId = :parentId', { parentId });
    }
  }

  // 排序
  qb.orderBy('kp.level', 'ASC')
    .addOrderBy('kp.createdAt', 'DESC');

  // 分页
  const [data, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```


### 4.4 删除知识点逻辑

```typescript
async remove(id: string): Promise<void> {
  const kp = await this.findById(id);

  // 1. 检查是否有子知识点
  const childCount = await this.kpRepository.count({
    where: { parentId: id },
  });
  if (childCount > 0) {
    throw new BadRequestException('请先删除子知识点');
  }

  // 2. 检查是否有关联题目
  if (kp.questionCount > 0) {
    throw new BadRequestException('该知识点下有题目，请先处理相关题目');
  }

  // 3. 删除知识点（标签关联会自动清理）
  await this.kpRepository.remove(kp);
}
```

### 4.5 构建树形结构逻辑

```typescript
private buildTree(kps: KnowledgePoint[]): KnowledgePointTreeNode[] {
  const map = new Map<string, KnowledgePointTreeNode>();
  const roots: KnowledgePointTreeNode[] = [];

  // 创建节点映射
  kps.forEach(kp => {
    map.set(kp.id, {
      id: kp.id,
      name: kp.name,
      level: kp.level,
      path: kp.path,
      questionCount: kp.questionCount,
      categoryId: kp.categoryId,
      children: [],
    });
  });

  // 构建树结构
  kps.forEach(kp => {
    const node = map.get(kp.id)!;
    if (kp.parentId) {
      const parent = map.get(kp.parentId);
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


## 5. Controller 层设计

```typescript
// knowledge-point.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KnowledgePointService } from './knowledge-point.service';
import {
  CreateKnowledgePointDto,
  UpdateKnowledgePointDto,
  QueryKnowledgePointDto,
} from './dto';

@ApiTags('knowledge-points')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-points')
export class KnowledgePointController {
  constructor(private readonly kpService: KnowledgePointService) {}

  @Post()
  @ApiOperation({ summary: '创建知识点' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreateKnowledgePointDto) {
    return this.kpService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取知识点列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: QueryKnowledgePointDto) {
    return this.kpService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取知识点树' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findTree(@Query('categoryId') categoryId?: string) {
    return this.kpService.findTree(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取知识点详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.kpService.findById(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: '更新知识点' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgePointDto,
  ) {
    return this.kpService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除知识点' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.kpService.remove(id);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: '获取知识点关联的题目' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getQuestions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.kpService.getQuestions(id, query);
  }
}
```

## 6. Question Service 更新

### 6.1 创建题目时处理知识点

```typescript
// question.service.ts
async create(dto: CreateQuestionDto): Promise<Question> {
  const { categoryId, tagIds, knowledgePointIds, ...rest } = dto;

  // 验证分类
  const category = await this.categoryService.findById(categoryId);

  // 获取标签
  const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

  // 获取知识点
  const knowledgePoints = knowledgePointIds
    ? await this.knowledgePointService.findByIds(knowledgePointIds)
    : [];

  // 创建题目
  const question = this.questionRepository.create({
    ...rest,
    category,
    tags,
    knowledgePoints,
  });

  await this.questionRepository.save(question);

  // 更新统计
  await this.categoryService.updateQuestionCount(categoryId, 1);
  if (tagIds?.length) {
    await this.tagService.updateQuestionCounts(tagIds, 1);
  }
  if (knowledgePointIds?.length) {
    await this.knowledgePointService.updateQuestionCounts(knowledgePointIds, 1);
  }

  return question;
}
```


### 6.2 更新题目时处理知识点

```typescript
async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
  const question = await this.findById(id);
  const { categoryId, tagIds, knowledgePointIds, ...rest } = dto;

  // 处理知识点变更
  if (knowledgePointIds !== undefined) {
    const oldKpIds = question.knowledgePoints.map(kp => kp.id);
    const newKpIds = knowledgePointIds;

    // 计算增减
    const addedIds = newKpIds.filter(id => !oldKpIds.includes(id));
    const removedIds = oldKpIds.filter(id => !newKpIds.includes(id));

    // 更新统计
    if (addedIds.length > 0) {
      await this.knowledgePointService.updateQuestionCounts(addedIds, 1);
    }
    if (removedIds.length > 0) {
      await this.knowledgePointService.updateQuestionCounts(removedIds, -1);
    }

    // 更新关联
    question.knowledgePoints = await this.knowledgePointService.findByIds(newKpIds);
  }

  // 更新其他字段...
  Object.assign(question, rest);

  return this.questionRepository.save(question);
}
```

### 6.3 删除题目时处理知识点

```typescript
async remove(id: string): Promise<void> {
  const question = await this.findById(id);

  // 更新知识点统计
  const kpIds = question.knowledgePoints.map(kp => kp.id);
  if (kpIds.length > 0) {
    await this.knowledgePointService.updateQuestionCounts(kpIds, -1);
  }

  // 删除题目
  await this.questionRepository.remove(question);
}
```


## 7. 前端设计

### 7.1 API Service

```typescript
// services/knowledgePointService.ts
import api from './api';

export interface KnowledgePoint {
  id: string;
  name: string;
  content: RichContent;
  extension: RichContent | null;
  categoryId: string | null;
  category?: Category;
  parentId: string | null;
  level: number;
  path: string;
  questionCount: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgePointTreeNode {
  id: string;
  name: string;
  level: number;
  questionCount: number;
  categoryId: string | null;
  children: KnowledgePointTreeNode[];
}

export interface CreateKnowledgePointDto {
  name: string;
  content: RichContent;
  extension?: RichContent;
  categoryId?: string;
  parentId?: string;
  tagIds?: string[];
}

export interface QueryKnowledgePointDto {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  tagId?: string;
  parentId?: string;
}

class KnowledgePointService {
  // 创建知识点
  async create(data: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    const response = await api.post('/knowledge-points', data);
    return response.data;
  }

  // 获取知识点列表
  async getList(query: QueryKnowledgePointDto): Promise<PaginationResponse<KnowledgePoint>> {
    const response = await api.get('/knowledge-points', { params: query });
    return response.data;
  }

  // 获取知识点树
  async getTree(categoryId?: string): Promise<KnowledgePointTreeNode[]> {
    const response = await api.get('/knowledge-points/tree', {
      params: { categoryId },
    });
    return response.data;
  }


  // 获取知识点详情
  async getById(id: string): Promise<KnowledgePoint> {
    const response = await api.get(`/knowledge-points/${id}`);
    return response.data;
  }

  // 更新知识点
  async update(id: string, data: Partial<CreateKnowledgePointDto>): Promise<KnowledgePoint> {
    const response = await api.patch(`/knowledge-points/${id}`, data);
    return response.data;
  }

  // 删除知识点
  async delete(id: string): Promise<void> {
    await api.delete(`/knowledge-points/${id}`);
  }

  // 获取知识点关联的题目
  async getQuestions(id: string, query: PaginationQueryDto): Promise<PaginationResponse<Question>> {
    const response = await api.get(`/knowledge-points/${id}/questions`, {
      params: query,
    });
    return response.data;
  }
}

export default new KnowledgePointService();
```

### 7.2 知识点管理页面

```typescript
// pages/KnowledgePointManage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Tree, Button, Input, Select, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import knowledgePointService from '@/services/knowledgePointService';
import categoryService from '@/services/categoryService';
import KnowledgePointForm from '@/components/knowledge-point/KnowledgePointForm';
import KnowledgePointDetail from '@/components/knowledge-point/KnowledgePointDetail';

const { Sider, Content } = Layout;

const KnowledgePointManage: React.FC = () => {
  const [treeData, setTreeData] = useState<KnowledgePointTreeNode[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedKpId, setSelectedKpId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingKp, setEditingKp] = useState<KnowledgePoint | null>(null);

  // 加载知识点树
  const loadTree = async () => {
    try {
      const tree = await knowledgePointService.getTree(selectedCategoryId);
      setTreeData(tree);
    } catch (error) {
      message.error('加载知识点树失败');
    }
  };


  // 加载分类
  const loadCategories = async () => {
    try {
      const list = await categoryService.getList();
      setCategories(list);
    } catch (error) {
      message.error('加载分类失败');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTree();
  }, [selectedCategoryId]);

  // 处理树节点选择
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    setSelectedKpId(selectedKeys[0] as string);
  };

  // 打开创建表单
  const handleCreate = () => {
    setEditingKp(null);
    setIsFormVisible(true);
  };

  // 打开编辑表单
  const handleEdit = (kp: KnowledgePoint) => {
    setEditingKp(kp);
    setIsFormVisible(true);
  };

  // 删除知识点
  const handleDelete = async (id: string) => {
    try {
      await knowledgePointService.delete(id);
      message.success('删除成功');
      loadTree();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              block
            >
              新建知识点
            </Button>
            <Input
              placeholder="搜索知识点"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              placeholder="选择分类"
              allowClear
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              style={{ width: '100%' }}
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </div>
        <Tree
          treeData={convertToAntdTree(treeData)}
          onSelect={handleTreeSelect}
          selectedKeys={selectedKpId ? [selectedKpId] : []}
        />
      </Sider>
      <Content style={{ padding: 24 }}>
        {selectedKpId ? (
          <KnowledgePointDetail
            id={selectedKpId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div>请选择知识点</div>
        )}
      </Content>
      {isFormVisible && (
        <KnowledgePointForm
          knowledgePoint={editingKp}
          onClose={() => setIsFormVisible(false)}
          onSuccess={() => {
            setIsFormVisible(false);
            loadTree();
          }}
        />
      )}
    </Layout>
  );
};

export default KnowledgePointManage;
```


### 7.3 知识点表单组件

```typescript
// components/knowledge-point/KnowledgePointForm.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, TreeSelect, Select, message } from 'antd';
import RichTextEditor from '@/components/editor/RichTextEditor';
import knowledgePointService from '@/services/knowledgePointService';
import categoryService from '@/services/categoryService';
import tagService from '@/services/tagService';

interface Props {
  knowledgePoint: KnowledgePoint | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KnowledgePointForm: React.FC<Props> = ({ knowledgePoint, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [kpTree, setKpTree] = useState<KnowledgePointTreeNode[]>([]);

  useEffect(() => {
    loadData();
    if (knowledgePoint) {
      form.setFieldsValue({
        name: knowledgePoint.name,
        content: knowledgePoint.content,
        extension: knowledgePoint.extension,
        categoryId: knowledgePoint.categoryId,
        parentId: knowledgePoint.parentId,
        tagIds: knowledgePoint.tags.map(t => t.id),
      });
    }
  }, [knowledgePoint]);

  const loadData = async () => {
    try {
      const [cats, tagList, tree] = await Promise.all([
        categoryService.getList(),
        tagService.getList(),
        knowledgePointService.getTree(),
      ]);
      setCategories(cats);
      setTags(tagList);
      setKpTree(tree);
    } catch (error) {
      message.error('加载数据失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (knowledgePoint) {
        await knowledgePointService.update(knowledgePoint.id, values);
        message.success('更新成功');
      } else {
        await knowledgePointService.create(values);
        message.success('创建成功');
      }

      onSuccess();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      title={knowledgePoint ? '编辑知识点' : '新建知识点'}
      open
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="知识点名称"
          rules={[{ required: true, message: '请输入知识点名称' }]}
        >
          <Input placeholder="如：二叉树遍历" maxLength={100} />
        </Form.Item>

        <Form.Item name="categoryId" label="所属分类">
          <Select placeholder="选择分类" allowClear>
            {categories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="parentId" label="父知识点">
          <TreeSelect
            placeholder="选择父知识点（可选）"
            allowClear
            treeData={convertToAntdTree(kpTree)}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="知识点内容"
          rules={[{ required: true, message: '请输入知识点内容' }]}
        >
          <RichTextEditor placeholder="输入知识点的详细说明..." />
        </Form.Item>

        <Form.Item name="extension" label="拓展内容">
          <RichTextEditor placeholder="输入拓展学习资料（可选）..." />
        </Form.Item>

        <Form.Item name="tagIds" label="标签">
          <Select mode="multiple" placeholder="选择标签">
            {tags.map(tag => (
              <Select.Option key={tag.id} value={tag.id}>
                {tag.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KnowledgePointForm;
```


### 7.4 知识点选择器组件

```typescript
// components/knowledge-point/KnowledgePointSelector.tsx
import React, { useState, useEffect } from 'react';
import { Select, Tag, Space } from 'antd';
import knowledgePointService from '@/services/knowledgePointService';

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
  categoryId?: string;
}

const KnowledgePointSelector: React.FC<Props> = ({ value = [], onChange, categoryId }) => {
  const [options, setOptions] = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [categoryId]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const response = await knowledgePointService.getList({
        categoryId,
        limit: 100,
      });
      setOptions(response.data);
    } catch (error) {
      console.error('加载知识点失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchText: string) => {
    if (!searchText) {
      loadOptions();
      return;
    }

    try {
      setLoading(true);
      const response = await knowledgePointService.getList({
        search: searchText,
        categoryId,
        limit: 50,
      });
      setOptions(response.data);
    } catch (error) {
      console.error('搜索知识点失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      mode="multiple"
      placeholder="选择知识点（支持搜索）"
      value={value}
      onChange={onChange}
      loading={loading}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      style={{ width: '100%' }}
    >
      {options.map(kp => (
        <Select.Option key={kp.id} value={kp.id}>
          <Space>
            {kp.name}
            {kp.category && <Tag color="blue">{kp.category.name}</Tag>}
            <Tag>{kp.questionCount} 题</Tag>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
};

export default KnowledgePointSelector;
```


### 7.5 题目表单集成

```typescript
// components/question/QuestionForm.tsx 中添加
import KnowledgePointSelector from '@/components/knowledge-point/KnowledgePointSelector';

// 在表单中添加知识点字段
<Form.Item
  name="knowledgePointIds"
  label="知识点"
  tooltip="选择该题目考察的知识点，可多选"
>
  <KnowledgePointSelector categoryId={form.getFieldValue('categoryId')} />
</Form.Item>
```

## 8. 数据库迁移

### 8.1 创建知识点表

```typescript
// migrations/xxxx-create-knowledge-points.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateKnowledgePoints1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'knowledge_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'content',
            type: 'jsonb',
          },
          {
            name: 'extension',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'categoryId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'int',
            default: 1,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '255',
            default: "''",
          },
          {
            name: 'questionCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );


    // 外键：分类
    await queryRunner.createForeignKey(
      'knowledge_points',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 外键：父知识点
    await queryRunner.createForeignKey(
      'knowledge_points',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 索引
    await queryRunner.query(
      `CREATE INDEX idx_kp_category ON knowledge_points(categoryId)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_kp_parent ON knowledge_points(parentId)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_kp_name ON knowledge_points(name)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('knowledge_points');
  }
}
```

### 8.2 创建中间表

```typescript
// migrations/xxxx-create-knowledge-point-relations.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateKnowledgePointRelations1234567891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // question_knowledge_points 表
    await queryRunner.createTable(
      new Table({
        name: 'question_knowledge_points',
        columns: [
          {
            name: 'questionId',
            type: 'uuid',
          },
          {
            name: 'knowledgePointId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `ALTER TABLE question_knowledge_points ADD PRIMARY KEY (questionId, knowledgePointId)`,
    );


    await queryRunner.createForeignKey(
      'question_knowledge_points',
      new TableForeignKey({
        columnNames: ['questionId'],
        referencedTableName: 'questions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'question_knowledge_points',
      new TableForeignKey({
        columnNames: ['knowledgePointId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // knowledge_point_tags 表
    await queryRunner.createTable(
      new Table({
        name: 'knowledge_point_tags',
        columns: [
          {
            name: 'knowledgePointId',
            type: 'uuid',
          },
          {
            name: 'tagId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `ALTER TABLE knowledge_point_tags ADD PRIMARY KEY (knowledgePointId, tagId)`,
    );

    await queryRunner.createForeignKey(
      'knowledge_point_tags',
      new TableForeignKey({
        columnNames: ['knowledgePointId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'knowledge_point_tags',
      new TableForeignKey({
        columnNames: ['tagId'],
        referencedTableName: 'tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 索引
    await queryRunner.query(
      `CREATE INDEX idx_qkp_question ON question_knowledge_points(questionId)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_qkp_kp ON question_knowledge_points(knowledgePointId)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_kpt_kp ON knowledge_point_tags(knowledgePointId)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_kpt_tag ON knowledge_point_tags(tagId)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('question_knowledge_points');
    await queryRunner.dropTable('knowledge_point_tags');
  }
}
```


## 9. 测试计划

### 9.1 单元测试

#### KnowledgePointService 测试

```typescript
// knowledge-point.service.spec.ts
describe('KnowledgePointService', () => {
  let service: KnowledgePointService;
  let repository: Repository<KnowledgePoint>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KnowledgePointService,
        {
          provide: getRepositoryToken(KnowledgePoint),
          useClass: Repository,
        },
        // Mock CategoryService, TagService
      ],
    }).compile();

    service = module.get<KnowledgePointService>(KnowledgePointService);
    repository = module.get<Repository<KnowledgePoint>>(
      getRepositoryToken(KnowledgePoint),
    );
  });

  describe('create', () => {
    it('应该成功创建知识点', async () => {
      // 测试创建逻辑
    });

    it('应该检测同级名称重复', async () => {
      // 测试名称重复检测
    });

    it('应该验证层级限制', async () => {
      // 测试层级限制
    });
  });

  describe('findAll', () => {
    it('应该返回分页数据', async () => {
      // 测试分页查询
    });

    it('应该支持搜索', async () => {
      // 测试搜索功能
    });

    it('应该支持按分类筛选', async () => {
      // 测试分类筛选
    });
  });

  describe('remove', () => {
    it('应该检查子知识点', async () => {
      // 测试删除前检查
    });

    it('应该检查关联题目', async () => {
      // 测试关联题目检查
    });
  });
});
```


### 9.2 集成测试

```typescript
// knowledge-point.e2e.spec.ts
describe('KnowledgePoint (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // 初始化测试应用
  });

  describe('/knowledge-points (POST)', () => {
    it('应该创建知识点', () => {
      return request(app.getHttpServer())
        .post('/knowledge-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '二叉树遍历',
          content: {
            raw: '二叉树遍历...',
            rendered: '<p>二叉树遍历...</p>',
          },
        })
        .expect(201);
    });

    it('应该验证必填字段', () => {
      return request(app.getHttpServer())
        .post('/knowledge-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/knowledge-points (GET)', () => {
    it('应该返回知识点列表', () => {
      return request(app.getHttpServer())
        .get('/knowledge-points')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toBeDefined();
        });
    });

    it('应该支持分页', () => {
      return request(app.getHttpServer())
        .get('/knowledge-points?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/knowledge-points/tree (GET)', () => {
    it('应该返回知识点树', () => {
      return request(app.getHttpServer())
        .get('/knowledge-points/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toBeInstanceOf(Array);
        });
    });
  });
});
```


### 9.3 前端测试

```typescript
// KnowledgePointSelector.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KnowledgePointSelector from '@/components/knowledge-point/KnowledgePointSelector';
import knowledgePointService from '@/services/knowledgePointService';

jest.mock('@/services/knowledgePointService');

describe('KnowledgePointSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该加载知识点选项', async () => {
    const mockData = {
      data: [
        { id: '1', name: '二叉树遍历', questionCount: 10 },
        { id: '2', name: '动态规划', questionCount: 15 },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    };

    (knowledgePointService.getList as jest.Mock).mockResolvedValue(mockData);

    render(<KnowledgePointSelector />);

    await waitFor(() => {
      expect(screen.getByText('二叉树遍历')).toBeInTheDocument();
      expect(screen.getByText('动态规划')).toBeInTheDocument();
    });
  });

  it('应该支持搜索', async () => {
    const mockData = {
      data: [{ id: '1', name: '二叉树遍历', questionCount: 10 }],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    };

    (knowledgePointService.getList as jest.Mock).mockResolvedValue(mockData);

    render(<KnowledgePointSelector />);

    const input = screen.getByPlaceholderText('选择知识点（支持搜索）');
    fireEvent.change(input, { target: { value: '二叉树' } });

    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalledWith({
        search: '二叉树',
        limit: 50,
      });
    });
  });
});
```

## 10. 性能优化

### 10.1 数据库查询优化

```typescript
// 使用 JOIN 减少查询次数
async findAll(query: QueryKnowledgePointDto) {
  const qb = this.kpRepository
    .createQueryBuilder('kp')
    .leftJoinAndSelect('kp.category', 'category')
    .leftJoinAndSelect('kp.tags', 'tags')
    .select([
      'kp.id',
      'kp.name',
      'kp.level',
      'kp.questionCount',
      'category.id',
      'category.name',
      'tags.id',
      'tags.name',
      'tags.color',
    ]);

  // ... 其他查询逻辑
}
```


### 10.2 缓存策略

```typescript
// 使用 Redis 缓存知识点树
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class KnowledgePointService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ... 其他依赖
  ) {}

  async findTree(categoryId?: string): Promise<KnowledgePointTreeNode[]> {
    const cacheKey = `kp_tree_${categoryId || 'all'}`;
    
    // 尝试从缓存获取
    const cached = await this.cacheManager.get<KnowledgePointTreeNode[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 查询数据库
    const qb = this.kpRepository
      .createQueryBuilder('kp')
      .orderBy('kp.level', 'ASC')
      .addOrderBy('kp.createdAt', 'ASC');

    if (categoryId) {
      qb.where('kp.categoryId = :categoryId', { categoryId });
    }

    const kps = await qb.getMany();
    const tree = this.buildTree(kps);

    // 缓存 5 分钟
    await this.cacheManager.set(cacheKey, tree, 300);

    return tree;
  }

  // 创建/更新/删除时清除缓存
  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    const kp = await this.createKnowledgePoint(dto);
    await this.clearTreeCache();
    return kp;
  }

  private async clearTreeCache(): Promise<void> {
    const keys = await this.cacheManager.store.keys('kp_tree_*');
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
```

### 10.3 前端优化

```typescript
// 使用 React Query 缓存数据
import { useQuery } from '@tanstack/react-query';

export const useKnowledgePointTree = (categoryId?: string) => {
  return useQuery({
    queryKey: ['knowledgePointTree', categoryId],
    queryFn: () => knowledgePointService.getTree(categoryId),
    staleTime: 5 * 60 * 1000, // 5 分钟
    cacheTime: 10 * 60 * 1000, // 10 分钟
  });
};

// 使用虚拟滚动优化大列表
import { FixedSizeList } from 'react-window';

const KnowledgePointList: React.FC = () => {
  const { data } = useKnowledgePointList();

  return (
    <FixedSizeList
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {data[index].name}
        </div>
      )}
    </FixedSizeList>
  );
};
```


## 11. 安全考虑

### 11.1 权限控制

```typescript
// 使用角色守卫保护接口
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@Controller('knowledge-points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgePointController {
  @Post()
  @Roles('admin', 'teacher')
  create(@Body() dto: CreateKnowledgePointDto) {
    return this.kpService.create(dto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  findAll(@Query() query: QueryKnowledgePointDto) {
    return this.kpService.findAll(query);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.kpService.remove(id);
  }
}
```

### 11.2 输入验证

```typescript
// 使用 class-validator 验证输入
export class CreateKnowledgePointDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/, {
    message: '知识点名称只能包含字母、数字、汉字和空格',
  })
  name: string;

  @ValidateNested()
  @Type(() => RichContentDto)
  content: RichContentDto;

  // ... 其他字段
}
```

### 11.3 XSS 防护

```typescript
// 富文本内容需要进行 HTML 清理
import * as DOMPurify from 'isomorphic-dompurify';

export class KnowledgePointService {
  private sanitizeRichContent(content: RichContent): RichContent {
    return {
      raw: content.raw,
      rendered: DOMPurify.sanitize(content.rendered, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'img', 'a'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
      }),
    };
  }

  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    const sanitizedDto = {
      ...dto,
      content: this.sanitizeRichContent(dto.content),
      extension: dto.extension ? this.sanitizeRichContent(dto.extension) : null,
    };

    // ... 创建逻辑
  }
}
```


## 12. 错误处理

### 12.1 自定义异常

```typescript
// exceptions/knowledge-point.exception.ts
export class KnowledgePointNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`知识点 ${id} 不存在`);
  }
}

export class KnowledgePointNameConflictException extends ConflictException {
  constructor(name: string) {
    super(`同级知识点名称 "${name}" 已存在`);
  }
}

export class KnowledgePointLevelExceededException extends BadRequestException {
  constructor(maxLevel: number) {
    super(`知识点层级不能超过 ${maxLevel} 级`);
  }
}

export class KnowledgePointHasChildrenException extends BadRequestException {
  constructor() {
    super('请先删除子知识点');
  }
}

export class KnowledgePointHasQuestionsException extends BadRequestException {
  constructor(count: number) {
    super(`该知识点下有 ${count} 道题目，请先处理相关题目`);
  }
}
```

### 12.2 统一错误响应

```typescript
// 使用全局异常过滤器
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
        ? exception.message
        : '服务器内部错误';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## 13. 文档和注释

### 13.1 Swagger 文档

```typescript
// 完善 API 文档
@ApiTags('knowledge-points')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-points')
export class KnowledgePointController {
  @Post()
  @ApiOperation({
    summary: '创建知识点',
    description: '创建一个新的知识点，支持富文本内容和树形结构',
  })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: KnowledgePoint,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 409,
    description: '知识点名称冲突',
  })
  create(@Body() dto: CreateKnowledgePointDto) {
    return this.kpService.create(dto);
  }
}
```


### 13.2 代码注释

```typescript
/**
 * 知识点服务
 * 
 * 负责知识点的 CRUD 操作、树形结构构建、统计更新等功能
 * 
 * @class KnowledgePointService
 */
@Injectable()
export class KnowledgePointService {
  /**
   * 创建知识点
   * 
   * 1. 验证同级名称是否重复
   * 2. 验证分类是否存在
   * 3. 计算层级和路径
   * 4. 关联标签
   * 5. 保存到数据库
   * 
   * @param dto 创建知识点 DTO
   * @returns 创建的知识点实体
   * @throws {ConflictException} 同级名称重复
   * @throws {BadRequestException} 层级超过限制
   * @throws {NotFoundException} 分类或父知识点不存在
   */
  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    // 实现逻辑...
  }

  /**
   * 构建知识点树
   * 
   * 使用 Map 数据结构优化树的构建过程，时间复杂度 O(n)
   * 
   * @param kps 知识点列表
   * @returns 树形结构的知识点节点数组
   * @private
   */
  private buildTree(kps: KnowledgePoint[]): KnowledgePointTreeNode[] {
    // 实现逻辑...
  }
}
```

## 14. 部署和监控

### 14.1 环境变量

```bash
# .env
# 知识点模块配置
KP_MAX_LEVEL=3                    # 最大层级
KP_CACHE_TTL=300                  # 缓存时间（秒）
KP_PAGE_SIZE=20                   # 默认分页大小
```

### 14.2 日志记录

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class KnowledgePointService {
  private readonly logger = new Logger(KnowledgePointService.name);

  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    this.logger.log(`创建知识点: ${dto.name}`);
    
    try {
      const kp = await this.createKnowledgePoint(dto);
      this.logger.log(`知识点创建成功: ${kp.id}`);
      return kp;
    } catch (error) {
      this.logger.error(`知识点创建失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.warn(`删除知识点: ${id}`);
    
    try {
      await this.deleteKnowledgePoint(id);
      this.logger.log(`知识点删除成功: ${id}`);
    } catch (error) {
      this.logger.error(`知识点删除失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```


### 14.3 性能监控

```typescript
// 使用拦截器记录接口性能
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`${method} ${url} - ${duration}ms`);
        
        // 如果响应时间超过 1 秒，记录警告
        if (duration > 1000) {
          console.warn(`慢查询警告: ${method} ${url} - ${duration}ms`);
        }
      }),
    );
  }
}
```

## 15. 实施检查清单

### 15.1 后端开发

- [ ] 创建知识点实体 (knowledge-point.entity.ts)
- [ ] 创建 DTO 文件 (create, update, query)
- [ ] 实现知识点服务 (knowledge-point.service.ts)
- [ ] 实现知识点控制器 (knowledge-point.controller.ts)
- [ ] 创建知识点模块 (knowledge-point.module.ts)
- [ ] 更新题目实体，添加知识点关联
- [ ] 更新题目服务，处理知识点关联
- [ ] 创建数据库迁移文件
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 完善 Swagger 文档

### 15.2 前端开发

- [ ] 创建知识点 API 服务 (knowledgePointService.ts)
- [ ] 创建知识点管理页面 (KnowledgePointManage.tsx)
- [ ] 创建知识点表单组件 (KnowledgePointForm.tsx)
- [ ] 创建知识点详情组件 (KnowledgePointDetail.tsx)
- [ ] 创建知识点选择器组件 (KnowledgePointSelector.tsx)
- [ ] 在题目表单中集成知识点选择器
- [ ] 在题目列表中支持按知识点筛选
- [ ] 添加路由配置
- [ ] 编写组件测试
- [ ] 优化用户体验

### 15.3 测试和部署

- [ ] 运行单元测试
- [ ] 运行集成测试
- [ ] 运行端到端测试
- [ ] 性能测试（大数据量）
- [ ] 安全测试（权限、XSS）
- [ ] 数据库迁移测试
- [ ] 生产环境部署
- [ ] 监控和日志配置

## 16. 后续优化方向

### 16.1 功能增强

- 知识点版本管理（记录修改历史）
- 知识点推荐（根据题目自动推荐知识点）
- 知识点关系图（可视化知识点之间的关系）
- 知识点学习路径（推荐学习顺序）
- 知识点难度评估（根据关联题目难度）

### 16.2 性能优化

- 实现知识点树的懒加载
- 使用 GraphQL 优化查询
- 实现全文搜索（Elasticsearch）
- 优化大数据量下的分页查询

### 16.3 用户体验

- 知识点拖拽排序
- 知识点批量导入/导出
- 知识点模板功能
- 知识点统计报表
- 移动端适配

---

## 总结

本设计文档详细描述了知识点模块的完整实现方案，包括：

1. **数据库设计**：实体定义、表结构、索引优化
2. **后端设计**：Service、Controller、DTO、异常处理
3. **前端设计**：页面组件、表单组件、选择器组件
4. **测试计划**：单元测试、集成测试、前端测试
5. **性能优化**：查询优化、缓存策略、前端优化
6. **安全考虑**：权限控制、输入验证、XSS 防护
7. **部署监控**：环境变量、日志记录、性能监控

按照本设计文档实施，可以构建一个功能完善、性能优良、安全可靠的知识点管理系统。
