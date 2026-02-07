# 🔌 国网外包前端岗位 - 2天极限面试指南

> 岗位：中高级前端开发
> 
> 核心要求：Vue.js + Webpack/Vite + 跨浏览器兼容 + 国产化适配 + 业务系统开发
> 
> 准备时间：2天

---

## 📋 岗位要求分析

根据 JD，面试重点按优先级排序：

| 优先级 | 技术点 | 权重 |
|--------|--------|------|
| ⭐⭐⭐⭐⭐ | Vue.js 框架（Vue2/Vue3） | 30% |
| ⭐⭐⭐⭐⭐ | HTML5/CSS3/JavaScript ES6+ | 25% |
| ⭐⭐⭐⭐ | Webpack/Vite 工程化 | 15% |
| ⭐⭐⭐⭐ | 跨浏览器兼容性（国产化浏览器） | 15% |
| ⭐⭐⭐ | 组件化/模块化开发 | 10% |
| ⭐⭐ | 性能优化 | 5% |

---

## 📅 2天学习计划

### Day 1：基础 + Vue 核心（10-12小时）

| 时间段 | 内容 | 时长 |
|--------|------|------|
| 上午 9:00-12:00 | HTML5/CSS3/JS 基础高频题 | 3h |
| 下午 14:00-18:00 | Vue2/Vue3 核心原理 | 4h |
| 晚上 19:30-22:30 | Vue 生态（Router/Vuex/Pinia） | 3h |

### Day 2：工程化 + 兼容性 + 实战（10-12小时）

| 时间段 | 内容 | 时长 |
|--------|------|------|
| 上午 9:00-12:00 | Webpack/Vite + 组件化 | 3h |
| 下午 14:00-18:00 | 跨浏览器兼容 + 国产化适配 | 4h |
| 晚上 19:30-22:30 | 业务场景题 + 项目准备 + 模拟 | 3h |

---

## Day 1 上午：HTML5/CSS3/JavaScript 基础（3小时）

### 1.1 HTML5 核心知识点

```html
<!-- 语义化标签 -->
<header>头部</header>
<nav>导航</nav>
<main>主内容</main>
<article>文章</article>
<section>区块</section>
<aside>侧边栏</aside>
<footer>底部</footer>

<!-- 语义化的好处 -->
1. SEO 友好
2. 可访问性（屏幕阅读器）
3. 代码可读性
4. 便于维护
```

**HTML5 新特性：**
```
- 语义化标签
- 表单增强（date、email、number、range、search）
- 音视频（audio、video）
- Canvas / SVG
- 本地存储（localStorage、sessionStorage）
- Web Worker
- WebSocket
- Geolocation
- 拖拽 API
```

**面试常问：**
```
Q: localStorage 和 sessionStorage 的区别？
A: 
- localStorage：永久存储，除非手动清除
- sessionStorage：会话级别，关闭标签页就清除
- 都是 5MB 左右的存储空间
- 都只能存储字符串

Q: Cookie、localStorage、sessionStorage 区别？
A:
| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|--------------|----------------|
| 大小 | 4KB | 5MB | 5MB |
| 有效期 | 可设置 | 永久 | 会话级 |
| 服务端通信 | 自动携带 | 不携带 | 不携带 |
| 作用域 | 同源+路径 | 同源 | 同源+同标签 |
```

### 1.2 CSS3 核心知识点

**盒模型：**
```css
/* 标准盒模型（默认） */
box-sizing: content-box;
/* 宽度 = content */

/* IE盒模型 */
box-sizing: border-box;
/* 宽度 = content + padding + border */

/* 推荐全局设置 */
* {
  box-sizing: border-box;
}
```

**BFC（块级格式化上下文）：**
```css
/* 触发 BFC 的方式 */
1. float 不为 none
2. position 为 absolute 或 fixed
3. display 为 inline-block、flex、grid
4. overflow 不为 visible

/* BFC 的作用 */
1. 清除浮动
2. 防止 margin 重叠
3. 阻止元素被浮动元素覆盖  
```

**Flex 布局（必须熟练）：**
```css
/* 容器属性 */
.container {
  display: flex;
  flex-direction: row | column;           /* 主轴方向 */
  justify-content: center | space-between; /* 主轴对齐 */
  align-items: center | stretch;           /* 交叉轴对齐 */
  flex-wrap: wrap | nowrap;                /* 换行 */
}

/* 项目属性 */
.item {
  flex: 1;              /* flex-grow flex-shrink flex-basis */
  align-self: center;   /* 单独对齐 */
  order: 1;             /* 排序 */
}

/* 常见布局 */
/* 垂直水平居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.space-between {
  display: flex;
  justify-content: space-between;
}

/* 等分布局 */
.equal {
  display: flex;
}
.equal > div {
  flex: 1;
}
```

