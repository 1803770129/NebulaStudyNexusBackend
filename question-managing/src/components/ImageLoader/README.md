# ImageLoader 组件

React 组件，处理图片加载、自动降级重试和状态展示。

## 功能特性

- ✅ 自动降级重试：当主 CDN 失败时，自动尝试备用 URL
- ✅ 懒加载：使用 Intersection Observer 实现图片懒加载
- ✅ 超时控制：可配置的超时阈值
- ✅ 状态展示：加载中、加载成功、加载失败的视觉反馈
- ✅ 手动重试：失败后可手动重试
- ✅ 错误日志：详细的错误日志记录

## 使用方法

### 基本用法

```tsx
import { ImageLoader } from '@/components/ImageLoader';

function MyComponent() {
  return (
    <ImageLoader
      filename="example.jpg"
      alt="示例图片"
    />
  );
}
```

### 自定义降级 URL

```tsx
<ImageLoader
  filename="example.jpg"
  fallbackUrls={[
    'https://cdn.statically.io/gh/user/repo@main/example.jpg',
    'https://raw.githubusercontent.com/user/repo/main/example.jpg',
    '/api/upload/proxy/example.jpg',
  ]}
/>
```

### 禁用懒加载

```tsx
<ImageLoader
  filename="example.jpg"
  lazy={false}
/>
```

### 自定义超时

```tsx
<ImageLoader
  filename="example.jpg"
  timeout={3000} // 3 秒超时
/>
```

### 回调函数

```tsx
<ImageLoader
  filename="example.jpg"
  onLoad={() => console.log('图片加载成功')}
  onError={(error) => console.error('图片加载失败', error)}
/>
```

### 自定义样式

```tsx
<ImageLoader
  filename="example.jpg"
  className="my-custom-class"
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filename` | `string` | 必填 | 图片文件名 |
| `alt` | `string` | `filename` | 图片 alt 文本 |
| `className` | `string` | `''` | 自定义 CSS 类名 |
| `fallbackUrls` | `string[]` | `undefined` | 自定义降级 URL 列表 |
| `timeout` | `number` | `5000` | 超时阈值（毫秒） |
| `onLoad` | `() => void` | `undefined` | 加载成功回调 |
| `onError` | `(error: Error) => void` | `undefined` | 加载失败回调 |
| `lazy` | `boolean` | `true` | 是否启用懒加载 |

## 状态

组件有三种状态：

1. **loading**：加载中
   - 显示骨架屏和旋转器
   - 显示"加载中..."文本

2. **loaded**：加载成功
   - 显示图片
   - 平滑淡入动画

3. **error**：加载失败
   - 显示错误图标
   - 显示"图片加载失败"文本
   - 显示重试按钮

## 降级流程

1. 尝试加载第一个 URL（主 CDN）
2. 如果超时或失败，自动尝试第二个 URL（备用 CDN）
3. 如果仍然失败，尝试第三个 URL（代理服务）
4. 如果所有 URL 都失败，显示错误状态

## 懒加载

默认启用懒加载，图片只在进入视口时才开始加载：

- 使用 Intersection Observer API
- 提前 50px 开始加载（rootMargin）
- 进入视口后自动断开观察器

## 错误日志

组件会记录详细的错误日志到控制台：

```javascript
{
  timestamp: '2026-02-11T12:00:00.000Z',
  level: 'error',
  component: 'ImageLoader',
  operation: 'loadImage',
  filename: 'example.jpg',
  url: 'https://cdn.example.com/example.jpg',
  errorType: 'timeout',
  errorMessage: 'Image load timeout'
}
```

## 样式自定义

组件使用 CSS 类名，可以通过覆盖样式来自定义外观：

```css
/* 自定义加载状态 */
.image-loader__skeleton {
  background: linear-gradient(90deg, #your-color 25%, #your-color 50%, #your-color 75%);
}

/* 自定义错误状态 */
.image-loader__error-icon {
  color: #your-color;
}

/* 自定义重试按钮 */
.image-loader__retry-button {
  background-color: #your-color;
}
```

## 注意事项

1. **fallbackUrls 为空**：如果不提供 `fallbackUrls`，组件会尝试从后端获取降级 URL（需要实现后端 API）
2. **超时设置**：超时时间应根据网络条件调整，默认 5 秒适合大多数场景
3. **懒加载性能**：懒加载可以显著提升页面性能，建议保持启用
4. **错误处理**：建议提供 `onError` 回调来处理加载失败的情况

## 相关文档

- [类型定义](../../services/cdn/types.ts)
- [设计文档](/.kiro/specs/image-cdn-fallback/design.md)
- [需求文档](/.kiro/specs/image-cdn-fallback/requirements.md)
