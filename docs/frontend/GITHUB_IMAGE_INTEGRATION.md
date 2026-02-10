# 前端 GitHub 图床集成说明

## 📋 概述

后端已经切换到 GitHub + jsDelivr CDN 图床方案，前端需要做相应调整以支持 CDN URL。

## 🎯 主要变化

### 之前（本地存储）
```typescript
// 后端返回相对路径
{
  "url": "/api/upload/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 102400
}

// 前端需要拼接完整 URL
const fullUrl = `${baseUrl}${result.url}`;
```

### 之后（GitHub CDN）
```typescript
// 后端返回完整 CDN URL
{
  "url": "https://cdn.jsdelivr.net/gh/username/repo@main/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 102400
}

// 前端直接使用，无需拼接
const fullUrl = result.url;
```

---

## ✅ 好消息：前端几乎无需修改！

### 1. RichTextEditor.tsx（已兼容）

当前代码已经自动兼容：

```typescript
// src/components/editor/RichTextEditor.tsx (第 116 行)
const fullUrl = result.url.startsWith('http') 
  ? result.url                    // CDN URL，直接使用 ✅
  : `${baseUrl}${result.url}`;    // 相对路径，拼接 baseUrl
```

**无需修改！** ✅

### 2. uploadService.ts（需要小幅优化）

`getImageUrl` 函数已经支持完整 URL：

```typescript
// src/services/uploadService.ts (第 241 行)
export function getImageUrl(filename: string): string {
  // 如果已经是完整 URL，直接返回
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;  // ✅ 支持 CDN URL
  }
  
  // 构建完整 URL（兼容旧数据）
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return `${baseUrl}/upload/images/${filename}`;
}
```

**无需修改！** ✅

---

## 🔧 可选优化

虽然现有代码已经兼容，但可以做一些优化：

### 优化 1：更新注释说明


```typescript
// src/services/uploadService.ts

/**
 * 获取图片 URL
 * 
 * 支持两种格式：
 * 1. CDN 完整 URL（GitHub 图床）：直接返回
 * 2. 相对路径（旧数据兼容）：拼接 baseUrl
 * 
 * @param filename - 文件名、相对路径或完整 URL
 * @returns 完整的图片 URL
 * 
 * @example
 * // CDN URL
 * getImageUrl('https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg')
 * // => 'https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg'
 * 
 * // 相对路径（兼容旧数据）
 * getImageUrl('/api/upload/images/abc.jpg')
 * // => 'http://localhost:3000/api/upload/images/abc.jpg'
 */
export function getImageUrl(filename: string): string {
  // 如果已经是完整 URL（CDN 或其他），直接返回
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // 兼容旧数据：构建完整 URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return `${baseUrl}/upload/images/${filename}`;
}
```

### 优化 2：添加 URL 类型判断工具函数

```typescript
// src/services/uploadService.ts

/**
 * 判断是否为 CDN URL
 * 
 * @param url - 图片 URL
 * @returns 是否为 CDN URL
 */
export function isCdnUrl(url: string): boolean {
  return url.startsWith('https://cdn.jsdelivr.net/') || 
         url.startsWith('http://cdn.jsdelivr.net/');
}

/**
 * 判断是否为完整 URL
 * 
 * @param url - 图片 URL
 * @returns 是否为完整 URL
 */
export function isFullUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
```

### 优化 3：更新上传服务注释

```typescript
// src/services/uploadService.ts

/**
 * 图片上传服务
 * 
 * 提供图片上传功能，与后端 API 交互
 * 后端使用 GitHub + jsDelivr CDN 存储图片
 * 
 * 学习要点：
 * 1. 文件上传的处理方式（FormData）
 * 2. 上传进度的监控
 * 3. 文件验证（类型、大小）
 * 4. 错误处理
 * 5. CDN URL 的处理
 */
```

---

## 🧪 测试验证

### 1. 测试上传功能

```typescript
// 在浏览器控制台测试
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadImage(file);
console.log('上传结果:', result);
// 应该看到：
// {
//   url: "https://cdn.jsdelivr.net/gh/username/repo@main/images/xxx.jpg",
//   filename: "xxx.jpg",
//   size: 102400
// }
```

### 2. 测试 URL 处理

```typescript
// 测试 getImageUrl 函数
import { getImageUrl } from '@/services/uploadService';

// CDN URL（新数据）
console.log(getImageUrl('https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg'));
// => 'https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg'

// 相对路径（旧数据）
console.log(getImageUrl('/api/upload/images/abc.jpg'));
// => 'http://localhost:3000/api/upload/images/abc.jpg'

// 文件名（旧数据）
console.log(getImageUrl('abc.jpg'));
// => 'http://localhost:3000/api/upload/images/abc.jpg'
```

### 3. 测试富文本编辑器

1. 打开题目编辑页面
2. 点击图片上传按钮
3. 选择图片上传
4. 检查插入的图片 URL：
   - 右键图片 → 检查元素
   - 查看 `<img src="...">` 的 src 属性
   - 应该是 CDN URL：`https://cdn.jsdelivr.net/gh/...`

