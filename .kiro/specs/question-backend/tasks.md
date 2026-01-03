# Implementation Tasks: 题目后台管理系统后端服务

## Task 1: 项目初始化与基础配置

**Requirements:** 7.1, 7.2

**Description:** 创建 NestJS 项目，配置 TypeScript、ESLint、Prettier，安装核心依赖包。

**Acceptance Criteria:**
- [ ] 使用 `@nestjs/cli` 创建新项目
- [ ] 配置 TypeScript 严格模式
- [ ] 安装 TypeORM、PostgreSQL 驱动、class-validator、class-transformer
- [ ] 配置 ESLint 和 Prettier
- [ ] 创建基础目录结构

**Files to Create/Modify:**
- `question-backend/package.json`
- `question-backend/tsconfig.json`
- `question-backend/.eslintrc.js`
- `question-backend/.prettierrc`
- `question-backend/src/main.ts`
- `question-backend/src/app.module.ts`

---

## Task 2: 配置模块与环境变量

**Requirements:** 7.1, 7.2

**Description:** 创建配置模块，管理数据库、JWT、应用等配置项。

**Acceptance Criteria:**
- [ ] 创建 `@nestjs/config` 配置模块
- [ ] 定义数据库配置
- [ ] 定义 JWT 配置
- [ ] 定义应用配置
- [ ] 创建 `.env.example` 模板文件

**Files to Create/Modify:**
- `question-backend/src/config/configuration.ts`
- `question-backend/src/config/database.config.ts`
- `question-backend/src/config/jwt.config.ts`
- `question-backend/.env.example`

---

## Task 3: 数据库连接与 TypeORM 配置

**Requirements:** 7.1, 7.2, 7.5

**Description:** 配置 TypeORM 连接 PostgreSQL，设置数据库迁移。

**Acceptance Criteria:**
- [ ] 配置 TypeORM 模块
- [ ] 设置数据库连接池
- [ ] 配置迁移目录
- [ ] 创建数据源配置文件（用于 CLI）

**Files to Create/Modify:**
- `question-backend/src/database/database.module.ts`
- `question-backend/src/database/data-source.ts`
- `question-backend/ormconfig.ts`

---

## Task 4: 公共模块 - 异常过滤器

**Requirements:** 9.1, 9.2, 9.3, 9.4

**Description:** 创建全局异常过滤器，统一错误响应格式。

**Acceptance Criteria:**
- [ ] 创建 `AllExceptionsFilter` 全局异常过滤器
- [ ] 定义统一错误响应格式
- [ ] 处理 HTTP 异常
- [ ] 处理验证异常
- [ ] 生产环境隐藏堆栈信息
- [ ] 集成日志记录

**Files to Create/Modify:**
- `question-backend/src/common/filters/all-exceptions.filter.ts`
- `question-backend/src/common/filters/index.ts`
- `question-backend/src/common/interfaces/error-response.interface.ts`

---

## Task 5: 公共模块 - 响应拦截器

**Requirements:** 9.1

**Description:** 创建响应拦截器，统一成功响应格式。

**Acceptance Criteria:**
- [ ] 创建 `TransformInterceptor` 响应拦截器
- [ ] 统一成功响应格式
- [ ] 添加响应时间记录

**Files to Create/Modify:**
- `question-backend/src/common/interceptors/transform.interceptor.ts`
- `question-backend/src/common/interceptors/index.ts`

---

## Task 6: 公共模块 - 验证管道

**Requirements:** 6.1, 6.2, 6.3

**Description:** 配置全局验证管道，处理 DTO 验证。

**Acceptance Criteria:**
- [ ] 配置 `ValidationPipe` 全局管道
- [ ] 启用 `whitelist` 和 `transform` 选项
- [ ] 自定义验证错误消息格式

**Files to Create/Modify:**
- `question-backend/src/common/pipes/validation.pipe.ts`
- `question-backend/src/common/pipes/index.ts`

---

## Task 7: 公共 DTO 与装饰器

**Requirements:** 6.1, 6.2

**Description:** 创建公共 DTO 基类和自定义装饰器。

**Acceptance Criteria:**
- [ ] 创建分页查询 DTO 基类
- [ ] 创建分页响应 DTO
- [ ] 创建自定义验证装饰器

