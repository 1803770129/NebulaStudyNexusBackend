# React 面试题大全 (2026版)

## 目录
- [一、React 基础](#一react-基础)
- [二、React Hooks](#二react-hooks)
- [三、React 进阶](#三react-进阶)
- [四、React 性能优化](#四react-性能优化)
- [五、React 18 新特性](#五react-18-新特性)
- [六、React 19 新特性](#六react-19-新特性)
- [七、React 生态](#七react-生态)

---

## 一、React 基础

### 1.1 什么是 React？它的核心特点是什么？

**答案：**
React 是 Facebook 开发的用于构建用户界面的 JavaScript 库。

**核心特点：**
- **声明式编程**：描述 UI 应该是什么样子，React 负责更新 DOM
- **组件化**：将 UI 拆分成独立、可复用的组件
- **虚拟 DOM**：通过 diff 算法最小化 DOM 操作
- **单向数据流**：数据从父组件流向子组件
- **JSX 语法**：JavaScript 和 HTML 的结合

### 1.2 JSX 是什么？为什么要使用 JSX？

**答案：**
JSX 是 JavaScript XML 的缩写，是 JavaScript 的语法扩展。

```jsx
// JSX 写法
const element = <h1 className="title">Hello, World!</h1>;

// 编译后的 JavaScript
const element = React.createElement('h1', { className: 'title' }, 'Hello, World!');
```

**使用 JSX 的原因：**
- 更直观地描述 UI 结构
- 编译时可以发现错误
- 可以使用 JavaScript 的全部功能


### 1.3 React 组件有哪些类型？

**答案：**

**1. 函数组件（推荐）**
```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 箭头函数写法
const Welcome = ({ name }) => <h1>Hello, {name}</h1>;
```

**2. 类组件**
```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

**区别：**
| 特性 | 函数组件 | 类组件 |
|------|----------|--------|
| 语法 | 简洁 | 复杂 |
| this | 无 | 有 |
| 生命周期 | 用 Hooks | 有完整生命周期 |
| 状态 | useState | this.state |
| 性能 | 更好 | 稍差 |

### 1.4 什么是 Props？什么是 State？

**答案：**

**Props（属性）：**
- 从父组件传递给子组件的数据
- 只读，不能在子组件中修改
- 用于组件间通信

```jsx
// 父组件
<Child name="张三" age={25} />

// 子组件
function Child({ name, age }) {
  return <p>{name} - {age}岁</p>;
}
```

**State（状态）：**
- 组件内部管理的数据
- 可变，通过 setState 或 useState 修改
- 状态改变会触发重新渲染

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```

### 1.5 React 的生命周期有哪些？

**答案：**

**类组件生命周期（三个阶段）：**

**1. 挂载阶段（Mounting）**
- `constructor()` - 初始化 state
- `static getDerivedStateFromProps()` - 从 props 派生 state
- `render()` - 渲染组件
- `componentDidMount()` - 组件挂载后（发请求、订阅）

**2. 更新阶段（Updating）**
- `static getDerivedStateFromProps()`
- `shouldComponentUpdate()` - 性能优化
- `render()`
- `getSnapshotBeforeUpdate()` - 获取更新前的 DOM 信息
- `componentDidUpdate()` - 更新后执行

**3. 卸载阶段（Unmounting）**
- `componentWillUnmount()` - 清理工作（取消订阅、清除定时器）

**函数组件用 useEffect 模拟：**
```jsx
useEffect(() => {
  // componentDidMount + componentDidUpdate
  console.log('组件挂载或更新');
  
  return () => {
    // componentWillUnmount
    console.log('组件卸载');
  };
}, [dependencies]);
```


### 1.6 什么是虚拟 DOM？它的工作原理是什么？

**答案：**

**虚拟 DOM** 是真实 DOM 的 JavaScript 对象表示。

```javascript
// 虚拟 DOM 对象结构
const vNode = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'World' } }
    ]
  }
};
```

**工作原理：**
1. **创建虚拟 DOM**：JSX 编译成 React.createElement 调用
2. **Diff 算法比较**：新旧虚拟 DOM 树对比
3. **生成补丁**：计算最小更新操作
4. **批量更新真实 DOM**：一次性应用所有变更

**Diff 算法策略：**
- **同层比较**：只比较同一层级的节点
- **类型比较**：类型不同直接替换整个子树
- **Key 优化**：通过 key 识别列表中的元素

### 1.7 为什么列表渲染需要 key？

**答案：**

**key 的作用：**
- 帮助 React 识别哪些元素改变了
- 提高 Diff 算法效率
- 保持组件状态

```jsx
// ❌ 错误：使用 index 作为 key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ 正确：使用唯一标识作为 key
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

**为什么不推荐用 index 作为 key：**
- 列表重新排序时会导致性能问题
- 可能导致组件状态错乱
- 只有在列表静态不变时才可以用 index

### 1.8 React 事件处理与原生事件有什么区别？

**答案：**

| 特性 | React 事件 | 原生事件 |
|------|-----------|----------|
| 命名 | 驼峰命名 (onClick) | 小写 (onclick) |
| 处理函数 | 函数引用 | 字符串 |
| 阻止默认 | e.preventDefault() | return false 也可以 |
| 事件对象 | 合成事件 SyntheticEvent | 原生 Event |
| 事件委托 | 统一绑定到 root | 绑定到具体元素 |

```jsx
// React 事件
<button onClick={handleClick}>点击</button>

// 原生事件
<button onclick="handleClick()">点击</button>
```

**React 合成事件的优点：**
- 跨浏览器兼容
- 事件池复用（React 17 前）
- 统一的事件委托机制


---

## 二、React Hooks

### 2.1 什么是 Hooks？为什么要引入 Hooks？

**答案：**

Hooks 是 React 16.8 引入的特性，让函数组件也能使用 state 和其他 React 特性。

**引入原因：**
- 解决类组件的 this 指向问题
- 逻辑复用困难（HOC、render props 嵌套地狱）
- 生命周期方法中逻辑分散
- 代码更简洁，更容易理解

**Hooks 使用规则：**
1. 只在函数组件或自定义 Hook 中调用
2. 只在最顶层调用，不能在循环、条件、嵌套函数中调用

### 2.2 常用的 Hooks 有哪些？

**答案：**

**基础 Hooks：**
```jsx
// 1. useState - 状态管理
const [count, setCount] = useState(0);

// 2. useEffect - 副作用处理
useEffect(() => {
  document.title = `点击了 ${count} 次`;
  return () => { /* 清理函数 */ };
}, [count]);

// 3. useContext - 跨组件传值
const theme = useContext(ThemeContext);
```

**额外 Hooks：**
```jsx
// 4. useReducer - 复杂状态管理
const [state, dispatch] = useReducer(reducer, initialState);

// 5. useCallback - 缓存函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 6. useMemo - 缓存计算结果
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 7. useRef - 获取 DOM 或保存可变值
const inputRef = useRef(null);

// 8. useLayoutEffect - 同步执行副作用
useLayoutEffect(() => {
  // DOM 更新后同步执行
}, []);

// 9. useImperativeHandle - 自定义暴露给父组件的实例值
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current.focus()
}));
```

### 2.3 useState 的原理是什么？

**答案：**

```jsx
// 简化版 useState 实现原理
let state;
function useState(initialValue) {
  state = state || initialValue;
  
  function setState(newValue) {
    state = typeof newValue === 'function' 
      ? newValue(state) 
      : newValue;
    render(); // 触发重新渲染
  }
  
  return [state, setState];
}
```

**关键点：**
- 状态存储在 Fiber 节点的 memoizedState 链表中
- 每次渲染按顺序读取，所以不能在条件语句中使用
- setState 是异步的，会批量更新

**函数式更新：**
```jsx
// ❌ 可能有问题
setCount(count + 1);
setCount(count + 1); // 结果还是 +1

// ✅ 正确的连续更新
setCount(prev => prev + 1);
setCount(prev => prev + 1); // 结果是 +2
```


### 2.4 useEffect 和 useLayoutEffect 的区别？

**答案：**

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 异步，DOM 绑定后 | 同步，DOM 更新后立即执行 |
| 阻塞渲染 | 不阻塞 | 阻塞 |
| 使用场景 | 数据请求、订阅 | DOM 测量、同步更新 |

```jsx
// useEffect - 大多数场景
useEffect(() => {
  fetchData();
}, []);

// useLayoutEffect - 需要同步测量 DOM
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setPosition(rect);
}, []);
```

**执行顺序：**
1. React 更新 DOM
2. 浏览器绘制
3. useEffect 执行

vs

1. React 更新 DOM
2. useLayoutEffect 执行
3. 浏览器绘制

### 2.5 useCallback 和 useMemo 的区别和使用场景？

**答案：**

```jsx
// useCallback - 缓存函数引用
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// useMemo - 缓存计算结果
const expensiveValue = useMemo(() => {
  return items.filter(item => item.active).length;
}, [items]);
```

**区别：**
- `useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`
- useCallback 返回函数，useMemo 返回值

**使用场景：**

**useCallback：**
- 传递给子组件的回调函数
- 作为其他 Hook 的依赖

**useMemo：**
- 计算量大的操作
- 引用类型作为依赖时保持引用稳定

```jsx
// 配合 React.memo 使用
const Child = React.memo(({ onClick }) => {
  console.log('Child render');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  // 不使用 useCallback，每次渲染 Child 都会重新渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}
```

### 2.6 useRef 的使用场景有哪些？

**答案：**

**1. 获取 DOM 元素**
```jsx
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return <input ref={inputRef} />;
}
```

**2. 保存可变值（不触发重渲染）**
```jsx
function Timer() {
  const intervalRef = useRef(null);
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);
}
```

**3. 保存上一次的值**
```jsx
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
```

**4. 避免闭包陷阱**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;
  
  const handleClick = () => {
    setTimeout(() => {
      // 使用 ref 获取最新值
      console.log(countRef.current);
    }, 3000);
  };
}
```


### 2.7 如何自定义 Hook？

**答案：**

自定义 Hook 是以 `use` 开头的函数，可以复用状态逻辑。

```jsx
// 自定义 Hook：useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', '');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

**常见自定义 Hook：**
```jsx
// useDebounce - 防抖
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// useFetch - 数据请求
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading, error };
}

