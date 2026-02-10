# 知识点模块实施计划

## 概述

本实施计划将知识点模块的设计转化为可执行的开发任务。该模块支持知识点的 CRUD 操作、树形结构管理（最多3级）、与题目的多对多关联，以及与分类和标签的关联。

**当前状态**：后端开发已完成（任务 1-6），前端开发待开始（任务 7-11）

**技术栈**：
- 后端：NestJS + TypeORM + PostgreSQL ✅ 已完成
- 前端：React + TypeScript + Ant Design + React Query ⏳ 待开发
- 测试：Jest + Testing Library

**核心功能**：
- 知识点 CRUD（创建、查询、更新、删除）
- 树形结构（最多3级，支持父子关系）
- 富文本内容（知识点内容和拓展内容）
- 多对多关联（知识点-题目、知识点-标签）
- 多对一关联（知识点-分类）
- 统计功能（关联题目数量）

## 任务列表

### 阶段 1: 后端开发 ✅ 已完成

#### 1. 后端基础设施搭建 ✅

- [x] 1.1 创建知识点实体
  - ✅ 已创建 `knowledge-point.entity.ts`
  - ✅ 定义了所有必需字段和关联关系
  - _Requirements: 2.1, 4.1_

- [x] 1.2 更新 Question 实体添加知识点关联
  - ✅ 已在 `question.entity.ts` 中添加 knowledgePoints 字段
  - ✅ 配置了 ManyToMany 关系和中间表
  - _Requirements: 2.2, 4.2_

#### 2. 后端 DTO 和验证 ✅

- [x] 2.1 创建知识点 DTO 文件
  - ✅ 已创建 `create-knowledge-point.dto.ts`
  - ✅ 定义了 RichContentDto 和 CreateKnowledgePointDto
  - _Requirements: 2.1, 5.3_

- [x] 2.2 创建更新和查询 DTO
  - ✅ 已创建 `update-knowledge-point.dto.ts` 和 `query-knowledge-point.dto.ts`
  - ✅ 添加了完整的验证和 Swagger 文档
  - _Requirements: 2.3, 5.1_


#### 3. 后端核心服务实现 ✅

- [x] 3.1 创建知识点服务基础结构
  - ✅ 已创建 `knowledge-point.service.ts`
  - ✅ 注入了所有必需的依赖
  - _Requirements: 2.1, 4.1_

- [x] 3.2 实现知识点创建逻辑
  - ✅ 实现了完整的 create 方法
  - ✅ 包含名称重复检查、层级验证等
  - _Requirements: 2.3, 3.1_

- [x] 3.3 实现知识点查询逻辑
  - ✅ 实现了 findAll 方法，支持分页、搜索、筛选
  - ✅ 使用 QueryBuilder 优化查询
  - _Requirements: 2.3, 5.1_

- [x] 3.4 实现知识点树构建逻辑
  - ✅ 实现了 findTree 和 buildTree 方法
  - ✅ 使用 Map 优化树构建性能
  - _Requirements: 2.3, 4.1_

- [x] 3.5 实现知识点更新和删除逻辑
  - ✅ 实现了 update 和 remove 方法
  - ✅ 包含完整的验证和错误处理
  - _Requirements: 2.3, 3.1_

- [x] 3.6 实现知识点统计更新逻辑
  - ✅ 实现了 updateQuestionCount 和 updateQuestionCounts 方法
  - ✅ 实现了 getQuestions 方法
  - _Requirements: 2.3, 3.1_

#### 4. 后端控制器和模块 ✅

- [x] 4.1 创建知识点控制器
  - ✅ 已创建 `knowledge-point.controller.ts`
  - ✅ 实现了所有 REST API 端点
  - _Requirements: 2.3, 5.1_

- [x] 4.2 创建知识点模块
  - ✅ 已创建 `knowledge-point.module.ts`
  - ✅ 在 AppModule 中正确导入
  - _Requirements: 1.2_


#### 5. 数据库迁移 ✅

- [x] 5.1 创建知识点表迁移
  - ✅ 已创建并运行 migration
  - ✅ knowledge_points 表已创建
  - _Requirements: 4.1, 8.1_

- [x] 5.2 创建关联表迁移
  - ✅ 已创建并运行 migration
  - ✅ question_knowledge_points 和 knowledge_point_tags 表已创建
  - _Requirements: 4.2, 8.2_

#### 6. 更新题目模块集成知识点 ✅

- [x] 6.1 更新题目 DTO 添加知识点字段
  - ✅ 已在 CreateQuestionDto 中添加 knowledgePointIds 字段
  - ✅ UpdateQuestionDto 已继承该字段
  - _Requirements: 2.2, 5.3_

- [x] 6.2 更新题目服务处理知识点关联
  - ✅ 已在 QuestionService 中注入 KnowledgePointService
  - ✅ create、update、remove 方法已正确处理知识点关联
  - _Requirements: 2.2, 6.1_

- [x] 6.3 更新题目查询支持知识点筛选
  - ✅ 已在 QueryQuestionDto 中添加 knowledgePointIds 字段
  - ✅ findAll 方法已支持按知识点筛选
  - _Requirements: 2.2, 5.2_

- [x] 6.4 Checkpoint - 后端功能验证
  - ✅ 后端 API 已完成并可通过 Swagger 测试
  - ✅ 所有端点正常工作
  - ✅ 数据库关联正确


### 阶段 2: 前端开发 ⏳ 待开始

#### 7. 前端 API 服务层

- [x] 7.1 创建知识点 API 服务
  - 创建 `question-managing/src/services/knowledgePointService.ts`
  - 定义 TypeScript 接口：
    - `RichContent` 接口（raw: string, rendered: string）
    - `KnowledgePoint` 接口（id, name, content, extension, categoryId, category, parentId, level, path, questionCount, tags, createdAt, updatedAt）
    - `KnowledgePointTreeNode` 接口（id, name, level, path, questionCount, categoryId, children）
    - `CreateKnowledgePointDto` 接口（name, content, extension?, categoryId?, parentId?, tagIds?）
    - `QueryKnowledgePointDto` 接口（page?, limit?, search?, categoryId?, tagId?, parentId?）
  - 创建 KnowledgePointService 类，实现以下方法：
    - `create(data)` - POST /knowledge-points
    - `getList(query)` - GET /knowledge-points（返回 PaginationResponse）
    - `getTree(categoryId?)` - GET /knowledge-points/tree（返回树形数组）
    - `getById(id)` - GET /knowledge-points/:id
    - `update(id, data)` - PATCH /knowledge-points/:id
    - `delete(id)` - DELETE /knowledge-points/:id
    - `getQuestions(id, query)` - GET /knowledge-points/:id/questions
  - 导出 knowledgePointService 单例实例
  - 使用项目现有的 API 客户端（axios 实例）
  - _Requirements: 2.3, 5.1_
  - _Design Reference: Section 7.1_

