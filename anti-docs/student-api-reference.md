# 星云刷题 — 学生端 API 接口文档

> 版本: v1.0 | 更新日期: 2026-02-16  
> Base URL: `https://<your-domain>/api`  
> 认证方式: Bearer JWT（除标注 🔓公开 的接口外，均需在 Header 携带 `Authorization: Bearer <token>`）

---

## 一、认证模块 `/student-auth`

### 1.1 微信一键登录 🔓公开

```
POST /student-auth/wx-login
```

| 字段       | 类型   | 必填 | 说明                         |
| ---------- | ------ | ---- | ---------------------------- |
| `code`     | string | ✅   | `wx.login()` 返回的临时 code |
| `nickname` | string | —    | 昵称（首次登录时设置）       |
| `avatar`   | string | —    | 头像 URL                     |

**成功响应 `201`**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "student": { "id", "phone", "nickname", "avatar", "isActive" }
}
```

---

### 1.2 手机号注册 🔓公开

```
POST /student-auth/register
```

| 字段       | 类型   | 必填 | 说明                             |
| ---------- | ------ | ---- | -------------------------------- |
| `phone`    | string | ✅   | 11 位手机号（`/^1[3-9]\d{9}$/`） |
| `password` | string | ✅   | 密码，≥6 位                      |
| `nickname` | string | —    | 昵称                             |

**成功 `201`** → 返回 `{ accessToken, refreshToken, student }`  
**失败 `409`** → 手机号已注册

---

### 1.3 手机号登录 🔓公开

```
POST /student-auth/login
```

| 字段       | 类型   | 必填 | 说明   |
| ---------- | ------ | ---- | ------ |
| `phone`    | string | ✅   | 手机号 |
| `password` | string | ✅   | 密码   |

**成功 `201`** → `{ accessToken, refreshToken, student }`  
**失败 `400`** → 手机号或密码错误

---

### 1.4 刷新令牌 🔓公开

```
POST /student-auth/refresh
```

| 字段           | 类型   | 必填 | 说明                                |
| -------------- | ------ | ---- | ----------------------------------- |
| `refreshToken` | string | ✅   | 上次登录或刷新时返回的 refreshToken |

**成功 `201`** → `{ accessToken, refreshToken }`

---

### 1.5 获取个人信息

```
GET /student-auth/profile
```

**成功 `200`**

```json
{
  "id": "uuid",
  "phone": "138****8000",
  "nickname": "张三",
  "avatar": "https://...",
  "wxOpenid": "o1234...",
  "isActive": true,
  "lastLoginAt": "2026-02-16T01:00:00Z",
  "createdAt": "..."
}
```

---

### 1.6 修改个人信息

```
PATCH /student-auth/profile
```

| 字段       | 类型   | 必填 | 说明                  |
| ---------- | ------ | ---- | --------------------- |
| `nickname` | string | —    | 新昵称（≤100 字）     |
| `avatar`   | string | —    | 新头像 URL（≤500 字） |

---

### 1.7 修改密码

```
PATCH /student-auth/password
```

| 字段          | 类型   | 必填 | 说明          |
| ------------- | ------ | ---- | ------------- |
| `oldPassword` | string | ✅   | 旧密码        |
| `newPassword` | string | ✅   | 新密码，≥6 位 |

---

### 1.8 绑定手机号

```
PATCH /student-auth/bind-phone
```

| 字段       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| `phone`    | string | ✅   | 手机号   |
| `password` | string | ✅   | 设置密码 |

> 适用于微信登录后补绑手机号

---

### 1.9 绑定微信

```
PATCH /student-auth/bind-wechat
```

| 字段   | 类型   | 必填 | 说明                   |
| ------ | ------ | ---- | ---------------------- |
| `code` | string | ✅   | 微信 `wx.login()` code |

> 适用于手机号注册后补绑微信

---

## 二、题目模块 `/student`

> 以下所有接口需要学生端 JWT

### 2.1 题目列表

```
GET /student/questions
```

| 参数                | 类型   | 必填 | 说明                                                                               |
| ------------------- | ------ | ---- | ---------------------------------------------------------------------------------- |
| `page`              | number | —    | 页码（默认 1）                                                                     |
| `pageSize`          | number | —    | 每页数量（默认 10，最大 100）                                                      |
| `keyword`           | string | —    | 搜索标题                                                                           |
| `categoryId`        | uuid   | —    | 分类筛选                                                                           |
| `type`              | enum   | —    | `single_choice` / `multiple_choice` / `true_false` / `fill_blank` / `short_answer` |
| `difficulty`        | enum   | —    | `easy` / `medium` / `hard`                                                         |
| `tagIds`            | uuid[] | —    | 标签筛选                                                                           |
| `knowledgePointIds` | uuid[] | —    | 知识点筛选                                                                         |

**成功 `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "题目标题",
      "content": { "rendered": "<p>HTML内容</p>" },
      "type": "single_choice",
      "difficulty": "easy",
      "category": { "id", "name" },
      "tags": [{ "id", "name" }],
      "knowledgePoints": [{ "id", "name" }],
      "options": [
        { "id": "A", "content": { "rendered": "..." } }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

> ⚠️ 返回数据**不包含** `answer`、`explanation`、`creator`、选项中的 `isCorrect`

---

### 2.2 题目详情

```
GET /student/questions/:id
```

返回格式同列表单项，**不含答案/解析**。

---

### 2.3 提交答案

```
POST /student/questions/:id/submit
```

| 字段       | 类型   | 必填 | 说明           |
| ---------- | ------ | ---- | -------------- |
| `answer`   | any    | ✅   | 见下方格式     |
| `duration` | number | —    | 做题用时（秒） |

**答案格式对照：**

| 题型 | answer 格式 | 示例                 |
| ---- | ----------- | -------------------- |
| 单选 | `string`    | `"A"`                |
| 多选 | `string[]`  | `["A", "C"]`         |
| 判断 | `boolean`   | `true`               |
| 填空 | `string[]`  | `["答案1", "答案2"]` |
| 简答 | `string`    | `"我的回答..."`      |

**成功 `201`**

```json
{
  "isCorrect": true,
  "correctAnswer": "A",
  "explanation": { "raw": "...", "rendered": "<p>解析</p>" },
  "options": [
    { "id": "A", "content": {...}, "isCorrect": true },
    { "id": "B", "content": {...}, "isCorrect": false }
  ],
  "practiceRecordId": "uuid"
}
```

> 简答题 `isCorrect` 返回 `null`，需人工评阅

---

### 2.4 收藏 / 取消收藏

```
POST /student/questions/:id/favorite
```

**成功 `201`**

```json
{ "isFavorited": true } // 或 false（取消收藏）
```

---

### 2.5 收藏列表

```
GET /student/favorites
```

| 参数       | 类型   | 必填 | 说明         |
| ---------- | ------ | ---- | ------------ |
| `page`     | number | —    | 页码         |
| `pageSize` | number | —    | 每页数量     |
| `keyword`  | string | —    | 搜索题目标题 |

**成功 `200`** → 分页响应，每项含 `id`、`questionId`、`createdAt`、`question`（不含答案）

---

### 2.6 错题列表

```
GET /student/wrong-book
```

| 参数         | 类型    | 必填 | 说明                           |
| ------------ | ------- | ---- | ------------------------------ |
| `page`       | number  | —    | 页码                           |
| `pageSize`   | number  | —    | 每页数量                       |
| `isMastered` | boolean | —    | `true` 已掌握 / `false` 未掌握 |

**成功 `200`** → 分页响应，每项含 `wrongCount`、`lastWrongAt`、`lastWrongAnswer`、`isMastered`、`question`（不含答案）

---

### 2.7 标记已掌握 / 取消掌握

```
PATCH /student/wrong-book/:id/master
```

**成功 `200`** → 返回更新后的错题记录

---

### 2.8 从错题本移除

```
DELETE /student/wrong-book/:id
```

**成功 `200`**

---

### 2.9 做题记录

```
GET /student/practice-records
```

| 参数         | 类型    | 必填 | 说明          |
| ------------ | ------- | ---- | ------------- |
| `page`       | number  | —    | 页码          |
| `pageSize`   | number  | —    | 每页数量      |
| `isCorrect`  | boolean | —    | 筛选正确/错误 |
| `questionId` | uuid    | —    | 筛选特定题目  |

---

### 2.10 做题统计

```
GET /student/statistics
```

**成功 `200`**

```json
{
  "totalPracticed": 150,
  "totalCorrect": 120,
  "correctRate": 0.8,
  "totalFavorites": 25,
  "totalWrong": 12,
  "todayPracticed": 10,
  "todayCorrect": 8,
  "weeklyTrend": [
    { "date": "2026-02-10", "practiced": 20, "correct": 15 },
    { "date": "2026-02-11", "practiced": 18, "correct": 14 },
    ...
  ]
}
```

---

## 三、通用约定

### 3.1 认证流程

```
┌─────────────────────────────┐
│  wx.login() / 手机号注册/登录 │
└──────────┬──────────────────┘
           ▼
  POST /student-auth/wx-login
  POST /student-auth/register
  POST /student-auth/login
           │
           ▼ 获得 accessToken + refreshToken
           │
  ┌────────┴────────┐
  │  正常请求        │  accessToken 过期
  │  Header 携带     │─────────────────▶ POST /student-auth/refresh
  │  Authorization   │                   返回新 accessToken
  └─────────────────┘
```

### 3.2 错误响应格式

```json
{
  "statusCode": 400,
  "message": "手机号或密码错误",
  "error": "Bad Request"
}
```

### 3.3 分页响应格式

所有列表接口均返回：

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```
