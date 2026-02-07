# Taro 零基础教学指南

## 一、Taro 简介

### 1.1 什么是 Taro

Taro 是一个开放式跨端跨框架解决方案，支持使用 React/Vue 等框架开发微信/京东/百度/支付宝/字节跳动/QQ/飞书小程序、H5、RN 等应用。

```
一套代码 → 多端运行
         ├── 微信小程序
         ├── 支付宝小程序
         ├── 百度小程序
         ├── 字节跳动小程序
         ├── QQ 小程序
         ├── 京东小程序
         ├── H5
         └── React Native
```

### 1.2 为什么选择 Taro

| 优势 | 说明 |
|------|------|
| 多端统一 | 一套代码编译到多个平台 |
| React/Vue 语法 | 使用熟悉的框架开发 |
| 组件化开发 | 完整的组件化支持 |
| TypeScript | 完善的 TS 支持 |
| 生态丰富 | 丰富的插件和 UI 库 |
| 社区活跃 | 京东凹凸实验室维护 |

### 1.3 Taro 版本

目前主流使用 **Taro 3.x**，采用运行时方案，支持 React/Vue/Nerv 等框架。

---

## 二、环境搭建

### 2.1 安装 Node.js

确保 Node.js 版本 >= 16

```bash
# 检查版本
node -v
npm -v
```

### 2.2 安装 Taro CLI

```bash
# 使用 npm 安装
npm install -g @tarojs/cli

# 或使用 yarn
yarn global add @tarojs/cli

# 或使用 pnpm
pnpm add -g @tarojs/cli

# 检查安装
taro -v
```

### 2.3 创建项目

```bash
# 创建项目
taro init myApp

# 按提示选择：
# ? 请输入项目名称 myApp
# ? 请输入项目介绍 A Taro project
# ? 请选择框架 React
# ? 是否需要使用 TypeScript ？ Yes
# ? 请选择 CSS 预处理器 Sass
# ? 请选择包管理工具 pnpm
# ? 请选择编译工具 Webpack5
# ? 请选择模板源 Gitee（国内）
# ? 请选择模板 默认模板
```

### 2.4 项目结构

```
myApp/
├── config/                 # 编译配置
│   ├── dev.js             # 开发环境配置
│   ├── prod.js            # 生产环境配置
│   └── index.js           # 主配置文件
├── src/
│   ├── pages/             # 页面目录
│   │   └── index/
│   │       ├── index.tsx  # 页面组件
│   │       ├── index.scss # 页面样式
│   │       └── index.config.ts  # 页面配置
│   ├── app.tsx            # 入口组件
│   ├── app.scss           # 全局样式
│   ├── app.config.ts      # 全局配置
│   └── index.html         # H5 入口 HTML
├── project.config.json    # 小程序项目配置
├── package.json
└── tsconfig.json
```


### 2.5 运行项目

```bash
# 进入项目目录
cd myApp

# 安装依赖
pnpm install

# 开发模式 - 微信小程序
pnpm run dev:weapp

# 开发模式 - H5
pnpm run dev:h5

# 开发模式 - 支付宝小程序
pnpm run dev:alipay

# 生产构建
pnpm run build:weapp
pnpm run build:h5
```

### 2.6 微信开发者工具配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 导入项目，选择项目根目录
4. 关闭「ES6 转 ES5」「增强编译」「代码压缩」（Taro 已处理）

---

## 三、基础语法

### 3.1 页面组件

```tsx
// src/pages/index/index.tsx
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function Index() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }

  return (
    <View className="index">
      <Text>Hello Taro!</Text>
      <Text>Count: {count}</Text>
      <Button onClick={handleClick}>点击 +1</Button>
    </View>
  )
}
```

### 3.2 页面配置

```ts
// src/pages/index/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页',
  navigationBarBackgroundColor: '#ffffff',
  navigationBarTextStyle: 'black',
  backgroundColor: '#f5f5f5',
  enablePullDownRefresh: false
})
```

### 3.3 全局配置

```ts
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Taro App',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/user.png',
        selectedIconPath: 'assets/user-active.png'
      }
    ]
  }
})
```

### 3.4 样式写法