- [x] 7.2 创建 React Query hooks
  - 创建 `question-managing/src/hooks/useKnowledgePoint.ts`
  - 实现 `useKnowledgePointList(query)` hook：
    - 使用 useQuery，queryKey: ['knowledgePoints', 'list', query]
    - 调用 knowledgePointService.getList(query)
    - 配置 staleTime: 2min, cacheTime: 5min
  - 实现 `useKnowledgePointTree(categoryId?)` hook：
    - 使用 useQuery，queryKey: ['knowledgePoints', 'tree', categoryId]
    - 调用 knowledgePointService.getTree(categoryId)
    - 配置 staleTime: 5min, cacheTime: 10min（树结构变化较少）
  - 实现 `useKnowledgePoint(id)` hook：
    - 使用 useQuery，queryKey: ['knowledgePoints', 'detail', id]
    - 调用 knowledgePointService.getById(id)
  - 实现 `useCreateKnowledgePoint()` hook：
    - 使用 useMutation
    - 成功后 invalidate ['knowledgePoints', 'list'] 和 ['knowledgePoints', 'tree']
  - 实现 `useUpdateKnowledgePoint()` hook：
    - 使用 useMutation
    - 成功后 invalidate ['knowledgePoints', 'list'], ['knowledgePoints', 'tree'], ['knowledgePoints', 'detail', id]
  - 实现 `useDeleteKnowledgePoint()` hook：
    - 使用 useMutation
    - 成功后 invalidate ['knowledgePoints', 'list'] 和 ['knowledgePoints', 'tree']
  - _Requirements: 2.3, 10.3_
  - _Design Reference: Section 7.1, Section 10.3_


#### 8. 前端知识点管理页面

- [x] 8.1 创建知识点管理主页面
  - 创建 `question-managing/src/pages/KnowledgePointManage.tsx`
  - 使用 Ant Design Layout 组件（Sider + Content）
  - 左侧 Sider（width: 300, theme="light"）：
    - 顶部操作区（padding: 16）：
      - 新建按钮（Button type="primary", icon={<PlusOutlined />}, block）
      - 搜索框（Input placeholder="搜索知识点", prefix={<SearchOutlined />}）
      - 分类筛选器（Select placeholder="选择分类", allowClear, style={{ width: '100%' }}）
    - 知识点树（Tree 组件，占据剩余空间）
  - 右侧 Content（padding: 24）：
    - 显示选中知识点的详情（KnowledgePointDetail 组件）
    - 未选中时显示空状态提示（Empty 组件）
  - 实现状态管理：
    - selectedKpId: string | null（当前选中的知识点 ID）
    - selectedCategoryId: string | undefined（当前筛选的分类 ID）
    - searchText: string（搜索关键词）
    - isFormVisible: boolean（表单对话框是否可见）
    - editingKp: KnowledgePoint | null（正在编辑的知识点，null 表示新建）
  - 使用 useKnowledgePointTree hook 加载树数据
  - 使用 useEffect 监听 selectedCategoryId 变化，重新加载树
  - 实现事件处理函数：
    - handleTreeSelect(selectedKeys) - 处理树节点选择
    - handleCreate() - 打开新建表单
    - handleEdit(kp) - 打开编辑表单
    - handleDelete(id) - 删除知识点
  - _Requirements: 2.3, 6.1_
  - _Design Reference: Section 7.2_

- [x] 8.2 实现知识点树组件逻辑
  - 在 KnowledgePointManage 中使用 Ant Design Tree 组件
  - 创建工具函数 `convertToAntdTree(nodes: KnowledgePointTreeNode[]): DataNode[]`：
    - 递归转换树节点格式
    - 设置 key: node.id
    - 设置 title: 使用 Space 和 Tag 组件显示名称和题目数量
    - 设置 children: 递归转换子节点
  - 配置 Tree 组件属性：
    - treeData={convertToAntdTree(treeData)}
    - onSelect={handleTreeSelect}
    - selectedKeys={selectedKpId ? [selectedKpId] : []}
    - showLine={true}（显示连接线）
    - defaultExpandAll={false}（默认不展开）
  - 实现搜索功能：
    - 根据 searchText 过滤树节点（递归过滤）
    - 高亮匹配的节点名称
  - 实现分类筛选功能：
    - 当 selectedCategoryId 变化时，调用 useKnowledgePointTree(selectedCategoryId)
    - 显示加载状态（Spin 组件）
  - _Requirements: 2.3, 6.1_
  - _Design Reference: Section 7.2_

- [x] 8.3 创建知识点详情组件
  - 创建 `question-managing/src/components/knowledge-point/KnowledgePointDetail.tsx`
  - 定义 Props 接口：
    - id: string（知识点 ID）
    - onEdit: (kp: KnowledgePoint) => void（编辑回调）
    - onDelete: (id: string) => void（删除回调）
  - 使用 useKnowledgePoint(id) hook 加载详情数据
  - 显示加载状态（Spin 组件，居中显示）
  - 显示错误状态（Alert 组件，type="error"）
  - 显示知识点详情：
    - 标题区域（PageHeader 或 Space）：
      - 知识点名称（Typography.Title level={3}）
      - 操作按钮（Space）：
        - 编辑按钮（Button icon={<EditOutlined />}, onClick={() => onEdit(kp)}）
        - 删除按钮（Button danger, icon={<DeleteOutlined />}, onClick={handleDelete}）
    - 信息卡片（Descriptions 组件）：
      - 所属分类（显示分类名称，带颜色标签）
      - 标签列表（Tag 组件，显示标签名称和颜色）
      - 层级（显示 level）
      - 路径（显示 path，如果为空显示"根节点"）
      - 关联题目数量（Statistic 组件）
      - 创建时间（格式化显示）
      - 更新时间（格式化显示）
    - 知识点内容卡片（Card title="知识点内容"）：
      - 渲染富文本内容（dangerouslySetInnerHTML 或使用富文本渲染组件）
    - 拓展内容卡片（Card title="拓展内容"，如果 extension 存在）：
      - 渲染富文本内容
  - 实现删除确认对话框：
    - 使用 Modal.confirm
    - title: '确认删除'
    - content: '删除后无法恢复，确定要删除该知识点吗？'
    - onOk: 调用 onDelete(id)
  - _Requirements: 2.3, 6.4_
  - _Design Reference: Section 7.2_


#### 9. 前端知识点表单组件

