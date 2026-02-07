# Implementation Plan: Taro 4 + React 19 刷题小程序

## Overview

基于 Taro 4 + React 19 + TypeScript + Zustand + Vite 实现刷题小程序。任务按照增量开发方式组织，每个任务构建在前一个任务的基础上，确保代码始终可运行。

## Tasks

- [ ] 1. 项目初始化与基础配置
  - [x] 1.1 创建 Taro 4 + React 项目（Vite 构建）
    - 使用 Taro 4 + React 19 + TypeScript + Vite 模板
    - npx @tarojs/cli init myApp

  - [x] 1.2 配置项目依赖和开发环境
    - 安装 zustand、sass
    - 安装开发依赖：vitest、fast-check、@testing-library/react
    - 配置 tsconfig.json 路径别名 `@/` 指向 `src/`
    - 创建 vitest.config.ts 配置测试环境
    - 配置 Vite 路径别名（config/index.ts 中的 alias）
    - _Requirements: 开发环境配置_

  - [x] 1.3 创建项目目录结构
    - 创建 src/api、src/components、src/stores、src/hooks、src/types、src/utils、src/styles 目录
    - 创建全局样式文件 variables.scss 和 common.scss
    - _Requirements: 项目结构_

- [ ] 2. 类型定义与工具函数
  - [x] 2.1 创建核心类型定义文件
    - 创建 src/types/question.ts（题目、选项、难度等类型）
    - 创建 src/types/category.ts（分类类型）
    - 创建 src/types/study.ts（学习记录、错题、收藏类型）
    - 创建 src/types/api.ts（API 响应类型）
    - 创建 src/types/user.ts（用户类型）
    - 创建 src/types/index.ts（统一导出）
    - _Requirements: 数据模型定义_

  - [x] 2.2 实现工具函数
    - 创建 src/utils/format.ts（getRenderedContent、getRawContent、formatDate）
    - 创建 src/utils/storage.ts（Taro 本地存储封装）
    - 创建 src/utils/validator.ts（validateAnswer 答案验证函数）
    - _Requirements: 5.2, 5.5, 10.1, 11.1-11.5_

  - [ ]* 2.3 编写工具函数属性测试
    - **Property 5: Rich Content Extraction**
    - **Validates: Requirements 5.2, 11.1-11.5**

  - [ ]* 2.4 编写答案验证属性测试
    - **Property 7: Answer Validation - Single Choice**
    - **Property 8: Answer Validation - Multiple Choice**
    - **Validates: Requirements 5.5**

- [ ] 3. API 层实现
  - [x] 3.1 实现请求封装
    - 创建 src/api/request.ts
    - 基于 Taro.request 封装，实现 Token 自动注入
    - 实现错误处理、Loading 状态、401 自动跳转登录
    - _Requirements: 1.5, 1.6, 10.3_

  - [x] 3.2 实现业务 API 接口
    - 创建 src/api/auth.ts（wxLogin、refresh）
    - 创建 src/api/question.ts（getList、getDetail、getRandom）
    - 创建 src/api/category.ts（getList、getTree）
    - 创建 src/api/study.ts（recordAnswer、batchRecordAnswers、getStatistics）
    - _Requirements: 1.1-1.6, 3.1, 4.1, 8.1-8.4_

