# HTML5 新特性完全指南

## 目录

1. [语义化标签](#1-语义化标签)
2. [表单增强](#2-表单增强)
3. [多媒体支持](#3-多媒体支持)
4. [Canvas 绘图](#4-canvas-绘图)
5. [SVG 支持](#5-svg-支持)
6. [地理定位 API](#6-地理定位-api)
7. [Web Storage](#7-web-storage)
8. [Web Workers](#8-web-workers)
9. [WebSocket](#9-websocket)
10. [拖放 API](#10-拖放-api)
11. [History API](#11-history-api)
12. [其他重要特性](#12-其他重要特性)

---

## 1. 语义化标签

HTML5 引入了大量语义化标签，让页面结构更清晰，对 SEO 和可访问性都有很大帮助。

### 1.1 结构性标签

```html
<!-- 页面头部 -->
<header>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>

<!-- 主要内容区域 -->
<main>
  <!-- 独立的文章内容 -->
  <article>
    <header>
      <h1>文章标题</h1>
      <time datetime="2026-01-05">2026年1月5日</time>
    </header>
    <section>
      <h2>第一章节</h2>
      <p>章节内容...</p>
    </section>
  </article>

  <!-- 侧边栏 -->
  <aside>
    <h3>相关文章</h3>
    <ul>
      <li><a href="#">推荐阅读1</a></li>
    </ul>
  </aside>
</main>

<!-- 页面底部 -->
<footer>
  <p>&copy; 2026 版权所有</p>
</footer>
```

### 1.2 语义化标签对比

| 标签 | 用途 | 替代的 div 用法 |
|------|------|----------------|
| `<header>` | 页面或区块的头部 | `<div class="header">` |
| `<nav>` | 导航链接区域 | `<div class="nav">` |
| `<main>` | 页面主要内容 | `<div class="main">` |
| `<article>` | 独立的文章内容 | `<div class="article">` |
| `<section>` | 文档中的章节 | `<div class="section">` |
| `<aside>` | 侧边栏内容 | `<div class="sidebar">` |
| `<footer>` | 页面或区块的底部 | `<div class="footer">` |
| `<figure>` | 图片/图表容器 | `<div class="figure">` |
| `<figcaption>` | 图片/图表说明 | `<div class="caption">` |
| `<mark>` | 高亮文本 | `<span class="highlight">` |
| `<time>` | 日期/时间 | `<span class="date">` |

### 1.3 语义化的好处

1. **SEO 优化**：搜索引擎能更好理解页面结构
2. **可访问性**：屏幕阅读器能正确解析内容
3. **代码可读性**：开发者更容易理解页面结构
4. **维护性**：结构清晰，便于后期维护

---

## 2. 表单增强

HTML5 大幅增强了表单功能，新增了多种输入类型和验证属性。

### 2.1 新增输入类型

```html
<!-- 邮箱输入 - 自动验证格式 -->
<input type="email" placeholder="请输入邮箱" required>

<!-- URL 输入 -->
<input type="url" placeholder="请输入网址">

<!-- 电话号码 -->
<input type="tel" placeholder="请输入电话">

<!-- 数字输入 - 可设置范围 -->
<input type="number" min="0" max="100" step="5" value="50">

<!-- 范围滑块 -->
<input type="range" min="0" max="100" value="50">

<!-- 日期选择器 -->
<input type="date">
<input type="datetime-local">
<input type="month">
<input type="week">
<input type="time">

<!-- 颜色选择器 -->
<input type="color" value="#ff0000">

<!-- 搜索框 -->
<input type="search" placeholder="搜索...">
```

### 2.2 新增表单属性

```html
<!-- placeholder - 占位提示文本 -->
<input type="text" placeholder="请输入用户名">

<!-- required - 必填字段 -->
<input type="text" required>

<!-- pattern - 正则验证 -->
<input type="text" pattern="[A-Za-z]{3,}" title="至少3个字母">

<!-- autofocus - 自动获取焦点 -->
<input type="text" autofocus>

<!-- autocomplete - 自动完成 -->
<input type="text" autocomplete="on">

<!-- multiple - 允许多个值 -->
<input type="email" multiple>
<input type="file" multiple>

<!-- min/max/step - 数值限制 -->
<input type="number" min="1" max="10" step="0.5">

<!-- form - 关联表单 -->
<form id="myForm">
  <input type="text" name="username">
</form>
<input type="submit" form="myForm" value="提交">

<!-- novalidate - 禁用验证 -->
<form novalidate>
  <input type="email" required>
</form>
```

### 2.3 datalist 数据列表

```html
<input list="browsers" placeholder="选择浏览器">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
</datalist>
```

### 2.4 output 输出元素

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" value="0"> +
  <input type="number" id="b" value="0"> =
  <output name="result" for="a b">0</output>
</form>
```

---

## 3. 多媒体支持

HTML5 原生支持音频和视频，无需 Flash 插件。

### 3.1 视频 Video

```html
<video width="640" height="360" controls poster="poster.jpg">
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.webm" type="video/webm">
  <source src="movie.ogg" type="video/ogg">
  <track kind="subtitles" src="subs_cn.vtt" srclang="zh" label="中文">
  您的浏览器不支持 video 标签
</video>
```

**视频属性说明：**

| 属性 | 说明 |
|------|------|
| `controls` | 显示播放控件 |
| `autoplay` | 自动播放 |
| `loop` | 循环播放 |
| `muted` | 静音 |
| `poster` | 视频封面图 |
| `preload` | 预加载策略：auto/metadata/none |
| `width/height` | 视频尺寸 |

### 3.2 音频 Audio

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持 audio 标签
</audio>
```

### 3.3 JavaScript 控制多媒体

```javascript
const video = document.querySelector('video');

// 播放控制
video.play();
video.pause();
video.currentTime = 30; // 跳转到30秒

// 事件监听
video.addEventListener('play', () => console.log('开始播放'));
video.addEventListener('pause', () => console.log('暂停'));
video.addEventListener('ended', () => console.log('播放结束'));
video.addEventListener('timeupdate', () => {
  console.log('当前时间:', video.currentTime);
});

// 属性获取
console.log('总时长:', video.duration);
console.log('是否暂停:', video.paused);
console.log('音量:', video.volume);
```

---

## 4. Canvas 绘图

Canvas 提供了强大的 2D 绘图能力。

### 4.1 基础用法

```html
<canvas id="myCanvas" width="500" height="300"></canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制矩形
ctx.fillStyle = '#FF0000';
ctx.fillRect(10, 10, 100, 50);

// 绘制边框矩形
ctx.strokeStyle = '#0000FF';
ctx.lineWidth = 3;
ctx.strokeRect(130, 10, 100, 50);

// 清除矩形区域
ctx.clearRect(20, 20, 30, 30);
</script>
```

### 4.2 绘制路径

```javascript
const ctx = canvas.getContext('2d');

// 绘制三角形
ctx.beginPath();
ctx.moveTo(75, 50);
ctx.lineTo(100, 75);
ctx.lineTo(100, 25);
ctx.closePath();
ctx.fill();

// 绘制圆形
ctx.beginPath();
ctx.arc(200, 50, 40, 0, Math.PI * 2);
ctx.stroke();

// 绘制弧线
ctx.beginPath();
ctx.arc(300, 50, 40, 0, Math.PI);
ctx.stroke();
```

### 4.3 绘制文本

```javascript
ctx.font = '30px Arial';
ctx.fillStyle = '#333';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// 填充文本
ctx.fillText('Hello Canvas', 250, 150);

// 描边文本
ctx.strokeText('Hello Canvas', 250, 200);
```

### 4.4 渐变和图案

```javascript
// 线性渐变
const linearGradient = ctx.createLinearGradient(0, 0, 200, 0);
linearGradient.addColorStop(0, 'red');
linearGradient.addColorStop(0.5, 'yellow');
linearGradient.addColorStop(1, 'green');
ctx.fillStyle = linearGradient;
ctx.fillRect(10, 10, 200, 100);

// 径向渐变
const radialGradient = ctx.createRadialGradient(300, 60, 10, 300, 60, 50);
radialGradient.addColorStop(0, 'white');
radialGradient.addColorStop(1, 'blue');
ctx.fillStyle = radialGradient;
ctx.fillRect(250, 10, 100, 100);
```

### 4.5 图像操作

```javascript
const img = new Image();
img.onload = function() {
  // 绘制图像
  ctx.drawImage(img, 0, 0);
  
  // 缩放绘制
  ctx.drawImage(img, 0, 0, 100, 100);
  
  // 裁剪绘制
  ctx.drawImage(img, 10, 10, 50, 50, 0, 0, 100, 100);
};
img.src = 'image.png';

// 获取像素数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data; // RGBA 数组

// 导出为图片
const dataURL = canvas.toDataURL('image/png');
```

---

## 5. SVG 支持

HTML5 原生支持内联 SVG。

### 5.1 基础 SVG

```html
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 矩形 -->
  <rect x="10" y="10" width="80" height="50" fill="blue" stroke="black" stroke-width="2"/>
  
  <!-- 圆形 -->
  <circle cx="150" cy="50" r="40" fill="red"/>
  
  <!-- 椭圆 -->
  <ellipse cx="100" cy="150" rx="60" ry="30" fill="green"/>
  
  <!-- 线条 -->
  <line x1="10" y1="100" x2="90" y2="100" stroke="black" stroke-width="2"/>
  
  <!-- 多边形 -->
  <polygon points="150,120 180,180 120,180" fill="purple"/>
  
  <!-- 路径 -->
  <path d="M10 180 Q 95 10 180 180" stroke="orange" fill="none" stroke-width="3"/>
  
  <!-- 文本 -->
  <text x="100" y="195" text-anchor="middle" fill="black">SVG 文本</text>
</svg>
```

### 5.2 Canvas vs SVG 对比

| 特性 | Canvas | SVG |
|------|--------|-----|
| 类型 | 位图（像素） | 矢量图 |
| 缩放 | 会失真 | 不失真 |
| 事件 | 整个画布 | 每个元素 |
| 性能 | 适合大量对象 | 适合少量对象 |
| 动画 | 需要重绘 | CSS/SMIL 动画 |
| 适用场景 | 游戏、图像处理 | 图标、图表、地图 |

---

## 6. 地理定位 API

获取用户的地理位置信息。

### 6.1 基础用法

```javascript
if ('geolocation' in navigator) {
  // 获取当前位置
  navigator.geolocation.getCurrentPosition(
    // 成功回调
    (position) => {
      console.log('纬度:', position.coords.latitude);
      console.log('经度:', position.coords.longitude);
      console.log('精度:', position.coords.accuracy, '米');
      console.log('海拔:', position.coords.altitude);
      console.log('时间戳:', position.timestamp);
    },
    // 错误回调
    (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          console.log('用户拒绝了定位请求');
          break;
        case error.POSITION_UNAVAILABLE:
          console.log('位置信息不可用');
          break;
        case error.TIMEOUT:
          console.log('请求超时');
          break;
      }
    },
    // 配置选项
    {
      enableHighAccuracy: true, // 高精度
      timeout: 5000,            // 超时时间
      maximumAge: 0             // 缓存时间
    }
  );
}
```

### 6.2 持续监听位置

```javascript
// 开始监听
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log('位置更新:', position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error('定位错误:', error.message);
  }
);

// 停止监听
navigator.geolocation.clearWatch(watchId);
```

---

## 7. Web Storage

本地存储数据，比 Cookie 更强大。

### 7.1 localStorage（永久存储）

```javascript
// 存储数据
localStorage.setItem('username', '张三');
localStorage.setItem('user', JSON.stringify({ name: '张三', age: 25 }));

// 读取数据
const username = localStorage.getItem('username');
const user = JSON.parse(localStorage.getItem('user'));

// 删除数据
localStorage.removeItem('username');

// 清空所有数据
localStorage.clear();

// 获取存储数量
console.log('存储项数量:', localStorage.length);

// 遍历存储
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

### 7.2 sessionStorage（会话存储）

```javascript
// 用法与 localStorage 相同，但数据仅在当前会话有效
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
sessionStorage.removeItem('token');
sessionStorage.clear();
```

### 7.3 Storage 对比

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|--------------|----------------|
| 容量 | ~4KB | ~5MB | ~5MB |
| 有效期 | 可设置 | 永久 | 会话期间 |
| 服务器通信 | 每次请求携带 | 不发送 | 不发送 |
| 作用域 | 同源 | 同源 | 同源同标签页 |

### 7.4 监听存储变化

```javascript
// 监听其他标签页的存储变化
window.addEventListener('storage', (event) => {
  console.log('存储变化:');
  console.log('键:', event.key);
  console.log('旧值:', event.oldValue);
  console.log('新值:', event.newValue);
  console.log('URL:', event.url);
});
```

---

## 8. Web Workers

在后台线程运行 JavaScript，不阻塞主线程。

### 8.1 基础用法

**主线程 (main.js):**
```javascript
// 创建 Worker
const worker = new Worker('worker.js');

// 发送消息给 Worker
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 接收 Worker 消息
worker.onmessage = (event) => {
  console.log('Worker 返回:', event.data);
};

// 错误处理
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message);
};

// 终止 Worker
worker.terminate();
```

**Worker 线程 (worker.js):**
```javascript
// 接收主线程消息
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  if (type === 'calculate') {
    // 执行耗时计算
    const result = data.reduce((sum, num) => sum + num, 0);
    
    // 返回结果给主线程
    self.postMessage({ result });
  }
};

// Worker 内部也可以关闭自己
// self.close();
```

### 8.2 Shared Worker（共享 Worker）

```javascript
// 多个页面可以共享同一个 Worker
const sharedWorker = new SharedWorker('shared-worker.js');

sharedWorker.port.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

sharedWorker.port.postMessage('Hello');
sharedWorker.port.start();
```

### 8.3 Worker 限制

- 无法访问 DOM
- 无法访问 window、document 对象
- 无法使用 alert、confirm 等
- 可以使用：XMLHttpRequest、fetch、setTimeout、setInterval
- 可以导入脚本：`importScripts('script1.js', 'script2.js')`

---

## 9. WebSocket

实现客户端与服务器的双向实时通信。

### 9.1 基础用法

```javascript
// 创建 WebSocket 连接
const socket = new WebSocket('wss://example.com/socket');

// 连接建立
socket.onopen = (event) => {
  console.log('连接已建立');
  socket.send('Hello Server!');
  socket.send(JSON.stringify({ type: 'message', content: 'Hello' }));
};

// 接收消息
socket.onmessage = (event) => {
  console.log('收到消息:', event.data);
  const data = JSON.parse(event.data);
  // 处理消息...
};

// 连接关闭
socket.onclose = (event) => {
  console.log('连接已关闭');
  console.log('关闭码:', event.code);
  console.log('关闭原因:', event.reason);
};

// 错误处理
socket.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 主动关闭连接
socket.close(1000, '正常关闭');
```

### 9.2 WebSocket 状态

```javascript
// socket.readyState 的值
WebSocket.CONNECTING // 0 - 正在连接
WebSocket.OPEN       // 1 - 已连接
WebSocket.CLOSING    // 2 - 正在关闭
WebSocket.CLOSED     // 3 - 已关闭

// 检查连接状态
if (socket.readyState === WebSocket.OPEN) {
  socket.send('消息');
}
```

---

## 10. 拖放 API

原生支持拖放操作。

### 10.1 基础拖放

```html
<!-- 可拖动元素 -->
<div id="drag-item" draggable="true">拖动我</div>

<!-- 放置区域 -->
<div id="drop-zone">放置区域</div>
```

```javascript
const dragItem = document.getElementById('drag-item');
const dropZone = document.getElementById('drop-zone');

// 拖动开始
dragItem.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
  e.target.style.opacity = '0.5';
});

// 拖动结束
dragItem.addEventListener('dragend', (e) => {
  e.target.style.opacity = '1';
});

// 拖动进入放置区
dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

// 拖动离开放置区
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drag-over');
});

// 拖动经过放置区（必须阻止默认行为）
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

// 放置
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const element = document.getElementById(id);
  dropZone.appendChild(element);
  dropZone.classList.remove('drag-over');
});
```

### 10.2 拖放事件顺序

1. `dragstart` - 开始拖动
2. `drag` - 拖动过程中（持续触发）
3. `dragenter` - 进入放置目标
4. `dragover` - 在放置目标上移动（持续触发）
5. `dragleave` - 离开放置目标
6. `drop` - 放置
7. `dragend` - 拖动结束

---

## 11. History API

操作浏览器历史记录，实现 SPA 路由。

### 11.1 基础方法

```javascript
// 前进/后退
history.back();     // 后退一页
history.forward();  // 前进一页
history.go(-2);     // 后退两页
history.go(1);      // 前进一页

// 获取历史记录长度
console.log('历史记录数:', history.length);
```

### 11.2 pushState 和 replaceState

```javascript
// 添加历史记录（不刷新页面）
history.pushState(
  { page: 'home' },           // state 对象
  'Home Page',                // 标题（大多数浏览器忽略）
  '/home'                     // URL
);

// 替换当前历史记录
history.replaceState(
  { page: 'about' },
  'About Page',
  '/about'
);

// 获取当前状态
console.log('当前状态:', history.state);
```

### 11.3 监听历史变化

```javascript
// 监听前进/后退
window.addEventListener('popstate', (event) => {
  console.log('URL 变化');
  console.log('状态:', event.state);
  
  // 根据状态渲染页面
  if (event.state) {
    renderPage(event.state.page);
  }
});
```

### 11.4 简单 SPA 路由实现

```javascript
class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('popstate', () => this.handleRoute());
  }
  
  addRoute(path, handler) {
    this.routes[path] = handler;
  }
  
  navigate(path) {
    history.pushState({ path }, '', path);
    this.handleRoute();
  }
  
  handleRoute() {
    const path = window.location.pathname;
    const handler = this.routes[path];
    if (handler) {
      handler();
    }
  }
}

// 使用
const router = new Router();
router.addRoute('/', () => console.log('首页'));
router.addRoute('/about', () => console.log('关于页'));
router.navigate('/about');
```

---

## 12. 其他重要特性

### 12.1 自定义数据属性 (data-*)

```html
<div id="user" data-id="123" data-user-name="张三" data-role="admin">
  用户信息
</div>

<script>
const user = document.getElementById('user');

// 读取数据
console.log(user.dataset.id);        // "123"
console.log(user.dataset.userName);  // "张三" (驼峰命名)
console.log(user.dataset.role);      // "admin"

// 设置数据
user.dataset.email = 'test@example.com';

// 删除数据
delete user.dataset.role;
</script>
```

### 12.2 contenteditable（可编辑内容）

```html
<div contenteditable="true">
  这段文字可以直接编辑
</div>

<script>
const editable = document.querySelector('[contenteditable]');
editable.addEventListener('input', (e) => {
  console.log('内容变化:', e.target.innerHTML);
});
</script>
```

### 12.3 Fullscreen API（全屏）

```javascript
const element = document.getElementById('video');

// 进入全屏
function enterFullscreen() {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

// 退出全屏
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  console.log('全屏状态:', document.fullscreenElement ? '全屏' : '非全屏');
});
```

### 12.4 Page Visibility API（页面可见性）

```javascript
// 检测页面是否可见
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面隐藏 - 暂停视频/动画');
  } else {
    console.log('页面可见 - 恢复播放');
  }
});

