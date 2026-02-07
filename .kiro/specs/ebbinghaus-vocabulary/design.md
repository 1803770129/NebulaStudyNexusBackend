# Design Document: 艾宾浩斯背单词H5

## Overview

这是一个基于Vue 3 + TypeScript + Vite的纯前端H5应用，实现艾宾浩斯遗忘曲线背单词功能。

**核心特点**：单词通过项目中的文件管理，每天一个文件（如 `2026-01-11.json`），开发者直接编辑文件添加单词，构建时自动打包。复习进度存储在localStorage中。

### 技术栈
- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI**: 原生CSS + CSS变量（移动端优先）
- **单词数据**: 项目文件（src/data/words/YYYY-MM-DD.json）
- **复习进度**: localStorage
- **发音**: Web Speech API

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Vue Application                      │
├─────────────────────────────────────────────────────────┤
│  Pages                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Home    │ │  Review  │ │ WordList │ │  Stats   │   │
│  │  (首页)  │ │  (复习)  │ │  (词库)  │ │  (统计)  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  Components                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │WordCard  │ │WordItem  │ │StatsCard │                 │
│  │(复习卡片)│ │(列表项)  │ │(统计卡片)│                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
├─────────────────────────────────────────────────────────┤
│  Stores (Pinia)                                          │
│  ┌──────────────────┐ ┌──────────────────┐              │
│  │  vocabularyStore │ │   progressStore  │              │
│  │  (词库-只读)      │ │   (复习进度)     │              │
│  └──────────────────┘ └──────────────────┘              │
├─────────────────────────────────────────────────────────┤
│  Services                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │WordLoader│ │Scheduler │ │Speech    │                 │
│  │Service   │ │Service   │ │Service   │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
├─────────────────────────────────────────────────────────┤
│  Data Files (src/data/words/)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │2026-01-11.json│ │2026-01-12.json│ │ ...          │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 单词文件格式

每天的单词存放在 `src/data/words/YYYY-MM-DD.json` 文件中：

```json
// src/data/words/2026-01-11.json
[
  {
    "word": "ephemeral",
    "meaning": "短暂的，转瞬即逝的",
    "example": "Fame is ephemeral."
  },
  {
    "word": "ubiquitous",
    "meaning": "无处不在的",
    "example": "Smartphones have become ubiquitous."
  }
]
```

### 文件索引

`src/data/words/index.ts` 自动导入所有单词文件：

```typescript
// 自动导入所有日期文件
const wordFiles = import.meta.glob('./*.json', { eager: true });

export interface WordFile {
  date: string;
  words: RawWord[];
}

export function getAllWordFiles(): WordFile[] {
  return Object.entries(wordFiles).map(([path, module]) => ({
    date: path.replace('./', '').replace('.json', ''),
    words: (module as any).default
  }));
}
```

## Components and Interfaces

### 页面组件

#### HomePage (首页)
- 显示今日学习概览（待复习数、新单词数）
- 开始复习按钮
- 连续学习天数展示

#### ReviewPage (复习页)
- 单词卡片翻转交互
- 进度显示（当前/总数）
- "记住了"/"忘记了"按钮
- 发音按钮

#### WordListPage (词库页)
- 按日期分组显示单词
- 搜索功能
- 筛选（全部/学习中/已掌握）
- 显示每个单词的复习状态

#### StatsPage (统计页)
- 总单词数、已掌握数
- 连续学习天数
- 本周学习图表

### 核心组件

#### WordCard
```typescript
interface WordCardProps {
  word: WordEntry;
  isFlipped: boolean;
  onFlip: () => void;
  onRemember: () => void;
  onForget: () => void;
  onSpeak: () => void;
}
```

## Data Models

### RawWord (原始单词 - 文件中的格式)
```typescript
interface RawWord {
  word: string;                  // 单词
  meaning: string;               // 释义
  example?: string;              // 例句（可选）
}
```