```scss
// src/pages/index/index.scss

// Taro 使用 px 会自动转换为 rpx
// 设计稿 750px 宽度下，1px = 1rpx
.index {
  padding: 20px;
  
  .title {
    font-size: 32px;  // 自动转换为 32rpx
    color: #333;
  }
  
  .button {
    width: 200px;
    height: 80px;
    background: #1890ff;
    border-radius: 8px;
  }
}

// 如果不想转换，使用大写 PX
.no-transform {
  border: 1PX solid #ccc;  // 保持 1px
}
```

---

## 四、内置组件

### 4.1 视图容器

```tsx
import { View, ScrollView, Swiper, SwiperItem } from '@tarojs/components'

// View - 视图容器（相当于 div）
<View className="container">内容</View>

// ScrollView - 可滚动视图
<ScrollView
  scrollY
  style={{ height: '300px' }}
  onScrollToLower={() => console.log('触底')}
>
  <View>滚动内容</View>
</ScrollView>

// Swiper - 轮播图
<Swiper
  indicatorDots
  autoplay
  interval={3000}
  circular
>
  <SwiperItem>
    <Image src="banner1.jpg" />
  </SwiperItem>
  <SwiperItem>
    <Image src="banner2.jpg" />
  </SwiperItem>
</Swiper>
```

### 4.2 基础内容

```tsx
import { Text, Icon, Progress, RichText } from '@tarojs/components'

// Text - 文本（相当于 span）
<Text>普通文本</Text>
<Text selectable>可选中文本</Text>
<Text space="nbsp">文本&nbsp;空格</Text>

// Icon - 图标
<Icon type="success" size={20} color="green" />
<Icon type="warn" size={20} />

// Progress - 进度条
<Progress percent={80} showInfo strokeWidth={3} />

// RichText - 富文本
<RichText nodes="<div style='color:red'>富文本内容</div>" />
```

### 4.3 表单组件

```tsx
import { 
  Button, Input, Textarea, Checkbox, 
  Radio, Switch, Slider, Picker, Form 
} from '@tarojs/components'

function FormDemo() {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const [date, setDate] = useState('2024-01-01')

  return (
    <View>
      {/* 按钮 */}
      <Button type="primary" onClick={() => {}}>主要按钮</Button>
      <Button type="default">默认按钮</Button>
      <Button type="warn">警告按钮</Button>
      <Button loading>加载中</Button>
      <Button disabled>禁用</Button>
      <Button size="mini">小按钮</Button>
      <Button openType="share">分享</Button>
      <Button openType="contact">客服</Button>

      {/* 输入框 */}
      <Input
        type="text"
        placeholder="请输入"
        value={value}
        onInput={e => setValue(e.detail.value)}
      />
      <Input type="number" placeholder="数字键盘" />
      <Input type="idcard" placeholder="身份证键盘" />
      <Input type="digit" placeholder="带小数点键盘" />
      <Input password placeholder="密码" />

      {/* 多行输入 */}
      <Textarea
        placeholder="请输入内容"
        maxlength={200}
        autoHeight
      />

      {/* 复选框 */}
      <Checkbox value="agree" checked={checked} onChange={e => setChecked(e.detail.value)}>
        同意协议
      </Checkbox>

      {/* 单选框 */}
      <RadioGroup onChange={e => console.log(e.detail.value)}>
        <Radio value="male">男</Radio>
        <Radio value="female">女</Radio>
      </RadioGroup>

      {/* 开关 */}
      <Switch checked onChange={e => console.log(e.detail.value)} />

      {/* 滑块 */}
      <Slider value={50} min={0} max={100} showValue />

      {/* 选择器 */}
      <Picker mode="date" value={date} onChange={e => setDate(e.detail.value)}>
        <View>选择日期: {date}</View>
      </Picker>

      <Picker mode="selector" range={['选项1', '选项2', '选项3']}>
        <View>普通选择器</View>
      </Picker>
    </View>
  )
}
```

### 4.4 媒体组件