// 当前可见状态
console.log('是否隐藏:', document.hidden);
console.log('可见状态:', document.visibilityState); // visible/hidden/prerender
```

### 12.5 Notification API（通知）

```javascript
// 请求通知权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // 创建通知
    const notification = new Notification('消息标题', {
      body: '这是通知内容',
      icon: '/icon.png',
      tag: 'message-1'
    });
    
    // 点击通知
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // 自动关闭
    setTimeout(() => notification.close(), 5000);
  }
});
```

### 12.6 File API（文件操作）

```html
<input type="file" id="fileInput" multiple>

<script>
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  
  for (const file of files) {
    console.log('文件名:', file.name);
    console.log('大小:', file.size, 'bytes');
    console.log('类型:', file.type);
    console.log('修改时间:', file.lastModified);
    
    // 读取文件内容
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('文件内容:', e.target.result);
    };
    
    // 读取为文本
    reader.readAsText(file);
    
    // 其他读取方式
    // reader.readAsDataURL(file);      // Base64
    // reader.readAsArrayBuffer(file);  // ArrayBuffer
    // reader.readAsBinaryString(file); // 二进制字符串
  }
});
</script>
```

### 12.7 Blob 和 URL.createObjectURL

```javascript
// 创建 Blob
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

// 创建临时 URL
const url = URL.createObjectURL(blob);
console.log(url); // blob:http://...

