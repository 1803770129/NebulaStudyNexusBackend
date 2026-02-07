# 浏览器兼容性完全指南

## 一、核心知识点概览

### 1.1 需要掌握的知识体系

```
浏览器兼容性
├── CSS 兼容性
│   ├── 浏览器前缀
│   ├── CSS Reset / Normalize
│   ├── Flexbox 兼容
│   ├── Grid 兼容
│   └── 渐进增强 / 优雅降级
├── JavaScript 兼容性
│   ├── ES6+ 语法转译 (Babel)
│   ├── Polyfill
│   ├── 特性检测
│   └── API 兼容
├── HTML 兼容性
│   ├── HTML5 语义标签
│   └── 表单新特性
├── 移动端适配
│   ├── 视口设置
│   ├── 响应式布局
│   ├── 触摸事件
│   └── iOS/Android 差异
└── 工具链
    ├── Autoprefixer
    ├── Babel
    ├── PostCSS
    └── Browserslist
```

---

## 二、CSS 兼容性

### 2.1 浏览器前缀

```css
/* 不同浏览器的私有前缀 */
.box {
  -webkit-transform: rotate(45deg); /* Chrome, Safari, 新版 Opera */
  -moz-transform: rotate(45deg);    /* Firefox */
  -ms-transform: rotate(45deg);     /* IE */
  -o-transform: rotate(45deg);      /* 旧版 Opera */
  transform: rotate(45deg);         /* 标准写法放最后 */
}

/* 常见需要前缀的属性 */
.example {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
```

**推荐：使用 Autoprefixer 自动添加前缀**

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
}
```

### 2.2 CSS Reset vs Normalize.css

```css
/* CSS Reset - 清除所有默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Normalize.css - 统一默认样式（推荐） */
/* 保留有用的默认样式，修复浏览器差异 */
```

```bash
npm install normalize.css
```

```javascript
import 'normalize.css';
```

### 2.3 Flexbox 兼容性

```css
/* IE10 需要 -ms- 前缀 */
.container {
  display: -webkit-box;      /* 旧版 Safari */
  display: -ms-flexbox;      /* IE10 */
  display: -webkit-flex;     /* Safari 6.1+ */
  display: flex;
}

/* IE11 的 Flexbox bug */
.item {
  flex: 1 1 auto;  /* IE11 需要完整写法 */
  /* flex: 1; 在 IE11 可能有问题 */
}

/* IE11 不支持 gap，用 margin 替代 */
.container {
  display: flex;
  margin: -10px;
}
.item {
  margin: 10px;
}
```

### 2.4 Grid 兼容性

```css
/* IE10/11 使用旧版 Grid 语法 */
.container {
  display: -ms-grid;
  display: grid;
  
  -ms-grid-columns: 1fr 1fr 1fr;
  grid-template-columns: repeat(3, 1fr);
}

/* IE 不支持 grid-gap，需要手动设置 */
```

**建议：IE11 使用 Flexbox 替代 Grid**

### 2.5 渐进增强 vs 优雅降级

```css
/* 渐进增强：先保证基础功能，再增强体验 */
.button {
  background: #007bff;                    /* 基础样式 */
  background: linear-gradient(...);       /* 增强样式 */
}

/* 优雅降级：先实现完整功能，再处理兼容 */
.container {
  display: grid;                          /* 现代浏览器 */
}
@supports not (display: grid) {
  .container {
    display: flex;                        /* 降级方案 */
  }
}

/* @supports 特性查询 */
@supports (display: flex) {
  .container { display: flex; }
}

@supports not (gap: 20px) {
  .item { margin: 10px; }
}
```

---

## 三、JavaScript 兼容性

### 3.1 Babel 转译 ES6+

```bash
npm install @babel/core @babel/preset-env -D
```

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'ie >= 11']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};
```

### 3.2 Polyfill（垫片）

```javascript
// 手动引入 polyfill
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 或按需引入
import 'core-js/features/promise';
import 'core-js/features/array/includes';
```

**常见需要 Polyfill 的 API：**

| API | IE11 | 解决方案 |
|-----|------|----------|
| Promise | ❌ | core-js |
| fetch | ❌ | whatwg-fetch |
| Array.includes | ❌ | core-js |
| Object.assign | ❌ | core-js |
| Symbol | ❌ | core-js |
| Map/Set | ❌ | core-js |
| IntersectionObserver | ❌ | intersection-observer |
| ResizeObserver | ❌ | resize-observer-polyfill |

### 3.3 特性检测

