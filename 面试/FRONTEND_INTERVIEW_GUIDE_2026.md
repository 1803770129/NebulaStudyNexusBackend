# 🚀 2026年前端工程师大厂面试一周高强度准备指南

> 目标：一周时间，系统性准备前端面试，冲击大厂 Offer！
> 
> 适用人群：有 1-5 年经验的前端工程师
> 
> 更新时间：2026年1月

---

## 📋 目录

- [一周学习计划总览](#一周学习计划总览)
- [Day 1: JavaScript 核心 + TypeScript](#day-1-javascript-核心--typescript)
- [Day 2: HTML/CSS + 浏览器原理 + 网络](#day-2-htmlcss--浏览器原理--网络)
- [Day 3: 前端框架（Vue + React）](#day-3-前端框架vue--react)
- [Day 4: 前端构建 + 工程化](#day-4-前端构建--工程化)
- [Day 5: 前端架构 + 性能优化 + 安全](#day-5-前端架构--性能优化--安全)
- [Day 6: 跨端开发 + Node.js 全栈](#day-6-跨端开发--nodejs-全栈)
- [Day 7: Web3D + AI前端 + 综合复习](#day-7-web3d--ai前端--综合复习)
- [算法刷题指南](#算法刷题指南)
- [系统设计题准备](#系统设计题准备)
- [软技能与项目准备](#软技能与项目准备)
- [2026年新趋势](#2026年新趋势)
- [高频面试题清单](#高频面试题清单)
- [学习资源推荐](#学习资源推荐)

---

## 一周学习计划总览

| 日期 | 主题 | 学习时长 | 重点内容 |
|------|------|----------|----------|
| Day 1 | JavaScript + TypeScript | 10-12h | JS核心原理、ES6+、TS类型体操 |
| Day 2 | HTML/CSS + 浏览器 + 网络 | 10-12h | 渲染原理、性能、HTTP协议 |
| Day 3 | Vue + React 框架 | 10-12h | 响应式原理、Hooks、Diff算法 |
| Day 4 | 构建工具 + 工程化 | 10-12h | Webpack、Vite、Monorepo |
| Day 5 | 架构 + 性能 + 安全 | 10-12h | 微前端、性能优化、XSS/CSRF |
| Day 6 | 跨端 + Node.js | 10-12h | 小程序、RN、SSR、BFF |
| Day 7 | Web3D + AI + 复习 | 10-12h | Three.js、AI应用、模拟面试 |

**每日时间分配建议：**
- 上午（9:00-12:00）：理论知识学习
- 下午（14:00-18:00）：深度学习 + 代码实践
- 晚上（19:30-22:00）：算法刷题 + 笔记整理

---

## Day 1: JavaScript 核心 + TypeScript

### 上午：JavaScript 执行机制（3小时）

#### 1.1 事件循环（Event Loop）
```
核心概念：
- 调用栈（Call Stack）
- 任务队列（Task Queue）
- 微任务队列（Microtask Queue）
- 宏任务 vs 微任务

宏任务：setTimeout、setInterval、I/O、UI渲染
微任务：Promise.then、MutationObserver、queueMicrotask

执行顺序：同步代码 → 微任务 → 宏任务 → 微任务 → ...
```

**必会输出题：**
```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
Promise.resolve().then(() => setTimeout(() => console.log('4'), 0));
Promise.resolve().then(() => console.log('5'));
console.log('6');
// 输出：1 6 3 5 2 4
```

#### 1.2 作用域与闭包
```
核心概念：
- 词法作用域
- 作用域链
- 闭包的形成与应用
- 内存泄漏问题

闭包应用场景：
- 数据私有化
- 函数柯里化
- 防抖节流
- 模块模式
```

#### 1.3 this 指向
```
规则优先级（从高到低）：
1. new 绑定
2. 显式绑定（call/apply/bind）
3. 隐式绑定（对象方法调用）
4. 默认绑定（独立函数调用）

特殊情况：
- 箭头函数：继承外层 this
- 严格模式：默认绑定为 undefined
```

#### 1.4 原型与原型链
```javascript
// 核心关系
实例.__proto__ === 构造函数.prototype
构造函数.prototype.constructor === 构造函数
Object.prototype.__proto__ === null

// 原型链查找
实例 → 构造函数.prototype → Object.prototype → null
```

### 下午：ES6+ 特性 + 手写代码（4小时）

#### 1.5 ES6+ 核心特性
```javascript
// 必须精通的特性
- let/const 与块级作用域
- 解构赋值
- 箭头函数
- Promise / async await
- Class 语法
- 模块化（import/export）
- Proxy / Reflect
- Symbol / Iterator / Generator
- Map / Set / WeakMap / WeakSet
- 可选链（?.）与空值合并（??）
```

#### 1.6 手写代码练习

**Promise 相关：**
```javascript
// 1. 手写 Promise.all
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    promises.forEach((p, index) => {
      Promise.resolve(p).then(value => {
        results[index] = value;
        count++;
        if (count === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}

// 2. 手写 Promise.race
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => Promise.resolve(p).then(resolve, reject));
  });
}

// 3. 手写 Promise（简化版）
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];
    
    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.value = value;
      this.callbacks.forEach(cb => cb.onFulfilled(value));
    };
    
    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this.callbacks.forEach(cb => cb.onRejected(reason));
    };
    
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const callback = {
        onFulfilled: value => {
          try {
            const result = onFulfilled ? onFulfilled(value) : value;
            resolve(result);
          } catch (e) {
            reject(e);
          }
        },
        onRejected: reason => {
          try {
            const result = onRejected ? onRejected(reason) : reason;
            reject(result);
          } catch (e) {
            reject(e);
          }
        }
      };
      
      if (this.state === 'pending') {
        this.callbacks.push(callback);
      } else if (this.state === 'fulfilled') {
        setTimeout(() => callback.onFulfilled(this.value), 0);
      } else {
        setTimeout(() => callback.onRejected(this.value), 0);
      }
    });
  }
}
```

**工具函数：**
```javascript
// 4. 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 5. 节流
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 6. 深拷贝（处理循环引用）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);
  
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}

// 7. 柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

// 8. 实现 new
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}

// 9. 实现 call
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 10. 发布订阅模式
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(...args));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}
```

### 晚上：TypeScript 高级（3小时）

#### 1.7 TypeScript 核心概念
```typescript
// 基础类型
let str: string = 'hello';
let num: number = 42;
let bool: boolean = true;
let arr: number[] = [1, 2, 3];
let tuple: [string, number] = ['hello', 42];

// any vs unknown vs never
any: 任意类型，跳过类型检查
unknown: 未知类型，使用前必须类型收窄
never: 永不存在的值（抛出异常、无限循环）

// interface vs type
interface: 可声明合并、只能描述对象
type: 可定义联合类型、交叉类型、元组
```

#### 1.8 泛型高级用法
```typescript
// 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 条件类型
type IsString<T> = T extends string ? true : false;

// infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 映射类型
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

#### 1.9 类型体操练习
```typescript
// 1. 实现 DeepPartial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 2. 实现 DeepReadonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 3. 实现 Flatten
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

// 4. 实现 TupleToUnion
type TupleToUnion<T extends any[]> = T[number];

// 5. 实现 StringToUnion
type StringToUnion<S extends string> = 
  S extends `${infer F}${infer R}` ? F | StringToUnion<R> : never;
```

### Day 1 学习检查清单

- [ ] 能准确说出事件循环执行顺序
- [ ] 能解释闭包原理及应用场景
- [ ] 能判断各种 this 指向
- [ ] 能画出原型链关系图
- [ ] 能手写 Promise.all/race
- [ ] 能手写防抖节流
- [ ] 能手写深拷贝（处理循环引用）
- [ ] 能实现常用工具类型
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 2: HTML/CSS + 浏览器原理 + 网络

### 上午：CSS 深度复习（3小时）

#### 2.1 盒模型
```css
/* 标准盒模型 */
box-sizing: content-box;
/* 实际宽度 = width + padding + border */

/* IE盒模型 */
box-sizing: border-box;
/* 实际宽度 = width（包含 padding 和 border）*/
```

#### 2.2 BFC（块级格式化上下文）
```
触发条件：
- float 不为 none
- position 为 absolute 或 fixed
- display 为 inline-block、flex、grid、table-cell
- overflow 不为 visible

BFC 特性：
- 内部盒子垂直排列
- 同一 BFC 内 margin 会重叠
- BFC 不会与 float 元素重叠
- BFC 可以包含浮动元素（清除浮动）
```

#### 2.3 Flex 布局
```css
/* 容器属性 */
display: flex;
flex-direction: row | column | row-reverse | column-reverse;
flex-wrap: nowrap | wrap | wrap-reverse;
justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
align-items: flex-start | flex-end | center | baseline | stretch;
align-content: flex-start | flex-end | center | space-between | space-around | stretch;

/* 项目属性 */
order: 0;
flex-grow: 0;
flex-shrink: 1;
flex-basis: auto;
flex: 0 1 auto; /* grow shrink basis */
align-self: auto | flex-start | flex-end | center | baseline | stretch;
```

#### 2.4 Grid 布局
```css
/* 容器属性 */
display: grid;
grid-template-columns: 100px 1fr 2fr;
grid-template-rows: repeat(3, 100px);
grid-gap: 10px;
grid-template-areas: 
  "header header header"
  "sidebar main main"
  "footer footer footer";

/* 项目属性 */
grid-column: 1 / 3;
grid-row: 1 / 2;
grid-area: header;
```

#### 2.5 CSS 选择器优先级
```
优先级计算（从高到低）：
1. !important
2. 内联样式（1000）
3. ID 选择器（100）
4. 类/伪类/属性选择器（10）
5. 元素/伪元素选择器（1）
6. 通配符/继承（0）

示例：
#id .class div = 100 + 10 + 1 = 111
```

#### 2.6 层叠上下文
```
创建条件：
- position: fixed/sticky
- position: absolute/relative + z-index 不为 auto
- opacity < 1
- transform 不为 none
- filter 不为 none
- flex/grid 子元素 + z-index 不为 auto

层叠顺序（从低到高）：
1. 背景和边框
2. 负 z-index
3. 块级盒子
4. 浮动盒子
5. 行内盒子
6. z-index: 0 / auto
7. 正 z-index
```

#### 2.7 移动端适配
```css
/* 1. rem 方案 */
html { font-size: calc(100vw / 7.5); } /* 以 750px 设计稿为基准 */

/* 2. vw/vh 方案 */
.box { width: 50vw; height: 50vh; }

/* 3. flexible.js + postcss-pxtorem */

/* 4. 1px 问题解决 */
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
```

### 下午：浏览器原理（3小时）

#### 2.8 浏览器渲染流程
```
1. 解析 HTML → DOM Tree
2. 解析 CSS → CSSOM Tree
3. DOM + CSSOM → Render Tree
4. Layout（布局/回流）：计算元素位置和大小
5. Paint（绘制）：绘制元素的可视属性
6. Composite（合成）：将各层合成到屏幕上

关键渲染路径优化：
- 减少关键资源数量
- 减少关键资源大小
- 缩短关键路径长度
```

#### 2.9 重排（Reflow）与重绘（Repaint）
```
触发重排的操作：
- 添加/删除 DOM 元素
- 元素位置、大小变化
- 页面初始渲染
- 浏览器窗口大小变化
- 获取某些属性（offsetTop、scrollTop、clientWidth 等）

触发重绘的操作：
- 颜色、背景、visibility 等变化

优化策略：
- 批量修改 DOM（DocumentFragment）
- 使用 transform 代替 top/left
- 使用 visibility 代替 display
- 避免频繁读取会触发重排的属性
- 使用 will-change 提示浏览器
```

#### 2.10 V8 垃圾回收
```
新生代（Scavenge 算法）：
- 空间小，存放生命周期短的对象
- 分为 From 和 To 两个空间
- 复制存活对象到 To 空间，清空 From 空间

老生代（Mark-Sweep + Mark-Compact）：
- 空间大，存放生命周期长的对象
- 标记-清除：标记存活对象，清除未标记对象
- 标记-整理：整理内存碎片

晋升条件：
- 经历过一次 Scavenge 回收
- To 空间使用超过 25%
```

#### 2.11 浏览器缓存
```
强缓存（不发请求）：
- Expires: 绝对时间（HTTP/1.0）
- Cache-Control: max-age=3600（HTTP/1.1）

协商缓存（发请求验证）：
- Last-Modified / If-Modified-Since
- ETag / If-None-Match（优先级更高）

缓存位置（优先级从高到低）：
1. Service Worker
2. Memory Cache
3. Disk Cache
4. Push Cache
```

### 晚上：网络知识（3小时）

#### 2.12 HTTP 协议
```
HTTP/1.1 特点：
- 持久连接（keep-alive）
- 管道化（pipelining）
- 队头阻塞问题

HTTP/2 特点：
- 二进制分帧
- 多路复用
- 头部压缩（HPACK）
- 服务器推送

HTTP/3 特点：
- 基于 QUIC（UDP）
- 解决队头阻塞
- 更快的连接建立
- 连接迁移
```

#### 2.13 HTTPS
```
TLS 握手流程：
1. Client Hello：支持的加密套件、随机数
2. Server Hello：选择的加密套件、随机数、证书
3. 客户端验证证书
4. 客户端生成预主密钥，用服务器公钥加密发送
5. 双方根据随机数和预主密钥生成会话密钥
6. 使用会话密钥进行对称加密通信
```

#### 2.14 TCP 三次握手与四次挥手
```
三次握手：
1. SYN=1, seq=x
2. SYN=1, ACK=1, seq=y, ack=x+1
3. ACK=1, seq=x+1, ack=y+1

四次挥手：
1. FIN=1, seq=u
2. ACK=1, seq=v, ack=u+1
3. FIN=1, ACK=1, seq=w, ack=u+1
4. ACK=1, seq=u+1, ack=w+1

为什么是三次握手？
- 防止已失效的连接请求到达服务器

为什么是四次挥手？
- TCP 是全双工，需要双方

#### 2.15 跨域解决方案
```javascript
// 1. CORS（推荐）
// 服务端设置响应头
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true

// 2. 代理服务器
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://backend.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}

// 3. JSONP（仅支持 GET）
function jsonp(url, callback) {
  const script = document.createElement('script');
  script.src = `${url}?callback=${callback}`;
  document.body.appendChild(script);
}

// 4. postMessage（跨窗口通信）
// 5. WebSocket（不受同源策略限制）
```

### Day 2 学习检查清单

- [ ] 能解释 BFC 及其应用场景
- [ ] 熟练使用 Flex 和 Grid 布局
- [ ] 能说出浏览器渲染流程
- [ ] 理解重排重绘及优化方法
- [ ] 能解释强缓存和协商缓存
- [ ] 能说出 HTTP/1.1、HTTP/2、HTTP/3 区别
- [ ] 能画出 TCP 三次握手四次挥手
- [ ] 能说出至少 3 种跨域解决方案
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 3: 前端框架（Vue + React）

### 上午：Vue 深度（4小时）

#### 3.1 Vue3 响应式原理
```javascript
// Vue2: Object.defineProperty
// 缺点：无法监听数组索引变化、无法监听对象属性的添加删除

// Vue3: Proxy
const reactive = (target) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object') {
        return reactive(result); // 深层响应式
      }
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
};

// 依赖收集与触发
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}
```

#### 3.2 Vue3 Composition API
```javascript
// Options API vs Composition API
// Composition API 优势：
// 1. 更好的逻辑复用（组合函数）
// 2. 更好的类型推断
// 3. 更小的打包体积（Tree Shaking）

// 常用 API
import { ref, reactive, computed, watch, watchEffect } from 'vue';

// ref vs reactive
const count = ref(0);           // 基本类型
const state = reactive({});     // 对象类型

// computed
const double = computed(() => count.value * 2);

// watch vs watchEffect
watch(count, (newVal, oldVal) => {});  // 惰性执行
watchEffect(() => {});                  // 立即执行

// 生命周期
onMounted(() => {});
onUpdated(() => {});
onUnmounted(() => {});
```

#### 3.3 虚拟 DOM 与 Diff 算法
```javascript
// 虚拟 DOM 结构
const vnode = {
  type: 'div',
  props: { id: 'app' },
  children: [
    { type: 'span', props: {}, children: 'hello' }
  ]
};

// Vue3 Diff 算法优化
// 1. 静态标记（PatchFlag）
// 2. 静态提升（hoistStatic）
// 3. 事件缓存（cacheHandlers）
// 4. 最长递增子序列算法

// Diff 过程
// 1. 同级比较，不跨层级
// 2. 头头比较、尾尾比较
// 3. 头尾比较、尾头比较
// 4. 使用 key 建立映射
// 5. 最长递增子序列优化移动
```

#### 3.4 Vue Router 原理
```javascript
// Hash 模式
// 监听 hashchange 事件
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  // 根据 hash 渲染对应组件
});

// History 模式
// 使用 pushState/replaceState
history.pushState(state, title, url);
// 监听 popstate 事件
window.addEventListener('popstate', () => {
  // 根据 pathname 渲染对应组件
});

// 导航守卫
router.beforeEach((to, from, next) => {});
router.afterEach((to, from) => {});
```

#### 3.5 Pinia 状态管理
```javascript
// 定义 Store
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(credentials) {
      const { token } = await api.login(credentials);
      this.token = token;
    }
  }
});

// Composition API 风格
export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const token = ref('');
  
  const isLoggedIn = computed(() => !!token.value);
  
  async function login(credentials) {
    const res = await api.login(credentials);
    token.value = res.token;
  }
  
  return { name, token, isLoggedIn, login };
});
```

### 下午：React 深度（4小时）

#### 3.6 React Fiber 架构
```
Fiber 解决的问题：
- React 15 的 Stack Reconciler 是同步递归，无法中断
- 长时间占用主线程导致页面卡顿

Fiber 核心思想：
- 将渲染工作拆分成小单元
- 可中断、可恢复
- 优先级调度

Fiber 节点结构：
{
  type: 组件类型,
  key: 唯一标识,
  stateNode: DOM 节点或组件实例,
  child: 第一个子节点,
  sibling: 下一个兄弟节点,
  return: 父节点,
  pendingProps: 新的 props,
  memoizedProps: 上次渲染的 props,
  memoizedState: 上次渲染的 state,
  effectTag: 副作用标记
}

双缓冲机制：
- current Fiber 树：当前屏幕显示的内容
- workInProgress Fiber 树：正在构建的新树
- 构建完成后交换指针
```

#### 3.7 React Hooks 原理
```javascript
// Hooks 存储在 Fiber 节点的 memoizedState 上
// 以链表形式存储

// 简化版 useState 实现
let hookIndex = 0;
let hooks = [];

function useState(initialValue) {
  const currentIndex = hookIndex;
  hooks[currentIndex] = hooks[currentIndex] || initialValue;
  
  const setState = (newValue) => {
    hooks[currentIndex] = newValue;
    render(); // 触发重新渲染
  };
  
  hookIndex++;
  return [hooks[currentIndex], setState];
}

// Hooks 规则
// 1. 只能在函数组件顶层调用
// 2. 只能在函数组件或自定义 Hook 中调用
// 原因：依赖调用顺序来匹配 state
```

#### 3.8 常用 Hooks 详解
```javascript
// useState - 状态管理
const [count, setCount] = useState(0);
setCount(prev => prev + 1); // 函数式更新

// useEffect - 副作用
useEffect(() => {
  // 执行副作用
  return () => {
    // 清理函数
  };
}, [dependencies]);

// useRef - 保存可变值
const ref = useRef(null);
// ref.current 不会触发重新渲染

// useMemo - 缓存计算结果
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback - 缓存函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useContext - 跨组件传值
const value = useContext(MyContext);

// useReducer - 复杂状态管理
const [state, dispatch] = useReducer(reducer, initialState);

// useLayoutEffect - 同步执行副作用
// 在 DOM 更新后、浏览器绘制前执行
```

#### 3.9 React 18 新特性
```javascript
// 1. Concurrent Mode（并发模式）
// 可中断渲染，优先响应用户交互

// 2. Automatic Batching（自动批处理）
// 所有更新都会自动批处理，包括 Promise、setTimeout

// 3. Transitions
import { useTransition, startTransition } from 'react';

const [isPending, startTransition] = useTransition();
startTransition(() => {
  setSearchQuery(input); // 低优先级更新
});

// 4. Suspense 改进
<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>

// 5. 新的 Hooks
useId()           // 生成唯一 ID
useDeferredValue() // 延迟更新
useSyncExternalStore() // 订阅外部数据源
useInsertionEffect() // CSS-in-JS 库使用
```

#### 3.10 React vs Vue 对比
```
| 特性 | React | Vue |
|------|-------|-----|
| 响应式 | 不可变数据 + setState | 可变数据 + Proxy |
| 模板 | JSX | Template + JSX |
| 状态管理 | Redux/Zustand | Pinia/Vuex |
| 组件通信 | Props/Context | Props/Provide-Inject |
| 生命周期 | Hooks | Options/Composition |
| Diff 算法 | 双端 + key | 双端 + 最长递增子序列 |
| 学习曲线 | 较陡 | 较平缓 |
```

### Day 3 学习检查清单

- [ ] 能解释 Vue3 响应式原理（Proxy）
- [ ] 能说出 Composition API 优势
- [ ] 能解释虚拟 DOM 和 Diff 算法
- [ ] 能解释 React Fiber 架构
- [ ] 能说出 Hooks 原理和规则
- [ ] 能区分 useMemo 和 useCallback
- [ ] 能说出 React 18 新特性
- [ ] 能对比 React 和 Vue 的差异
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 4: 前端构建 + 工程化

### 上午：Webpack 深度（3小时）

#### 4.1 Webpack 核心概念
```javascript
// webpack.config.js
module.exports = {
  // 入口
  entry: './src/index.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  
  // 模式
  mode: 'production', // development | production
  
  // Loader：处理非 JS 文件
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  
  // Plugin：扩展功能
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new MiniCssExtractPlugin()
  ],
  
  // 优化
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ]
  }
};
```

#### 4.2 Webpack 构建流程
```
1. 初始化参数：合并配置文件和命令行参数
2. 开始编译：创建 Compiler 对象，加载插件
3. 确定入口：根据 entry 找到入口文件
4. 编译模块：从入口出发，调用 Loader 处理模块
5. 完成编译：得到每个模块的依赖关系
6. 输出资源：根据依赖关系组装成 Chunk
7. 输出完成：将 Chunk 写入文件系统
```

#### 4.3 Loader 与 Plugin
```javascript
// Loader：转换器，处理单个文件
// 执行顺序：从右到左，从下到上

// 自定义 Loader
module.exports = function(source) {
  // source 是文件内容
  const result = transform(source);
  return result;
};

// Plugin：扩展器，监听构建生命周期
// 基于 Tapable 事件流

// 自定义 Plugin
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 在生成资源到 output 目录之前执行
      console.log('资源列表:', Object.keys(compilation.assets));
      callback();
    });
  }
}
```

#### 4.4 热更新（HMR）原理
```
1. Webpack Dev Server 启动本地服务
2. 建立 WebSocket 连接
3. 文件变化时，Webpack 重新编译
4. 生成新的 hash 和更新的模块
5. 通过 WebSocket 通知浏览器
6. 浏览器请求更新的模块
7. HMR Runtime 替换模块，不刷新页面
```

#### 4.5 Tree Shaking
```javascript
// 原理：基于 ES Module 静态分析
// 条件：
// 1. 使用 ES Module（import/export）
// 2. mode: 'production'
// 3. 配置 sideEffects

// package.json
{
  "sideEffects": false, // 所有模块都无副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}

// 注意事项：
// - CommonJS 无法 Tree Shaking
// - 有副作用的代码不会被删除
```

#### 4.6 Webpack 优化策略
```javascript
// 1. 构建速度优化
module.exports = {
  // 缩小搜索范围
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: { '@': path.resolve(__dirname, 'src') },
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  
  // 多进程构建
  module: {
    rules: [{
      test: /\.js$/,
      use: ['thread-loader', 'babel-loader']
    }]
  },
  
  // 缓存
  cache: {
    type: 'filesystem'
  }
};

// 2. 产物优化
module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    // 运行时代码单独打包
    runtimeChunk: 'single'
  }
};
```

### 下午：Vite + 其他工具（3小时）

#### 4.7 Vite 原理
```
开发环境：
1. 基于原生 ES Module
2. 按需编译，不打包
3. 使用 esbuild 预构建依赖
4. 利用浏览器缓存

生产环境：
1. 使用 Rollup 打包
2. 自动代码分割
3. CSS 代码分割

为什么快？
- 冷启动：不需要打包，直接启动服务
- 热更新：只更新变化的模块
- 预构建：将 CommonJS 转为 ESM，合并小模块
```

#### 4.8 Vite 配置
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['lodash-es']
  }
});
```

#### 4.9 Vite vs Webpack
```
| 特性 | Vite | Webpack |
|------|------|---------|
| 开发启动 | 秒级 | 分钟级 |
| HMR 速度 | 毫秒级 | 秒级 |
| 生态 | 较新 | 成熟 |
| 配置 | 简单 | 复杂 |
| 生产打包 | Rollup | Webpack |
| 兼容性 | 现代浏览器 | 可配置 |
```

#### 4.10 Babel 编译原理
```
编译流程：
1. 解析（Parse）：源码 → AST
2. 转换（Transform）：遍历 AST，应用插件
3. 生成（Generate）：AST → 目标代码

// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};
```

#### 4.11 Monorepo 架构
```
// pnpm workspace
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

// 目录结构
monorepo/
├── packages/
│   ├── ui/           # 组件库
│   ├── utils/        # 工具库
│   └── config/       # 配置
├── apps/
│   ├── web/          # Web 应用
│   └── admin/        # 管理后台
├── pnpm-workspace.yaml
└── package.json

// 优势
- 代码复用
- 统一版本管理
- 原子化提交
- 简化依赖管理

// 工具选择
- pnpm workspace（推荐）
- Turborepo
- Nx
- Lerna
```

### 晚上：工程化实践（2小时）

#### 4.12 代码规范
```javascript
// ESLint 配置
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'error'
  }
};

// Prettier 配置
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

// Husky + lint-staged
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

#### 4.13 CI/CD 流程
```yaml
# GitHub Actions 示例
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### Day 4 学习检查清单

- [ ] 能说出 Webpack 构建流程
- [ ] 能区分 Loader 和 Plugin
- [ ] 能解释 HMR 原理
- [ ] 能说出 Tree Shaking 原理和条件
- [ ] 能说出 Webpack 优化策略
- [ ] 能解释 Vite 为什么快
- [ ] 能配置 Vite 项目
- [ ] 了解 Babel 编译原理
- [ ] 了解 Monorepo 架构
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 5: 前端架构 + 性能优化 + 安全

### 上午：前端架构（3小时）

#### 5.1 微前端架构
```javascript
// 微前端核心概念
// 将大型应用拆分为多个独立的小应用

// 主流方案对比
| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| qiankun | 基于 single-spa | 成熟稳定 | 沙箱有限制 |
| Module Federation | Webpack 5 | 共享依赖 | 依赖 Webpack |
| iframe | 原生隔离 | 完全隔离 | 通信复杂 |
| Web Components | 原生标准 | 框架无关 | 兼容性 |

// qiankun 示例
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#container',
    activeRule: '/app1'
  }
]);

start();

// 子应用
export async function bootstrap() {}
export async function mount(props) {}
export async function unmount() {}

// Module Federation 示例
// webpack.config.js
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button'
  },
  shared: ['react', 'react-dom']
})
```

#### 5.2 组件库设计
```javascript
// 组件库架构
components/
├── src/
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── index.ts
├── package.json
└── rollup.config.js

// 设计原则
1. 单一职责：每个组件只做一件事
2. 可组合性：组件可以灵活组合
3. 可访问性：支持键盘导航、屏幕阅读器
4. 主题定制：支持样式覆盖
5. 类型安全：完整的 TypeScript 类型

// 打包配置
// rollup.config.js
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    postcss({ extract: true })
  ]
};
```

#### 5.3 低代码平台架构
```javascript
// 核心模块
1. Schema 设计
{
  "type": "page",
  "children": [
    {
      "type": "form",
      "props": { "layout": "vertical" },
      "children": [
        {
          "type": "input",
          "props": { "label": "姓名", "name": "name" }
        }
      ]
    }
  ]
}

2. 渲染引擎
function Renderer({ schema }) {
  const Component = componentMap[schema.type];
  return (
    <Component {...schema.props}>
      {schema.children?.map(child => (
        <Renderer key={child.id} schema={child} />
      ))}
    </Component>
  );
}

3. 拖拽引擎
- 组件面板
- 画布区域
- 属性配置面板
- 撤销重做（Command 模式）

4. 数据源管理
- API 配置
- 数据绑定
- 联动逻辑
```

### 下午：性能优化（3小时）

#### 5.4 性能指标
```
核心 Web Vitals：
- LCP（Largest Contentful Paint）：最大内容绘制 < 2.5s
- FID（First Input Delay）：首次输入延迟 < 100ms
- CLS（Cumulative Layout Shift）：累积布局偏移 < 0.1

其他指标：
- FCP（First Contentful Paint）：首次内容绘制
- TTI（Time to Interactive）：可交互时间
- TTFB（Time to First Byte）：首字节时间

测量工具：
- Lighthouse
- Chrome DevTools Performance
- Web Vitals 库
```

#### 5.5 加载优化
```javascript
// 1. 资源压缩
- Gzip / Brotli 压缩
- 图片压缩（WebP、AVIF）
- 代码压缩（Terser）

// 2. 代码分割
// 路由懒加载
const Home = lazy(() => import('./pages/Home'));

// 动态导入
const module = await import('./heavy-module');

// 3. 预加载 / 预获取
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">
<link rel="preconnect" href="https://api.example.com">

// 4. CDN 加速
- 静态资源上 CDN
- 多域名并行下载

// 5. 缓存策略
- 强缓存：Cache-Control
- 协商缓存：ETag
- Service Worker 缓存
```

#### 5.6 渲染优化
```javascript
// 1. 虚拟列表
// 只渲染可视区域的元素
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={10000}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</FixedSizeList>

// 2. 骨架屏
// 在内容加载前显示占位符

// 3. 图片懒加载
<img loading="lazy" src="image.jpg" />

// 或使用 Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});

// 4. 防抖节流
// 减少高频事件触发

// 5. Web Worker
// 将耗时计算放到 Worker 线程
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);
```

#### 5.7 React/Vue 性能优化
```javascript
// React 优化
// 1. React.memo
const MemoComponent = React.memo(Component);

