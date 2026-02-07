# Taro 面试知识点大全

> 针对有 React + 小程序经验的开发者

## 目录
- [一、Taro 基础概念](#一taro-基础概念)
- [二、Taro 与 React 的差异](#二taro-与-react-的差异)
- [三、Taro 与原生小程序的差异](#三taro-与原生小程序的差异)
- [四、Taro 组件与 API](#四taro-组件与-api)
- [五、Taro 路由与页面](#五taro-路由与页面)
- [六、Taro 状态管理](#六taro-状态管理)
- [七、Taro 性能优化](#七taro-性能优化)
- [八、Taro 多端适配](#八taro-多端适配)
- [九、Taro 3.x 新特性](#九taro-3x-新特性)
- [十、常见问题与解决方案](#十常见问题与解决方案)

---

## 一、Taro 基础概念

### 1.1 什么是 Taro？

**答案：**
Taro 是京东开源的多端统一开发框架，使用 React/Vue 语法编写一次代码，可编译到多个平台。

**支持的平台：**
- 微信/支付宝/百度/字节/QQ/京东小程序
- H5
- React Native
- 鸿蒙（Harmony）

**核心特点：**
- 一套代码，多端运行
- 使用 React/Vue 语法
- 完善的 TypeScript 支持
- 丰富的组件库和 API

### 1.2 Taro 的架构演进

**答案：**

| 版本 | 架构 | 特点 |
|------|------|------|
| Taro 1.x/2.x | 编译时 | 重编译，将 JSX 转换为小程序模板 |
| Taro 3.x | 运行时 | 轻编译重运行，实现了小程序的 DOM/BOM API |

**Taro 3.x 运行时架构：**
```
React/Vue 代码
    ↓
Taro Runtime（实现 DOM API）
    ↓
小程序渲染层
```

---

## 二、Taro 与 React 的差异（重点！）

### 2.1 入口文件差异

**React：**
```jsx
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
```

**Taro：**
```tsx
// app.tsx - 入口组件
import { Component } from 'react'

class App extends Component {
  // 对应小程序 app.onLaunch
  componentDidMount() {}
  
  // 对应小程序 app.onShow
  componentDidShow() {}
  
  // 对应小程序 app.onHide
  componentDidHide() {}
  
  render() {
    // this.props.children 是将要被渲染的页面
    return this.props.children
  }
}

export default App
```

```ts
// app.config.ts - 全局配置
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  window: {
    navigationBarTitleText: 'Taro App'
  }
})
```

### 2.2 生命周期差异（核心考点）

**Taro 特有的生命周期：**

| Taro 生命周期 | 对应小程序 | 说明 |
|--------------|-----------|------|
| `componentDidShow` | onShow | 页面显示/切入前台 |
| `componentDidHide` | onHide | 页面隐藏/切入后台 |
| `onPullDownRefresh` | onPullDownRefresh | 下拉刷新 |
| `onReachBottom` | onReachBottom | 上拉触底 |
| `onPageScroll` | onPageScroll | 页面滚动 |
| `onShareAppMessage` | onShareAppMessage | 分享 |
| `onShareTimeline` | onShareTimeline | 分享到朋友圈 |

**函数组件使用方式：**
```tsx
import { useDidShow, useDidHide, useReachBottom, usePullDownRefresh } from '@tarojs/taro'

function Index() {
  // 页面显示
  useDidShow(() => {
    console.log('页面显示')
  })
  
  // 页面隐藏
  useDidHide(() => {
    console.log('页面隐藏')
  })
  
  // 上拉触底
  useReachBottom(() => {
    console.log('触底加载更多')
  })
  
  // 下拉刷新
  usePullDownRefresh(() => {
    console.log('下拉刷新')
    Taro.stopPullDownRefresh()
  })
  
  return <View>Hello</View>
}
```

### 2.4 样式差异

**不支持的 CSS 特性：**
- 不支持 `*` 通配符选择器
- 不支持 `>` `+` `~` 等组合选择器（部分平台）
- 不支持 `position: fixed` 在某些场景
- 不支持 `rem`，使用 `px` 或 `rpx`

**尺寸单位：**
```scss
// Taro 默认将 px 转换为 rpx
// 设计稿 750px 宽度下，1px = 1rpx

.container {
  width: 375px;  // 编译后为 375rpx（半屏宽度）
  font-size: 28px; // 编译后为 28rpx
}

// 如果不想转换，使用大写 PX 或 Px
.container {
  border: 1PX solid #ccc; // 保持 1px 不转换
}
```
### 2.7 不支持的 React 特性

| 特性 | 支持情况 | 替代方案 |
|------|---------|---------|
| `dangerouslySetInnerHTML` | ❌ 不支持 | 使用 `RichText` 组件 |
| `React.createPortal` | ❌ 不支持 | 无 |
| `findDOMNode` | ❌ 不支持 | 使用 `createSelectorQuery` |
| `React.lazy` | ⚠️ 部分支持 | 使用分包加载 |
| `Suspense` | ⚠️ 部分支持 | - |
| `useLayoutEffect` | ⚠️ 等同于 useEffect | - |

---

## 三、Taro 与原生小程序的差异

### 3.1 组件对应关系

| 小程序组件 | Taro 组件 | 说明 |
|-----------|----------|------|
| `<view>` | `<View>` | 容器组件 |
| `<text>` | `<Text>` | 文本组件 |
| `<image>` | `<Image>` | 图片组件 |
| `<button>` | `<Button>` | 按钮组件 |
| `<input>` | `<Input>` | 输入框 |
| `<scroll-view>` | `<ScrollView>` | 滚动视图 |
| `<swiper>` | `<Swiper>` | 轮播图 |

**注意：必须从 `@tarojs/components` 导入**
```tsx
import { View, Text, Image, Button } from '@tarojs/components'
```

### 3.2 API 对应关系

```tsx
import Taro from '@tarojs/taro'

// 小程序: wx.navigateTo
Taro.navigateTo({ url: '/pages/detail/index' })

// 小程序: wx.request
Taro.request({ url: 'https://api.example.com' })

// 小程序: wx.getStorageSync
Taro.getStorageSync('key')

// 小程序: wx.showToast
Taro.showToast({ title: '成功' })
```

---

## 八、Taro 多端适配

### 8.1 条件编译

```tsx
// 根据环境变量判断
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序
} else if (process.env.TARO_ENV === 'h5') {
  // H5
} else if (process.env.TARO_ENV === 'rn') {
  // React Native
}

// 文件条件编译
// index.weapp.tsx  - 微信小程序
// index.h5.tsx     - H5
// index.tsx        - 默认

// 样式条件编译
// index.weapp.scss
// index.h5.scss
// index.scss
```

### 8.2 多端样式适配

```scss
/* 使用 CSS 变量 */
:root {
  --primary-color: #1890ff;
}

/* 条件编译样式 */
/* #ifdef weapp */
.container {
  padding-top: 44px;
}
/* #endif */

/* #ifdef h5 */
.container {
  padding-top: 0;
}
/* #endif */
```

### 8.3 API 差异处理

```tsx
// 封装多端兼容的 API
export function getLocation() {
  if (process.env.TARO_ENV === 'h5') {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
        reject
      )
    })
  } else {
    return Taro.getLocation({ type: 'gcj02' })
  }
}
```

### 8.4 组件差异处理

```tsx
// 使用条件渲染
function ShareButton() {
  if (process.env.TARO_ENV === 'weapp') {
    return <Button openType="share">分享</Button>
  }
  
  if (process.env.TARO_ENV === 'h5') {
    return <Button onClick={handleH5Share}>分享</Button>
  }
  
  return null
}
```

---

## 九、Taro 3.x 新特性

### 9.1 运行时架构

**Taro 3.x 核心变化：**
- 从编译时转换为运行时
- 实现了小程序的 DOM/BOM API
- 支持使用任意 React/Vue 生态库

```tsx
// Taro 3.x 可以使用更多 React 特性
import { Suspense, lazy } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  )
}
```

### 9.4 支持使用 HTML 标签

```tsx
// 安装 @tarojs/plugin-html 后
// 可以使用 div、span 等 HTML 标签
function App() {
  return (
    <div className="container">
      <span>Hello</span>
      <img src="xxx" />
    </div>
  )
}
```

## 十一、面试高频问题


### Q2: Taro 的跨端原理是什么？

**答案：**
- **Taro 3.x**：实现了一套精简的 DOM/BOM API（taro-runtime），React/Vue 操作这套 API，再由各端适配器转换为对应平台的操作
- 核心是 `@tarojs/runtime` 提供的虚拟 DOM 实现
- 各端通过 `@tarojs/taro-xxx` 适配器实现具体渲染


### Q4: Taro 中如何使用原生小程序组件？

**答案：**
```ts
// 在页面配置中声明
export default definePageConfig({
  usingComponents: {
    'native-component': '/components/native/index'
  }
})

// 直接使用
<native-component prop1="value" onEvent={handleEvent} />
```


---

## 十二、Taro 4.x 新特性（重点！）

### 12.1 Taro 4.x 概述

Taro 4.x 是一个重大版本更新，主要聚焦于以下几个方面：

**核心更新：**
- 支持 Vite 作为编译工具
- 支持鸿蒙（HarmonyOS）应用开发
- 编译性能大幅提升
- 更好的 TypeScript 支持


### 12.5 新增 API 和组件

**新增 Hooks：**
```tsx
import { useLoad, useUnload, useReady } from '@tarojs/taro'

function MyPage() {
  // 页面加载时触发
  useLoad((options) => {
    console.log('页面加载', options)
  })
  
  // 页面卸载时触发
  useUnload(() => {
    console.log('页面卸载')
  })
  
  // 页面初次渲染完成时触发
  useReady(() => {
    console.log('页面渲染完成')
  })
  
  return <View>Hello</View>
}
```

**增强的路由 Hooks：**
```tsx
import { useRouter } from '@tarojs/taro'

function Detail() {
  const router = useRouter()
  
  // 获取路由参数
  const { id, type } = router.params
  
  // 获取页面路径
  const path = router.path
  
  return <View>ID: {id}</View>
}
```


### 12.7 多端同构增强

**更完善的条件编译：**
```tsx
// 运行时判断
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序
} else if (process.env.TARO_ENV === 'harmony') {
  // 鸿蒙
} else if (process.env.TARO_ENV === 'h5') {
  // H5
}

// 文件条件编译（新增鸿蒙）
// index.weapp.tsx  - 微信小程序
// index.harmony.tsx - 鸿蒙
// index.h5.tsx     - H5
// index.tsx        - 默认
```

**平台特定代码：**
```tsx
// 使用 Taro 提供的平台判断
import Taro from '@tarojs/taro'

function PlatformComponent() {
  const env = Taro.getEnv()
  
  switch (env) {
    case Taro.ENV_TYPE.WEAPP:
      return <WeappComponent />
    case Taro.ENV_TYPE.HARMONY:
      return <HarmonyComponent />
    case Taro.ENV_TYPE.WEB:
      return <WebComponent />
    default:
      return <DefaultComponent />
  }
}
```

### 12.9 UI 组件库支持

**Taro 4.x 推荐的 UI 库：**

| 组件库 | 框架 | Taro 版本 | 特点 |
|--------|------|-----------|------|
| NutUI | Vue3 | Taro 3/4 | 京东风格，官方维护 |
| duxui | React | Taro 4 | 支持小程序/RN/鸿蒙/H5 |
| Taro UI | React | Taro 3/4 | 官方组件库 |
| taroify | React | Taro 3/4 | Vant 的 Taro 版本 |