```tsx
import { Image, Video, Camera } from '@tarojs/components'

// 图片
<Image
  src="https://example.com/image.jpg"
  mode="aspectFill"  // 缩放模式
  lazyLoad           // 懒加载
  onLoad={() => console.log('加载完成')}
  onError={() => console.log('加载失败')}
/>

// mode 可选值：
// scaleToFill - 拉伸填充
// aspectFit - 保持比例，完整显示
// aspectFill - 保持比例，裁剪填充
// widthFix - 宽度固定，高度自适应
// heightFix - 高度固定，宽度自适应

// 视频
<Video
  src="https://example.com/video.mp4"
  poster="poster.jpg"
  controls
  autoplay={false}
  loop={false}
  muted={false}
/>

// 相机（小程序）
<Camera
  devicePosition="back"
  flash="auto"
  onError={e => console.log(e)}
/>
```


---

## 五、Taro API

### 5.1 路由跳转

```tsx
import Taro from '@tarojs/taro'

// 保留当前页面，跳转到新页面
Taro.navigateTo({
  url: '/pages/detail/index?id=123'
})

// 关闭当前页面，跳转到新页面
Taro.redirectTo({
  url: '/pages/detail/index'
})

// 关闭所有页面，打开新页面
Taro.reLaunch({
  url: '/pages/index/index'
})

// 跳转到 tabBar 页面
Taro.switchTab({
  url: '/pages/user/index'
})

// 返回上一页
Taro.navigateBack({
  delta: 1  // 返回的页面数
})

// 获取路由参数
import { useRouter } from '@tarojs/taro'

function Detail() {
  const router = useRouter()
  const { id } = router.params  // 获取参数
  
  return <View>ID: {id}</View>
}
```

### 5.2 数据缓存

```tsx
import Taro from '@tarojs/taro'

// 同步存储
Taro.setStorageSync('key', 'value')
Taro.setStorageSync('user', { name: 'Tom', age: 18 })

// 同步读取
const value = Taro.getStorageSync('key')
const user = Taro.getStorageSync('user')

// 同步删除
Taro.removeStorageSync('key')

// 清空所有
Taro.clearStorageSync()

// 异步存储
await Taro.setStorage({ key: 'key', data: 'value' })

// 异步读取
const { data } = await Taro.getStorage({ key: 'key' })

// 获取存储信息
const info = Taro.getStorageInfoSync()
console.log(info.keys)        // 所有 key
console.log(info.currentSize) // 当前占用空间
console.log(info.limitSize)   // 限制大小
```

### 5.3 网络请求

```tsx
import Taro from '@tarojs/taro'

// 基本请求
const res = await Taro.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    id: 123
  },
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
})

console.log(res.data)       // 响应数据
console.log(res.statusCode) // HTTP 状态码

// POST 请求
await Taro.request({
  url: 'https://api.example.com/user',
  method: 'POST',
  data: {
    name: 'Tom',
    age: 18
  }
})

// 封装请求
const request = (options) => {
  return new Promise((resolve, reject) => {
    Taro.request({
      ...options,
      header: {
        'Content-Type': 'application/json',
        'Authorization': Taro.getStorageSync('token'),
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// 使用
const data = await request({
  url: '/api/user',
  method: 'GET'
})
```

### 5.4 界面交互

```tsx
import Taro from '@tarojs/taro'

// 显示 loading
Taro.showLoading({ title: '加载中...' })
// 隐藏 loading
Taro.hideLoading()

// 显示 toast
Taro.showToast({
  title: '操作成功',
  icon: 'success',  // success | error | loading | none
  duration: 2000
})

// 显示模态框
const { confirm } = await Taro.showModal({
  title: '提示',
  content: '确定要删除吗？',
  confirmText: '确定',
  cancelText: '取消'
})
if (confirm) {
  // 用户点击确定
}

// 显示操作菜单
const { tapIndex } = await Taro.showActionSheet({
  itemList: ['拍照', '从相册选择', '取消']
})
console.log('选择了第', tapIndex, '项')

// 设置导航栏标题
Taro.setNavigationBarTitle({ title: '新标题' })

// 设置导航栏颜色
Taro.setNavigationBarColor({
  frontColor: '#ffffff',
  backgroundColor: '#1890ff'
})

// 显示导航栏 loading
Taro.showNavigationBarLoading()
Taro.hideNavigationBarLoading()

// 页面滚动
Taro.pageScrollTo({
  scrollTop: 0,
  duration: 300
})
```

### 5.5 设备能力

