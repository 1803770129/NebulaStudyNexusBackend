# 项目架构总览

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  Pages  │→ │  Hooks  │→ │Services │→ │   API Client    │ │
│  └─────────┘  └─────────┘  └─────────┘  └────────┬────────┘ │
└──────────────────────────────────────────────────┼──────────┘
                                                   │ HTTP
┌──────────────────────────────────────────────────┼──────────┐
│                       后端 (NestJS)              │          │
│  ┌───────────┐  ┌─────────┐  ┌─────────┐  ┌─────┴───────┐  │
│  │Controllers│← │ Guards  │← │  Pipes  │← │   Request   │  │
│  └─────┬─────┘  └─────────┘  └─────────┘  └─────────────┘  │
│        │                                                    │
│  ┌─────▼─────┐  ┌─────────────────────────────────────────┐ │
│  │ Services  │→ │              TypeORM                    │ │
│  └───────────┘  └─────────────────┬───────────────────────┘ │
└───────────────────────────────────┼─────────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │    PostgreSQL     │
                          └───────────────────┘
```

## 目录结构

```
project-root/
├── question-backend/          # 后端项目 (NestJS)
│   ├── src/
│   │   ├── common/            # 公共模块
│   │   │   ├── decorators/    # 自定义装饰器
│   │   │   ├── dto/           # 公共 DTO
│   │   │   ├── filters/       # 异常过滤器
│   │   │   └── interceptors/  # 拦截器
│   │   ├── config/            # 配置
│   │   └── modules/           # 业务模块
│   │       ├── auth/          # 认证
│   │       ├── user/          # 用户
│   │       ├── category/      # 分类
│   │       ├── tag/           # 标签
│   │       ├── question/      # 题目
│   │       ├── content/       # 内容处理
│   │       └── upload/        # 文件上传
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── question-managing/         # 前端项目 (React)
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── editor/        # 富文本编辑器
│   │   │   ├── layout/        # 布局
│   │   │   ├── question/      # 题目组件
│   │   │   └── AuthGuard/     # 路由守卫
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── lib/               # 工具库
│   │   ├── pages/             # 页面
│   │   ├── router/            # 路由
│   │   ├── services/          # API 服务
│   │   ├── types/             # 类型定义
│   │   └── constants/         # 常量
│   └── vite.config.ts
│
└── docs/                      # 文档
    ├── architecture/          # 架构文档
    ├── backend/               # 后端教程
    ├── frontend/              # 前端教程
    └── deploy/                # 部署文档
```

## 核心依赖说明

### 后端依赖

| 包名 | 用途 |
|------|------|
| @nestjs/core | NestJS 核心框架 |
| @nestjs/typeorm | TypeORM 集成 |
| @nestjs/passport | Passport 认证集成 |
| @nestjs/jwt | JWT 支持 |
| typeorm | ORM 框架 |
| pg | PostgreSQL 驱动 |
| bcrypt | 密码加密 |
| class-validator | 参数验证 |
| class-transformer | 数据转换 |

### 前端依赖

| 包名 | 用途 |
|------|------|
| react | UI 框架 |
| react-router-dom | 路由 |
| @tanstack/react-query | 服务端状态管理 |
| antd | UI 组件库 |
| axios | HTTP 客户端 |
| @tiptap/react | 富文本编辑器 |
| katex | 数学公式渲染 |
| react-image-crop | 图片裁切 |

## 数据模型

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │     │ Category │     │   Tag    │
├──────────┤     ├──────────┤     ├──────────┤
│ id       │     │ id       │     │ id       │
│ username │     │ name     │     │ name     │
│ email    │     │ parentId │     │ color    │
│ password │     │ level    │     │ count    │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │           ┌────▼────────────────▼────┐
     │           │        Question          │
     └──────────►├──────────────────────────┤
      creator    │ id, title, content       │
                 │ type, difficulty         │
                 │ categoryId, options      │
                 │ answer, explanation      │
                 └──────────────────────────┘
```

## API 响应格式

所有 API 响应统一格式：

```json
{
  "statusCode": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2026-01-04T12:00:00.000Z"
}
```

错误响应：

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "认证失败",
  "timestamp": "2026-01-04T12:00:00.000Z"
}
```
