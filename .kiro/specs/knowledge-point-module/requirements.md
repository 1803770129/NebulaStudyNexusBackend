# 知识点模块需求文档

## 1. 模块概述

知识点模块用于管理题目相关的知识点信息，支持与分类、题目、标签的关联。知识点可以帮助用户更好地组织和学习题目内容。

## 2. 核心需求

### 2.1 知识点基本信息

每个知识点包含以下字段：

- **知识点名称**（必填）：知识点的标题，如"二叉树遍历"、"动态规划"
- **知识点内容**（必填）：知识点的详细说明，支持富文本格式
- **拓展内容**（可选）：额外的学习资料、参考链接等，支持富文本格式

### 2.2 关联关系

- **与分类关联**：知识点可以归属于某个分类（多对一关系）
- **与题目关联**：一道题目可以关联多个知识点（多对多关系）
- **与标签关联**：知识点可以打标签，便于分类和检索（多对多关系）

### 2.3 功能需求

#### 基础功能
- 创建知识点
- 编辑知识点
- 删除知识点
- 查看知识点详情
- 知识点列表（支持分页、搜索、筛选）

#### 高级功能
- 知识点树形结构（支持父子关系，最多 3 级）
- 按分类筛选知识点
- 按标签筛选知识点
- 知识点统计（关联题目数量）
- 批量操作（批量删除、批量打标签）

## 3. 用户故事

### 3.1 作为管理员

- 我想创建知识点，以便组织题目内容
- 我想编辑知识点内容，以便完善知识体系
- 我想删除无用的知识点，以便保持系统整洁
- 我想查看知识点关联的题目数量，以便了解知识点的使用情况
- 我想按分类浏览知识点，以便快速找到相关内容

### 3.2 作为出题人

- 我想在创建题目时选择知识点，以便标记题目考察的知识点
- 我想为一道题目关联多个知识点，以便准确描述题目内容
- 我想查看某个知识点下的所有题目，以便了解该知识点的题目覆盖情况

### 3.3 作为学习者

- 我想按知识点筛选题目，以便针对性地练习
- 我想查看知识点的详细说明，以便学习相关知识
- 我想查看知识点的拓展内容，以便深入学习

## 4. 数据模型设计

### 4.1 知识点实体 (KnowledgePoint)

```typescript
@Entity('knowledge_points')
export class KnowledgePoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('jsonb')
  content: RichContent;  // 富文本内容

  @Column('jsonb', { nullable: true })
  extension: RichContent | null;  // 拓展内容

  // 分类关联（多对一）
  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  // 标签关联（多对多）
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'knowledge_point_tags',
    joinColumn: { name: 'knowledgePointId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  // 父子关系（支持树形结构）
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
  level: number;  // 层级：1-3

  @Column({ default: '' })
  path: string;  // 路径：parent1Id/parent2Id

  @Column({ default: 0 })
  questionCount: number;  // 关联题目数量

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4.2 题目实体更新 (Question)

在现有 Question 实体中添加知识点关联：

```typescript
// 知识点关联（多对多）
@ManyToMany(() => KnowledgePoint)
@JoinTable({
  name: 'question_knowledge_points',
  joinColumn: { name: 'questionId' },
  inverseJoinColumn: { name: 'knowledgePointId' },
})
knowledgePoints: KnowledgePoint[];
```

### 4.3 数据库表结构

#### knowledge_points 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | varchar(100) | 知识点名称 |
| content | jsonb | 知识点内容（富文本） |
| extension | jsonb | 拓展内容（富文本） |
| categoryId | uuid | 分类 ID（外键） |
| parentId | uuid | 父知识点 ID（外键） |
| level | int | 层级（1-3） |
| path | varchar | 路径 |
| questionCount | int | 关联题目数量 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

#### question_knowledge_points 表（中间表）
| 字段 | 类型 | 说明 |
|------|------|------|
| questionId | uuid | 题目 ID（外键） |
| knowledgePointId | uuid | 知识点 ID（外键） |

#### knowledge_point_tags 表（中间表）
| 字段 | 类型 | 说明 |
|------|------|------|
| knowledgePointId | uuid | 知识点 ID（外键） |
| tagId | uuid | 标签 ID（外键） |

## 5. API 接口设计

### 5.1 知识点 CRUD

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /knowledge-points | 获取知识点列表（支持分页、搜索、筛选） |
| GET | /knowledge-points/tree | 获取知识点树 |
| GET | /knowledge-points/:id | 获取知识点详情 |
| POST | /knowledge-points | 创建知识点 |
| PATCH | /knowledge-points/:id | 更新知识点 |
| DELETE | /knowledge-points/:id | 删除知识点 |

### 5.2 关联查询

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /knowledge-points/:id/questions | 获取知识点关联的题目 |
| GET | /questions?knowledgePointIds=xxx | 按知识点筛选题目 |

### 5.3 请求/响应示例

#### 创建知识点
```json
POST /knowledge-points
{
  "name": "二叉树遍历",
  "content": {
    "raw": "二叉树遍历是指按照某种顺序访问树中的所有节点...",
    "rendered": "<p>二叉树遍历是指按照某种顺序访问树中的所有节点...</p>"
  },
  "extension": {
    "raw": "参考资料：\n1. [二叉树遍历详解](https://example.com)",
    "rendered": "<p>参考资料：</p><ol><li><a href='https://example.com'>二叉树遍历详解</a></li></ol>"
  },
  "categoryId": "uuid-xxx",
  "parentId": "uuid-yyy",
  "tagIds": ["uuid-tag1", "uuid-tag2"]
}
```

#### 获取知识点列表
```json
GET /knowledge-points?page=1&limit=20&search=二叉树&categoryId=uuid-xxx