```tsx
import Taro from '@tarojs/taro'

// 获取系统信息
const systemInfo = Taro.getSystemInfoSync()
console.log(systemInfo.platform)     // ios | android | devtools
console.log(systemInfo.screenWidth)  // 屏幕宽度
console.log(systemInfo.screenHeight) // 屏幕高度
console.log(systemInfo.windowWidth)  // 可用窗口宽度
console.log(systemInfo.windowHeight) // 可用窗口高度
console.log(systemInfo.statusBarHeight) // 状态栏高度
console.log(systemInfo.safeArea)     // 安全区域

// 获取网络状态
const { networkType } = await Taro.getNetworkType()
console.log(networkType)  // wifi | 2g | 3g | 4g | 5g | none

// 监听网络变化
Taro.onNetworkStatusChange((res) => {
  console.log(res.isConnected)  // 是否有网络
  console.log(res.networkType)  // 网络类型
})

// 拨打电话
Taro.makePhoneCall({ phoneNumber: '10086' })

// 扫码
const { result } = await Taro.scanCode({
  scanType: ['qrCode', 'barCode']
})
console.log(result)

// 获取剪贴板
const { data } = await Taro.getClipboardData()

// 设置剪贴板
await Taro.setClipboardData({ data: '复制的内容' })

// 震动
Taro.vibrateShort()  // 短震动
Taro.vibrateLong()   // 长震动
```

### 5.6 文件与媒体

```tsx
import Taro from '@tarojs/taro'

// 选择图片
const { tempFilePaths } = await Taro.chooseImage({
  count: 9,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera']
})
console.log(tempFilePaths)  // 图片临时路径数组

// 预览图片
Taro.previewImage({
  current: tempFilePaths[0],
  urls: tempFilePaths
})

// 保存图片到相册
await Taro.saveImageToPhotosAlbum({
  filePath: tempFilePaths[0]
})

// 上传文件
await Taro.uploadFile({
  url: 'https://api.example.com/upload',
  filePath: tempFilePaths[0],
  name: 'file',
  formData: {
    userId: '123'
  }
})

// 下载文件
const { tempFilePath } = await Taro.downloadFile({
  url: 'https://example.com/file.pdf'
})

// 选择视频
const { tempFilePath, duration, size } = await Taro.chooseVideo({
  sourceType: ['album', 'camera'],
  maxDuration: 60
})

// 录音
const recorderManager = Taro.getRecorderManager()
recorderManager.start({ duration: 60000, format: 'mp3' })
recorderManager.onStop((res) => {
  console.log(res.tempFilePath)
})
recorderManager.stop()
```


---

## 六、生命周期

### 6.1 应用生命周期

```tsx
// src/app.tsx
import { useEffect } from 'react'
import { useLaunch, useDidShow, useDidHide, useError } from '@tarojs/taro'

function App({ children }) {
  // 小程序启动时触发（全局只触发一次）
  useLaunch((options) => {
    console.log('App launched')
    console.log(options.path)   // 启动页面路径
    console.log(options.query)  // 启动参数
    console.log(options.scene)  // 场景值
  })

  // 小程序显示时触发（从后台进入前台）
  useDidShow((options) => {
    console.log('App shown')
  })

  // 小程序隐藏时触发（从前台进入后台）
  useDidHide(() => {
    console.log('App hidden')
  })

  // 小程序发生错误时触发
  useError((error) => {
    console.error('App error:', error)
  })

  return children
}

export default App
```

### 6.2 页面生命周期

