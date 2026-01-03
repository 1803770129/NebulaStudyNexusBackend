# Design Document: Rich Text Editor

## Overview

本设计文档描述了题库管理系统富文本编辑功能的技术实现方案。核心目标是让管理后台支持富文本编辑（文字、图片、公式），同时确保内容能在 UniApp 小程序的 rich-text 组件中正确渲染。

### 技术选型

| 组件 | 技术方案 | 说明 |
|------|---------|------|
| 富文本编辑器 | Tiptap + React | 基于 ProseMirror，高度可定制 |
| 公式编辑预览 | KaTeX | 轻量级 LaTeX 渲染库 |
| 后端公式转换 | mathjax-node | 服务端 LaTeX 转 SVG |
| 图片存储 | 本地存储 / OSS | 可配置的存储方案 |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        管理后台 (React)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Tiptap Editor                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │   │
│  │  │ 文字格式  │  │ 图片插入  │  │ 公式插入 (KaTeX)    │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                    输出: { raw: HTML+LaTeX }                     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        后端 (NestJS)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Content Processor                       │   │
│  │  1. 解析 HTML 内容                                       │   │
│  │  2. 提取 LaTeX 公式                                      │   │
│  │  3. 调用 Formula Renderer 转换公式                       │   │
│  │  4. 替换公式为 <img> 标签                                │   │
│  │  5. 保存 raw + rendered                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Formula Renderer                        │   │
│  │  LaTeX → SVG → Base64/URL                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      小程序端 (UniApp)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              <rich-text :nodes="rendered" />             │   │
│  │              公式已是 <img> 标签，直接渲染                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 前端组件

#### RichTextEditor 组件

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

#### FormulaDialog 组件

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

#### ImageUploader 组件

```typescript
interface ImageUploaderProps {
  /** 上传成功回调 */
  onSuccess: (url: string) => void;
  /** 上传失败回调 */
  onError: (error: Error) => void;
  /** 最大文件大小 (bytes) */
  maxSize?: number;
  /** 允许的文件类型 */
  accept?: string[];
}
```

### 后端服务接口

#### ContentProcessorService

```typescript
interface RichContent {
  /** 原始内容，包含 LaTeX 标记 */
  raw: string;
  /** 渲染后内容，公式已转为图片 */
  rendered: string;
}

interface ContentProcessorService {
  /**
   * 处理富文本内容
   * @param rawContent 原始 HTML 内容（包含 LaTeX）
   * @returns 处理后的内容对象
   */
  processContent(rawContent: string): Promise<RichContent>;
  
  /**
   * 提取内容中的 LaTeX 公式
   * @param html HTML 内容
   * @returns LaTeX 公式数组
   */
  extractFormulas(html: string): string[];
}
```

#### FormulaRendererService

```typescript
interface FormulaRendererService {
  /**
   * 将 LaTeX 公式转换为 SVG
   * @param latex LaTeX 代码
   * @param inline 是否为行内公式
   * @returns SVG 字符串或图片 URL
   */
  renderToSvg(latex: string, inline?: boolean): Promise<string>;
  
  /**
   * 批量转换公式
   * @param formulas LaTeX 公式数组
   * @returns 公式到图片 URL 的映射
   */
  renderBatch(formulas: string[]): Promise<Map<string, string>>;
}
```

#### UploadService

```typescript
interface UploadResult {
  /** 文件访问 URL */
  url: string;
  /** 文件名 */
  filename: string;
  /** 文件大小 */
  size: number;
}

interface UploadService {
  /**
   * 上传图片
   * @param file 文件 Buffer
   * @param filename 原始文件名
   * @returns 上传结果
   */
  uploadImage(file: Buffer, filename: string): Promise<UploadResult>;
  
  /**
   * 验证文件
   * @param file 文件信息
   * @returns 是否有效
   */
  validateImage(file: { mimetype: string; size: number }): boolean;
}
```

## Data Models

### 更新后的 Question 实体

```typescript
// 富文本内容结构
interface RichContent {
  raw: string;      // 原始 HTML（包含 LaTeX 标记）
  rendered: string; // 渲染后 HTML（公式已转图片）
}

// 更新后的选项结构
interface Option {
  id: string;
  content: RichContent;  // 从 string 改为 RichContent
  isCorrect: boolean;
}

// 更新后的 Question 实体
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('jsonb')  // 从 text 改为 jsonb
  content: RichContent;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty: DifficultyLevel;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column('jsonb', { nullable: true })
  options: Option[];

  @Column('jsonb')
  answer: string | string[];

  @Column('jsonb', { nullable: true })  // 从 text 改为 jsonb
  explanation: RichContent | null;

  @Column({ type: 'uuid' })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 更新后的 DTO

```typescript
// 创建题目 DTO
export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;  // 接收 raw HTML

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsUUID()
  categoryId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];

  @IsNotEmpty()
  answer: string | string[];

  @IsString()
  @IsOptional()
  explanation?: string;  // 接收 raw HTML
}

// 选项 DTO
export class OptionDto {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;  // 接收 raw HTML