**Files to Create/Modify:**
- `question-backend/src/common/dto/pagination-query.dto.ts`
- `question-backend/src/common/dto/pagination-response.dto.ts`
- `question-backend/src/common/dto/index.ts`
- `question-backend/src/common/decorators/index.ts`

---

## Task 8: 用户实体与模块

**Requirements:** 4.1, 4.6, 5.2

**Description:** 创建用户实体和用户模块。

**Acceptance Criteria:**
- [ ] 创建 `User` 实体
- [ ] 定义用户角色枚举
- [ ] 创建 `UserService`
- [ ] 创建 `UserModule`
- [ ] 实现密码加密存储

**Files to Create/Modify:**
- `question-backend/src/modules/user/entities/user.entity.ts`
- `question-backend/src/modules/user/enums/user-role.enum.ts`
- `question-backend/src/modules/user/user.service.ts`
- `question-backend/src/modules/user/user.module.ts`
- `question-backend/src/modules/user/dto/create-user.dto.ts`

---

## Task 9: 认证模块 - JWT 策略

**Requirements:** 4.2, 4.3, 5.1, 5.3

**Description:** 创建认证模块，实现 JWT 策略。

**Acceptance Criteria:**
- [ ] 创建 `AuthModule`
- [ ] 实现 `JwtStrategy`
- [ ] 实现 `LocalStrategy`
- [ ] 创建 `JwtAuthGuard`
- [ ] 配置 JWT 签名和过期时间

**Files to Create/Modify:**
- `question-backend/src/modules/auth/auth.module.ts`
- `question-backend/src/modules/auth/strategies/jwt.strategy.ts`
- `question-backend/src/modules/auth/strategies/local.strategy.ts`
- `question-backend/src/modules/auth/guards/jwt-auth.guard.ts`
- `question-backend/src/modules/auth/guards/local-auth.guard.ts`

---

## Task 10: 认证模块 - 服务与控制器

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5

**Description:** 实现认证服务和控制器。

**Acceptance Criteria:**
- [ ] 创建 `AuthService`
- [ ] 实现用户注册
- [ ] 实现用户登录
- [ ] 实现令牌刷新
- [ ] 实现获取当前用户信息
- [ ] 创建 `AuthController`
- [ ] 创建认证相关 DTO

**Files to Create/Modify:**
- `question-backend/src/modules/auth/auth.service.ts`
- `question-backend/src/modules/auth/auth.controller.ts`
- `question-backend/src/modules/auth/dto/register.dto.ts`
- `question-backend/src/modules/auth/dto/login.dto.ts`
- `question-backend/src/modules/auth/dto/refresh-token.dto.ts`
- `question-backend/src/modules/auth/dto/index.ts`

---

## Task 11: 角色守卫与装饰器

**Requirements:** 5.2, 5.4

**Description:** 实现基于角色的访问控制。

**Acceptance Criteria:**
- [ ] 创建 `RolesGuard`
- [ ] 创建 `@Roles()` 装饰器
- [ ] 创建 `@Public()` 装饰器（跳过认证）
- [ ] 创建 `@CurrentUser()` 装饰器

**Files to Create/Modify:**
- `question-backend/src/common/guards/roles.guard.ts`
- `question-backend/src/common/guards/index.ts`
- `question-backend/src/common/decorators/roles.decorator.ts`
- `question-backend/src/common/decorators/public.decorator.ts`
- `question-backend/src/common/decorators/current-user.decorator.ts`

---

## Task 12: 分类实体与模块

**Requirements:** 2.1, 2.2, 2.8, 7.3

**Description:** 创建分类实体和分类模块。

**Acceptance Criteria:**
- [ ] 创建 `Category` 实体（支持树形结构）
- [ ] 创建 `CategoryService`
- [ ] 实现分类层级限制（最多3级）
- [ ] 创建 `CategoryModule`

**Files to Create/Modify:**
- `question-backend/src/modules/category/entities/category.entity.ts`
- `question-backend/src/modules/category/category.service.ts`
- `question-backend/src/modules/category/category.module.ts`

---

## Task 13: 分类控制器与 DTO

**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7

**Description:** 实现分类控制器和 DTO。

**Acceptance Criteria:**
- [ ] 创建 `CategoryController`
- [ ] 实现 GET /categories 列表接口
- [ ] 实现 GET /categories/tree 树形接口
- [ ] 实现 POST /categories 创建接口
- [ ] 实现 PATCH /categories/:id 更新接口
- [ ] 实现 DELETE /categories/:id 删除接口
- [ ] 创建分类相关 DTO