- [x] 9.1 创建知识点表单组件
  - 创建 `question-managing/src/components/knowledge-point/KnowledgePointForm.tsx`
  - 定义 Props 接口：
    - knowledgePoint: KnowledgePoint | null（null 表示新建，非 null 表示编辑）
    - onClose: () => void（关闭回调）
    - onSuccess: () => void（成功回调）
  - 使用 Ant Design Modal 和 Form 组件
  - 添加表单字段（使用 Form.Item）：
    - name（Input，maxLength={100}，required，placeholder="如：二叉树遍历"）
    - categoryId（Select，allowClear，placeholder="选择分类"）
    - parentId（TreeSelect，allowClear，placeholder="选择父知识点（可选）"）
    - content（RichTextEditor，required，placeholder="输入知识点的详细说明..."）
    - extension（RichTextEditor，optional，placeholder="输入拓展学习资料（可选）..."）
    - tagIds（Select mode="multiple"，placeholder="选择标签"）
  - 使用 useEffect 加载数据：
    - 调用 categoryService.getList() 加载分类列表
    - 调用 tagService.getList() 加载标签列表
    - 调用 knowledgePointService.getTree() 加载知识点树（用于父知识点选择）
    - 设置 loading 状态
  - 使用 useEffect 初始化表单值（编辑模式）：
    - 当 knowledgePoint 不为 null 时，调用 form.setFieldsValue
    - 设置 name, content, extension, categoryId, parentId
    - 设置 tagIds（从 knowledgePoint.tags 提取 id 数组）
  - 实现表单提交处理（handleSubmit）：
    - 调用 form.validateFields() 验证表单
    - 根据 knowledgePoint 是否为 null，调用 useCreateKnowledgePoint 或 useUpdateKnowledgePoint
    - 显示 loading 状态（setLoading(true)）
    - 成功后显示 message.success，调用 onSuccess()
    - 失败后显示 message.error
    - finally 中设置 setLoading(false)
  - 配置 Modal 属性：
    - title={knowledgePoint ? '编辑知识点' : '新建知识点'}
    - open={true}
    - onOk={handleSubmit}
    - onCancel={onClose}
    - confirmLoading={loading}
    - width={800}
    - destroyOnClose={true}
  - _Requirements: 2.3, 6.2_
  - _Design Reference: Section 7.3_

- [x] 9.2 集成富文本编辑器
  - 检查项目中是否已有富文本编辑器组件（如 RichTextEditor.tsx）
  - 如果已有，复用现有组件；如果没有，创建 `question-managing/src/components/editor/RichTextEditor.tsx`
  - 选择富文本编辑器库（建议使用项目中已有的库，如 Quill、TinyMCE、Draft.js 等）
  - 配置编辑器工具栏：
    - 基础格式：粗体、斜体、下划线、删除线
    - 列表：有序列表、无序列表
    - 链接：插入链接
    - 其他：清除格式
  - 实现受控组件：
    - 定义 Props 接口：{ value?: RichContent, onChange?: (value: RichContent) => void, placeholder?: string }
    - 维护内部状态：editorContent（编辑器的原始内容）
    - 监听编辑器变化：onEditorChange 回调
    - 转换格式：将编辑器内容转换为 RichContent 格式
      - raw: 原始内容（Markdown 或 HTML）
      - rendered: 渲染后的 HTML
    - 调用 onChange 回调，传递 RichContent 对象
  - 配置编辑器样式：
    - min-height: 200px
    - border: 1px solid #d9d9d9
    - border-radius: 2px
  - 处理初始值：当 value prop 变化时，更新编辑器内容
  - _Requirements: 2.1, 6.2_
  - _Design Reference: Section 7.3_

- [x] 9.3 实现表单验证和错误处理
  - 添加必填字段验证：
    - name: [{ required: true, message: '请输入知识点名称' }]
    - content: [{ required: true, message: '请输入知识点内容' }]
  - 添加长度限制验证：
    - name: [{ max: 100, message: '知识点名称不能超过100个字符' }]
  - 添加格式验证：
    - name: [{ pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/, message: '知识点名称只能包含字母、数字、汉字和空格' }]
  - 处理后端返回的错误信息：
    - 在 catch 块中解析 error.response?.data?.message
    - 如果是字符串，直接显示
    - 如果是数组，显示第一个错误
    - 如果是对象，显示 message 字段
  - 处理网络错误：
    - 检查 error.message 是否包含 'Network Error'
    - 显示友好提示："网络连接失败，请检查网络后重试"
  - 显示成功提示：
    - 创建成功：message.success('知识点创建成功')
    - 更新成功：message.success('知识点更新成功')
  - _Requirements: 2.3, 11.2_
  - _Design Reference: Section 7.3, Section 11.2_


#### 10. 前端知识点选择器组件

- [x] 10.1 创建知识点选择器组件
  - 创建 `question-managing/src/components/knowledge-point/KnowledgePointSelector.tsx`
  - 定义 Props 接口：
    - value?: string[]（当前选中的知识点 ID 数组）
    - onChange?: (value: string[]) => void（选择变化回调）
    - categoryId?: string（按分类筛选）
  - 使用 Ant Design Select 组件（mode="multiple"）
  - 实现知识点选项加载（loadOptions）：
    - 调用 knowledgePointService.getList({ categoryId, limit: 100 })
    - 设置 options 状态（KnowledgePoint[]）
    - 设置 loading 状态
    - 处理错误（console.error）
  - 使用 useEffect 监听 categoryId 变化：
    - 当 categoryId 变化时，调用 loadOptions()
  - 实现搜索功能（handleSearch）：
    - 配置 Select：showSearch={true}, filterOption={false}, onSearch={handleSearch}
    - 当 searchText 为空时，调用 loadOptions()
    - 当 searchText 不为空时，调用 knowledgePointService.getList({ search: searchText, categoryId, limit: 50 })
    - 更新 options 状态
  - 显示知识点信息（Select.Option）：
    - 使用 Space 组件布局
    - 显示知识点名称（kp.name）
    - 显示分类标签（如果 kp.category 存在）：Tag color="blue"
    - 显示题目数量：Tag（{kp.questionCount} 题）
  - 实现受控组件：
    - value={value}
    - onChange={onChange}
  - 显示加载状态：loading={loading}
  - 配置 Select 属性：
    - placeholder="选择知识点（支持搜索）"
    - style={{ width: '100%' }}
    - maxTagCount="responsive"（响应式显示标签数量）
  - _Requirements: 2.2, 6.3_
  - _Design Reference: Section 7.4_

- [x] 10.2 在题目表单中集成知识点选择器
  - 打开 `question-managing/src/components/question/QuestionForm.tsx`（或类似的题目表单组件）
  - 导入 KnowledgePointSelector 组件
  - 在表单中添加 Form.Item：
    - name="knowledgePointIds"
    - label="知识点"
    - tooltip="选择该题目考察的知识点，可多选"
    - extra="可以选择多个知识点来标记题目考察的知识点"
  - 使用 KnowledgePointSelector 组件：
    - 传递 categoryId 属性：categoryId={form.getFieldValue('categoryId')}
    - 使用 Form.Item dependencies={['categoryId']} 监听分类变化
    - 当分类变化时，知识点选择器会自动重新加载选项
  - 显示已选知识点列表（可选）：
    - 在 Form.Item 下方添加 Tag 列表
    - 遍历 form.getFieldValue('knowledgePointIds')
    - 显示每个知识点的名称（Tag closable，点击关闭时从数组中移除）
  - _Requirements: 2.2, 6.3_
  - _Design Reference: Section 7.5_

