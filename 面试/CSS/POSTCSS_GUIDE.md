# PostCSS 完全指南

## 一、PostCSS 是什么？

PostCSS 是一个用 JavaScript 转换 CSS 的工具。它本身只是一个平台，真正的功能由插件提供。

```
CSS 源码 → PostCSS 解析 → AST → 插件处理 → 生成新 CSS
```

### 核心特点

1. **不是预处理器**：不像 Sass/Less，PostCSS 本身不提供语法
2. **插件化架构**：功能完全由插件决定
3. **基于 AST**：将 CSS 解析为抽象语法树进行处理
4. **高性能**：比传统预处理器更快

### 与 Sass/Less 的区别

| 特性 | PostCSS | Sass/Less |
|------|---------|-----------|
| 定位 | CSS 转换工具 | CSS 预处理器 |
| 语法 | 标准 CSS + 插件扩展 | 自定义语法 |
| 功能 | 插件决定 | 内置功能 |
| 扩展性 | 极高 | 有限 |
| 性能 | 更快 | 较慢 |

---

## 二、核心插件详解

### 1. Autoprefixer（自动添加浏览器前缀）

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

### 2. postcss-preset-env（使用未来 CSS 特性）

让你使用最新的 CSS 特性，自动转换为兼容代码。

```css
/* 输入 - 使用 CSS 变量和嵌套 */
:root {
  --primary: #3498db;
}

.card {
  background: var(--primary);
  
  & .title {
    color: white;
  }
  
  &:hover {
    background: color-mix(in srgb, var(--primary) 80%, black);
  }
}

/* 输出 */
:root {
  --primary: #3498db;
}

.card {
  background: #3498db;
  background: var(--primary);
}

.card .title {
  color: white;
}

.card:hover {
  background: rgba(41, 121, 175, 1);
}
```

### 3. postcss-import（合并 CSS 文件）

```css
/* main.css */
@import 'normalize.css';
@import 'components/button.css';
@import 'components/card.css';

/* 输出：所有文件内容合并到一个文件 */
```

### 4. postcss-nested（CSS 嵌套语法）

```css
/* 输入 */
.parent {
  color: red;
  
  .child {
    color: blue;
  }
  
  &:hover {
    color: green;
  }
  
  &-modifier {
    color: yellow;
  }
}

/* 输出 */
.parent {
  color: red;
}
.parent .child {
  color: blue;
}
.parent:hover {
  color: green;
}
.parent-modifier {
  color: yellow;
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

---

## 三、项目实战配置

### 1. Vite 项目配置

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true
      }
    },
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {} : false
  }
}
```

### 2. Webpack 项目配置

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-import'),
                  require('postcss-preset-env')({
                    stage: 2
                  }),
                  require('autoprefixer'),
                  require('cssnano')
                ]
              }
            }
          }
        ]
      }
    ]
  }
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

---

## 四、自定义 PostCSS 插件

### 插件基本结构

```javascript
// my-postcss-plugin.js
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'my-postcss-plugin',
    
    // 处理整个 CSS 文件
    Once(root, { result }) {
      // root 是 CSS AST 的根节点
    },
    
    // 处理每个规则
    Rule(rule) {
      // rule.selector - 选择器
      // rule.nodes - 声明列表
    },
    
    // 处理每个声明
    Declaration(decl) {
      // decl.prop - 属性名
      // decl.value - 属性值
    },
    
    // 处理 @规则
    AtRule(atRule) {
      // atRule.name - @规则名称
      // atRule.params - 参数
    }
  }
}

module.exports.postcss = true
```

### 实战：自动添加 CSS 变量回退

```javascript
// postcss-css-var-fallback.js
module.exports = (opts = {}) => {
  const fallbacks = opts.fallbacks || {}
  
  return {
    postcssPlugin: 'postcss-css-var-fallback',
    
    Declaration(decl) {
      // 检查是否包含 CSS 变量
      if (decl.value.includes('var(')) {
        const varMatch = decl.value.match(/var\(--([^,)]+)\)/)
        
        if (varMatch) {
          const varName = varMatch[1]
          const fallback = fallbacks[varName]
          
          if (fallback) {
            // 在当前声明前插入回退值
            decl.cloneBefore({
              value: fallback
            })
          }
        }
      }
    }
  }
}

module.exports.postcss = true

// 使用
// postcss.config.js
module.exports = {
  plugins: {
    './postcss-css-var-fallback': {
      fallbacks: {
        'primary-color': '#3498db',
        'font-size-base': '16px'
      }
    }
  }
}
```

### 实战：移除特定注释

```javascript
// postcss-remove-comments.js
module.exports = (opts = {}) => {
  const pattern = opts.pattern || /^!/  // 默认移除 /*! */ 注释
  
  return {
    postcssPlugin: 'postcss-remove-comments',
    
    Comment(comment) {
      if (pattern.test(comment.text)) {
        comment.remove()
      }
    }
  }
}

module.exports.postcss = true
```

---

## 五、PostCSS AST 结构

```javascript
// CSS 源码
/*
.box {
  color: red;
}
*/

// AST 结构
{
  type: 'root',
  nodes: [
    {
      type: 'rule',
      selector: '.box',
      nodes: [
        {
          type: 'decl',
          prop: 'color',
          value: 'red'
        }
      ]
    }
  ]
}
```

