# Implementation Plan: Frontend API Integration

## Overview

本实现计划将前端应用从 localStorage 本地存储模式改为调用后端 REST API。实现顺序为：先创建基础设施（API Client），然后实现各服务模块，最后更新 React Hooks 和生成 API 文档。

## Tasks

- [x] 1. 创建 API Client 基础设施
  - [x] 1.1 创建 API Client 模块 (`src/lib/apiClient.ts`)
    - 实现单例模式的 ApiClient 类
    - 实现 GET、POST、PATCH、DELETE 方法
    - 实现 Token 管理（setTokens、clearTokens、getAccessToken）
    - 实现请求拦截器自动添加 Authorization 头
    - 实现响应拦截器处理错误
    - 支持环境变量配置 API 基础 URL
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ]* 1.2 编写 API Client 属性测试
    - **Property 1: API Client 请求行为一致性**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 1.3 编写错误转换属性测试
    - **Property 2: 错误响应转换完整性**
    - **Validates: Requirements 1.4**

- [x] 2. 实现认证服务
  - [x] 2.1 创建 Auth Service (`src/services/authService.ts`)
    - 实现 login 方法调用 POST /api/auth/login
    - 实现 register 方法调用 POST /api/auth/register
    - 实现 refreshToken 方法调用 POST /api/auth/refresh
    - 实现 getProfile 方法调用 GET /api/auth/profile
    - 实现 logout 方法清除本地 Token
    - 实现 isAuthenticated 方法检查认证状态
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 编写认证状态属性测试
    - **Property 5: 认证状态一致性**
    - **Validates: Requirements 2.2, 2.5**

- [x] 3. Checkpoint - 确保基础设施测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 实现题目服务 API 集成
  - [x] 4.1 重构 Question Service (`src/services/questionService.ts`)
    - 将 localStorage 操作替换为 API 调用
    - 实现 getQuestions 调用 GET /api/questions
    - 实现 getQuestionById 调用 GET /api/questions/:id
    - 实现 createQuestion 调用 POST /api/questions
    - 实现 updateQuestion 调用 PATCH /api/questions/:id
    - 实现 deleteQuestion 调用 DELETE /api/questions/:id
    - 实现数据格式转换（API 响应 -> 前端类型）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 编写分页参数属性测试
    - **Property 3: 分页参数传递正确性**
    - **Validates: Requirements 3.1**

- [x] 5. 实现分类服务 API 集成
  - [x] 5.1 重构 Category Service (`src/services/categoryService.ts`)
    - 将 localStorage 操作替换为 API 调用
    - 实现 getAllCategories 调用 GET /api/categories
    - 实现 getCategoryTree 调用 GET /api/categories/tree
    - 实现 getCategoryById 调用 GET /api/categories/:id
    - 实现 createCategory 调用 POST /api/categories
    - 实现 updateCategory 调用 PATCH /api/categories/:id
    - 实现 deleteCategory 调用 DELETE /api/categories/:id
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 6. 实现标签服务 API 集成
  - [x] 6.1 重构 Tag Service (`src/services/tagService.ts`)
    - 将 localStorage 操作替换为 API 调用
    - 实现 getAllTags 调用 GET /api/tags
    - 实现 getTagById 调用 GET /api/tags/:id
    - 实现 createTag 调用 POST /api/tags
    - 实现 updateTag 调用 PATCH /api/tags/:id
    - 实现 deleteTag 调用 DELETE /api/tags/:id
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. 更新图片上传服务
  - [x] 7.1 完善 Upload Service (`src/services/uploadService.ts`)
    - 确保 uploadImage 正确调用 POST /api/upload/image
    - 确保文件验证逻辑正确
    - 确保进度回调正常工作
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.2 编写文件验证属性测试
    - **Property 4: 文件验证逻辑正确性**
    - **Validates: Requirements 6.3**

- [x] 8. Checkpoint - 确保所有服务测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 9. 更新 React Hooks
  - [x] 9.1 更新 useQuestions Hook (`src/hooks/useQuestions.ts`)
    - 使用新的 Question Service API 方法
    - 添加错误状态处理
    - 添加加载状态
    - _Requirements: 8.1, 8.5_

  - [x] 9.2 更新 useQuestion Hook (`src/hooks/useQuestion.ts`)
    - 使用新的 Question Service API 方法
    - 添加错误状态处理
    - _Requirements: 8.2, 8.5_

  - [x] 9.3 更新 useCategories Hook (`src/hooks/useCategories.ts`)
    - 使用新的 Category Service API 方法
    - 添加错误状态处理
    - _Requirements: 8.3, 8.5_

  - [x] 9.4 更新 useTags Hook (`src/hooks/useTags.ts`)
    - 使用新的 Tag Service API 方法
    - 添加错误状态处理
    - _Requirements: 8.4, 8.5_

- [x] 10. 创建认证相关组件和 Hook
  - [x] 10.1 创建 useAuth Hook (`src/hooks/useAuth.ts`)
    - 提供登录、注册、登出方法
    - 提供当前用户状态
    - 提供认证状态检查
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 11. 生成 API 调用文档
  - [x] 11.1 创建 API 文档 (`question-managing/docs/API_REFERENCE.md`)
    - 列出所有 API 接口
    - 说明每个接口的请求方法、URL、参数
    - 提供请求和响应示例
    - 说明错误码和错误处理
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Final Checkpoint - 确保所有功能正常
  - 确保所有测试通过
  - 确保文档完整
  - 如有问题请询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- 使用 TypeScript 实现所有代码
- 使用 vitest 和 fast-check 进行测试
