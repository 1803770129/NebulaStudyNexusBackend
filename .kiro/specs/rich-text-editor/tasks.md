# Implementation Plan: Rich Text Editor

## Overview

本实现计划将富文本编辑功能分为后端服务、前端组件、数据迁移三个主要阶段，采用增量开发方式确保每个阶段都可独立验证。

## Tasks

- [x] 1. 后端基础设施搭建
  - [x] 1.1 创建图片上传模块
    - 创建 `src/modules/upload/upload.module.ts`
    - 创建 `src/modules/upload/upload.controller.ts`
    - 创建 `src/modules/upload/upload.service.ts`
    - 实现文件类型和大小验证
    - 配置 Multer 中间件
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.2 创建公式渲染服务
    - 安装 mathjax-node 依赖
    - 创建 `src/modules/formula/formula.module.ts`
    - 创建 `src/modules/formula/formula.service.ts`
    - 实现 LaTeX 到 SVG 转换
    - 实现批量转换方法
    - _Requirements: 4.2_

  - [x] 1.3 创建内容处理服务
    - 创建 `src/modules/content/content.module.ts`
    - 创建 `src/modules/content/content.service.ts`
    - 实现 LaTeX 公式提取（支持 `$...$` 和 `$$...$$`）
    - 实现公式替换为 img 标签
    - 实现 RichContent 结构生成
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [x] 1.4 编写后端服务单元测试
    - 测试 UploadService 文件验证
    - 测试 FormulaService 公式转换
    - 测试 ContentService 内容处理
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. 后端数据模型更新
  - [x] 2.1 更新 Question 实体
    - 修改 content 字段类型为 jsonb
    - 修改 explanation 字段类型为 jsonb
    - 更新 Option 接口定义
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 更新 DTO 定义
    - 更新 CreateQuestionDto
    - 更新 UpdateQuestionDto
    - 更新 OptionDto
    - 添加 RichContent 类型定义
    - _Requirements: 7.1, 7.2_

  - [x] 2.3 更新 QuestionService
    - 在创建/更新时调用 ContentService 处理内容
    - 处理选项中的富文本内容
    - 更新查询方法返回适当的内容格式
    - _Requirements: 5.4, 5.5, 6.3_

  - [x] 2.4 编写属性测试：内容处理往返一致性
    - **Property 4: Content Processing Round Trip**
    - **Validates: Requirements 4.1, 4.3, 4.5**

  - [x] 2.5 编写属性测试：数据模型结构完整性
    - **Property 6: Data Model Structure Integrity**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 3. Checkpoint - 后端功能验证
  - 确保所有后端测试通过
  - 验证 API 接口正常工作
  - 如有问题请询问用户

- [x] 4. 前端富文本编辑器组件
  - [x] 4.1 安装前端依赖
    - 安装 @tiptap/react, @tiptap/starter-kit
    - 安装 @tiptap/extension-image
    - 安装 katex 和 @types/katex
    - _Requirements: 1.1_

  - [x] 4.2 创建 RichTextEditor 组件
    - 创建 `src/components/editor/RichTextEditor.tsx`
    - 配置 Tiptap 编辑器扩展
    - 实现工具栏（加粗、斜体、列表等）
    - 实现图片插入功能
    - 实现公式插入功能
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 4.3 创建 FormulaDialog 组件
    - 创建 `src/components/editor/FormulaDialog.tsx`
    - 实现 LaTeX 输入框
    - 实现 KaTeX 实时预览
    - 实现错误提示
    - _Requirements: 1.6, 3.1, 3.2, 3.3_

  - [x] 4.4 创建图片上传功能
    - 创建 `src/services/uploadService.ts`
    - 实现图片上传 API 调用
    - 实现上传进度显示
    - 实现错误处理
    - _Requirements: 1.4, 2.4_

  - [x] 4.5 编写属性测试：LaTeX 公式处理
    - **Property 3: LaTeX Formula Handling**
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 5. 前端表单集成
  - [x] 5.1 更新 QuestionForm 组件
    - 替换 content TextArea 为 RichTextEditor
    - 替换 explanation TextArea 为 RichTextEditor
    - 更新表单数据处理逻辑
    - _Requirements: 1.1, 1.7_

  - [x] 5.2 更新选项编辑
    - 为选项添加简化版 RichTextEditor
    - 更新选项数据结构处理
    - _Requirements: 6.1, 6.2_

  - [x] 5.3 更新类型定义
    - 更新 `src/types/index.ts` 中的 Question 接口
    - 添加 RichContent 类型
    - 更新 Option 接口
    - _Requirements: 5.3, 6.1_

  - [x] 5.4 更新 questionService
    - 更新 API 调用以处理新的数据格式
    - 处理 raw/rendered 内容转换
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 5.5 编写前端组件测试
    - 测试 RichTextEditor 渲染
    - 测试 FormulaDialog 功能
    - 测试表单提交数据格式
    - _Requirements: 1.2, 1.7_

- [ ] 6. Checkpoint - 前端功能验证
  - 确保所有前端测试通过
  - 验证编辑器功能正常
  - 如有问题请询问用户

- [ ] 7. 数据迁移
  - [ ] 7.1 创建数据库迁移脚本
    - 创建 TypeORM 迁移文件
    - 实现 content 字段类型转换
    - 实现 explanation 字段类型转换
    - 实现 options 内容结构更新
    - _Requirements: 8.1, 8.2_

  - [ ] 7.2 编写迁移验证测试
    - **Property 9: Migration Data Preservation**
    - **Validates: Requirements 8.2**

- [x] 8. 技术文档编写
  - [x] 8.1 创建富文本编辑器技术文档
    - 创建 `question-managing/docs/RICH_TEXT_GUIDE.md`
    - 记录技术选型和原因
    - 记录组件使用方法
    - 记录公式语法说明
    - 记录常见问题解决方案
    - _Requirements: 用户要求_

  - [x] 8.2 创建后端内容处理文档
    - 创建 `question-backend/docs/CONTENT_PROCESSING.md`
    - 记录内容处理流程
    - 记录公式转换原理
    - 记录 API 接口说明
    - _Requirements: 用户要求_

- [ ] 9. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证端到端流程
  - 如有问题请询问用户

## Notes

- 所有任务均为必需任务，包含完整测试覆盖
- 建议先完成后端服务，再进行前端集成
- 数据迁移应在功能开发完成后进行
- 文档编写可与开发并行进行