**CSS3 新特性：**
```css
/* 圆角 */
border-radius: 10px;

/* 阴影 */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
text-shadow: 1px 1px 2px #000;

/* 渐变 */
background: linear-gradient(to right, #ff0000, #0000ff);
background: radial-gradient(circle, #ff0000, #0000ff);

/* 过渡 */
transition: all 0.3s ease;

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate {
  animation: fadeIn 1s ease;
}

/* 变换 */
transform: translate(10px, 10px) rotate(45deg) scale(1.5);

/* 媒体查询 */
@media screen and (max-width: 768px) {
  .container { flex-direction: column; }
}
```

### 1.3 JavaScript ES6+ 核心

**变量声明：**
```javascript
// var：函数作用域，变量提升
// let：块级作用域，暂时性死区
// const：块级作用域，常量（引用类型可修改属性）

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3 3 3
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0 1 2
}
```

**箭头函数：**
```javascript
// 特点
1. 没有自己的 this，继承外层
2. 没有 arguments
3. 不能作为构造函数
4. 没有 prototype

// 使用场景
const arr = [1, 2, 3];
arr.map(x => x * 2);

// 不适用场景
// 对象方法（需要 this）
// 事件处理（需要 this 指向元素）
```

**解构赋值：**
```javascript
// 数组解构
const [a, b, c] = [1, 2, 3];
const [first, ...rest] = [1, 2, 3, 4];

// 对象解构
const { name, age } = { name: '张三', age: 18 };
const { name: userName } = { name: '张三' }; // 重命名

// 默认值
const { name = '默认' } = {};

// 函数参数解构
function fn({ name, age = 18 }) {
  console.log(name, age);
}
```

**展开运算符：**
```javascript
// 数组
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

// 对象
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// 函数参数
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

**Promise：**
```javascript
// 基本使用
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('成功'), 1000);
});

promise
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('完成'));

// Promise.all：全部成功才成功
Promise.all([p1, p2, p3]).then(results => {});

// Promise.race：第一个完成的结果
Promise.race([p1, p2, p3]).then(result => {});

// Promise.allSettled：全部完成，不管成功失败
Promise.allSettled([p1, p2, p3]).then(results => {});
```

**async/await：**
```javascript
async function fetchData() {
  try {
    const res1 = await fetch('/api/user');
    const user = await res1.json();
    
    const res2 = await fetch(`/api/posts/${user.id}`);
    const posts = await res2.json();
    
    return posts;
  } catch (error) {
    console.error(error);
  }
}

// 并行请求
async function fetchAll() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
}
```

**数组方法：**
```javascript
const arr = [1, 2, 3, 4, 5];

// map：映射，返回新数组
arr.map(x => x * 2); // [2, 4, 6, 8, 10]

// filter：过滤，返回新数组
arr.filter(x => x > 2); // [3, 4, 5]

// reduce：累积
arr.reduce((sum, x) => sum + x, 0); // 15

// find：查找第一个符合条件的元素
arr.find(x => x > 2); // 3

// findIndex：查找索引
arr.findIndex(x => x > 2); // 2

// some：是否有符合条件的
arr.some(x => x > 4); // true

// every：是否全部符合条件
arr.every(x => x > 0); // true

// includes：是否包含
arr.includes(3); // true

// flat：扁平化
[[1, 2], [3, 4]].flat(); // [1, 2, 3, 4]
```

**this 指向：**
```javascript
// 1. 默认绑定：独立函数调用，指向 window（严格模式 undefined）
function fn() { console.log(this); }
fn(); // window

// 2. 隐式绑定：对象方法调用，指向调用对象
const obj = {
  name: '张三',
  say() { console.log(this.name); }
};
obj.say(); // 张三

// 3. 显式绑定：call/apply/bind
fn.call(obj);
fn.apply(obj);
const boundFn = fn.bind(obj);

// 4. new 绑定：指向新创建的对象
function Person(name) {
  this.name = name;
}
const p = new Person('张三');

// 5. 箭头函数：继承外层 this
```

**闭包：**
```javascript
// 定义：函数能够访问其词法作用域外的变量

// 应用场景
// 1. 数据私有化
function createCounter() {
  let count = 0;
  return {
    increment() { count++; },
    getCount() { return count; }
  };
}

// 2. 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 3. 节流
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
```

---

## Day 1 下午：Vue2/Vue3 核心原理（4小时）

### 2.1 Vue2 核心知识

**响应式原理：**
```javascript
// Vue2 使用 Object.defineProperty
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖收集器
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 收集依赖
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify(); // 通知更新
    }
  });
}

// 缺点
1. 无法监听数组索引变化
2. 无法监听对象属性的添加/删除
3. 需要递归遍历对象，性能开销大

// 解决方案
Vue.set(obj, 'newKey', value);
this.$set(this.obj, 'newKey', value);
```

**生命周期：**
```javascript
// 创建阶段
beforeCreate  // 实例初始化，data/methods 未创建
created       // data/methods 已创建，DOM 未挂载

// 挂载阶段
beforeMount   // 模板编译完成，DOM 未挂载
mounted       // DOM 已挂载，可以操作 DOM

// 更新阶段
beforeUpdate  // 数据变化，DOM 未更新
updated       // DOM 已更新

// 销毁阶段
beforeDestroy // 实例销毁前，可以清理定时器、事件监听
destroyed     // 实例已销毁

