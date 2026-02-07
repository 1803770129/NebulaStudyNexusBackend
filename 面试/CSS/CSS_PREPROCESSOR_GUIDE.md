# CSS 预处理器完全指南

## 一、什么是 CSS 预处理器？

CSS 预处理器是一种脚本语言，扩展了 CSS 的功能，最终编译成标准 CSS。

**主流预处理器：**
- **Sass/SCSS**：最流行，功能强大
- **Less**：语法简单，学习成本低
- **Stylus**：语法灵活，可省略括号和分号

---

## 二、核心优势

### 2.1 变量（Variables）

**原生 CSS 的问题：** 颜色、尺寸等值散落各处，修改困难

```scss
// SCSS
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-size-base: 16px;
$spacing-unit: 8px;
$border-radius: 4px;

.button {
  background: $primary-color;
  padding: $spacing-unit * 2;
  border-radius: $border-radius;
  font-size: $font-size-base;
}

.card {
  border: 1px solid $secondary-color;
  border-radius: $border-radius;
}
```

**优势：** 一处修改，全局生效；语义化命名，代码可读性强

### 2.2 嵌套（Nesting）

**原生 CSS 的问题：** 选择器重复书写，层级关系不清晰

```scss
// SCSS
.navbar {
  display: flex;
  background: #333;
  
  .nav-item {
    padding: 10px 20px;
    
    &:hover {
      background: #444;
    }
    
    &.active {
      color: #fff;
      font-weight: bold;
    }
    
    .icon {
      margin-right: 8px;
    }
  }
  
  // 媒体查询也可以嵌套
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
```

**编译后：**
```css
.navbar { display: flex; background: #333; }
.navbar .nav-item { padding: 10px 20px; }
.navbar .nav-item:hover { background: #444; }
.navbar .nav-item.active { color: #fff; font-weight: bold; }
.navbar .nav-item .icon { margin-right: 8px; }
@media (max-width: 768px) {
  .navbar { flex-direction: column; }
}
```

### 2.3 混入（Mixins）

**原生 CSS 的问题：** 重复的样式代码无法复用

```scss
// 定义 Mixin
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin button-variant($bg-color, $text-color: #fff) {
  background: $bg-color;
  color: $text-color;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: darken($bg-color, 10%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 使用 Mixin
.modal {
  @include flex-center;
  position: fixed;
  inset: 0;
}

.btn-primary {
  @include button-variant(#007bff);
}

.btn-danger {
  @include button-variant(#dc3545);
}

.btn-success {
  @include button-variant(#28a745);
}
```

### 2.4 继承（Extend）

```scss
// 定义基础样式
%button-base {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

%card-base {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

// 继承使用
.btn-primary {
  @extend %button-base;
  background: #007bff;
  color: #fff;
}

.btn-secondary {
  @extend %button-base;
  background: #6c757d;
  color: #fff;
}

.product-card {
  @extend %card-base;
}

.user-card {
  @extend %card-base;
  border: 1px solid #eee;
}
```

### 2.5 函数（Functions）

```scss
// 内置函数
$base-color: #007bff;

.element {
  color: lighten($base-color, 20%);    // 变亮
  background: darken($base-color, 10%); // 变暗
  border-color: rgba($base-color, 0.5); // 透明度
  outline-color: complement($base-color); // 互补色
}

// 自定义函数
@function px-to-rem($px, $base: 16) {
  @return ($px / $base) * 1rem;
}

@function spacing($multiplier) {
  @return $multiplier * 8px;
}

.card {
  font-size: px-to-rem(14);      // 0.875rem
  padding: spacing(2);           // 16px
  margin-bottom: spacing(3);     // 24px
}
```

### 2.6 模块化（Partials & Import）

```scss
// 文件结构
// styles/
// ├── _variables.scss
// ├── _mixins.scss
// ├── _reset.scss
// ├── _buttons.scss
// ├── _cards.scss
// ├── _navbar.scss
// └── main.scss

// _variables.scss
$primary-color: #007bff;
$font-family: 'Helvetica', sans-serif;

// _mixins.scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 767px) { @content; }
  } @else if $breakpoint == tablet {
    @media (max-width: 1023px) { @content; }
  }
}

// main.scss
@import 'variables';
@import 'mixins';
@import 'reset';
@import 'buttons';
@import 'cards';
@import 'navbar';
```

### 2.7 条件与循环

