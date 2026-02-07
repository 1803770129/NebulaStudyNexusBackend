# Web Worker 完全指南

## 一、基本概念

### 1.1 什么是 Web Worker？

Web Worker 是 HTML5 提供的一种在**后台线程**中运行 JavaScript 的机制，它允许在不阻塞主线程（UI线程）的情况下执行耗时的计算任务。

**核心思想：** JavaScript 是单线程的，Web Worker 让 JS 拥有了"多线程"能力。

### 1.2 为什么需要 Web Worker？

**问题场景：**
```javascript
// 主线程执行耗时任务会导致页面卡顿
function heavyCalculation() {
  let result = 0;
  for (let i = 0; i < 10000000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

// 执行这个函数时，页面会完全卡死
// 用户无法点击、滚动、输入任何内容
heavyCalculation();
```

**原因：** 浏览器的渲染和 JS 执行共用一个线程，JS 执行时间过长会阻塞页面渲染和用户交互。

**解决方案：** 使用 Web Worker 将耗时任务放到后台线程执行。

### 1.3 Web Worker 的特点

| 特点 | 说明 |
|------|------|
| 独立线程 | 在主线程之外运行，不阻塞 UI |
| 无法访问 DOM | 不能操作 document、window |
| 消息通信 | 通过 postMessage 和 onmessage 通信 |
| 同源限制 | Worker 脚本必须与主页面同源 |
| 独立作用域 | 有自己的全局对象 self |

---

## 二、Worker 的类型

### 2.1 三种 Worker 类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| Dedicated Worker | 专用 Worker，只能被创建它的页面使用 | 最常用，单页面计算任务 |
| Shared Worker | 共享 Worker，可被多个页面共享 | 多标签页数据共享 |
| Service Worker | 服务 Worker，可拦截网络请求 | PWA、离线缓存、推送通知 |

---

## 三、Dedicated Worker（专用 Worker）

### 3.1 基础用法

**主线程 (main.js):**
```javascript
// 1. 创建 Worker
const worker = new Worker('worker.js');

// 2. 发送消息给 Worker
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 3. 接收 Worker 返回的消息
worker.onmessage = function(event) {
  console.log('收到 Worker 结果:', event.data);
};

// 4. 错误处理
worker.onerror = function(error) {
  console.error('Worker 错误:', error.message);
  console.error('文件:', error.filename);
  console.error('行号:', error.lineno);
};

// 5. 终止 Worker
worker.terminate();
```

**Worker 线程 (worker.js):**
```javascript
// Worker 的全局对象是 self（也可以省略）
self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'calculate') {
    // 执行耗时计算
    const result = data.reduce((sum, num) => sum + num, 0);
    
    // 返回结果给主线程
    self.postMessage({ type: 'result', data: result });
  }
};

// Worker 内部也可以主动关闭自己
// self.close();
```

### 3.2 传递复杂数据

```javascript
// 主线程
worker.postMessage({
  type: 'process',
  payload: {
    users: [{ name: '张三', age: 25 }, { name: '李四', age: 30 }],
    config: { sortBy: 'age', order: 'desc' }
  }
});

// Worker 线程
self.onmessage = function(event) {
  const { type, payload } = event.data;
  
  if (type === 'process') {
    const { users, config } = payload;
    // 处理数据...
    const sorted = users.sort((a, b) => 
      config.order === 'desc' ? b[config.sortBy] - a[config.sortBy] : a[config.sortBy] - b[config.sortBy]
    );
    self.postMessage({ type: 'processed', data: sorted });
  }
};
```

### 3.3 Transferable Objects（可转移对象）

对于大型数据（如 ArrayBuffer），使用 transfer 可以避免复制，直接转移所有权：

```javascript
// 创建大型数据
const buffer = new ArrayBuffer(1024 * 1024 * 100); // 100MB

// 普通方式：复制数据（慢）
worker.postMessage({ buffer: buffer });

// Transfer 方式：转移所有权（快）
worker.postMessage({ buffer: buffer }, [buffer]);
// 注意：转移后主线程的 buffer 变为空，不可再使用

// Worker 中接收
self.onmessage = function(event) {
  const buffer = event.data.buffer;
  // 处理 buffer...
  
  // 处理完后可以转移回主线程
  self.postMessage({ buffer: buffer }, [buffer]);
};
```

