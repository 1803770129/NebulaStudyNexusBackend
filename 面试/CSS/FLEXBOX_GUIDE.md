# Flexbox 布局完全指南

## 一、基本概念

### 1.1 什么是 Flexbox？

Flexbox（Flexible Box，弹性盒子）是 CSS3 引入的一种**一维布局模型**，专门用于在容器中对子元素进行排列、对齐和分配空间。

**一句话理解：** Flexbox 让元素的排列和对齐变得简单直观。

### 1.2 核心概念

```
                    主轴方向 (main axis)
                ←─────────────────────────→
              
              ┌─────────────────────────────┐  ↑
              │  ┌─────┐ ┌─────┐ ┌─────┐   │  │
              │  │item │ │item │ │item │   │  │ 交叉轴方向
              │  │  1  │ │  2  │ │  3  │   │  │ (cross axis)
              │  └─────┘ └─────┘ └─────┘   │  │
              └─────────────────────────────┘  ↓
                        Flex 容器
```

| 概念 | 说明 |
|------|------|
| Flex Container | 弹性容器，设置 `display: flex` 的元素 |
| Flex Item | 弹性项目，容器的直接子元素 |
| Main Axis | 主轴，项目排列的方向（默认水平） |
| Cross Axis | 交叉轴，垂直于主轴的方向 |
| Main Start/End | 主轴的起点和终点 |
| Cross Start/End | 交叉轴的起点和终点 |

### 1.3 开启 Flexbox

```css
/* 块级弹性容器 */
.container {
  display: flex;
}

/* 行内弹性容器 */
.container {
  display: inline-flex;
}
```

---

## 二、容器属性（6个）

### 2.1 flex-direction（主轴方向）

```css
.container {
  flex-direction: row;            /* 默认：水平从左到右 → */
  flex-direction: row-reverse;    /* 水平从右到左 ← */
  flex-direction: column;         /* 垂直从上到下 ↓ */
  flex-direction: column-reverse; /* 垂直从下到上 ↑ */
}
```

```
row (默认)           row-reverse
┌─────────────┐     ┌─────────────┐
│ 1 │ 2 │ 3   │     │   3 │ 2 │ 1 │
└─────────────┘     └─────────────┘

column               column-reverse
┌───┐               ┌───┐
│ 1 │               │ 3 │
├───┤               ├───┤
│ 2 │               │ 2 │
├───┤               ├───┤
│ 3 │               │ 1 │
└───┘               └───┘
```

### 2.2 flex-wrap（换行方式）

```css
.container {
  flex-wrap: nowrap;       /* 默认：不换行，可能压缩项目 */
  flex-wrap: wrap;         /* 换行，第一行在上方 */
  flex-wrap: wrap-reverse; /* 换行，第一行在下方 */
}
```

```
nowrap (默认)        wrap                 wrap-reverse
┌─────────────┐     ┌─────────────┐      ┌─────────────┐
│1│2│3│4│5│6│7│     │ 1│ 2 │ 3 │ 4│      │ 5 │ 6 │ 7 │  │
└─────────────┘     ├─────────────┤      ├─────────────┤
(可能被压缩)         │ 5 │ 6 │ 7 │ │      │ 1 │ 2 │ 3 │ 4│
                    └─────────────┘      └─────────────┘
```

### 2.3 flex-flow（简写）

```css
/* flex-flow = flex-direction + flex-wrap */
.container {
  flex-flow: row nowrap;      /* 默认值 */
  flex-flow: row wrap;
  flex-flow: column wrap;
}
```

### 2.4 justify-content（主轴对齐）

```css
.container {
  justify-content: flex-start;    /* 默认：起点对齐 */
  justify-content: flex-end;      /* 终点对齐 */
  justify-content: center;        /* 居中对齐 */
  justify-content: space-between; /* 两端对齐，项目间隔相等 */
  justify-content: space-around;  /* 项目两侧间隔相等 */
  justify-content: space-evenly;  /* 所有间隔完全相等 */
}
```

