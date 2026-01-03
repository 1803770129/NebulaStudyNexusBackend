# Requirements Document

## Introduction

题目后台管理系统后端服务是一个基于 NestJS 技术栈的 RESTful API 服务，为前端题目管理系统提供数据持久化、业务逻辑处理和用户认证等功能。系统采用模块化架构设计，支持题目、分类、标签的完整 CRUD 操作，并提供用户认证和权限管理能力。

## Glossary

- **Question_Module**: 题目模块，负责题目的 CRUD 操作和业务逻辑
- **Category_Module**: 分类模块，管理题目的分类层级结构
- **Tag_Module**: 标签模块，管理题目的标签
- **Auth_Module**: 认证模块，处理用户登录、注册和 JWT 令牌管理
- **User_Module**: 用户模块，管理用户信息和权限
- **Database_Service**: 数据库服务，使用 TypeORM 进行数据持久化
- **Guard**: 守卫，用于路由级别的权限控制
- **DTO**: 数据传输对象，用于请求参数验证

## Requirements

### Requirement 1: 题目 API

**User Story:** As a 前端应用, I want to 通过 API 管理题目, so that 数据可以持久化存储。

#### Acceptance Criteria

1. THE Question_Module SHALL 提供 GET /questions 接口返回分页的题目列表
2. THE Question_Module SHALL 支持通过 query 参数进行关键词搜索、分类筛选、难度筛选和类型筛选
3. THE Question_Module SHALL 提供 GET /questions/:id 接口返回单个题目详情
4. THE Question_Module SHALL 提供 POST /questions 接口创建新题目
5. THE Question_Module SHALL 提供 PATCH /questions/:id 接口更新题目
6. THE Question_Module SHALL 提供 DELETE /questions/:id 接口删除题目
7. WHEN 请求参数验证失败 THEN THE Question_Module SHALL 返回 400 错误和详细的验证错误信息
8. WHEN 题目不存在 THEN THE Question_Module SHALL 返回 404 错误

### Requirement 2: 分类 API

**User Story:** As a 前端应用, I want to 通过 API 管理分类, so that 可以组织题目的层级结构。

#### Acceptance Criteria

1. THE Category_Module SHALL 提供 GET /categories 接口返回分类列表
2. THE Category_Module SHALL 提供 GET /categories/tree 接口返回树形结构的分类数据
3. THE Category_Module SHALL 提供 POST /categories 接口创建分类
4. THE Category_Module SHALL 提供 PATCH /categories/:id 接口更新分类
5. THE Category_Module SHALL 提供 DELETE /categories/:id 接口删除分类
6. WHEN 创建分类时名称重复 THEN THE Category_Module SHALL 返回 409 冲突错误
7. WHEN 删除包含题目的分类 THEN THE Category_Module SHALL 返回 400 错误并提示先处理相关题目
8. THE Category_Module SHALL 限制分类层级最多为三级

### Requirement 3: 标签 API

**User Story:** As a 前端应用, I want to 通过 API 管理标签, so that 可以为题目添加多维度标记。

#### Acceptance Criteria

1. THE Tag_Module SHALL 提供 GET /tags 接口返回标签列表
2. THE Tag_Module SHALL 提供 POST /tags 接口创建标签
3. THE Tag_Module SHALL 提供 PATCH /tags/:id 接口更新标签
4. THE Tag_Module SHALL 提供 DELETE /tags/:id 接口删除标签
5. WHEN 创建标签时名称重复 THEN THE Tag_Module SHALL 返回 409 冲突错误
6. WHEN 删除标签 THEN THE Tag_Module SHALL 自动移除题目与该标签的关联

### Requirement 4: 用户认证

**User Story:** As a 系统管理员, I want to 用户认证功能, so that 只有授权用户可以访问系统。

#### Acceptance Criteria

1. THE Auth_Module SHALL 提供 POST /auth/register 接口进行用户注册
2. THE Auth_Module SHALL 提供 POST /auth/login 接口进行用户登录并返回 JWT 令牌
3. THE Auth_Module SHALL 提供 POST /auth/refresh 接口刷新访问令牌
4. THE Auth_Module SHALL 提供 GET /auth/profile 接口获取当前用户信息
5. WHEN 用户名或密码错误 THEN THE Auth_Module SHALL 返回 401 未授权错误
6. THE Auth_Module SHALL 使用 bcrypt 对密码进行加密存储

### Requirement 5: 权限控制

**User Story:** As a 系统, I want to 基于角色的权限控制, so that 不同用户有不同的操作权限。

#### Acceptance Criteria

1. THE Guard SHALL 验证所有受保护路由的 JWT 令牌有效性
2. THE Guard SHALL 支持基于角色的访问控制（RBAC）
3. WHEN JWT 令牌过期或无效 THEN THE Guard SHALL 返回 401 未授权错误
4. WHEN 用户权限不足 THEN THE Guard SHALL 返回 403 禁止访问错误

### Requirement 6: 数据验证

**User Story:** As a 系统, I want to 严格的数据验证, so that 确保数据完整性和安全性。

#### Acceptance Criteria

1. THE DTO SHALL 使用 class-validator 进行请求参数验证
2. THE DTO SHALL 使用 class-transformer 进行数据转换
3. WHEN 验证失败 THEN THE System SHALL 返回详细的错误信息指明哪些字段验证失败
4. THE System SHALL 对所有用户输入进行 XSS 和 SQL 注入防护

### Requirement 7: 数据库设计

**User Story:** As a 系统, I want to 合理的数据库设计, so that 数据可以高效存储和查询。

#### Acceptance Criteria

1. THE Database_Service SHALL 使用 TypeORM 作为 ORM 框架
2. THE Database_Service SHALL 支持 PostgreSQL 数据库
3. THE Database_Service SHALL 实现题目与分类的多对一关系
4. THE Database_Service SHALL 实现题目与标签的多对多关系
5. THE Database_Service SHALL 为常用查询字段创建索引

### Requirement 8: API 文档

**User Story:** As a 开发者, I want to 完整的 API 文档, so that 可以快速了解和使用 API。

#### Acceptance Criteria

1. THE System SHALL 使用 Swagger/OpenAPI 生成 API 文档
2. THE System SHALL 在 /api/docs 路径提供交互式 API 文档界面
3. THE System SHALL 为每个接口提供请求/响应示例

### Requirement 9: 错误处理

**User Story:** As a 系统, I want to 统一的错误处理, so that 前端可以一致地处理错误响应。

#### Acceptance Criteria

1. THE System SHALL 使用统一的错误响应格式
2. THE System SHALL 包含错误码、错误消息和详细信息
3. THE System SHALL 在生产环境隐藏敏感的错误堆栈信息
4. THE System SHALL 记录所有错误到日志系统