### 3.4 在 Worker 中导入脚本

```javascript
// worker.js
// 导入外部脚本（同步加载）
importScripts('utils.js');
importScripts('lib1.js', 'lib2.js'); // 可以同时导入多个

// 使用导入的函数
const result = utilFunction(data);
```

---

## 四、Worker 的限制

### 4.1 不能访问的内容

```javascript
// ❌ 以下在 Worker 中都不可用
document          // DOM 操作
window            // 窗口对象
parent            // 父窗口
alert()           // 弹窗
confirm()         // 确认框
DOM 元素          // 任何 DOM 操作
```

### 4.2 可以使用的内容

```javascript
// ✅ 以下在 Worker 中可用
self              // Worker 全局对象
navigator         // 部分属性可用
location          // 只读
XMLHttpRequest    // Ajax 请求
fetch()           // Fetch API
setTimeout()      // 定时器
setInterval()     // 定时器
console           // 控制台
WebSocket         // WebSocket 连接
IndexedDB         // 客户端数据库
importScripts()   // 导入脚本
```

---

## 五、Shared Worker（共享 Worker）

多个页面可以共享同一个 Worker 实例。

### 5.1 基础用法

**主线程（多个页面都可以使用）:**
```javascript
// 创建或连接到共享 Worker
const sharedWorker = new SharedWorker('shared-worker.js');

// 通过 port 通信
sharedWorker.port.onmessage = function(event) {
  console.log('收到消息:', event.data);
};

// 发送消息
sharedWorker.port.postMessage('Hello from page');

// 必须调用 start()（如果使用 addEventListener）
sharedWorker.port.start();
```

**Shared Worker (shared-worker.js):**
```javascript
// 存储所有连接的端口
const ports = [];

// 当有新连接时触发
self.onconnect = function(event) {
  const port = event.ports[0];
  ports.push(port);
  
  port.onmessage = function(e) {
    console.log('收到消息:', e.data);
    
    // 广播给所有连接的页面
    ports.forEach(p => {
      p.postMessage('广播消息: ' + e.data);
    });
  };
  
  port.start();
};
```

### 5.2 Shared Worker 使用场景

- 多标签页数据同步
- 共享 WebSocket 连接
- 跨页面状态管理
- 减少重复的网络请求

---

## 六、实际使用场景

### 6.1 场景一：大数据计算

```javascript
// main.js - 计算大量数据的统计信息
const worker = new Worker('stats-worker.js');

const largeDataset = generateLargeDataset(1000000); // 100万条数据

worker.postMessage({ type: 'calculate', data: largeDataset });

worker.onmessage = function(event) {
  const { mean, median, stdDev } = event.data;
  console.log('平均值:', mean);
  console.log('中位数:', median);
  console.log('标准差:', stdDev);
};
```

```javascript
// stats-worker.js
self.onmessage = function(event) {
  const { data } = event.data;
  
  // 计算平均值
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  
  // 计算中位数
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // 计算标准差
  const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = Math.sqrt(avgSquaredDiff);
  
  self.postMessage({ mean, median, stdDev });
};
```

### 6.2 场景二：图像处理

```javascript
// main.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const worker = new Worker('image-worker.js');

// 使用 transfer 传递大型数据
worker.postMessage(
  { type: 'grayscale', imageData: imageData.data.buffer },
  [imageData.data.buffer]
);

worker.onmessage = function(event) {
  const processedData = new Uint8ClampedArray(event.data);
  const newImageData = new ImageData(processedData, canvas.width, canvas.height);
  ctx.putImageData(newImageData, 0, 0);
};
```

```javascript
// image-worker.js - 灰度处理
self.onmessage = function(event) {
  const buffer = event.data.imageData;
  const data = new Uint8ClampedArray(buffer);
  
  // 灰度处理
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;     // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // data[i + 3] 是 Alpha，保持不变
  }
  
  self.postMessage(data.buffer, [data.buffer]);
};
```

### 6.3 场景三：文件解析

