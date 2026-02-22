# 刷题系统增强功能详细设计（逐功能）

## 1. 文档目标

本文件按功能逐项给出可开发级详细设计，覆盖：

1. 业务流程与状态机。
2. 数据模型与关键字段。
3. 后端 API 契约。
4. 前端页面与交互规则。
5. 埋点与验收测试点。

适用范围：`question-backend`、`question-managing` 及学生端业务接口。

## 2. 统一设计约定

1. 鉴权：
   - 学生端：`@UserType('student')`
   - 管理端：`@UserType('admin')` + `@Roles`
2. 响应：
   - 列表接口统一分页结构 `{ data, total, page, pageSize }`
3. 错误码：
   - 400 参数错误
   - 401 未认证
   - 403 无权限
   - 404 资源不存在
   - 409 状态冲突
4. 时区：
   - 服务端统一 UTC 存储，展示层按用户时区转换。
5. 幂等：
   - 提交类接口支持 `idempotencyKey`（可选）防重。

---

## 3. P0-R01 练习会话与刷题模式

## 3.1 功能目标

将“单题提交”升级为“会话化练习”，支持随机练、分类练、知识点练、错题重练。

## 3.2 角色与权限

1. 学生：创建/进行/完成自己的会话。
2. 管理员：查询全局会话统计（只读）。

## 3.3 业务流程

1. 学生选择模式与参数（题量、难度、题型、分类/知识点）。
2. 系统抽题并创建 `practice_session` 与 `session_items`。
3. 学生逐题作答，系统写入 `practice_records`。
4. 完成或中断时，系统维护会话状态。
5. 会话结束生成摘要（正确率、耗时、薄弱知识点）。

## 3.4 状态机

会话状态：

1. `active`：进行中。
2. `completed`：完成。
3. `abandoned`：主动放弃或超时关闭。

题目项状态：

1. `pending`
2. `answered`
3. `skipped`

状态约束：

1. `completed/abandoned` 后不可继续提交。
2. `answered_count == total_count` 时自动 `completed`。

## 3.5 数据设计

新增：

1. `practice_sessions`
2. `practice_session_items`

扩展：

1. `practice_records.session_id`
2. `practice_records.session_item_id`
3. `practice_records.attempt_type = practice/review/exam`

## 3.6 API 设计

1. `POST /student/practice-sessions`
2. `GET /student/practice-sessions/:id`
3. `GET /student/practice-sessions/:id/current`
4. `POST /student/practice-sessions/:id/items/:itemId/submit`
5. `POST /student/practice-sessions/:id/complete`
6. `GET /student/practice-sessions?status=&mode=&page=`

关键请求字段：

1. `mode`
2. `questionCount`
3. `difficultyRange`
4. `questionTypes`
5. `categoryId` / `knowledgePointIds`

关键响应字段：

1. `summary.correctRate`
2. `summary.totalDuration`
3. `summary.weakKnowledgePoints`

## 3.7 前端设计

页面：

1. 会话创建弹窗。
2. 会话答题页（进度条、题目卡、提交按钮）。
3. 会话结果页。

交互规则：

1. 提交后自动跳下一题。
2. 网络失败时展示“重试提交”。
3. 页面刷新自动恢复当前会话。

## 3.8 埋点与指标

1. `session_create_success`
2. `session_item_submit`
3. `session_complete`
4. `session_abandon`

核心指标：

1. 会话完成率
2. 会话平均题数
3. 会话平均耗时

## 3.9 测试要点

1. 会话创建参数校验。
2. 提交与计数正确性。
3. 中断恢复。
4. 并发提交幂等防重。

---

## 4. P0-R02 简答题人工批改工作台

## 4.1 功能目标

为主观题提供批改闭环，确保学生获得可追溯反馈。

## 4.2 角色与权限

1. 学生：查看批改结果。
2. 批改员/管理员：查看、领取、提交批改任务。

## 4.3 业务流程

1. 学生提交简答题。
2. 系统创建 `manual_grading_task`（`pending`）。
3. 批改员领取任务（`assigned`）。
4. 批改员提交得分与评语（`done`）。
5. 系统回写练习记录并通知学生。

## 4.4 状态机

1. `pending`
2. `assigned`
3. `done`
4. `reopen`（申诉后重开）

规则：

