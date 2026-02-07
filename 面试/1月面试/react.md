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

**key 的作用：**
- 帮助 React 识别哪些元素改变了
- 提高 Diff 算法效率
- 保持组件状态

**为什么不推荐用 index 作为 key：**
- 列表重新排序时会导致性能问题
- 可能导致组件状态错乱
- 只有在列表静态不变时才可以用 index

## 二、React Hooks

### 2.1 什么是 Hooks？为什么要引入 Hooks？

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

## 五、React 18 新特性
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

## 六、React 19 新特性

### 大幅简化性能优化
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

## 八、高频面试问答

### 8.1 React 和 Vue 的区别？

**答案：**

| 特性 | React | Vue |
|------|-------|-----|
| 定位 | UI 库 | 渐进式框架 |
| 语法 | JSX | 模板 + JSX |
| 数据流 | 单向 | 双向绑定 |

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