```javascript
// main.js - 解析大型 CSV 文件
const fileInput = document.getElementById('fileInput');
const worker = new Worker('csv-worker.js');

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  worker.postMessage({ type: 'parse', file: file });
});

worker.onmessage = function(event) {
  if (event.data.type === 'progress') {
    console.log('解析进度:', event.data.percent + '%');
  } else if (event.data.type === 'complete') {
    console.log('解析完成，共', event.data.rows.length, '行');
    renderTable(event.data.rows);
  }
};
```

```javascript
// csv-worker.js
self.onmessage = async function(event) {
  const { file } = event.data;
  const text = await file.text();
  const lines = text.split('\n');
  const rows = [];
  
  for (let i = 0; i < lines.length; i++) {
    rows.push(lines[i].split(','));
    
    // 每处理 1000 行报告一次进度
    if (i % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        percent: Math.round((i / lines.length) * 100)
      });
    }
  }
  
  self.postMessage({ type: 'complete', rows: rows });
};
```

### 6.4 场景四：加密/解密

```javascript
// main.js
const worker = new Worker('crypto-worker.js');

worker.postMessage({
  type: 'encrypt',
  data: '敏感数据内容',
  key: 'secret-key-123'
});

worker.onmessage = function(event) {
  console.log('加密结果:', event.data.encrypted);
};
```

### 6.5 场景五：实时数据处理

```javascript
// main.js - 股票数据实时分析
const worker = new Worker('stock-worker.js');

// 模拟实时数据流
setInterval(() => {
  const stockData = {
    symbol: 'AAPL',
    price: 150 + Math.random() * 10,
    timestamp: Date.now()
  };
  worker.postMessage({ type: 'analyze', data: stockData });
}, 100);

worker.onmessage = function(event) {
  if (event.data.alert) {
    showNotification(event.data.message);
  }
  updateChart(event.data.analysis);
};
```

### 6.6 场景六：搜索和过滤

```javascript
// main.js - 大数据集搜索
const worker = new Worker('search-worker.js');

// 初始化数据
worker.postMessage({ type: 'init', data: hugeDataset });

// 搜索
searchInput.addEventListener('input', function(e) {
  worker.postMessage({ type: 'search', query: e.target.value });
});

worker.onmessage = function(event) {
  renderSearchResults(event.data.results);
};
```

---

## 七、最佳实践

### 7.1 Worker 池（复用 Worker）

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.busy = false;
      this.workers.push(worker);
    }
  }
  
  execute(data) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject };
      
      const availableWorker = this.workers.find(w => !w.busy);
      if (availableWorker) {
        this.runTask(availableWorker, task);
      } else {
        this.queue.push(task);
      }
    });
  }
  
  runTask(worker, task) {
    worker.busy = true;
    
    worker.onmessage = (event) => {
      task.resolve(event.data);
      worker.busy = false;
      
      // 处理队列中的下一个任务
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this.runTask(worker, nextTask);
      }
    };
    
    worker.onerror = (error) => {
      task.reject(error);
      worker.busy = false;
    };
    
    worker.postMessage(task.data);
  }
  
  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}

// 使用
const pool = new WorkerPool('worker.js', 4);

// 并行处理多个任务
const results = await Promise.all([
  pool.execute({ task: 1 }),
  pool.execute({ task: 2 }),
  pool.execute({ task: 3 }),
  pool.execute({ task: 4 }),
  pool.execute({ task: 5 }),
]);
```

### 7.2 内联 Worker（无需单独文件）

```javascript
// 将 Worker 代码内联到主文件中
const workerCode = `
  self.onmessage = function(event) {
    const result = event.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const worker = new Worker(workerUrl);

worker.postMessage(21);
worker.onmessage = (e) => console.log(e.data); // 42

// 使用完后释放 URL
URL.revokeObjectURL(workerUrl);
```

### 7.3 错误处理最佳实践

```javascript
// main.js
const worker = new Worker('worker.js');

worker.onerror = function(error) {
  console.error('Worker 错误:', {
    message: error.message,
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno
  });
  
  // 可以选择重启 Worker
  worker.terminate();
  // restartWorker();
};

// worker.js
self.onmessage = function(event) {
  try {
    // 业务逻辑
    const result = riskyOperation(event.data);
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
```

