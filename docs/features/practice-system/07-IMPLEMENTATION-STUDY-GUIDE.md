# 刷题系统开发说明与教学文档（截至 2026-02-21）
## 1. 文档目的
这份文档用于回答两个问题：

1. 到目前为止到底做了哪些功能，状态如何。
2. 你要继续开发时，应该先看哪几个文件、按什么顺序理解、怎么验证。

文档面向“可接手继续开发”的目标编写，不只给结论，也给代码入口与数据流路径。

---

## 2. 当前完成度总览
### 2.1 已完成（可用）
1. P0-R01 会话化练习主链路（后端 + 管理端）。
2. 会话结果增强指标：`totalDuration`、`weakKnowledgePoints`。
3. P0-R02 简答题人工批改闭环（后端 + 管理端）。
4. 学生端练习记录详情接口（可查看批改结果）。
5. P0-R03 错题复习计划后端核心能力（SRS 字段、算法、到期查询、复习回写、复习抽题优先级）。
6. 管理端和后端 TypeScript 构建恢复通过（历史 TS 报错已清理）。

### 2.2 部分完成（下一步）
1. P0-R03 中的“定时任务/调度器（Scheduler）+ 告警”尚未落地（当前是实时按 `nextReviewAt` 查询到期题）。
2. 学生端“今日待复习卡片与复习页面”尚未在当前管理端仓库实现（当前仓库主要是后台管理端）。

---

## 3. 模块与代码地图（快速定位）
### 3.1 后端核心目录（NestJS）
1. 模块入口：`question-backend/src/modules/student-question/student-question.module.ts`
2. 学生题目服务：`question-backend/src/modules/student-question/student-question.service.ts`
3. 会话服务：`question-backend/src/modules/student-question/practice-session.service.ts`
4. 人工批改服务：`question-backend/src/modules/student-question/manual-grading.service.ts`
5. 复习计划算法：`question-backend/src/modules/student-question/review-plan.service.ts`
6. 控制器：
   - `question-backend/src/modules/student-question/student-question.controller.ts`
   - `question-backend/src/modules/student-question/practice-session.controller.ts`
   - `question-backend/src/modules/student-question/practice-session-admin.controller.ts`
   - `question-backend/src/modules/student-question/manual-grading-admin.controller.ts`

### 3.2 管理端核心目录（React + AntD + React Query）
1. 路由入口：`question-managing/src/router/index.tsx`
2. 会话管理页：`question-managing/src/pages/PracticeSessionManage/index.tsx`
3. 批改管理页：`question-managing/src/pages/ManualGradingManage/index.tsx`
4. 对应 hooks：
   - `question-managing/src/hooks/usePracticeSessions.ts`
   - `question-managing/src/hooks/useManualGradingTasks.ts`
5. 对应 services：
   - `question-managing/src/services/practiceSessionService.ts`
   - `question-managing/src/services/manualGradingService.ts`

---

## 4. 已落地功能详解
## 4.1 P0-R01 会话化练习（Session Practice）
### 4.1.1 解决的问题
从“单题提交”升级为“会话式连续刷题”：支持模式化抽题、连续答题、会话状态管理、会话结果汇总。

### 4.1.2 数据模型与迁移
1. 新表：`practice_sessions`  
   实体：`question-backend/src/modules/student-question/entities/practice-session.entity.ts`
2. 新表：`practice_session_items`  
   实体：`question-backend/src/modules/student-question/entities/practice-session-item.entity.ts`
3. 扩展：`practice_records` 增加会话关联与 `attemptType`  
   迁移：`question-backend/src/database/migrations/1761000000000-CreatePracticeSessions.ts`

### 4.1.3 关键流程（后端）
1. 创建会话：`POST /student/practice-sessions`  
   入口：`practice-session.controller.ts` -> `PracticeSessionService.createSession(...)`
2. 拉取当前题：`GET /student/practice-sessions/:id/current`
3. 提交单题：`POST /student/practice-sessions/:id/items/:itemId/submit`
4. 主动完成会话：`POST /student/practice-sessions/:id/complete`
5. 学生/管理员列表与详情查询：
   - `GET /student/practice-sessions`
   - `GET /admin/practice-sessions`
   - `GET /admin/practice-sessions/stats`