```scss
// 条件语句
@mixin theme($mode) {
  @if $mode == dark {
    background: #1a1a1a;
    color: #fff;
  } @else if $mode == light {
    background: #fff;
    color: #333;
  } @else {
    background: #f5f5f5;
    color: #666;
  }
}

.dark-theme {
  @include theme(dark);
}

// 循环 - 生成间距工具类
@for $i from 1 through 5 {
  .mt-#{$i} { margin-top: $i * 8px; }
  .mb-#{$i} { margin-bottom: $i * 8px; }
  .p-#{$i} { padding: $i * 8px; }
}

// 循环 - 生成颜色类
$colors: (
  'primary': #007bff,
  'success': #28a745,
  'danger': #dc3545,
  'warning': #ffc107
);

@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name} { background: $color; }
  .border-#{$name} { border-color: $color; }
}
```

---

## 三、实际项目应用

### 3.1 项目结构（推荐）

```
src/styles/
├── abstracts/           # 抽象层（不输出 CSS）
│   ├── _variables.scss  # 变量
│   ├── _mixins.scss     # 混入
│   ├── _functions.scss  # 函数
│   └── _index.scss      # 统一导出
├── base/                # 基础样式
│   ├── _reset.scss      # 重置样式
│   ├── _typography.scss # 排版
│   └── _index.scss
├── components/          # 组件样式
│   ├── _button.scss
│   ├── _card.scss
│   ├── _modal.scss
│   └── _index.scss
├── layout/              # 布局样式
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   └── _index.scss
├── pages/               # 页面特定样式
│   ├── _home.scss
│   ├── _about.scss
│   └── _index.scss
├── themes/              # 主题
│   ├── _light.scss
│   ├── _dark.scss
│   └── _index.scss
├── vendors/             # 第三方样式
│   └── _normalize.scss
└── main.scss            # 主入口
```

### 3.2 变量系统设计

```scss
// abstracts/_variables.scss

// ========== 颜色系统 ==========
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745,
  'danger': #dc3545,
  'warning': #ffc107,
  'info': #17a2b8,
  'light': #f8f9fa,
  'dark': #343a40
);

// 语义化颜色
$text-color: #333;
$text-muted: #6c757d;
$border-color: #dee2e6;
$background-color: #f5f5f5;

// ========== 字体系统 ==========
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'SFMono-Regular', Consolas, monospace;

$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-xl: 24px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-base: 1.5;
$line-height-tight: 1.25;

// ========== 间距系统 ==========
$spacing-unit: 8px;
$spacers: (
  0: 0,
  1: $spacing-unit,      // 8px
  2: $spacing-unit * 2,  // 16px
  3: $spacing-unit * 3,  // 24px
  4: $spacing-unit * 4,  // 32px
  5: $spacing-unit * 6,  // 48px
  6: $spacing-unit * 8   // 64px
);

// ========== 断点系统 ==========
$breakpoints: (
  'xs': 0,
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1400px
);

// ========== 其他 ==========
$border-radius: 4px;
$border-radius-lg: 8px;
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$z-index-dropdown: 1000;
$z-index-modal: 1050;
$z-index-tooltip: 1100;
```

### 3.3 Mixin 库设计

```scss
// abstracts/_mixins.scss

// ========== 布局 ==========
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin absolute-fill {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

// ========== 响应式 ==========
@mixin respond-to($breakpoint) {
  $value: map-get($breakpoints, $breakpoint);
  @if $value {
    @media (min-width: $value) {
      @content;
    }
  }
}

@mixin respond-below($breakpoint) {
  $value: map-get($breakpoints, $breakpoint);
  @if $value {
    @media (max-width: $value - 1px) {
      @content;
    }
  }
}

// ========== 文本 ==========
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin text-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ========== 交互 ==========
@mixin hover-lift {
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-lg;
  }
}

@mixin focus-ring($color: $primary-color) {
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($color, 0.25);
  }
}

// ========== 清除浮动 ==========
@mixin clearfix {
  &::after {
    content: '';
    display: block;
    clear: both;
  }
}

// ========== 隐藏 ==========
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

### 3.4 组件样式示例

```scss
// components/_button.scss
@use '../abstracts' as *;

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: map-get($spacers, 2) map-get($spacers, 3);
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  line-height: $line-height-base;
  border: 1px solid transparent;
  border-radius: $border-radius;
  cursor: pointer;
  transition: $transition-base;
  
  @include focus-ring;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  // 尺寸变体
  &--sm {
    padding: map-get($spacers, 1) map-get($spacers, 2);
    font-size: $font-size-sm;
  }
  
  &--lg {
    padding: map-get($spacers, 3) map-get($spacers, 4);
    font-size: $font-size-lg;
  }
  
  // 颜色变体
  @each $name, $color in $colors {
    &--#{$name} {
      background: $color;
      color: #fff;
      
      &:hover:not(:disabled) {
        background: darken($color, 10%);
      }
    }
    
    &--outline-#{$name} {
      background: transparent;
      color: $color;
      border-color: $color;
      
      &:hover:not(:disabled) {
        background: $color;
        color: #fff;
      }
    }
  }
}
```

### 3.5 响应式工具类生成

```scss
// 自动生成响应式间距工具类
// .mt-1, .mt-md-2, .p-lg-3 等