- [x] 4. 状态管理实现 (Zustand)
  - [x] 4.1 实现用户状态管理
    - 创建 src/stores/userStore.ts
    - 实现 wxLogin、logout、refreshAccessToken
    - 配置 Taro Storage 持久化
    - _Requirements: 1.1-1.6_

  - [ ]* 4.2 编写用户状态属性测试
    - **Property 1: Login State Persistence**
    - **Validates: Requirements 1.4**

  - [x] 4.3 实现学习记录状态管理
    - 创建 src/stores/studyStore.ts
    - 实现 recordAnswer、addToWrongBook、removeFromWrongBook
    - 实现 toggleFavorite、isFavorite
    - 实现 pendingRecords 队列和 syncPendingRecords
    - _Requirements: 5.8, 5.10, 6.1-6.6, 7.1-7.5, 10.1-10.2_

  - [ ]* 4.4 编写学习记录属性测试
    - **Property 9: Wrong Book Addition on Incorrect Answer**
    - **Property 10: Favorite Toggle Idempotence**
    - **Property 12: Local Storage Round Trip**
    - **Property 13: Pending Records Sync Queue**
    - **Validates: Requirements 5.8, 5.10, 10.1, 10.2**

  - [x] 4.5 实现题目状态管理
    - 创建 src/stores/questionStore.ts
    - 实现题目列表、筛选参数、分页状态
    - 实现分类数据缓存
    - _Requirements: 3.1-3.5, 4.1-4.6_

  - [ ]* 4.6 编写题目状态属性测试
    - **Property 3: Pagination Parameter Construction**
    - **Property 4: Filter Parameter Construction**
    - **Validates: Requirements 4.1, 4.3**

- [x] 5. Checkpoint - 核心逻辑验证
  - 确保所有属性测试通过
  - 确保类型定义完整
  - 如有问题请询问用户

- [x] 6. 自定义 Hooks 实现
  - [x] 6.1 实现认证 Hook
    - 创建 src/hooks/useAuth.ts
    - 封装登录状态检查、自动登录逻辑
    - _Requirements: 1.1-1.6_

  - [x] 6.2 实现题目列表 Hook
    - 创建 src/hooks/useQuestionList.ts
    - 封装分页加载、筛选、刷新逻辑
    - _Requirements: 4.1-4.6_

  - [x] 6.3 实现答题 Hook
    - 创建 src/hooks/useAnswer.ts
    - 封装选项选择、提交答案、重置逻辑
    - _Requirements: 5.3-5.10_

- [x] 7. 公共组件实现
  - [x] 7.1 实现基础 UI 组件
    - 创建 src/components/DifficultyTag（难度标签）
    - 创建 src/components/EmptyState（空状态）
    - 创建 src/components/LoadingMore（加载更多）
    - _Requirements: 4.5, 4.6, 6.6, 7.5_

  - [x] 7.2 实现富文本渲染组件
    - 创建 src/components/RichText
    - 使用 Taro RichText 组件渲染 HTML
    - _Requirements: 5.2, 11.1-11.5_

  - [x] 7.3 实现题目卡片组件
    - 创建 src/components/QuestionCard
    - 显示题目标题、类型标签、难度标签
    - _Requirements: 4.4, 4.5_

  - [x] 7.4 实现选项组件
    - 创建 src/components/OptionItem
    - 支持选中、正确、错误状态显示
    - _Requirements: 5.3, 5.4, 5.6, 5.7_

  - [ ]* 7.5 编写多选切换属性测试
    - **Property 6: Multiple Choice Selection Toggle**
    - **Validates: Requirements 5.4**

- [x] 8. 页面实现 - 认证与首页
  - [x] 8.1 实现登录页面
    - 创建 src/pages/login/index.tsx
    - 实现微信登录按钮和授权流程
    - 登录成功后跳转首页
    - _Requirements: 1.1-1.6_

  - [x] 8.2 实现首页
    - 创建 src/pages/index/index.tsx
    - 显示今日学习统计（已答题数、正确率）
    - 显示快捷入口（随机刷题、错题本、收藏夹）
    - 显示推荐分类列表
    - _Requirements: 2.1-2.5_

  - [x] 8.3 配置应用入口和路由
    - 配置 src/app.config.ts（页面路由、TabBar）
    - 配置 src/app.tsx（Zustand Provider）
    - 配置全局样式 src/app.scss
    - _Requirements: 应用配置_

