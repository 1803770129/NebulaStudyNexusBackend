# Requirements Document

## Introduction

基于 Taro 4 + React 19 + Vite + TypeScript 开发的刷题小程序，对接现有的 question-backend 后端服务。小程序提供题目浏览、刷题练习、错题本、收藏夹、学习统计等核心功能，支持微信小程序平台。

## Glossary

- **Miniapp**: 基于 Taro 4 框架 + React 19 + Vite 构建工具开发的微信小程序客户端
- **Question**: 题目实体，包含题干、选项、答案、解析等信息
- **Category**: 题目分类，支持最多三级树形结构
- **Tag**: 题目标签，用于多维度标记题目
- **Wrong_Book**: 错题本，记录用户答错的题目
- **Favorites**: 收藏夹，记录用户收藏的题目
- **Study_Record**: 学习记录，记录用户的答题历史
- **Rich_Content**: 富文本内容结构，包含原始内容和渲染后内容

## Requirements

### Requirement 1: 用户认证

**User Story:** As a 用户, I want to 登录小程序, so that 我可以保存学习进度和个人数据。

#### Acceptance Criteria

1. WHEN 用户首次打开小程序 THEN THE Miniapp SHALL 显示登录页面或引导用户登录
2. WHEN 用户点击微信登录按钮 THEN THE Miniapp SHALL 调用微信授权接口获取用户信息
3. WHEN 微信授权成功 THEN THE Miniapp SHALL 将授权信息发送到后端换取 JWT Token
4. WHEN 登录成功 THEN THE Miniapp SHALL 将 Token 存储到本地并跳转到首页
5. WHEN Token 过期 THEN THE Miniapp SHALL 自动刷新 Token 或引导用户重新登录
6. IF 登录失败 THEN THE Miniapp SHALL 显示错误提示并允许用户重试

### Requirement 2: 首页展示

**User Story:** As a 用户, I want to 在首页看到学习概览, so that 我可以快速了解学习进度并开始刷题。

#### Acceptance Criteria

1. WHEN 用户进入首页 THEN THE Miniapp SHALL 显示今日学习统计（已答题数、正确率）
2. WHEN 用户进入首页 THEN THE Miniapp SHALL 显示快捷入口（随机刷题、错题本、收藏夹）
3. WHEN 用户进入首页 THEN THE Miniapp SHALL 显示推荐分类列表
4. WHEN 用户点击随机刷题 THEN THE Miniapp SHALL 跳转到随机题目答题页面
5. WHEN 用户点击分类卡片 THEN THE Miniapp SHALL 跳转到该分类的题目列表页面

### Requirement 3: 分类浏览

**User Story:** As a 用户, I want to 按分类浏览题目, so that 我可以针对性地学习特定领域的知识。

#### Acceptance Criteria

1. WHEN 用户进入分类页面 THEN THE Miniapp SHALL 从后端获取分类树并展示
2. WHEN 分类有子分类 THEN THE Miniapp SHALL 显示可展开的层级结构
3. WHEN 用户点击分类 THEN THE Miniapp SHALL 显示该分类下的题目数量
4. WHEN 用户选择叶子分类 THEN THE Miniapp SHALL 跳转到该分类的题目列表
5. IF 获取分类失败 THEN THE Miniapp SHALL 显示错误提示并提供重试按钮

### Requirement 4: 题目列表

**User Story:** As a 用户, I want to 查看题目列表, so that 我可以选择要练习的题目。

#### Acceptance Criteria

1. WHEN 用户进入题目列表页 THEN THE Miniapp SHALL 分页加载题目列表
2. WHEN 用户滚动到底部 THEN THE Miniapp SHALL 自动加载下一页题目
3. WHEN 用户选择筛选条件（难度、题型） THEN THE Miniapp SHALL 重新加载符合条件的题目
4. WHEN 用户点击题目卡片 THEN THE Miniapp SHALL 跳转到题目详情/答题页面
5. THE Miniapp SHALL 在题目卡片上显示题目类型、难度标签
6. IF 列表为空 THEN THE Miniapp SHALL 显示空状态提示

### Requirement 5: 答题功能

**User Story:** As a 用户, I want to 在线答题, so that 我可以练习和检验知识掌握程度。

#### Acceptance Criteria

