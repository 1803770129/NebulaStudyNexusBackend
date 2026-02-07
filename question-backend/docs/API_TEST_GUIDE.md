# Apipost 接口测试指南

## 基础配置

- **Base URL**: `http://服务器IP:3000/api`
- **Content-Type**: `application/json`
- **Swagger 文档**: `http://服务器IP:3000/api/docs`

---

## 一、认证接口 (auth)

### 1.1 用户注册

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/auth/register` |
| 认证 | 不需要 |

**请求体**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "123456"
}
```

**成功响应** (201):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

---

### 1.2 用户登录

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/auth/login` |
| 认证 | 不需要 |

**请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **重要**: 保存 `accessToken`，后续需要认证的接口都要在 Header 中携带。

---

### 1.3 获取当前用户信息

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/auth/profile` |
| 认证 | 需要 |

**Headers**:
```
Authorization: Bearer {accessToken}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sub": "user-uuid",
    "username": "admin"
  }
}
```

---

### 1.4 刷新 Token

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/auth/refresh` |
| 认证 | 不需要 |

**请求体**:
```json
{
  "refreshToken": "登录时返回的refreshToken"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "新的accessToken",
    "refreshToken": "新的refreshToken"
  }
}
```

---

## 二、分类接口 (categories)

> 所有分类接口都需要认证，Header 中添加 `Authorization: Bearer {accessToken}`

### 2.1 创建分类

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/categories` |
| 认证 | 需要 |

**请求体**:
```json
{
  "name": "数学",
  "parentId": null
}
```

**创建子分类**:
```json
{
  "name": "代数",
  "parentId": "父分类的UUID"
}
```

---

### 2.2 获取分类列表

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/categories` |
| 认证 | 需要 |

---

### 2.3 获取分类树

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/categories/tree` |
| 认证 | 需要 |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "name": "数学",
      "children": [
        {
          "id": "uuid",
          "name": "代数",
          "children": []
        }
      ]
    }
  ]
}
```

---

### 2.4 获取分类详情

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/categories/{id}` |
| 认证 | 需要 |

---

### 2.5 更新分类

| 项目 | 值 |
|------|-----|
| 方法 | PATCH |
| URL | `/api/categories/{id}` |
| 认证 | 需要 |

**请求体**:
```json
{
  "name": "高等数学"
}
```

---

### 2.6 删除分类

| 项目 | 值 |
|------|-----|
| 方法 | DELETE |
| URL | `/api/categories/{id}` |
| 认证 | 需要 |

> 注意：如果分类下有题目或子分类，无法删除。

---

## 三、标签接口 (tags)

> 所有标签接口都需要认证

### 3.1 创建标签

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/tags` |
| 认证 | 需要 |

**请求体**:
```json
{
  "name": "重点",
  "color": "#1890ff"
}
```

---

### 3.2 获取标签列表

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/tags` |
| 认证 | 需要 |

---