// useToggle - 切换状态
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}
```

---

## 三、React 进阶

### 3.1 什么是 React Fiber？

**答案：**

Fiber 是 React 16 引入的新的协调引擎，实现了增量渲染。

**解决的问题：**
- React 15 的 Stack Reconciler 是同步递归的
- 大型应用更新时会阻塞主线程，导致卡顿

**Fiber 的特点：**
- **可中断**：将渲染工作分成小单元
- **可恢复**：中断后可以继续执行
- **优先级调度**：高优先级任务先执行

**Fiber 节点结构：**
```javascript
{
  type: 'div',           // 组件类型
  key: null,             // key
  stateNode: DOM,        // 真实 DOM
  child: Fiber,          // 第一个子节点
  sibling: Fiber,        // 兄弟节点
  return: Fiber,         // 父节点
  pendingProps: {},      // 新 props
  memoizedProps: {},     // 旧 props
  memoizedState: {},     // 旧 state
  updateQueue: [],       // 更新队列
  effectTag: 'UPDATE',   // 副作用标记
}
```

**工作流程：**
1. **Reconciliation（协调）**：可中断，构建 Fiber 树
2. **Commit（提交）**：不可中断，更新 DOM


### 3.2 React 的 Diff 算法是怎样的？

**答案：**

React 的 Diff 算法基于三个策略，将 O(n³) 复杂度降为 O(n)：

**1. 树层级比较（Tree Diff）**
- 只比较同一层级的节点
- 跨层级移动会被当作删除+创建

**2. 组件类型比较（Component Diff）**
- 相同类型：继续比较子节点
- 不同类型：直接替换整个子树

**3. 元素列表比较（Element Diff）**
- 通过 key 识别元素
- 支持插入、移动、删除操作

```jsx
// Diff 过程示例
// 旧: A - B - C - D
// 新: A - C - D - B