@each $breakpoint, $min-width in $breakpoints {
  $infix: if($breakpoint == 'xs', '', '-#{$breakpoint}');
  
  @if $min-width == 0 {
    @each $size, $value in $spacers {
      .m#{$infix}-#{$size} { margin: $value !important; }
      .mt#{$infix}-#{$size} { margin-top: $value !important; }
      .mb#{$infix}-#{$size} { margin-bottom: $value !important; }
      .p#{$infix}-#{$size} { padding: $value !important; }
      .pt#{$infix}-#{$size} { padding-top: $value !important; }
      .pb#{$infix}-#{$size} { padding-bottom: $value !important; }
    }
  } @else {
    @media (min-width: $min-width) {
      @each $size, $value in $spacers {
        .m#{$infix}-#{$size} { margin: $value !important; }
        .mt#{$infix}-#{$size} { margin-top: $value !important; }
        .mb#{$infix}-#{$size} { margin-bottom: $value !important; }
        .p#{$infix}-#{$size} { padding: $value !important; }
        .pt#{$infix}-#{$size} { padding-top: $value !important; }
        .pb#{$infix}-#{$size} { padding-bottom: $value !important; }
      }
    }
  }
}
```

### 3.6 主题切换实现

```scss
// themes/_variables.scss
$themes: (
  light: (
    bg-primary: #ffffff,
    bg-secondary: #f5f5f5,
    text-primary: #333333,
    text-secondary: #666666,
    border-color: #e0e0e0
  ),
  dark: (
    bg-primary: #1a1a1a,
    bg-secondary: #2d2d2d,
    text-primary: #ffffff,
    text-secondary: #b0b0b0,
    border-color: #404040
  )
);

// themes/_mixins.scss
@mixin themed {
  @each $theme, $map in $themes {
    [data-theme='#{$theme}'] & {
      $theme-map: $map !global;
      @content;
    }
  }
}

@function t($key) {
  @return map-get($theme-map, $key);
}

// 使用
.card {
  @include themed {
    background: t(bg-primary);
    color: t(text-primary);
    border: 1px solid t(border-color);
  }
}

// 编译后
[data-theme='light'] .card {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
}
[data-theme='dark'] .card {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #404040;
}
```

---

## 四、与构建工具集成

### 4.1 Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/abstracts/variables" as *;
          @use "@/styles/abstracts/mixins" as *;
        `
      }
    }
  }
});
```

### 4.2 Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `@import "@/styles/abstracts/_index.scss";`
            }
          }
        ]
      }
    ]
  }
};
```

---

## 五、预处理器 vs 原生 CSS

### 5.1 对比

| 特性 | 预处理器 | 原生 CSS |
|------|----------|----------|
| 变量 | ✅ 功能强大 | ✅ CSS Variables |
| 嵌套 | ✅ 支持 | ⚠️ CSS Nesting（新） |
| Mixin | ✅ 支持 | ❌ 不支持 |
| 函数 | ✅ 丰富 | ⚠️ 有限（calc等） |
| 模块化 | ✅ @import/@use | ⚠️ @import（性能差） |
| 循环 | ✅ 支持 | ❌ 不支持 |
| 编译 | 需要 | 不需要 |

### 5.2 什么时候用预处理器？

**推荐使用：**
- 大型项目，需要复杂的样式系统
- 需要生成大量工具类
- 团队协作，需要统一规范
- 需要主题切换功能

**可以不用：**
- 小型项目
- 使用 CSS-in-JS 方案
- 使用 Tailwind CSS 等原子化框架

---

## 六、总结

### 核心优势

1. **变量**：统一管理，一处修改全局生效
2. **嵌套**：层级清晰，减少重复
3. **Mixin**：代码复用，减少冗余
4. **函数**：动态计算，灵活处理
5. **模块化**：文件拆分，便于维护
6. **循环**：批量生成，提高效率

### 最佳实践

- 建立完善的变量系统（颜色、间距、断点）
- 封装常用 Mixin（布局、响应式、文本）
- 合理的文件结构（7-1 模式）
- 避免过深的嵌套（最多 3-4 层）
- 使用 @use 代替 @import（Sass）

### 记忆口诀

**"变嵌混继函，模块循环全"**
- 变：变量
- 嵌：嵌套
- 混：混入
- 继：继承
- 函：函数
- 模块：模块化
- 循环：条件与循环