### WordEntry (运行时单词条目)
```typescript
interface WordEntry {
  id: string;                    // 唯一标识 (date_word)
  word: string;                  // 单词
  meaning: string;               // 释义
  example?: string;              // 例句（可选）
  addedDate: string;             // 添加日期 (YYYY-MM-DD，来自文件名)
  reviewStage: ReviewStage;      // 复习阶段 (0-6)
  nextReviewAt: number;          // 下次复习时间戳
  memoryStatus: MemoryStatus;    // 记忆状态
  lastReviewedAt?: number;       // 上次复习时间戳
}

type ReviewStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0: 新单词（未复习）
// 1-6: 对应艾宾浩斯复习阶段

type MemoryStatus = 'new' | 'learning' | 'mastered';
// new: 新添加，未开始学习
// learning: 学习中
// mastered: 已掌握（完成所有复习阶段）
```

### WordProgress (单词复习进度 - 存储在localStorage)
```typescript
interface WordProgress {
  id: string;                    // 单词ID (date_word)
  reviewStage: ReviewStage;      // 复习阶段
  nextReviewAt: number;          // 下次复习时间戳
  memoryStatus: MemoryStatus;    // 记忆状态
  lastReviewedAt?: number;       // 上次复习时间戳
}
```

### ReviewSchedule (复习间隔配置)
```typescript
const REVIEW_INTERVALS: Record<ReviewStage, number> = {
  0: 1,   // 新单词：1天后首次复习
  1: 1,   // 第1次复习后：1天
  2: 2,   // 第2次复习后：2天
  3: 4,   // 第3次复习后：4天
  4: 7,   // 第4次复习后：7天
  5: 15,  // 第5次复习后：15天
  6: 30,  // 第6次复习后：30天（完成后标记为已掌握）
};
```

### StudyStats (学习统计)
```typescript
interface StudyStats {
  totalWords: number;           // 总单词数
  masteredWords: number;        // 已掌握数
  learningWords: number;        // 学习中数
  newWords: number;             // 新单词数
  streakDays: number;           // 连续学习天数
  lastStudyDate: string;        // 上次学习日期 (YYYY-MM-DD)
  weeklyData: DailyStudy[];     // 本周每日数据
}

interface DailyStudy {
  date: string;                 // 日期 (YYYY-MM-DD)
  reviewedCount: number;        // 复习单词数
}
```

### ProgressData (localStorage存储结构)
```typescript
interface ProgressData {
  version: number;              // 数据版本号
  progress: WordProgress[];     // 单词进度列表
  stats: {
    streakDays: number;
    lastStudyDate: string;
    dailyReviews: Record<string, number>; // date -> count
  };
  settings: AppSettings;        // 应用设置
}

interface AppSettings {
  voiceType: 'en-US' | 'en-GB'; // 发音类型
}
```



## Services

### WordLoaderService (单词加载服务)
```typescript
class WordLoaderService {
  // 加载所有单词文件
  loadAllWords(): WordEntry[];
  
  // 按日期获取单词
  getWordsByDate(date: string): WordEntry[];
  
  // 合并单词数据和进度数据
  mergeWithProgress(words: RawWord[], progress: WordProgress[]): WordEntry[];
}
```

### ProgressService (进度存储服务)
```typescript
class ProgressService {
  private readonly STORAGE_KEY = 'ebbinghaus-progress';
  
  // 加载进度数据
  load(): ProgressData | null;
  
  // 保存进度数据
  save(data: ProgressData): void;
  
  // 更新单词进度
  updateWordProgress(wordId: string, progress: Partial<WordProgress>): void;
  
  // 重置数据
  reset(): void;
}
```

### SchedulerService (复习调度服务)
```typescript
class SchedulerService {
  // 获取今日待复习单词
  getTodayReviewWords(words: WordEntry[]): WordEntry[];
  
  // 获取今日新单词（添加当天的）
  getTodayNewWords(words: WordEntry[]): WordEntry[];
  
  // 计算下次复习时间
  calculateNextReview(currentStage: ReviewStage): number;
  
  // 处理"记住了"
  handleRemember(word: WordEntry): WordProgress;
  
  // 处理"忘记了"
  handleForget(word: WordEntry): WordProgress;
  
  // 按紧急程度排序（逾期 > 今日 > 新单词）
  sortByUrgency(words: WordEntry[]): WordEntry[];
}
```