Response:
{
  "data": [
    {
      "id": "uuid-1",
      "name": "二叉树遍历",
      "content": { "raw": "...", "rendered": "..." },
      "extension": { "raw": "...", "rendered": "..." },
      "categoryId": "uuid-xxx",
      "category": { "id": "uuid-xxx", "name": "数据结构" },
      "parentId": null,
      "level": 1,
      "questionCount": 15,
      "tags": [
        { "id": "uuid-tag1", "name": "算法", "color": "#1890ff" }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## 6. 前端界面设计

### 6.1 知识点管理页面

- 左侧：知识点树形列表（支持展开/折叠）
- 右侧：知识点详情/编辑表单
- 顶部：搜索框、筛选器（按分类、标签）、新建按钮

### 6.2 知识点表单

- 知识点名称（文本输入框）
- 所属分类（下拉选择器）
- 父知识点（树形选择器，可选）
- 知识点内容（富文本编辑器）
- 拓展内容（富文本编辑器，可选）
- 标签（多选标签选择器）

### 6.3 题目表单集成

在题目创建/编辑表单中添加：
- 知识点选择器（支持多选、搜索、按分类筛选）
- 显示已选知识点列表（可删除）

### 6.4 知识点详情页

- 知识点基本信息
- 知识点内容展示（富文本渲染）
- 拓展内容展示
- 关联题目列表（分页）
- 统计信息（题目数量、难度分布等）

## 7. 验收标准

### 7.1 功能验收

- [ ] 可以创建、编辑、删除知识点
- [ ] 知识点支持富文本内容和拓展内容
- [ ] 知识点可以关联分类、标签
- [ ] 知识点支持树形结构（最多 3 级）
- [ ] 题目可以关联多个知识点
- [ ] 可以按知识点筛选题目
- [ ] 知识点统计功能正常（题目数量）
- [ ] 删除知识点时有合理的提示和限制

### 7.2 性能验收

- [ ] 知识点列表加载时间 < 1s
- [ ] 知识点树加载时间 < 2s
- [ ] 支持分页加载（每页 20 条）
- [ ] 搜索响应时间 < 500ms

### 7.3 用户体验验收

- [ ] 界面布局清晰，操作流畅
- [ ] 富文本编辑器功能完善
- [ ] 知识点选择器易用（支持搜索、筛选）
- [ ] 错误提示友好
- [ ] 支持批量操作

## 8. 技术实现要点

### 8.1 后端

- 使用 TypeORM 实现实体关系
- 使用 DTO 进行数据验证
- 实现树形结构的构建算法（参考 Category 模块）
- 实现关联查询优化（使用 JOIN 减少查询次数）
- 实现软删除或级联删除策略

### 8.2 前端

- 使用 Ant Design 的 Tree 组件展示知识点树
- 使用富文本编辑器（Quill）编辑内容
- 使用 TreeSelect 组件选择父知识点
- 使用 Select 组件选择知识点（支持多选）
- 实现知识点缓存，减少重复请求

### 8.3 数据迁移

- 创建知识点表的 migration
- 创建中间表的 migration
- 更新题目表的 migration（如需要）

## 9. 开发计划

### Phase 1: 后端基础功能（2-3 天）
- 创建知识点实体和 DTO
- 实现知识点 CRUD 接口
- 实现树形结构功能
- 编写单元测试

### Phase 2: 题目关联功能（1-2 天）
- 更新题目实体，添加知识点关联
- 更新题目 CRUD 接口
- 实现关联查询接口
- 编写集成测试

### Phase 3: 前端基础功能（2-3 天）
- 创建知识点管理页面
- 实现知识点 CRUD 功能
- 实现知识点树展示
- 实现富文本编辑

### Phase 4: 前端集成功能（1-2 天）
- 在题目表单中集成知识点选择器
- 实现知识点筛选功能
- 实现知识点详情页
- 优化用户体验

### Phase 5: 测试和优化（1 天）
- 端到端测试
- 性能优化
- Bug 修复
- 文档完善

## 10. 风险和注意事项

### 10.1 数据一致性
- 删除知识点时需要处理关联的题目
- 删除分类时需要处理关联的知识点
- 需要实现事务保证数据一致性

### 10.2 性能问题
- 知识点树可能很大，需要考虑懒加载
- 关联查询可能影响性能，需要优化 SQL
- 考虑使用缓存减少数据库查询

### 10.3 用户体验
- 富文本编辑器需要支持图片、公式等
- 知识点选择器需要支持搜索和筛选
- 需要提供清晰的操作反馈

### 10.4 扩展性
- 预留字段，便于后续扩展
- 考虑知识点版本管理
- 考虑知识点权限控制

## 11. 参考资料

- Category 模块实现（树形结构参考）
- Tag 模块实现（多对多关系参考）
- Question 模块实现（富文本处理参考）
- TypeORM 文档（关系映射）
- Ant Design 文档（Tree、TreeSelect 组件）