```tsx
// src/pages/index/index.tsx
import { useEffect } from 'react'
import {
  useLoad,
  useReady,
  useDidShow,
  useDidHide,
  useUnload,
  usePullDownRefresh,
  useReachBottom,
  usePageScroll,
  useShareAppMessage,
  useShareTimeline
} from '@tarojs/taro'

function Index() {
  // 页面加载时触发（可获取路由参数）
  useLoad((options) => {
    console.log('Page loaded', options)
  })

  // 页面初次渲染完成时触发
  useReady(() => {
    console.log('Page ready')
  })

  // 页面显示时触发
  useDidShow(() => {
    console.log('Page shown')
  })

  // 页面隐藏时触发
  useDidHide(() => {
    console.log('Page hidden')
  })

  // 页面卸载时触发
  useUnload(() => {
    console.log('Page unloaded')
  })

  // 下拉刷新（需要在页面配置中开启 enablePullDownRefresh）
  usePullDownRefresh(async () => {
    console.log('Pull down refresh')
    await fetchData()
    Taro.stopPullDownRefresh()  // 停止下拉刷新
  })

  // 上拉触底
  useReachBottom(() => {
    console.log('Reach bottom')
    loadMore()
  })

  // 页面滚动
  usePageScroll(({ scrollTop }) => {
    console.log('Scroll top:', scrollTop)
  })

  // 分享给好友
  useShareAppMessage((res) => {
    return {
      title: '分享标题',
      path: '/pages/index/index?id=123',
      imageUrl: 'share.jpg'
    }
  })

  // 分享到朋友圈
  useShareTimeline(() => {
    return {
      title: '分享标题',
      query: 'id=123',
      imageUrl: 'share.jpg'
    }
  })

  return <View>页面内容</View>
}
```

### 6.3 生命周期执行顺序

```
应用启动：
useLaunch → useDidShow（App）→ useLoad → useDidShow（Page）→ useReady

页面切换（A → B）：
useDidHide（A）→ useLoad（B）→ useDidShow（B）→ useReady（B）

页面返回（B → A）：
useUnload（B）→ useDidShow（A）

应用切后台：
useDidHide（Page）→ useDidHide（App）

应用切前台：
useDidShow（App）→ useDidShow（Page）
```

---

## 七、状态管理

### 7.1 useState（组件内状态）

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState({ name: '', age: 0 })

  return (
    <View>
      <Text>{count}</Text>
      <Button onClick={() => setCount(count + 1)}>+1</Button>
      <Button onClick={() => setUser({ ...user, name: 'Tom' })}>
        设置用户
      </Button>
    </View>
  )
}
```

### 7.2 useReducer（复杂状态）

```tsx
import { useReducer } from 'react'

const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return initialState
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <View>
      <Text>{state.count}</Text>
      <Button onClick={() => dispatch({ type: 'increment' })}>+</Button>
      <Button onClick={() => dispatch({ type: 'decrement' })}>-</Button>
      <Button onClick={() => dispatch({ type: 'reset' })}>重置</Button>
    </View>
  )
}
```

### 7.3 Context（跨组件状态）

```tsx
// src/context/UserContext.tsx
import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (userData) => {
    setUser(userData)
    Taro.setStorageSync('user', userData)
  }

  const logout = () => {
    setUser(null)
    Taro.removeStorageSync('user')
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

// src/app.tsx
import { UserProvider } from './context/UserContext'

function App({ children }) {
  return <UserProvider>{children}</UserProvider>
}

// 使用
import { useUser } from '@/context/UserContext'

function Profile() {
  const { user, logout } = useUser()

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onClick={logout}>退出登录</Button>
    </View>
  )
}
```

### 7.4 Zustand（推荐的状态管理库）

```bash
pnpm add zustand
```

```tsx
// src/store/useStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

// Taro 存储适配器
const taroStorage = {
  getItem: (name) => Taro.getStorageSync(name) || null,
  setItem: (name, value) => Taro.setStorageSync(name, value),
  removeItem: (name) => Taro.removeStorageSync(name)
}

interface UserState {
  user: { name: string; token: string } | null
  setUser: (user: UserState['user']) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => taroStorage)
    }
  )
)

// 使用
import { useUserStore } from '@/store/useStore'

function Profile() {
  const { user, logout } = useUserStore()

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onClick={logout}>退出</Button>
    </View>
  )
}
```


---

## 八、实战案例

### 8.1 封装请求模块

```tsx
// src/utils/request.ts
import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.example.com'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = true,
    showError = true
  } = options

  // 显示 loading
  if (showLoading) {
    Taro.showLoading({ title: '加载中...' })
  }

  try {
    const token = Taro.getStorageSync('token')
    
    const res = await Taro.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      }
    })

    // 隐藏 loading
    if (showLoading) {
      Taro.hideLoading()
    }

    // 处理响应
    if (res.statusCode === 200) {
      const { code, data, message } = res.data
      
      if (code === 0) {
        return data
      }
      
      // 业务错误
      if (code === 401) {
        // token 过期，跳转登录
        Taro.removeStorageSync('token')
        Taro.reLaunch({ url: '/pages/login/index' })
      }
      
      throw new Error(message || '请求失败')
    }

    throw new Error(`HTTP Error: ${res.statusCode}`)
  } catch (error) {
    if (showLoading) {
      Taro.hideLoading()
    }
    
    if (showError) {
      Taro.showToast({
        title: error.message || '网络错误',
        icon: 'none'
      })
    }
    
    throw error
  }
}