// 常见使用场景
created: 发起 API 请求
mounted: 操作 DOM、初始化第三方库
beforeDestroy: 清理定时器、取消订阅
```

**组件通信：**
```javascript
// 1. 父传子：props
// 父组件
<Child :message="msg" />

// 子组件
props: {
  message: {
    type: String,
    required: true,
    default: ''
  }
}

// 2. 子传父：$emit
// 子组件
this.$emit('update', data);

// 父组件
<Child @update="handleUpdate" />

// 3. 兄弟组件：EventBus
// bus.js
export const bus = new Vue();

// 组件A
bus.$emit('event', data);

// 组件B
bus.$on('event', (data) => {});

// 4. 跨层级：provide/inject
// 祖先组件
provide() {
  return { theme: this.theme };
}

// 后代组件
inject: ['theme']

// 5. Vuex 状态管理
```

**computed vs watch：**
```javascript
// computed：计算属性
// - 有缓存，依赖不变不重新计算
// - 必须有返回值
// - 适合：根据已有数据计算新数据
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

// watch：侦听器
// - 无缓存，每次都执行
// - 可以执行异步操作
// - 适合：监听数据变化执行副作用
watch: {
  searchQuery: {
    handler(newVal, oldVal) {
      this.fetchResults(newVal);
    },
    immediate: true, // 立即执行
    deep: true       // 深度监听
  }
}
```

**v-if vs v-show：**
```javascript
// v-if
// - 条件渲染，false 时不渲染 DOM
// - 有更高的切换开销
// - 适合：不频繁切换的场景

// v-show
// - 始终渲染 DOM，通过 display 控制显示
// - 有更高的初始渲染开销
// - 适合：频繁切换的场景
```

**v-for 与 key：**
```javascript
// key 的作用
// 1. 帮助 Vue 识别节点，提高 Diff 效率
// 2. 避免就地复用导致的问题

// 错误示例
<li v-for="(item, index) in list" :key="index">

// 正确示例
<li v-for="item in list" :key="item.id">

// 为什么不能用 index 作为 key？
// 当列表顺序变化时，index 会变化，导致错误复用
```

### 2.2 Vue3 核心知识

**Vue3 新特性：**
```javascript
1. Composition API
2. Proxy 响应式
3. 更好的 TypeScript 支持
4. Teleport 传送门
5. Fragments 多根节点
6. Suspense 异步组件
7. 更小的打包体积（Tree Shaking）
8. 更快的渲染性能
```

**响应式原理（Proxy）：**
```javascript
// Vue3 使用 Proxy
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object') {
        return reactive(result); // 惰性响应式
      }
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}

// 优点
1. 可以监听数组索引变化
2. 可以监听对象属性的添加/删除
3. 惰性响应式，性能更好
```

**Composition API：**
```javascript
import { ref, reactive, computed, watch, onMounted } from 'vue';

export default {
  setup() {
    // ref：基本类型
    const count = ref(0);
    
    // reactive：对象类型
    const state = reactive({
      name: '',
      list: []
    });
    
    // computed
    const double = computed(() => count.value * 2);
    
    // watch
    watch(count, (newVal, oldVal) => {
      console.log(newVal, oldVal);
    });
    
    // 生命周期
    onMounted(() => {
      console.log('mounted');
    });
    
    // 方法
    const increment = () => {
      count.value++;
    };
    
    // 返回给模板使用
    return {
      count,
      state,
      double,
      increment
    };
  }
};

// <script setup> 语法糖
<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>
```

**ref vs reactive：**
```javascript
// ref
// - 用于基本类型
// - 访问需要 .value
// - 可以整体替换
const count = ref(0);
count.value = 1;

// reactive
// - 用于对象类型
// - 直接访问属性
// - 不能整体替换（会丢失响应式）
const state = reactive({ count: 0 });
state.count = 1;

// 推荐
// - 基本类型用 ref
// - 对象类型用 reactive
// - 或者统一用 ref
```

**Vue3 生命周期：**
```javascript
// Options API → Composition API
beforeCreate  → setup()
created       → setup()
beforeMount   → onBeforeMount
mounted       → onMounted
beforeUpdate  → onBeforeUpdate
updated       → onUpdated
beforeUnmount → onBeforeUnmount（Vue3 改名）
unmounted     → onUnmounted（Vue3 改名）

// 使用
import { onMounted, onUnmounted } from 'vue';

setup() {
  onMounted(() => {
    console.log('mounted');
  });
  
  onUnmounted(() => {
    console.log('unmounted');
  });
}
```

**Vue2 vs Vue3 对比：**
```
| 特性 | Vue2 | Vue3 |
|------|------|------|
| 响应式 | Object.defineProperty | Proxy |
| API 风格 | Options API | Composition API |
| 生命周期 | beforeDestroy/destroyed | beforeUnmount/unmounted |
| 根节点 | 单根节点 | 多根节点（Fragments）|
| TypeScript | 支持一般 | 原生支持 |
| 性能 | 一般 | 更快 |
| 体积 | 较大 | 更小（Tree Shaking）|
```

---

## Day 1 晚上：Vue 生态（Router/Vuex/Pinia）（3小时）

### 3.1 Vue Router

**基本配置：**
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue') // 懒加载
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true // 将路由参数作为 props 传递
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('@/views/Dashboard.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

**路由模式：**
```javascript
// Hash 模式
// URL: http://example.com/#/user/1
// 原理：监听 hashchange 事件
createWebHashHistory()