// 2. useMemo / useCallback
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedFn = useCallback(() => {}, [deps]);

// 3. 避免内联对象和函数
// Bad
<Component style={{ color: 'red' }} onClick={() => {}} />
// Good
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => {}, []);

// 4. 使用 key 优化列表
// 5. 代码分割 + Suspense

// Vue 优化
// 1. v-once：只渲染一次
// 2. v-memo：缓存模板
// 3. shallowRef / shallowReactive：浅层响应式
// 4. computed 缓存
// 5. 异步组件
```

### 晚上：前端安全（2小时）

#### 5.8 XSS 攻击与防御
```javascript
// XSS 类型
1. 存储型：恶意代码存储在服务器
2. 反射型：恶意代码在 URL 中
3. DOM 型：恶意代码在前端执行

// 防御措施
// 1. 输入过滤
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

// 2. 输出编码
// React 默认转义
// Vue 使用 v-text 而非 v-html

// 3. CSP（Content Security Policy）
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'

// 4. HttpOnly Cookie
Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict
```

#### 5.9 CSRF 攻击与防御
```javascript
// CSRF 原理
// 利用用户已登录的身份，诱导用户访问恶意页面发起请求

// 防御措施
// 1. CSRF Token
// 服务端生成 token，前端请求时携带
headers: {
  'X-CSRF-Token': csrfToken
}

