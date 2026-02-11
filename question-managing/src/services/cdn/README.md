# 前端 CDN 服务

## 概述

前端 CDN 服务提供图片加载、URL 缓存和性能监控功能，支持自动降级重试。

## 服务

### URLCache

管理成功 URL 的缓存，支持 localStorage 和 IndexedDB。

```typescript
import { URLCache } from '@/services/cdn/URLCache';

const cache = new URLCache({
  storage: 'localStorage',
  ttl: 86400000, // 24 小时
});

// 获取缓存的 URL
const url = await cache.get('image.jpg');

// 设置缓存
await cache.set('image.jpg', 'https://cdn.example.com/image.jpg', 'statically');

// 删除缓存
await cache.remove('image.jpg');
```

### PerformanceMonitor

收集和报告图片加载性能指标。

```typescript
import { PerformanceMonitor } from '@/services/cdn/PerformanceMonitor';

const monitor = new PerformanceMonitor();

// 记录加载开始
monitor.startLoad('image.jpg');

// 记录加载结束
monitor.endLoad('image.jpg', true, 'statically', []);

// 获取性能指标
const metrics = monitor.getMetrics();
console.log('平均加载时间:', metrics.averageLoadTime);
console.log('降级率:', metrics.fallbackRate);
```

## 组件

### ImageLoader

React 组件，处理图片加载、降级重试和状态展示。

```tsx
import { ImageLoader } from '@/components/ImageLoader';

function MyComponent() {
  return (
    <ImageLoader
      filename="image.jpg"
      alt="示例图片"
      timeout={5000}
      lazy={true}
      onLoad={() => console.log('加载成功')}
      onError={(error) => console.error('加载失败', error)}
    />
  );
}
```

## 测试

### 运行测试

```bash
# 运行所有 CDN 服务测试
npm run test:run -- src/services/cdn

# 运行 URLCache 测试
npm run test:run -- src/services/cdn/URLCache

# 运行属性测试
npm run test:run -- src/services/cdn/*.pbt.spec.ts
```

### 编写测试

#### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { URLCache } from './URLCache';

describe('URLCache', () => {
  it('should cache and retrieve URL', async () => {
    const cache = new URLCache({ storage: 'localStorage', ttl: 1000 });
    await cache.set('test.jpg', 'https://example.com/test.jpg', 'statically');
    const url = await cache.get('test.jpg');
    expect(url).toBe('https://example.com/test.jpg');
  });
});
```

#### 属性测试示例

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { URLCache } from './URLCache';

// Feature: image-cdn-fallback, Property 4: 成功 URL 缓存
describe('URLCache Property Tests', () => {
  it('should cache any valid URL', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.webUrl(),
        async (filename, url) => {
          const cache = new URLCache({ storage: 'localStorage', ttl: 1000 });
          await cache.set(filename, url, 'statically');
          const cached = await cache.get(filename);
          return cached === url;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## 配置

在 `.env` 文件中配置：

```env
# CDN 超时阈值（毫秒）
VITE_CDN_TIMEOUT=5000

# URL 缓存过期时间（毫秒）
VITE_CDN_CACHE_TTL=86400000
```

## 调试

### 查看缓存数据

```javascript
// 在浏览器控制台中
localStorage.getItem('cdn_cache_image.jpg');
```

### 清除缓存

```javascript
// 清除所有 CDN 缓存
Object.keys(localStorage)
  .filter(key => key.startsWith('cdn_cache_'))
  .forEach(key => localStorage.removeItem(key));
```

## 相关文档

- [类型定义](./types.ts)
- [后端 CDN 服务](../../../question-backend/src/modules/upload/cdn/README.md)
- [设计文档](/.kiro/specs/image-cdn-fallback/design.md)
