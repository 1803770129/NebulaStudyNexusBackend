# 刷题系统增强任务清单（执行版）

## 1. 使用说明

本清单用于研发执行，字段含义：

1. `ID`：唯一任务编号。
2. `Level`：需求等级（P0/P1/P2/P3）。
3. `Owner`：建议责任角色（BE/FE/QA/OPS/PM）。
4. `Depends`：前置依赖任务ID。
5. `DoD`：完成定义（Definition of Done）。
6. `Status`：`TODO/DOING/DONE/BLOCKED`。

## 2. 迭代总览

| 迭代 | 周期 | 目标 |
|---|---|---|
| Sprint-0 | 第1周 | 基础设施与埋点准备 |
| Sprint-1 | 第2-3周 | P0-会话练习 |
| Sprint-2 | 第4周 | P0-人工批改 |
| Sprint-3 | 第5周 | P0-复习计划 |
| Sprint-4 | 第6周 | P0-模拟考试 |
| Sprint-5 | 第7-8周 | P1-留存增强 |
| Sprint-6 | 第9-11周 | P2-运营增强 |
| Sprint-7 | 第12周+ | P3-创新探索 |

## 3. Sprint-0（基础准备）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| BASE-001 | P0 | PM | 确认P0范围冻结与验收口径 | - | 冻结文档已签字 | TODO |
| BASE-002 | P0 | BE | 设计功能开关表与读取机制 | - | 支持按功能开关 | TODO |
| BASE-003 | P0 | BE | 接入统一埋点事件模型 | BASE-001 | 关键事件定义完成 | TODO |
| BASE-004 | P0 | FE | 前端埋点SDK封装与事件上报 | BASE-003 | 页面可上报事件 | TODO |
| BASE-005 | P0 | OPS | 新增监控面板（接口+业务） | BASE-003 | 面板可观测 | TODO |
| BASE-006 | P0 | QA | 制定P0端到端测试框架 | BASE-001 | 核心E2E脚本可运行 | TODO |
| BASE-007 | P0 | BE | 建立数据库迁移基线脚本 | - | 新迁移可执行可回滚 | TODO |
| BASE-008 | P0 | OPS | 灰度发布流水线配置 | BASE-002 | 支持1%/5%/20%灰度 | TODO |
| BASE-009 | P0 | PM | 上线前Go/No-Go检查表固化 | BASE-001 | 检查表可执行 | TODO |
| BASE-010 | P0 | QA | 质量门禁规则接入CI | BASE-006 | PR可触发门禁 | TODO |

## 4. Sprint-1/2（P0-R01 会话练习）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| SES-001 | P0 | BE | 新增 `practice_sessions` 实体与迁移 | BASE-007 | 表结构与索引可用 | TODO |
| SES-002 | P0 | BE | 新增 `practice_session_items` 实体与迁移 | SES-001 | 表结构与约束通过 | TODO |
| SES-003 | P0 | BE | 扩展 `practice_records` 字段（session关联） | SES-001 | 兼容历史数据 | TODO |
| SES-004 | P0 | BE | 实现会话创建策略服务（随机/分类/知识点/错题） | SES-001,SES-002 | 会话创建接口可用 | TODO |
| SES-005 | P0 | BE | 实现会话答题提交与状态推进 | SES-003,SES-004 | 提交后状态正确更新 | TODO |
| SES-006 | P0 | BE | 实现会话恢复与完成摘要接口 | SES-005 | 中断后可恢复 | TODO |
| SES-007 | P0 | FE | 新增“开始练习会话”入口与配置弹窗 | SES-004 | 可创建会话 | TODO |
| SES-008 | P0 | FE | 新增会话答题页（当前题、进度、下一题） | SES-005 | 连续作答无阻断 | TODO |
| SES-009 | P0 | FE | 新增会话结果页（正确率、耗时、薄弱点） | SES-006 | 摘要展示完整 | TODO |
| SES-010 | P0 | QA | 会话链路E2E与中断恢复测试 | SES-007,SES-008,SES-009 | 用例通过率100% | TODO |
| SES-011 | P0 | BE | 会话核心逻辑单元测试 | SES-005 | 覆盖率>=80% | TODO |
| SES-012 | P0 | FE | 会话页关键埋点接入 | BASE-004,SES-008 | 埋点数据可见 | TODO |