```javascript
// 检测 API 是否存在
if ('IntersectionObserver' in window) {
  // 使用 IntersectionObserver
} else {
  // 降级方案
}

// 检测 CSS 特性
if (CSS.supports('display', 'grid')) {
  // 支持 Grid
}

// 使用 Modernizr 库
if (Modernizr.flexbox) {
  // 支持 Flexbox
}
```

### 3.4 事件兼容

```javascript
// 事件监听兼容
function addEvent(element, type, handler) {
  if (element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent) {
    element.attachEvent('on' + type, handler); // IE8
  } else {
    element['on' + type] = handler;
  }
}

// 事件对象兼容
function getEvent(e) {
  return e || window.event;
}

function getTarget(e) {
  return e.target || e.srcElement;
}

function preventDefault(e) {
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false; // IE8
  }
}

function stopPropagation(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  } else {
    e.cancelBubble = true; // IE8
  }
}
```

---

## 四、HTML 兼容性

### 4.1 HTML5 语义标签

```html
<!-- IE8 及以下不识别 HTML5 标签 -->
<!--[if lt IE 9]>
  <script src="https://cdn.jsdelivr.net/npm/html5shiv@3.7.3/dist/html5shiv.min.js"></script>
<![endif]-->
```

```javascript
// 或手动创建元素
document.createElement('header');
document.createElement('nav');
document.createElement('main');
document.createElement('article');
document.createElement('section');
document.createElement('aside');
document.createElement('footer');
```

### 4.2 表单兼容

```html
<!-- placeholder 兼容 -->
<input type="text" placeholder="请输入" id="input">

<script>
// IE9 及以下不支持 placeholder
if (!('placeholder' in document.createElement('input'))) {
  // 使用 JS 模拟
}
</script>

<!-- 日期选择器兼容 -->
<input type="date" id="date">
<!-- IE/Safari 不支持，需要使用第三方库如 flatpickr -->
```

---

## 五、移动端适配

### 5.1 视口设置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

| 属性 | 说明 |
|------|------|
| width=device-width | 视口宽度等于设备宽度 |
| initial-scale=1.0 | 初始缩放比例 |
| maximum-scale=1.0 | 最大缩放比例 |
| user-scalable=no | 禁止用户缩放 |

### 5.2 响应式布局

```css
/* 移动优先 */
.container {
  width: 100%;
  padding: 15px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}

/* 常用断点 */
/* 手机: < 768px */
/* 平板: 768px - 1023px */
/* 桌面: >= 1024px */
/* 大屏: >= 1440px */
```

### 5.3 iOS 特有问题

```css
/* 1. 点击高亮去除 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 2. 输入框样式重置 */
input, textarea {
  -webkit-appearance: none;
  border-radius: 0;
}

/* 3. 滚动流畅 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* 4. 安全区域适配（刘海屏） */
.footer {
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0-11.2 */
}

/* 5. 100vh 问题（Safari 地址栏） */
.full-height {
  height: 100vh;
  height: -webkit-fill-available;
}
```

```javascript
// 6. iOS 键盘弹出问题
window.addEventListener('resize', () => {
  if (document.activeElement.tagName === 'INPUT') {
    document.activeElement.scrollIntoView({ block: 'center' });
  }
});
```

### 5.4 Android 特有问题

```css
/* 1. 字体渲染 */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 2. 输入框样式 */
input::-webkit-input-placeholder {
  color: #999;
}

/* 3. 滚动条隐藏 */
.container::-webkit-scrollbar {
  display: none;
}
```

### 5.5 触摸事件

```javascript
// 触摸事件 vs 鼠标事件
element.addEventListener('touchstart', handleTouch);
element.addEventListener('touchmove', handleTouch);
element.addEventListener('touchend', handleTouch);

// 300ms 延迟问题
// 方案1: 使用 fastclick
import FastClick from 'fastclick';
FastClick.attach(document.body);

// 方案2: CSS touch-action
.button {
  touch-action: manipulation;
}

// 方案3: 现代浏览器已修复，设置 viewport 即可
<meta name="viewport" content="width=device-width">
```

---

## 六、工具链配置

### 6.1 Browserslist 配置

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "ie >= 11",
    "iOS >= 10",
    "Android >= 5"
  ]
}
```

```
// .browserslistrc
> 1%
last 2 versions
not dead
ie >= 11
iOS >= 10
Android >= 5
```

### 6.2 PostCSS 配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    })
  ]
};
```