- [x] 9. 页面实现 - 分类与题目列表
  - [x] 9.1 实现分类页面
    - 创建 src/pages/category/index.tsx
    - 显示分类树结构，支持展开/收起
    - 点击分类跳转题目列表
    - _Requirements: 3.1-3.5_

  - [ ]* 9.2 编写分类树结构属性测试
    - **Property 2: Category Tree Structure Integrity**
    - **Validates: Requirements 3.2**

  - [x] 9.3 实现题目列表页面
    - 创建 src/pages/question/list.tsx
    - 实现分页加载（滚动到底部自动加载）
    - 实现筛选功能（难度、题型）
    - _Requirements: 4.1-4.6_

- [x] 10. 页面实现 - 答题功能
  - [x] 10.1 实现答题详情页面
    - 创建 src/pages/question/detail.tsx
    - 显示题目内容、选项列表
    - 使用 useAnswer Hook 管理答题状态
    - _Requirements: 5.1-5.5_

  - [x] 10.2 实现答题结果展示
    - 显示答案正误、正确答案高亮、解析
    - 实现下一题按钮
    - 实现收藏按钮（切换收藏状态）
    - _Requirements: 5.6-5.10_

- [x] 11. Checkpoint - 核心功能验证
  - 确保登录、分类、题目列表、答题流程可用
  - 确保所有测试通过
  - 如有问题请询问用户

- [x] 12. 页面实现 - 错题本与收藏夹
  - [x] 12.1 实现错题本页面
    - 创建 src/pages/wrong-book/index.tsx
    - 显示错题列表，支持分类筛选
    - 实现复习模式（答对后提示移除）
    - _Requirements: 6.1-6.6_

  - [x] 12.2 实现收藏夹页面
    - 创建 src/pages/favorites/index.tsx
    - 显示收藏列表，支持分类筛选
    - 点击跳转题目详情
    - _Requirements: 7.1-7.5_

- [x] 13. 页面实现 - 统计与个人中心
  - [x] 13.1 实现学习统计页面
    - 创建 src/pages/statistics/index.tsx
    - 显示总体统计（总答题数、正确率、连续学习天数）
    - 显示分类统计、难度统计
    - 显示近7天学习趋势
    - _Requirements: 8.1-8.5_

  - [ ]* 13.2 编写统计计算属性测试
    - **Property 11: Study Statistics Accuracy Calculation**
    - **Validates: Requirements 8.1-8.4**

  - [x] 13.3 实现个人中心页面
    - 创建 src/pages/user/index.tsx
    - 显示用户头像、昵称
    - 显示学习成就概览
    - 显示设置入口
    - _Requirements: 9.1-9.5_

  - [x] 13.4 实现设置页面
    - 创建 src/pages/settings/index.tsx
    - 实现清除缓存功能
    - 实现退出登录功能
    - _Requirements: 9.3-9.5_

- [x] 14. 离线支持与数据同步
  - [x] 14.1 实现离线数据缓存
    - 缓存分类数据到 Taro Storage
    - 缓存学习记录到本地
    - _Requirements: 10.1, 10.4_

  - [x] 14.2 实现数据同步机制
    - 监听网络状态变化
    - 网络恢复时自动同步 pendingRecords
    - 处理数据冲突（服务器优先）
    - _Requirements: 10.2, 10.5_

- [ ] 15. Final Checkpoint - 完整功能验证
  - 确保所有页面功能正常
  - 确保所有属性测试通过
  - 确保离线功能可用
  - 如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选测试任务，可跳过以加快 MVP 开发
- 每个任务引用具体的需求编号以确保可追溯性
- Checkpoint 任务用于阶段性验证，确保增量开发的稳定性
- 属性测试验证核心业务逻辑的正确性
- 使用 Zustand 替代 Pinia 进行状态管理
- 使用 React Hooks 封装业务逻辑
- 使用 Vite 作为构建工具，配合 @tarojs/vite-runner
- 测试使用 vitest，与 Vite 生态无缝集成