// 快捷方法
export const get = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'GET', data })

export const post = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'POST', data })

// 使用
import { get, post } from '@/utils/request'

// 获取用户信息
const user = await get<User>('/user/info')

// 登录
const { token } = await post<{ token: string }>('/user/login', {
  username: 'admin',
  password: '123456'
})
```

### 8.2 列表页面（下拉刷新 + 上拉加载）

```tsx
// src/pages/list/index.tsx
import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'
import { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { get } from '@/utils/request'
import './index.scss'

interface Article {
  id: number
  title: string
  cover: string
  createTime: string
}

export default function List() {
  const [list, setList] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  // 获取数据
  const fetchData = async (pageNum: number, isRefresh = false) => {
    if (loading) return
    
    setLoading(true)
    
    try {
      const { list: newList, total } = await get<{
        list: Article[]
        total: number
      }>('/articles', { page: pageNum, pageSize: 10 })

      if (isRefresh) {
        setList(newList)
      } else {
        setList(prev => [...prev, ...newList])
      }

      setPage(pageNum)
      setHasMore(list.length + newList.length < total)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载
  useLoad(() => {
    fetchData(1, true)
  })

  // 下拉刷新
  usePullDownRefresh(async () => {
    await fetchData(1, true)
    Taro.stopPullDownRefresh()
  })

  // 上拉加载
  useReachBottom(() => {
    if (hasMore && !loading) {
      fetchData(page + 1)
    }
  })

  // 跳转详情
  const goDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <View className="list-page">
      {list.map(item => (
        <View 
          key={item.id} 
          className="list-item"
          onClick={() => goDetail(item.id)}
        >
          <Image className="cover" src={item.cover} mode="aspectFill" />
          <View className="content">
            <Text className="title">{item.title}</Text>
            <Text className="time">{item.createTime}</Text>
          </View>
        </View>
      ))}

      {/* 加载状态 */}
      <View className="load-status">
        {loading && <Text>加载中...</Text>}
        {!hasMore && <Text>没有更多了</Text>}
      </View>
    </View>
  )
}
```

```ts
// src/pages/list/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '文章列表',
  enablePullDownRefresh: true,
  onReachBottomDistance: 50
})
```

### 8.3 登录页面

```tsx
// src/pages/login/index.tsx
import { View, Input, Button, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { post } from '@/utils/request'
import './index.scss'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  // 发送验证码
  const sendCode = async () => {
    if (!phone || countdown > 0) return

    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    try {
      await post('/sms/send', { phone })
      Taro.showToast({ title: '验证码已发送', icon: 'success' })

      // 倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error(error)
    }
  }

  // 登录
  const handleLogin = async () => {
    if (!phone || !code) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    setLoading(true)

    try {
      const { token, user } = await post('/user/login', { phone, code })
      
      // 保存 token 和用户信息
      Taro.setStorageSync('token', token)
      Taro.setStorageSync('user', user)

      Taro.showToast({ title: '登录成功', icon: 'success' })

      // 跳转首页
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  // 微信一键登录
  const handleWxLogin = async () => {
    try {
      // 获取微信登录 code
      const { code: wxCode } = await Taro.login()
      
      // 获取用户信息
      const { userInfo } = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 发送到后端
      const { token, user } = await post('/user/wxLogin', {
        code: wxCode,
        userInfo
      })

      Taro.setStorageSync('token', token)
      Taro.setStorageSync('user', user)

      Taro.switchTab({ url: '/pages/index/index' })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View className="login-page">
      <View className="logo">
        <Text className="title">欢迎登录</Text>
      </View>

      <View className="form">
        <View className="form-item">
          <Input
            type="number"
            placeholder="请输入手机号"
            maxlength={11}
            value={phone}
            onInput={e => setPhone(e.detail.value)}
          />
        </View>

        <View className="form-item code-item">
          <Input
            type="number"
            placeholder="请输入验证码"
            maxlength={6}
            value={code}
            onInput={e => setCode(e.detail.value)}
          />
          <Button
            className="code-btn"
            disabled={countdown > 0}
            onClick={sendCode}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </Button>
        </View>

        <Button
          className="login-btn"
          type="primary"
          loading={loading}
          onClick={handleLogin}
        >
          登录
        </Button>

        <Button
          className="wx-btn"
          openType="getPhoneNumber"
          onClick={handleWxLogin}
        >
          微信一键登录
        </Button>
      </View>
    </View>
  )
}
```


---

## 九、多端适配

### 9.1 条件编译

```tsx
// 根据环境变量判断
if (process.env.TARO_ENV === 'weapp') {
  console.log('微信小程序')
} else if (process.env.TARO_ENV === 'h5') {
  console.log('H5')
} else if (process.env.TARO_ENV === 'alipay') {
  console.log('支付宝小程序')
}

// JSX 中使用
function App() {
  return (
    <View>
      {process.env.TARO_ENV === 'weapp' && (
        <Button openType="share">分享</Button>
      )}
      {process.env.TARO_ENV === 'h5' && (
        <Button onClick={shareToWeb}>分享</Button>
      )}
    </View>
  )
}

// 注释方式（编译时移除）
/*
 * #ifdef weapp
 * 微信小程序专用代码
 * #endif
 */

/*
 * #ifndef h5
 * 非 H5 平台代码
 * #endif
 */
```

### 9.2 多端文件

```
src/pages/index/
├── index.tsx        # 通用代码
├── index.weapp.tsx  # 微信小程序专用
├── index.h5.tsx     # H5 专用
├── index.scss       # 通用样式
├── index.weapp.scss # 微信小程序专用样式
└── index.h5.scss    # H5 专用样式
```

### 9.3 API 差异处理

```tsx
// src/utils/platform.ts
import Taro from '@tarojs/taro'

// 判断平台
export const isWeapp = process.env.TARO_ENV === 'weapp'
export const isH5 = process.env.TARO_ENV === 'h5'
export const isAlipay = process.env.TARO_ENV === 'alipay'

// 获取用户信息（不同平台实现不同）
export async function getUserInfo() {
  if (isWeapp) {
    // 微信小程序
    const { userInfo } = await Taro.getUserProfile({
      desc: '用于完善用户资料'
    })
    return userInfo
  } else if (isH5) {
    // H5 从本地存储获取
    return Taro.getStorageSync('userInfo')
  }
  return null
}

// 分享功能
export function share(options: { title: string; url: string }) {
  if (isWeapp) {
    // 小程序使用 useShareAppMessage
    return
  } else if (isH5) {
    // H5 使用 Web Share API 或复制链接
    if (navigator.share) {
      navigator.share({
        title: options.title,
        url: options.url
      })
    } else {
      Taro.setClipboardData({ data: options.url })
      Taro.showToast({ title: '链接已复制', icon: 'success' })
    }
  }
}

// 支付功能
export async function pay(orderInfo: any) {
  if (isWeapp) {
    // 微信支付
    await Taro.requestPayment({
      timeStamp: orderInfo.timeStamp,
      nonceStr: orderInfo.nonceStr,
      package: orderInfo.package,
      signType: orderInfo.signType,
      paySign: orderInfo.paySign
    })
  } else if (isH5) {
    // H5 跳转支付页面
    window.location.href = orderInfo.payUrl
  }
}
```

### 9.4 样式适配

```scss
// 使用 CSS 变量适配不同平台
:root {
  --safe-area-top: 0;
  --safe-area-bottom: 0;
}

// 小程序安全区域
.page {
  padding-top: var(--safe-area-top);
  padding-bottom: calc(var(--safe-area-bottom) + 20px);
}

// H5 适配
/* #ifdef h5 */
.page {
  padding-top: 44px;  // 导航栏高度
}
/* #endif */

// 响应式布局
.container {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
}
```

---

## 十、常用 UI 库

### 10.1 Taro UI

```bash
pnpm add taro-ui
```

```tsx
// 引入样式
// app.scss
@import "taro-ui/dist/style/index.scss";

// 使用组件
import { AtButton, AtInput, AtList, AtListItem } from 'taro-ui'

function Demo() {
  return (
    <View>
      <AtButton type="primary">按钮</AtButton>
      <AtInput
        name="value"
        title="标题"
        type="text"
        placeholder="请输入"
        value={value}
        onChange={setValue}
      />
      <AtList>
        <AtListItem title="标题" arrow="right" />
        <AtListItem title="标题" note="描述" />
      </AtList>
    </View>
  )
}
```

### 10.2 NutUI（京东风格）

```bash
pnpm add @nutui/nutui-react-taro
```

```tsx
// 按需引入
import { Button, Cell, Input } from '@nutui/nutui-react-taro'
import '@nutui/nutui-react-taro/dist/style.css'

function Demo() {
  return (
    <View>
      <Button type="primary">按钮</Button>
      <Cell title="标题" desc="描述" />
      <Input placeholder="请输入" />
    </View>
  )
}
```

---

## 十一、项目优化

### 11.1 分包加载

```ts
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/user/index'
  ],
  subPackages: [
    {
      root: 'packageA',
      pages: [
        'pages/detail/index',
        'pages/list/index'
      ]
    },
    {
      root: 'packageB',
      pages: [
        'pages/order/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['packageA']  // 预加载分包
    }
  }
})
```

### 11.2 图片优化

```tsx
// 使用 CDN + webp
const getImageUrl = (path: string, width = 750) => {
  return `https://cdn.example.com${path}?x-oss-process=image/resize,w_${width}/format,webp`
}

// 懒加载
<Image src={url} lazyLoad />

// 占位图
const [loaded, setLoaded] = useState(false)
<Image
  src={loaded ? realUrl : placeholderUrl}
  onLoad={() => setLoaded(true)}
/>
```

### 11.3 性能优化

```tsx
// 1. 使用 memo 避免不必要的渲染
import { memo } from 'react'

const ListItem = memo(function ListItem({ item }) {
  return <View>{item.title}</View>
})

// 2. 使用 useMemo 缓存计算结果
const filteredList = useMemo(() => {
  return list.filter(item => item.status === 'active')
}, [list])

// 3. 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // ...
}, [deps])

