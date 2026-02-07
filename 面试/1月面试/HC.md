# 📦 HTML5 十大核心特性（必背）

| # | 特性 | 一句话描述 | 关键词 |
|---|------|-----------|--------|
| 1 | 语义化标签 | 让页面结构更清晰 | header/nav/main/article/section/aside/footer |
| 2 | 表单增强 | 新输入类型+原生验证 | email/date/range/required/pattern |
| 3 | 视频音频 | 原生多媒体支持 | video/audio/source |
| 4 | Canvas | 像素级2D绑图 | getContext('2d')/fillRect/drawImage |
| 5 | SVG | 矢量图形 | 不失真/可交互/适合图标 |
| 6 | 地理定位 | 获取用户位置 | navigator.geolocation |
| 7 | Web Storage | 本地存储 | localStorage/sessionStorage |
| 8 | Web Workers | 后台多线程 | 不阻塞UI/postMessage通信 |
| 9 | WebSocket | 实时双向通信 | 全双工/持久连接 |
| 10 | 拖放API | 原生拖放 | draggable/dragstart/drop |

# BFC 
BFC（Block Formatting Context，块级格式化上下文）
**一句话理解：** BFC 就像一个"结界"，把里面的元素和外面的元素隔离开来。
### Q1: 如何创建 BFC？

**答：** 常用方法：
1. `display: flow-root`（推荐，无副作用）
2. `overflow: hidden/auto`（常用，但会裁剪内容）
3. `display: flex/grid`（会改变子元素布局）
4. `float: left/right`（会脱离文档流）
5. `position: absolute/fixed`（会脱离文档流）

### Q2: BFC 有什么作用？

**答：** 四大作用：
1. **清除浮动**：包含浮动子元素，解决父元素高度塌陷
2. **阻止外边距合并**：防止相邻元素的 margin 合并
3. **阻止 margin 穿透**：防止子元素的 margin 穿透到父元素外
4. **阻止浮动覆盖**：防止元素被浮动元素覆盖

### Q3: BFC 的布局规则是什么？

**答：**
1. 内部块级元素垂直排列
2. 同一 BFC 内相邻元素的垂直 margin 会合并
3. BFC 区域不会与浮动元素重叠
4. BFC 是独立容器，内外互不影响
5. 计算 BFC 高度时，浮动元素也参与计算
### Q4: display: flow-root 和 overflow: hidden 的区别？

**答：**
- `display: flow-root`：专门用于创建 BFC，无副作用，但 IE 不支持
- `overflow: hidden`：会裁剪溢出内容，兼容性好

# Flex
 Flex 让布局从"计算"变成"描述"，代码更少、更直观、更易维护。
### Q5: Flexbox 是什么？有什么特点？

**答：** Flexbox 是 CSS3 的一维布局模型，用于在容器中排列、对齐和分配子元素空间。

特点：
- 一维布局（主轴方向）
- 灵活的空间分配（grow/shrink）
- 强大的对齐能力
- 简化了居中、等高等常见布局

### Q6: flex: 1 是什么意思？

**答：** `flex: 1` 是 `flex: 1 1 0%` 的简写：
- `flex-grow: 1` - 可以放大
- `flex-shrink: 1` - 可以缩小
- `flex-basis: 0%` - 初始大小为 0，完全由 flex-grow 决定

### Q7: position 有哪些值？各有什么特点？

**答：**

| 值 | 特点 |
|-----|------|
| static | 默认值，正常文档流 |
| relative | 相对自身原位置偏移，不脱离文档流 |
| absolute | 相对最近的定位祖先偏移，脱离文档流 |
| fixed | 相对视口偏移，脱离文档流 |
| sticky | 粘性定位，滚动到阈值时固定 |

### Q8: absolute 和 relative 的区别？

**答：**
- **relative**：相对自身原位置偏移，原位置仍占据空间
- **absolute**：相对最近的定位祖先偏移，脱离文档流，不占据空间