// 有 key 时：移动 B 到末尾（1次移动）
// 无 key 时：更新 B→C, C→D, D→B（3次更新）
```

### 3.3 什么是受控组件和非受控组件？

**答案：**

**受控组件：**
- 表单数据由 React 状态管理
- 每次输入都会触发状态更新

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value} 
      onChange={e => setValue(e.target.value)} 
    />
  );
}
```

**非受控组件：**
- 表单数据由 DOM 自身管理
- 通过 ref 获取值

```jsx
function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return <input ref={inputRef} defaultValue="初始值" />;
}
```

**对比：**
| 特性 | 受控组件 | 非受控组件 |
|------|----------|------------|
| 数据管理 | React state | DOM |
| 实时验证 | 容易 | 困难 |
| 条件禁用 | 容易 | 困难 |
| 代码量 | 较多 | 较少 |
| 推荐场景 | 大多数场景 | 简单表单、文件上传 |

### 3.4 什么是高阶组件（HOC）？

**答案：**

高阶组件是接收组件并返回新组件的函数。

```jsx
// HOC 示例：添加 loading 功能
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={loading} users={users} />
```

**常见用途：**
- 代码复用、逻辑抽象
- 渲染劫持
- 状态抽象和操作
- Props 操作

**注意事项：**
- 不要在 render 中使用 HOC
- 复制静态方法
- 传递 ref 需要 React.forwardRef

### 3.5 什么是 Render Props？

**答案：**

Render Props 是一种通过 props 传递渲染函数来共享代码的技术。