// 2. SameSite Cookie
Set-Cookie: token=xxx; SameSite=Strict

// 3. 验证 Referer / Origin
// 4. 关键操作二次验证
```

#### 5.10 其他安全问题
```javascript
// 1. 点击劫持
// 防御：X-Frame-Options: DENY

// 2. SQL 注入
// 防御：参数化查询、输入校验

// 3. 敏感信息泄露
// - 不在前端存储敏感信息
// - 使用 HTTPS
// - 接口脱敏

// 4. 依赖安全
// npm audit
// 定期更新依赖

// 5. JWT 安全
// - 使用 HTTPS 传输
// - 设置合理过期时间
// - 不在 payload 存敏感信息
// - 使用 HttpOnly Cookie 存储
```

### Day 5 学习检查清单

- [ ] 能说出微前端的实现方案
- [ ] 了解组件库设计原则
- [ ] 能说出核心 Web Vitals 指标
- [ ] 能说出至少 5 种性能优化方法
- [ ] 能解释虚拟列表原理
- [ ] 能说出 XSS 类型和防御方法
- [ ] 能说出 CSRF 原理和防御方法
- [ ] 了解 CSP 配置
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 6: 跨端开发 + Node.js 全栈

### 上午：跨端开发（4小时）

#### 6.1 小程序架构
```javascript
// 微信小程序双线程模型
┌─────────────────┐    ┌─────────────────┐
│   渲染层        │    │   逻辑层        │
│   (WebView)     │    │   (JSCore)      │
│                 │    │                 │
│   WXML + WXSS   │    │   JavaScript    │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
            ┌───────▼───────┐
            │   Native      │
            │   (微信客户端) │
            └───────────────┘