```
flex-start (默认)              flex-end
┌─────────────────────┐       ┌─────────────────────┐
│ 1 │ 2 │ 3 │         │       │         │ 1 │ 2 │ 3 │
└─────────────────────┘       └─────────────────────┘

center                         space-between
┌─────────────────────┐       ┌─────────────────────┐
│     │ 1 │ 2 │ 3 │   │       │ 1 │     │ 2 │     │ 3 │
└─────────────────────┘       └─────────────────────┘

space-around                   space-evenly
┌─────────────────────┐       ┌─────────────────────┐
│  │ 1 │  │ 2 │  │ 3 │  │     │   │ 1 │   │ 2 │   │ 3 │   │
└─────────────────────┘       └─────────────────────┘
(两侧间隔是中间的一半)          (所有间隔完全相等)
```

### 2.5 align-items（交叉轴对齐 - 单行）

```css
.container {
  align-items: stretch;    /* 默认：拉伸填满容器高度 */
  align-items: flex-start; /* 交叉轴起点对齐 */
  align-items: flex-end;   /* 交叉轴终点对齐 */
  align-items: center;     /* 交叉轴居中对齐 */
  align-items: baseline;   /* 基线对齐（文字底部） */
}
```

```
stretch (默认)        flex-start           flex-end
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│┌──┐┌──┐┌──┐│      │┌─┐┌──┐┌─┐   │      │             │
││  ││  ││  ││      │└─┘└──┘└─┘   │      │┌─┐┌──┐┌─┐   │
│└──┘└──┘└──┘│      │             │      │└─┘└──┘└─┘   │
└─────────────┘      └─────────────┘      └─────────────┘

center                baseline
┌─────────────┐      ┌─────────────┐
│   ┌─┐       │      │┌─┐          │
│┌─┐│ │┌─┐    │      ││A│┌──┐┌─┐   │  ← 文字基线对齐
│└─┘└─┘└─┘    │      │└─┘│AB│└─┘   │
└─────────────┘      └───└──┘──────┘
```

### 2.6 align-content（交叉轴对齐 - 多行）

**注意：** 只在多行（`flex-wrap: wrap`）时生效！

```css
.container {
  flex-wrap: wrap; /* 必须换行才生效 */
  align-content: stretch;       /* 默认：拉伸填满 */
  align-content: flex-start;    /* 起点对齐 */
  align-content: flex-end;      /* 终点对齐 */
  align-content: center;        /* 居中对齐 */
  align-content: space-between; /* 两端对齐 */
  align-content: space-around;  /* 两侧间隔相等 */
  align-content: space-evenly;  /* 所有间隔相等 */
}
```

```
flex-start              center                 space-between
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ 1 │ 2 │ 3   │        │             │        │ 1 │ 2 │ 3   │
│ 4 │ 5 │     │        │ 1 │ 2 │ 3   │        │             │
│             │        │ 4 │ 5 │     │        │             │
│             │        │             │        │ 4 │ 5 │     │
└─────────────┘        └─────────────┘        └─────────────┘
```

### 2.7 gap（间距）

```css
.container {
  gap: 20px;           /* 行和列间距都是 20px */
  gap: 10px 20px;      /* 行间距 10px，列间距 20px */
  row-gap: 10px;       /* 行间距 */
  column-gap: 20px;    /* 列间距 */
}
```

**优点：** 使用 `gap` 代替 `margin`，不会有外边距合并问题！

---

## 三、项目属性（6个）

### 3.1 order（排列顺序）

```css
.item {
  order: 0;  /* 默认值，数值越小越靠前 */
  order: -1; /* 排在最前面 */
  order: 1;  /* 排在后面 */
}
```

```
默认 (order 都是 0)          设置 order 后
┌─────────────────┐         ┌─────────────────┐
│ 1 │ 2 │ 3 │ 4   │         │ 3 │ 1 │ 2 │ 4   │
└─────────────────┘         └─────────────────┘
                            (3的order=-1, 4的order=1)
```

