# 后端内容处理技术文档

## 目录

1. [概述](#1-概述)
2. [内容处理流程](#2-内容处理流程)
3. [公式转换原理](#3-公式转换原理)
4. [API 接口说明](#4-api-接口说明)
5. [数据模型](#5-数据模型)
6. [错误处理](#6-错误处理)
7. [配置与部署](#7-配置与部署)

---

## 1. 概述

后端内容处理系统负责将前端提交的富文本内容（包含 LaTeX 公式）转换为小程序可渲染的 HTML 格式。

### 核心模块

| 模块 | 职责 |
|------|------|
| ContentService | 解析内容、提取公式、生成 RichContent |
| FormulaService | LaTeX 公式转 SVG 图片 |
| UploadService | 图片上传与验证 |

### 技术栈

| 技术 | 用途 |
|------|------|
| NestJS | 后端框架 |
| mathjax-node | LaTeX 转 SVG |
| Multer | 文件上传处理 |
| TypeORM | 数据库 ORM |

---

## 2. 内容处理流程

### 2.1 整体流程

```
┌─────────────────────────────────────────────────────────────┐
│                     内容处理流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 接收原始内容 (raw HTML + LaTeX)                          │
│                    │                                         │
│                    ▼                                         │
│  2. 提取 LaTeX 公式                                          │
│     • 块级公式: $$...$$                                      │
│     • 行内公式: $...$                                        │
│                    │                                         │
│                    ▼                                         │
│  3. 批量转换公式为 SVG                                       │
│     • 调用 FormulaService.renderBatch()                     │
│     • 生成 data URI 格式图片                                 │
│                    │                                         │
│                    ▼                                         │
│  4. 替换公式为 <img> 标签                                    │
│     • 保留原始 LaTeX 作为 alt 属性                           │
│     • 设置适当的样式                                         │
│                    │                                         │
│                    ▼                                         │
│  5. 返回 RichContent 结构                                    │
│     • raw: 原始内容（用于编辑）                              │
│     • rendered: 渲染后内容（用于展示）                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 ContentService 核心方法

#### processContent

```typescript
async processContent(rawContent: string): Promise<RichContent>
```

处理富文本内容的主方法：

1. 检查内容是否为空
2. 提取所有 LaTeX 公式
3. 批量转换公式为 SVG
4. 替换公式为 img 标签
5. 返回 RichContent 结构

#### extractFormulas

```typescript
extractFormulas(html: string): ExtractedFormula[]
```

提取内容中的 LaTeX 公式：

- 先提取块级公式（`$$...$$`）
- 再提取行内公式（`$...$`）
- 避免重复匹配

### 2.3 公式提取正则

```typescript
// 行内公式：$...$ (非贪婪匹配，不包含换行)
private readonly inlineFormulaRegex = /\$([^\$\n]+?)\$/g;

// 块级公式：$$...$$ (非贪婪匹配，可包含换行)
private readonly blockFormulaRegex = /\$\$([^\$]+?)\$\$/g;
```

---

## 3. 公式转换原理

### 3.1 MathJax-Node

使用 mathjax-node 将 LaTeX 转换为 SVG：

```typescript
mjAPI.typeset({
  math: latex,
  format: inline ? 'inline-TeX' : 'TeX',
  svg: true,
}, callback);
```

### 3.2 转换流程

```
LaTeX 代码
    │
    ▼
MathJax 解析
    │
    ▼
SVG 字符串
    │
    ▼
Base64 编码
    │
    ▼
Data URI
```

### 3.3 输出格式

```
data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLi4u
```

### 3.4 生成的 img 标签

**行内公式：**
```html
<img 
  src="data:image/svg+xml;base64,..." 
  alt="E=mc^2" 
  class="formula inline" 
  style="vertical-align: middle; display: inline;" 
/>
```

**块级公式：**
```html
<img 
  src="data:image/svg+xml;base64,..." 
  alt="\sum_{i=1}^{n} x_i" 
  class="formula block" 
  style="display: block; margin: 10px auto;" 
/>
```

---

## 4. API 接口说明

### 4.1 图片上传接口

**POST /api/upload/image**

上传图片文件。

**请求：**
- Content-Type: `multipart/form-data`
- Body: `file` - 图片文件

**响应：**
```json
{
  "data": {
    "url": "/api/upload/images/abc123.png",
    "filename": "abc123.png",
    "size": 102400
  }
}
```

**错误响应：**
```json
{
  "statusCode": 400,
  "message": "不支持的文件类型: application/pdf。支持的类型: jpg, png, gif, webp"
}
```

### 4.2 获取图片接口

**GET /api/upload/images/:filename**

获取已上传的图片。

**响应：**
- 成功：返回图片文件
- 失败：404 Not Found

### 4.3 题目创建/更新接口

**POST /api/questions**
**PUT /api/questions/:id**

创建或更新题目时，后端自动处理富文本内容：

**请求体：**
```json
{
  "title": "题目标题",
  "content": "<p>题目内容 $E=mc^2$ 公式</p>",
  "explanation": "<p>解析内容 $$\\sum_{i=1}^{n}$$ 公式</p>",
  "options": [
    {
      "id": "A",
      "content": "<p>选项 A $x^2$</p>",
      "isCorrect": true
    }
  ]
}
```

**响应体：**
```json
{
  "data": {
    "id": "uuid",
    "title": "题目标题",
    "content": {
      "raw": "<p>题目内容 $E=mc^2$ 公式</p>",
      "rendered": "<p>题目内容 <img src=\"data:...\" alt=\"E=mc^2\" /> 公式</p>"
    },
    "explanation": {
      "raw": "<p>解析内容 $$\\sum_{i=1}^{n}$$ 公式</p>",
      "rendered": "<p>解析内容 <img src=\"data:...\" alt=\"\\sum_{i=1}^{n}\" /> 公式</p>"
    },
    "options": [
      {
        "id": "A",
        "content": {
          "raw": "<p>选项 A $x^2$</p>",
          "rendered": "<p>选项 A <img src=\"data:...\" alt=\"x^2\" /> </p>"
        },
        "isCorrect": true
      }
    ]
  }
}
```

---

## 5. 数据模型

### 5.1 RichContent 结构

```typescript
interface RichContent {
  /** 原始内容，包含 LaTeX 标记 */
  raw: string;
  /** 渲染后内容，公式已转为图片 */
  rendered: string;
}
```

### 5.2 Question 实体

```typescript
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('jsonb')  // 富文本内容
  content: RichContent;

  @Column('jsonb', { nullable: true })  // 富文本解析
  explanation: RichContent | null;

  @Column('jsonb', { nullable: true })  // 选项（包含富文本）
  options: Option[];

  // ... 其他字段
}
```

### 5.3 Option 结构

```typescript
interface Option {
  id: string;
  content: RichContent;  // 富文本内容
  isCorrect: boolean;
}
```

### 5.4 数据库字段类型

| 字段 | 原类型 | 新类型 |
|------|--------|--------|
| content | text | jsonb |
| explanation | text | jsonb |
| options.content | string | RichContent |

---

## 6. 错误处理

### 6.1 公式转换错误

当 LaTeX 公式转换失败时：

1. 记录错误日志
2. 保留原始 LaTeX 代码
3. 不影响其他公式的转换

```typescript
if (svgDataUri) {
  // 成功转换，替换为 img 标签
  rendered = rendered.replace(formula.fullMatch, imgTag);
} else {
  // 转换失败，保留原始 LaTeX 代码
  this.logger.warn(`公式转换失败，保留原始代码: ${formula.latex}`);
}
```

### 6.2 图片上传错误

| 错误类型 | HTTP 状态码 | 错误信息 |
|---------|------------|---------|
| 文件类型不支持 | 400 | 不支持的文件类型: xxx |
| 文件过大 | 400 | 文件大小超过限制: xxxMB |
| 未选择文件 | 400 | 请选择要上传的文件 |
| 图片不存在 | 404 | 图片不存在 |

### 6.3 错误响应格式

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

---

## 7. 配置与部署

### 7.1 环境变量

```env
# API 前缀
API_PREFIX=api

# 上传目录（相对于项目根目录）
UPLOAD_DIR=uploads/images
```

### 7.2 文件存储

默认存储位置：`{项目根目录}/uploads/images/`

文件命名规则：`{UUID}.{原扩展名}`

### 7.3 MathJax 初始化

FormulaService 在构造函数中初始化 MathJax：

```typescript
constructor() {
  this.initMathJax();
}

private initMathJax(): void {
  if (this.initialized) return;
  
  mjAPI.config({
    MathJax: {
      SVG: {
        font: 'TeX',
      },
    },
  });
  mjAPI.start();
  this.initialized = true;
}
```

### 7.4 性能优化

1. **批量转换**：使用 `renderBatch` 减少重复转换
2. **缓存机制**：相同公式只转换一次
3. **异步处理**：使用 Promise.all 并行处理

### 7.5 安全考虑

1. **文件类型验证**：只允许指定的图片类型
2. **文件大小限制**：最大 5MB
3. **文件名处理**：使用 UUID 重命名，防止路径遍历
4. **LaTeX 转义**：alt 属性中的特殊字符已转义

---

## 附录：模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                      QuestionModule                          │
│                           │                                  │
│                           ▼                                  │
│                    ContentModule                             │
│                    ┌───────────┐                            │
│                    │ContentSvc │                            │
│                    └─────┬─────┘                            │
│                          │                                   │
│                          ▼                                   │
│                    FormulaModule                             │
│                    ┌───────────┐                            │
│                    │FormulaSvc │                            │
│                    └───────────┘                            │
│                                                              │
│                    UploadModule                              │
│                    ┌───────────┐                            │
│                    │ UploadSvc │                            │
│                    │UploadCtrl │                            │
│                    └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### 模块导入配置

```typescript
// content.module.ts
@Module({
  imports: [FormulaModule],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}

// question.module.ts
@Module({
  imports: [ContentModule, ...],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
```
