# CSS 面试题大全

## 目录

1. [盒模型](#一盒模型)
2. [选择器与优先级](#二选择器与优先级)
3. [BFC](#三bfc)
4. [布局](#四布局)
5. [定位](#五定位)
6. [浮动](#六浮动)
7. [Flexbox](#七flexbox)
8. [Grid](#八grid)
9. [响应式设计](#九响应式设计)
10. [CSS3 新特性](#十css3-新特性)
11. [动画与过渡](#十一动画与过渡)
12. [CSS 预处理器](#十二css-预处理器)
13. [性能优化](#十三性能优化)
14. [移动端适配](#十四移动端适配)
15. [其他高频问题](#十五其他高频问题)

---

## 一、盒模型

### Q1: 什么是 CSS 盒模型？

**答：** CSS 盒模型是 CSS 布局的基础，每个元素都被看作一个矩形盒子，由四部分组成：
- **Content**：内容区域
- **Padding**：内边距
- **Border**：边框
- **Margin**：外边距

### Q2: 标准盒模型和 IE 盒模型的区别？

**答：**
- **标准盒模型（content-box）**：width/height 只包含 content
  ```
  实际宽度 = width + padding + border
  ```
- **IE 盒模型（border-box）**：width/height 包含 content + padding + border
  ```
  实际宽度 = width（已包含 padding 和 border）
  ```

```css
/* 切换盒模型 */
box-sizing: content-box; /* 标准，默认 */
box-sizing: border-box;  /* IE/怪异 */
```

### Q3: 为什么推荐使用 border-box？

**答：**
1. 设置宽度更直观，设多宽就是多宽
2. `width: 100%` 不会因 padding/border 溢出
3. 响应式布局更容易计算
4. 现代框架都默认使用

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

### Q4: margin 可以为负值吗？padding 呢？

**答：**
- **margin 可以为负值**：用于元素重叠、拉近距离
- **padding 不能为负值**

### Q5: margin: auto 的原理？

**答：** 当元素有固定宽度时，`margin: auto` 会自动分配剩余空间：
- `margin: 0 auto` - 水平居中
- 在 Flexbox 中，`margin: auto` 可以实现水平垂直居中

---

## 二、选择器与优先级

### Q6: CSS 选择器有哪些？

**答：**
```css
/* 基础选择器 */
*           /* 通配符 */
div         /* 元素选择器 */
.class      /* 类选择器 */
#id         /* ID 选择器 */

/* 组合选择器 */
div p       /* 后代选择器 */
div > p     /* 子选择器 */
div + p     /* 相邻兄弟选择器 */
div ~ p     /* 通用兄弟选择器 */

/* 属性选择器 */
[attr]      /* 有该属性 */
[attr=val]  /* 属性等于 */
[attr^=val] /* 属性以...开头 */
[attr$=val] /* 属性以...结尾 */
[attr*=val] /* 属性包含... */

/* 伪类选择器 */
:hover, :active, :focus
:first-child, :last-child, :nth-child(n)
:not(), :is(), :where(), :has()

/* 伪元素选择器 */
::before, ::after
::first-line, ::first-letter
::selection, ::placeholder
```

### Q7: CSS 选择器优先级如何计算？

**答：** 优先级从高到低：

| 选择器 | 权重 |
|--------|------|
| !important | 最高 |
| 内联样式 | 1000 |
| ID 选择器 | 100 |
| 类/伪类/属性选择器 | 10 |
| 元素/伪元素选择器 | 1 |
| 通配符/组合符 | 0 |

```css
/* 计算示例 */
#nav .list li a:hover  /* 100 + 10 + 1 + 1 + 10 = 122 */
div#nav ul li.active   /* 1 + 100 + 1 + 1 + 10 = 113 */
```

### Q8: 伪类和伪元素的区别？

**答：**
- **伪类**：选择元素的特定状态（单冒号 `:`）
  ```css
  :hover, :active, :first-child, :nth-child()
  ```
- **伪元素**：创建不在 DOM 中的元素（双冒号 `::`）
  ```css
  ::before, ::after, ::first-line, ::selection
  ```

### Q9: :nth-child 和 :nth-of-type 的区别？

**答：**
```html
<div>
  <p>1</p>
  <span>2</span>
  <p>3</p>
</div>
```
```css
p:nth-child(2)    /* 不匹配，第2个子元素是 span */
p:nth-of-type(2)  /* 匹配第2个 p 元素，即 "3" */
```

---

## 三、BFC

### Q10: 什么是 BFC？

**答：** BFC（Block Formatting Context，块级格式化上下文）是一个独立的渲染区域，内部元素的布局不会影响外部元素。

### Q11: 如何创建 BFC？

**答：**
```css
display: flow-root;     /* 推荐，无副作用 */
overflow: hidden/auto;  /* 常用，但会裁剪内容 */
display: flex/grid;     /* 会改变子元素布局 */
float: left/right;      /* 脱离文档流 */
position: absolute/fixed; /* 脱离文档流 */
display: inline-block;
```

### Q12: BFC 有什么作用？

**答：**
1. **清除浮动**：包含浮动子元素，解决高度塌陷
2. **阻止外边距合并**：防止相邻元素 margin 合并
3. **阻止 margin 穿透**：防止子元素 margin 穿透到父元素外
4. **阻止浮动覆盖**：防止元素被浮动元素覆盖

### Q13: 什么是外边距合并？如何解决？

**答：** 两个垂直方向的 margin 相遇时会合并成一个，取较大值。

**解决方案：**
1. 使用 padding 代替 margin
2. 添加 border
3. 创建 BFC（`overflow: hidden` 或 `display: flow-root`）
4. 使用 Flexbox/Grid 的 gap

---

## 四、布局

### Q14: CSS 有哪些布局方式？

**答：**
1. **普通流布局**：默认布局
2. **浮动布局**：float
3. **定位布局**：position
4. **Flexbox 布局**：一维布局
5. **Grid 布局**：二维布局
6. **多列布局**：column

### Q15: 如何实现水平居中？

**答：**
```css
/* 1. 行内元素 */
.parent { text-align: center; }

/* 2. 块级元素（固定宽度） */
.child { width: 200px; margin: 0 auto; }

/* 3. Flexbox */
.parent { display: flex; justify-content: center; }

/* 4. Grid */
.parent { display: grid; justify-items: center; }

/* 5. 绝对定位 + transform */
.child {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

### Q16: 如何实现垂直居中？

**答：**
```css
/* 1. Flexbox（推荐） */
.parent {
  display: flex;
  align-items: center;
}

/* 2. Grid */
.parent {
  display: grid;
  align-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* 4. line-height（单行文本） */
.child {
  height: 50px;
  line-height: 50px;
}

/* 5. table-cell */
.parent {
  display: table-cell;
  vertical-align: middle;
}
```

### Q17: 如何实现水平垂直居中？

**答：**
```css
/* 1. Flexbox（最推荐） */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid */
.parent {
  display: grid;
  place-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + margin: auto */
.child {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  margin: auto;
  width: 100px;
  height: 100px;
}
```

### Q18: 两栏布局（左固定右自适应）怎么实现？

**答：**
```css
/* 1. Flexbox */
.container { display: flex; }
.left { flex: 0 0 200px; }
.right { flex: 1; }

/* 2. Grid */
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* 3. float + BFC */
.left { float: left; width: 200px; }
.right { overflow: hidden; } /* 创建 BFC */

/* 4. float + margin */
.left { float: left; width: 200px; }
.right { margin-left: 200px; }
```

### Q19: 三栏布局（圣杯/双飞翼）怎么实现？

**答：**
```css
/* Flexbox 实现 */
.container { display: flex; }
.left { flex: 0 0 200px; order: -1; }
.center { flex: 1; }
.right { flex: 0 0 150px; }

/* Grid 实现 */
.container {
  display: grid;
  grid-template-columns: 200px 1fr 150px;
}
```

### Q20: 如何实现等高布局？

**答：**
```css
/* 1. Flexbox（自动等高） */
.container { display: flex; }
.column { flex: 1; }

/* 2. Grid */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* 3. table 布局 */
.container { display: table; }
.column { display: table-cell; }
```

---

## 五、定位

### Q21: position 有哪些值？各有什么特点？

**答：**

| 值 | 特点 |
|-----|------|
| static | 默认值，正常文档流 |
| relative | 相对自身原位置偏移，不脱离文档流 |
| absolute | 相对最近的定位祖先偏移，脱离文档流 |
| fixed | 相对视口偏移，脱离文档流 |
| sticky | 粘性定位，滚动到阈值时固定 |

### Q22: absolute 和 relative 的区别？

**答：**
- **relative**：相对自身原位置偏移，原位置仍占据空间
- **absolute**：相对最近的定位祖先偏移，脱离文档流，不占据空间

### Q23: absolute 的定位基准是什么？

**答：** 相对于最近的 `position` 不为 `static` 的祖先元素。如果没有，则相对于初始包含块（通常是 viewport）。

### Q24: sticky 定位的原理和使用场景？

**答：**
```css
.sticky-header {
  position: sticky;
  top: 0; /* 滚动到顶部时固定 */
}
```
- 在滚动到指定阈值前表现为 relative
- 滚动到阈值后表现为 fixed
- **使用场景**：吸顶导航、表格表头固定

### Q25: z-index 什么时候生效？

**答：** 只在定位元素（position 不为 static）上生效。

**层叠上下文**：z-index 只在同一层叠上下文中比较。

---

## 六、浮动

### Q26: 浮动的特点是什么？

**答：**
1. 脱离正常文档流
2. 向左或向右浮动，直到碰到容器边缘或另一个浮动元素
3. 行内元素会环绕浮动元素
4. 父元素高度塌陷

### Q27: 如何清除浮动？

**答：**
```css
/* 1. clearfix（推荐） */
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* 2. 创建 BFC */
.parent { overflow: hidden; }
.parent { display: flow-root; }

/* 3. 额外标签 */
<div style="clear: both;"></div>
```

### Q28: 为什么要清除浮动？

**答：** 浮动元素脱离文档流，导致父元素高度塌陷，影响后续元素布局。

---

## 七、Flexbox

### Q29: Flexbox 的核心概念是什么？

**答：**
- **Flex Container**：弹性容器（display: flex）
- **Flex Item**：弹性项目（容器的直接子元素）
- **Main Axis**：主轴（默认水平）
- **Cross Axis**：交叉轴（垂直于主轴）

### Q30: Flexbox 容器属性有哪些？

**答：**
```css
flex-direction: row | column | row-reverse | column-reverse;
flex-wrap: nowrap | wrap | wrap-reverse;
justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
align-items: stretch | flex-start | flex-end | center | baseline;
align-content: stretch | flex-start | flex-end | center | space-between | space-around;
gap: 20px;
```

### Q31: Flexbox 项目属性有哪些？

**答：**
```css
order: 0;           /* 排列顺序 */
flex-grow: 0;       /* 放大比例 */
flex-shrink: 1;     /* 缩小比例 */
flex-basis: auto;   /* 初始大小 */
flex: 0 1 auto;     /* 简写 */
align-self: auto;   /* 单独对齐 */
```

### Q32: flex: 1 是什么意思？

**答：** `flex: 1` 等同于 `flex: 1 1 0%`：
- `flex-grow: 1` - 可以放大
- `flex-shrink: 1` - 可以缩小
- `flex-basis: 0%` - 初始大小为 0

效果：所有设置 `flex: 1` 的项目等比例分配空间。

### Q33: justify-content 和 align-items 的区别？

**答：**
- `justify-content`：控制**主轴**方向的对齐
- `align-items`：控制**交叉轴**方向的对齐（单行）
- `align-content`：控制**交叉轴**方向的对齐（多行）

### Q34: flex-grow 的计算方式？

**答：**
```
剩余空间 = 容器宽度 - 所有项目的 flex-basis 之和
项目增长量 = 剩余空间 × (项目的 flex-grow / 所有项目 flex-grow 之和)
```

---

## 八、Grid

### Q35: Grid 和 Flexbox 的区别？

**答：**

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部布局 | 页面整体布局 |
| 对齐 | 主轴 + 交叉轴 | 行 + 列 |

### Q36: Grid 的基本用法？

**答：**
```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: 100px auto;
  gap: 20px;
}

.item {
  grid-column: 1 / 3;  /* 跨列 */
  grid-row: 1 / 2;     /* 跨行 */
}
```

### Q37: fr 单位是什么？

**答：** `fr`（fraction）是 Grid 的弹性单位，表示剩余空间的比例。

```css
grid-template-columns: 1fr 2fr 1fr; /* 1:2:1 分配 */
grid-template-columns: 200px 1fr;   /* 固定 + 自适应 */
```

---

## 九、响应式设计

### Q38: 什么是响应式设计？

**答：** 响应式设计是指网页能够根据不同设备的屏幕尺寸自动调整布局和样式，提供最佳的用户体验。

### Q39: 实现响应式的方法有哪些？

**答：**
1. **媒体查询**：@media
2. **弹性布局**：Flexbox、Grid
3. **相对单位**：%、vw、vh、rem、em
4. **响应式图片**：srcset、picture
5. **CSS 函数**：clamp()、min()、max()

### Q40: 媒体查询的语法？

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

### Q41: rem 和 em 的区别？

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

### Q42: vw、vh、vmin、vmax 的区别？

**答：**
- **vw**：视口宽度的 1%
- **vh**：视口高度的 1%
- **vmin**：vw 和 vh 中较小的值
- **vmax**：vw 和 vh 中较大的值

---

## 十、CSS3 新特性

### Q43: CSS3 有哪些新特性？

**答：**
1. **选择器**：属性选择器、伪类（:nth-child）、伪元素
2. **盒模型**：box-sizing
3. **背景**：background-size、多背景、渐变
4. **边框**：border-radius、box-shadow、border-image
5. **文字**：text-shadow、word-wrap、@font-face
6. **颜色**：rgba、hsla
7. **布局**：Flexbox、Grid、多列布局
8. **变换**：transform（2D/3D）
9. **过渡**：transition
10. **动画**：animation、@keyframes
11. **媒体查询**：@media
12. **其他**：calc()、var()、filter

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

### Q46: CSS 渐变有哪些？

**答：**
```css
/* 线性渐变 */
background: linear-gradient(to right, red, blue);
background: linear-gradient(45deg, red, blue);

/* 径向渐变 */
background: radial-gradient(circle, red, blue);

/* 锥形渐变 */
background: conic-gradient(red, yellow, green);

/* 重复渐变 */
background: repeating-linear-gradient(45deg, red 0 10px, blue 10px 20px);
```

### Q47: filter 滤镜有哪些？

**答：**
```css
filter: blur(5px);           /* 模糊 */
filter: brightness(1.2);     /* 亮度 */
filter: contrast(1.5);       /* 对比度 */
filter: grayscale(100%);     /* 灰度 */
filter: saturate(2);         /* 饱和度 */
filter: sepia(100%);         /* 褐色 */
filter: hue-rotate(90deg);   /* 色相旋转 */
filter: invert(100%);        /* 反色 */
filter: opacity(0.5);        /* 透明度 */
filter: drop-shadow(2px 2px 5px black); /* 阴影 */
```

---

## 十一、动画与过渡

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

### Q51: transform 有哪些变换？

**答：**
```css
/* 2D 变换 */
transform: translate(10px, 20px);
transform: rotate(45deg);
transform: scale(1.5);
transform: skew(10deg, 20deg);

/* 3D 变换 */
transform: translateZ(100px);
transform: rotateX(45deg);
transform: rotateY(45deg);
transform: perspective(500px);

/* 组合 */
transform: translate(10px, 20px) rotate(45deg) scale(1.5);
```

### Q52: 如何实现硬件加速？

**答：**
```css
/* 触发 GPU 加速 */
transform: translateZ(0);
transform: translate3d(0, 0, 0);
will-change: transform;
```

---

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

### Q54: Sass 的基本语法？

**答：**
```scss
// 变量
$primary-color: #007bff;

// 嵌套
.nav {
  ul {
    li {
      a { color: $primary-color; }
    }
  }
}

// 混入
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.box { @include flex-center; }

// 继承
%button-base {
  padding: 10px 20px;
  border-radius: 4px;
}
.btn-primary { @extend %button-base; }

// 函数
@function px-to-rem($px) {
  @return $px / 16 * 1rem;
}
```

---

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

### Q58: CSS 选择器的解析顺序？

**答：** CSS 选择器从**右向左**解析。

```css
/* 浏览器先找所有 a，再向上匹配 .nav li */
.nav li a { }
```

**优化建议：**
- 避免过深的选择器
- 使用类选择器代替标签选择器

---

## 十四、移动端适配

### Q59: 移动端适配方案有哪些？

**答：**
1. **rem 方案**：根据屏幕宽度动态设置 html font-size
2. **vw/vh 方案**：直接使用视口单位
3. **Flexbox/Grid**：弹性布局
4. **媒体查询**：断点适配

### Q60: rem 适配方案怎么实现？

**答：**
```javascript
// 动态设置 html font-size
function setRem() {
  const width = document.documentElement.clientWidth;
  const fontSize = width / 750 * 100; // 设计稿 750px
  document.documentElement.style.fontSize = fontSize + 'px';
}
setRem();
window.addEventListener('resize', setRem);
```

```css
/* 使用 rem */
.element {
  width: 3.75rem; /* 375px / 100 */
  font-size: 0.28rem; /* 28px / 100 */
}
```

### Q61: 1px 边框问题怎么解决？

**答：**
```css
/* 方案1: transform 缩放 */
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

/* 方案2: 使用 0.5px（iOS 8+） */
.border {
  border: 0.5px solid #000;
}

/* 方案3: viewport 缩放 */
<meta name="viewport" content="width=device-width, initial-scale=0.5">
```

### Q62: 移动端点击 300ms 延迟怎么解决？

**答：**
1. 设置 viewport：`<meta name="viewport" content="width=device-width">`
2. CSS：`touch-action: manipulation`
3. 使用 FastClick 库

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

---

## 十五、其他高频问题

### Q64: display: none 和 visibility: hidden 的区别？

**答：**

| 特性 | display: none | visibility: hidden |
|------|---------------|-------------------|
| 空间占用 | 不占用 | 占用 |
| 子元素 | 全部隐藏 | 可单独设置 visible |
| 重排 | 触发 | 不触发 |
| 事件 | 不响应 | 不响应 |

### Q65: opacity: 0、visibility: hidden、display: none 的区别？

**答：**

| 特性 | opacity: 0 | visibility: hidden | display: none |
|------|------------|-------------------|---------------|
| 空间 | 占用 | 占用 | 不占用 |
| 事件 | 响应 | 不响应 | 不响应 |
| 继承 | 继承 | 继承（可覆盖） | 不继承 |
| 重排 | 不触发 | 不触发 | 触发 |

### Q66: link 和 @import 的区别？

**答：**

| 特性 | link | @import |
|------|------|---------|
| 加载时机 | 并行加载 | 页面加载完后加载 |
| 兼容性 | 无限制 | CSS2.1+ |
| JS 操作 | 可以 | 不可以 |
| 权重 | 相同 | 相同 |

### Q67: 如何实现单行/多行文本溢出省略？

**答：**
```css
/* 单行 */
.single-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行 */
.multi-line {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 显示行数 */
}
```

### Q68: 如何实现三角形？

**答：**
```css
.triangle {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-bottom-color: red; /* 向上的三角形 */
}

/* 向右的三角形 */
.triangle-right {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-left-color: red;
}
```

### Q69: 如何实现 0.5px 的线？

**答：**
```css
/* 方案1: transform */
.line {
  height: 1px;
  transform: scaleY(0.5);
}

/* 方案2: 渐变 */
.line {
  height: 1px;
  background: linear-gradient(to bottom, transparent 50%, #000 50%);
}
```

### Q70: CSS 如何实现主题切换？

**答：**
```css
/* 使用 CSS 变量 */
:root {
  --bg-color: #fff;
  --text-color: #333;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #fff;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 总结

### 高频考点

1. **盒模型**：标准 vs IE、box-sizing
2. **选择器优先级**：权重计算
3. **BFC**：创建方式、作用
4. **居中方案**：水平、垂直、水平垂直
5. **Flexbox**：容器属性、项目属性、flex: 1
6. **定位**：position 各值区别
7. **响应式**：媒体查询、rem/em/vw
8. **动画**：transition vs animation
9. **性能**：重绘重排、优化方法
10. **移动端**：1px 问题、安全区域

### 记忆口诀

- 盒模型：**"内填边外，标准内容，怪异全包"**
- BFC：**"清浮阻合防穿覆"**
- Flexbox 容器：**"方向换行流，主交多行齐"**
- Flexbox 项目：**"序大小基，弹自齐"**
- 优先级：**"!important > 内联 > ID > 类 > 元素"**