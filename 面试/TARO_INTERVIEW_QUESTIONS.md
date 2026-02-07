# Taro 岗位面试问题清单

> 根据你的项目经验，结合 Taro 岗位要求，整理面试官可能问到的所有问题

---

## 一、Taro 框架相关问题

### 1.1 Taro 基础

**Q1: 什么是 Taro？为什么选择 Taro？**
```
答案要点：
- Taro 是一个开放式跨端跨框架解决方案
- 支持 React/Vue 语法开发小程序、H5、RN 等多端应用
- 一套代码多端运行，降低开发成本
- 你的优势：有原生小程序经验，可以对比说明 Taro 的优势
```

**Q2: Taro 和原生小程序开发有什么区别？**
```
答案要点（结合你的搜配云小程序经验）：

原生小程序：
- 使用 WXML/WXSS/JS
- 数据更新用 setData
- 组件用 Component 构造器
- 你做过：分包架构、自定义组件、性能优化

Taro：
- 使用 React/Vue 语法
- 数据更新用 setState/响应式
- 组件用函数组件/类组件
- 编译时转换为小程序代码

你可以说：
"我之前用原生小程序开发过搜配云项目，对小程序的底层机制比较了解，
比如双线程模型、setData 性能优化等。Taro 的优势是可以用 React 语法开发，
开发效率更高，而且可以一套代码多端运行。"
```

**Q3: Taro 的编译原理是什么？**
```
答案要点：
Taro 3.x 采用运行时方案：
1. 编译时：将 React/Vue 代码编译为小程序可识别的代码
2. 运行时：在小程序中运行一个 React/Vue 的运行时
3. 通过适配层将 React/Vue 的操作转换为小程序的操作

与 Taro 1/2 的区别：
- Taro 1/2：编译时方案，将 JSX 转换为 WXML
- Taro 3：运行时方案，更灵活，支持更多框架特性
```

**Q4: Taro 的生命周期有哪些？**
```
答案要点：

应用生命周期：
- useLaunch：小程序启动
- useDidShow：小程序显示
- useDidHide：小程序隐藏
- useError：错误捕获

页面生命周期：
- useLoad：页面加载（可获取路由参数）
- useReady：页面初次渲染完成
- useDidShow：页面显示
- useDidHide：页面隐藏
- useUnload：页面卸载
- usePullDownRefresh：下拉刷新
- useReachBottom：上拉触底

你可以结合原生小程序经验：
"这些生命周期和原生小程序的 onLoad、onShow 等是对应的，
我在搜配云小程序中用过这些生命周期处理页面数据加载和刷新。"
```

**Q5: Taro 如何实现多端适配？**
```
答案要点：

1. 条件编译：
if (process.env.TARO_ENV === 'weapp') { }
if (process.env.TARO_ENV === 'h5') { }

2. 多端文件：
index.tsx        // 通用
index.weapp.tsx  // 微信小程序
index.h5.tsx     // H5

3. API 差异处理：
封装统一的工具函数，内部根据平台调用不同 API

你可以说：
"我在企微配件查询项目中也处理过类似的多端适配问题，
比如企微和普通 H5 的 API 差异，我是通过封装工具函数来统一处理的。"
```


### 1.2 Taro 进阶

**Q6: Taro 项目如何进行性能优化？**
```
答案要点（结合你的小程序优化经验）：

1. 分包加载（你在搜配云做过）
   - 主包控制在 2MB 以内
   - 按业务模块分包
   - 配置预加载规则

2. 减少 setData 数据量（你的经验）
   - 只更新变化的数据
   - 使用路径更新：list[0].name
   - 合并多次更新

3. 图片优化
   - 使用 CDN
   - 懒加载
   - WebP 格式

4. 组件按需加载（你做过）
   - 配置 componentPlaceholder
   - 使用骨架屏

5. 长列表优化
   - 虚拟列表
   - 分页加载

你可以说：
"我在搜配云小程序中做过性能优化，主要是分包架构和组件按需加载，
还有 setData 的优化，比如只更新变化的数据，避免频繁调用。"
```

**Q7: Taro 中如何进行状态管理？**
```
答案要点：

1. useState（组件内状态）
2. useReducer（复杂状态）
3. Context（跨组件状态）
4. Redux/MobX/Zustand（全局状态）

你可以结合 DvaJS 经验：
"我之前用 DvaJS 做状态管理，它的数据流是：
组件 dispatch action → effect 处理异步 → reducer 更新 state
Taro 中可以用类似的方案，比如 Redux 或 Zustand。"
```