### 3.2 flex-grow（放大比例）

```css
.item {
  flex-grow: 0; /* 默认：不放大 */
  flex-grow: 1; /* 等比例放大填满剩余空间 */
  flex-grow: 2; /* 放大比例是 1 的两倍 */
}
```

```
所有项目 flex-grow: 0 (默认)
┌─────────────────────────────┐
│ 1 │ 2 │ 3 │                 │  ← 剩余空间不分配
└─────────────────────────────┘

所有项目 flex-grow: 1
┌─────────────────────────────┐
│    1    │    2    │    3    │  ← 等比例分配剩余空间
└─────────────────────────────┘

项目1: flex-grow: 2, 项目2和3: flex-grow: 1
┌─────────────────────────────┐
│      1      │   2   │   3   │  ← 1 获得 2 份，2和3各获得 1 份
└─────────────────────────────┘
```

### 3.3 flex-shrink（缩小比例）

```css
.item {
  flex-shrink: 1; /* 默认：等比例缩小 */
  flex-shrink: 0; /* 不缩小 */
  flex-shrink: 2; /* 缩小比例是 1 的两倍 */
}
```

```
空间不足时，flex-shrink: 1 (默认)
┌─────────────────┐
│ 1 │ 2 │ 3 │ 4 │ 5 │  ← 所有项目等比例缩小
└─────────────────┘

项目3: flex-shrink: 0
┌─────────────────┐
│1│2│   3   │4│5│    ← 项目3不缩小，其他项目缩小更多
└─────────────────┘
```

### 3.4 flex-basis（初始大小）

```css
.item {
  flex-basis: auto;  /* 默认：根据内容或 width 决定 */
  flex-basis: 0;     /* 完全由 flex-grow 决定大小 */
  flex-basis: 200px; /* 初始宽度 200px */
  flex-basis: 30%;   /* 初始宽度 30% */
}
```

**优先级：** `flex-basis` > `width`（当 flex-basis 不为 auto 时）

### 3.5 flex（简写）⭐ 重要

```css
.item {
  /* flex = flex-grow flex-shrink flex-basis */
  flex: 0 1 auto;    /* 默认值 */
  flex: 1;           /* 等同于 flex: 1 1 0% */
  flex: auto;        /* 等同于 flex: 1 1 auto */
  flex: none;        /* 等同于 flex: 0 0 auto */
  flex: 2;           /* 等同于 flex: 2 1 0% */
}
```

**常用值：**

| 值 | 等同于 | 说明 |
|-----|--------|------|
| `flex: 1` | `1 1 0%` | 等比例分配空间 |
| `flex: auto` | `1 1 auto` | 基于内容大小，可伸缩 |
| `flex: none` | `0 0 auto` | 不伸缩，保持原始大小 |
| `flex: 0` | `0 1 0%` | 不放大，可缩小 |

### 3.6 align-self（单独对齐）

```css
.item {
  align-self: auto;       /* 默认：继承容器的 align-items */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: baseline;
  align-self: stretch;
}
```

```
容器 align-items: flex-start, 项目2 align-self: flex-end
┌─────────────────────────┐
│┌─┐     ┌─┐              │
│└─┘     └─┘              │
│     ┌─┐                 │  ← 项目2单独在底部
│     └─┘                 │
└─────────────────────────┘
```

---

## 四、实际使用场景

### 4.1 场景一：水平垂直居中

```css
/* 最简单的居中方式！ */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

```html
<div class="container">
  <div class="box">居中内容</div>
</div>
```

### 4.2 场景二：导航栏

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: #333;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
```

```html
<nav class="navbar">
  <div class="nav-left">
    <img src="logo.png" alt="Logo">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </div>
  <div class="nav-right">
    <button>登录</button>
    <button>注册</button>
  </div>
</nav>
```

### 4.3 场景三：卡片列表（等宽自适应）