- [x] 10.3 在题目列表中添加知识点筛选
  - 打开 `question-managing/src/pages/QuestionList.tsx`（或类似的题目列表页面）
  - 在筛选区域添加知识点选择器：
    - 使用 KnowledgePointSelector 组件
    - 维护状态：selectedKnowledgePointIds: string[]
    - 将 knowledgePointIds 传递给题目列表查询（useQuestionList hook）
  - 显示当前筛选的知识点标签：
    - 在筛选区域下方显示 Tag 列表
    - 遍历 selectedKnowledgePointIds
    - 显示每个知识点的名称（Tag closable，点击关闭时从数组中移除）
  - 支持清除筛选：
    - 添加"清除筛选"按钮（Button）
    - 点击时清空 selectedKnowledgePointIds
  - 更新题目列表查询：
    - 在 useQuestionList hook 中添加 knowledgePointIds 参数
    - 后端 API 已支持按知识点筛选（GET /questions?knowledgePointIds=xxx）
  - _Requirements: 2.2, 3.2_
  - _Design Reference: Section 7.5_


#### 11. 前端路由和导航

- [x] 11.1 添加知识点管理路由
  - 找到路由配置文件（通常在 `src/routes/` 或 `src/router/` 目录）
  - 添加知识点管理路由配置：
    - path: '/knowledge-points'
    - element: 使用 React.lazy 懒加载 KnowledgePointManage 组件
    - 示例：`const KnowledgePointManage = React.lazy(() => import('@/pages/KnowledgePointManage'))`
  - 配置路由守卫（如果项目有权限系统）：
    - 需要登录：使用 PrivateRoute 或类似的守卫组件
    - 角色权限：admin 或 teacher 角色可访问
    - 示例：`<Route path="/knowledge-points" element={<PrivateRoute roles={['admin', 'teacher']}><KnowledgePointManage /></PrivateRoute>} />`
  - 配置面包屑导航（如果项目有面包屑系统）：
    - 添加面包屑配置：{ path: '/knowledge-points', breadcrumb: '知识点管理' }
  - 使用 Suspense 包裹懒加载组件：
    - 示例：`<Suspense fallback={<Spin />}><KnowledgePointManage /></Suspense>`
  - _Requirements: 2.3_
  - _Design Reference: Section 7_

- [x] 11.2 在导航菜单中添加知识点入口
  - 找到主导航菜单配置文件（通常在 `src/layouts/` 或 `src/components/` 目录）
  - 在菜单配置数组中添加"知识点管理"菜单项：
    - key: 'knowledge-points'
    - label: '知识点管理'
    - icon: <BookOutlined />（从 @ant-design/icons 导入）
    - path: '/knowledge-points'
  - 配置菜单权限（如果项目有权限系统）：
    - 只对 admin 和 teacher 角色可见
    - 示例：`roles: ['admin', 'teacher']`
  - 配置菜单激活状态：
    - 使用 useLocation hook 获取当前路径
    - 设置 selectedKeys={[location.pathname]}
  - 菜单位置建议：
    - 放在"题目管理"和"分类管理"之间
    - 或者放在"内容管理"分组下
  - _Requirements: 2.3_
  - _Design Reference: Section 7_

- [ ] 11.3 Checkpoint - 前端功能验证
  - 运行前端开发服务器：
    - 执行 `npm run dev` 或 `yarn dev`（根据项目配置）
    - 确认服务器启动成功，无编译错误
  - 验证路由配置：
    - 在浏览器中访问 http://localhost:xxxx/knowledge-points
    - 确认页面正常加载，无 404 错误
    - 验证路由守卫生效（未登录时跳转到登录页）
    - 验证角色权限（非 admin/teacher 角色无法访问）
  - 测试知识点管理页面：
    - 测试知识点树加载和显示（左侧 Sider）
    - 测试树节点选择（点击节点，右侧显示详情）
    - 测试搜索功能（输入关键词，树节点过滤）
    - 测试分类筛选（选择分类，树重新加载）
    - 测试新建按钮（点击后弹出表单对话框）
  - 测试知识点表单：
    - 测试创建知识点（填写表单，提交成功）
    - 测试编辑知识点（点击编辑按钮，表单预填充，修改后提交）
    - 测试表单验证（必填字段、长度限制、格式验证）
    - 测试富文本编辑器（输入内容，格式化文本）
    - 测试父知识点选择（TreeSelect 组件）
    - 测试标签选择（多选）
  - 测试知识点删除：
    - 测试删除确认对话框（点击删除按钮，弹出确认框）
    - 测试删除限制（有子节点时提示错误）
    - 测试删除限制（有关联题目时提示错误）
    - 测试删除成功（删除后树重新加载）
  - 测试知识点选择器：
    - 在题目表单中测试知识点选择器
    - 测试搜索功能（输入关键词，选项过滤）
    - 测试按分类筛选（选择分类，选项重新加载）
    - 测试多选功能（选择多个知识点）
  - 测试题目列表筛选：
    - 在题目列表页面测试知识点筛选器
    - 测试多选筛选（选择多个知识点，题目列表更新）
    - 测试清除筛选（点击清除按钮，筛选条件清空）
  - 检查浏览器控制台：
    - 确认无 JavaScript 错误
    - 确认无 React 警告（如 key 警告、prop 类型警告）
    - 确认 API 请求正常（查看 Network 面板）
  - 如有问题：
    - 记录问题详情（错误信息、复现步骤、截图）
    - 询问用户是否需要修复


### 阶段 3: 测试和优化 ⏳ 可选（建议完成部分任务）

#### 12. 后端测试（可选）

- [ ]* 12.1 编写知识点服务单元测试
  - 打开或创建 `question-backend/src/modules/knowledge-point/knowledge-point.service.spec.ts`
  - 设置测试环境：
    - 使用 Test.createTestingModule 创建测试模块
    - Mock Repository<KnowledgePoint>（使用 getRepositoryToken）
    - Mock CategoryService, TagService
  - 测试 create 方法：
    - 测试成功创建知识点
    - 测试名称重复检测（同级名称已存在，抛出 ConflictException）
    - 测试层级限制（超过 MAX_LEVEL，抛出 BadRequestException）
    - 测试分类验证（分类不存在，抛出 NotFoundException）
  - 测试 findAll 方法：
    - 测试分页查询（返回正确的 data 和 meta）
    - 测试搜索功能（按名称搜索）
    - 测试按分类筛选
    - 测试按标签筛选
    - 测试按父知识点筛选
  - 测试 findTree 方法：
    - 测试树构建（返回正确的树形结构）
    - 测试按分类筛选树
  - 测试 update 方法：
    - 测试更新字段（名称、内容、分类等）
    - 测试更新标签关联
    - 测试更新父知识点
  - 测试 remove 方法：
    - 测试检查子节点（有子节点时抛出异常）
    - 测试检查关联题目（有关联题目时抛出异常）
    - 测试删除成功
  - 测试 updateQuestionCount 方法：
    - 测试增加题目数量
    - 测试减少题目数量
  - _Requirements: 8.1_