**Files to Create/Modify:**
- `question-backend/src/modules/category/category.controller.ts`
- `question-backend/src/modules/category/dto/create-category.dto.ts`
- `question-backend/src/modules/category/dto/update-category.dto.ts`
- `question-backend/src/modules/category/dto/index.ts`

---

## Task 14: 标签实体与模块

**Requirements:** 3.1, 7.4

**Description:** 创建标签实体和标签模块。

**Acceptance Criteria:**
- [ ] 创建 `Tag` 实体
- [ ] 创建 `TagService`
- [ ] 创建 `TagModule`

**Files to Create/Modify:**
- `question-backend/src/modules/tag/entities/tag.entity.ts`
- `question-backend/src/modules/tag/tag.service.ts`
- `question-backend/src/modules/tag/tag.module.ts`

---

## Task 15: 标签控制器与 DTO

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

**Description:** 实现标签控制器和 DTO。

**Acceptance Criteria:**
- [ ] 创建 `TagController`
- [ ] 实现 GET /tags 列表接口
- [ ] 实现 POST /tags 创建接口
- [ ] 实现 PATCH /tags/:id 更新接口
- [ ] 实现 DELETE /tags/:id 删除接口（自动清理关联）
- [ ] 创建标签相关 DTO

**Files to Create/Modify:**
- `question-backend/src/modules/tag/tag.controller.ts`
- `question-backend/src/modules/tag/dto/create-tag.dto.ts`
- `question-backend/src/modules/tag/dto/update-tag.dto.ts`
- `question-backend/src/modules/tag/dto/index.ts`

---

## Task 16: 题目实体

**Requirements:** 7.3, 7.4

**Description:** 创建题目实体，定义与分类、标签的关系。

**Acceptance Criteria:**
- [ ] 创建 `Question` 实体
- [ ] 定义题目类型枚举
- [ ] 定义难度等级枚举
- [ ] 配置与 Category 的多对一关系
- [ ] 配置与 Tag 的多对多关系
- [ ] 配置与 User 的多对一关系

**Files to Create/Modify:**
- `question-backend/src/modules/question/entities/question.entity.ts`
- `question-backend/src/modules/question/enums/question-type.enum.ts`
- `question-backend/src/modules/question/enums/difficulty-level.enum.ts`

---

## Task 17: 题目服务

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8

**Description:** 实现题目服务层业务逻辑。

**Acceptance Criteria:**
- [ ] 创建 `QuestionService`
- [ ] 实现分页查询
- [ ] 实现关键词搜索
- [ ] 实现多条件筛选
- [ ] 实现创建题目
- [ ] 实现更新题目
- [ ] 实现删除题目
- [ ] 实现获取单个题目

**Files to Create/Modify:**
- `question-backend/src/modules/question/question.service.ts`
- `question-backend/src/modules/question/question.module.ts`

---

## Task 18: 题目控制器与 DTO

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8

**Description:** 实现题目控制器和 DTO。

**Acceptance Criteria:**
- [ ] 创建 `QuestionController`
- [ ] 实现 GET /questions 分页列表接口
- [ ] 实现 GET /questions/:id 详情接口
- [ ] 实现 POST /questions 创建接口
- [ ] 实现 PATCH /questions/:id 更新接口
- [ ] 实现 DELETE /questions/:id 删除接口
- [ ] 创建题目相关 DTO

**Files to Create/Modify:**
- `question-backend/src/modules/question/question.controller.ts`
- `question-backend/src/modules/question/dto/create-question.dto.ts`
- `question-backend/src/modules/question/dto/update-question.dto.ts`
- `question-backend/src/modules/question/dto/query-question.dto.ts`
- `question-backend/src/modules/question/dto/index.ts`

---

## Task 19: 数据库迁移

**Requirements:** 7.1, 7.2, 7.5

**Description:** 创建数据库迁移文件。

**Acceptance Criteria:**
- [ ] 创建用户表迁移
- [ ] 创建分类表迁移
- [ ] 创建标签表迁移
- [ ] 创建题目表迁移
- [ ] 创建题目-标签关联表迁移
- [ ] 创建必要的索引

**Files to Create/Modify:**
- `question-backend/src/database/migrations/`

---

## Task 20: Swagger API 文档

**Requirements:** 8.1, 8.2, 8.3