**Q8: Taro 如何封装请求？**
```
答案要点（结合你的请求封装经验）：

import Taro from '@tarojs/taro'

const request = async (options) => {
  const { url, method = 'GET', data, showLoading = true } = options
  
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
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
    
    if (res.statusCode === 200) {
      return res.data.data
    }
    
    if (res.statusCode === 401) {
      Taro.reLaunch({ url: '/pages/login/index' })
    }
    
    throw new Error(res.data.message)
  } finally {
    if (showLoading) {
      Taro.hideLoading()
    }
  }
}

你可以说：
"我在搜配云小程序中封装过请求模块，包括 loading 状态、token 处理、
错误处理、401 跳转登录等，Taro 的封装方式类似。"
```

**Q9: Taro 如何处理路由和传参？**
```
答案要点：

// 跳转
Taro.navigateTo({ url: '/pages/detail/index?id=123' })
Taro.redirectTo({ url: '/pages/detail/index' })
Taro.switchTab({ url: '/pages/index/index' })
Taro.navigateBack({ delta: 1 })

// 获取参数
import { useRouter } from '@tarojs/taro'

function Detail() {
  const router = useRouter()
  const { id } = router.params
}

// 复杂数据传递
// 方案1：全局状态
// 方案2：eventChannel
// 方案3：本地存储

你可以说：
"路由传参和原生小程序类似，简单数据用 URL 参数，
复杂数据可以用全局状态或本地存储。"
```

---

## 二、结合你项目经验的问题

### 2.1 搜配云小程序（原生小程序经验）

**Q10: 介绍一下你的小程序项目？**
```
回答模板：
"搜配云是一个配件查询的小程序，主要功能是配件搜索、商品展示、订单管理等。

我的职责：
1. 从零搭建项目架构，进行分包设计
2. 封装通用组件和业务组件
3. 解决 iconfont 不可用的问题
4. 性能优化：组件按需加载、setData 优化

技术亮点：
1. 分包架构：按业务模块分包，主包控制在 2MB 以内
2. 自定义组件：不用组件库，自己封装满足 UI 需求
3. 性能优化：按需加载、懒加载、setData 优化"
```

**Q11: 小程序分包是怎么做的？为什么要分包？**
```
答案要点：

为什么分包：
- 小程序主包限制 2MB
- 分包后总大小可达 20MB
- 按需加载，提升首屏速度

如何分包：
// app.json
{
  "pages": ["pages/index/index"],  // 主包
  "subpackages": [
    {
      "root": "packageA",
      "pages": ["pages/detail/index"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "packages": ["packageA"]  // 预加载
    }
  }
}

分包原则：
- 首页和 tabBar 页面放主包
- 按业务模块划分分包
- 公共资源放主包
```

**Q12: iconfont 不可用是怎么解决的？**
```
答案要点：

问题原因：
小程序不支持远程字体文件，iconfont 的 @font-face 无法使用

解决方案：
1. 使用 base64 编码的 SVG
   background-image: url("data:image/svg+xml,...")

2. 使用图片代替
   将图标导出为 PNG/SVG 图片

3. 使用小程序内置 icon 组件
   <icon type="success" size="20"/>

4. 将字体文件转为 base64 内联到 CSS 中

我选择的方案：
"我用的是 base64 SVG 方案，把常用图标转成 SVG 然后 base64 编码，
这样既保证了图标清晰度，又不需要额外的网络请求。"
```

**Q13: setData 性能优化怎么做的？**
```
答案要点：

问题：
- setData 是小程序性能瓶颈
- 数据从逻辑层传到渲染层需要序列化和通信

优化方案：
1. 减少数据量
   // 错误
   this.setData({ list: newList })
   
   // 正确：只更新变化的部分
   this.setData({ [`list[${index}].count`]: newCount })

2. 合并多次 setData
   // 错误
   this.setData({ a: 1 })
   this.setData({ b: 2 })
   
   // 正确
   this.setData({ a: 1, b: 2 })

3. 避免频繁调用
   使用节流/防抖

4. 使用自定义组件
   组件内的 setData 只影响组件自身
```

### 2.2 企微配件查询（Vue3 + 企微 API）

**Q14: 介绍一下企微项目？**
```
回答模板：
"这是一个企业微信的会话侧边栏应用，用于配件查询和推送。

主要功能：
1. 获取当前会话的客户信息
2. 配件搜索和展示
3. 将查询结果推送到会话
4. 实时消息推送（WebSocket）

我的职责：
1. 从零搭建 Vue3 项目架构
2. 对接企业微信 JS-SDK
3. 开发会话侧边栏查询模块
4. 调研企微 API 能力，解决开发中的问题

技术亮点：
1. 企微 JS-SDK 接入和封装
2. WebSocket 实时推送
3. Vue3 Composition API 组织代码"
```

