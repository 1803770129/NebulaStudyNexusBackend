# 图片 CDN 混合降级方案

## 目录结构

```
question-backend/src/modules/upload/cdn/
├── interfaces.ts           # 共享类型定义
├── cdn.service.ts          # CDN 服务（URL 生成与管理）
├── cdn.service.spec.ts     # CDN 服务单元测试
├── cdn.service.pbt.spec.ts # CDN 服务属性测试
├── health-monitor.service.ts      # 健康监控服务
├── health-monitor.service.spec.ts # 健康监控单元测试
├── health-monitor.service.pbt.spec.ts # 健康监控属性测试
├── proxy.service.ts        # 代理服务
├── proxy.service.spec.ts   # 代理服务单元测试
├── proxy.service.pbt.spec.ts # 代理服务属性测试
├── migration.service.ts    # 迁移脚本
├── migration.service.spec.ts # 迁移脚本单元测试
├── migration.service.pbt.spec.ts # 迁移脚本属性测试
├── jest.config.js          # Jest 配置
└── README.md               # 本文件

question-managing/src/services/cdn/
├── types.ts                # 前端类型定义
├── URLCache.ts             # URL 缓存服务
├── URLCache.spec.ts        # URL 缓存单元测试
├── URLCache.pbt.spec.ts    # URL 缓存属性测试
├── PerformanceMonitor.ts   # 性能监控服务
├── PerformanceMonitor.spec.ts # 性能监控单元测试
├── PerformanceMonitor.pbt.spec.ts # 性能监控属性测试
└── README.md               # 前端文档

question-managing/src/components/ImageLoader/
├── ImageLoader.tsx         # 图片加载器组件
├── ImageLoader.spec.tsx    # 图片加载器单元测试
├── ImageLoader.pbt.spec.tsx # 图片加载器属性测试
└── README.md               # 组件文档
```

## 配置

### 后端环境变量

在 `question-backend/.env` 中配置：

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

### 前端环境变量

在 `question-managing/.env` 中配置：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CDN_TIMEOUT=5000
VITE_CDN_CACHE_TTL=86400000
```

## 测试

### 后端测试

```bash
cd question-backend

# 运行所有测试
npm test

# 运行 CDN 模块测试
npm test -- src/modules/upload/cdn

# 运行属性测试
npm test -- --testMatch="**/*.pbt.spec.ts"

# 生成覆盖率报告
npm run test:cov
```

### 前端测试

```bash
cd question-managing

# 运行所有测试
npm run test:run

# 运行 CDN 服务测试
npm run test:run -- src/services/cdn

# 运行 ImageLoader 组件测试
npm run test:run -- src/components/ImageLoader

# 生成覆盖率报告
npm run test:coverage
```

## 开发指南

### 添加新的 CDN 类型

1. 在 `interfaces.ts` 中更新 `CDNType` 类型
2. 在 `cdn.service.ts` 中添加 URL 生成方法
3. 更新配置文件和环境变量
4. 添加相应的测试

### 添加新的属性测试

1. 在设计文档中定义属性
2. 创建 `.pbt.spec.ts` 文件
3. 使用 fast-check 编写属性测试
4. 确保测试运行至少 100 次迭代

### 调试技巧

- 使用 `console.log` 记录降级过程
- 检查浏览器开发者工具的网络面板
- 查看 localStorage 中的缓存数据
- 使用 Jest/Vitest 的 `--verbose` 选项

## 相关文档

- [需求文档](/.kiro/specs/image-cdn-fallback/requirements.md)
- [设计文档](/.kiro/specs/image-cdn-fallback/design.md)
- [任务列表](/.kiro/specs/image-cdn-fallback/tasks.md)