### 4.1.4 指标增强（已完成）
在会话摘要输出中补齐：
1. `totalDuration`：优先聚合 `practice_records.duration`，无数据时回退 `endedAt - startedAt`。
2. `weakKnowledgePoints`：按知识点正确率排序，输出 TopN 薄弱项。

实现位于：`question-backend/src/modules/student-question/practice-session.service.ts`

### 4.1.5 管理端落地
1. 页面：`question-managing/src/pages/PracticeSessionManage/index.tsx`
2. 能力：
   - 会话分页查询、关键词筛选（学生昵称/手机号）
   - 状态与模式筛选
   - 详情抽屉（会话项、薄弱知识点、总耗时）
3. 数据接口：
   - `question-managing/src/services/practiceSessionService.ts`
   - `question-managing/src/hooks/usePracticeSessions.ts`

---

## 4.2 P0-R02 简答题人工批改闭环
### 4.2.1 解决的问题
主观题（简答题）无法自动判分，需要形成“自动入池 -> 领取 -> 批改 -> 回写记录”的闭环。

### 4.2.2 数据模型与迁移
1. 新表：`manual_grading_tasks`  
   实体：`question-backend/src/modules/student-question/entities/manual-grading-task.entity.ts`
2. 扩展 `practice_records`：
   - `score`
   - `gradingFeedback`
   - `gradingTags`
   - `isPassed`
   - `gradedBy`
   - `gradedAt`
3. 迁移：`question-backend/src/database/migrations/1761100000000-CreateManualGradingTasks.ts`

### 4.2.3 关键流程（后端）
1. 学生提交简答题时自动建任务：  
   `StudentQuestionService.submitAnswer(...)` -> `ManualGradingService.createTaskFromPracticeRecord(...)`
2. 管理员领取任务：`POST /grading/tasks/:id/claim`
3. 管理员提交批改：`POST /grading/tasks/:id/submit`
4. 管理员重开任务：`POST /grading/tasks/:id/reopen`
5. 一致性策略：批改提交与记录回写在事务内执行。

核心代码：`question-backend/src/modules/student-question/manual-grading.service.ts`

### 4.2.4 接口清单
1. `GET /grading/tasks`
2. `GET /grading/tasks/:id`
3. `POST /grading/tasks/:id/claim`
4. `POST /grading/tasks/:id/submit`
5. `POST /grading/tasks/:id/reopen`
6. `GET /student/practice-records/:id`（学生查看记录详情）

### 4.2.5 管理端落地
1. 页面：`question-managing/src/pages/ManualGradingManage/index.tsx`
2. 能力：
   - 任务筛选、分页、详情查看
   - 领取任务
   - 评分/通过状态/评语/标签提交
   - 已完成任务重开
3. 数据接口：
   - `question-managing/src/services/manualGradingService.ts`
   - `question-managing/src/hooks/useManualGradingTasks.ts`

---

## 4.3 P0-R03 错题复习计划（SRS）后端核心
### 4.3.1 目标
将错题本从“静态存储”升级为“可调度复习队列”。

### 4.3.2 数据模型
`wrong_book` 新增字段：
1. `reviewLevel`
2. `nextReviewAt`
3. `lastReviewResult`
4. `lastReviewedAt`

实体：`question-backend/src/modules/student-question/entities/wrong-book.entity.ts`  
迁移：`question-backend/src/database/migrations/1761200000000-ExtendWrongBookReviewPlan.ts`

迁移还包含：
1. 历史数据回填：`nextReviewAt = lastWrongAt + 1 day`
2. 关键索引：`idx_wrong_book_next_review_at`、`idx_wrong_book_student_master_due`

### 4.3.3 算法服务
`question-backend/src/modules/student-question/review-plan.service.ts`

当前规则：
1. 间隔映射：L0=1 天，L1=3 天，L2=7 天，L3=15 天
2. 答错后：重置到 L0，安排下一次复习
3. 复习答对：`level+1`（上限 L3）
4. 复习答错：`level-1`（下限 L0）
5. `L3` 可判定为自动掌握（`shouldAutoMaster`）

### 4.3.4 业务接线
1. 题目提交服务接线：`student-question.service.ts`
   - 普通练习答错：`upsertWrongBook(...)` 重置复习计划
   - 复习模式提交：`applyReviewResult(...)` 执行升降级