**Q15: 企业微信 JS-SDK 是怎么接入的？**
```
答案要点：

接入流程：
1. 后端获取 access_token
2. 后端生成签名（timestamp、nonceStr、signature）
3. 前端调用 wx.config 配置
4. 调用 wx.agentConfig 配置应用权限
5. wx.ready 后调用具体 API

// 代码示例
wx.config({
  beta: true,
  appId: corpId,
  timestamp,
  nonceStr,
  signature,
  jsApiList: ['sendChatMessage', 'getCurExternalContact']
})

wx.agentConfig({
  corpid: corpId,
  agentid: agentId,
  timestamp,
  nonceStr,
  signature,
  jsApiList: ['sendChatMessage']
})

遇到的坑：
1. 签名 URL 必须是当前页面完整 URL
2. 需要在企微客户端内调试
3. 部分 API 需要特定权限
```

**Q16: Vue3 项目架构是怎么设计的？**
```
答案要点：

项目结构：
src/
├── api/          # 接口
├── components/   # 组件
├── composables/  # 组合式函数
├── store/        # 状态管理（Pinia）
├── utils/        # 工具函数
│   └── wework.js # 企微 API 封装
├── views/        # 页面
└── App.vue

技术选型：
- Vite 构建
- Vue3 Composition API
- Pinia 状态管理
- TypeScript

封装思路：
1. 企微 API 统一封装到 utils/wework.js
2. 请求层统一封装，处理 loading 和错误
3. 业务逻辑抽离到 composables
```

### 2.3 审核后台（UmiJS + DvaJS + Antd）

**Q17: 介绍一下审核后台项目？**
```
回答模板：
"这是一个数据管理系统，主要用于审核和管理各种业务数据，
我在这个项目上持续迭代了 4 年。

我的职责：
1. 复杂功能模块的开发
2. 封装多个通用组件（Table、上传等）
3. 功能拆分和代码重构
4. 清理废弃功能，形成管理文档

技术亮点：
1. 组件封装：二次封装 Table、图片上传等
2. 代码管理：功能拆分、废弃代码清理
3. 文档化：形成开发规范和管理文档"
```

**Q18: DvaJS 的数据流是怎样的？**
```
答案要点：

数据流：
组件 dispatch action → effect（异步）→ reducer → state → 组件更新

// model 示例
export default {
  namespace: 'user',
  state: { list: [], loading: false },
  
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  
  effects: {
    *fetchList({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } })
      const res = yield call(getList, payload)
      yield put({ type: 'save', payload: { list: res, loading: false } })
    }
  }
}

// 组件使用
const dispatch = useDispatch()
dispatch({ type: 'user/fetchList' })

与 Redux 的区别：
- Dva 内置了 redux-saga 处理异步
- 按 model 组织代码，更清晰
- 简化了 Redux 的样板代码
```

**Q19: 通用组件是怎么封装的？**
```
答案要点（以 Table 为例）：

设计思路：
1. 分析业务场景，提取共性
2. 设计合理的 props 接口
3. 提供默认值和类型检查
4. 支持扩展和自定义

// ProTable 组件
const ProTable = ({
  columns,
  request,        // 请求函数
  searchFields,   // 搜索字段
  toolBarRender,  // 工具栏
  ...restProps
}) => {
  // 内部处理：
  // 1. 搜索表单
  // 2. 分页
  // 3. 加载状态
  // 4. 暴露 reload/reset 方法
}

// 使用
<ProTable
  columns={columns}
  request={getList}
  searchFields={[
    { name: 'name', label: '姓名', render: () => <Input /> }
  ]}
/>

封装原则：
1. 单一职责
2. 接口简洁
3. 支持扩展
4. 文档完善
```


### 2.4 云店工作台（支付轮询、样式覆盖）

**Q20: 微信支付异步问题是怎么解决的？**
```
答案要点：

问题：
微信支付是异步的，前端调起支付后不知道用户是否支付成功

解决方案：递归轮询
const checkPaymentStatus = async (orderId, maxRetry = 30) => {
  let retryCount = 0
  
  const check = async () => {
    const res = await queryPaymentStatus(orderId)
    
    if (res.status === 'SUCCESS') {
      return { success: true }
    } else if (res.status === 'FAILED') {
      return { success: false, message: '支付失败' }
    } else {
      // 支付中，继续轮询
      retryCount++
      if (retryCount >= maxRetry) {
        return { success: false, message: '查询超时' }
      }
      await sleep(2000)
      return check()  // 递归调用
    }
  }
  
  return check()
}

使用流程：
1. 调用支付接口获取支付参数
2. 调起微信支付
3. 轮询查询支付结果
4. 根据结果跳转或提示
```

