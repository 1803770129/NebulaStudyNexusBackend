# 题目后台管理系统 - 后端服务

基于 NestJS 构建的 RESTful API 服务，为题目管理系统提供后端支持。

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 15.x
- **ORM**: TypeORM 0.3.x
- **认证**: Passport + JWT
- **文档**: Swagger/OpenAPI
- **测试**: Jest + fast-check

## 功能特性

- ✅ 题目 CRUD（支持多种题型）
- ✅ 分类管理（支持三级树形结构）
- ✅ 标签管理
- ✅ 用户认证（JWT）
- ✅ 角色权限控制（RBAC）
- ✅ 数据验证
- ✅ Swagger API 文档
- ✅ 统一错误处理

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 启动数据库

```bash
# 使用 Docker 启动 PostgreSQL
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 启动开发服务器

```bash
npm run start:dev
```

### 5. 访问 API 文档

打开浏览器访问: http://localhost:3000/api/docs

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── common/                 # 公共模块
├── config/                 # 配置
├── modules/                # 业务模块
│   ├── auth/              # 认证
│   ├── user/              # 用户
│   ├── question/          # 题目
│   ├── category/          # 分类
│   └── tag/               # 标签
└── database/              # 数据库
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/questions | 获取题目列表 |
| POST | /api/questions | 创建题目 |
| GET | /api/categories/tree | 获取分类树 |
| GET | /api/tags | 获取标签列表 |

## 脚本命令

```bash
npm run start:dev    # 开发模式
npm run build        # 构建
npm run start:prod   # 生产模式
npm run test         # 单元测试
npm run test:e2e     # E2E 测试
npm run seed         # 初始化种子数据
```

## 学习文档

详细的学习指南请查看 [docs/LEARNING_GUIDE.md](./docs/LEARNING_GUIDE.md)