- [ ]* 12.2 编写知识点控制器集成测试
  - 创建 `question-backend/test/knowledge-point.e2e-spec.ts`
  - 设置测试环境：
    - 创建测试应用（使用 Test.createTestingModule）
    - 连接测试数据库
    - 创建测试用户和认证 token
  - 测试 POST /knowledge-points：
    - 测试创建知识点成功（返回 201）
    - 测试验证必填字段（返回 400）
    - 测试名称重复（返回 409）
    - 测试权限控制（未登录返回 401，非 admin/teacher 返回 403）
  - 测试 GET /knowledge-points：
    - 测试获取列表成功（返回 200 和分页数据）
    - 测试分页参数（page, limit）
    - 测试搜索参数（search）
    - 测试筛选参数（categoryId, tagId, parentId）
  - 测试 GET /knowledge-points/tree：
    - 测试获取树成功（返回 200 和树形数组）
    - 测试按分类筛选（categoryId）
  - 测试 GET /knowledge-points/:id：
    - 测试获取详情成功（返回 200）
    - 测试知识点不存在（返回 404）
  - 测试 PATCH /knowledge-points/:id：
    - 测试更新成功（返回 200）
    - 测试知识点不存在（返回 404）
    - 测试权限控制
  - 测试 DELETE /knowledge-points/:id：
    - 测试删除成功（返回 200）
    - 测试有子节点时删除失败（返回 400）
    - 测试有关联题目时删除失败（返回 400）
    - 测试权限控制（只有 admin 可删除）
  - _Requirements: 8.2_

#### 13. 前端测试（可选）

- [ ]* 13.1 编写知识点选择器组件测试
  - 创建 `question-managing/src/components/knowledge-point/KnowledgePointSelector.test.tsx`
  - Mock knowledgePointService：
    - 使用 jest.mock('@/services/knowledgePointService')
  - 测试组件渲染：
    - 测试初始渲染（显示 Select 组件）
    - 测试 placeholder 显示
  - 测试选项加载：
    - Mock getList 返回数据
    - 测试选项正确显示（名称、分类、题目数量）
  - 测试搜索功能：
    - 模拟用户输入搜索关键词
    - 验证调用 getList 时传递了 search 参数
    - 验证搜索结果正确显示
  - 测试按分类筛选：
    - 传递 categoryId prop
    - 验证调用 getList 时传递了 categoryId 参数
  - 测试选择和取消选择：
    - 模拟用户选择选项
    - 验证调用 onChange 回调
    - 验证传递的值正确
  - _Requirements: 9.3_

- [ ]* 13.2 编写知识点表单组件测试
  - 创建 `question-managing/src/components/knowledge-point/KnowledgePointForm.test.tsx`
  - Mock API 服务和 hooks：
    - Mock knowledgePointService, categoryService, tagService
    - Mock useCreateKnowledgePoint, useUpdateKnowledgePoint hooks
  - 测试表单渲染：
    - 测试新建模式（knowledgePoint 为 null）
    - 测试编辑模式（knowledgePoint 不为 null，表单预填充）
  - 测试字段输入：
    - 测试输入知识点名称
    - 测试选择分类
    - 测试选择父知识点
    - 测试输入内容（富文本编辑器）
    - 测试选择标签
  - 测试表单验证：
    - 测试必填字段验证（name, content）
    - 测试长度限制验证（name）
    - 测试格式验证（name）
  - 测试表单提交：
    - 测试创建成功（调用 create 方法，显示成功提示，调用 onSuccess）
    - 测试更新成功（调用 update 方法，显示成功提示，调用 onSuccess）
    - 测试提交失败（显示错误提示）
  - _Requirements: 9.3_

- [ ]* 13.3 编写知识点管理页面测试
  - 创建 `question-managing/src/pages/KnowledgePointManage.test.tsx`
  - Mock API 服务和 hooks：
    - Mock useKnowledgePointTree, useKnowledgePoint hooks
  - 测试页面渲染：
    - 测试初始渲染（显示 Layout、Sider、Content）
    - 测试新建按钮显示
    - 测试搜索框显示
    - 测试分类筛选器显示
  - 测试树加载：
    - Mock useKnowledgePointTree 返回数据
    - 验证树正确显示
  - 测试节点选择：
    - 模拟用户点击树节点
    - 验证右侧显示详情组件
    - 验证传递正确的 id
  - 测试搜索功能：
    - 模拟用户输入搜索关键词
    - 验证树节点过滤
  - 测试分类筛选：
    - 模拟用户选择分类
    - 验证调用 useKnowledgePointTree 时传递了 categoryId
  - _Requirements: 9.3_


#### 14. 性能优化和安全（可选但推荐）

- [ ] 14.1 实现数据库查询优化
  - 打开 `question-backend/src/modules/knowledge-point/knowledge-point.service.ts`
  - 在 findAll 方法中优化查询：
    - 使用 select 指定需要的字段，避免查询不必要的数据
    - 示例：`.select(['kp.id', 'kp.name', 'kp.level', 'kp.questionCount', ...])`
    - 优化 JOIN 查询，避免 N+1 问题
    - 使用 leftJoinAndSelect 一次性加载关联数据
  - 验证数据库索引：
    - 检查 migration 文件，确认已创建索引
    - 索引字段：categoryId, parentId, name
  - 分析慢查询：
    - 使用 PostgreSQL 的 EXPLAIN ANALYZE 分析查询计划
    - 优化查询条件和 JOIN 顺序
  - 测试优化效果：
    - 使用大量数据测试（创建 1000+ 知识点）
    - 测量查询时间（应 < 1s）
  - _Requirements: 10.1, 10.2_
  - _Design Reference: Section 10.1_

- [ ] 14.2 实现后端权限控制
  - 打开 `question-backend/src/modules/knowledge-point/knowledge-point.controller.ts`
  - 添加守卫装饰器：
    - 在 Controller 类上添加：`@UseGuards(JwtAuthGuard, RolesGuard)`
    - 确保项目中已有 JwtAuthGuard 和 RolesGuard
  - 为各端点配置角色权限：
    - create: `@Roles('admin', 'teacher')`
    - update: `@Roles('admin', 'teacher')`
    - delete: `@Roles('admin')`（只有 admin 可删除）
    - findAll, findTree, findOne, getQuestions: `@Roles('admin', 'teacher', 'student')`（所有角色可查看）
  - 测试权限控制：
    - 使用不同角色的 token 测试各端点
    - 验证未登录时返回 401
    - 验证无权限时返回 403
  - _Requirements: 11.1_
  - _Design Reference: Section 11.1_