// 4. 虚拟列表（长列表优化）
import { VirtualList } from '@tarojs/components'

<VirtualList
  height={500}
  itemCount={list.length}
  itemSize={100}
  renderItem={({ index, style }) => (
    <View style={style}>{list[index].title}</View>
  )}
/>
```

---

## 十二、常见问题

### Q1: 样式不生效？

```scss
// 1. 检查类名是否正确
// 2. 检查选择器优先级
// 3. 小程序不支持某些 CSS 属性

// 不支持的属性：
// - * 通配符选择器
// - 属性选择器 [attr]
// - 后代选择器层级过深
```

### Q2: 页面跳转传参？

```tsx
// 传参
Taro.navigateTo({
  url: '/pages/detail/index?id=123&name=Tom'
})

// 接收
import { useRouter } from '@tarojs/taro'

function Detail() {
  const router = useRouter()
  const { id, name } = router.params
}

// 复杂数据用 eventChannel 或全局状态
```

### Q3: 小程序包体积过大？

```bash
# 1. 分包加载
# 2. 图片使用 CDN
# 3. 删除未使用的代码和依赖
# 4. 使用 tree-shaking

# 分析包体积
pnpm run build:weapp --analyzer
```

### Q4: H5 和小程序样式不一致？

```scss
// 使用条件编译
/* #ifdef h5 */
.button {
  // H5 专用样式
}
/* #endif */

/* #ifdef weapp */
.button {
  // 小程序专用样式
}
/* #endif */
```

---

## 总结

### 学习路线

1. **基础**：环境搭建 → 项目结构 → 基础语法
2. **组件**：内置组件 → UI 库 → 自定义组件
3. **API**：路由 → 存储 → 网络请求 → 设备能力
4. **进阶**：生命周期 → 状态管理 → 多端适配
5. **实战**：完整项目开发 → 性能优化 → 发布上线

### 常用资源

- [Taro 官方文档](https://docs.taro.zone/)
- [Taro UI](https://taro-ui.jd.com/)
- [NutUI](https://nutui.jd.com/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