**Description:** 配置 Swagger 文档。

**Acceptance Criteria:**
- [ ] 安装 `@nestjs/swagger`
- [ ] 配置 Swagger 文档
- [ ] 为所有控制器添加 API 装饰器
- [ ] 为所有 DTO 添加 API 属性装饰器
- [ ] 配置 Bearer 认证

**Files to Create/Modify:**
- `question-backend/src/main.ts`（添加 Swagger 配置）
- 所有 Controller 和 DTO 文件（添加装饰器）

---

## Task 21: 种子数据

**Requirements:** 7.1

**Description:** 创建种子数据用于开发和测试。

**Acceptance Criteria:**
- [ ] 创建管理员用户种子
- [ ] 创建示例分类种子
- [ ] 创建示例标签种子
- [ ] 创建示例题目种子

**Files to Create/Modify:**
- `question-backend/src/database/seeds/user.seed.ts`
- `question-backend/src/database/seeds/category.seed.ts`
- `question-backend/src/database/seeds/tag.seed.ts`
- `question-backend/src/database/seeds/question.seed.ts`
- `question-backend/src/database/seeds/index.ts`

---

## Task 22: 单元测试 - 服务层

**Requirements:** 所有

**Description:** 编写服务层单元测试。

**Acceptance Criteria:**
- [ ] 编写 `QuestionService` 单元测试
- [ ] 编写 `CategoryService` 单元测试
- [ ] 编写 `TagService` 单元测试
- [ ] 编写 `AuthService` 单元测试
- [ ] 编写 `UserService` 单元测试

**Files to Create/Modify:**
- `question-backend/src/modules/question/question.service.spec.ts`
- `question-backend/src/modules/category/category.service.spec.ts`
- `question-backend/src/modules/tag/tag.service.spec.ts`
- `question-backend/src/modules/auth/auth.service.spec.ts`
- `question-backend/src/modules/user/user.service.spec.ts`

---

## Task 23: E2E 测试

**Requirements:** 所有

**Description:** 编写端到端测试。

**Acceptance Criteria:**
- [ ] 配置测试数据库
- [ ] 编写认证流程 E2E 测试
- [ ] 编写题目 CRUD E2E 测试
- [ ] 编写分类 CRUD E2E 测试
- [ ] 编写标签 CRUD E2E 测试

**Files to Create/Modify:**
- `question-backend/test/auth.e2e-spec.ts`
- `question-backend/test/question.e2e-spec.ts`
- `question-backend/test/category.e2e-spec.ts`
- `question-backend/test/tag.e2e-spec.ts`
- `question-backend/test/jest-e2e.json`

---

## Task 24: 属性测试

**Requirements:** 所有正确性属性

**Description:** 使用 fast-check 编写属性测试。

**Acceptance Criteria:**
- [ ] 安装 fast-check
- [ ] 编写分页数据一致性属性测试
- [ ] 编写筛选结果正确性属性测试
- [ ] 编写分类层级约束属性测试
- [ ] 编写名称唯一性属性测试

**Files to Create/Modify:**
- `question-backend/src/modules/question/question.property.spec.ts`
- `question-backend/src/modules/category/category.property.spec.ts`
- `question-backend/src/modules/tag/tag.property.spec.ts`

---

## Task 25: Docker 配置

**Requirements:** 7.2

**Description:** 创建 Docker 配置用于开发和部署。

**Acceptance Criteria:**
- [ ] 创建 Dockerfile
- [ ] 创建 docker-compose.yml（包含 PostgreSQL）
- [ ] 创建 docker-compose.dev.yml（开发环境）
- [ ] 配置健康检查

**Files to Create/Modify:**
- `question-backend/Dockerfile`
- `question-backend/docker-compose.yml`
- `question-backend/docker-compose.dev.yml`
- `question-backend/.dockerignore`

---

## Task 26: 学习文档

**Requirements:** 所有

**Description:** 创建详细的学习文档，解释每个模块的原理和技巧。

**Acceptance Criteria:**
- [ ] 编写 NestJS 架构原理文档
- [ ] 编写 TypeORM 使用技巧文档
- [ ] 编写认证授权实现文档
- [ ] 编写测试策略文档
- [ ] 编写部署指南

**Files to Create/Modify:**
- `question-backend/docs/LEARNING_GUIDE.md`
- `question-backend/docs/DEPLOYMENT.md`
- `question-backend/README.md`
