# Requirements Document

## Introduction

本功能为题库管理系统添加富文本编辑能力，支持在题目内容和解析中插入文字、图片和数学公式。管理后台使用 Tiptap 富文本编辑器进行内容编辑，后端负责将 LaTeX 公式转换为图片，最终输出适合 UniApp 小程序 rich-text 组件渲染的 HTML 内容。

## Glossary

- **Rich_Text_Editor**: 基于 Tiptap 的富文本编辑器组件，支持文字格式化、图片插入和 LaTeX 公式输入
- **LaTeX_Formula**: 使用 LaTeX 语法编写的数学公式，如 `$E=mc^2$` 或 `$$\sum_{i=1}^{n}$$`
- **Formula_Renderer**: 后端服务，负责将 LaTeX 公式转换为 SVG/PNG 图片
- **Content_Processor**: 内容处理服务，负责解析富文本内容并转换公式为图片
- **Raw_Content**: 原始富文本内容，包含 HTML 和 LaTeX 公式，用于管理后台编辑
- **Rendered_Content**: 处理后的内容，公式已转换为图片 URL，用于小程序端展示
- **Image_Storage**: 图片存储服务，负责上传和管理图片资源

## Requirements

### Requirement 1: 富文本编辑器集成

**User Story:** As a 题目管理员, I want to 使用富文本编辑器编辑题目内容和解析, so that I can 插入格式化文字、图片和数学公式。

#### Acceptance Criteria

1. WHEN 用户打开题目编辑表单 THEN THE Rich_Text_Editor SHALL 替换原有的 TextArea 组件用于编辑题目内容和解析
2. THE Rich_Text_Editor SHALL 支持基本文字格式化功能，包括加粗、斜体、下划线、有序列表和无序列表
3. WHEN 用户点击图片按钮 THEN THE Rich_Text_Editor SHALL 显示图片上传对话框
4. WHEN 用户上传图片 THEN THE Image_Storage SHALL 将图片上传到服务器并返回 URL
5. WHEN 用户点击公式按钮 THEN THE Rich_Text_Editor SHALL 显示 LaTeX 公式输入对话框
6. WHEN 用户输入 LaTeX 公式 THEN THE Rich_Text_Editor SHALL 实时预览公式渲染效果
7. THE Rich_Text_Editor SHALL 输出包含 HTML 和 LaTeX 公式标记的结构化内容

### Requirement 2: 图片上传与管理

**User Story:** As a 题目管理员, I want to 在题目中插入图片, so that I can 展示图表、示意图等视觉内容。

#### Acceptance Criteria

1. WHEN 用户选择图片文件 THEN THE Image_Storage SHALL 验证文件类型为 jpg、png、gif 或 webp
2. WHEN 图片文件大小超过 5MB THEN THE Image_Storage SHALL 拒绝上传并显示错误提示
3. WHEN 图片上传成功 THEN THE Image_Storage SHALL 返回图片的访问 URL
4. THE Rich_Text_Editor SHALL 将图片以 img 标签形式插入到内容中
5. WHEN 用户删除已插入的图片 THEN THE Rich_Text_Editor SHALL 从内容中移除对应的 img 标签

### Requirement 3: LaTeX 公式支持

**User Story:** As a 题目管理员, I want to 在题目中插入数学公式, so that I can 准确表达数学表达式和科学符号。

#### Acceptance Criteria

1. THE Rich_Text_Editor SHALL 支持行内公式语法 `$...$` 和块级公式语法 `$$...$$`
2. WHEN 用户输入 LaTeX 公式 THEN THE Rich_Text_Editor SHALL 使用 KaTeX 实时渲染预览
3. IF LaTeX 语法错误 THEN THE Rich_Text_Editor SHALL 显示错误提示而不是崩溃
4. THE Rich_Text_Editor SHALL 在内容中保留原始 LaTeX 代码以便后续编辑

### Requirement 4: 后端公式转换服务

**User Story:** As a 系统, I want to 将 LaTeX 公式转换为图片, so that 小程序端可以正确显示数学公式。

#### Acceptance Criteria

1. WHEN 保存题目时 THEN THE Content_Processor SHALL 解析内容中的所有 LaTeX 公式
2. THE Formula_Renderer SHALL 将每个 LaTeX 公式转换为 SVG 格式图片
3. WHEN 公式转换成功 THEN THE Content_Processor SHALL 将公式替换为 img 标签
4. IF 公式转换失败 THEN THE Content_Processor SHALL 保留原始 LaTeX 代码并记录错误日志
5. THE Content_Processor SHALL 同时保存原始内容（raw）和渲染后内容（rendered）

### Requirement 5: 数据模型更新

**User Story:** As a 开发者, I want to 更新数据模型以支持富文本内容, so that 系统可以存储和管理复杂的内容结构。

#### Acceptance Criteria

1. THE Question 实体 SHALL 将 content 字段类型从 text 更改为 jsonb
2. THE Question 实体 SHALL 将 explanation 字段类型从 text 更改为 jsonb
3. THE content 和 explanation 字段 SHALL 包含 raw 和 rendered 两个子字段
4. WHEN 查询题目列表时 THEN THE Question_Service SHALL 返回 rendered 内容用于展示
5. WHEN 编辑题目时 THEN THE Question_Service SHALL 返回 raw 内容用于编辑器加载

### Requirement 6: 选项富文本支持

**User Story:** As a 题目管理员, I want to 在选择题选项中使用富文本, so that 选项也可以包含图片和公式。

#### Acceptance Criteria

1. THE Option 接口 SHALL 将 content 字段更新为支持富文本格式
2. THE Rich_Text_Editor SHALL 为每个选项提供简化版富文本编辑功能
3. WHEN 保存选项内容时 THEN THE Content_Processor SHALL 同样处理选项中的公式

### Requirement 7: API 接口更新

**User Story:** As a 前端开发者, I want to 通过 API 获取和提交富文本内容, so that 前后端可以正确交互。

#### Acceptance Criteria

1. THE Create_Question_API SHALL 接受包含 raw 内容的请求体
2. THE Update_Question_API SHALL 接受包含 raw 内容的请求体
3. WHEN 返回题目详情时 THEN THE API SHALL 同时返回 raw 和 rendered 内容
4. THE API SHALL 提供独立的图片上传接口 POST /api/upload/image

### Requirement 8: 数据迁移

**User Story:** As a 系统管理员, I want to 迁移现有数据到新格式, so that 历史题目可以正常使用。

#### Acceptance Criteria

1. THE Migration_Script SHALL 将现有 text 格式的 content 转换为 jsonb 格式
2. THE Migration_Script SHALL 将原始文本内容同时设置为 raw 和 rendered 字段
3. WHEN 迁移完成后 THEN THE System SHALL 保持所有现有题目可正常访问