// 优点：安全、性能隔离
// 缺点：通信成本、无法直接操作 DOM

// 生命周期
App: onLaunch → onShow → onHide
Page: onLoad → onShow → onReady → onHide → onUnload
Component: created → attached → ready → detached
```

#### 6.2 uni-app 跨端原理
```javascript
// 编译时 + 运行时
// 编译时：将 Vue 代码转换为各平台代码
// 运行时：提供统一的 API 抽象层

// 条件编译
// #ifdef MP-WEIXIN
console.log('微信小程序');
// #endif

// #ifdef H5
console.log('H5');
// #endif

// 性能优化
1. 减少 setData 数据量
2. 避免频繁 setData
3. 使用自定义组件
4. 图片懒加载
5. 分包加载
```

#### 6.3 Taro 跨端原理
```javascript
// Taro 3.x：重运行时
// 实现了一套 DOM/BOM API
// 在小程序中模拟 React/Vue 运行

// 架构
React/Vue 代码
    ↓
Taro Runtime（模拟 DOM）
    ↓
小程序 setData

// 优势
- 完整的 React/Vue 开发体验
- 更好的生态兼容性
```

#### 6.4 React Native 基础
```javascript
// 架构（新架构）
JavaScript → JSI → C++ → Native

// 核心概念
- Bridge：JS 与 Native 通信桥梁
- JSI：JavaScript Interface，直接调用 C++
- Fabric：新的渲染系统
- TurboModules：新的原生模块系统

