# 富文本编辑器技术指南

## 目录

1. [概述](#1-概述)
2. [技术选型](#2-技术选型)
3. [组件使用方法](#3-组件使用方法)
4. [公式语法说明](#4-公式语法说明)
5. [图片上传](#5-图片上传)
6. [常见问题解决方案](#6-常见问题解决方案)

---

## 1. 概述

本系统的富文本编辑器基于 Tiptap 构建，支持以下功能：

- **文字格式化**：加粗、斜体、下划线、有序/无序列表
- **图片插入**：支持 JPG、PNG、GIF、WEBP 格式，最大 5MB
- **数学公式**：支持 LaTeX 语法，使用 KaTeX 实时预览

### 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    RichTextEditor 组件                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Tiptap Editor                        ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ ││
│  │  │ 文字格式  │  │ 图片插入  │  │ 公式插入 (KaTeX)    │ ││
│  │  └──────────┘  └──────────┘  └──────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│                    输出: HTML + LaTeX 标记                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术选型

### 2.1 核心依赖

| 库 | 版本 | 用途 |
|---|------|------|
| @tiptap/react | ^2.x | 富文本编辑器核心 |
| @tiptap/starter-kit | ^2.x | 基础扩展包 |
| @tiptap/extension-image | ^2.x | 图片扩展 |
| katex | ^0.16.x | LaTeX 公式渲染 |

### 2.2 选型理由

**为什么选择 Tiptap？**

1. **基于 ProseMirror**：成熟稳定的底层架构
2. **高度可定制**：支持自定义扩展和节点
3. **React 友好**：提供官方 React 绑定
4. **TypeScript 支持**：完整的类型定义
5. **轻量级**：按需引入扩展，包体积可控

**为什么选择 KaTeX？**

1. **渲染速度快**：比 MathJax 快 100 倍以上
2. **体积小**：压缩后约 100KB
3. **服务端渲染**：支持 SSR
4. **错误处理友好**：语法错误时不会崩溃

---

## 3. 组件使用方法

### 3.1 RichTextEditor 组件

#### Props 接口

```typescript
interface RichTextEditorProps {
  /** 初始内容 (raw HTML) */
  value?: string;
  /** 内容变化回调 */
  onChange?: (content: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否只读 */
  readonly?: boolean;
  /** 编辑器高度 */
  height?: number | string;
  /** 是否为简化模式（用于选项编辑） */
  simple?: boolean;
}
```

#### Ref 方法

```typescript
interface RichTextEditorRef {
  /** 获取 HTML 内容 */
  getHTML: () => string;
  /** 设置 HTML 内容 */
  setHTML: (html: string) => void;
  /** 清空内容 */
  clear: () => void;
  /** 聚焦编辑器 */
  focus: () => void;
}
```

#### 基本用法

```tsx
import { RichTextEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="请输入题目内容..."
      height={300}
    />
  );
}
```

#### 使用 Ref 控制编辑器

```tsx
import { useRef } from 'react';
import { RichTextEditor, RichTextEditorRef } from '@/components/editor';

function MyComponent() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleClear = () => {
    editorRef.current?.clear();
  };

  const handleGetContent = () => {
    const html = editorRef.current?.getHTML();
    console.log(html);
  };

  return (
    <>
      <RichTextEditor ref={editorRef} />
      <button onClick={handleClear}>清空</button>
      <button onClick={handleGetContent}>获取内容</button>
    </>
  );
}
```

#### 简化模式（用于选项编辑）

```tsx
<RichTextEditor
  simple={true}
  height={100}
  placeholder="请输入选项内容..."
/>
```

简化模式下：
- 隐藏标题、引用、代码块等功能
- 工具栏更紧凑
- 适合短文本编辑场景

### 3.2 FormulaDialog 组件

#### Props 接口

```typescript
interface FormulaDialogProps {
  /** 是否显示 */
  visible: boolean;
  /** 初始 LaTeX 代码 */
  initialLatex?: string;
  /** 确认回调 */
  onConfirm: (latex: string) => void;
  /** 取消回调 */
  onCancel: () => void;
}
```

#### 独立使用

```tsx
import { FormulaDialog } from '@/components/editor';

function MyComponent() {
  const [visible, setVisible] = useState(false);

  const handleConfirm = (latex: string) => {
    console.log('LaTeX:', latex);
    setVisible(false);
  };

  return (
    <>
      <button onClick={() => setVisible(true)}>插入公式</button>
      <FormulaDialog
        visible={visible}
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}
```

---

## 4. 公式语法说明

### 4.1 公式类型

| 类型 | 语法 | 说明 |
|------|------|------|
| 行内公式 | `$...$` | 与文字在同一行显示 |
| 块级公式 | `$$...$$` | 独立成行，居中显示 |

### 4.2 常用公式示例

#### 基础运算

| 效果 | LaTeX 代码 |
|------|-----------|
| 分数 | `\frac{a}{b}` |
| 平方根 | `\sqrt{x}` |
| n次方根 | `\sqrt[n]{x}` |
| 上标 | `x^{2}` |
| 下标 | `x_{i}` |

#### 希腊字母

| 效果 | LaTeX 代码 |
|------|-----------|
| α | `\alpha` |
| β | `\beta` |
| γ | `\gamma` |
| δ | `\delta` |
| θ | `\theta` |
| π | `\pi` |
| Σ | `\Sigma` |
| Ω | `\Omega` |

#### 数学符号

| 效果 | LaTeX 代码 |
|------|-----------|
| ± | `\pm` |
| × | `\times` |
| ÷ | `\div` |
| ≠ | `\neq` |
| ≤ | `\leq` |
| ≥ | `\geq` |
| ∞ | `\infty` |

#### 高级公式

| 效果 | LaTeX 代码 |
|------|-----------|
| 求和 | `\sum_{i=1}^{n} x_i` |
| 积分 | `\int_{a}^{b} f(x) dx` |
| 极限 | `\lim_{x \to \infty} f(x)` |
| 矩阵 | `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` |

### 4.3 完整公式示例

**二次方程求根公式：**
```latex
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

**欧拉公式：**
```latex
e^{i\pi} + 1 = 0
```

**泰勒展开：**
```latex
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
```

**麦克斯韦方程组：**
```latex
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}
```

---

## 5. 图片上传

### 5.1 支持的格式

| 格式 | MIME 类型 |
|------|----------|
| JPEG | image/jpeg |
| PNG | image/png |
| GIF | image/gif |
| WebP | image/webp |

### 5.2 限制条件

- **最大文件大小**：5MB
- **上传接口**：`POST /api/upload/image`

### 5.3 上传服务使用

```typescript
import { uploadImage, validateImageFile } from '@/services/uploadService';

// 验证文件
const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// 上传文件
try {
  const result = await uploadImage(file, (progress) => {
    console.log(`上传进度: ${progress}%`);
  });
  console.log('上传成功:', result.url);
} catch (error) {
  console.error('上传失败:', error.message);
}
```

### 5.4 上传结果

```typescript
interface UploadResult {
  url: string;      // 文件访问 URL
  filename: string; // 文件名
  size: number;     // 文件大小（字节）
}
```

---

## 6. 常见问题解决方案

### 6.1 公式渲染问题

**问题：公式显示为原始 LaTeX 代码**

原因：KaTeX 未正确加载或公式语法错误

解决方案：
1. 确保已引入 KaTeX CSS：`import 'katex/dist/katex.min.css'`
2. 检查公式语法是否正确
3. 查看浏览器控制台是否有错误信息

**问题：公式预览显示错误**

原因：LaTeX 语法错误

解决方案：
1. 检查括号是否匹配
2. 检查命令拼写是否正确
3. 参考 KaTeX 支持的命令列表：https://katex.org/docs/supported.html

### 6.2 图片上传问题

**问题：图片上传失败，提示"文件类型不支持"**

解决方案：
1. 确保图片格式为 JPG、PNG、GIF 或 WebP
2. 检查文件扩展名是否正确
3. 某些图片可能被错误识别，尝试重新保存

**问题：图片上传失败，提示"文件过大"**

解决方案：
1. 压缩图片至 5MB 以下
2. 使用在线工具压缩：TinyPNG、Squoosh 等
3. 降低图片分辨率

**问题：图片上传后无法显示**

解决方案：
1. 检查网络连接
2. 确认后端服务正常运行
3. 检查图片 URL 是否正确

### 6.3 编辑器问题

**问题：编辑器内容无法保存**

解决方案：
1. 确保 `onChange` 回调正确绑定
2. 检查表单提交逻辑
3. 使用 `ref.getHTML()` 获取最新内容

**问题：编辑器初始内容不显示**

解决方案：
1. 确保 `value` prop 在组件挂载时已有值
2. 如果是异步加载，使用 `ref.setHTML()` 设置内容

**问题：工具栏按钮不响应**

解决方案：
1. 确保编辑器已聚焦
2. 检查 `readonly` 属性是否为 `false`
3. 检查浏览器控制台是否有错误

### 6.4 性能优化

**问题：编辑大量内容时卡顿**

解决方案：
1. 使用 `useMemo` 缓存编辑器配置
2. 避免频繁更新父组件状态
3. 考虑使用防抖处理 `onChange`

```tsx
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

function MyComponent() {
  const debouncedOnChange = useMemo(
    () => debounce((content: string) => {
      // 处理内容变化
    }, 300),
    []
  );

  return (
    <RichTextEditor onChange={debouncedOnChange} />
  );
}
```

---

## 附录：KaTeX 支持的命令

完整命令列表请参考：https://katex.org/docs/supported.html

### 常用命令速查

```
\frac{}{} - 分数
\sqrt{} - 平方根
\sum - 求和
\int - 积分
\lim - 极限
\infty - 无穷
\alpha, \beta, \gamma - 希腊字母
\sin, \cos, \tan - 三角函数
\log, \ln - 对数
\mathbf{} - 粗体
\mathit{} - 斜体
\text{} - 普通文本
```
