# API 接口参考文档

本文档详细说明了题目管理系统的所有 API 接口，包括请求方法、URL、参数和返回值。

## 目录

1. [基础信息](#基础信息)
2. [认证接口](#认证接口)
3. [题目接口](#题目接口)
4. [分类接口](#分类接口)
5. [标签接口](#标签接口)
6. [上传接口](#上传接口)
7. [错误处理](#错误处理)

---

## 基础信息

### API 基础 URL

```
开发环境: http://localhost:3000/api
生产环境: https://api.example.com/api
```

### 认证方式

除了登录和注册接口外，所有接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer <access_token>
```

### 通用响应格式

**成功响应：**
```json
{
  "data": { ... },
  "message": "操作成功"
}
```

**分页响应：**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

**错误响应：**
```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

---

## 认证接口

### 用户登录

登录系统，获取访问令牌。

**请求：**
```
POST /api/auth/login
```

**请求体：**
```json
{
  "username": "admin",
  "password": "password123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应：**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 401 | 用户名或密码错误 |

---

### 用户注册

注册新用户账号。

**请求：**
```
POST /api/auth/register
```

**请求体：**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码（至少6位） |

**响应：**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "newuser",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 409 | 用户名或邮箱已存在 |

---

### 刷新令牌

使用刷新令牌获取新的访问令牌。

**请求：**
```
POST /api/auth/refresh
```

**请求体：**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应：**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 401 | 刷新令牌无效或已过期 |

---

### 获取当前用户信息

获取当前登录用户的信息。

**请求：**
```
GET /api/auth/profile
```

**响应：**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "username": "admin",
  "role": "admin"
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 401 | 未授权 |

---

## 题目接口

### 获取题目列表

获取题目列表，支持分页和筛选。

**请求：**
```
GET /api/questions
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词（标题和内容） |
| categoryId | string | 否 | 分类 ID |
| type | string | 否 | 题目类型 |
| difficulty | string | 否 | 难度等级 |
| tagIds | string[] | 否 | 标签 ID 列表 |

**题目类型（type）：**
- `single_choice` - 单选题
- `multiple_choice` - 多选题
- `true_false` - 判断题
- `fill_blank` - 填空题
- `short_answer` - 简答题

**难度等级（difficulty）：**
- `easy` - 简单
- `medium` - 中等
- `hard` - 困难

**响应：**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "1 + 1 = ?",
      "content": {
        "raw": "<p>请计算 1 + 1 的结果</p>",
        "rendered": "<p>请计算 1 + 1 的结果</p>"
      },
      "type": "single_choice",
      "difficulty": "easy",
      "categoryId": "550e8400-e29b-41d4-a716-446655440001",
      "tagIds": ["550e8400-e29b-41d4-a716-446655440002"],
      "options": [
        { "id": "a", "content": { "raw": "1", "rendered": "1" }, "isCorrect": false },
        { "id": "b", "content": { "raw": "2", "rendered": "2" }, "isCorrect": true },
        { "id": "c", "content": { "raw": "3", "rendered": "3" }, "isCorrect": false }
      ],
      "answer": "b",
      "explanation": {
        "raw": "<p>1 + 1 = 2</p>",
        "rendered": "<p>1 + 1 = 2</p>"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

### 获取单个题目

根据 ID 获取题目详情。

**请求：**
```
GET /api/questions/:id
```

**路径参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 题目 ID（UUID） |

**响应：**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "1 + 1 = ?",
  "content": { "raw": "...", "rendered": "..." },
  "type": "single_choice",
  "difficulty": "easy",
  "categoryId": "...",
  "tagIds": ["..."],
  "options": [...],
  "answer": "b",
  "explanation": { "raw": "...", "rendered": "..." },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 题目不存在 |

---

### 创建题目

创建新题目。

**请求：**
```
POST /api/questions
```

**请求体：**
```json
{
  "title": "1 + 1 = ?",
  "content": "<p>请计算 1 + 1 的结果</p>",
  "type": "single_choice",
  "difficulty": "easy",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "tagIds": ["550e8400-e29b-41d4-a716-446655440002"],
  "options": [
    { "id": "a", "content": "1", "isCorrect": false },
    { "id": "b", "content": "2", "isCorrect": true },
    { "id": "c", "content": "3", "isCorrect": false }
  ],
  "answer": "b",
  "explanation": "<p>1 + 1 = 2</p>"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 题目标题（最多200字符） |
| content | string | 是 | 题目内容（原始 HTML） |
| type | string | 是 | 题目类型 |
| difficulty | string | 是 | 难度等级 |
| categoryId | string | 是 | 分类 ID |
| tagIds | string[] | 否 | 标签 ID 列表 |
| options | array | 否 | 选项列表（选择题必填） |
| answer | string/string[] | 是 | 答案 |
| explanation | string | 否 | 答案解析 |

**响应：** 返回创建的题目对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 400 | 参数验证失败 |

---

### 更新题目

更新题目信息。

**请求：**
```
PATCH /api/questions/:id
```

**路径参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 题目 ID |

**请求体：** 与创建题目相同，所有字段都是可选的

**响应：** 返回更新后的题目对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 题目不存在 |

---

### 删除题目

删除题目。

**请求：**
```
DELETE /api/questions/:id
```

**路径参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 题目 ID |

**响应：** 无内容（204）

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 题目不存在 |

---

## 分类接口

### 获取分类列表

获取所有分类（扁平结构）。

**请求：**
```
GET /api/categories
```

**响应：**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "数学",
    "parentId": null,
    "level": 1,
    "path": "550e8400-e29b-41d4-a716-446655440000",
    "questionCount": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "代数",
    "parentId": "550e8400-e29b-41d4-a716-446655440000",
    "level": 2,
    "path": "550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001",
    "questionCount": 20,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 获取分类树

获取分类的树形结构。

**请求：**
```
GET /api/categories/tree
```

**响应：**
```json
[
  {
    "key": "550e8400-e29b-41d4-a716-446655440000",
    "title": "数学",
    "children": [
      {
        "key": "550e8400-e29b-41d4-a716-446655440001",
        "title": "代数",
        "children": [],
        "data": { ... }
      }
    ],
    "data": { ... }
  }
]
```

---

### 获取单个分类

根据 ID 获取分类详情。

**请求：**
```
GET /api/categories/:id
```

**响应：** 返回分类对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 分类不存在 |

---

### 创建分类

创建新分类。

**请求：**
```
POST /api/categories
```

**请求体：**
```json
{
  "name": "数学",
  "parentId": null
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称（最多100字符） |
| parentId | string | 否 | 父分类 ID |

**响应：** 返回创建的分类对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 400 | 层级超过限制（最多3级） |
| 409 | 同级分类下名称重复 |

---

### 更新分类

更新分类信息。

**请求：**
```
PATCH /api/categories/:id
```

**请求体：** 与创建分类相同

**响应：** 返回更新后的分类对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 分类不存在 |
| 409 | 同级分类下名称重复 |

---

### 删除分类

删除分类。

**请求：**
```
DELETE /api/categories/:id
```

**响应：** 无内容（204）

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 400 | 分类下有子分类或题目 |
| 404 | 分类不存在 |

---

## 标签接口

### 获取标签列表

获取所有标签。

**请求：**
```
GET /api/tags
```

**响应：**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "重点",
    "color": "#ff4d4f",
    "questionCount": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 获取单个标签

根据 ID 获取标签详情。

**请求：**
```
GET /api/tags/:id
```

**响应：** 返回标签对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 标签不存在 |

---

### 创建标签

创建新标签。

**请求：**
```
POST /api/tags
```

**请求体：**
```json
{
  "name": "重点",
  "color": "#ff4d4f"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 标签名称（最多50字符） |
| color | string | 否 | 标签颜色（十六进制，如 #ff4d4f） |

**响应：** 返回创建的标签对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 409 | 标签名称已存在 |

---

### 更新标签

更新标签信息。

**请求：**
```
PATCH /api/tags/:id
```

**请求体：** 与创建标签相同

**响应：** 返回更新后的标签对象

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 标签不存在 |
| 409 | 标签名称已存在 |

---

### 删除标签

删除标签。删除时会自动移除所有题目中对该标签的引用。

**请求：**
```
DELETE /api/tags/:id
```

**响应：** 无内容（204）

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 标签不存在 |

---

## 上传接口

### 上传图片

上传图片文件。

**请求：**
```
POST /api/upload/image
Content-Type: multipart/form-data
```

**请求体：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |

**支持的格式：** JPG、PNG、GIF、WEBP

**大小限制：** 最大 5MB

**响应：**
```json
{
  "url": "/api/upload/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 102400
}
```

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 400 | 文件类型不支持或未选择文件 |
| 413 | 文件大小超过限制 |

---

### 获取图片

获取已上传的图片。

**请求：**
```
GET /api/upload/images/:filename
```

**路径参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| filename | string | 文件名 |

**响应：** 图片文件

**错误码：**
| 状态码 | 说明 |
|--------|------|
| 404 | 图片不存在 |

---

## 错误处理

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

### 常见错误码

| 状态码 | 错误类型 | 说明 |
|--------|---------|------|
| 400 | Bad Request | 请求参数验证失败 |
| 401 | Unauthorized | 未授权或 Token 过期 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如名称重复） |
| 413 | Payload Too Large | 请求体过大 |
| 500 | Internal Server Error | 服务器内部错误 |

### 前端错误类型映射

```typescript
const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',  // 400
  NOT_FOUND: 'NOT_FOUND',                // 404
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',    // 409
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR',  // 403
  NETWORK_ERROR: 'NETWORK_ERROR',        // 其他
};
```

---

## 前端调用示例

### 使用 API Client

```typescript
import { getApiClient } from '@/lib/apiClient';

const api = getApiClient();

// GET 请求
const questions = await api.get('/questions', { page: 1, pageSize: 10 });

// POST 请求
const newQuestion = await api.post('/questions', {
  title: '新题目',
  content: '<p>题目内容</p>',
  type: 'single_choice',
  // ...
});

// PATCH 请求
const updatedQuestion = await api.patch('/questions/xxx-id', {
  title: '更新后的标题',
});

// DELETE 请求
await api.delete('/questions/xxx-id');
```

### 使用 Service 层

```typescript
import { getQuestions, createQuestion } from '@/services/questionService';

// 获取题目列表
const result = await getQuestions({
  page: 1,
  pageSize: 10,
  keyword: '数学',
});

// 创建题目
const question = await createQuestion({
  title: '新题目',
  content: '<p>题目内容</p>',
  type: 'single_choice',
  difficulty: 'easy',
  categoryId: 'xxx',
  tagIds: [],
  answer: 'a',
});
```

### 使用 React Hooks

```tsx
import { useQuestions, useQuestion } from '@/hooks';

function QuestionList() {
  const { questions, isLoading, error } = useQuestions({
    page: 1,
    pageSize: 10,
  });

  if (isLoading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" />;

  return <Table dataSource={questions} />;
}

function QuestionForm() {
  const { create, isCreating } = useQuestion();

  const handleSubmit = async (values) => {
    await create(values);
    message.success('创建成功');
  };

  return <Form onFinish={handleSubmit} />;
}
```