// 基础组件
import { View, Text, Image, ScrollView, FlatList } from 'react-native';

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
```

#### 6.5 Electron 架构
```javascript
// 进程模型
┌─────────────────────────────────────┐
│           Main Process              │
│  (Node.js 环境，管理窗口和系统交互)   │
└──────────────┬──────────────────────┘
               │ IPC
┌──────────────▼──────────────────────┐
│         Renderer Process            │
│  (Chromium 环境，渲染 UI)            │
└─────────────────────────────────────┘

// 主进程
const { app, BrowserWindow, ipcMain } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
});

// 进程通信
// 主进程
ipcMain.handle('get-data', async () => {
  return await fetchData();
});

// 渲染进程（通过 preload）
const data = await window.electronAPI.getData();
```

#### 6.6 PWA 技术
```javascript
// Service Worker
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Web App Manifest
// manifest.json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "icons": [...]
}
```

### 下午：Node.js 全栈（4小时）

#### 6.7 Node.js 事件循环
```javascript
// Node.js 事件循环阶段
┌───────────────────────────┐
│         timers            │  setTimeout/setInterval
├───────────────────────────┤
│     pending callbacks     │  I/O 回调
├───────────────────────────┤
│       idle, prepare       │  内部使用
├───────────────────────────┤
│          poll             │  获取新的 I/O 事件
├───────────────────────────┤
│         check             │  setImmediate
├───────────────────────────┤
│    close callbacks        │  close 事件回调
└───────────────────────────┘