// History 模式
// URL: http://example.com/user/1
// 原理：使用 pushState/replaceState
// 需要服务器配置支持
createWebHistory()

// 服务器配置（Nginx）
location / {
  try_files $uri $uri/ /index.html;
}
```

**导航守卫：**
```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 权限验证
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面标题
  document.title = to.meta.title || '默认标题';
});

// 路由独享守卫
{
  path: '/admin',
  beforeEnter: (to, from, next) => {
    // 检查权限
  }
}

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 不能访问 this
    next(vm => {
      // 可以通过 vm 访问组件实例
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时调用
  },
  beforeRouteLeave(to, from, next) {
    // 离开前确认
    if (this.hasUnsavedChanges) {
      const answer = confirm('确定离开？');
      next(answer);
    } else {
      next();
    }
  }
}
```

**路由传参：**
```javascript
// 1. params 参数
// 路由配置
{ path: '/user/:id', component: User }

// 跳转
router.push({ name: 'User', params: { id: 1 } });
// 或
router.push('/user/1');

// 获取
this.$route.params.id // Options API
const route = useRoute(); route.params.id // Composition API

// 2. query 参数
router.push({ path: '/search', query: { keyword: 'vue' } });
// URL: /search?keyword=vue

// 获取
this.$route.query.keyword

// 3. props 传参（推荐）
{ path: '/user/:id', component: User, props: true }
// 组件中直接通过 props 接收
props: ['id']
```

### 3.2 Vuex（Vue2 常用）

**核心概念：**
```javascript
// store/index.js
import Vuex from 'vuex';

export default new Vuex.Store({
  // 状态
  state: {
    count: 0,
    user: null
  },
  
  // 计算属性
  getters: {
    doubleCount: state => state.count * 2,
    isLoggedIn: state => !!state.user
  },
  
  // 同步修改状态
  mutations: {
    INCREMENT(state) {
      state.count++;
    },
    SET_USER(state, user) {
      state.user = user;
    }
  },
  
  // 异步操作
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials);
      commit('SET_USER', user);
    }
  },
  
  // 模块化
  modules: {
    user: userModule,
    product: productModule
  }
});

// 组件中使用
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['count', 'user']),
    ...mapGetters(['doubleCount', 'isLoggedIn'])
  },
  methods: {
    ...mapMutations(['INCREMENT']),
    ...mapActions(['login'])
  }
}
```

### 3.3 Pinia（Vue3 推荐）

**基本使用：**
```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    name: '',
    token: '',
    roles: []
  }),
  
  // 计算属性
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.roles.includes('admin')
  },
  
  // 方法（同步/异步都可以）
  actions: {
    async login(credentials) {
      const { token, user } = await api.login(credentials);
      this.token = token;
      this.name = user.name;
      this.roles = user.roles;
    },
    logout() {
      this.token = '';
      this.name = '';
      this.roles = [];
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
    name.value = res.user.name;
  }
  
  return { name, token, isLoggedIn, login };
});

// 组件中使用
<script setup>
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

// 解构需要用 storeToRefs 保持响应式
const { name, isLoggedIn } = storeToRefs(userStore);

// 方法可以直接解构
const { login, logout } = userStore;
</script>
```

**Pinia vs Vuex：**
```
| 特性 | Vuex | Pinia |
|------|------|-------|
| mutations | 需要 | 不需要 |
| 模块化 | 需要配置 | 天然支持 |
| TypeScript | 支持一般 | 完美支持 |
| 体积 | 较大 | 更小 |
| API | 复杂 | 简洁 |
| Vue 版本 | Vue2/3 | Vue2/3 |
```

---

## Day 2 上午：Webpack/Vite + 组件化（3小时）

### 4.1 Webpack 核心概念

**基本配置：**
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  // 入口
  entry: './src/main.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  
  // 模式
  mode: 'production', // development | production
  
  // 模块处理
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new VueLoaderPlugin()
  ],
  
  // 解析
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器
  devServer: {
    port: 8080,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
```

**Loader vs Plugin：**
```javascript
// Loader：转换器
// - 处理单个文件
// - 将非 JS 文件转换为 JS 模块
// - 执行顺序：从右到左，从下到上

// 常用 Loader
babel-loader    // ES6+ 转 ES5
vue-loader      // 处理 .vue 文件
css-loader      // 处理 CSS
style-loader    // 将 CSS 注入 DOM
sass-loader     // 处理 SCSS
file-loader     // 处理文件
url-loader      // 小文件转 base64

// Plugin：扩展器
// - 扩展 Webpack 功能
// - 监听构建生命周期事件

// 常用 Plugin
HtmlWebpackPlugin     // 生成 HTML
MiniCssExtractPlugin  // 提取 CSS
CleanWebpackPlugin    // 清理目录
DefinePlugin          // 定义环境变量
CopyWebpackPlugin     // 复制文件
```