### Q9: 实现响应式的方法有哪些？

**答：**
1. **媒体查询**：@media
2. **弹性布局**：Flexbox、Grid
3. **相对单位**：%、vw、vh、rem、em
4. **响应式图片**：srcset、picture
5. **CSS 函数**：clamp()、min()、max()

### Q10: 媒体查询的语法？

**答：**
```css
/* 基本语法 */
@media (max-width: 768px) { }
@media (min-width: 768px) and (max-width: 1024px) { }

/* 常用断点 */
@media (max-width: 576px) { }  /* 手机 */
@media (max-width: 768px) { }  /* 平板竖屏 */
@media (max-width: 992px) { }  /* 平板横屏 */
@media (max-width: 1200px) { } /* 小桌面 */
```
### Q11: rem 和 em 的区别？

**答：**
- **rem**：相对于根元素（html）的 font-size
- **em**：相对于父元素的 font-size

```css
html { font-size: 16px; }
.parent { font-size: 20px; }
.child {
  font-size: 1.5rem; /* 24px (16 × 1.5) */
  padding: 1.5em;    /* 36px (24 × 1.5) */
}
```

### Q12: vw、vh、vmin、vmax 的区别？

**答：**
- **vw**：视口宽度的 1%
- **vh**：视口高度的 1%
- **vmin**：vw 和 vh 中较小的值
- **vmax**：vw 和 vh 中较大的值

---
### Q44: CSS 变量（自定义属性）怎么用？

**答：**
```css
:root {
  --primary-color: #007bff;
  --spacing: 16px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}

/* 带默认值 */
color: var(--text-color, #333);
```

### Q45: calc() 函数怎么用？

**答：**
```css
.element {
  width: calc(100% - 200px);
  height: calc(100vh - 60px);
  padding: calc(var(--spacing) * 2);
}
```

### Q48: transition 和 animation 的区别？

**答：**

| 特性 | transition | animation |
|------|------------|-----------|
| 触发方式 | 需要触发（hover等） | 自动执行 |
| 关键帧 | 只有开始和结束 | 可定义多个关键帧 |
| 循环 | 不支持 | 支持 |
| 控制 | 简单 | 精细控制 |

### Q49: transition 的语法？

**答：**
```css
/* transition: property duration timing-function delay */
transition: all 0.3s ease;
transition: transform 0.3s ease-in-out 0.1s;

/* 多个属性 */
transition: transform 0.3s, opacity 0.3s;
```

### Q50: animation 的语法？

**答：**
```css
/* 定义关键帧 */
@keyframes slide {
  0% { transform: translateX(0); }
  50% { transform: translateX(100px); }
  100% { transform: translateX(0); }
}

/* 使用动画 */
.element {
  animation: slide 2s ease-in-out infinite;
  /* animation: name duration timing-function delay iteration-count direction fill-mode */
}
```
### Q52: 如何实现硬件加速？
硬件加速 = 让 GPU 代替 CPU 渲染，通过 transform: translateZ(0) 或 will-change 触发，使动画更流畅。
**答：**
```css
/* 触发 GPU 加速 */
transform: translateZ(0);
transform: translate3d(0, 0, 0);
will-change: transform;
```

## 十二、CSS 预处理器

### Q53: CSS 预处理器有哪些？有什么优点？

**答：**
- **Sass/SCSS**：最流行
- **Less**：语法简单
- **Stylus**：灵活

**优点：**
1. 变量
2. 嵌套
3. 混入（Mixin）
4. 继承
5. 函数
6. 模块化

## 十三、性能优化

### Q55: CSS 性能优化有哪些方法？

**答：**
1. **选择器优化**
   - 避免过深的嵌套
   - 避免使用通配符
   - 避免使用标签选择器

2. **减少重绘重排**
   - 使用 transform 代替 top/left
   - 使用 opacity 代替 visibility
   - 批量修改样式

