# 微信原生小程序前端开发完整指南

## 一、小程序基础架构

### 1.1 双线程架构

微信小程序采用独特的双线程模型：

```
┌─────────────────┐     ┌─────────────────┐
│   渲染层 View    │     │   逻辑层 App    │
│   (WebView)     │ ←→  │   Service       │
│   WXML + WXSS   │     │   (JSCore)      │
└─────────────────┘     └─────────────────┘
         ↑                      ↑
         └──────── Native ──────┘
                (微信客户端)
```

**特点：**
- 渲染层：多个WebView线程，负责页面渲染
- 逻辑层：单个JSCore线程，负责业务逻辑
- 通信：通过Native层中转，使用setData进行数据传递
- 优势：逻辑与渲染分离，避免JS阻塞渲染

### 1.2 文件结构

```
miniprogram/
├── app.js              # 小程序入口逻辑
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # 搜索配置
├── pages/              # 页面目录
│   └── index/
│       ├── index.js    # 页面逻辑
│       ├── index.json  # 页面配置
│       ├── index.wxml  # 页面结构
│       └── index.wxss  # 页面样式
├── components/         # 自定义组件
├── utils/              # 工具函数
└── static/             # 静态资源
```


## 二、配置文件详解

### 2.1 app.json 全局配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "小程序",
    "backgroundColor": "#eeeeee",
    "backgroundTextStyle": "light",
    "enablePullDownRefresh": false
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1296db",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tab/home.png",
        "selectedIconPath": "static/tab/home-active.png"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false,
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序定位"
    }
  },
  "requiredPrivateInfos": [
    "getLocation",
    "chooseLocation"
  ],
  "lazyCodeLoading": "requiredComponents",
  "renderer": "skyline",
  "componentFramework": "glass-easel"
}
```

### 2.2 页面配置 page.json

```json
{
  "navigationBarTitleText": "页面标题",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "custom-component": "/components/custom/index"
  },
  "disableScroll": false,
  "backgroundColor": "#ffffff"
}
```


## 三、WXML 模板语法

### 3.1 数据绑定

```html
<!-- 基础绑定 -->
<view>{{ message }}</view>

<!-- 属性绑定 -->
<view id="item-{{id}}">属性绑定</view>

<!-- 控制属性 -->
<checkbox checked="{{isChecked}}"/>

<!-- 三元运算 -->
<view>{{ flag ? '真' : '假' }}</view>

<!-- 算术运算 -->
<view>{{ a + b }} + {{ c }} + d</view>

<!-- 字符串拼接 -->
<view>{{"hello " + name}}</view>

<!-- 对象展开 -->
<template is="objectCombine" data="{{...obj1, ...obj2, e: 5}}"/>
```

### 3.2 列表渲染

```html
<!-- 基础循环 -->
<view wx:for="{{array}}" wx:key="id">
  {{index}}: {{item.name}}
</view>

<!-- 自定义变量名 -->
<view wx:for="{{array}}" wx:for-index="idx" wx:for-item="itemName" wx:key="id">
  {{idx}}: {{itemName.name}}
</view>

<!-- 嵌套循环 -->
<view wx:for="{{[1, 2, 3]}}" wx:for-item="i" wx:key="*this">
  <view wx:for="{{['a', 'b', 'c']}}" wx:for-item="j" wx:key="*this">
    {{i}}{{j}}
  </view>
</view>

<!-- block 包装 -->
<block wx:for="{{items}}" wx:key="id">
  <view>{{item.name}}</view>
  <view>{{item.desc}}</view>
</block>
```

### 3.3 条件渲染

```html
<!-- wx:if -->
<view wx:if="{{condition}}">True</view>
<view wx:elif="{{condition2}}">Elif</view>
<view wx:else>False</view>

<!-- hidden (始终渲染，只是隐藏) -->
<view hidden="{{flag}}">Hidden Content</view>

<!-- block 条件渲染 -->
<block wx:if="{{true}}">
  <view>view1</view>
  <view>view2</view>
</block>
```

**wx:if vs hidden：**
- `wx:if`：惰性渲染，条件为假时不渲染，切换开销大
- `hidden`：始终渲染，只是显示/隐藏，初始渲染开销大
- 频繁切换用 `hidden`，运行时条件不常改变用 `wx:if`


### 3.4 模板 Template

```html
<!-- 定义模板 -->
<template name="msgItem">
  <view>
    <text>{{index}}: {{msg}}</text>
    <text>Time: {{time}}</text>
  </view>
</template>

<!-- 使用模板 -->
<template is="msgItem" data="{{...item}}"/>

<!-- 动态模板名 -->
<template is="{{templateName}}" data="{{...item}}"/>
```

### 3.5 引用

```html
<!-- import 引入模板 -->
<import src="item.wxml"/>
<template is="item" data="{{text: 'forbar'}}"/>

<!-- include 引入除 template/wxs 外的代码 -->
<include src="header.wxml"/>
<view>body</view>
<include src="footer.wxml"/>
```

### 3.6 WXS 脚本

```html
<!-- 内联 WXS -->
<wxs module="m1">
var msg = "hello world";
module.exports.message = msg;
</wxs>
<view>{{m1.message}}</view>

<!-- 外部 WXS 文件 -->
<wxs src="./utils.wxs" module="utils"/>
<view>{{utils.formatTime(timestamp)}}</view>
```

```javascript
// utils.wxs
var formatTime = function(timestamp) {
  var date = getDate(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '-' + month + '-' + day;
}
module.exports = {
  formatTime: formatTime
};
```

**WXS 特点：**
- 运行在渲染层，减少逻辑层通信
- 不能调用 JS 定义的函数
- 不能调用小程序 API
- iOS 上比 JS 快 2~20 倍，Android 上差不多


## 四、WXSS 样式

### 4.1 尺寸单位 rpx

```css
/* rpx: responsive pixel，响应式像素 */
/* 规定屏幕宽度为 750rpx */
/* iPhone6: 1rpx = 0.5px = 1物理像素 */

.container {
  width: 750rpx;      /* 满屏宽度 */
  height: 200rpx;
  font-size: 28rpx;   /* 常用字体大小 */
  padding: 20rpx;
}

/* 建议：开发时以 iPhone6 为标准设计稿 */
/* 设计稿 1px = 2rpx */
```

### 4.2 样式导入

```css
/* 使用 @import 导入外部样式 */
@import "common.wxss";

.container {
  background: #fff;
}
```

### 4.3 选择器支持

| 选择器 | 示例 | 说明 |
|--------|------|------|
| .class | .intro | 类选择器 |
| #id | #firstname | ID选择器 |
| element | view | 元素选择器 |
| element, element | view, checkbox | 并集选择器 |
| ::after | view::after | 伪元素 |
| ::before | view::before | 伪元素 |

**不支持的选择器：**
- 通配符 `*`
- 属性选择器 `[attr]`
- 后代选择器的部分写法

### 4.4 全局样式与局部样式

```css
/* app.wxss - 全局样式 */
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}

/* 页面 wxss 会覆盖 app.wxss 中相同的选择器 */
```
