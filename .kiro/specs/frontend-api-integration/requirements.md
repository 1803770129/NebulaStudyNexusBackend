# Requirements Document

## Introduction

本功能将前端应用从 localStorage 本地存储模式改为调用后端 REST API，实现真正的前后端分离架构。同时生成完整的 API 调用文档，记录每个接口的参数与功能。

## Glossary

- **API_Client**: 封装 HTTP 请求的客户端模块，处理认证、错误处理等通用逻辑
- **Auth_Service**: 认证服务，处理用户登录、注册、令牌刷新等功能
- **Question_Service**: 题目服务，处理题目的 CRUD 操作
- **Category_Service**: 分类服务，处理分类的 CRUD 操作
- **Tag_Service**: 标签服务，处理标签的 CRUD 操作
- **Upload_Service**: 上传服务，处理图片上传功能
- **JWT_Token**: JSON Web Token，用于用户身份认证
- **Refresh_Token**: 刷新令牌，用于获取新的访问令牌

## Requirements

### Requirement 1: API 客户端基础设施

**User Story:** As a 开发者, I want 一个统一的 API 客户端模块, so that 所有 API 调用都有一致的错误处理和认证机制。

#### Acceptance Criteria

1. THE API_Client SHALL 提供统一的 HTTP 请求方法（GET、POST、PATCH、DELETE）
2. THE API_Client SHALL 自动在请求头中添加 JWT_Token 进行身份认证
3. WHEN JWT_Token 过期时, THE API_Client SHALL 自动使用 Refresh_Token 刷新令牌并重试请求
4. WHEN 服务器返回错误响应时, THE API_Client SHALL 将错误转换为统一的 AppError 格式
5. THE API_Client SHALL 支持通过环境变量配置 API 基础 URL

### Requirement 2: 认证服务集成

**User Story:** As a 用户, I want 登录和注册功能, so that 我可以安全地访问系统。

#### Acceptance Criteria

1. WHEN 用户提交登录表单时, THE Auth_Service SHALL 调用 POST /api/auth/login 接口
2. WHEN 登录成功时, THE Auth_Service SHALL 将 JWT_Token 和 Refresh_Token 存储到本地
3. WHEN 用户提交注册表单时, THE Auth_Service SHALL 调用 POST /api/auth/register 接口
4. THE Auth_Service SHALL 提供获取当前用户信息的方法（GET /api/auth/profile）
5. THE Auth_Service SHALL 提供登出功能，清除本地存储的令牌

### Requirement 3: 题目服务 API 集成

**User Story:** As a 管理员, I want 通过 API 管理题目, so that 数据可以持久化到服务器。

#### Acceptance Criteria

1. WHEN 获取题目列表时, THE Question_Service SHALL 调用 GET /api/questions 接口，支持分页和筛选参数
2. WHEN 获取单个题目时, THE Question_Service SHALL 调用 GET /api/questions/:id 接口
3. WHEN 创建题目时, THE Question_Service SHALL 调用 POST /api/questions 接口
4. WHEN 更新题目时, THE Question_Service SHALL 调用 PATCH /api/questions/:id 接口
5. WHEN 删除题目时, THE Question_Service SHALL 调用 DELETE /api/questions/:id 接口
6. THE Question_Service SHALL 将后端返回的数据格式转换为前端类型定义

### Requirement 4: 分类服务 API 集成

**User Story:** As a 管理员, I want 通过 API 管理分类, so that 分类数据可以持久化到服务器。

#### Acceptance Criteria

1. WHEN 获取分类列表时, THE Category_Service SHALL 调用 GET /api/categories 接口
2. WHEN 获取分类树时, THE Category_Service SHALL 调用 GET /api/categories/tree 接口
3. WHEN 获取单个分类时, THE Category_Service SHALL 调用 GET /api/categories/:id 接口
4. WHEN 创建分类时, THE Category_Service SHALL 调用 POST /api/categories 接口
5. WHEN 更新分类时, THE Category_Service SHALL 调用 PATCH /api/categories/:id 接口
6. WHEN 删除分类时, THE Category_Service SHALL 调用 DELETE /api/categories/:id 接口

### Requirement 5: 标签服务 API 集成

**User Story:** As a 管理员, I want 通过 API 管理标签, so that 标签数据可以持久化到服务器。

#### Acceptance Criteria

1. WHEN 获取标签列表时, THE Tag_Service SHALL 调用 GET /api/tags 接口
2. WHEN 获取单个标签时, THE Tag_Service SHALL 调用 GET /api/tags/:id 接口
3. WHEN 创建标签时, THE Tag_Service SHALL 调用 POST /api/tags 接口
4. WHEN 更新标签时, THE Tag_Service SHALL 调用 PATCH /api/tags/:id 接口
5. WHEN 删除标签时, THE Tag_Service SHALL 调用 DELETE /api/tags/:id 接口

### Requirement 6: 图片上传服务

**User Story:** As a 管理员, I want 上传图片到服务器, so that 题目内容可以包含图片。

#### Acceptance Criteria

1. WHEN 上传图片时, THE Upload_Service SHALL 调用 POST /api/upload/image 接口
2. THE Upload_Service SHALL 支持上传进度回调
3. THE Upload_Service SHALL 在上传前验证文件类型和大小
4. WHEN 上传失败时, THE Upload_Service SHALL 返回明确的错误信息

### Requirement 7: API 调用文档生成

**User Story:** As a 开发者, I want 完整的 API 调用文档, so that 我可以了解每个接口的参数和功能。

#### Acceptance Criteria

1. THE 文档 SHALL 包含所有 API 接口的完整列表
2. THE 文档 SHALL 为每个接口说明请求方法、URL、参数和返回值
3. THE 文档 SHALL 包含请求和响应的示例
4. THE 文档 SHALL 说明错误码和错误处理方式

### Requirement 8: React Hooks 更新

**User Story:** As a 开发者, I want 更新现有的 React Hooks, so that 它们使用新的 API 服务而不是 localStorage。

#### Acceptance Criteria

1. THE useQuestions Hook SHALL 使用 Question_Service 的 API 方法
2. THE useQuestion Hook SHALL 使用 Question_Service 的 API 方法
3. THE useCategories Hook SHALL 使用 Category_Service 的 API 方法
4. THE useTags Hook SHALL 使用 Tag_Service 的 API 方法
5. WHEN API 调用失败时, THE Hooks SHALL 提供错误状态和重试机制
