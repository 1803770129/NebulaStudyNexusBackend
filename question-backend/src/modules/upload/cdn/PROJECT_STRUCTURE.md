# 项目结构说明 - 图片 CDN 混合降级方案

## 概述

本文档说明了图片 CDN 混合降级方案的项目结构和配置。

## 目录结构

### 后端（question-backend）

```
question-backend/
├── src/
│   ├── config/
│   │   └── configuration.ts          # 应用配置（已更新 CDN 配置）
│   └── modules/
│       └── upload/
│           ├── cdn/                   # CDN 混合降级模块（新增）
│           │   ├── interfaces.ts      # 共享类型定义
│           │   ├── cdn.service.ts     # CDN 服务（待实现）
│           │   ├── health-monitor.service.ts  # 健康监控（待实现）
│           │   ├── proxy.service.ts   # 代理服务（待实现）
│           │   ├── migration.service.ts # 迁移脚本（待实现）
│           │   ├── jest.config.js     # Jest 配置
│           │   ├── README.md          # 模块文档
│           │   └── PROJECT_STRUCTURE.md # 本文件
│           ├── upload.controller.ts   # 上传控制器（需增强）
│           ├── upload.service.ts      # 上传服务（现有）
│           └── upload.module.ts       # 上传模块（需更新）
├── .env.example                       # 环境变量示例（已更新）
├── tsconfig.json                      # TypeScript 配置（已有路径别名）
└── package.json                       # 依赖配置（已有 Jest 和 fast-check）
```

### 前端（question-managing）

```
question-managing/
├── src/
│   ├── services/
│   │   └── cdn/                       # CDN 服务模块（新增）
│   │       ├── types.ts               # 类型定义
│   │       ├── URLCache.ts            # URL 缓存服务（待实现）
│   │       ├── PerformanceMonitor.ts  # 性能监控（待实现）
│   │       └── README.md              # 服务文档
│   ├── components/
│   │   └── ImageLoader/               # 图片加载器组件（待实现）
│   │       ├── ImageLoader.tsx
│   │       ├── ImageLoader.spec.tsx
│   │       └── README.md
│   └── test/
│       └── setup.ts                   # 测试设置（已存在）
├── .env.example                       # 环境变量示例（需更新）
├── vitest.config.ts                   # Vitest 配置（已存在）
└── package.json                       # 依赖配置（已有 vitest 和 fast-check）
```

## 配置文件

### 1. 后端环境变量（.env.example）

已添加以下配置：

```env
# CDN 混合降级配置
CDN_TIMEOUT=5000
CDN_PRIORITY=statically,github,proxy
CDN_ENABLE_STATICALLY=true
CDN_ENABLE_GITHUB=true
CDN_ENABLE_PROXY=true
CDN_CACHE_TTL=86400000
CDN_HEALTH_CHECK_INTERVAL=60000
PROXY_CACHE_TTL=3600
PROXY_ENABLE_COMPRESSION=true
PROXY_MAX_CACHE_SIZE=104857600
```

### 2. 后端应用配置（configuration.ts）

已添加以下配置：

```typescript
cdn: {
  timeout: parseInt(process.env.CDN_TIMEOUT || '5000', 10),
  priority: (process.env.CDN_PRIORITY || 'statically,github,proxy').split(','),
  enabledCDNs: {
    statically: process.env.CDN_ENABLE_STATICALLY !== 'false',
    github: process.env.CDN_ENABLE_GITHUB !== 'false',
    proxy: process.env.CDN_ENABLE_PROXY !== 'false',
  },
  cacheTTL: parseInt(process.env.CDN_CACHE_TTL || '86400000', 10),
  healthCheckInterval: parseInt(process.env.CDN_HEALTH_CHECK_INTERVAL || '60000', 10),
},
proxy: {
  cacheTTL: parseInt(process.env.PROXY_CACHE_TTL || '3600', 10),
  enableCompression: process.env.PROXY_ENABLE_COMPRESSION !== 'false',
  maxCacheSize: parseInt(process.env.PROXY_MAX_CACHE_SIZE || '104857600', 10),
},
```

### 3. Jest 配置（cdn/jest.config.js）

已创建 CDN 模块专用的 Jest 配置：

- 测试环境：Node.js
- 测试匹配：`*.spec.ts` 和 `*.pbt.spec.ts`
- 覆盖率目标：行 80%，分支 75%，函数 85%
- 超时：30 秒（考虑网络请求）

### 4. Vitest 配置（vitest.config.ts）

前端已有 Vitest 配置，支持：

- 测试环境：jsdom
- 覆盖率提供者：v8
- 路径别名：`@` -> `./src`

## 类型定义

### 后端类型（interfaces.ts）

定义了以下核心类型：

- `CDNType`: CDN 类型枚举
- `CDNConfig`: CDN 配置接口
- `FallbackURLs`: 降级 URL 集合
- `HealthStatus`: 健康状态
- `ProxyConfig`: 代理配置
- `UploadResponse`: 上传响应（增强版）
- `CacheEntry`: 缓存条目
- `LoadMetrics`: 加载指标
- `PerformanceMetrics`: 性能指标
- `ErrorLog`: 错误日志
- `MigrationConfig`: 迁移配置
- `MigrationResult`: 迁移结果

### 前端类型（types.ts）

定义了前端专用类型：

- `ImageLoaderProps`: 图片加载器属性
- `ImageLoaderState`: 图片加载器状态
- `ImageLoaderStatus`: 加载状态枚举
- `HealthCheckResponse`: 健康检查响应
- `MetricsResponse`: 性能指标响应

## 测试策略

### 双重测试方法

1. **单元测试**（`*.spec.ts`）
   - 验证特定示例和边缘情况
   - 测试组件集成点
   - 测试错误条件

2. **属性测试**（`*.pbt.spec.ts`）
   - 使用 fast-check 库
   - 验证通用属性
   - 最少 100 次迭代

### 测试覆盖率目标

- 行覆盖率：≥ 80%
- 分支覆盖率：≥ 75%
- 函数覆盖率：≥ 85%

## 依赖

### 后端依赖（已安装）

- `jest`: ^29.5.0
- `fast-check`: ^3.14.0
- `ts-jest`: ^29.1.0
- `@nestjs/testing`: ^10.0.0
- `supertest`: ^6.3.3

### 前端依赖（已安装）

- `vitest`: ^3.2.4
- `fast-check`: ^4.5.2
- `@testing-library/react`: ^16.3.1
- `@testing-library/jest-dom`: ^6.9.1
- `jsdom`: ^27.0.1

## 下一步

### Task 2: 实现后端 CDNService 核心功能

1. 创建 `cdn.service.ts`
2. 实现 URL 生成方法
3. 实现降级链生成
4. 编写单元测试和属性测试

### Task 3: 实现 HealthMonitor 健康检查服务

1. 创建 `health-monitor.service.ts`
2. 实现健康检查逻辑
3. 实现缓存机制
4. 编写测试

### Task 4: 实现 ProxyService 代理服务

1. 创建 `proxy.service.ts`
2. 实现图片代理和压缩
3. 实现缓存头设置
4. 编写测试

## 参考文档

- [需求文档](/.kiro/specs/image-cdn-fallback/requirements.md)
- [设计文档](/.kiro/specs/image-cdn-fallback/design.md)
- [任务列表](/.kiro/specs/image-cdn-fallback/tasks.md)
- [模块 README](./README.md)
- [前端服务 README](../../../../../question-managing/src/services/cdn/README.md)
