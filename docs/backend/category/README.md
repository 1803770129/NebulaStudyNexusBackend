# 分类模块 (Category Module)

## 模块概述

分类模块管理题目的分类，支持最多 3 级的树形结构。

## 文件结构

```
modules/category/
├── category.module.ts
├── category.controller.ts
├── category.service.ts
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
└── entities/
    └── category.entity.ts
```

## 数据模型

```typescript
// entities/category.entity.ts
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ default: 1 })
  level: number;  // 层级：1-3

  @Column({ default: '' })
  path: string;   // 路径：parent1Id/parent2Id

  @Column({ default: 0 })
  questionCount: number;  // 关联题目数量

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 核心功能

### 创建分类

```typescript
async create(dto: CreateCategoryDto): Promise<Category> {
  const { name, parentId } = dto;

  // 检查同级名称重复
  const existing = await this.categoryRepository.findOne({
    where: { name, parentId: parentId || null },
  });
  if (existing) {
    throw new ConflictException('同级分类名称已存在');
  }

  let level = 1;
  let path = '';

  // 有父分类时，验证层级
  if (parentId) {
    const parent = await this.findById(parentId);
    if (parent.level >= 3) {
      throw new BadRequestException('分类层级不能超过3级');
    }
    level = parent.level + 1;
    path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
  }

  const category = this.categoryRepository.create({
    name,
    parentId: parentId || null,
    level,
    path,
  });

  return this.categoryRepository.save(category);
}
```

### 获取分类树

```typescript
async findTree(): Promise<CategoryTreeNode[]> {
  const categories = await this.categoryRepository.find({
    order: { level: 'ASC', createdAt: 'ASC' },
  });
  return this.buildTree(categories);
}

private buildTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // 创建节点映射
  categories.forEach(cat => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      level: cat.level,
      questionCount: cat.questionCount,
      children: [],
    });
  });

  // 构建树
  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      parent?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### 删除分类

```typescript
async remove(id: string): Promise<void> {
  const category = await this.findById(id);

  // 检查是否有子分类
  const children = await this.categoryRepository.count({
    where: { parentId: id },
  });
  if (children > 0) {
    throw new BadRequestException('请先删除子分类');
  }

  // 检查是否有关联题目
  if (category.questionCount > 0) {
    throw new BadRequestException('该分类下有题目，请先移动或删除');
  }

  await this.categoryRepository.remove(category);
}
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /categories | 获取所有分类（扁平） |
| GET | /categories/tree | 获取分类树 |
| GET | /categories/:id | 获取单个分类 |
| POST | /categories | 创建分类 |
| PATCH | /categories/:id | 更新分类 |
| DELETE | /categories/:id | 删除分类 |

## 前端对接

```typescript
// 获取分类树
const response = await api.get<{ data: CategoryTreeNode[] }>('/categories/tree');

// 转换为前端格式
function convertApiTreeNode(node: ApiTreeNode): CategoryTreeNode {
  return {
    key: node.id,
    title: node.name,
    children: node.children?.map(convertApiTreeNode) || [],
    data: {
      id: node.id,
      name: node.name,
      level: node.level,
      questionCount: node.questionCount,
    },
  };
}
```