```css
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px; /* 最小 300px，可伸缩 */
  max-width: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

### 4.4 场景四：圣杯布局（三栏布局）

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar-left {
  flex: 0 0 200px; /* 固定 200px，不伸缩 */
  background: #f0f0f0;
}

.main {
  flex: 1; /* 自适应填满剩余空间 */
  padding: 20px;
}

.sidebar-right {
  flex: 0 0 150px; /* 固定 150px */
  background: #f0f0f0;
}
```

```html
<div class="layout">
  <aside class="sidebar-left">左侧栏</aside>
  <main class="main">主内容</main>
  <aside class="sidebar-right">右侧栏</aside>
</div>
```

### 4.5 场景五：底部固定（Sticky Footer）

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  flex: 0 0 auto; /* 不伸缩 */
}

.content {
  flex: 1; /* 填满剩余空间 */
}

.footer {
  flex: 0 0 auto; /* 不伸缩，始终在底部 */
}
```

```html
<div class="page">
  <header class="header">头部</header>
  <main class="content">内容（即使内容少，footer 也在底部）</main>
  <footer class="footer">底部</footer>
</div>
```

### 4.6 场景六：等高布局

```css
.container {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  /* 所有列自动等高！ */
}
```

### 4.7 场景七：输入框组合

```css
.input-group {
  display: flex;
}

.input-group .prefix {
  flex: 0 0 auto;
  padding: 8px 12px;
  background: #eee;
  border: 1px solid #ccc;
  border-right: none;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
}

.input-group .suffix {
  flex: 0 0 auto;
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: 1px solid #007bff;
  cursor: pointer;
}
```

```html
<div class="input-group">
  <span class="prefix">https://</span>
  <input type="text" placeholder="输入网址">
  <button class="suffix">搜索</button>
</div>
```

### 4.8 场景八：媒体对象

```css
.media {
  display: flex;
  gap: 15px;
}

.media-image {
  flex: 0 0 auto;
}

.media-image img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.media-body {
  flex: 1;
}

.media-body h4 {
  margin: 0 0 8px 0;
}

.media-body p {
  margin: 0;
  color: #666;
}
```

```html
<div class="media">
  <div class="media-image">
    <img src="avatar.jpg" alt="头像">
  </div>
  <div class="media-body">
    <h4>用户名</h4>
    <p>这是一段评论内容，可以很长很长...</p>
  </div>
</div>
```

---

## 五、Flexbox vs Grid

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部布局 | 页面整体布局 |
| 对齐 | 主轴 + 交叉轴 | 行 + 列 |
| 项目大小 | 内容驱动 | 容器驱动 |
| 间距 | gap | gap |
| 学习曲线 | 较低 | 较高 |

**选择建议：**
- **Flexbox**：导航栏、卡片内部、表单、小组件
- **Grid**：页面布局、复杂网格、仪表盘

---

## 六、常见问题与技巧

### 6.1 问题：最后一行对齐问题

```css
/* 问题：使用 space-between 时，最后一行项目不足会分散 */
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* 解决方案1：使用 gap + flex-basis */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.item {
  flex: 0 0 calc(33.333% - 14px); /* 3列 */
}

/* 解决方案2：使用伪元素占位 */
.container::after {
  content: '';
  flex: auto; /* 或具体宽度 */
}
```

### 6.2 问题：子元素超出容器

```css
/* 问题：长文本导致 flex 项目超出 */
.item {
  flex: 1;
  /* 文本可能溢出 */
}

