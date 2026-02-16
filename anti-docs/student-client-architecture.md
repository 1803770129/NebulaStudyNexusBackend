# 星云刷题 — 客户端技术架构方案

> 编写日期: 2026-02-16  
> 架构策略: **双端分离** — 小程序 (UniApp) + App (Flutter)  
> 后端: 共享同一套 NestJS API（`/api/student-auth/*` + `/api/student/*`）

---

## 一、整体架构

```
┌──────────────────┐          ┌─────────────────────────┐
│  微信小程序        │          │   App (iOS / Android)    │
│  UniApp + Vue 3   │          │   Flutter + Dart         │
│  纯刷题功能       │          │  刷题 + Unity 3D 内容     │
└────────┬─────────┘          └────────────┬────────────┘
         │ HTTPS                           │ HTTPS
         └──────────┬──────────────────────┘
                    ▼
          ┌──────────────────┐
          │  Nginx 反向代理   │
          │  SSL / 限流       │
          ├──────────────────┤
          │  NestJS 后端      │
          │  student-auth     │
          │  student-question │
          ├──────────────────┤
          │  PostgreSQL       │
          └──────────────────┘
```

### 为什么双端分离？

| 维度     | UniApp 小程序              | Flutter App                  |
| -------- | -------------------------- | ---------------------------- |
| 定位     | 轻量入口，快速触达         | 完整体验，沉浸功能           |
| Unity 3D | ❌ 不支持                  | ✅ Unity as Library          |
| 渲染性能 | WebView 渲染               | Skia/Impeller 自绘，接近原生 |
| 分发     | 微信生态，零安装           | 应用商店下载                 |
| 开发语言 | Vue 3 + TS                 | Dart                         |
| 共享     | 共享后端 API + UI 设计规范 | 共享后端 API + UI 设计规范   |

---

## 二、小程序端（UniApp）

### 技术栈

| 组件     | 选择                        |
| -------- | --------------------------- |
| 框架     | UniApp + Vue 3 + TypeScript |
| UI 组件  | uni-ui + 自定义主题         |
| 状态管理 | Pinia                       |
| 网络请求 | 封装 `uni.request`          |
| 富文本   | mp-html                     |

### 项目结构

```
nebula-miniprogram/
├── src/
│   ├── api/                    # API 层
│   │   ├── http.ts             # 请求封装（拦截器、Token 刷新）
│   │   ├── auth.ts             # 认证 API
│   │   └── question.ts         # 题目/收藏/错题/统计 API
│   ├── stores/                 # Pinia Store
│   │   ├── user.ts             # 用户状态
│   │   └── question.ts         # 做题状态
│   ├── pages/
│   │   ├── login/index.vue     # 微信一键登录
│   │   ├── home/index.vue      # 首页统计
│   │   ├── question/
│   │   │   ├── list.vue        # 题目列表
│   │   │   ├── detail.vue      # 做题页
│   │   │   └── result.vue      # 答题结果
│   │   ├── favorites/index.vue # 收藏 + 错题本
│   │   └── profile/index.vue   # 个人中心
│   ├── components/             # 公共组件
│   │   ├── QuestionCard.vue
│   │   ├── OptionItem.vue
│   │   └── RichContent.vue
│   ├── composables/            # 可复用逻辑
│   │   ├── useAuth.ts
│   │   └── usePagination.ts
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json
│   └── manifest.json
└── package.json
```

### 底部 TabBar

```
┌───────────┬───────────┬───────────┬──────────────┐
│  🏠 首页  │  📝 刷题  │  ⭐ 收藏  │  👤 我的     │
└───────────┴───────────┴───────────┴──────────────┘
```

---

## 三、App 端（Flutter）

### 技术栈

| 组件     | 选择                     | 说明                           |
| -------- | ------------------------ | ------------------------------ |
| 框架     | Flutter 3.x + Dart       | Skia/Impeller 自绘引擎，高性能 |
| 状态管理 | Riverpod 2.0             | 编译安全，支持代码生成         |
| 网络请求 | Dio                      | 拦截器、Token 刷新、重试       |
| 路由     | go_router                | 声明式路由                     |
| 本地存储 | flutter_secure_storage   | Token 安全存储                 |
| 富文本   | flutter_widget_from_html | 渲染题目 HTML 内容             |
| 图表     | fl_chart                 | 统计趋势图                     |
| 3D 集成  | flutter_unity_widget     | 嵌入 Unity 场景                |

### 项目结构