### 3.3 获取标签详情

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/tags/{id}` |
| 认证 | 需要 |

---

### 3.4 更新标签

| 项目 | 值 |
|------|-----|
| 方法 | PATCH |
| URL | `/api/tags/{id}` |
| 认证 | 需要 |

**请求体**:
```json
{
  "name": "必考",
  "color": "#ff4d4f"
}
```

---

### 3.5 删除标签

| 项目 | 值 |
|------|-----|
| 方法 | DELETE |
| URL | `/api/tags/{id}` |
| 认证 | 需要 |

---

## 四、题目接口 (questions)

> 所有题目接口都需要认证

### 4.1 创建题目

| 项目 | 值 |
|------|-----|
| 方法 | POST |
| URL | `/api/questions` |
| 认证 | 需要 |

**题目类型 (type)**:
- `single_choice` - 单选题
- `multiple_choice` - 多选题
- `true_false` - 判断题
- `fill_blank` - 填空题
- `short_answer` - 简答题
- `essay` - 论述题

**难度等级 (difficulty)**:
- `easy` - 简单
- `medium` - 中等
- `hard` - 困难

#### 单选题示例:
```json
{
  "title": "1+1等于多少？",
  "content": "<p>请选择正确答案</p>",
  "type": "single_choice",
  "difficulty": "easy",
  "categoryId": "分类UUID",
  "tagIds": ["标签UUID1", "标签UUID2"],
  "options": [
    { "label": "A", "content": "1", "isCorrect": false },
    { "label": "B", "content": "2", "isCorrect": true },
    { "label": "C", "content": "3", "isCorrect": false },
    { "label": "D", "content": "4", "isCorrect": false }
  ],
  "answer": "B",
  "explanation": "<p>1+1=2，这是基本的数学运算</p>"
}
```

#### 多选题示例:
```json
{
  "title": "以下哪些是编程语言？",
  "content": "<p>请选择所有正确答案</p>",
  "type": "multiple_choice",
  "difficulty": "easy",
  "categoryId": "分类UUID",
  "options": [
    { "label": "A", "content": "Java", "isCorrect": true },
    { "label": "B", "content": "HTML", "isCorrect": false },
    { "label": "C", "content": "Python", "isCorrect": true },
    { "label": "D", "content": "CSS", "isCorrect": false }
  ],
  "answer": ["A", "C"],
  "explanation": "<p>Java和Python是编程语言，HTML和CSS是标记语言</p>"
}
```

#### 判断题示例:
```json
{
  "title": "地球是圆的",
  "content": "<p>请判断以下说法是否正确</p>",
  "type": "true_false",
  "difficulty": "easy",
  "categoryId": "分类UUID",
  "answer": "true",
  "explanation": "<p>地球是一个近似球体</p>"
}
```

#### 填空题示例:
```json
{
  "title": "中国的首都是____",
  "content": "<p>请填写正确答案</p>",
  "type": "fill_blank",
  "difficulty": "easy",
  "categoryId": "分类UUID",
  "answer": "北京",
  "explanation": "<p>北京是中华人民共和国的首都</p>"
}
```

#### 简答题示例:
```json
{
  "title": "简述HTTP和HTTPS的区别",
  "content": "<p>请简要说明HTTP和HTTPS协议的主要区别</p>",
  "type": "short_answer",
  "difficulty": "medium",
  "categoryId": "分类UUID",
  "answer": "HTTPS是HTTP的安全版本，使用SSL/TLS加密传输数据",
  "explanation": "<p>主要区别：1. 安全性 2. 端口号 3. 证书</p>"
}
```

---

### 4.2 获取题目列表

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/questions` |
| 认证 | 需要 |

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，默认 1 |
| limit | number | 每页数量，默认 10 |
| keyword | string | 搜索关键词 |
| categoryId | string | 分类ID |
| type | string | 题目类型 |
| difficulty | string | 难度等级 |
| tagIds | string[] | 标签ID列表 |

**示例**:
```
GET /api/questions?page=1&limit=10&type=single_choice&difficulty=easy
```

---

### 4.3 获取题目详情

| 项目 | 值 |
|------|-----|
| 方法 | GET |
| URL | `/api/questions/{id}` |
| 认证 | 需要 |

---

### 4.4 更新题目

| 项目 | 值 |
|------|-----|
| 方法 | PATCH |
| URL | `/api/questions/{id}` |
| 认证 | 需要 |

**请求体** (只需要传要更新的字段):
```json
{
  "title": "更新后的标题",
  "difficulty": "hard"
}
```

---

### 4.5 删除题目

| 项目 | 值 |
|------|-----|
| 方法 | DELETE |
| URL | `/api/questions/{id}` |
| 认证 | 需要 |

---

## 五、Apipost 配置技巧

### 5.1 设置全局 Header

1. 创建环境变量 `token`
2. 登录成功后，将 `accessToken` 保存到环境变量
3. 在全局 Header 中设置：
   ```
   Authorization: Bearer {{token}}
   ```

### 5.2 自动保存 Token

在登录接口的「后执行脚本」中添加：
```javascript
if (response.json.data && response.json.data.accessToken) {
  apt.variables.set("token", response.json.data.accessToken);
}
```

### 5.3 测试顺序建议

1. 注册用户
2. 登录获取 Token
3. 创建分类
4. 创建标签
5. 创建题目（需要分类ID）
6. 查询/更新/删除操作

---

## 六、常见错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 参数验证失败 |
| 401 | 未授权（Token 无效或过期） |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 500 | 服务器内部错误 |