// 与浏览器的区别
// Node.js 有 setImmediate 和 process.nextTick
// process.nextTick 优先级最高

console.log('1');
setImmediate(() => console.log('2'));
setTimeout(() => console.log('3'), 0);
process.nextTick(() => console.log('4'));
Promise.resolve().then(() => console.log('5'));
console.log('6');
// 输出：1 6 4 5 3 2（可能 3 和 2 顺序不定）
```

#### 6.8 Stream 流处理
```javascript
// 流类型
- Readable：可读流
- Writable：可写流
- Duplex：双工流
- Transform：转换流

// 示例：文件复制
const fs = require('fs');

const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

// 处理大文件
const http = require('http');

http.createServer((req, res) => {
  const stream = fs.createReadStream('large-file.txt');
  stream.pipe(res);
}).listen(3000);
```

#### 6.9 NestJS 框架
```typescript
// 模块化架构
// app.module.ts
@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

// 控制器
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

// 服务
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}

// 中间件、守卫、拦截器、管道
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
```

#### 6.10 SSR/SSG
```javascript
// Next.js SSR
// pages/posts/[id].js
export async function getServerSideProps({ params }) {
  const post = await fetchPost(params.id);
  return { props: { post } };
}

export default function Post({ post }) {
  return <div>{post.title}</div>;
}

// Next.js SSG
export async function getStaticPaths() {
  const posts = await fetchPosts();
  return {
    paths: posts.map(post => ({ params: { id: post.id } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.id);
  return { props: { post } };
}

// Nuxt.js SSR
// pages/posts/[id].vue
<script setup>
const { data: post } = await useFetch(`/api/posts/${route.params.id}`);
</script>
```

#### 6.11 BFF 层设计
```javascript
// BFF（Backend For Frontend）
// 为前端定制的后端服务层

// 职责
1. 接口聚合：合并多个微服务接口
2. 数据裁剪：只返回前端需要的字段
3. 协议转换：REST → GraphQL
4. 缓存处理：减少后端压力

// GraphQL 示例
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    posts: [Post!]!
  }
  
  type Query {
    user(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => userService.findById(id)
  },
  User: {
    posts: (user) => postService.findByUserId(user.id)
  }
};
```

### Day 6 学习检查清单

- [ ] 能解释小程序双线程模型
- [ ] 了解 uni-app/Taro 跨端原理
- [ ] 了解 React Native 架构
- [ ] 能解释 Electron 进程模型
- [ ] 了解 PWA 和 Service Worker
- [ ] 能说出 Node.js 事件循环与浏览器的区别
- [ ] 了解 Stream 流处理
- [ ] 了解 NestJS 基本架构
- [ ] 能区分 SSR 和 SSG
- [ ] 完成 5-10 道 LeetCode 题目

---

## Day 7: Web3D + AI前端 + 综合复习

### 上午：Web3D 知识（3小时）

#### 7.1 WebGL 基础
```javascript
// WebGL 渲染管线
顶点数据 → 顶点着色器 → 图元装配 → 光栅化 → 片元着色器 → 帧缓冲

// 着色器语言 GLSL
// 顶点着色器
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}

// 片元着色器
precision mediump float;
uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}

// WebGL 基本流程
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// 1. 创建着色器程序
// 2. 创建缓冲区，传入顶点数据
// 3. 设置 uniform 变量
// 4. 绑定属性
// 5. 绘制
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

#### 7.2 Three.js 核心概念
```javascript
import * as THREE from 'three';

// 1. 场景（Scene）
const scene = new THREE.Scene();

// 2. 相机（Camera）
const camera = new THREE.PerspectiveCamera(
  75,                                    // 视角
  window.innerWidth / window.innerHeight, // 宽高比
  0.1,                                   // 近裁剪面
  1000                                   // 远裁剪面
);
camera.position.z = 5;

// 3. 渲染器（Renderer）
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 几何体（Geometry）
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 5. 材质（Material）
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

// 6. 网格（Mesh）
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 7. 光源（Light）
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// 8. 动画循环
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

#### 7.3 3D 性能优化
```javascript
// 1. 几何体优化
- 减少顶点数量
- 使用 LOD（Level of Detail）
- 合并几何体（BufferGeometryUtils.mergeBufferGeometries）