**Q21: 组件库样式覆盖是怎么做的？**
```
答案要点：

方案1：:global 选择器
.customTable {
  :global {
    .ant-table-thead > tr > th {
      background: #f5f5f5;
    }
  }
}

方案2：ConfigProvider 主题定制
<ConfigProvider
  theme={{
    token: { colorPrimary: '#1890ff' },
    components: {
      Table: { headerBg: '#f5f5f5' }
    }
  }}
>
  <App />
</ConfigProvider>

方案3：封装组件
const CustomButton = (props) => (
  <Button {...props} style={{ borderRadius: 4, ...props.style }} />
)

我的选择：
"根据场景选择，全局样式用 ConfigProvider，
局部样式用 :global，特殊需求封装组件。"
```

---

## 三、JavaScript 基础问题

### 3.1 必问基础

**Q22: 闭包是什么？有什么应用场景？**
```
答案要点：

定义：
函数 + 函数能访问的外部变量 = 闭包

应用场景（结合你的项目）：
1. 防抖节流（你封装过）
2. 数据私有化
3. 柯里化
4. 模块模式

// 防抖示例
function debounce(fn, delay) {
  let timer = null  // 闭包保存 timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

**Q23: this 指向问题？**
```
答案要点：

四种绑定规则：
1. 默认绑定：独立调用，指向 window
2. 隐式绑定：对象方法调用，指向对象
3. 显式绑定：call/apply/bind
4. new 绑定：指向新实例

箭头函数：
- 没有自己的 this
- 继承外层作用域的 this
- call/apply/bind 无法改变

// 你在项目中的应用
class Button {
  handleClick = () => {
    // 箭头函数，this 指向实例
    this.count++
  }
}
```

**Q24: Promise 和 async/await？**
```
答案要点：

Promise 三种状态：
- pending → fulfilled
- pending → rejected
- 状态不可逆

async/await：
- async 函数返回 Promise
- await 等待 Promise 完成
- 是 Promise 的语法糖

// 你在项目中的应用
async function fetchData() {
  try {
    const res = await request('/api/data')
    return res
  } catch (err) {
    console.error(err)
  }
}

// 并行请求
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
])
```

**Q25: 事件循环（Event Loop）？**
```
答案要点：

执行顺序：
1. 同步代码
2. 微任务（Promise.then、queueMicrotask）
3. 宏任务（setTimeout、setInterval）

// 经典题目
console.log(1)
setTimeout(() => console.log(2), 0)
Promise.resolve().then(() => console.log(3))
console.log(4)

// 输出：1, 4, 3, 2
```

### 3.2 ES6+ 特性

**Q26: let/const/var 的区别？**
```
答案要点：

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数 | 块级 | 块级 |
| 变量提升 | 是 | 否(TDZ) | 否(TDZ) |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |

// 经典问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：3, 3, 3

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：0, 1, 2
```

**Q27: 箭头函数和普通函数的区别？**
```
答案要点：

1. this：箭头函数没有自己的 this
2. arguments：箭头函数没有 arguments
3. 构造函数：箭头函数不能用 new
4. prototype：箭头函数没有 prototype

// 你在项目中的应用
const obj = {
  name: 'obj',
  // 普通函数：this 指向 obj
  fn1: function() { console.log(this.name) },
  // 箭头函数：this 指向外层
  fn2: () => { console.log(this.name) }
}
```

---

## 四、React 相关问题

### 4.1 React 基础

**Q28: React Hooks 有哪些？**
```
答案要点：

基础 Hooks：
- useState：状态
- useEffect：副作用
- useContext：上下文

额外 Hooks：
- useReducer：复杂状态
- useCallback：缓存函数
- useMemo：缓存值
- useRef：引用

// 你在项目中的应用
function UserList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await getList()
    setList(res)
    setLoading(false)
  }, [])
}
```

**Q29: useEffect 的依赖数组？**
```
答案要点：

// 每次渲染都执行
useEffect(() => { })

// 只在挂载时执行
useEffect(() => { }, [])

// 依赖变化时执行
useEffect(() => { }, [dep1, dep2])

// 清理函数
useEffect(() => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer)  // 清理
}, [])

常见问题：
1. 依赖遗漏导致闭包问题
2. 对象/数组依赖导致无限循环
3. 异步操作的清理
```

**Q30: React 性能优化？**
```
答案要点：