## 5. Sprint-2（P0-R02 人工批改）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| GRD-001 | P0 | BE | 新增 `manual_grading_tasks` 表与迁移 | BASE-007 | 表结构生效 | TODO |
| GRD-002 | P0 | BE | 简答题提交自动创建批改任务 | GRD-001 | 任务自动入池 | TODO |
| GRD-003 | P0 | BE | 批改任务列表/领取/提交接口 | GRD-001 | API通过联调 | TODO |
| GRD-004 | P0 | BE | 回写 `practice_records` 评分与评语 | GRD-003 | 数据一致 | TODO |
| GRD-005 | P0 | FE | 管理端批改列表页 | GRD-003 | 支持筛选分页 | TODO |
| GRD-006 | P0 | FE | 管理端批改详情页与提交动作 | GRD-003 | 可完成批改 | TODO |
| GRD-007 | P0 | FE | 学生端记录详情显示批改结果 | GRD-004 | 学生可见评语得分 | TODO |
| GRD-008 | P0 | QA | 批改链路测试与权限测试 | GRD-005,GRD-006,GRD-007 | 流程和权限均通过 | TODO |
| GRD-009 | P0 | OPS | 批改积压告警配置 | GRD-001 | 告警可触发 | TODO |

## 6. Sprint-3（P0-R03 错题复习计划）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| REV-001 | P0 | BE | 扩展 `wrong_book` 字段（review_level/next_review_at） | BASE-007 | 迁移成功 | TODO |
| REV-002 | P0 | BE | 实现复习间隔算法服务 | REV-001 | 单测覆盖主要分支 | TODO |
| REV-003 | P0 | BE | 实现每日到期复习任务生成器（Scheduler） | REV-002 | 每日可生成清单 | TODO |
| REV-004 | P0 | BE | 实现“今日复习”接口 | REV-003 | 可拉取到期题目 | TODO |
| REV-005 | P0 | BE | 复习提交结果回写（升级/降级） | REV-004 | 状态更新正确 | TODO |
| REV-006 | P0 | FE | 首页新增“今日待复习”卡片 | REV-004 | 数量显示正确 | TODO |
| REV-007 | P0 | FE | 新增“今日复习会话”入口与流程 | REV-004,REV-005 | 可完整复习 | TODO |
| REV-008 | P0 | FE | 复习完成页（完成率与结果） | REV-007 | 数据展示正确 | TODO |
| REV-009 | P0 | QA | 复习调度回归测试（跨天场景） | REV-003,REV-007 | 跨天逻辑通过 | TODO |
| REV-010 | P0 | OPS | 调度失败重试与告警 | REV-003 | 告警+重试可用 | TODO |

## 7. Sprint-4（P0-R04 模拟考试）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| EXM-001 | P0 | BE | 新增 `exam_papers`、`exam_paper_items` 表与迁移 | BASE-007 | 表结构可用 | TODO |
| EXM-002 | P0 | BE | 新增 `exam_attempts`、`exam_attempt_items` 表与迁移 | EXM-001 | 表结构可用 | TODO |
| EXM-003 | P0 | BE | 管理端试卷CRUD接口（手动组卷） | EXM-001 | 接口联调通过 | TODO |
| EXM-004 | P0 | BE | 学生端开始考试/提交单题/交卷接口 | EXM-002 | 主链路可用 | TODO |
| EXM-005 | P0 | BE | 考试超时自动交卷任务 | EXM-004 | 超时自动完成 | TODO |
| EXM-006 | P0 | BE | 成绩报告生成服务（客观题+主观题占位） | EXM-004 | 报告可返回 | TODO |
| EXM-007 | P0 | FE | 管理端试卷管理页 | EXM-003 | 可创建和发布 | TODO |
| EXM-008 | P0 | FE | 学生端考试页与计时器 | EXM-004 | 倒计时准确 | TODO |
| EXM-009 | P0 | FE | 学生端考试报告页 | EXM-006 | 分析项完整 | TODO |
| EXM-010 | P0 | QA | 考试链路压力与稳定性测试 | EXM-008,EXM-009 | 核心场景通过 | TODO |
| EXM-011 | P0 | OPS | 考试峰值监控与扩容预案 | EXM-010 | 预案文档完成 | TODO |

## 8. Sprint-5（P1 增强）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| P1-001 | P1 | BE | 新增 `learning_goals` 与 `student_daily_progress` | BASE-007 | 表与接口可用 | TODO |
| P1-002 | P1 | FE | 目标设置页与打卡展示 | P1-001 | 可设置可展示 | TODO |
| P1-003 | P1 | BE | 掌握度计算任务与快照表 | BASE-007 | 快照按日生成 | TODO |
| P1-004 | P1 | FE | 掌握度看板页面（7/30天） | P1-003 | 看板可视化完成 | TODO |
| P1-005 | P1 | BE | 弱项推荐接口（规则引擎版） | P1-003 | 推荐结果可解释 | TODO |
| P1-006 | P1 | FE | 推荐练习入口与一键开练 | P1-005 | 路径打通 | TODO |
| P1-007 | P1 | BE | 记录检索增强（会话/知识点/时间） | SES-006 | 查询性能达标 | TODO |
| P1-008 | P1 | FE | 记录筛选UI升级与导出入口 | P1-007 | 可检索可导出 | TODO |
| P1-009 | P1 | QA | P1功能回归测试 | P1-002,P1-004,P1-006,P1-008 | 测试通过 | TODO |
| P1-010 | P1 | PM | P1功能效果复盘与迭代建议 | P1-009 | 输出复盘报告 | TODO |