// 2. 材质优化
- 共享材质
- 使用纹理图集
- 压缩纹理（KTX2、Basis）

// 3. 渲染优化
- 实例化渲染（InstancedMesh）
const mesh = new THREE.InstancedMesh(geometry, material, count);

- 视锥体剔除（Frustum Culling）
- 遮挡剔除（Occlusion Culling）

// 4. 内存管理
geometry.dispose();
material.dispose();
texture.dispose();

// 5. 使用 Web Worker
// 将复杂计算放到 Worker 线程
```

#### 7.4 WebGPU 基础
```javascript
// WebGPU 是 WebGL 的下一代标准
// 更接近现代图形 API（Vulkan、Metal、D3D12）

// 特点
- 更低的 CPU 开销
- 更好的多线程支持
- 计算着色器支持
- 更现代的 API 设计

// 基本使用
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext('webgpu');
context.configure({
  device,
  format: navigator.gpu.getPreferredCanvasFormat()
});

// 创建渲染管线、绑定组、命令编码器等
```

### 中午：AI + 前端（3小时）

#### 7.5 LLM 应用开发
```javascript
// OpenAI API 调用
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

// 流式响应处理
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.startsWith('data:'));
  
  for (const line of lines) {
    const data = JSON.parse(line.slice(5));
    if (data.choices[0].delta.content) {
      // 更新 UI
      appendMessage(data.choices[0].delta.content);
    }
  }
}
```

#### 7.6 AI 组件开发
```javascript
// 聊天界面组件
function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // 流式响应
    const response = await streamChat(input);
    let assistantMessage = '';
    
    for await (const chunk of response) {
      assistantMessage += chunk;
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistantMessage }
      ]);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <InputArea 
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={isLoading}
      />
    </div>
  );
}

// Markdown 渲染（支持代码高亮）
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function MessageContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter language={match[1]}>
              {String(children)}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>{children}</code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

#### 7.7 Vercel AI SDK
```javascript
// 使用 Vercel AI SDK 简化开发
import { useChat } from 'ai/react';

function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}

// API 路由
// app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

#### 7.8 端侧 AI
```javascript
// TensorFlow.js 示例
import * as tf from '@tensorflow/tfjs';

// 加载预训练模型
const model = await tf.loadLayersModel('model.json');

// 图像分类
const img = document.getElementById('image');
const tensor = tf.browser.fromPixels(img)
  .resizeNearestNeighbor([224, 224])
  .expandDims()
  .div(255);

const predictions = await model.predict(tensor).data();

// WebNN API（实验性）
const context = await navigator.ml.createContext();
const builder = new MLGraphBuilder(context);

// 构建神经网络图
const input = builder.input('input', { type: 'float32', dimensions: [1, 3, 224, 224] });
const conv = builder.conv2d(input, weights, { padding: [1, 1, 1, 1] });
const output = builder.relu(conv);

const graph = await builder.build({ output });
```

### 下午：前端测试 + 数据可视化（2小时）

#### 7.9 前端测试
```javascript
// 单元测试 - Vitest
import { describe, it, expect, vi } from 'vitest';