**构建优化：**
```javascript
// 1. 代码分割
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: -10
      }
    }
  }
}

// 2. 缓存
cache: {
  type: 'filesystem'
}

// 3. 多进程构建
{
  test: /\.js$/,
  use: ['thread-loader', 'babel-loader']
}

// 4. 缩小搜索范围
resolve: {
  modules: [path.resolve(__dirname, 'node_modules')],
  extensions: ['.js', '.vue']
}
```

### 4.2 Vite 配置

**基本配置：**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          elementPlus: ['element-plus']
        }
      }
    }
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
});
```

**Vite 为什么快：**
```
开发环境：
1. 基于原生 ES Module，按需编译
2. 使用 esbuild 预构建依赖（比 Webpack 快 10-100 倍）
3. 利用浏览器缓存

生产环境：
1. 使用 Rollup 打包
2. 自动代码分割
3. CSS 代码分割
```

### 4.3 组件化开发

**组件设计原则：**
```javascript
// 1. 单一职责
// 每个组件只做一件事

// 2. 可复用性
// 通过 props 和 slots 提高复用性

// 3. 可维护性
// 清晰的命名、完善的注释

// 4. 低耦合
// 组件之间尽量独立
```

**组件封装示例：**
```vue
<!-- components/BaseButton.vue -->
<template>
  <button
    :class="['btn', `btn-${type}`, `btn-${size}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-icon"></span>
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = (e) => {
  if (!props.loading && !props.disabled) {
    emit('click', e);
  }
};
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background: #409eff;
  color: white;
}
.btn-danger {
  background: #f56c6c;
  color: white;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

**表单组件封装：**
```vue
<!-- components/BaseInput.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  disabled: Boolean,
  error: String
});

const emit = defineEmits(['update:modelValue', 'blur']);

const inputId = computed(() => `input-${Math.random().toString(36).slice(2)}`);

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
};

const handleBlur = (e) => {
  emit('blur', e);
};
</script>
```

**表格组件封装：**
```vue
<!-- components/BaseTable.vue -->
<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.prop" :width="col.width">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="row.id || index">
          <td v-for="col in columns" :key="col.prop">
            <slot :name="col.prop" :row="row" :index="index">
              {{ row[col.prop] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!data.length">
          <td :colspan="columns.length" class="empty">暂无数据</td>
        </tr>
      </tbody>
    </table>
    
    <!-- 分页 -->
    <div v-if="pagination" class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  pagination: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 }
});

const emit = defineEmits(['page-change']);

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const changePage = (page) => {
  emit('page-change', page);
};
</script>
```

---

## Day 2 下午：跨浏览器兼容 + 国产化适配（4小时）

### 5.1 跨浏览器兼容性

**常见兼容性问题：**
```css
/* 1. CSS 前缀 */
.box {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

/* 使用 autoprefixer 自动添加 */
/* postcss.config.js */
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
};

/* 2. Flex 布局兼容 */
.container {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

/* 3. 盒模型统一 */
* {
  box-sizing: border-box;
}

/* 4. 清除默认样式 */
/* 使用 normalize.css 或 reset.css */
```

**JavaScript 兼容：**
```javascript
// 1. ES6+ 语法兼容
// 使用 Babel 转译
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

// 2. API Polyfill
// 安装 core-js
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 3. 事件兼容
// addEventListener vs attachEvent
function addEvent(element, type, handler) {
  if (element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent) {
    element.attachEvent('on' + type, handler);
  } else {
    element['on' + type] = handler;
  }
}

// 4. 获取样式兼容
function getStyle(element, prop) {
  if (window.getComputedStyle) {
    return window.getComputedStyle(element)[prop];
  } else {
    return element.currentStyle[prop]; // IE
  }
}
```

**浏览器检测：**
```javascript
// 检测浏览器类型
function getBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('trident') || ua.includes('msie')) return 'IE';
  
  return 'Unknown';
}

// 检测是否为 IE
function isIE() {
  return !!window.ActiveXObject || 'ActiveXObject' in window;
}

// 特性检测（推荐）
if ('fetch' in window) {
  // 支持 fetch
} else {
  // 使用 XMLHttpRequest 或 polyfill
}
```

### 5.2 国产化浏览器适配

**国产浏览器列表：**
```
1. 360 安全浏览器 / 360 极速浏览器
2. QQ 浏览器
3. 搜狗浏览器
4. 猎豹浏览器
5. 2345 浏览器
6. 红莲花浏览器（政府专用）
7. 奇安信可信浏览器
8. 统信 UOS 浏览器
9. 麒麟浏览器

// 大多数国产浏览器基于 Chromium 内核
// 部分有双内核（Chromium + Trident/IE）
```

**国产浏览器适配策略：**
```html
<!-- 1. 强制使用 Chromium 内核 -->
<meta name="renderer" content="webkit">
<meta name="force-rendering" content="webkit">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

<!-- 2. 完整的 meta 配置 -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="renderer" content="webkit">
  <meta name="force-rendering" content="webkit">
</head>
```

**IE 兼容处理：**
```javascript
// 1. 条件注释（仅 IE 识别）
<!--[if IE]>
  <script src="ie-polyfill.js"></script>
<![endif]-->

<!--[if lt IE 9]>
  <script src="html5shiv.js"></script>
  <script src="respond.js"></script>
<![endif]-->

// 2. IE 不支持的特性处理
// - Promise → 使用 polyfill
// - fetch → 使用 polyfill 或 axios
// - ES6 语法 → Babel 转译
// - CSS Grid → 使用 Flex 替代
// - CSS 变量 → 使用 SCSS 变量

// 3. Vue 项目 IE11 兼容
// vue.config.js
module.exports = {
  transpileDependencies: true, // 转译 node_modules
};

// babel.config.js
module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'entry',
      corejs: 3
    }]
  ]
};

// main.js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

**信创环境适配：**
```javascript
// 信创环境特点
1. 国产操作系统（统信 UOS、麒麟）
2. 国产浏览器
3. 国产 CPU（龙芯、飞腾、鲲鹏）

// 适配要点
1. 避免使用 Windows 特有 API
2. 测试不同分辨率
3. 字体兼容（使用系统字体栈）
4. 避免使用 ActiveX 控件

// 字体设置
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}
```

### 5.3 常见兼容性问题解决方案

**1. 滚动条样式：**
```css
/* Webkit 浏览器 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #ccc #f1f1f1;
}
```

**2. 文本溢出省略：**
```css
/* 单行省略 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行省略（Webkit） */
.ellipsis-multi {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

/* 兼容方案 */
.ellipsis-multi {
  position: relative;
  max-height: 4.5em; /* line-height * 行数 */
  overflow: hidden;
}
.ellipsis-multi::after {
  content: '...';
  position: absolute;
  right: 0;
  bottom: 0;
  background: white;
}
```

**3. 图片兼容：**
```html
<!-- 使用 picture 元素 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="图片">
</picture>

<!-- 懒加载兼容 -->
<img 
  src="placeholder.jpg" 
  data-src="real-image.jpg" 
  loading="lazy"
  onerror="this.src='fallback.jpg'"
>
```

**4. 日期格式兼容：**
```javascript
// Safari 不支持 YYYY-MM-DD HH:mm:ss 格式
// 错误
new Date('2024-01-15 10:30:00'); // Safari 返回 Invalid Date

// 正确
new Date('2024-01-15T10:30:00');
new Date('2024/01/15 10:30:00');

// 兼容处理
function parseDate(dateStr) {
  return new Date(dateStr.replace(/-/g, '/'));
}
```

**5. 打印兼容：**
```css
@media print {
  /* 隐藏不需要打印的元素 */
  .no-print {
    display: none !important;
  }
  
  /* 分页控制 */
  .page-break {
    page-break-before: always;
  }
  
  /* 避免元素被分割 */
  .no-break {
    page-break-inside: avoid;
  }
}
```

### 5.4 测试与调试

**跨浏览器测试工具：**
```
1. BrowserStack - 在线测试各种浏览器
2. Sauce Labs - 自动化跨浏览器测试
3. 虚拟机 - 安装不同系统和浏览器
4. 国产浏览器官网下载测试
```

**调试技巧：**
```javascript
// 1. 控制台输出浏览器信息
console.log('User Agent:', navigator.userAgent);
console.log('Platform:', navigator.platform);

// 2. 特性检测
const features = {
  fetch: 'fetch' in window,
  promise: 'Promise' in window,
  proxy: 'Proxy' in window,
  flexbox: CSS.supports('display', 'flex'),
  grid: CSS.supports('display', 'grid')
};
console.table(features);

// 3. 错误监控
window.onerror = function(msg, url, line, col, error) {
  console.error('Error:', msg, 'at', url, line, col);
  // 上报错误
};
```

---

## Day 2 晚上：业务场景 + 项目准备（3小时）

### 6.1 国网业务系统常见场景

**1. 登录与权限管理：**
```javascript
// 登录流程
async function login(username, password) {
  try {
    const res = await axios.post('/api/auth/login', { username, password });
    const { token, user, permissions } = res.data;
    
    // 存储 token
    localStorage.setItem('token', token);
    
    // 存储用户信息
    store.commit('SET_USER', user);
    store.commit('SET_PERMISSIONS', permissions);
    
    // 动态添加路由
    const routes = generateRoutes(permissions);
    routes.forEach(route => router.addRoute(route));
    
    return true;
  } catch (error) {
    console.error('登录失败:', error);
    return false;
  }
}

// 路由权限控制
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.permission && !hasPermission(to.meta.permission)) {
    next('/403');
  } else {
    next();
  }
});