1. memo：避免不必要的渲染
const MemoComponent = memo(Component)

2. useMemo：缓存计算结果
const filtered = useMemo(() => list.filter(...), [list])

3. useCallback：缓存函数
const handleClick = useCallback(() => {}, [])

4. 虚拟列表：长列表优化

5. 代码分割：React.lazy + Suspense

// 你在项目中的应用
"我在审核后台中用 memo 优化列表项组件，
避免父组件更新时所有子组件都重新渲染。"
```

---

## 五、CSS 相关问题

**Q31: Flex 布局？**
```
答案要点：

容器属性：
- display: flex
- flex-direction: row | column
- justify-content: flex-start | center | space-between
- align-items: flex-start | center | stretch

项目属性：
- flex: 1（flex-grow: 1, flex-shrink: 1, flex-basis: 0%）
- align-self: 单独对齐

// 常见布局
// 水平垂直居中
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 两端对齐
.between {
  display: flex;
  justify-content: space-between;
}
```

**Q32: 移动端适配方案？**
```
答案要点：

1. rem 方案
   - 根据屏幕宽度设置根字体大小
   - 使用 postcss-pxtorem 自动转换

2. vw 方案
   - 使用 postcss-px-to-viewport
   - 1vw = 屏幕宽度的 1%

3. Taro 中的适配
   - 使用 px，自动转换为 rpx
   - 设计稿 750px 宽度

// 你在项目中的应用
"小程序中使用 rpx，设计稿 750px 宽度下 1px = 1rpx。
Taro 会自动处理单位转换。"
```

---

## 六、项目和软技能问题

**Q33: 自我介绍**
```
模板：
"面试官您好，我叫 XXX，有 X 年前端开发经验。

技术栈：
- 主要使用 React 和 Vue
- 熟悉 UmiJS、Ant Design、Vue3
- 有原生微信小程序和企业微信开发经验

项目经验：
- 做过 4 年的审核后台系统，积累了丰富的组件封装经验
- 独立开发过小程序项目，熟悉分包架构和性能优化
- 有企业微信侧边栏应用开发经验

我对 Taro 很感兴趣，因为我有小程序和 React 的经验，
相信能快速上手 Taro 开发。"
```

**Q34: 为什么选择这个岗位？**
```
答案要点：
1. 对跨端开发感兴趣
2. 有小程序和 React 经验，适合 Taro 开发
3. 想学习更多跨端技术
4. 对公司/行业感兴趣
```

**Q35: 你的优势是什么？**
```
答案要点：
1. 有原生小程序开发经验，了解底层机制
2. 组件封装能力强，有多个通用组件封装经验
3. 有企业微信开发经验，熟悉第三方 SDK 接入
4. 长期维护过大型项目，有代码管理经验
```

**Q36: 遇到过最难的技术问题？**
```
可以说的例子：

1. iconfont 不可用问题
   "小程序不支持远程字体，我调研了多种方案，
   最终选择 base64 SVG 方案解决。"

2. 微信支付异步问题
   "支付结果是异步的，我用递归轮询方案，
   设置最大重试次数和超时处理。"

3. 企微 JS-SDK 签名问题
   "签名 URL 必须是完整 URL，调试了很久才发现，
   后来封装了统一的初始化函数。"
```

**Q37: 你有什么问题想问我？**
```
可以问的问题：
1. 团队技术栈是什么？主要用 Taro 还是原生？
2. 项目主要是什么类型？ToB 还是 ToC？
3. 团队规模和协作方式？
4. 技术成长路径是怎样的？
```

---

## 七、面试前检查清单

### 技术准备
- [ ] Taro 基础：生命周期、路由、API
- [ ] Taro 进阶：性能优化、多端适配、状态管理
- [ ] 小程序基础：双线程、setData、分包
- [ ] React Hooks：useState、useEffect、useCallback
- [ ] JavaScript：闭包、this、Promise、事件循环
- [ ] CSS：Flex、移动端适配

### 项目准备
- [ ] 搜配云小程序：分包、性能优化、iconfont
- [ ] 企微配件查询：Vue3 架构、JS-SDK 接入
- [ ] 审核后台：组件封装、DvaJS 数据流
- [ ] 云店工作台：支付轮询、样式覆盖

### 软技能
- [ ] 自我介绍（1-2分钟）
- [ ] 项目介绍（每个项目 2-3 分钟）
- [ ] 离职原因
- [ ] 职业规划
- [ ] 期望薪资

---

祝面试顺利！💪