describe('utils', () => {
  it('should add numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
  
  it('should mock function', () => {
    const mockFn = vi.fn().mockReturnValue(42);
    expect(mockFn()).toBe(42);
    expect(mockFn).toHaveBeenCalled();
  });
});

// 组件测试 - Testing Library
import { render, screen, fireEvent } from '@testing-library/react';

test('button click', async () => {
  render(<Counter />);
  
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// E2E 测试 - Playwright
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

#### 7.10 数据可视化
```javascript
// ECharts 示例
import * as echarts from 'echarts';

const chart = echarts.init(document.getElementById('chart'));

chart.setOption({
  title: { text: '销售数据' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [120, 200, 150, 80, 70]
  }]
});

// D3.js 示例
import * as d3 from 'd3';

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * 50)
  .attr('y', d => 300 - d.value)
  .attr('width', 40)
  .attr('height', d => d.value)
  .attr('fill', 'steelblue');
```

### 晚上：综合复习 + 模拟面试（3小时）

#### 7.11 系统设计题准备
```
常见系统设计题：

1. 设计一个前端监控系统
   - 错误监控（JS 错误、资源加载错误、Promise 错误）
   - 性能监控（FCP、LCP、TTI）
   - 用户行为监控（PV、UV、点击热力图）
   - 数据上报（批量上报、采样）
   - 数据可视化面板

2. 设计一个组件库
   - 目录结构
   - 组件规范
   - 文档系统（Storybook）
   - 打包策略
   - 版本管理

3. 设计一个大文件上传组件
   - 分片上传
   - 断点续传
   - 秒传（文件 hash）
   - 并发控制
   - 进度显示

4. 设计一个权限管理系统
   - RBAC 模型
   - 路由权限
   - 按钮权限
   - 数据权限

5. 设计一个实时协作编辑器
   - OT / CRDT 算法
   - WebSocket 通信
   - 冲突解决
   - 光标同步
```

#### 7.12 项目介绍准备（STAR 法则）
```
项目介绍模板：

S（Situation）- 背景
"我们团队负责的是一个 xxx 系统，用户量 xxx，主要解决 xxx 问题"

T（Task）- 任务
"我在项目中负责 xxx 模块的开发，主要目标是 xxx"

A（Action）- 行动
"为了实现这个目标，我采取了以下措施：
1. 技术选型：选择了 xxx，因为 xxx
2. 架构设计：采用了 xxx 架构
3. 性能优化：通过 xxx 方法，将 xxx 指标从 xxx 优化到 xxx"

R（Result）- 结果
"最终项目成功上线，xxx 指标提升了 xxx%，获得了 xxx 好评"

准备 2-3 个项目，每个项目准备：
- 项目背景和你的角色
- 技术栈和架构
- 遇到的难点和解决方案
- 量化的成果
```

### Day 7 学习检查清单

- [ ] 了解 WebGL 渲染管线
- [ ] 能使用 Three.js 创建基本场景
- [ ] 了解 3D 性能优化方法
- [ ] 能实现 LLM 流式响应处理
- [ ] 了解 AI 组件开发模式
- [ ] 能编写单元测试和组件测试
- [ ] 能回答系统设计题
- [ ] 准备好项目介绍
- [ ] 完成模拟面试

---

## 算法刷题指南

### 必刷题型与推荐题目

#### 数组与字符串
```
- 两数之和（LeetCode 1）
- 三数之和（LeetCode 15）
- 最大子数组和（LeetCode 53）
- 合并区间（LeetCode 56）
- 无重复字符的最长子串（LeetCode 3）
- 最长回文子串（LeetCode 5）
```

#### 链表
```
- 反转链表（LeetCode 206）
- 合并两个有序链表（LeetCode 21）
- 环形链表（LeetCode 141）
- 相交链表（LeetCode 160）
- LRU 缓存（LeetCode 146）
```

#### 树
```
- 二叉树的遍历（前中后序、层序）
- 二叉树的最大深度（LeetCode 104）
- 验证二叉搜索树（LeetCode 98）
- 二叉树的最近公共祖先（LeetCode 236）
- 从前序与中序遍历序列构造二叉树（LeetCode 105）
```

#### 动态规划
```
- 爬楼梯（LeetCode 70）
- 最长递增子序列（LeetCode 300）
- 零钱兑换（LeetCode 322）
- 最长公共子序列（LeetCode 1143）
- 编辑距离（LeetCode 72）
```

#### 前端特色题
```javascript
// 1. 实现 LRU 缓存
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }
}

// 2. 大数相加
function addStrings(num1, num2) {
  let i = num1.length - 1;
  let j = num2.length - 1;
  let carry = 0;
  let result = '';
  
  while (i >= 0 || j >= 0 || carry) {
    const n1 = i >= 0 ? parseInt(num1[i--]) : 0;
    const n2 = j >= 0 ? parseInt(num2[j--]) : 0;
    const sum = n1 + n2 + carry;
    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
  }
  
  return result;
}

// 3. 实现 JSON.stringify
function stringify(obj) {
  if (obj === null) return 'null';
  if (typeof obj === 'undefined' || typeof obj === 'function') return undefined;
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return isFinite(obj) ? obj.toString() : 'null';
  if (typeof obj === 'string') return `"${obj}"`;
  
  if (Array.isArray(obj)) {
    const items = obj.map(item => stringify(item) ?? 'null');
    return `[${items.join(',')}]`;
  }
  
  if (typeof obj === 'object') {
    const pairs = Object.keys(obj)
      .filter(key => stringify(obj[key]) !== undefined)
      .map(key => `"${key}":${stringify(obj[key])}`);
    return `{${pairs.join(',')}}`;
  }
}

// 4. 实现 Promise 并发控制
async function asyncPool(limit, tasks) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    
    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

// 5. 深度优先遍历 DOM
function dfsDOM(node, callback) {
  callback(node);
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    dfsDOM(children[i], callback);
  }
}

// 广度优先遍历 DOM
function bfsDOM(node, callback) {
  const queue = [node];
  while (queue.length) {
    const current = queue.shift();
    callback(current);
    queue.push(...current.children);
  }
}
```

---

## 高频面试题清单

### JavaScript 基础
1. 说说事件循环机制
2. 什么是闭包？有什么应用场景？
3. 说说 this 的指向规则
4. 原型链是什么？如何实现继承？
5. var、let、const 的区别
6. 箭头函数和普通函数的区别
7. Promise 的状态和方法
8. async/await 的原理
9. 深拷贝和浅拷贝的区别
10. 说说 ES6 的新特性

### CSS
1. 说说 BFC 及其应用
2. Flex 布局的常用属性
3. 如何实现垂直居中
4. 说说 CSS 选择器优先级
5. 移动端 1px 问题如何解决
6. 说说重排和重绘

### 浏览器与网络
1. 从输入 URL 到页面显示发生了什么
2. 说说浏览器缓存机制
3. HTTP/1.1、HTTP/2、HTTP/3 的区别
4. HTTPS 的工作原理
5. 跨域的解决方案有哪些
6. 说说 XSS 和 CSRF 攻击

### Vue
1. Vue3 响应式原理
2. Vue2 和 Vue3 的区别
3. Composition API 的优势
4. 虚拟 DOM 和 Diff 算法
5. Vue Router 的实现原理
6. Vuex/Pinia 的使用和原理

### React
1. React Fiber 架构
2. Hooks 的原理和规则
3. useMemo 和 useCallback 的区别
4. React 18 的新特性
5. Redux 的工作流程
6. React 性能优化方法

### 工程化
1. Webpack 的构建流程
2. Loader 和 Plugin 的区别
3. Vite 为什么快
4. Tree Shaking 的原理
5. 如何优化 Webpack 构建速度
6. 说说 Babel 的编译原理

### 性能优化
1. 首屏优化有哪些方法
2. 说说懒加载的实现
3. 如何实现虚拟列表
4. 说说 Web Vitals 指标
5. 如何定位性能问题

---

## 2026年新趋势

### 必须关注的技术
```
1. React Server Components（RSC）
   - 服务端组件，减少客户端 JS
   - 与 SSR 的区别

2. Partial Hydration / Islands Architecture
   - 部分水合，减少 JS 体积
   - Astro、Fresh 等框架

3. Edge Computing
   - 边缘计算，更低延迟
   - Cloudflare Workers、Vercel Edge

4. WebAssembly
   - 高性能计算
   - Rust/C++ 编译到 Web

5. Rust 工具链
   - SWC：替代 Babel
   - Turbopack：替代 Webpack
   - Rspack：Webpack 兼容的 Rust 实现

6. Bun 运行时
   - 更快的 JavaScript 运行时
   - 内置打包器、测试运行器

7. CSS 新特性
   - Container Queries
   - :has() 选择器
   - Subgrid

8. View Transitions API
   - 原生页面过渡动画
   - SPA 和 MPA 都支持

9. AI 辅助开发
   - Copilot 类工具
   - AI 代码审查
   - AI 测试生成
```

---

## 学习资源推荐

### 书籍
- 《JavaScript 高级程序设计》（红宝书）
- 《你不知道的 JavaScript》
- 《深入浅出 Vue.js》
- 《React 设计原理》

### 在线资源
- MDN Web Docs
- React 官方文档
- Vue 官方文档
- web.dev（Google 性能优化）

### 刷题平台
- LeetCode
- 牛客网
- CodeTop（按公司/岗位筛选）

### 面试准备
- 掘金面试专栏
- GitHub 前端面试题仓库
- 各大厂技术博客

---

## 面试心态调整

```
1. 保持自信
   - 你准备了这么久，相信自己
   - 不会的题目坦诚说不会，展示思考过程

2. 注意沟通
   - 面试是双向选择
   - 主动提问，展示对公司的兴趣

3. 复盘总结
   - 每次面试后记录问题
   - 查漏补缺，持续改进

4. 保持节奏
   - 不要一天安排太多面试
   - 保证充足睡眠

5. 心态平和
   - 一次失败不代表什么
   - 大厂机会很多，保持耐心
```

---

## 最后的话

这份指南涵盖了 2026 年前端面试的核心内容。一周时间很紧张，但如果你能按照计划执行，一定会有很大收获。

记住：
- 基础知识是根本，不能丢分
- 框架原理要理解，不能只会用
- 算法要多练，熟能生巧
- 项目经验要准备好，能讲出亮点
- AI 相关是加分项，有时间一定要学

祝你面试顺利，拿到心仪的 Offer！🎉

---

> 文档生成时间：2026年1月
> 
> 如有问题或建议，欢迎反馈！