// 按钮权限指令
app.directive('permission', {
  mounted(el, binding) {
    const permission = binding.value;
    if (!hasPermission(permission)) {
      el.parentNode?.removeChild(el);
    }
  }
});

// 使用
<button v-permission="'user:delete'">删除</button>
```

**2. 表格与分页：**
```vue
<template>
  <div class="table-page">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="名称">
        <el-input v-model="searchForm.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status">
          <el-option label="全部" value="" />
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchData"
      @current-change="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getList, deleteItem } from '@/api/module';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);

const searchForm = reactive({
  name: '',
  status: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    });
    tableData.value = res.data.list;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const handleReset = () => {
  Object.assign(searchForm, { name: '', status: '' });
  handleSearch();
};

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该记录？', '提示');
  await deleteItem(row.id);
  ElMessage.success('删除成功');
  fetchData();
};

onMounted(fetchData);
</script>
```

**3. 表单验证：**
```vue
<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="form.phone" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue';

const formRef = ref();

const form = reactive({
  username: '',
  phone: '',
  email: ''
});

// 自定义验证器
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    // 提交表单
  }
};
</script>
```

**4. 文件上传：**
```vue
<template>
  <el-upload
    :action="uploadUrl"
    :headers="uploadHeaders"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :file-list="fileList"
    :limit="5"
  >
    <el-button type="primary">点击上传</el-button>
    <template #tip>
      <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 2MB</div>
    </template>
  </el-upload>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const fileList = ref([]);