### SpeechService (发音服务)
```typescript
class SpeechService {
  // 检查浏览器是否支持
  isSupported(): boolean;
  
  // 播放单词发音
  speak(word: string, voiceType: 'en-US' | 'en-GB'): void;
  
  // 停止播放
  stop(): void;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: 新单词的首次复习时间正确
*For any* 新加载的单词（无进度记录），其nextReviewAt应该等于添加日期（文件名日期）加1天的时间戳。
**Validates: Requirements 2.1**

### Property 2: 复习间隔计算正确
*For any* 复习阶段（0-6），计算的下次复习间隔应该符合艾宾浩斯曲线：阶段0→1天，阶段1→1天，阶段2→2天，阶段3→4天，阶段4→7天，阶段5→15天，阶段6→30天。
**Validates: Requirements 2.1**

### Property 3: 记住操作推进复习阶段
*For any* 处于阶段0-5的单词，执行"记住了"操作后，其reviewStage应该增加1，且nextReviewAt应该根据新阶段重新计算。
**Validates: Requirements 2.2**

### Property 4: 忘记操作重置复习阶段
*For any* 处于阶段1-6的单词，执行"忘记了"操作后，其reviewStage应该重置为1，且nextReviewAt应该设置为当前时间加1天。
**Validates: Requirements 2.3**

### Property 5: 完成所有阶段后标记为已掌握
*For any* 处于阶段6的单词，执行"记住了"操作后，其memoryStatus应该变为'mastered'。
**Validates: Requirements 2.4**

### Property 6: WordProgress序列化round-trip
*For any* 有效的WordProgress对象，序列化为JSON字符串再反序列化，应该产生与原对象等价的对象。
**Validates: Requirements 8.4**

### Property 7: 今日待复习单词计算正确
*For any* 单词列表，getTodayReviewWords返回的单词应该满足：nextReviewAt <= 当前时间的日期结束时间，且memoryStatus不为'mastered'。
**Validates: Requirements 3.1**

### Property 8: 复习排序正确性
*For any* 待复习单词列表，排序后应该满足：逾期单词在前，今日到期单词在中，新单词在后。
**Validates: Requirements 3.2**

### Property 9: 搜索结果包含匹配项
*For any* 搜索关键词和单词列表，搜索结果中的每个单词的word或meaning字段应该包含该关键词（不区分大小写）。
**Validates: Requirements 5.2**

### Property 10: 状态筛选正确性
*For any* 状态筛选操作，筛选结果中的每个单词的memoryStatus应该等于筛选条件。
**Validates: Requirements 5.3**

### Property 11: 统计数据正确性
*For any* 单词列表，统计的totalWords应该等于列表长度，masteredWords应该等于memoryStatus为'mastered'的数量，learningWords应该等于memoryStatus为'learning'的数量。
**Validates: Requirements 6.1**

### Property 12: 数据持久化正确性
*For any* 复习操作，操作后localStorage中的进度数据应该反映最新状态。
**Validates: Requirements 8.1**

## Error Handling

### 文件加载错误
- 文件格式不正确：跳过该文件，控制台输出警告
- 文件名格式不正确：跳过该文件

### 存储错误
- localStorage不可用：显示警告，应用仍可使用但进度不会持久化
- 数据解析失败：显示"数据损坏"提示，提供重置选项
- 存储空间不足：显示"存储空间不足"提示

### 发音错误
- Web Speech API不支持：隐藏发音按钮，不影响其他功能
- 发音失败：静默失败，不显示错误

## Testing Strategy

### 单元测试
使用Vitest进行单元测试，重点测试：
- SchedulerService的复习间隔计算
- StorageService的数据序列化/反序列化
- 单词筛选、搜索、排序逻辑
- 统计数据计算

### 属性测试
使用fast-check进行属性测试，验证：
- WordEntry的round-trip序列化
- 复习阶段状态转换的正确性
- 排序和筛选的正确性
- 导入导出的round-trip

### 测试配置
- 每个属性测试运行至少100次迭代
- 使用fast-check生成随机测试数据
- 测试标签格式：**Feature: ebbinghaus-vocabulary, Property N: {property_text}**