1. `done` 后默认不可修改，除非 `reopen`。
2. 同一任务同一时刻只允许一个有效处理人。

## 4.5 数据设计

新增：

1. `manual_grading_tasks`

扩展：

1. `practice_records.score`
2. `practice_records.grading_feedback`
3. `practice_records.graded_by`
4. `practice_records.graded_at`

## 4.6 API 设计

1. `GET /grading/tasks?status=&assigneeId=`
2. `POST /grading/tasks/:id/claim`
3. `POST /grading/tasks/:id/submit`
4. `POST /grading/tasks/:id/reopen`
5. `GET /student/practice-records/:id`（返回批改详情）

提交批改请求字段：

1. `score`
2. `feedback`
3. `tags[]`
4. `pass`

## 4.7 前端设计

管理端页面：

1. 批改任务列表页。
2. 批改详情页（题目、学生答案、标准答案、评分输入区）。

学生端：

1. 记录详情页展示得分、评语、批改时间。

## 4.8 埋点与指标

1. `grading_task_claim`
2. `grading_task_submit`
3. `grading_task_reopen`

核心指标：

1. 待批改积压量
2. 批改中位时长
3. 重开比例

## 4.9 测试要点

1. 权限隔离（学生不可批改）。
2. 任务并发领取冲突。
3. 回写记录一致性。
4. 消息通知触发。

---

## 5. P0-R03 错题复习计划（SRS）

## 5.1 功能目标

将错题本从“静态收藏”升级为“到期复习驱动”。

## 5.2 角色与权限

1. 学生：查看今日待复习并完成复习。
2. 管理员：配置 SRS 规则参数（间隔天数、升级/降级策略）。

## 5.3 业务流程

1. 答错题目后更新 `wrong_book`。
2. 计算 `review_level` 与 `next_review_at`。
3. 定时任务生成今日待复习集合。
4. 学生发起“今日复习”会话。
5. 提交后更新复习级别和下次复习时间。

## 5.4 状态与算法

推荐间隔：

1. L0 -> 1天
2. L1 -> 3天
3. L2 -> 7天
4. L3 -> 15天

规则：

1. 复习答对：`level + 1`（上限3）。
2. 复习答错：降为 `max(level-1, 0)` 或重置 0（可配置）。

## 5.5 数据设计

扩展 `wrong_book`：

1. `review_level`
2. `next_review_at`
3. `last_review_result`

新增（可选）：

1. `review_schedule_logs`（用于审计和重算）

## 5.6 API 设计

1. `GET /student/review/today`
2. `POST /student/review/start`
3. `POST /student/review/items/:itemId/submit`
4. `GET /student/review/history`

## 5.7 前端设计

1. 首页“今日待复习”卡片。
2. 今日复习页（按队列逐题）。
3. 复习结果页（完成率与下次提醒）。

## 5.8 埋点与指标

1. `review_today_view`
2. `review_start`
3. `review_item_submit`
4. `review_complete`

核心指标：

1. 到期复习完成率
2. 错题二次正确率
3. 平均复习延迟天数

## 5.9 测试要点

1. 跨天边界（UTC/本地时区）。
2. 级别升降算法正确性。
3. 到期任务生成幂等性。

---

## 6. P0-R04 模拟考试与成绩报告

## 6.1 功能目标

提供完整考试流程：组卷、限时考试、自动交卷、成绩报告。

## 6.2 角色与权限

1. 管理员：试卷管理、发布与下架。
2. 学生：开始考试、提交、查看报告。

## 6.3 业务流程

1. 管理员创建试卷并配置题目分值。
2. 学生开始考试，系统记录开始时间。
3. 学生提交题目，超时自动交卷。
4. 客观题自动判分，主观题进批改池。
5. 生成考试报告，批改完成后更新最终成绩。

## 6.4 状态机

试卷：

1. `draft`
2. `published`
3. `archived`

考试记录：

1. `ongoing`
2. `submitted`
3. `grading`
4. `completed`

## 6.5 数据设计

新增：

1. `exam_papers`
2. `exam_paper_items`
3. `exam_attempts`
4. `exam_attempt_items`

## 6.6 API 设计

管理端：

1. `POST /exam/papers`
2. `PATCH /exam/papers/:id`
3. `POST /exam/papers/:id/publish`
4. `GET /exam/papers`

学生端：