const uploadUrl = '/api/upload';
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}));

const beforeUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png'].includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB');
    return false;
  }
  return true;
};

const handleSuccess = (response, file) => {
  ElMessage.success('上传成功');
  // 处理返回的文件 URL
};

const handleError = () => {
  ElMessage.error('上传失败');
};
</script>
```

**5. 数据导出：**
```javascript
// 导出 Excel
import * as XLSX from 'xlsx';

function exportExcel(data, filename = 'export.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

// 使用
const exportData = tableData.value.map(item => ({
  '名称': item.name,
  '状态': item.status === 1 ? '启用' : '禁用',
  '创建时间': item.createTime
}));
exportExcel(exportData, '数据导出.xlsx');
```

### 6.2 性能优化实践

```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  }
];

// 2. 组件懒加载
import { defineAsyncComponent } from 'vue';
const AsyncComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
);

// 3. 图片懒加载
<img v-lazy="imageUrl" />

// 4. 虚拟滚动（大数据列表）
<el-table-v2
  :columns="columns"
  :data="largeData"
  :width="700"
  :height="400"
/>

// 5. 防抖搜索
import { useDebounceFn } from '@vueuse/core';

const debouncedSearch = useDebounceFn((keyword) => {
  fetchSearchResults(keyword);
}, 300);

// 6. 缓存组件
<router-view v-slot="{ Component }">
  <keep-alive :include="['Dashboard', 'UserList']">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

### 6.3 项目介绍准备

**项目介绍模板（STAR 法则）：**
```
项目名称：XXX 管理系统

S（背景）：
这是一个为 XXX 业务开发的管理系统，主要用于 XXX 的管理和 XXX 的处理。
系统用户约 XXX 人，日均访问量 XXX。

T（任务）：
我在项目中负责 XXX 模块的前端开发，主要包括：
- XXX 功能的设计与实现
- XXX 组件的封装
- 性能优化

A（行动）：
1. 技术选型：选择 Vue3 + TypeScript + Element Plus
   原因：Vue3 性能更好，TS 提高代码质量，Element Plus 组件丰富
   
2. 架构设计：
   - 采用模块化目录结构
   - 封装统一的请求层和错误处理
   - 实现权限管理系统
   
3. 性能优化：
   - 路由懒加载，首屏加载时间减少 40%
   - 虚拟滚动处理大数据表格
   - 图片懒加载和压缩

R（结果）：
- 项目按时上线，获得用户好评
- 首屏加载时间从 3s 优化到 1.5s
- 代码复用率提高 30%
```

**常见项目问题准备：**
```
Q: 项目中遇到的最大挑战是什么？
A: 大数据量表格渲染卡顿问题
   解决方案：使用虚拟滚动，只渲染可视区域的数据

Q: 如何保证代码质量？
A: 
- ESLint + Prettier 代码规范
- TypeScript 类型检查
- Code Review
- 单元测试

Q: 如何处理跨浏览器兼容问题？
A:
- 使用 autoprefixer 自动添加 CSS 前缀
- Babel 转译 ES6+ 语法
- 针对 IE 使用 polyfill
- 测试主流浏览器和国产浏览器
```

---

## 📋 高频面试题速查

### JavaScript 基础题

```
Q: var、let、const 的区别？
A: 
- var：函数作用域，变量提升，可重复声明
- let：块级作用域，暂时性死区，不可重复声明
- const：块级作用域，声明时必须赋值，不可重新赋值

Q: 箭头函数和普通函数的区别？
A:
- 没有自己的 this，继承外层
- 没有 arguments 对象
- 不能作为构造函数
- 没有 prototype 属性

Q: 什么是闭包？
A: 函数能够访问其词法作用域外的变量。
应用：数据私有化、防抖节流、柯里化

Q: Promise 有哪些状态？
A: pending（等待）、fulfilled（成功）、rejected（失败）
状态一旦改变就不可逆

Q: async/await 的原理？
A: 是 Generator 函数的语法糖，内部使用 Promise 实现
async 函数返回 Promise，await 等待 Promise 完成

Q: 事件循环是什么？
A: JS 是单线程的，通过事件循环处理异步任务
执行顺序：同步代码 → 微任务 → 宏任务
微任务：Promise.then、MutationObserver
宏任务：setTimeout、setInterval、I/O
```