```jsx
// Render Props 组件
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  );
}

// 使用
<Mouse render={({ x, y }) => (
  <p>鼠标位置: {x}, {y}</p>
)} />

// 也可以用 children
<Mouse>
  {({ x, y }) => <p>鼠标位置: {x}, {y}</p>}
</Mouse>
```

**HOC vs Render Props vs Hooks：**
| 方案 | 优点 | 缺点 |
|------|------|------|
| HOC | 不影响原组件 | 嵌套地狱、props 冲突 |
| Render Props | 灵活 | 嵌套地狱 |
| Hooks | 简洁、无嵌套 | 只能在函数组件中使用 |


### 3.6 Context 的使用场景和注意事项？

**答案：**

Context 用于跨组件层级传递数据，避免 props drilling。

```jsx
// 1. 创建 Context
const ThemeContext = React.createContext('light');

// 2. Provider 提供数据
function App() {
  const [theme, setTheme] = useState('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
}

// 3. Consumer 消费数据
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      切换主题
    </button>
  );
}
```

**使用场景：**
- 主题切换
- 用户认证信息
- 语言/国际化
- 全局配置

**注意事项：**
- Context 值变化会导致所有消费者重新渲染
- 可以拆分多个 Context 减少不必要的渲染
- 复杂状态管理建议使用 Redux/Zustand

### 3.7 React.memo、PureComponent 和 shouldComponentUpdate 的区别？

**答案：**

都是用于性能优化，避免不必要的重新渲染。

**React.memo（函数组件）：**
```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent(props) {
    return <div>{props.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.name === nextProps.name;
  }
);
```

**PureComponent（类组件）：**
```jsx
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

**shouldComponentUpdate（类组件）：**
```jsx
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.name !== this.props.name;
  }
  
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

**区别：**
| 特性 | React.memo | PureComponent | shouldComponentUpdate |
|------|------------|---------------|----------------------|
| 适用 | 函数组件 | 类组件 | 类组件 |
| 比较方式 | 浅比较 props | 浅比较 props + state | 自定义 |
| 灵活性 | 可自定义 | 固定 | 完全自定义 |

### 3.8 什么是 React Portal？

**答案：**

Portal 可以将子节点渲染到父组件 DOM 层级之外的 DOM 节点。

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// 使用
function App() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>打开弹窗</button>
      <Modal isOpen={showModal}>
        <h2>弹窗内容</h2>
        <button onClick={() => setShowModal(false)}>关闭</button>
      </Modal>
    </div>
  );
}
```

**使用场景：**
- 模态框/对话框
- 提示框/Toast
- 下拉菜单
- 悬浮卡片

**特点：**
- 事件冒泡仍然按 React 组件树传播
- Context 仍然有效


### 3.9 React 中的错误边界是什么？

**答案：**

错误边界是捕获子组件树中 JavaScript 错误的组件。

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // 上报错误到监控服务
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>出错了: {this.state.error.message}</h1>;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**无法捕获的错误：**
- 事件处理函数中的错误
- 异步代码（setTimeout、Promise）
- 服务端渲染
- 错误边界自身的错误

**函数组件版本（需要第三方库）：**
```jsx
// 使用 react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>出错了: {error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

---

## 四、React 性能优化

### 4.1 React 性能优化的方法有哪些？

**答案：**

**1. 减少不必要的渲染**
```jsx
// React.memo 缓存组件
const MemoizedComponent = React.memo(MyComponent);

// useMemo 缓存计算结果
const expensiveValue = useMemo(() => compute(a, b), [a, b]);

// useCallback 缓存函数
const handleClick = useCallback(() => {}, []);
```

**2. 代码分割和懒加载**
```jsx
// React.lazy + Suspense
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

**3. 虚拟列表**
```jsx
// 使用 react-window 或 react-virtualized
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={10000}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</FixedSizeList>
```

**4. 避免内联对象和函数**
```jsx
// ❌ 每次渲染都创建新对象
<Child style={{ color: 'red' }} onClick={() => {}} />

// ✅ 提取到外部或使用 useMemo/useCallback
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => {}, []);
<Child style={style} onClick={handleClick} />
```

**5. 使用 key 优化列表**
```jsx
// 使用稳定的唯一 key
{items.map(item => <Item key={item.id} data={item} />)}
```

**6. 批量更新状态**
```jsx
// React 18 自动批处理
setCount(c => c + 1);
setFlag(f => !f);
// 只触发一次重渲染
```


### 4.2 如何分析和定位 React 性能问题？

**答案：**

**1. React DevTools Profiler**
- 记录组件渲染时间
- 查看组件渲染原因
- 识别不必要的重渲染

**2. Chrome Performance 面板**
- 分析 JavaScript 执行时间
- 查看长任务
- 分析内存使用

**3. React.Profiler 组件**
```jsx
<Profiler id="Navigation" onRender={callback}>
  <Navigation />