1. `POST /student/exams/:paperId/start`
2. `POST /student/exams/:attemptId/items/:itemId/submit`
3. `POST /student/exams/:attemptId/finish`
4. `GET /student/exams/:attemptId/report`

## 6.7 前端设计

管理端：

1. 试卷管理页。
2. 组卷编辑页（题目列表+分值设置）。

学生端：

1. 考试页（倒计时、题号导航）。
2. 考试报告页（总分、分项分、错题分布）。

## 6.8 埋点与指标

1. `exam_start`
2. `exam_item_submit`
3. `exam_auto_finish`
4. `exam_finish`
5. `exam_report_view`

核心指标：

1. 开考率
2. 完卷率
3. 自动交卷率

## 6.9 测试要点

1. 超时自动交卷准确性。
2. 判分一致性（客观/主观）。
3. 提交失败重试与防重复计分。

---

## 7. P1-R01 学习目标与连续打卡

## 7.1 功能目标

通过目标机制提高日活与学习连续性。

## 7.2 业务流程

1. 学生设置每日目标（题量或时长）。
2. 系统按日累计完成进度。
3. 达成后自动打卡并更新连续天数。

## 7.3 数据设计

新增：

1. `learning_goals`
2. `student_daily_progress`

## 7.4 API 设计

1. `GET /student/goals`
2. `PUT /student/goals`
3. `GET /student/goals/progress?date=`
4. `GET /student/goals/streak`

## 7.5 前端设计

1. 目标设置页。
2. 个人中心打卡卡片。
3. 统计页连续天数展示。

## 7.6 测试要点

1. 目标次日生效规则。
2. 跨天连续计算准确性。
3. 中断后重启逻辑。

---

## 8. P1-R02 知识点掌握度看板

## 8.1 功能目标

把学生表现转为知识点维度的可解释画像。

## 8.2 业务流程

1. 汇总练习和考试记录。
2. 按知识点计算掌握度分值。
3. 生成快照并提供看板查询。

## 8.3 数据设计

新增：

1. `student_mastery_snapshots`

## 8.4 API 设计

1. `GET /student/mastery?range=7d|30d|all`
2. `GET /student/mastery/high-risk`

## 8.5 前端设计

1. 掌握度雷达/柱状图。
2. 高风险知识点列表。

## 8.6 测试要点

1. 计算口径一致性。
2. 快照定时任务正确性。

---

## 9. P1-R03 弱项推荐练习

## 9.1 功能目标

基于掌握度自动推荐最有价值的练习包。

## 9.2 业务流程

1. 读取高风险知识点。
2. 生成推荐练习包（题量与难度可配）。
3. 学生一键创建推荐会话。

## 9.3 数据设计

新增（可选）：

1. `recommendation_logs`

## 9.4 API 设计

1. `GET /student/recommendations`
2. `POST /student/recommendations/:id/start-session`

## 9.5 前端设计

1. 首页推荐卡片。
2. 推荐理由展示（如“近7天该知识点正确率42%”）。

## 9.6 测试要点

1. 推荐可解释性字段完整。
2. 推荐点击和转化埋点正确。

---

## 10. P1-R04 学习记录增强检索

## 10.1 功能目标

支持学生和管理端快速定位历史学习行为。

## 10.2 业务流程

1. 记录查询支持多维筛选。
2. 支持 CSV 导出当前筛选结果。

## 10.3 数据设计

主要依赖 `practice_records` 与会话关联字段索引优化。

## 10.4 API 设计

1. `GET /student/practice-records?sessionId=&type=&knowledgePointId=&from=&to=`
2. `GET /student/practice-records/export?...`

## 10.5 前端设计

1. 多维筛选控件。
2. 导出按钮与任务状态提示。

## 10.6 测试要点

1. 组合筛选正确性。
2. 导出字段与页面一致。
3. 大数据量查询性能。

---

## 11. P2-R01 排行榜与班级对比

## 11.1 功能目标

通过可配置排名规则增强学习激励。

## 11.2 业务流程

1. 定时任务汇总积分。
2. 生成日/周/月榜。
3. 学生查看班级榜和全局榜。

## 11.3 数据设计

新增：

1. `leaderboard_scores`

## 11.4 API 设计

1. `GET /student/leaderboard?scope=class|global&period=daily|weekly|monthly`
2. `GET /admin/leaderboard/config`
3. `PUT /admin/leaderboard/config`