## 9. Sprint-6（P2 运营增强）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| P2-001 | P2 | BE | 榜单积分计算任务与 `leaderboard_scores` 表 | BASE-007 | 日周月榜可出数 | TODO |
| P2-002 | P2 | FE | 排行榜页面（班级/全局切换） | P2-001 | 可查看可筛选 | TODO |
| P2-003 | P2 | BE | 消息中心表与消息投递服务 | BASE-007 | 消息可写可读 | TODO |
| P2-004 | P2 | FE | 消息中心页面与已读状态 | P2-003 | 已读未读可操作 | TODO |
| P2-005 | P2 | BE | 周报生成任务（个人/班级） | P2-001,P2-003 | 周报可生成 | TODO |
| P2-006 | P2 | FE | 周报查看与下载入口 | P2-005 | 可查看可下载 | TODO |
| P2-007 | P2 | OPS | 排行榜与周报任务告警 | P2-001,P2-005 | 告警可触发 | TODO |
| P2-008 | P2 | QA | P2功能与权限回归测试 | P2-002,P2-004,P2-006 | 用例通过 | TODO |
| P2-009 | P2 | PM | 运营活动配置（榜单挑战） | P2-002 | 活动规则上线 | TODO |
| P2-010 | P2 | OPS | 站外通知通道预研（微信订阅） | P2-003 | 技术评估完成 | TODO |

## 10. Sprint-7（P3 创新探索）

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| P3-001 | P3 | BE | AI讲解服务接口封装（可替换provider） | P0基础稳定 | API可调用 | TODO |
| P3-002 | P3 | FE | 错题详情“AI讲解”入口 | P3-001 | 入口可灰度 | TODO |
| P3-003 | P3 | BE | AI输出审计日志与反馈收集 | P3-001 | 审计可追溯 | TODO |
| P3-004 | P3 | PM | AI输出质量评估标准制定 | P3-003 | 评估表可执行 | TODO |
| P3-005 | P3 | BE | 自适应策略引擎V1（规则+权重） | P1-003 | 策略可配置 | TODO |
| P3-006 | P3 | FE | 推荐策略实验开关与实验看板 | P3-005 | 可切换策略 | TODO |
| P3-007 | P3 | QA | P3灰度测试与风险评估 | P3-002,P3-006 | 风险报告完成 | TODO |
| P3-008 | P3 | OPS | 成本与性能监控（AI调用） | P3-001 | 成本面板可见 | TODO |

## 11. 全阶段通用任务

| ID | Level | Owner | Task | Depends | DoD | Status |
|---|---|---|---|---|---|---|
| GEN-001 | P0 | BE | 每个新模块补齐 Swagger 文档 | 各模块开发 | 文档可用 | TODO |
| GEN-002 | P0 | BE | 每个新模块补齐单元测试 | 各模块开发 | 覆盖率达标 | TODO |
| GEN-003 | P0 | FE | 页面级错误兜底与空态统一 | 各页面开发 | 空态/异常一致 | TODO |
| GEN-004 | P0 | QA | 核心链路自动化回归持续维护 | 全程 | 每周回归通过 | TODO |
| GEN-005 | P0 | OPS | 发布/回滚演练每里程碑至少1次 | 每里程碑前 | 演练记录完成 | TODO |
| GEN-006 | P1 | PM | 双周需求复盘与优先级调整 | 每双周 | 变更记录同步 | TODO |

## 12. 本轮开发启动建议（执行顺序）

建议按以下顺序启动，减少返工：

1. 先做 `BASE-*` 与 `SES-*`，打通会话主链路。
2. 再做 `GRD-*`，补齐主观题反馈。
3. 再做 `REV-*`，形成复习闭环。
4. 最后做 `EXM-*`，补齐测评场景。
5. P1/P2/P3 在 P0 数据稳定后逐步推进。

## 13. 完成定义（DoD）统一标准

每个任务完成必须满足：

1. 代码实现完成并通过静态检查。
2. 单元测试或集成测试通过。
3. 关键路径文档同步更新。
4. 埋点和日志字段按规范接入。
5. 通过代码评审并可在灰度环境验证。

