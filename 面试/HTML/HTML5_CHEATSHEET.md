# HTML5 新特性速记卡片 📝

> 精简版背诵文档，适合快速记忆和面试复习

---

## 🎯 一句话总结 HTML5

**HTML5 = 语义化 + 多媒体 + 绘图 + 存储 + 通信 + 设备访问**

---

## 📦 十大核心特性（必背）

| # | 特性 | 一句话描述 | 关键词 |
|---|------|-----------|--------|
| 1 | 语义化标签 | 让页面结构更清晰 | header/nav/main/article/section/aside/footer |
| 2 | 表单增强 | 新输入类型+原生验证 | email/date/range/required/pattern |
| 3 | 视频音频 | 原生多媒体支持 | video/audio/source |
| 4 | Canvas | 像素级2D绑图 | getContext('2d')/fillRect/drawImage |
| 5 | SVG | 矢量图形 | 不失真/可交互/适合图标 |
| 6 | 地理定位 | 获取用户位置 | navigator.geolocation |
| 7 | Web Storage | 本地存储 | localStorage/sessionStorage |
| 8 | Web Workers | 后台多线程 | 不阻塞UI/postMessage通信 |
| 9 | WebSocket | 实时双向通信 | 全双工/持久连接 |
| 10 | 拖放API | 原生拖放 | draggable/dragstart/drop |

---

## 🏷️ 1. 语义化标签

**记忆口诀：头导主文章，节边脚图说**

```
header  → 头部
nav     → 导航
main    → 主体（唯一）
article → 文章（独立内容）
section → 章节
aside   → 侧边栏
footer  → 底部
figure  → 图片容器
figcaption → 图片说明
```

**好处：SEO友好 + 可访问性 + 代码可读**

---

## 📝 2. 表单增强

**新输入类型（记住6个常用）：**
```
email  → 邮箱验证
url    → 网址验证
tel    → 电话
number → 数字（min/max/step）
range  → 滑块
date   → 日期选择器
```

**新属性（记住5个）：**
```
placeholder → 占位提示
required    → 必填
pattern     → 正则验证
autofocus   → 自动聚焦
autocomplete → 自动完成
```

---

## 🎬 3. 多媒体

**视频：**
```html
<video src="x.mp4" controls autoplay muted loop poster="封面.jpg"></video>
```

**音频：**
```html
<audio src="x.mp3" controls></audio>
```

**属性速记：controls显控件，autoplay自动播，muted静音，loop循环**

---

## 🎨 4. Canvas vs SVG

| 对比项 | Canvas | SVG |
|--------|--------|-----|
| 类型 | 位图（像素） | 矢量图 |
| 缩放 | 会模糊 | 不失真 |
| 事件 | 整个画布 | 每个元素 |
| 性能 | 多对象好 | 少对象好 |
| 场景 | 游戏/图像处理 | 图标/图表 |

**Canvas 核心API：**
```javascript
ctx.fillRect(x,y,w,h)     // 填充矩形
ctx.strokeRect(x,y,w,h)   // 边框矩形
ctx.arc(x,y,r,0,Math.PI*2) // 圆
ctx.fillText('文字',x,y)   // 文字
ctx.drawImage(img,x,y)    // 图片
```

---

## 📍 5. 地理定位

```javascript
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords.latitude, pos.coords.longitude),
  err => console.log(err.message)
);
```

**三个方法：**
- `getCurrentPosition()` - 获取一次
- `watchPosition()` - 持续监听
- `clearWatch()` - 停止监听

---

## 💾 6. Web Storage（重点！）

| 对比 | localStorage | sessionStorage | Cookie |
|------|--------------|----------------|--------|
| 容量 | ~5MB | ~5MB | ~4KB |
| 有效期 | 永久 | 会话 | 可设置 |
| 服务器 | 不发送 | 不发送 | 每次携带 |
| 作用域 | 同源所有页 | 同源同标签 | 同源 |

**API（两者相同）：**
```javascript
setItem(key, value)  // 存
getItem(key)         // 取
removeItem(key)      // 删
clear()              // 清空
```

---

## 👷 7. Web Workers

**作用：** 后台线程执行JS，不阻塞主线程UI

**限制（必背）：**
- ❌ 不能访问 DOM
- ❌ 不能访问 window/document
- ✅ 只能通过 postMessage 通信

```javascript
// 主线程
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = e => console.log(e.data);

// Worker线程
self.onmessage = e => self.postMessage(result);
```

---

## 🔌 8. WebSocket

**特点：** 全双工、持久连接、实时通信

```javascript
const ws = new WebSocket('wss://xxx');
ws.onopen = () => ws.send('hello');
ws.onmessage = e => console.log(e.data);
ws.onclose = () => console.log('关闭');
ws.onerror = e => console.log('错误');
```

**状态码：** 0连接中 → 1已连接 → 2关闭中 → 3已关闭

---

## 🖱️ 9. 拖放API

**被拖元素：** `draggable="true"`

**事件顺序：**
```
dragstart → drag → dragenter → dragover → dragleave/drop → dragend
```

**关键点：** dragover 必须 `e.preventDefault()` 才能触发 drop

---

## 📜 10. History API

```javascript
history.pushState(state, title, url)    // 添加记录
history.replaceState(state, title, url) // 替换记录
window.onpopstate = e => {}             // 监听前进后退
```

**SPA路由基础！**

---

## 🎁 其他特性速记

| 特性 | 用途 | 关键API |
|------|------|---------|
| data-* | 自定义数据属性 | element.dataset.xxx |
| contenteditable | 可编辑内容 | `<div contenteditable>` |
| Fullscreen | 全屏 | requestFullscreen() |
| Page Visibility | 页面可见性 | document.hidden |
| Notification | 桌面通知 | new Notification() |
| File API | 文件操作 | FileReader |
| IndexedDB | 客户端数据库 | indexedDB.open() |

---

## 🔥 面试高频问答

**Q1: HTML5新特性有哪些？**
> 语义化标签、表单增强、音视频、Canvas/SVG、地理定位、Web Storage、Web Workers、WebSocket、拖放API、History API

**Q2: localStorage vs sessionStorage？**
> localStorage永久存储，sessionStorage会话期间；localStorage同源所有页面共享，sessionStorage仅当前标签页

**Q3: Canvas vs SVG？**
> Canvas位图会失真适合游戏，SVG矢量不失真适合图标；Canvas整体事件，SVG每个元素可交互

**Q4: Web Worker限制？**
> 不能访问DOM、window、document，只能通过postMessage通信

**Q5: WebSocket vs HTTP？**
> WebSocket全双工持久连接，HTTP请求-响应模式；WebSocket适合实时通信

---

## 📌 记忆技巧

**HTML5 = "语表媒画地，存工网拖史"**

- 语 = 语义化标签
- 表 = 表单增强
- 媒 = 多媒体
- 画 = Canvas/SVG
- 地 = 地理定位
- 存 = Web Storage
- 工 = Web Workers
- 网 = WebSocket
- 拖 = 拖放API
- 史 = History API

---

**背诵完成 ✅ 祝面试顺利！**