- [ ] 14.3 实现输入验证和 XSS 防护
  - 在 CreateKnowledgePointDto 中添加格式验证：
    - 为 name 字段添加 @Matches 装饰器
    - 正则表达式：`/^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/`
    - 错误消息：'知识点名称只能包含字母、数字、汉字和空格'
  - 在 KnowledgePointService 中实现 HTML 清理：
    - 安装 DOMPurify：`npm install isomorphic-dompurify`
    - 创建私有方法 sanitizeRichContent(content: RichContent): RichContent
    - 使用 DOMPurify.sanitize 清理 rendered 字段
    - 配置允许的标签：['p', 'br', 'strong', 'em', 'u', 'img', 'a', 'ul', 'ol', 'li']
    - 配置允许的属性：['href', 'src', 'alt', 'title']
  - 在 create 和 update 方法中调用 sanitizeRichContent：
    - 清理 content 字段
    - 清理 extension 字段（如果存在）
  - 测试 XSS 防护：
    - 尝试提交包含 <script> 标签的内容
    - 验证标签被过滤
    - 验证允许的标签正常显示
  - _Requirements: 11.2, 11.3_
  - _Design Reference: Section 11.2, 11.3_

- [ ] 14.4 实现前端性能优化
  - 使用 React.memo 优化组件渲染：
    - 在 KnowledgePointDetail 组件上使用 React.memo
    - 在 KnowledgePointSelector 组件上使用 React.memo
    - 添加自定义比较函数（如需要）
  - 使用 useMemo 和 useCallback 优化计算和回调：
    - 在 KnowledgePointManage 中使用 useMemo 缓存 convertToAntdTree 结果
    - 在事件处理函数上使用 useCallback（handleTreeSelect, handleCreate, handleEdit, handleDelete）
  - 配置 React Query 缓存策略：
    - useKnowledgePointTree: staleTime: 5 * 60 * 1000 (5min), cacheTime: 10 * 60 * 1000 (10min)
    - useKnowledgePointList: staleTime: 2 * 60 * 1000 (2min), cacheTime: 5 * 60 * 1000 (5min)
    - useKnowledgePoint: staleTime: 1 * 60 * 1000 (1min), cacheTime: 5 * 60 * 1000 (5min)
  - 优化富文本编辑器性能：
    - 使用防抖处理内容变化（debounce 300ms）
    - 避免频繁触发 onChange 回调
  - 测试性能优化效果：
    - 使用 React DevTools Profiler 分析渲染性能
    - 测量组件渲染时间
    - 验证不必要的重渲染被避免
  - _Requirements: 10.3_
  - _Design Reference: Section 10.3_


#### 15. 错误处理和文档（可选但推荐）

- [ ] 15.1 创建自定义异常类
  - 创建 `question-backend/src/modules/knowledge-point/exceptions/knowledge-point.exception.ts`
  - 定义自定义异常类：
    - `KnowledgePointNotFoundException extends NotFoundException`
      - constructor(id: string) { super(`知识点 ${id} 不存在`); }
    - `KnowledgePointNameConflictException extends ConflictException`
      - constructor(name: string) { super(`同级知识点名称 "${name}" 已存在`); }
    - `KnowledgePointLevelExceededException extends BadRequestException`
      - constructor(maxLevel: number) { super(`知识点层级不能超过 ${maxLevel} 级`); }
    - `KnowledgePointHasChildrenException extends BadRequestException`
      - constructor() { super('请先删除子知识点'); }
    - `KnowledgePointHasQuestionsException extends BadRequestException`
      - constructor(count: number) { super(`该知识点下有 ${count} 道题目，请先处理相关题目`); }
  - 在 KnowledgePointService 中使用自定义异常：
    - 替换 throw new NotFoundException(...) 为 throw new KnowledgePointNotFoundException(id)
    - 替换 throw new ConflictException(...) 为 throw new KnowledgePointNameConflictException(name)
    - 替换其他异常
  - _Requirements: 12.1_
  - _Design Reference: Section 12.1_

- [ ] 15.2 实现日志记录
  - 在 KnowledgePointService 中添加 Logger：
    - 导入：`import { Logger } from '@nestjs/common';`
    - 声明：`private readonly logger = new Logger(KnowledgePointService.name);`
  - 在 create 方法中记录日志：
    - 开始：`this.logger.log(\`创建知识点: ${dto.name}\`);`
    - 成功：`this.logger.log(\`知识点创建成功: ${kp.id}\`);`
    - 失败：`this.logger.error(\`知识点创建失败: ${error.message}\`, error.stack);`
  - 在 update 方法中记录日志：
    - 开始：`this.logger.log(\`更新知识点: ${id}\`);`
    - 成功：`this.logger.log(\`知识点更新成功: ${id}\`);`
    - 失败：`this.logger.error(\`知识点更新失败: ${error.message}\`, error.stack);`
  - 在 remove 方法中记录警告日志：
    - 开始：`this.logger.warn(\`删除知识点: ${id}\`);`
    - 成功：`this.logger.log(\`知识点删除成功: ${id}\`);`
    - 失败：`this.logger.error(\`知识点删除失败: ${error.message}\`, error.stack);`
  - 在错误处理中记录错误堆栈：
    - 使用 try-catch 包裹关键操作
    - 在 catch 块中记录详细错误信息
  - _Requirements: 14.2_
  - _Design Reference: Section 14.2_

- [ ] 15.3 完善 Swagger API 文档
  - 打开 `question-backend/src/modules/knowledge-point/knowledge-point.controller.ts`
  - 为所有端点添加详细的 @ApiOperation 描述：
    - create: summary: '创建知识点', description: '创建一个新的知识点，支持富文本内容和树形结构'
    - findAll: summary: '获取知识点列表', description: '获取知识点列表，支持分页、搜索和筛选'
    - findTree: summary: '获取知识点树', description: '获取知识点树形结构，可按分类筛选'
    - findOne: summary: '获取知识点详情', description: '根据 ID 获取知识点详情'
    - update: summary: '更新知识点', description: '更新知识点信息'
    - remove: summary: '删除知识点', description: '删除知识点，需检查子节点和关联题目'
    - getQuestions: summary: '获取知识点关联的题目', description: '获取知识点关联的题目列表，支持分页'
  - 添加请求示例（@ApiBody）：
    - 为 create 和 update 端点添加示例
  - 添加响应示例（@ApiResponse）：
    - 200: description: '操作成功', type: KnowledgePoint
    - 201: description: '创建成功', type: KnowledgePoint
    - 400: description: '请求参数错误'
    - 401: description: '未授权'
    - 403: description: '无权限'
    - 404: description: '知识点不存在'
    - 409: description: '知识点名称冲突'
  - 添加认证说明：
    - 在 Controller 类上添加：`@ApiBearerAuth('JWT-auth')`
  - 测试 Swagger UI：
    - 访问 http://localhost:3000/api（或项目配置的路径）
    - 验证所有端点文档完整
    - 验证示例正确
  - _Requirements: 13.1_
  - _Design Reference: Section 13.1_

