# Implementation Plan: 题目后台管理系统

## Overview

本实现计划基于 React 19 + TypeScript + Vite 技术栈，采用增量开发方式，从项目初始化开始，逐步实现核心功能模块。每个任务都建立在前一个任务的基础上，确保代码始终可运行。

## Tasks

- [x] 1. 项目初始化与基础配置
  - [x] 1.1 使用 Vite 创建 React 19 + TypeScript 项目
    - 执行 `npm create vite@latest` 创建项目
    - 配置 TypeScript 严格模式
    - 配置路径别名 `@/`
    - _Requirements: 技术栈选型_

  - [x] 1.2 安装核心依赖
    - 安装 React Router 7.x、Zustand 5.x、TanStack Query 5.x
    - 安装 Ant Design 5.x 及图标库
    - 安装 Axios、dayjs 等工具库
    - _Requirements: 技术栈选型_

  - [x] 1.3 配置开发工具
    - 配置 ESLint 和 Prettier
    - 配置 Vitest 测试框架
    - 安装 fast-check 属性测试库
    - _Requirements: 测试策略_

- [x] 2. 类型定义与常量配置
  - [x] 2.1 创建核心类型定义
    - 定义 Question、Category、Tag 接口
    - 定义 QuestionType、DifficultyLevel 枚举
    - 定义 Option、QuestionFilters、PaginationConfig 接口
    - _Requirements: 3.5, 数据模型_

  - [x] 2.2 创建常量配置
    - 定义题目类型选项
    - 定义难度等级选项
    - 定义分页默认配置
    - _Requirements: 3.5_

- [x] 3. 工具函数与数据服务层
  - [x] 3.1 实现 localStorage 工具函数
    - 实现 getItem、setItem、removeItem 封装
    - 实现 JSON 序列化/反序列化
    - 处理存储异常
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.2 编写数据持久化属性测试
    - **Property 14: 数据持久化往返**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [x] 3.3 实现题目服务层 (QuestionService)
    - 实现 getQuestions、getQuestionById 方法
    - 实现 createQuestion、updateQuestion、deleteQuestion 方法
    - 实现筛选和搜索逻辑
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 4.2, 5.2_

  - [x] 3.4 编写筛选逻辑属性测试
    - **Property 3: 筛选结果正确性**
    - **Property 4: 搜索结果相关性**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 3.5 实现分类服务层 (CategoryService)
    - 实现 getCategories、getCategoryTree 方法
    - 实现 createCategory、updateCategory、deleteCategory 方法
    - 实现层级路径计算逻辑
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.6 编写分类服务属性测试
    - **Property 9: 分类层级约束**
    - **Property 10: 分类名称唯一性**
    - **Property 11: 分类删除约束**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

  - [x] 3.7 实现标签服务层 (TagService)
    - 实现 getTags 方法
    - 实现 createTag、updateTag、deleteTag 方法
    - 实现标签关联清理逻辑
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.8 编写标签服务属性测试
    - **Property 12: 标签名称唯一性**
    - **Property 13: 标签关联清理**
    - **Validates: Requirements 7.2, 7.4**

- [x] 4. Checkpoint - 服务层完成
  - 确保所有服务层测试通过
  - 如有问题请询问用户

- [x] 5. 状态管理与自定义 Hooks
  - [x] 5.1 实现 Zustand UI 状态存储
    - 创建 useUIStore 管理侧边栏状态
    - 创建 useFilterStore 管理筛选条件
    - _Requirements: UI 状态管理_

  - [x] 5.2 配置 TanStack Query
    - 创建 QueryClient 配置
    - 配置默认查询选项
    - _Requirements: 服务端状态管理_

  - [x] 5.3 实现 useQuestions Hook
    - 封装题目列表查询
    - 实现分页和筛选参数处理
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.4 实现 useQuestion Hook
    - 封装单个题目查询
    - 实现创建、更新、删除 mutation
    - _Requirements: 3.2, 4.2, 5.2_

  - [x] 5.5 实现 useCategories Hook
    - 封装分类列表和树形数据查询
    - 实现分类 CRUD mutation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.6 实现 useTags Hook
    - 封装标签列表查询
    - 实现标签 CRUD mutation
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. 布局与路由配置
  - [x] 6.1 创建应用布局组件
    - 实现 MainLayout 包含侧边栏和内容区
    - 实现响应式侧边栏折叠
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 6.2 配置路由系统
    - 配置 React Router 路由表
    - 设置题目列表、表单、分类管理、标签管理路由
    - _Requirements: 页面导航_