```
nebula_study_app/
├── lib/
│   ├── main.dart
│   ├── app.dart                    # MaterialApp + 路由
│   │
│   ├── core/                       # 核心基础设施
│   │   ├── network/
│   │   │   ├── dio_client.dart     # Dio 配置 + 拦截器
│   │   │   ├── api_endpoints.dart  # API 路径常量
│   │   │   └── token_interceptor.dart  # Token 自动刷新
│   │   ├── storage/
│   │   │   └── secure_storage.dart     # Token 持久化
│   │   └── theme/
│   │       └── app_theme.dart          # 主题 + 颜色
│   │
│   ├── models/                     # 数据模型
│   │   ├── student.dart
│   │   ├── question.dart
│   │   ├── practice_record.dart
│   │   ├── favorite.dart
│   │   ├── wrong_book.dart
│   │   └── statistics.dart
│   │
│   ├── services/                   # API 服务层
│   │   ├── auth_service.dart
│   │   ├── question_service.dart
│   │   ├── favorite_service.dart
│   │   ├── wrong_book_service.dart
│   │   └── statistics_service.dart
│   │
│   ├── providers/                  # Riverpod Providers
│   │   ├── auth_provider.dart
│   │   ├── question_provider.dart
│   │   └── statistics_provider.dart
│   │
│   ├── pages/                      # 页面
│   │   ├── login/
│   │   │   └── login_page.dart
│   │   ├── home/
│   │   │   └── home_page.dart          # 统计概览
│   │   ├── question/
│   │   │   ├── question_list_page.dart
│   │   │   ├── question_detail_page.dart  # 做题页
│   │   │   └── question_result_page.dart  # 答题结果
│   │   ├── favorites/
│   │   │   └── favorites_page.dart     # 收藏 + 错题本
│   │   ├── profile/
│   │   │   └── profile_page.dart
│   │   └── unity/                      # Unity 3D 页面
│   │       └── unity_scene_page.dart   # 嵌入 Unity
│   │
│   ├── widgets/                    # 可复用组件
│   │   ├── question_card.dart
│   │   ├── option_item.dart
│   │   ├── rich_content_view.dart
│   │   ├── stat_chart.dart
│   │   └── empty_state.dart
│   │
│   └── utils/
│       └── format_utils.dart
│
├── unity/                          # Unity 项目（后期接入）
│   └── NebulaUnity/
│       ├── Assets/
│       └── ...
│
├── pubspec.yaml
└── analysis_options.yaml
```

### Unity 集成架构

```
┌─────────────────────────────────────────────────────┐
│                    Flutter App                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │          普通页面 (Flutter Widgets)           │    │
│  │  登录 / 刷题 / 收藏 / 错题本 / 统计 / 个人中心 │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │       Unity 3D 视图 (UnityWidget)            │    │
│  │                                             │    │
│  │   flutter_unity_widget                      │    │
│  │   ┌───────────────────────────────────┐     │    │
│  │   │  Unity Engine (as Library)         │     │    │
│  │   │  - 3D 模型展示                     │     │    │
│  │   │  - 交互式实验                      │     │    │
│  │   │  - AR 场景（后期）                 │     │    │
│  │   └───────────────────────────────────┘     │    │
│  │                                             │    │
│  │   通信: Flutter → Unity  (postMessage)      │    │
│  │   通信: Unity  → Flutter (sendToFlutter)    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**通信约定（JSON 消息协议）：**

```
Flutter → Unity:  { "action": "loadModel", "modelId": "xxx" }
Unity  → Flutter: { "event": "modelLoaded", "data": {...} }
```

### Token 无感刷新（Dio 拦截器）

```
请求返回 401
  ├─ 正在刷新 → 将请求加入等待队列
  └─ 未在刷新 → 锁定 → POST /student-auth/refresh
       ├─ 成功 → 更新 Token → 重放队列中所有请求 → 解锁
       └─ 失败 → 清空登录态 → 跳转登录页 → 解锁
```

---

## 四、两端共享与差异

### 共享

| 层面     | 共享内容                              |
| -------- | ------------------------------------- |
| 后端 API | 同一套 NestJS 接口，同一份接口文档    |
| UI 设计  | 同一套设计稿 / 设计规范，两端各自实现 |
| 业务逻辑 | 相同的状态机（做题流程）、分页逻辑    |

### 差异

| 功能    | 小程序 (UniApp)  | App (Flutter)                         |
| ------- | ---------------- | ------------------------------------- |
| 登录    | 微信一键登录为主 | 手机号登录为主 + 微信登录（开放平台） |
| 3D 内容 | ❌ 不支持        | ✅ Unity 嵌入                         |
| 推送    | 微信订阅消息     | FCM / 极光推送                        |
| 分享    | 微信分享         | 系统分享                              |
| 性能    | 受限于 WebView   | 接近原生                              |

---

## 五、开发计划

### 小程序端（UniApp）

| 阶段     | 内容                         | 周期       |
| -------- | ---------------------------- | ---------- |
| P1       | 项目初始化 + 登录 + 请求封装 | 2 天       |
| P2       | 题目列表 + 做题 + 答题结果   | 3 天       |
| P3       | 收藏 + 错题本 + 做题记录     | 2 天       |
| P4       | 首页统计 + 个人中心          | 2 天       |
| P5       | UI 美化 + 测试 + 审核提交    | 2 天       |
| **小计** |                              | **~11 天** |

### App 端（Flutter）

| 阶段     | 内容                              | 周期          |
| -------- | --------------------------------- | ------------- |
| P1       | 项目初始化 + Dio 封装 + 登录      | 2 天          |
| P2       | 题目列表 + 做题 + 答题结果        | 3 天          |
| P3       | 收藏 + 错题本 + 做题记录          | 2 天          |
| P4       | 首页统计 + 图表 + 个人中心        | 3 天          |
| P5       | UI 美化 + 动画 + 测试             | 3 天          |
| P6       | Unity 集成（需 Unity 项目就绪后） | 3-5 天        |
| P7       | App 打包签名 + 上架               | 2 天          |
| **小计** |                                   | **~18-20 天** |

> 两端可并行开发。如先做小程序快速上线，再做 App 精品版本。