1. WHEN 用户进入答题页面 THEN THE Miniapp SHALL 显示题目内容和选项
2. WHEN 题目包含富文本或公式 THEN THE Miniapp SHALL 正确渲染 HTML 和 LaTeX 公式
3. WHEN 用户选择单选题答案 THEN THE Miniapp SHALL 高亮选中的选项
4. WHEN 用户选择多选题答案 THEN THE Miniapp SHALL 支持多个选项的选中和取消
5. WHEN 用户点击提交答案 THEN THE Miniapp SHALL 判断答案正误并显示结果
6. WHEN 答案正确 THEN THE Miniapp SHALL 显示正确提示和解析
7. WHEN 答案错误 THEN THE Miniapp SHALL 显示正确答案、用户答案对比和解析
8. WHEN 答案错误 THEN THE Miniapp SHALL 自动将题目加入错题本
9. WHEN 用户点击下一题 THEN THE Miniapp SHALL 加载下一道题目
10. WHEN 用户点击收藏按钮 THEN THE Miniapp SHALL 将题目添加到收藏夹或取消收藏

### Requirement 6: 错题本

**User Story:** As a 用户, I want to 查看和复习错题, so that 我可以针对薄弱点进行强化练习。

#### Acceptance Criteria

1. WHEN 用户进入错题本页面 THEN THE Miniapp SHALL 显示所有答错的题目列表
2. WHEN 用户点击错题 THEN THE Miniapp SHALL 进入该题目的复习模式
3. WHEN 用户在复习模式答对题目 THEN THE Miniapp SHALL 提示是否从错题本移除
4. WHEN 用户确认移除 THEN THE Miniapp SHALL 将题目从错题本删除
5. THE Miniapp SHALL 支持按分类筛选错题
6. IF 错题本为空 THEN THE Miniapp SHALL 显示鼓励性的空状态提示

### Requirement 7: 收藏夹

**User Story:** As a 用户, I want to 收藏重要题目, so that 我可以方便地回顾和复习。

#### Acceptance Criteria

1. WHEN 用户进入收藏夹页面 THEN THE Miniapp SHALL 显示所有收藏的题目列表
2. WHEN 用户点击收藏的题目 THEN THE Miniapp SHALL 跳转到题目详情页
3. WHEN 用户取消收藏 THEN THE Miniapp SHALL 将题目从收藏夹移除
4. THE Miniapp SHALL 支持按分类筛选收藏
5. IF 收藏夹为空 THEN THE Miniapp SHALL 显示引导用户收藏的提示

### Requirement 8: 学习统计

**User Story:** As a 用户, I want to 查看学习统计, so that 我可以了解自己的学习情况和进步。

#### Acceptance Criteria

1. WHEN 用户进入统计页面 THEN THE Miniapp SHALL 显示总答题数、正确率、连续学习天数
2. WHEN 用户进入统计页面 THEN THE Miniapp SHALL 显示各分类的答题情况
3. WHEN 用户进入统计页面 THEN THE Miniapp SHALL 显示近7天的学习趋势图表
4. THE Miniapp SHALL 按难度统计正确率分布
5. IF 无学习记录 THEN THE Miniapp SHALL 显示引导用户开始学习的提示

### Requirement 9: 个人中心

**User Story:** As a 用户, I want to 管理个人信息和设置, so that 我可以个性化使用体验。

#### Acceptance Criteria

1. WHEN 用户进入个人中心 THEN THE Miniapp SHALL 显示用户头像和昵称
2. WHEN 用户进入个人中心 THEN THE Miniapp SHALL 显示学习成就概览
3. WHEN 用户点击设置 THEN THE Miniapp SHALL 跳转到设置页面
4. WHEN 用户点击退出登录 THEN THE Miniapp SHALL 清除本地数据并跳转到登录页
5. THE Miniapp SHALL 提供清除缓存、关于我们等设置选项

### Requirement 10: 离线支持与数据同步

**User Story:** As a 用户, I want to 在网络不稳定时也能使用基本功能, so that 我的学习不会被网络问题中断。

#### Acceptance Criteria

1. THE Miniapp SHALL 将用户的学习记录缓存到本地存储
2. WHEN 网络恢复 THEN THE Miniapp SHALL 自动同步本地数据到服务器
3. WHEN 网络请求失败 THEN THE Miniapp SHALL 显示友好的错误提示
4. THE Miniapp SHALL 缓存已加载的分类数据以减少重复请求
5. IF 本地数据与服务器数据冲突 THEN THE Miniapp SHALL 以服务器数据为准

### Requirement 11: 富文本与公式渲染

**User Story:** As a 用户, I want to 正确查看包含公式和富文本的题目, so that 我可以完整理解题目内容。

#### Acceptance Criteria

1. WHEN 题目内容包含 HTML 标签 THEN THE Miniapp SHALL 使用 rich-text 组件正确渲染
2. WHEN 题目内容包含 LaTeX 公式 THEN THE Miniapp SHALL 渲染公式图片或使用 MathJax
3. WHEN 选项内容包含富文本 THEN THE Miniapp SHALL 正确渲染选项内容
4. WHEN 解析内容包含富文本 THEN THE Miniapp SHALL 正确渲染解析内容
5. THE Miniapp SHALL 确保富文本内容在不同屏幕尺寸下正确显示