- [ ] 15.4 编写代码注释
  - 为 KnowledgePointService 添加 JSDoc 注释：
    - 类注释：描述服务的职责
    - 方法注释：描述方法的功能、参数、返回值、异常
  - 为关键方法添加详细注释：
    - create: 描述创建流程（验证、计算层级、关联标签、保存）
    - findAll: 描述查询逻辑（分页、搜索、筛选）
    - findTree: 描述树构建逻辑
    - update: 描述更新逻辑
    - remove: 描述删除逻辑（检查子节点、检查关联题目）
    - buildTree: 描述树构建算法（使用 Map 优化，时间复杂度 O(n)）
  - 为复杂算法添加说明：
    - buildTree 方法：解释如何使用 Map 构建树
    - 层级和路径计算：解释如何计算 level 和 path
  - 为前端组件添加 Props 类型注释：
    - 使用 TypeScript 接口定义 Props
    - 添加 JSDoc 注释描述每个 prop 的用途
  - _Requirements: 13.2_
  - _Design Reference: Section 13.2_


### 阶段 4: 端到端测试和验收 ⏳ 最终验证

#### 16. 端到端测试和验收

- [ ]* 16.1 编写端到端测试场景
  - 创建 E2E 测试文件：`question-backend/test/e2e/knowledge-point.e2e-spec.ts`
  - 设置测试环境：
    - 创建测试应用（使用 Test.createTestingModule）
    - 连接测试数据库（使用独立的测试数据库）
    - 创建测试用户（admin, teacher, student）
    - 获取认证 token
  - 测试完整的知识点创建流程：
    - 创建分类
    - 创建标签
    - 创建根知识点
    - 创建子知识点（level 2）
    - 创建孙知识点（level 3）
    - 验证层级限制（尝试创建 level 4，应失败）
  - 测试知识点树形结构：
    - 获取知识点树
    - 验证树结构正确（父子关系、层级、路径）
    - 按分类筛选树
    - 验证筛选结果正确
  - 测试知识点与题目关联：
    - 创建题目并关联知识点
    - 验证知识点的 questionCount 增加
    - 更新题目的知识点关联
    - 验证 questionCount 正确更新
    - 删除题目
    - 验证 questionCount 减少
  - 测试知识点筛选功能：
    - 按名称搜索
    - 按分类筛选
    - 按标签筛选
    - 按父知识点筛选
    - 验证筛选结果正确
  - 测试知识点删除限制：
    - 尝试删除有子节点的知识点（应失败）
    - 尝试删除有关联题目的知识点（应失败）
    - 删除子节点后再删除父节点（应成功）
  - 测试权限控制：
    - 使用 student token 尝试创建知识点（应失败，403）
    - 使用 teacher token 创建知识点（应成功）
    - 使用 teacher token 尝试删除知识点（应失败，403）
    - 使用 admin token 删除知识点（应成功）
  - _Requirements: 7.1_
  - _Design Reference: Section 9_

- [ ] 16.2 执行验收测试
  - 验证所有功能需求（参考需求文档 7.1）：
    - ✓ 可以创建、编辑、删除知识点
      - 测试创建知识点（填写表单，提交成功）
      - 测试编辑知识点（修改名称、内容、分类等）
      - 测试删除知识点（删除成功，树更新）
    - ✓ 知识点支持富文本内容和拓展内容
      - 测试输入富文本内容（使用编辑器格式化文本）
      - 测试输入拓展内容（可选）
      - 测试富文本渲染（在详情页查看）
    - ✓ 知识点可以关联分类、标签
      - 测试选择分类
      - 测试选择标签（多选）
      - 测试在列表中显示分类和标签
    - ✓ 知识点支持树形结构（最多 3 级）
      - 测试创建根知识点（level 1）
      - 测试创建子知识点（level 2）
      - 测试创建孙知识点（level 3）
      - 测试层级限制（尝试创建 level 4，应提示错误）
      - 测试树形显示（展开/折叠节点）
    - ✓ 题目可以关联多个知识点
      - 在题目表单中测试知识点选择器
      - 测试选择多个知识点
      - 测试保存后查看题目详情
    - ✓ 可以按知识点筛选题目
      - 在题目列表中测试知识点筛选器
      - 测试选择知识点后题目列表更新
      - 测试多选筛选
    - ✓ 知识点统计功能正常（题目数量）
      - 创建题目并关联知识点
      - 验证知识点的题目数量增加
      - 删除题目
      - 验证知识点的题目数量减少
    - ✓ 删除知识点时有合理的提示和限制
      - 测试删除有子节点的知识点（应提示错误）
      - 测试删除有关联题目的知识点（应提示错误）
      - 测试删除确认对话框
  - 验证性能需求（参考需求文档 7.2）：
    - 测试知识点列表加载时间：
      - 创建 100+ 知识点
      - 测量列表加载时间（应 < 1s）
    - 测试知识点树加载时间：
      - 创建 100+ 知识点（包含多级树）
      - 测量树加载时间（应 < 2s）
    - 测试搜索响应时间：
      - 输入搜索关键词
      - 测量搜索响应时间（应 < 500ms）
    - 验证支持分页加载：
      - 验证每页显示 20 条
      - 测试翻页功能
  - 验证用户体验需求（参考需求文档 7.3）：
    - 界面布局清晰，操作流畅：
      - 检查页面布局（左侧树，右侧详情）
      - 检查操作按钮位置合理
      - 检查页面响应流畅，无卡顿
    - 富文本编辑器功能完善：
      - 测试编辑器工具栏（粗体、斜体、列表、链接等）
      - 测试编辑器输入和格式化
      - 测试编辑器预览
    - 知识点选择器易用：
      - 测试搜索功能
      - 测试按分类筛选
      - 测试多选功能
      - 测试显示信息（名称、分类、题目数量）
    - 错误提示友好：
      - 测试各种错误场景（必填字段、格式错误、权限错误等）
      - 验证错误提示清晰易懂
  - 验证安全需求：
    - 权限控制正确：
      - 测试未登录访问（应跳转登录页）
      - 测试不同角色权限（student 不能创建，teacher 不能删除，admin 可以删除）
    - 输入验证生效：
      - 测试必填字段验证
      - 测试长度限制验证
      - 测试格式验证
    - XSS 防护生效：
      - 尝试输入 <script> 标签
      - 验证标签被过滤
  - 记录发现的问题：
    - 记录问题详情（错误信息、复现步骤、截图）
    - 记录问题优先级（P0: 阻塞, P1: 严重, P2: 一般, P3: 轻微）
    - 修复问题后重新测试
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 16.3 Final Checkpoint - 完整功能验证
  - 运行所有测试：
    - 运行单元测试：
      - 执行 `npm run test` 或 `yarn test`
      - 验证所有单元测试通过
      - 检查测试覆盖率（建议 > 80%）
    - 运行集成测试：
      - 执行 `npm run test:e2e` 或 `yarn test:e2e`
      - 验证所有集成测试通过
    - 运行 E2E 测试：
      - 执行端到端测试
      - 验证所有 E2E 测试通过
  - 手动测试所有功能点：
    - 后端 API 测试：
      - 访问 Swagger UI（http://localhost:3000/api）
      - 测试所有端点（POST, GET, PATCH, DELETE）
      - 验证请求和响应格式正确
    - 前端页面测试：
      - 在浏览器中手动测试所有功能
      - 测试知识点管理页面
      - 测试知识点表单
      - 测试知识点选择器
      - 测试题目表单集成
      - 测试题目列表筛选
    - 跨浏览器测试：
      - 在 Chrome 中测试
      - 在 Firefox 中测试
      - 在 Safari 中测试（如果可用）
      - 验证所有浏览器中功能正常
  - 验证数据一致性：
    - 检查数据库数据完整性：
      - 查询 knowledge_points 表
      - 验证所有字段正确
    - 验证中间表数据正确：
      - 查询 question_knowledge_points 表
      - 查询 knowledge_point_tags 表
      - 验证关联关系正确
    - 验证统计字段（questionCount）准确：
      - 创建题目并关联知识点
      - 验证 questionCount 增加
      - 删除题目
      - 验证 questionCount 减少
    - 验证树形结构（level、path）正确：
      - 创建多级知识点
      - 验证 level 字段正确（1, 2, 3）
      - 验证 path 字段正确（parent1Id/parent2Id）
  - 验证性能指标：
    - 知识点列表加载时间 < 1s：
      - 使用浏览器 DevTools Network 面板测量
      - 记录加载时间
    - 知识点树加载时间 < 2s：
      - 测量树加载时间
      - 记录加载时间
    - 搜索响应时间 < 500ms：
      - 测量搜索响应时间
      - 记录响应时间
    - 页面渲染流畅，无卡顿：
      - 使用 React DevTools Profiler 分析
      - 验证无性能瓶颈
  - 验证安全性：
    - 权限控制生效：
      - 测试不同角色权限
      - 验证未授权访问被拒绝
    - 输入验证生效：
      - 测试各种非法输入
      - 验证被正确拒绝
    - XSS 防护生效：
      - 尝试注入脚本
      - 验证被过滤
    - SQL 注入防护生效：
      - 尝试 SQL 注入攻击
      - 验证被防护（TypeORM 自动防护）
  - 检查代码质量：
    - 运行 lint：
      - 执行 `npm run lint` 或 `yarn lint`
      - 验证无 lint 错误
      - 修复 lint 警告（如有）
    - 运行 format：
      - 执行 `npm run format` 或 `yarn format`
      - 验证代码格式统一
    - 代码审查：
      - 检查代码结构
      - 检查命名规范
      - 检查注释完整性
  - 确认所有文档完整：
    - Swagger API 文档完整：
      - 访问 Swagger UI
      - 验证所有端点有文档
      - 验证示例正确
    - 代码注释完整：
      - 检查关键类和方法有注释
      - 检查复杂算法有说明
    - README 更新（如需要）：
      - 更新功能列表
      - 更新安装和运行说明
      - 更新 API 文档链接
  - 准备上线或交付：
    - 创建发布分支（如 release/knowledge-point-module）
    - 合并到主分支（main 或 master）
    - 打标签（如 v1.0.0-knowledge-point）
    - 部署到测试环境
    - 部署到生产环境（如果测试通过）
    - 通知相关人员


