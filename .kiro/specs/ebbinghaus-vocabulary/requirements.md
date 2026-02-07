# Requirements Document

## Introduction

艾宾浩斯背单词H5应用，基于艾宾浩斯遗忘曲线原理，帮助用户高效记忆单词。用户可以每天添加新单词，系统会根据遗忘曲线自动安排复习计划（1天、2天、4天、7天、15天、30天），确保单词在最佳时间点被复习。

技术方案：Vue 3 + TypeScript + Vite，纯前端实现，数据存储在localStorage，使用Web Speech API实现发音功能。

## Glossary

- **Vocabulary_System**: 单词管理系统，负责单词的增删改查
- **Review_Scheduler**: 复习调度器，基于艾宾浩斯遗忘曲线计算复习时间
- **Word_Entry**: 单词条目，包含单词、释义、例句等信息
- **Review_Stage**: 复习阶段，表示单词在遗忘曲线中的位置（1/2/4/7/15/30天）
- **Daily_Task**: 每日任务，包含当天需要复习的单词和新学单词
- **Memory_Status**: 记忆状态，标记用户对单词的掌握程度（未学习/学习中/已掌握）
- **Local_Storage**: 本地存储，使用浏览器localStorage持久化数据

## Requirements

### Requirement 1: 单词文件管理

**User Story:** As a 用户, I want 通过编辑项目文件来添加新单词, so that 我可以方便地批量管理单词并追踪每天的学习内容。

#### Acceptance Criteria

1. THE Vocabulary_System SHALL 从 `src/data/words/YYYY-MM-DD.json` 文件加载单词数据
2. WHEN 应用启动 THEN THE Vocabulary_System SHALL 自动加载所有日期文件中的单词
3. THE Word_Entry SHALL 包含以下字段：单词(word)、释义(meaning)、例句(example，可选)
4. WHEN 单词文件格式不正确 THEN THE Vocabulary_System SHALL 跳过该文件并在控制台输出警告
5. FOR ALL 单词文件, 文件名格式 SHALL 为 YYYY-MM-DD.json

### Requirement 2: 艾宾浩斯复习调度

**User Story:** As a 用户, I want 系统根据艾宾浩斯遗忘曲线自动安排复习, so that 我可以在最佳时间点复习单词以加强记忆。

#### Acceptance Criteria

1. THE Review_Scheduler SHALL 按照以下间隔安排复习：第1次复习（1天后）、第2次（2天后）、第3次（4天后）、第4次（7天后）、第5次（15天后）、第6次（30天后）
2. WHEN 用户完成一次复习并标记为"记住了" THEN THE Review_Scheduler SHALL 将单词推进到下一个复习阶段
3. WHEN 用户完成一次复习并标记为"忘记了" THEN THE Review_Scheduler SHALL 将单词重置到第1个复习阶段
4. WHEN 单词完成所有6个复习阶段 THEN THE Review_Scheduler SHALL 将Memory_Status标记为"已掌握"
5. FOR ALL Word_Entry对象, 序列化到JSON再反序列化 SHALL 产生等价的对象（round-trip属性）

### Requirement 3: 每日学习任务

**User Story:** As a 用户, I want 查看今天需要复习的单词列表, so that 我可以有计划地完成每日学习任务。

#### Acceptance Criteria

1. WHEN 用户打开应用首页 THEN THE Daily_Task SHALL 显示今日待复习单词数量和新学单词数量
2. WHEN 用户开始今日复习 THEN THE Vocabulary_System SHALL 按照复习紧急程度排序展示单词（逾期>今日到期>新单词）
3. WHEN 今日没有待复习单词 THEN THE Daily_Task SHALL 显示"今日无复习任务"的提示
4. THE Daily_Task SHALL 显示用户的学习进度统计（已复习/总数）

### Requirement 4: 单词复习交互

**User Story:** As a 用户, I want 通过卡片翻转的方式复习单词, so that 我可以先回忆再确认答案。

#### Acceptance Criteria

1. WHEN 用户查看复习卡片 THEN THE Vocabulary_System SHALL 首先只显示单词，隐藏释义
2. WHEN 用户点击卡片或"显示答案"按钮 THEN THE Vocabulary_System SHALL 显示单词的释义和例句
3. WHEN 答案显示后 THEN THE Vocabulary_System SHALL 提供"记住了"和"忘记了"两个选项
4. WHEN 用户选择记忆状态后 THEN THE Vocabulary_System SHALL 自动切换到下一个待复习单词
5. WHILE 用户在复习过程中 THEN THE Vocabulary_System SHALL 显示当前进度（如：3/10）

### Requirement 5: 词库查看

**User Story:** As a 用户, I want 查看我的词库, so that 我可以了解所有已添加的单词及其学习状态。

#### Acceptance Criteria

1. WHEN 用户访问词库页面 THEN THE Vocabulary_System SHALL 按日期分组显示所有单词
2. WHEN 用户搜索单词 THEN THE Vocabulary_System SHALL 根据单词或释义进行模糊匹配
3. THE Vocabulary_System SHALL 支持按Memory_Status筛选（全部/学习中/已掌握）
4. THE Vocabulary_System SHALL 显示每个单词的当前复习阶段和下次复习时间

### Requirement 6: 学习统计

**User Story:** As a 用户, I want 查看我的学习统计数据, so that 我可以了解自己的学习进度和效果。

#### Acceptance Criteria

1. THE Vocabulary_System SHALL 显示总单词数、已掌握数、学习中数量
2. THE Vocabulary_System SHALL 显示连续学习天数
3. THE Vocabulary_System SHALL 显示本周每日学习单词数的简单图表
4. WHEN 用户完成当日所有复习任务 THEN THE Vocabulary_System SHALL 更新连续学习天数

### Requirement 7: 单词发音

**User Story:** As a 用户, I want 听到单词的发音, so that 我可以学习正确的读音并加深记忆。

#### Acceptance Criteria

1. WHEN 用户点击发音按钮 THEN THE Vocabulary_System SHALL 使用Web Speech API播放单词发音
2. WHEN 复习卡片显示时 THEN THE Vocabulary_System SHALL 提供发音按钮
3. IF 浏览器不支持Web Speech API THEN THE Vocabulary_System SHALL 隐藏发音按钮并不影响其他功能
4. THE Vocabulary_System SHALL 支持选择发音语言（英式/美式英语）

### Requirement 8: 数据持久化

**User Story:** As a 用户, I want 我的复习进度被保存在本地, so that 刷新页面或重新打开应用后进度不会丢失。

#### Acceptance Criteria

1. WHEN 用户完成复习操作 THEN THE Local_Storage SHALL 立即更新单词的复习状态
2. WHEN 应用启动 THEN THE Vocabulary_System SHALL 从Local_Storage加载复习进度并与单词文件合并
3. IF Local_Storage数据损坏或无法解析 THEN THE Vocabulary_System SHALL 提示用户并提供重置选项
4. FOR ALL WordProgress对象, 序列化到JSON再反序列化 SHALL 产生等价的对象（round-trip属性）