### 常用 AST 节点类型

| 类型 | 说明 | 示例 |
|------|------|------|
| root | 根节点 | 整个 CSS 文件 |
| rule | 规则 | `.box { }` |
| decl | 声明 | `color: red` |
| atrule | @规则 | `@media`, `@import` |
| comment | 注释 | `/* comment */` |

### AST 操作方法

```javascript
// 遍历
root.walk(node => { })           // 遍历所有节点
root.walkRules(rule => { })      // 遍历规则
root.walkDecls(decl => { })      // 遍历声明
root.walkAtRules(atRule => { })  // 遍历 @规则

// 修改
decl.value = 'blue'              // 修改值
decl.remove()                    // 删除节点
decl.cloneBefore({ value: 'x' }) // 在前面克隆
decl.cloneAfter({ value: 'x' })  // 在后面克隆

// 创建
const { Rule, Declaration } = require('postcss')
const newRule = new Rule({ selector: '.new' })
const newDecl = new Declaration({ prop: 'color', value: 'red' })
newRule.append(newDecl)
root.append(newRule)
```

---

## 六、面试高频题

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

### Q3: 如何实现移动端适配？

**答案要点**：

```javascript
// 方案一：rem 适配
// 1. 设置根字体大小（通常用 JS 动态计算）
document.documentElement.style.fontSize = 
  document.documentElement.clientWidth / 10 + 'px'

// 2. PostCSS 自动转换 px 为 rem
// postcss-pxtorem 配置
{
  rootValue: 75,  // 750 设计稿 / 10
  propList: ['*']
}

// 方案二：vw 适配
// postcss-px-to-viewport 配置
{
  viewportWidth: 750,
  viewportUnit: 'vw'
}
```

### Q4: PostCSS 插件的执行顺序是怎样的？

**答案要点**：
- 插件按配置数组顺序执行
- 推荐顺序：`import → 预处理 → preset-env → autoprefixer → 压缩`

```javascript
plugins: [
  'postcss-import',      // 1. 先合并文件
  'postcss-nested',      // 2. 处理嵌套
  'postcss-preset-env',  // 3. 转换新特性
  'autoprefixer',        // 4. 添加前缀
  'cssnano'              // 5. 最后压缩
]
```

### Q5: 如何编写一个 PostCSS 插件？

**答案要点**：

```javascript
module.exports = (options = {}) => {
  return {
    postcssPlugin: 'plugin-name',
    
    // 钩子函数
    Once(root) { },        // 处理整个文件
    Rule(rule) { },        // 处理规则
    Declaration(decl) { }, // 处理声明
    AtRule(atRule) { }     // 处理 @规则
  }
}
module.exports.postcss = true
```

### Q6: postcss-preset-env 的 stage 是什么意思？

**答案要点**：

| Stage | 说明 | 稳定性 |
|-------|------|--------|
| 0 | 草案 | 最不稳定 |
| 1 | 实验性 | 不稳定 |
| 2 | 草案（默认） | 较稳定 |
| 3 | 候选 | 稳定 |
| 4 | 标准 | 已标准化 |

```javascript
// 推荐使用 stage 2 或 3
{
  'postcss-preset-env': {
    stage: 2,
    features: {
      'nesting-rules': true  // 可单独开启特定功能
    }
  }
}
```

### Q7: CSS Modules 和 PostCSS 的关系？

**答案要点**：
- CSS Modules 是一种 CSS 模块化方案
- 可以通过 `postcss-modules` 插件实现
- 自动生成唯一类名，避免样式冲突

```javascript
// postcss-modules 配置
{
  'postcss-modules': {
    generateScopedName: '[name]__[local]___[hash:base64:5]'
  }
}

// 输入
.button { color: red; }

// 输出
.Button_button___2Kf3x { color: red; }
```

### Q8: 如何调试 PostCSS 插件？

**答案要点**：

```javascript
// 1. 使用 source map
{
  map: { inline: true }
}

// 2. 打印 AST
Declaration(decl) {
  console.log(decl.toString())
  console.log(decl.parent.selector)
}

// 3. 使用 postcss-reporter 插件
{
  'postcss-reporter': {
    clearReportedMessages: true
  }
}
```

---

## 七、最佳实践

### 1. 推荐的插件组合

```javascript
// 通用项目
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': { stage: 2 },
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {} : false
  }
}
```

### 2. 性能优化建议

- 只在生产环境使用 cssnano
- 合理配置 browserslist，避免生成过多前缀
- 使用 postcss-import 合并文件减少请求

### 3. 与其他工具配合

```javascript
// Sass + PostCSS
// 先用 sass-loader 处理，再用 postcss-loader
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
}
```

---

## 八、常见问题排查

### 问题 1：Autoprefixer 不生效

```javascript
// 检查 browserslist 配置
// package.json
{
  "browserslist": ["> 1%", "last 2 versions"]
}

// 或 .browserslistrc 文件
> 1%
last 2 versions
```

### 问题 2：插件顺序导致的问题

```javascript
// 错误：先压缩再添加前缀
plugins: ['cssnano', 'autoprefixer']

// 正确：先添加前缀再压缩
plugins: ['autoprefixer', 'cssnano']
```

### 问题 3：Source Map 不正确

```javascript
// postcss.config.js
module.exports = {
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true
  },
  plugins: { ... }
}
```