## 注意事项

### 任务标记说明
- 标记 `*` 的任务为可选任务（主要是测试相关），可以跳过以加快 MVP 开发
- 未标记 `*` 的任务为必须完成的核心实现任务
- 标记 `[x]` 的任务表示已完成
- 标记 `[ ]` 的任务表示待完成

### 当前进度
- ✅ **阶段 1: 后端开发**（任务 1-6）- 已完成
  - 所有后端 API 已实现并可通过 Swagger 测试
  - 数据库迁移已完成
  - 题目模块已集成知识点功能
- ⏳ **阶段 2: 前端开发**（任务 7-11）- 待开始
  - 需要创建前端页面、组件和服务
  - 需要集成到现有的前端应用中
- ⏳ **阶段 3: 测试和优化**（任务 12-15）- 可选
  - 建议至少完成权限控制和基本的错误处理
- ⏳ **阶段 4: 验收**（任务 16）- 最终验证
  - 在所有功能完成后进行

### 开发顺序建议
1. **前端 API 服务层**（任务 7）：先建立与后端的通信
2. **知识点管理页面**（任务 8）：核心管理界面
3. **知识点表单组件**（任务 9）：创建和编辑功能
4. **知识点选择器**（任务 10）：题目关联功能
5. **路由和导航**（任务 11）：集成到应用中
6. **优化和文档**（任务 14-15）：提升质量
7. **最终验收**（任务 16）：全面测试

### Checkpoint 说明
- **6.4 后端验证** ✅ 已完成 - 后端 API 可通过 Swagger 测试
- **11.3 前端验证** ⏳ 待完成 - 前端功能完成后的验证点
- **16.3 最终验证** ⏳ 待完成 - 所有功能完成后的最终检查

### 依赖关系
- 前端任务（7-11）依赖后端 API 完成（1-6）✅ 已满足
- 题目表单集成（10.2）依赖知识点选择器（10.1）
- 题目列表筛选（10.3）依赖知识点选择器（10.1）
- 路由配置（11）依赖页面组件（8-9）完成

### 关键技术点
- **树形结构**：最多 3 级，使用 level 和 path 字段优化查询
- **多对多关联**：知识点-题目、知识点-标签，使用中间表
- **富文本内容**：使用 JSONB 存储 raw 和 rendered 两种格式
- **统计更新**：题目数量使用原子操作更新，保证一致性
- **权限控制**：admin 可删除，admin/teacher 可创建编辑，所有角色可查看

### 性能要求
- 知识点列表加载时间 < 1s
- 知识点树加载时间 < 2s
- 搜索响应时间 < 500ms
- 支持分页加载（每页 20 条）

### 前端技术栈确认
- React + TypeScript
- Ant Design（UI 组件库）
- React Query（数据获取和缓存）
- React Router（路由管理）
- 富文本编辑器（需确认项目中使用的具体库）

### 后端 API 端点（已实现）
- POST /knowledge-points - 创建知识点
- GET /knowledge-points - 获取知识点列表（支持分页、搜索、筛选）
- GET /knowledge-points/tree - 获取知识点树
- GET /knowledge-points/:id - 获取知识点详情
- PATCH /knowledge-points/:id - 更新知识点
- DELETE /knowledge-points/:id - 删除知识点
- GET /knowledge-points/:id/questions - 获取知识点关联的题目

### 下一步行动
建议从 **任务 7.1** 开始：创建前端 API 服务层，建立与后端的通信基础。