// 用于下载
const a = document.createElement('a');
a.href = url;
a.download = 'hello.txt';
a.click();

// 释放 URL
URL.revokeObjectURL(url);
```

### 12.8 IndexedDB（客户端数据库）

```javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

request.onerror = (event) => {
  console.error('数据库打开失败');
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('数据库打开成功');
};

// 创建对象存储（表）
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // 创建对象存储
  const store = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
  
  // 创建索引
  store.createIndex('name', 'name', { unique: false });
  store.createIndex('email', 'email', { unique: true });
};

// CRUD 操作
function addUser(db, user) {
  const transaction = db.transaction(['users'], 'readwrite');
  const store = transaction.objectStore('users');
  const request = store.add(user);
  
  request.onsuccess = () => console.log('添加成功');
  request.onerror = () => console.log('添加失败');
}

function getUser(db, id) {
  const transaction = db.transaction(['users'], 'readonly');
  const store = transaction.objectStore('users');
  const request = store.get(id);
  
  request.onsuccess = (event) => {
    console.log('用户:', event.target.result);
  };
}
```

---

## 面试常见问题

### Q1: HTML5 有哪些新特性？

**答案要点：**
1. 语义化标签：header, nav, main, article, section, aside, footer
2. 表单增强：新输入类型、验证属性、datalist
3. 多媒体：video, audio 原生支持
4. Canvas 和 SVG 绘图
5. 地理定位 API
6. Web Storage：localStorage, sessionStorage
7. Web Workers 多线程
8. WebSocket 实时通信
9. 拖放 API
10. History API

### Q2: localStorage 和 sessionStorage 的区别？

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| 生命周期 | 永久存储 | 会话期间 |
| 作用域 | 同源所有标签页 | 同源同标签页 |
| 容量 | ~5MB | ~5MB |
| 使用场景 | 用户偏好、缓存 | 临时数据、表单 |

### Q3: Canvas 和 SVG 的区别？

| 特性 | Canvas | SVG |
|------|--------|-----|
| 类型 | 位图 | 矢量图 |
| 缩放 | 失真 | 不失真 |
| 事件 | 整体 | 每个元素 |
| 性能 | 大量对象好 | 少量对象好 |
| 场景 | 游戏、图像处理 | 图标、图表 |

### Q4: Web Worker 的作用和限制？

**作用：** 在后台线程执行 JavaScript，不阻塞主线程 UI

**限制：**
- 无法访问 DOM
- 无法访问 window、document
- 只能通过 postMessage 通信

---

## 总结

HTML5 带来了革命性的变化，让 Web 开发更加强大和便捷。掌握这些特性对于现代前端开发至关重要。建议：

1. **语义化标签**：日常开发中养成使用习惯
2. **表单增强**：善用原生验证，减少 JS 代码
3. **多媒体**：了解格式兼容性和 API 控制
4. **Canvas/SVG**：根据场景选择合适的技术
5. **存储 API**：合理使用本地存储
6. **Web Workers**：处理耗时任务
7. **WebSocket**：实时应用必备
8. **History API**：SPA 路由基础

持续实践，将这些特性融入到实际项目中！