---

## 八、现代框架中使用 Worker

### 8.1 在 Vite/Webpack 中使用

```javascript
// Vite 方式
import MyWorker from './worker.js?worker';
const worker = new MyWorker();

// Webpack 5 方式
const worker = new Worker(new URL('./worker.js', import.meta.url));
```

### 8.2 在 React 中使用

```jsx
import { useEffect, useRef, useState } from 'react';

function useWorker(workerScript) {
  const workerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    workerRef.current = new Worker(workerScript);
    
    workerRef.current.onmessage = (event) => {
      setResult(event.data);
      setLoading(false);
    };
    
    return () => workerRef.current.terminate();
  }, [workerScript]);
  
  const postMessage = (data) => {
    setLoading(true);
    workerRef.current.postMessage(data);
  };
  
  return { result, loading, postMessage };
}

// 使用
function App() {
  const { result, loading, postMessage } = useWorker('/worker.js');
  
  return (
    <div>
      <button onClick={() => postMessage({ data: [1,2,3] })} disabled={loading}>
        {loading ? '计算中...' : '开始计算'}
      </button>
      {result && <p>结果: {result}</p>}
    </div>
  );
}
```

### 8.3 在 Vue 中使用

```vue
<template>
  <div>
    <button @click="calculate" :disabled="loading">
      {{ loading ? '计算中...' : '开始计算' }}
    </button>
    <p v-if="result">结果: {{ result }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const worker = ref(null);
const result = ref(null);
const loading = ref(false);

onMounted(() => {
  worker.value = new Worker('/worker.js');
  worker.value.onmessage = (event) => {
    result.value = event.data;
    loading.value = false;
  };
});

onUnmounted(() => {
  worker.value?.terminate();
});

const calculate = () => {
  loading.value = true;
  worker.value.postMessage({ data: [1, 2, 3, 4, 5] });
};
</script>
```

---

## 九、面试常见问题

### Q1: Web Worker 是什么？有什么作用？

**答：** Web Worker 是 HTML5 提供的在后台线程运行 JavaScript 的机制。作用是将耗时的计算任务放到后台执行，避免阻塞主线程，保持页面流畅响应。

### Q2: Web Worker 有哪些限制？

**答：**
- 不能访问 DOM（document、window）
- 不能使用 alert、confirm 等
- 只能通过 postMessage 与主线程通信
- Worker 脚本必须同源
- 不能访问 localStorage（但可以访问 IndexedDB）

### Q3: 主线程和 Worker 如何通信？

**答：** 通过 postMessage 发送消息，onmessage 接收消息。数据会被结构化克隆（深拷贝），大型数据可以使用 Transferable Objects 转移所有权避免复制。

### Q4: Dedicated Worker 和 Shared Worker 的区别？

**答：**
- Dedicated Worker：专用，只能被创建它的页面使用
- Shared Worker：共享，可被多个同源页面共享，通过 port 通信

### Q5: 什么场景适合使用 Web Worker？

**答：**
- 大数据计算（统计分析、排序）
- 图像/视频处理
- 文件解析（CSV、Excel）
- 加密解密
- 实时数据处理
- 复杂搜索过滤

### Q6: 如何在 Worker 中使用外部库？

**答：** 使用 `importScripts('lib.js')` 同步加载外部脚本。

---

## 十、总结

### 核心要点

1. **作用**：后台线程执行 JS，不阻塞 UI
2. **通信**：postMessage + onmessage
3. **限制**：无法访问 DOM
4. **类型**：Dedicated / Shared / Service
5. **优化**：Transferable Objects、Worker Pool

### 使用建议

| 场景 | 是否使用 Worker |
|------|----------------|
| 简单计算 | ❌ 不需要 |
| 耗时 > 50ms | ✅ 建议使用 |
| 需要操作 DOM | ❌ 不能使用 |
| 大数据处理 | ✅ 强烈建议 |
| 实时数据分析 | ✅ 建议使用 |

### 记忆口诀

**"Worker 三不能，通信靠消息"**
- 不能访问 DOM
- 不能访问 window
- 不能用 alert
- 通信用 postMessage