  @IsBoolean()
  isCorrect: boolean;
}
```

### 数据库迁移

```sql
-- 修改 content 字段类型
ALTER TABLE questions 
ALTER COLUMN content TYPE jsonb 
USING jsonb_build_object('raw', content, 'rendered', content);

-- 修改 explanation 字段类型
ALTER TABLE questions 
ALTER COLUMN explanation TYPE jsonb 
USING CASE 
  WHEN explanation IS NOT NULL 
  THEN jsonb_build_object('raw', explanation, 'rendered', explanation)
  ELSE NULL 
END;

-- 更新 options 中的 content 字段
UPDATE questions 
SET options = (
  SELECT jsonb_agg(
    jsonb_set(
      opt,
      '{content}',
      jsonb_build_object('raw', opt->>'content', 'rendered', opt->>'content')
    )
  )
  FROM jsonb_array_elements(options) AS opt
)
WHERE options IS NOT NULL;
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Rich Text Editor Output Format

*For any* input content containing text, images, and LaTeX formulas, the Rich_Text_Editor SHALL output valid HTML that preserves all content elements and maintains LaTeX markers for formulas.

**Validates: Requirements 1.2, 1.7**

### Property 2: Image Upload Validation

*For any* file upload attempt, the Image_Storage SHALL accept only files with valid image types (jpg, png, gif, webp) and size under 5MB, returning a valid URL for successful uploads.

**Validates: Requirements 2.1, 2.3**

### Property 3: LaTeX Formula Handling

*For any* LaTeX formula (inline `$...$` or block `$$...$$`), the Rich_Text_Editor SHALL parse it correctly, handle syntax errors gracefully without crashing, and preserve the original LaTeX code in the raw content.

**Validates: Requirements 3.1, 3.3, 3.4**

### Property 4: Content Processing Round Trip

*For any* raw content containing LaTeX formulas, the Content_Processor SHALL extract all formulas, convert them to images, and produce a rendered output where all formula markers are replaced with img tags, while the raw content remains unchanged.

**Validates: Requirements 4.1, 4.3, 4.5**

### Property 5: Formula Rendering Consistency

*For any* valid LaTeX formula, the Formula_Renderer SHALL produce a valid SVG image. For invalid formulas, it SHALL preserve the original LaTeX code and log an error.

**Validates: Requirements 4.2, 4.4**

### Property 6: Data Model Structure Integrity

*For any* Question entity, the content and explanation fields SHALL be jsonb objects containing both raw and rendered string fields, and API responses SHALL return the appropriate field based on the use case (rendered for display, raw for editing).

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 7: Option Content Processing

*For any* question with options, each option's content SHALL be processed through the Content_Processor, resulting in a RichContent structure with both raw and rendered fields.

**Validates: Requirements 6.3**

### Property 8: API Response Completeness

*For any* question detail API response, the response SHALL include both raw and rendered versions of content, explanation, and option contents.

**Validates: Requirements 7.3**

### Property 9: Migration Data Preservation

*For any* existing question with text content, after migration the content SHALL be a valid jsonb object where raw equals rendered equals the original text content.

**Validates: Requirements 8.2**

## Error Handling

### 前端错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 图片上传失败 | 显示错误提示，保留编辑器状态 |
| 图片格式不支持 | 上传前验证，显示格式要求 |
| 图片超过大小限制 | 上传前验证，显示大小限制 |
| LaTeX 语法错误 | 显示错误提示，保留原始输入 |
| 网络请求失败 | 显示重试按钮，支持离线编辑 |

### 后端错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 公式转换失败 | 保留原始 LaTeX，记录错误日志 |
| 图片存储失败 | 返回 500 错误，记录详细日志 |
| 内容解析失败 | 返回 400 错误，说明具体问题 |
| 数据库迁移失败 | 回滚事务，记录失败记录 |

## Testing Strategy

### 单元测试

1. **RichTextEditor 组件测试**
   - 测试格式化功能（加粗、斜体等）
   - 测试图片插入和删除
   - 测试公式插入和编辑
   - 测试内容输出格式

2. **ContentProcessorService 测试**
   - 测试 LaTeX 公式提取
   - 测试公式替换逻辑
   - 测试边界情况（空内容、无公式等）

3. **FormulaRendererService 测试**
   - 测试有效 LaTeX 转换
   - 测试无效 LaTeX 错误处理
   - 测试批量转换性能

4. **UploadService 测试**
   - 测试文件类型验证
   - 测试文件大小验证
   - 测试上传成功响应

### 属性测试

使用 fast-check 进行属性测试：

1. **Property 1**: 生成随机富文本内容，验证输出 HTML 格式正确
2. **Property 3**: 生成随机 LaTeX 公式，验证解析和错误处理
3. **Property 4**: 生成包含公式的内容，验证处理后 raw 不变、rendered 公式变图片
4. **Property 6**: 生成随机 Question 数据，验证数据结构完整性

### 集成测试

1. **端到端流程测试**
   - 创建包含富文本的题目
   - 编辑题目内容
   - 验证小程序端渲染结果

2. **数据迁移测试**
   - 迁移前后数据一致性
   - 迁移后 API 正常工作

### 测试框架配置

- 前端：Vitest + React Testing Library + fast-check
- 后端：Jest + fast-check
- 每个属性测试运行 100 次迭代