2. 今日到期接口：
   - `GET /student/review/today`
   - 控制器：`student-question.controller.ts`
   - 服务：`StudentQuestionService.getTodayReviewQueue(...)`
3. 复习抽题优先级：
   - `PracticeSessionService.selectReviewCandidates(...)`
   - 条件：`isMastered=false` 且 `nextReviewAt IS NULL OR <= now`
   - 排序：`nextReviewAt ASC NULLS FIRST` -> `lastWrongAt DESC`

### 4.3.5 说明
当前还未加 scheduler。也就是说，系统是“实时查询到期待复习题”，不是“提前生成每日任务表”。

---

## 5. 工程稳定性与 TS 报错修复（已完成）
你之前提供的一组 TypeScript 报错已处理，覆盖方向如下：

1. 清理未使用导入（`TS6133`、`TS6196`）。
2. 修复组件导出与命名错误（如 `ImageLoader` 默认导出）。
3. 修复类型不匹配与枚举映射错误（题型映射、`includes` 类型约束等）。
4. 修复重复导出冲突（service re-export ambiguity）。
5. 修复前端构建链路中的 JSX / TS 类型兼容问题。

验证结果：
1. 管理端构建通过：`question-managing` 执行 `npx tsc -b` 成功。

---

## 6. 验证与测试记录
## 6.1 后端编译
在 `question-backend` 执行：

```bash
npx tsc -p tsconfig.build.json --noEmit
```

结果：通过。

## 6.2 后端单测
> 注：当前环境 Jest 并行 worker 有 `EPERM` 风险，因此统一使用 `--runInBand`。

```bash
npx jest src/modules/student-question/review-plan.service.spec.ts --runInBand
npx jest src/modules/student-question/practice-session.service.spec.ts --runInBand
npx jest src/modules/student-question/manual-grading.service.spec.ts --runInBand
```

结果：全部通过。

## 6.3 前端编译
在 `question-managing` 执行：

```bash
npx tsc -b
```

结果：通过。

---

## 7. 学习路径建议（按阅读顺序）
如果你要快速掌握这套实现，建议按以下顺序：

1. 看协议面（Controller）  
   从 `practice-session.controller.ts`、`manual-grading-admin.controller.ts`、`student-question.controller.ts` 入手，先建立 API 全貌。
2. 看业务编排层（Service）  
   - 会话：`practice-session.service.ts`
   - 批改：`manual-grading.service.ts`
   - 学生题目主入口：`student-question.service.ts`
3. 看数据层（Entity + Migration）  
   先看实体，再看对应迁移，理解“代码模型”和“数据库结构”一致性。
4. 看前端落地  
   页面 -> hooks -> services 三层对应关系，先读 `index.tsx` 再读 hooks/services。
5. 跑编译和测试  
   对照第 6 节命令跑一次，确保你本地环境无偏差。

---

## 8. 关键设计决策与原因
1. 简答题 `isCorrect = null`  
   避免在自动判题阶段产生伪准确率，等人工批改后再回写最终结论。
2. 批改回写采用事务  
   防止“任务状态更新成功，但练习记录回写失败”导致数据分裂。
3. 会话指标支持回退  
   `totalDuration` 在记录缺失时用会话起止时间兜底，避免前端出现空值。
4. 复习题抽取按到期优先  
   符合 SRS 目标，先处理最该复习的题，而不是最近错题优先。

---

## 9. 当前遗留与下阶段建议
### 9.1 建议优先继续
1. REV-003：增加 Scheduler（每日任务预生成或提醒）。
2. REV-010：调度失败告警与重试机制。
3. 学生端“今日待复习”页面与复习会话入口（如果后续接入学生前端仓库）。

### 9.2 技术建议
1. 为复习计划补更多单测场景：
   - 跨时区边界
   - 连续多次答错/答对序列
2. 对关键写操作增加审计字段或日志（尤其重开批改、复习等级变化）。
3. 在 CI 固化 `tsc + jest --runInBand` 关键链路，避免本地通过但 CI 漏检。

---

## 10. 你可以如何使用这份文档
1. 作为“现状快照”：先确认已完成与未完成边界，避免重复开发。
2. 作为“代码导航”：按第 7 节路径看源码，能快速理解主链路。
3. 作为“后续开发入口”：直接从第 9 节任务继续推进并补 DoD。

