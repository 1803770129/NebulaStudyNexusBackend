# 题目管理系统 - 学习教程

## 项目简介

这是一个完整的题目管理系统，包含后端 API 服务和前端管理界面，适合学习全栈开发。

## 文档目录

### 📚 架构篇
- [项目架构总览](./architecture/README.md) - 整体架构设计和技术选型

### 🔧 后端篇
- [后端架构](./backend/01-架构概述.md) - NestJS 项目结构和核心概念
- [认证模块](./backend/auth/README.md) - JWT 认证、登录注册
- [用户模块](./backend/user/README.md) - 用户管理
- [分类模块](./backend/category/README.md) - 分类 CRUD 和树形结构
- [标签模块](./backend/tag/README.md) - 标签管理
- [题目模块](./backend/question/README.md) - 题目 CRUD 和富文本处理
- [上传模块](./backend/upload/README.md) - 图片上传和存储

### 🎨 前端篇
- [前端架构](./frontend/01-架构概述.md) - React 项目结构和核心概念
- [认证功能](./frontend/auth/README.md) - 登录注册和路由守卫
- [API 层](./frontend/api/README.md) - Axios 封装和服务层
- [状态管理](./frontend/state/README.md) - TanStack Query 使用
- [富文本编辑器](./frontend/editor/README.md) - TipTap 编辑器和公式渲染
- [题目管理](./frontend/question/README.md) - 题目列表和表单

### 🚀 部署篇
- [Docker 部署](./deploy/docker.md) - 容器化部署指南
- [服务器配置](./deploy/server.md) - Ubuntu 服务器配置

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | NestJS + TypeORM |
| 数据库 | PostgreSQL |
| 前端框架 | React 19 + TypeScript |
| UI 组件 | Ant Design 5 |
| 状态管理 | TanStack Query |
| 构建工具 | Vite |
| 部署 | Docker + Docker Compose |

## 快速开始

```bash
# 后端
cd question-backend
npm install
docker-compose up -d postgres  # 启动数据库
npm run start:dev

# 前端
cd question-managing
npm install
npm run dev
```