### Vue 面试题

```
Q: Vue2 和 Vue3 响应式的区别？
A:
- Vue2：Object.defineProperty，需要递归遍历，无法监听新增属性
- Vue3：Proxy，惰性响应式，可以监听新增/删除属性

Q: computed 和 watch 的区别？
A:
- computed：有缓存，依赖不变不重新计算，必须有返回值
- watch：无缓存，可以执行异步操作，适合监听变化执行副作用

Q: v-if 和 v-show 的区别？
A:
- v-if：条件渲染，false 时不渲染 DOM
- v-show：始终渲染，通过 display 控制显示
- 频繁切换用 v-show，否则用 v-if

Q: Vue 组件通信方式？
A:
- 父传子：props
- 子传父：$emit
- 兄弟：EventBus / Vuex / Pinia
- 跨层级：provide/inject

Q: Vue Router 的两种模式？
A:
- Hash 模式：URL 带 #，通过 hashchange 事件监听
- History 模式：URL 正常，需要服务器配置支持

Q: Vuex 的核心概念？
A:
- state：状态
- getters：计算属性
- mutations：同步修改状态
- actions：异步操作
- modules：模块化

Q: Vue 的生命周期？
A:
创建：beforeCreate → created
挂载：beforeMount → mounted
更新：beforeUpdate → updated
销毁：beforeDestroy → destroyed（Vue3: beforeUnmount → unmounted）

Q: key 的作用？
A: 帮助 Vue 识别节点，提高 Diff 效率，避免就地复用导致的问题
不建议用 index 作为 key
```

### 工程化面试题

```
Q: Webpack 的构建流程？
A:
1. 初始化参数
2. 开始编译，创建 Compiler
3. 确定入口
4. 编译模块，调用 Loader
5. 完成编译，得到依赖关系
6. 输出资源，组装 Chunk
7. 写入文件系统

Q: Loader 和 Plugin 的区别？
A:
- Loader：转换器，处理单个文件，将非 JS 转为 JS
- Plugin：扩展器，监听构建生命周期，扩展功能

Q: Vite 为什么快？
A:
- 基于原生 ES Module，按需编译
- 使用 esbuild 预构建依赖
- 利用浏览器缓存

Q: 如何优化 Webpack 构建速度？
A:
- 缩小搜索范围（resolve.modules）
- 使用缓存（cache）
- 多进程构建（thread-loader）
- 代码分割（splitChunks）
```

### 浏览器兼容题

```
Q: 如何处理 CSS 兼容性？
A:
- 使用 autoprefixer 自动添加前缀
- 使用 normalize.css 统一默认样式
- 使用 Flex 布局时注意兼容写法

Q: 如何处理 JS 兼容性？
A:
- 使用 Babel 转译 ES6+ 语法
- 使用 core-js polyfill
- 特性检测而非浏览器检测

Q: 国产浏览器如何适配？
A:
- 添加 meta 标签强制使用 webkit 内核
- 测试主流国产浏览器
- 避免使用过新的 API
```

---

## ✅ 面试前检查清单

### 技术准备
- [ ] HTML5 语义化标签、新特性
- [ ] CSS3 盒模型、BFC、Flex 布局
- [ ] JavaScript ES6+ 核心语法
- [ ] Vue2/Vue3 响应式原理
- [ ] Vue 生命周期、组件通信
- [ ] Vue Router 路由守卫
- [ ] Vuex/Pinia 状态管理
- [ ] Webpack/Vite 基本配置
- [ ] 跨浏览器兼容处理
- [ ] 国产化浏览器适配

### 项目准备
- [ ] 准备 2-3 个项目介绍
- [ ] 每个项目的技术栈和架构
- [ ] 遇到的难点和解决方案
- [ ] 性能优化的具体措施

### 软技能
- [ ] 自我介绍（1-2 分钟）
- [ ] 离职原因
- [ ] 职业规划
- [ ] 对国网/能源行业的了解

---

## 🎯 面试注意事项

```
1. 国网外包面试特点
   - 注重基础知识
   - 关注实际项目经验
   - 可能问业务系统相关问题
   - 稳定性和团队协作能力

2. 回答技巧
   - 先说结论，再展开
   - 结合实际项目经验
   - 不会的坦诚说不会，但展示学习能力

3. 加分项
   - 有政企项目经验
   - 了解国产化适配
   - 有 Element Plus/Ant Design Vue 使用经验
   - 了解大屏可视化

4. 着装建议
   - 商务休闲即可
   - 整洁大方
```

---

祝面试顺利，拿下 Offer！💪