### 6.3 Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  }
};
```

### 6.4 Vite 配置

```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
};
```

---

## 七、常见兼容性问题速查表

### 7.1 CSS 兼容性速查

| 特性 | Chrome | Firefox | Safari | IE11 | iOS | Android |
|------|--------|---------|--------|------|-----|---------|
| Flexbox | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Grid | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| CSS Variables | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| position: sticky | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| gap (flexbox) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| aspect-ratio | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| :has() | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

### 7.2 JavaScript 兼容性速查

| 特性 | Chrome | Firefox | Safari | IE11 | 解决方案 |
|------|--------|---------|--------|------|----------|
| Promise | ✅ | ✅ | ✅ | ❌ | core-js |
| async/await | ✅ | ✅ | ✅ | ❌ | Babel |
| fetch | ✅ | ✅ | ✅ | ❌ | whatwg-fetch |
| ES6 Modules | ✅ | ✅ | ✅ | ❌ | Webpack/Vite |
| Arrow Functions | ✅ | ✅ | ✅ | ❌ | Babel |
| Template Literals | ✅ | ✅ | ✅ | ❌ | Babel |
| Spread Operator | ✅ | ✅ | ✅ | ❌ | Babel |
| IntersectionObserver | ✅ | ✅ | ✅ | ❌ | Polyfill |

### 7.3 IE11 特殊处理

```css
/* IE11 专用样式 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .ie-only {
    /* IE10/11 专用样式 */
  }
}

/* 或使用 IE 条件注释（仅 IE9 及以下） */
<!--[if IE]>
  <link rel="stylesheet" href="ie.css">
<![endif]-->
```

```javascript
// 检测 IE11
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

if (isIE11) {
  document.body.classList.add('is-ie11');
}
```

---

## 八、调试与测试

### 8.1 浏览器开发者工具

- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- IE11 F12 开发者工具

### 8.2 跨浏览器测试工具

| 工具 | 说明 |
|------|------|
| BrowserStack | 云端真机测试 |
| Sauce Labs | 自动化测试平台 |
| LambdaTest | 跨浏览器测试 |
| Can I Use | 查询特性兼容性 |

### 8.3 移动端调试

```javascript
// 使用 vConsole 调试移动端
import VConsole from 'vconsole';
new VConsole();

// 或使用 eruda
import eruda from 'eruda';
eruda.init();
```

---

## 九、面试常见问题

### Q1: 如何处理浏览器兼容性问题？

**答：**
1. **CSS**：使用 Autoprefixer 自动添加前缀，Normalize.css 统一样式
2. **JS**：使用 Babel 转译 ES6+，按需引入 Polyfill
3. **特性检测**：使用 @supports 或 JS 检测，提供降级方案
4. **工具**：配置 Browserslist 指定目标浏览器

### Q2: 如何解决移动端 1px 边框问题？

**答：**
```css
/* 方案1: transform 缩放 */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #000;
  transform: scaleY(0.5);
}

/* 方案2: viewport 缩放 */
<meta name="viewport" content="width=device-width, initial-scale=0.5">
```

### Q3: 如何解决移动端点击 300ms 延迟？

**答：**
1. 设置 `<meta name="viewport" content="width=device-width">`
2. 使用 `touch-action: manipulation`
3. 使用 FastClick 库（旧方案）

### Q4: CSS 变量在 IE11 怎么处理？

**答：**
```css
/* 提供降级值 */
.element {
  color: #007bff;           /* IE11 降级 */
  color: var(--primary);    /* 现代浏览器 */
}

/* 或使用 PostCSS 插件转换 */
```

---

## 十、总结

### 核心知识点

1. **CSS**：前缀、Reset/Normalize、@supports、渐进增强
2. **JS**：Babel、Polyfill、特性检测
3. **移动端**：viewport、响应式、iOS/Android 差异、触摸事件
4. **工具**：Browserslist、Autoprefixer、PostCSS

### 最佳实践

```javascript
// 1. 配置 Browserslist
// package.json
"browserslist": ["> 1%", "last 2 versions", "ie >= 11"]

// 2. 使用 Autoprefixer
// postcss.config.js
plugins: [require('autoprefixer')]

// 3. 配置 Babel
// babel.config.js
presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]]

// 4. 引入 Normalize.css
import 'normalize.css';
```

### 记忆口诀

**"前缀转译填，检测降级先"**

- 前缀：Autoprefixer 自动加前缀
- 转译：Babel 转译 ES6+
- 填：Polyfill 填补 API
- 检测：特性检测
- 降级：优雅降级方案