</Profiler>

function callback(
  id,           // Profiler 的 id
  phase,        // "mount" 或 "update"
  actualDuration,  // 本次更新花费的时间
  baseDuration,    // 不使用 memo 时的渲染时间
  startTime,       // 开始渲染的时间
  commitTime       // 提交更新的时间
) {
  console.log({ id, phase, actualDuration });
}
```

**4. why-did-you-render 库**
```jsx
import React from 'react';
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, {
  trackAllPureComponents: true,
});

// 在组件上标记
MyComponent.whyDidYouRender = true;
```

### 4.3 什么是 React 的批量更新？

**答案：**

批量更新是将多个状态更新合并为一次重渲染。

**React 17 及之前：**
```jsx
// 在事件处理函数中自动批处理
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重渲染
}

// 在 setTimeout/Promise 中不会批处理
setTimeout(() => {
  setCount(c => c + 1);  // 触发一次重渲染
  setFlag(f => !f);      // 又触发一次重渲染
}, 0);
```

**React 18 自动批处理：**
```jsx
// 所有场景都自动批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重渲染
}, 0);

// 如果需要立即更新，使用 flushSync
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);
});
// DOM 已更新
flushSync(() => {
  setFlag(f => !f);
});
// DOM 已更新
```

---

## 五、React 18 新特性

### 5.1 React 18 有哪些重要更新？

**答案：**

**1. 并发渲染（Concurrent Rendering）**
- 渲染可中断
- 支持优先级调度
- 更流畅的用户体验

**2. 自动批处理（Automatic Batching）**
```jsx
// 所有更新都会自动批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重渲染
}, 0);
```

**3. Transitions（过渡更新）**
```jsx
import { useTransition, startTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleChange = (e) => {
    // 紧急更新：输入框
    setQuery(e.target.value);
    
    // 非紧急更新：搜索结果
    startTransition(() => {
      setResults(search(e.target.value));
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results data={results} />}
    </>
  );
}
```

**4. Suspense 增强**
```jsx
// 支持服务端渲染
<Suspense fallback={<Loading />}>
  <Comments />
</Suspense>
```

**5. 新的 Hooks**
```jsx
// useId - 生成唯一 ID
const id = useId();

// useDeferredValue - 延迟更新
const deferredValue = useDeferredValue(value);

// useSyncExternalStore - 订阅外部数据源
const state = useSyncExternalStore(subscribe, getSnapshot);

// useInsertionEffect - CSS-in-JS 库使用
useInsertionEffect(() => {
  // 在 DOM 变更前同步执行
}, []);
```


### 5.2 什么是并发模式（Concurrent Mode）？

**答案：**

并发模式是 React 18 的核心特性，让 React 可以同时准备多个版本的 UI。

**核心概念：**
- **可中断渲染**：长时间渲染可以被中断
- **优先级调度**：紧急更新优先处理
- **后台渲染**：在后台准备新 UI

**启用方式：**
```jsx
// React 18 新的根 API
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 旧 API（不支持并发特性）
import { render } from 'react-dom';
render(<App />, document.getElementById('root'));
```

**并发特性：**
```jsx
// 1. useTransition - 标记非紧急更新
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setSearchResults(results); // 非紧急
});

// 2. useDeferredValue - 延迟值更新
const deferredQuery = useDeferredValue(query);

// 3. Suspense - 等待异步内容
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

### 5.3 useTransition 和 useDeferredValue 的区别？

**答案：**

两者都用于标记非紧急更新，但使用场景不同。

**useTransition：**
- 用于控制状态更新
- 返回 isPending 状态
- 适合你能控制状态更新的场景

```jsx
function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  
  const handleChange = (e) => {
    // 紧急：更新输入框
    setQuery(e.target.value);
    
    // 非紧急：更新搜索结果
    startTransition(() => {
      setSearchResults(search(e.target.value));
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <SearchResults />
    </>
  );
}
```

**useDeferredValue：**
- 用于延迟值的更新
- 适合你无法控制值来源的场景
- 比如 props 传入的值