- [ ] 7. 题目列表页面实现
  - [x] 7.1 实现 QuestionFilter 组件
    - 实现搜索输入框
    - 实现分类、难度、类型下拉筛选
    - 实现重置按钮
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 7.2 实现 QuestionTable 组件
    - 实现题目列表表格
    - 显示标题、类型、分类、难度、创建时间
    - 实现编辑、删除操作按钮
    - _Requirements: 1.2_

  - [ ] 7.3 编写列表渲染属性测试
    - **Property 1: 题目列表渲染完整性**
    - **Property 2: 分页数据一致性**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 7.4 实现 QuestionList 页面
    - 组合 QuestionFilter 和 QuestionTable
    - 实现分页控件
    - 实现空状态展示
    - 实现删除确认对话框
    - _Requirements: 1.1, 1.3, 1.4, 5.1, 5.2, 5.3_

- [x] 8. Checkpoint - 题目列表完成
  - 确保题目列表页面功能正常
  - 如有问题请询问用户

- [ ] 9. 题目表单页面实现
  - [x] 9.1 实现 QuestionTypeSelector 组件
    - 实现题目类型选择
    - 根据类型显示不同的表单字段
    - _Requirements: 3.5_

  - [x] 9.2 实现 OptionEditor 组件
    - 实现选择题选项编辑
    - 支持添加、删除、排序选项
    - 支持设置正确答案
    - _Requirements: 3.5_

  - [x] 9.3 实现 TagSelector 组件
    - 实现标签多选
    - 支持搜索标签
    - _Requirements: 7.3_

  - [x] 9.4 实现 QuestionForm 组件
    - 实现完整的题目表单
    - 实现表单验证
    - 支持创建和编辑模式
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

  - [ ] 9.5 编写表单验证属性测试
    - **Property 5: 表单验证完整性**
    - **Property 6: 题目类型支持完整性**
    - **Validates: Requirements 3.2, 3.3, 3.5**

  - [x] 9.6 实现 QuestionForm 页面
    - 实现创建题目页面
    - 实现编辑题目页面
    - 实现成功/失败提示
    - _Requirements: 3.1, 3.4, 4.1, 4.3, 4.4_

  - [ ] 9.7 编写题目更新属性测试
    - **Property 7: 题目更新一致性**
    - **Property 8: 删除操作原子性**
    - **Validates: Requirements 4.1, 4.2, 5.2, 5.4**

- [x] 10. Checkpoint - 题目表单完成
  - 确保题目创建和编辑功能正常
  - 如有问题请询问用户

- [ ] 11. 分类管理页面实现
  - [x] 11.1 实现 CategoryTree 组件
    - 实现树形分类展示
    - 支持展开/折叠
    - 支持选中分类
    - _Requirements: 6.2_

  - [x] 11.2 实现 CategoryForm 组件
    - 实现分类创建/编辑表单
    - 实现父分类选择
    - 实现名称唯一性验证
    - _Requirements: 6.1, 6.3_

  - [x] 11.3 实现 CategoryManage 页面
    - 组合 CategoryTree 和 CategoryForm
    - 实现分类 CRUD 操作
    - 实现删除约束提示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. 标签管理页面实现
  - [x] 12.1 实现 TagList 组件
    - 实现标签列表展示
    - 显示标签颜色和关联题目数
    - _Requirements: 7.1_

  - [x] 12.2 实现 TagForm 组件
    - 实现标签创建/编辑表单
    - 实现颜色选择
    - 实现名称唯一性验证
    - _Requirements: 7.1, 7.2_

  - [x] 12.3 实现 TagManage 页面
    - 组合 TagList 和 TagForm
    - 实现标签 CRUD 操作
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 13. 响应式布局优化
  - [x] 13.1 实现响应式样式
    - 桌面端完整布局
    - 平板端适配布局
    - 移动端优化布局
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 14. 错误处理与用户体验优化
  - [x] 14.1 实现全局错误处理
    - 实现 useErrorHandler Hook
    - 实现错误边界组件
    - 实现统一错误提示
    - _Requirements: 4.4, 5.4_

  - [x] 14.2 实现加载状态
    - 实现骨架屏加载
    - 实现按钮加载状态
    - _Requirements: 用户体验_

- [x] 15. Final Checkpoint - 功能完成
  - 确保所有功能正常运行
  - 确保所有测试通过
  - 如有问题请询问用户

## Notes

- 所有任务均为必需任务，包括属性测试
- 每个任务都引用了具体的需求以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试验证核心正确性属性
- 单元测试验证具体示例和边界情况