3. **文件优化**
   - 压缩 CSS
   - 合并文件
   - 使用 CDN

4. **加载优化**
   - 关键 CSS 内联
   - 非关键 CSS 异步加载
   - 使用 preload

### Q56: 什么是重绘和重排？

**答：**
- **重排（Reflow）**：元素的几何属性变化，需要重新计算布局
- **重绘（Repaint）**：元素的外观变化，不影响布局

**触发重排的属性：**
```
width, height, padding, margin, border
position, top, left, right, bottom
display, float, overflow
font-size, line-height
```

**只触发重绘的属性：**
```
color, background, visibility
box-shadow, outline
```

### Q57: 如何减少重排重绘？

**答：**
```css
/* 1. 使用 transform 代替位置属性 */
/* 不推荐 */
.element { top: 100px; left: 100px; }
/* 推荐 */
.element { transform: translate(100px, 100px); }

/* 2. 使用 opacity 代替 visibility */
/* 3. 批量修改样式 */
/* 4. 使用 will-change 提示浏览器 */
.element { will-change: transform; }
```

## 十四、移动端适配

### Q59: 移动端适配方案有哪些？

**答：**
1. **rem 方案**：根据屏幕宽度动态设置 html font-size
2. **vw/vh 方案**：直接使用视口单位
3. **Flexbox/Grid**：弹性布局
4. **媒体查询**：断点适配

### Q63: iOS 安全区域怎么适配？

**答：**
```css
/* 刘海屏适配 */
.footer {
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0-11.2 */
}

/* 需要设置 viewport-fit */
<meta name="viewport" content="viewport-fit=cover">
```

## PostCSS

### 1. Autoprefixer（自动添加浏览器适配前缀）

最常用的 PostCSS 插件，自动添加 CSS 浏览器前缀。

```css
/* 输入 */
.box {
  display: flex;
  user-select: none;
}

/* 输出 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

**配置 browserslist**：

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}
```

### 5. cssnano（CSS 压缩优化）

```css
/* 输入 */
.box {
  margin: 10px 10px 10px 10px;
  color: #ff0000;
  font-weight: normal;
}

/* 输出 */
.box{margin:10px;color:red;font-weight:400}
```

### 6. postcss-pxtorem（px 转 rem）

```css
/* 输入 */
.box {
  width: 750px;
  font-size: 32px;
  border: 1px solid #ccc; /* 1px 不转换 */
}

/* 输出 (rootValue: 75) */
.box {
  width: 10rem;
  font-size: 0.42667rem;
  border: 1px solid #ccc;
}
```

### 3. 移动端适配方案

```javascript
// postcss.config.js - 移动端 rem 方案
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 75, // 设计稿宽度 / 10
      propList: ['*'], // 所有属性都转换
      selectorBlackList: ['.no-rem'], // 忽略的选择器
      minPixelValue: 2 // 小于 2px 不转换
    }
  }
}
```

```javascript
// postcss.config.js - 移动端 vw 方案
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750, // 设计稿宽度
      unitPrecision: 5, // 精度
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore'],
      minPixelValue: 1,
      mediaQuery: false
    }
  }
}
```


### Q1: PostCSS 和 Sass/Less 有什么区别？

**答案要点**：
- PostCSS 是 CSS 转换工具，Sass/Less 是预处理器
- PostCSS 功能由插件决定，更灵活
- PostCSS 处理标准 CSS，Sass/Less 有自己的语法
- PostCSS 可以和 Sass/Less 配合使用
- PostCSS 性能更好（基于 JS，可并行处理）

### Q2: Autoprefixer 的工作原理是什么？

**答案要点**：
```
1. 解析 CSS 为 AST
2. 读取 browserslist 配置确定目标浏览器
3. 查询 Can I Use 数据库获取兼容性信息
4. 根据需要添加对应的浏览器前缀
5. 生成新的 CSS
```