```jsx
function SearchResults({ query }) {
  // 延迟 query 的更新
  const deferredQuery = useDeferredValue(query);
  
  // 使用延迟值进行搜索
  const results = useMemo(
    () => search(deferredQuery),
    [deferredQuery]
  );
  
  // 显示是否在等待
  const isStale = query !== deferredQuery;
  
  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {results.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

**对比：**
| 特性 | useTransition | useDeferredValue |
|------|---------------|------------------|
| 控制对象 | 状态更新 | 值 |
| 返回值 | [isPending, startTransition] | deferredValue |
| 使用场景 | 能控制 setState | 无法控制值来源 |

### 5.4 React 18 的 Suspense 有什么改进？

**答案：**

**React 18 之前：**
- 只支持 React.lazy 代码分割
- 不支持服务端渲染

**React 18 改进：**

**1. 支持数据获取**
```jsx
// 配合支持 Suspense 的库使用（如 Relay、SWR、React Query）
function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileDetails />
      <Suspense fallback={<PostsLoading />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
}
```

**2. 支持服务端渲染（Streaming SSR）**
```jsx
// 服务端可以流式发送 HTML
// 客户端可以选择性水合
<Suspense fallback={<Spinner />}>
  <Comments />
</Suspense>
```

**3. 嵌套 Suspense**
```jsx
<Suspense fallback={<BigSpinner />}>
  <Header />
  <Suspense fallback={<SidebarLoading />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentLoading />}>
    <Content />
  </Suspense>
</Suspense>
```

**4. SuspenseList（实验性）**
```jsx
<SuspenseList revealOrder="forwards">
  <Suspense fallback={<Loading />}>
    <Item1 />
  </Suspense>
  <Suspense fallback={<Loading />}>
    <Item2 />
  </Suspense>
</SuspenseList>
```


---

## 六、React 19 新特性

### 6.1 React 19 有哪些重要更新？

**答案：**

React 19 是一个重大更新，带来了许多新特性：

**1. React Compiler（React 编译器）**
- 自动优化组件，无需手动 useMemo/useCallback
- 编译时自动添加记忆化
- 大幅简化性能优化

```jsx
// React 19 之前需要手动优化
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => process(data), [data]);
  const handleClick = useCallback(() => {}, []);
  return <div onClick={handleClick}>{processedData}</div>;
});

// React 19 编译器自动优化，直接写即可
function Component({ data }) {
  const processedData = process(data);
  const handleClick = () => {};
  return <div onClick={handleClick}>{processedData}</div>;
}
```

**2. Actions（动作）**
- 简化表单处理和数据变更
- 自动处理 pending 状态
- 支持乐观更新

```jsx
// 使用 useActionState（原 useFormState）
function UpdateName() {
  const [state, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const name = formData.get('name');
      const error = await updateName(name);
      if (error) {
        return { error };
      }
      return { success: true };
    },
    null
  );

  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? '更新中...' : '更新'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**3. 新的 Hooks**

```jsx
// useActionState - 处理 action 状态
const [state, action, isPending] = useActionState(fn, initialState);

// useFormStatus - 获取表单提交状态
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return <button disabled={pending}>提交</button>;
}

// useOptimistic - 乐观更新
function Messages({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );
  
  async function sendMessage(formData) {
    const message = formData.get('message');
    addOptimisticMessage({ text: message });
    await deliverMessage(message);
  }
  
  return (
    <>
      {optimisticMessages.map(msg => (
        <div key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </div>
      ))}
      <form action={sendMessage}>
        <input name="message" />
        <button>发送</button>
      </form>
    </>
  );
}

// use - 读取 Promise 或 Context
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <Comment key={c.id} data={c} />);
}
```

### 6.2 React 19 的 use Hook 是什么？

**答案：**

`use` 是 React 19 新增的 Hook，可以在渲染时读取资源（Promise 或 Context）。