/* 解决方案：添加 min-width: 0 或 overflow */
.item {
  flex: 1;
  min-width: 0; /* 允许缩小到内容以下 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 6.3 问题：图片变形

```css
/* 问题：图片在 flex 容器中被拉伸 */
.container {
  display: flex;
  align-items: stretch; /* 默认值会拉伸图片 */
}

/* 解决方案 */
.container {
  display: flex;
  align-items: flex-start; /* 或 center */
}

/* 或者给图片设置 */
img {
  align-self: flex-start;
}
```

### 6.4 技巧：margin: auto 的妙用

```css
/* 将某个项目推到最右边 */
.nav {
  display: flex;
  align-items: center;
}
.nav .logo { }
.nav .menu { }
.nav .user {
  margin-left: auto; /* 推到最右边 */
}

/* 完美居中 */
.container {
  display: flex;
}
.item {
  margin: auto; /* 水平垂直居中 */
}
```

### 6.5 技巧：flex: 1 vs width: 100%

```css
/* flex: 1 - 等比例分配剩余空间 */
.item {
  flex: 1;
}

/* width: 100% - 占满整行（可能溢出） */
.item {
  width: 100%;
}

/* 推荐：flex: 1 配合 min-width */
.item {
  flex: 1;
  min-width: 0;
}
```

---

## 七、面试常见问题

### Q1: Flexbox 是什么？有什么特点？

**答：** Flexbox 是 CSS3 的一维布局模型，用于在容器中排列、对齐和分配子元素空间。

特点：
- 一维布局（主轴方向）
- 灵活的空间分配（grow/shrink）
- 强大的对齐能力
- 简化了居中、等高等常见布局

### Q2: flex: 1 是什么意思？

**答：** `flex: 1` 是 `flex: 1 1 0%` 的简写：
- `flex-grow: 1` - 可以放大
- `flex-shrink: 1` - 可以缩小
- `flex-basis: 0%` - 初始大小为 0，完全由 flex-grow 决定

效果：所有设置 `flex: 1` 的项目等比例分配容器空间。

### Q3: justify-content 和 align-items 的区别？

**答：**
- `justify-content`：控制**主轴**方向的对齐
- `align-items`：控制**交叉轴**方向的对齐（单行）
- `align-content`：控制**交叉轴**方向的对齐（多行）

默认主轴是水平方向，所以：
- `justify-content` 控制水平对齐
- `align-items` 控制垂直对齐

### Q4: flex-grow 和 flex-shrink 的计算方式？

**答：**

**flex-grow 计算：**
```
剩余空间 = 容器宽度 - 所有项目的 flex-basis 之和
项目增长量 = 剩余空间 × (项目的 flex-grow / 所有项目 flex-grow 之和)
```

**flex-shrink 计算：**
```
溢出空间 = 所有项目的 flex-basis 之和 - 容器宽度
项目缩小量 = 溢出空间 × (项目的 flex-shrink × flex-basis / 所有项目的 flex-shrink × flex-basis 之和)
```

### Q5: Flexbox 和 Grid 怎么选？

**答：**
- **Flexbox**：一维布局，适合组件内部（导航、卡片、表单）
- **Grid**：二维布局，适合页面整体布局

简单记忆：**组件用 Flex，页面用 Grid**

---

## 八、总结

### 容器属性速记

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `flex-direction` | 主轴方向 | row, column |
| `flex-wrap` | 换行 | nowrap, wrap |
| `justify-content` | 主轴对齐 | center, space-between |
| `align-items` | 交叉轴对齐 | center, stretch |
| `align-content` | 多行对齐 | center, space-between |
| `gap` | 间距 | 20px |

### 项目属性速记

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `flex` | 伸缩简写 | 1, auto, none |
| `flex-grow` | 放大 | 0, 1 |
| `flex-shrink` | 缩小 | 0, 1 |
| `flex-basis` | 初始大小 | auto, 0, 200px |
| `order` | 排序 | 0, -1, 1 |
| `align-self` | 单独对齐 | center, flex-end |

### 记忆口诀

**"容器六属性：方向换行流，主交多行齐"**
- 方向：flex-direction
- 换行：flex-wrap
- 流：flex-flow（简写）
- 主：justify-content（主轴）
- 交：align-items（交叉轴）
- 多行齐：align-content

**"项目六属性：序大小基，弹自齐"**
- 序：order
- 大：flex-grow
- 小：flex-shrink
- 基：flex-basis
- 弹：flex（简写）
- 自齐：align-self