## 11.5 前端设计

1. 榜单页（切换维度）。
2. 我的排名卡片。

## 11.6 测试要点

1. 同分排序规则。
2. 榜单重算一致性。

---

## 12. P2-R02 消息提醒中心

## 12.1 功能目标

提升回访率和任务完成率（复习、批改、考试等）。

## 12.2 业务流程

1. 业务事件触发消息写入。
2. 学生端统一消息中心查看。
3. 点击消息跳转目标页面。

## 12.3 数据设计

新增：

1. `notification_messages`

字段建议：

1. `type`
2. `title`
3. `content`
4. `target_path`
5. `status(read/unread)`
6. `sent_at`

## 12.4 API 设计

1. `GET /student/notifications`
2. `POST /student/notifications/:id/read`
3. `POST /student/notifications/read-all`

## 12.5 前端设计

1. 消息中心页。
2. 顶部未读角标。

## 12.6 测试要点

1. 消息去重策略。
2. 已读状态一致性。

---

## 13. P2-R03 学习周报

## 13.1 功能目标

提供个人与班级维度的周期复盘。

## 13.2 业务流程

1. 每周定时聚合指标。
2. 生成周报快照。
3. 提供在线查看与导出。

## 13.3 数据设计

新增：

1. `weekly_reports`

## 13.4 API 设计

1. `GET /student/reports/weekly?week=`
2. `GET /admin/reports/class-weekly?classId=&week=`
3. `GET /student/reports/weekly/:id/export`

## 13.5 前端设计

1. 周报页面（趋势图+结论块）。
2. 下载按钮（PDF/图片）。

## 13.6 测试要点

1. 周报生成任务稳定性。
2. 导出内容完整性。

---

## 14. P3-R01 AI错题讲解与追问

## 14.1 功能目标

提供结构化错题讲解和上下文追问，提高理解深度。

## 14.2 业务流程

1. 学生在错题详情点击“AI讲解”。
2. 服务端构建上下文（题目、答案、学生错因）。
3. 模型返回讲解并存储审计记录。
4. 学生可追问，形成会话上下文链。

## 14.3 数据设计

新增：

1. `ai_explanations`
2. `ai_chat_messages`
3. `ai_audit_logs`

## 14.4 API 设计

1. `POST /student/ai/explanations`
2. `POST /student/ai/explanations/:id/follow-up`
3. `POST /student/ai/explanations/:id/feedback`

## 14.5 前端设计

1. AI讲解卡片（步骤化展示）。
2. 追问输入框与对话区。
3. 有帮助/无帮助反馈按钮。

## 14.6 测试要点

1. 敏感词与违规输出拦截。
2. 超时降级提示。
3. 审计日志完整性。

---

## 15. P3-R02 自适应策略引擎

## 15.1 功能目标

根据学生实时表现动态调整题目难度与知识点分布。

## 15.2 业务流程

1. 收集学生近期表现数据。
2. 策略引擎输出下一批抽题参数。
3. 生成推荐会话并记录策略版本。
4. 通过 A/B 实验比较效果。

## 15.3 数据设计

新增：

1. `adaptive_strategy_versions`
2. `adaptive_assignments`
3. `ab_experiment_results`

## 15.4 API 设计

1. `GET /student/adaptive/next-plan`
2. `POST /admin/adaptive/strategies`
3. `POST /admin/adaptive/experiments`
4. `GET /admin/adaptive/experiments/:id/results`

## 15.5 前端设计

1. 学生侧“个性化训练”入口。
2. 管理侧策略版本管理页。
3. 实验结果对比看板。

## 15.6 测试要点

1. 策略回滚正确性。
2. 实验分流稳定性。
3. 指标口径一致性。

---

## 16. 开发映射关系

各功能与任务清单映射：

1. P0-R01 -> `SES-*`
2. P0-R02 -> `GRD-*`
3. P0-R03 -> `REV-*`
4. P0-R04 -> `EXM-*`
5. P1 -> `P1-*`
6. P2 -> `P2-*`
7. P3 -> `P3-*`

## 17. 本轮落地建议

1. 先实现第 3-6 节（全部 P0）。
2. 每完成一个功能立即补齐该功能的 API 文档与测试用例。
3. 每个功能上线前执行独立灰度验证与回滚演练。