**读取 Promise：**
```jsx
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  // 在渲染时读取 Promise
  const comments = use(commentsPromise);
  
  return (
    <ul>
      {comments.map(comment => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  );
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<Loading />}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

**读取 Context：**
```jsx
function Button() {
  // 可以在条件语句中使用（与 useContext 不同）
  if (someCondition) {
    const theme = use(ThemeContext);
    return <button className={theme}>Click</button>;
  }
  return <button>Click</button>;
}
```

**与 useContext 的区别：**
- `use` 可以在条件语句和循环中调用
- `use` 可以读取 Promise
- `useContext` 只能在组件顶层调用


### 6.3 React 19 的 Server Components 是什么？

**答案：**

Server Components 是在服务器上渲染的 React 组件，不会发送到客户端。

**特点：**
- 零 JavaScript 发送到客户端
- 可以直接访问后端资源（数据库、文件系统）
- 自动代码分割

```jsx
// Server Component（默认）
// 文件名: Comments.jsx 或 Comments.server.jsx
async function Comments({ postId }) {
  // 直接访问数据库
  const comments = await db.comments.findMany({ postId });
  
  return (
    <ul>
      {comments.map(comment => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  );
}

// Client Component
// 文件名: LikeButton.jsx 需要 'use client' 指令
'use client';

import { useState } from 'react';

function LikeButton() {
  const [likes, setLikes] = useState(0);
  
  return (
    <button onClick={() => setLikes(likes + 1)}>
      ❤️ {likes}
    </button>
  );
}
```

**Server vs Client Components：**
| 特性 | Server Components | Client Components |
|------|-------------------|-------------------|
| 渲染位置 | 服务器 | 客户端 |
| 交互性 | 无（静态） | 有（动态） |
| 状态/Hooks | 不能使用 | 可以使用 |
| 浏览器 API | 不能访问 | 可以访问 |
| 后端资源 | 可以直接访问 | 需要 API |
| Bundle 大小 | 不计入 | 计入 |

### 6.4 React 19 的 Actions 和表单处理改进

**答案：**

React 19 大幅简化了表单处理：

**1. form action 属性**
```jsx
function Form() {
  async function handleSubmit(formData) {
    'use server';
    const name = formData.get('name');
    await saveToDatabase(name);
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button type="submit">提交</button>
    </form>
  );
}
```

**2. useFormStatus**
```jsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

function Form() {
  return (
    <form action={submitForm}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

**3. useActionState**
```jsx
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await submitForm(formData);
      return result;
    },
    { message: '' }
  );
  
  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>提交</button>
      <p>{state.message}</p>
    </form>
  );
}
```

### 6.5 React 19 其他重要更新

**答案：**

**1. ref 作为 prop**
```jsx
// React 19 之前需要 forwardRef
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// React 19 直接作为 prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

**2. 改进的错误处理**
```jsx
// 新的错误边界 API
function App() {
  return (
    <ErrorBoundary
      fallback={<Error />}
      onError={(error, errorInfo) => {
        logError(error, errorInfo);
      }}
    >
      <Content />
    </ErrorBoundary>
  );
}
```

**3. 文档元数据支持**
```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <link rel="canonical" href={post.url} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

**4. 样式表支持**
```jsx
function Component() {
  return (
    <>
      <link rel="stylesheet" href="styles.css" precedence="default" />
      <div className="styled">内容</div>
    </>
  );
}
```

**5. 资源预加载**
```jsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

function App() {
  preinit('https://example.com/script.js', { as: 'script' });
  preload('https://example.com/font.woff', { as: 'font' });
  preconnect('https://api.example.com');
  prefetchDNS('https://cdn.example.com');
  
  return <div>App</div>;
}
```


---

## 七、React 生态

### 7.1 React 状态管理方案对比

**答案：**

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| useState/useReducer | 内置，简单 | 组件内状态 |
| Context | 内置，跨组件 | 主题、用户信息 |
| Redux | 单一数据源，可预测 | 大型应用 |
| Redux Toolkit | Redux 简化版 | 大型应用 |
| Zustand | 轻量，简单 | 中小型应用 |
| Jotai | 原子化，细粒度 | 需要细粒度更新 |
| Recoil | Facebook 出品，原子化 | 复杂状态依赖 |
| MobX | 响应式，自动追踪 | 喜欢 OOP 风格 |

**Zustand 示例：**
```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### 7.2 React Router 的使用

**答案：**

**React Router v6 基本用法：**
```jsx
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users/123">用户</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// 获取路由参数
function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>用户 {id}</h1>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}
```

**嵌套路由：**
```jsx
<Routes>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route index element={<DashboardHome />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Routes>

// Dashboard 组件中使用 Outlet
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet /> {/* 渲染子路由 */}
    </div>
  );
}
```

### 7.3 数据请求方案对比

**答案：**

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| fetch/axios | 基础请求 | 简单场景 |
| React Query | 缓存、自动重试 | 服务端状态管理 |
| SWR | 轻量、stale-while-revalidate | 数据获取 |
| Apollo Client | GraphQL | GraphQL API |
| RTK Query | Redux 集成 | 已使用 Redux |

**React Query 示例：**
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询
function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {data.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

// 变更
function AddUser() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newUser) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  return (
    <button onClick={() => mutation.mutate({ name: '新用户' })}>
      添加用户
    </button>
  );
}
```


### 7.4 常见面试编程题

**答案：**

**1. 实现一个 useDebounce Hook**
```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**2. 实现一个 useThrottle Hook**
```jsx
function useThrottle(value, interval) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;
    
    if (timeSinceLastExecution >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastExecution);
      
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  
  return throttledValue;
}
```

**3. 实现一个 usePrevious Hook**
```jsx
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>当前: {count}, 之前: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

**4. 实现一个 useLocalStorage Hook**
```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}
```

**5. 实现一个简单的 Redux**
```jsx
function createStore(reducer) {
  let state;
  let listeners = [];
  
  const getState = () => state;
  
  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };
  
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };
  
  dispatch({ type: '@@INIT' });
  
  return { getState, dispatch, subscribe };
}

// 使用
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

const store = createStore(reducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'INCREMENT' });
```


---

## 八、高频面试问答

### 8.1 React 和 Vue 的区别？

**答案：**

| 特性 | React | Vue |
|------|-------|-----|
| 定位 | UI 库 | 渐进式框架 |
| 语法 | JSX | 模板 + JSX |
| 数据流 | 单向 | 双向绑定 |
| 状态管理 | 外部库 | Vuex/Pinia |
| 更新机制 | 虚拟 DOM Diff | 响应式 + 虚拟 DOM |
| 学习曲线 | 较陡 | 较平缓 |
| 生态 | 更灵活 | 更统一 |

### 8.2 为什么 React 要用 className 而不是 class？

**答案：**
- `class` 是 JavaScript 的保留字
- JSX 本质是 JavaScript，需要避免冲突
- 类似的还有 `htmlFor` 代替 `for`

### 8.3 setState 是同步还是异步的？

**答案：**

**React 18 之前：**
- 在 React 事件处理函数中是异步的（批量更新）
- 在 setTimeout、原生事件中是同步的

**React 18 之后：**
- 所有场景都是异步的（自动批处理）
- 如需同步更新，使用 `flushSync`

```jsx
import { flushSync } from 'react-dom';

// 强制同步更新
flushSync(() => {
  setCount(count + 1);
});
// 此时 DOM 已更新
```

### 8.4 React 中如何实现组件通信？

**答案：**

**1. 父传子：Props**
```jsx
<Child data={data} />
```

**2. 子传父：回调函数**
```jsx
<Child onDataChange={(data) => setData(data)} />
```

**3. 兄弟组件：状态提升**
```jsx
function Parent() {
  const [data, setData] = useState('');
  return (
    <>
      <ChildA onDataChange={setData} />
      <ChildB data={data} />
    </>
  );
}
```

**4. 跨层级：Context**
```jsx
const DataContext = createContext();
<DataContext.Provider value={data}>
  <DeepChild />
</DataContext.Provider>
```

**5. 全局状态：Redux/Zustand**

### 8.5 React 中的 key 为什么不能用 index？

**答案：**

使用 index 作为 key 的问题：
1. **列表重排序时性能差**：React 会认为所有元素都变了
2. **组件状态错乱**：输入框内容可能跑到其他行
3. **动画异常**：删除/添加元素时动画不正确

**只有在以下情况可以用 index：**
- 列表是静态的，不会重排序
- 列表项没有 id
- 列表不会被过滤或重新排序

### 8.6 useEffect 的依赖数组为空和不传有什么区别？

**答案：**

```jsx
// 1. 不传依赖数组：每次渲染都执行
useEffect(() => {
  console.log('每次渲染都执行');
});

// 2. 空数组：只在挂载时执行一次
useEffect(() => {
  console.log('只执行一次');
}, []);

// 3. 有依赖：依赖变化时执行
useEffect(() => {
  console.log('count 变化时执行');
}, [count]);
```

### 8.7 如何避免 React 中的闭包陷阱？

**答案：**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // ❌ 闭包陷阱：3秒后打印的是点击时的 count
  const handleClick = () => {
    setTimeout(() => {
      console.log(count); // 旧值
    }, 3000);
  };
  
  // ✅ 方案1：使用 ref
  const countRef = useRef(count);
  countRef.current = count;
  
  const handleClick1 = () => {
    setTimeout(() => {
      console.log(countRef.current); // 最新值
    }, 3000);
  };
  
  // ✅ 方案2：使用函数式更新
  const handleClick2 = () => {
    setTimeout(() => {
      setCount(c => {
        console.log(c); // 最新值
        return c;
      });
    }, 3000);
  };
}
```

---

## 总结

面试时重点关注：
1. **基础概念**：JSX、组件、Props、State、生命周期
2. **Hooks**：useState、useEffect、useCallback、useMemo、useRef
3. **性能优化**：React.memo、虚拟列表、代码分割
4. **React 18**：并发模式、自动批处理、Transitions
5. **React 19**：React Compiler、Actions、Server Components、新 Hooks
6. **实战能力**：自定义 Hook、状态管理、路由

祝面试顺利！🎉
