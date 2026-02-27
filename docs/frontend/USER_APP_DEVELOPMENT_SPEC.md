# 学生端 App 开发文档（功能与接口对照）

> 更新时间：2026-02-24  
> 适用范围：学生端 App（iOS / Android / H5 / 小程序）  
> 后端基准：`question-backend/src/modules/**` 当前控制器与 DTO 实现  
> API 全局前缀：`/api`

## 1. 文档目标

这份文档用于明确两件事：

1. App 端需要开发哪些功能。
2. 每个功能对应哪些后端接口、关键参数和联调注意点。

## 2. 接入总规则

### 2.1 基础地址

- Base URL：`http://<host>:<port>/api`

### 2.2 鉴权规则

- 除公开接口外，所有接口都需要：
  - `Authorization: Bearer <accessToken>`
- 公开接口只有 4 个：
  - `POST /student-auth/wx-login`
  - `POST /student-auth/register`
  - `POST /student-auth/login`
  - `POST /student-auth/refresh`

### 2.3 成功/失败响应格式

成功响应由全局拦截器包装：

```json
{
  "statusCode": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

失败响应由全局异常过滤器返回：

```json
{
  "statusCode": 400,
  "message": "请求参数验证失败",
  "error": "Bad Request",
  "details": {},
  "timestamp": "2026-02-24T10:00:00.000Z",
  "path": "/api/student/questions"
}
```

### 2.4 参数校验规则

- 全局 `ValidationPipe` 开启：
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- 分页统一：
  - 多数接口：`page` + `pageSize`
  - 知识点列表：`page` + `limit`
- 数组 query 建议：
  - `?tagIds=id1&tagIds=id2`
  - `?knowledgePointIds=id1&knowledgePointIds=id2`

### 2.5 Token 刷新建议

- `accessToken` 失效（401）后：
  1. 调用 `POST /student-auth/refresh`
  2. 成功后重放原请求
  3. 刷新失败则清空登录态并跳转登录页

### 2.6 路由隔离约束（重要）

- 学生端只调用以下前缀：
  - `/student-auth/*`
  - `/student/*`
- 管理端接口已隔离，不要在 App 中使用 `/users`、`/questions`、`/categories`、`/upload` 等管理路由。

## 3. App 功能总览（MVP）

| 功能模块 | 开发状态 | 主要接口前缀 |
|---|---|---|
| 账号体系（登录/注册/我的） | 已实现 | `/student-auth` |
| 首页学习概览 | 已实现 | `/student/statistics`, `/student/review/today` |
| 题库浏览与单题作答 | 已实现 | `/student/questions` |
| 会话练习（随机/分类/知识点/复习） | 已实现 | `/student/practice-sessions` |
| 错题本与复习历史 | 已实现 | `/student/wrong-book`, `/student/review/*` |
| 做题记录与批改结果查看 | 已实现 | `/student/practice-records` |
| 模拟考试 | 已实现 | `/student/exams/*` |
| 字典数据（分类/标签/知识点） | 已实现 | `/student/categories`, `/student/tags`, `/student/knowledge-points` |
| 图片上传 | 已实现 | `/student/upload/image` |

## 4. 功能与接口对照

### 4.1 账号体系（登录、注册、资料、绑定）

| 接口 | 认证 | 主要入参 | 主要返回 |
|---|---|---|---|
| `POST /api/student-auth/register` | 否 | `phone`, `password`, `nickname?` | `accessToken`, `refreshToken`, `student` |
| `POST /api/student-auth/login` | 否 | `phone`, `password` | `accessToken`, `refreshToken`, `student` |
| `POST /api/student-auth/wx-login` | 否 | `code`, `nickname?`, `avatar?` | `accessToken`, `refreshToken`, `student`, `isNewUser?` |
| `POST /api/student-auth/refresh` | 否 | `refreshToken` | 新 `accessToken` + `refreshToken` |
| `GET /api/student-auth/profile` | 学生 token | 无 | 学生资料 |
| `PATCH /api/student-auth/profile` | 学生 token | `nickname?`, `avatar?` | 更新后资料 |
| `PATCH /api/student-auth/password` | 学生 token | `oldPassword`, `newPassword` | `message` |
| `PATCH /api/student-auth/bind-phone` | 学生 token | `phone`, `password` | 更新后资料 |
| `PATCH /api/student-auth/bind-wechat` | 学生 token | `code` | 更新后资料 |

参数约束：

- 手机号：`/^1[3-9]\d{9}$/`
- 密码长度：不少于 6 位

### 4.2 首页（学习概览）

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/statistics` | 学生 token | 首页统计卡片与近 7 天趋势 |
| `GET /api/student/review/today` | 学生 token | 今日待复习数量和列表 |

`/student/statistics` 重点字段：

- `totalPracticed`
- `totalCorrect`
- `correctRate`
- `totalFavorites`
- `totalWrong`
- `todayPracticed`
- `todayCorrect`
- `weeklyTrend[]`

### 4.3 题库浏览与单题作答

#### 4.3.1 接口清单

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/questions` | 学生 token | 题目分页列表（脱敏） |
| `GET /api/student/questions/:id` | 学生 token | 单题详情（脱敏） |
| `POST /api/student/questions/:id/submit` | 学生 token | 提交单题答案 |
| `POST /api/student/questions/:id/favorite` | 学生 token | 收藏/取消收藏（toggle） |
| `GET /api/student/favorites` | 学生 token | 收藏列表 |

#### 4.3.2 列表筛选参数

- `page`, `pageSize`
- `keyword`
- `categoryId`
- `type`: `single_choice` / `multiple_choice` / `true_false` / `fill_blank` / `short_answer`
- `difficulty`: `easy` / `medium` / `hard`
- `tagIds[]`
- `knowledgePointIds[]`

#### 4.3.3 提交答案格式

| 题型 | `answer` 类型 | 示例 |
|---|---|---|
| 单选 | `string` | `"A"` |
| 多选 | `string[]` | `["A","C"]` |
| 判断 | `boolean` | `true` |
| 填空 | `string[]` | `["北京"]` |
| 简答 | `string` | `"我的解题过程..."` |

可选字段：

- `duration`（秒，整数，>=0）

#### 4.3.4 提交返回重点

- `isCorrect`（简答题可能为 `null`）
- `correctAnswer`
- `explanation`
- `options`（含 `isCorrect`）
- `practiceRecordId`
- `manualGradingTaskId`（简答题可能存在）
- `isManualGradingPending`

### 4.4 会话练习（随机/分类/知识点/复习）

#### 4.4.1 接口清单

| 接口 | 认证 | 用途 |
|---|---|---|
| `POST /api/student/practice-sessions` | 学生 token | 创建会话 |
| `GET /api/student/practice-sessions` | 学生 token | 会话列表 |
| `GET /api/student/practice-sessions/:id` | 学生 token | 会话详情 |
| `GET /api/student/practice-sessions/:id/current` | 学生 token | 获取当前待答题 |
| `POST /api/student/practice-sessions/:id/items/:itemId/submit` | 学生 token | 提交会话题目 |
| `POST /api/student/practice-sessions/:id/complete` | 学生 token | 主动结束会话 |

#### 4.4.2 创建会话参数

- `mode`（必填）：`random` / `category` / `knowledge` / `review`
- `questionCount`（可选，默认 10，范围 1-100）
- `categoryId`（`mode=category` 时必填）
- `knowledgePointIds[]`（`mode=knowledge` 时必填）
- `type?`
- `difficulty?`
- `tagIds[]?`

#### 4.4.3 会话提交流程返回重点

- `session`
- `isCompleted`
- `nextItemId`
- `result`（结构同单题提交）

### 4.5 错题本与复习闭环

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/wrong-book` | 学生 token | 错题本列表 |
| `PATCH /api/student/wrong-book/:id/master` | 学生 token | 掌握状态 toggle |
| `DELETE /api/student/wrong-book/:id` | 学生 token | 移除错题 |
| `GET /api/student/review/today` | 学生 token | 今日到期复习队列 |
| `POST /api/student/review/start` | 学生 token | 创建复习会话 |
| `POST /api/student/review/items/:itemId/submit` | 学生 token | 提交复习题 |
| `GET /api/student/review/history` | 学生 token | 复习历史 |

关键筛选参数：

- `GET /wrong-book`: `isMastered?`
- `GET /review/today`: `includeMastered?`（默认 `false`）
- `GET /review/history`: `questionId?`, `from?`, `to?`

### 4.6 做题记录与批改结果

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/practice-records` | 学生 token | 做题记录分页 |
| `GET /api/student/practice-records/:id` | 学生 token | 记录详情（含批改结果） |

列表筛选参数：

- `isCorrect?`
- `questionId?`
- `page`, `pageSize`

详情建议关注字段：

- `isCorrect`
- `score`
- `gradingFeedback`
- `gradingTags`
- `isPassed`
- `gradedAt`

### 4.7 模拟考试

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/exams/papers` | 学生 token | 已发布试卷列表 |
| `GET /api/student/exams/attempts` | 学生 token | 我的考试记录 |
| `POST /api/student/exams/:paperId/start` | 学生 token | 开始考试 |
| `GET /api/student/exams/:attemptId/current` | 学生 token | 恢复当前进度 |
| `POST /api/student/exams/:attemptId/items/:itemId/submit` | 学生 token | 提交单题 |
| `POST /api/student/exams/:attemptId/finish` | 学生 token | 交卷并返回报告 |
| `GET /api/student/exams/:attemptId/report` | 学生 token | 再次查看报告 |

常用筛选参数：

- `GET /exams/papers`: `page`, `pageSize`, `keyword?`
- `GET /exams/attempts`: `page`, `pageSize`, `status?`, `paperId?`, `keyword?`

### 4.8 字典数据与上传

#### 4.8.1 分类/标签/知识点字典

| 接口 | 认证 | 用途 |
|---|---|---|
| `GET /api/student/categories` | 学生 token | 分类扁平列表 |
| `GET /api/student/categories/tree` | 学生 token | 分类树 |
| `GET /api/student/categories/:id` | 学生 token | 分类详情 |
| `GET /api/student/tags` | 学生 token | 标签列表 |
| `GET /api/student/tags/:id` | 学生 token | 标签详情 |
| `GET /api/student/knowledge-points` | 学生 token | 知识点分页列表 |
| `GET /api/student/knowledge-points/tree` | 学生 token | 知识点树 |
| `GET /api/student/knowledge-points/:id` | 学生 token | 知识点详情 |

知识点分页参数：

- `page`
- `limit`
- `search?`
- `categoryId?`
- `tagId?`
- `parentId?`

#### 4.8.2 图片上传

| 接口 | 认证 | 用途 | 入参 |
|---|---|---|---|
| `POST /api/student/upload/image` | 学生 token | 图片上传 | `multipart/form-data`，字段名 `file` |

文件限制：

- 类型：`image/jpeg` / `image/png` / `image/gif` / `image/webp`
- 大小：最大 5MB

## 5. App 端推荐开发顺序

### Phase 1（先打通主链路）

1. 登录/注册/刷新 token
2. 题库列表 + 题目详情 + 提交
3. 收藏功能
4. 我的页面（资料修改、改密）

### Phase 2（学习闭环）

1. 会话练习全链路
2. 错题本 + 今日复习 + 复习历史
3. 首页统计看板
4. 做题记录与待批改状态展示

### Phase 3（考试链路）

1. 试卷列表
2. 开始考试/继续考试/提交单题/交卷
3. 报告页

## 6. 当前未实现的预留能力

以下能力在当前后端代码中未落地接口，请勿纳入本轮 App 开发范围：

- `/api/student/goals`
- `/api/student/mastery`
- `/api/student/recommendations`
- 消息中心、排行榜、周报、AI 讲解等扩展模块

## 7. 联调验收清单（最小标准）

1. 未登录启动进入登录页；已登录启动自动恢复会话。
2. 题库筛选、作答、结果展示可用。
3. 会话练习可完整跑通并结束。
4. 错题本/今日复习/复习提交可跑通。
5. 简答题可展示“待批改”，批改后记录详情可见结果。
6. 考试流程可跑通（开始 -> 提交 -> 交卷 -> 报告）。
7. token 过期可刷新，刷新失败可安全登出。