---

## 🔄 数据迁移

### 场景：数据库中已有旧的相对路径

如果数据库中存储的是旧的相对路径（如 `/api/upload/images/abc.jpg`），有两种处理方式：

#### 方式 1：前端兼容（推荐）

**无需修改数据库**，前端 `getImageUrl` 函数已经兼容：

```typescript
// 旧数据
const oldUrl = '/api/upload/images/abc.jpg';
const displayUrl = getImageUrl(oldUrl);
// => 'http://localhost:3000/api/upload/images/abc.jpg'
// 仍然可以访问（如果文件还在服务器上）
```

**优点：**
- 无需修改数据库
- 新旧数据都能正常显示
- 平滑过渡

**缺点：**
- 旧图片仍在服务器本地，未享受 CDN 加速

#### 方式 2：数据库迁移（可选）

如果想让所有图片都使用 CDN，需要：

1. **迁移图片到 GitHub**（参考后端文档）
2. **更新数据库中的 URL**

```sql
-- 示例：更新题目表中的图片 URL
UPDATE questions 
SET content = REPLACE(
  content, 
  '/api/upload/images/', 
  'https://cdn.jsdelivr.net/gh/username/repo@main/images/'
)
WHERE content LIKE '%/api/upload/images/%';
```

---

## 📊 性能对比

### 本地存储 vs CDN

| 指标 | 本地存储 | GitHub CDN |
|------|---------|-----------|
| **首次加载** | 快（同服务器） | 慢 1-5 秒（CDN 缓存） |
| **后续加载** | 中等 | 极快（全球 CDN） |
| **带宽消耗** | 占用服务器带宽 | 不占用 ✅ |
| **存储成本** | 占用服务器磁盘 | 免费 100GB ✅ |
| **可靠性** | 依赖服务器 | GitHub 高可用 ✅ |

### 优化建议

1. **图片压缩**：上传前压缩图片，减少文件大小
2. **懒加载**：使用 `loading="lazy"` 属性
3. **占位符**：加载时显示占位图

```typescript
// 图片组件示例
<img 
  src={getImageUrl(imageUrl)} 
  loading="lazy"
  alt="图片"
  onError={(e) => {
    e.currentTarget.src = '/placeholder.png'; // 加载失败显示占位图
  }}
/>
```

---

## 🐛 常见问题

### Q1: 上传后图片显示 404

**原因：** jsDelivr CDN 需要 1-5 分钟缓存时间

**解决方案：**
1. 等待几分钟后刷新
2. 或者直接访问 GitHub 原始地址（立即可用）：
   ```
   https://raw.githubusercontent.com/username/repo/main/images/xxx.jpg
   ```

### Q2: 旧图片无法显示

**原因：** 旧图片路径是相对路径，但服务器上的文件已删除

**解决方案：**
1. 保留服务器上的旧图片文件
2. 或者迁移旧图片到 GitHub（参考后端文档）

### Q3: 图片加载很慢

**原因：** 首次访问 CDN 需要缓存

**解决方案：**
1. 等待 CDN 缓存完成（1-5 分钟）
2. 后续访问会很快
3. 或使用图片压缩减少文件大小

### Q4: 如何判断图片来源？

```typescript
import { isCdnUrl, isFullUrl } from '@/services/uploadService';

const url = 'https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg';

if (isCdnUrl(url)) {
  console.log('这是 CDN 图片');
} else if (isFullUrl(url)) {
  console.log('这是其他完整 URL');
} else {
  console.log('这是相对路径（旧数据）');
}
```

---

## ✅ 检查清单

部署前请确认：

- [ ] 后端已配置 GitHub Token
- [ ] 后端已部署并测试上传功能
- [ ] 前端 `VITE_API_BASE_URL` 配置正确
- [ ] 测试上传功能正常
- [ ] 测试图片显示正常
- [ ] 测试富文本编辑器图片插入
- [ ] 旧数据兼容性测试（如有）

---

## 🎯 总结

### 前端需要修改吗？

**不需要！** ✅

现有代码已经完美兼容：
- `RichTextEditor.tsx` 自动判断 URL 类型
- `getImageUrl` 函数支持完整 URL
- `uploadService.ts` 无需修改

### 可选优化

如果想让代码更清晰，可以：
1. 更新注释说明
2. 添加工具函数（`isCdnUrl`, `isFullUrl`）
3. 添加错误处理和占位图

### 测试步骤

1. 启动前端项目：`npm run dev`
2. 打开题目编辑页面
3. 上传图片
4. 检查返回的 URL 是否为 CDN 地址
5. 检查图片是否正常显示

---

## 📚 相关文档

- [后端 GitHub 图床集成](../deploy/GITHUB_IMAGE_STORAGE.md)
- [安全最佳实践](../deploy/SECURITY_BEST_PRACTICES.md)
- [API 文档](http://localhost:3000/api/docs)

---

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误
2. 检查网络请求（F12 → Network）
3. 查看后端日志：`docker compose logs -f api`
4. 参考常见问题章节
