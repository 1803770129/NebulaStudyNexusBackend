# Implementation Plan: 艾宾浩斯背单词H5

## Overview

使用Vue 3 + TypeScript + Vite构建艾宾浩斯背单词H5应用。单词通过项目文件管理，复习进度存储在localStorage。

## Tasks

- [x] 1. 项目初始化和基础配置
  - 使用Vite创建Vue 3 + TypeScript项目
  - 配置Pinia状态管理
  - 配置Vue Router
  - 配置Vitest和fast-check测试框架
  - 创建基础目录结构
  - _Requirements: 1.1, 1.2_

- [ ] 2. 数据类型和核心服务
  - [x] 2.1 定义数据类型
    - 创建 `src/types/index.ts`
    - 定义RawWord、WordEntry、WordProgress、ProgressData等类型
    - _Requirements: 1.3_

  - [x] 2.2 实现SchedulerService复习调度服务
    - 创建 `src/services/scheduler.ts`
    - 实现复习间隔计算（1/2/4/7/15/30天）
    - 实现handleRemember和handleForget方法
    - 实现getTodayReviewWords和sortByUrgency方法
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

  - [ ]* 2.3 编写SchedulerService属性测试
    - **Property 2: 复习间隔计算正确**
    - **Property 3: 记住操作推进复习阶段**
    - **Property 4: 忘记操作重置复习阶段**
    - **Property 5: 完成所有阶段后标记为已掌握**
    - **Property 7: 今日待复习单词计算正确**
    - **Property 8: 复习排序正确性**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 3.1, 3.2**

  - [x] 2.4 实现ProgressService进度存储服务
    - 创建 `src/services/progress.ts`
    - 实现load、save、updateWordProgress、reset方法
    - 处理localStorage错误
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 2.5 编写ProgressService属性测试
    - **Property 6: WordProgress序列化round-trip**
    - **Property 12: 数据持久化正确性**
    - **Validates: Requirements 8.1, 8.4**

- [ ] 3. 单词数据加载
  - [x] 3.1 创建示例单词文件
    - 创建 `src/data/words/` 目录
    - 创建示例文件 `2026-01-11.json`
    - _Requirements: 1.1, 1.5_

  - [x] 3.2 实现WordLoaderService
    - 创建 `src/services/wordLoader.ts`
    - 使用import.meta.glob加载所有单词文件
    - 实现loadAllWords和mergeWithProgress方法
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 3.3 编写WordLoaderService单元测试
    - 测试文件加载和合并逻辑
    - _Requirements: 1.1, 1.2_

- [x] 4. Checkpoint - 核心服务测试
  - 确保所有服务测试通过，ask the user if questions arise.

- [ ] 5. 状态管理
  - [x] 5.1 实现vocabularyStore
    - 创建 `src/stores/vocabulary.ts`
    - 管理单词列表（只读）
    - 实现搜索和筛选功能
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 5.2 编写vocabularyStore属性测试
    - **Property 9: 搜索结果包含匹配项**
    - **Property 10: 状态筛选正确性**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 5.3 实现progressStore
    - 创建 `src/stores/progress.ts`
    - 管理复习进度和统计数据
    - 实现复习操作（记住/忘记）
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 5.4 编写progressStore属性测试
    - **Property 11: 统计数据正确性**
    - **Validates: Requirements 6.1**

- [ ] 6. 发音服务
  - [x] 6.1 实现SpeechService
    - 创建 `src/services/speech.ts`
    - 实现isSupported、speak、stop方法
    - 支持英式/美式发音切换
    - _Requirements: 7.1, 7.3, 7.4_

- [ ] 7. 页面和组件开发
  - [x] 7.1 创建基础布局和路由
    - 创建 `src/App.vue` 主布局
    - 配置路由（首页、复习、词库、统计）
    - 创建底部导航组件
    - _Requirements: 3.1_

  - [x] 7.2 实现首页HomePage
    - 创建 `src/pages/Home.vue`
    - 显示今日待复习数和新单词数
    - 显示连续学习天数
    - 开始复习按钮
    - _Requirements: 3.1, 3.3, 6.2_

  - [x] 7.3 实现复习页ReviewPage
    - 创建 `src/pages/Review.vue`
    - 实现WordCard卡片翻转组件
    - 实现进度显示
    - 实现记住/忘记按钮
    - 集成发音功能
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.2_

  - [x] 7.4 实现词库页WordListPage
    - 创建 `src/pages/WordList.vue`
    - 按日期分组显示单词
    - 实现搜索功能
    - 实现状态筛选
    - 显示复习状态
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.5 实现统计页StatsPage
    - 创建 `src/pages/Stats.vue`
    - 显示总单词数、已掌握数、学习中数
    - 显示连续学习天数
    - 显示本周学习图表
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. 样式和移动端适配
  - [x] 8.1 创建全局样式
    - 创建CSS变量主题
    - 移动端优先的响应式布局
    - 卡片翻转动画
    - _Requirements: 4.1_

- [ ] 9. Final Checkpoint
  - 确保所有测试通过，ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 单词通过编辑 `src/data/words/YYYY-MM-DD.json` 文件添加
- 复习进度存储在localStorage
- 使用fast-check进行属性测试
