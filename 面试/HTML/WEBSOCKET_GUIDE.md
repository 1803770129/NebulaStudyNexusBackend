# WebSocket 完全指南

## 一、基本概念

### 1.1 什么是 WebSocket？

WebSocket 是 HTML5 提供的一种在单个 TCP 连接上进行**全双工通信**的协议。它使得客户端和服务器之间可以进行实时、双向的数据传输。

**一句话理解：** HTTP 是"你问我答"，WebSocket 是"随时聊天"。

### 1.2 为什么需要 WebSocket？

**传统 HTTP 的问题：**

```
客户端                    服务器
  |                         |
  |------- 请求 1 --------->|
  |<------ 响应 1 ----------|
  |                         |
  |------- 请求 2 --------->|  （想获取新数据？必须再发请求）
  |<------ 响应 2 ----------|
  |                         |
```

- HTTP 是**请求-响应**模式，客户端不请求，服务器无法主动推送
- 每次请求都要建立连接、发送头部信息，开销大
- 实时性差，只能通过轮询模拟实时

**WebSocket 的解决方案：**

```
客户端                    服务器
  |                         |
  |==== 建立 WebSocket =====>|
  |<==== 连接成功 ===========|
  |                         |
  |<------ 服务器推送 1 -----|  （服务器可以主动推送）
  |------- 客户端发送 1 ---->|  （客户端也可以随时发送）
  |<------ 服务器推送 2 -----|
  |------- 客户端发送 2 ---->|
  |          ...            |
```

### 1.3 WebSocket vs HTTP 对比

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 请求-响应（单向） | 全双工（双向） |
| 连接 | 短连接（每次请求新建） | 长连接（持久） |
| 服务器推送 | ❌ 不支持 | ✅ 支持 |
| 头部开销 | 大（每次都带完整头部） | 小（握手后几乎无头部） |
| 实时性 | 差（需要轮询） | 好（即时通信） |
| 协议 | http:// 或 https:// | ws:// 或 wss:// |

### 1.4 WebSocket 握手过程

WebSocket 连接建立需要先通过 HTTP 进行"升级"：

```
1. 客户端发送 HTTP 请求（带升级头）
   GET /chat HTTP/1.1
   Host: server.example.com
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13

2. 服务器返回 101 状态码（协议切换）
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

3. 握手成功，后续通信使用 WebSocket 协议
```

---

## 二、客户端 API

### 2.1 创建连接

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 安全连接（推荐生产环境使用）
const wss = new WebSocket('wss://example.com/socket');

// 带协议的连接
const wsWithProtocol = new WebSocket('ws://localhost:8080', 'chat-protocol');
```

### 2.2 四个核心事件

```javascript
const ws = new WebSocket('ws://localhost:8080');

// 1. 连接建立成功
ws.onopen = function(event) {
  console.log('连接已建立');
  ws.send('Hello Server!');
};

// 2. 收到服务器消息
ws.onmessage = function(event) {
  console.log('收到消息:', event.data);
  
  // 判断数据类型
  if (typeof event.data === 'string') {
    console.log('文本消息:', event.data);
  } else if (event.data instanceof Blob) {
    console.log('二进制消息 (Blob)');
  } else if (event.data instanceof ArrayBuffer) {
    console.log('二进制消息 (ArrayBuffer)');
  }
};

// 3. 连接关闭
ws.onclose = function(event) {
  console.log('连接已关闭');
  console.log('关闭码:', event.code);
  console.log('关闭原因:', event.reason);
  console.log('是否正常关闭:', event.wasClean);
};

// 4. 发生错误
ws.onerror = function(error) {
  console.error('WebSocket 错误:', error);
};
```

### 2.3 发送数据

```javascript
// 发送文本
ws.send('Hello World');

// 发送 JSON
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }));

// 发送 Blob
const blob = new Blob(['binary data'], { type: 'application/octet-stream' });
ws.send(blob);

// 发送 ArrayBuffer
const buffer = new ArrayBuffer(8);
ws.send(buffer);

// 发送前检查连接状态
if (ws.readyState === WebSocket.OPEN) {
  ws.send('消息');
}
```

### 2.4 连接状态

```javascript
// readyState 属性的四个值
WebSocket.CONNECTING  // 0 - 正在连接
WebSocket.OPEN        // 1 - 已连接，可以通信
WebSocket.CLOSING     // 2 - 正在关闭
WebSocket.CLOSED      // 3 - 已关闭

// 检查状态
switch (ws.readyState) {
  case WebSocket.CONNECTING:
    console.log('正在连接...');
    break;
  case WebSocket.OPEN:
    console.log('已连接');
    break;
  case WebSocket.CLOSING:
    console.log('正在关闭...');
    break;
  case WebSocket.CLOSED:
    console.log('已关闭');
    break;
}
```

### 2.5 关闭连接

```javascript
// 正常关闭
ws.close();

// 带关闭码和原因
ws.close(1000, '正常关闭');

// 常用关闭码
// 1000 - 正常关闭
// 1001 - 端点离开（如页面关闭）
// 1002 - 协议错误
// 1003 - 数据类型错误
// 1006 - 异常关闭（无法发送关闭帧）
// 1011 - 服务器错误
```

### 2.6 其他属性

```javascript
// 缓冲区中等待发送的数据量（字节）
console.log('待发送数据:', ws.bufferedAmount);

// 二进制数据类型
ws.binaryType = 'blob';       // 默认
ws.binaryType = 'arraybuffer'; // 接收 ArrayBuffer

// 协议
console.log('使用的协议:', ws.protocol);

// URL
console.log('连接地址:', ws.url);
```

---

## 三、服务端实现

### 3.1 Node.js + ws 库

```javascript
// 安装: npm install ws

const WebSocket = require('ws');

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8080 });

// 连接事件
wss.on('connection', function(ws, req) {
  console.log('新客户端连接');
  console.log('客户端 IP:', req.socket.remoteAddress);
  
  // 接收消息
  ws.on('message', function(message) {
    console.log('收到消息:', message.toString());
    
    // 回复消息
    ws.send('服务器收到: ' + message);
    
    // 广播给所有客户端
    wss.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  
  // 关闭事件
  ws.on('close', function() {
    console.log('客户端断开连接');
  });
  
  // 错误事件
  ws.on('error', function(error) {
    console.error('错误:', error);
  });
  
  // 发送欢迎消息
  ws.send('欢迎连接到 WebSocket 服务器！');
});

console.log('WebSocket 服务器运行在 ws://localhost:8080');
```

### 3.2 Node.js + Socket.IO

```javascript
// 安装: npm install socket.io

const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  // 监听自定义事件
  socket.on('chat message', (msg) => {
    console.log('消息:', msg);
    // 广播给所有人
    io.emit('chat message', msg);
  });
  
  // 加入房间
  socket.on('join room', (room) => {
    socket.join(room);
    socket.to(room).emit('user joined', socket.id);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO 服务器运行在 http://localhost:3000');
});
```

**客户端使用 Socket.IO：**
```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    console.log('已连接');
  });
  
  socket.emit('chat message', 'Hello!');
  
  socket.on('chat message', (msg) => {
    console.log('收到:', msg);
  });
</script>
```

### 3.3 与 Express 集成

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Express 路由
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// WebSocket 处理
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('收到:', message.toString());
  });
});

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

---

## 四、实际使用场景

### 4.1 场景一：实时聊天室

```javascript
// 客户端
class ChatClient {
  constructor(url, username) {
    this.ws = new WebSocket(url);
    this.username = username;
    this.setupEvents();
  }
  
  setupEvents() {
    this.ws.onopen = () => {
      this.send({ type: 'join', username: this.username });
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'message':
        this.displayMessage(data.username, data.content);
        break;
      case 'userJoined':
        this.displaySystemMessage(`${data.username} 加入了聊天室`);
        break;
      case 'userLeft':
        this.displaySystemMessage(`${data.username} 离开了聊天室`);
        break;
    }
  }
  
  sendMessage(content) {
    this.send({ type: 'message', content });
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  displayMessage(username, content) {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<p><strong>${username}:</strong> ${content}</p>`;
  }
  
  displaySystemMessage(message) {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<p class="system">${message}</p>`;
  }
}

// 使用
const chat = new ChatClient('ws://localhost:8080', '张三');
document.getElementById('send-btn').onclick = () => {
  const input = document.getElementById('message-input');
  chat.sendMessage(input.value);
  input.value = '';
};
```

### 4.2 场景二：实时数据推送（股票行情）

```javascript
// 客户端 - 股票行情
class StockTicker {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.subscriptions = new Set();
    this.callbacks = new Map();
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'price') {
        this.updatePrice(data.symbol, data.price, data.change);
      }
    };
  }
  
  subscribe(symbol, callback) {
    this.subscriptions.add(symbol);
    this.callbacks.set(symbol, callback);
    
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      symbol: symbol
    }));
  }
  
  unsubscribe(symbol) {
    this.subscriptions.delete(symbol);
    this.callbacks.delete(symbol);
    
    this.ws.send(JSON.stringify({
      type: 'unsubscribe',
      symbol: symbol
    }));
  }
  
  updatePrice(symbol, price, change) {
    const callback = this.callbacks.get(symbol);
    if (callback) {
      callback({ symbol, price, change });
    }
  }
}

// 使用
const ticker = new StockTicker('wss://stock-api.example.com');

ticker.subscribe('AAPL', (data) => {
  document.getElementById('aapl-price').textContent = `$${data.price}`;
  document.getElementById('aapl-change').textContent = `${data.change}%`;
});

ticker.subscribe('GOOGL', (data) => {
  console.log('Google:', data.price);
});
```

### 4.3 场景三：在线协作编辑

```javascript
// 客户端 - 协作文档
class CollaborativeEditor {
  constructor(url, documentId) {
    this.ws = new WebSocket(`${url}?doc=${documentId}`);
    this.editor = document.getElementById('editor');
    this.cursors = new Map(); // 其他用户的光标
    
    this.setupEvents();
  }
  
  setupEvents() {
    // 监听本地编辑
    this.editor.addEventListener('input', (e) => {
      this.sendChange({
        type: 'edit',
        position: this.editor.selectionStart,
        content: this.editor.value
      });
    });
    
    // 监听光标移动
    this.editor.addEventListener('selectionchange', () => {
      this.sendChange({
        type: 'cursor',
        position: this.editor.selectionStart
      });
    });
    
    // 接收远程变更
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRemoteChange(data);
    };
  }
  
  handleRemoteChange(data) {
    switch (data.type) {
      case 'edit':
        // 应用远程编辑（需要处理冲突）
        this.applyRemoteEdit(data);
        break;
      case 'cursor':
        // 显示其他用户的光标
        this.showRemoteCursor(data.userId, data.position);
        break;
      case 'sync':
        // 同步完整文档
        this.editor.value = data.content;
        break;
    }
  }
  
  sendChange(change) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(change));
    }
  }
  
  applyRemoteEdit(data) {
    const currentPos = this.editor.selectionStart;
    this.editor.value = data.content;
    this.editor.selectionStart = currentPos;
    this.editor.selectionEnd = currentPos;
  }
  
  showRemoteCursor(userId, position) {
    // 显示其他用户光标的逻辑
    console.log(`用户 ${userId} 光标在位置 ${position}`);
  }
}
```

### 4.4 场景四：实时通知系统

```javascript
// 客户端 - 通知系统
class NotificationService {
  constructor(url, userId) {
    this.userId = userId;
    this.connect(url);
  }
  
  connect(url) {
    this.ws = new WebSocket(`${url}?userId=${this.userId}`);
    
    this.ws.onopen = () => {
      console.log('通知服务已连接');
    };
    
    this.ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.showNotification(notification);
    };
    
    this.ws.onclose = () => {
      // 断线重连
      console.log('连接断开，5秒后重连...');
      setTimeout(() => this.connect(url), 5000);
    };
  }
  
  showNotification(data) {
    // 浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: data.icon
      });
    }
    
    // 页面内通知
    this.displayInPageNotification(data);
  }
  
  displayInPageNotification(data) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${data.type}`;
    notification.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.message}</p>
      <span class="time">${new Date().toLocaleTimeString()}</span>
    `;
    container.prepend(notification);
    
    // 5秒后自动消失
    setTimeout(() => notification.remove(), 5000);
  }
}

// 使用
const notifications = new NotificationService('wss://api.example.com/notifications', 'user123');
```

### 4.5 场景五：多人在线游戏

```javascript
// 客户端 - 简单多人游戏
class MultiplayerGame {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.players = new Map();
    this.myId = null;
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleServerMessage(data);
    };
    
    // 监听键盘输入
    document.addEventListener('keydown', (e) => {
      this.handleInput(e.key);
    });
  }
  
  handleServerMessage(data) {
    switch (data.type) {
      case 'init':
        this.myId = data.playerId;
        break;
      case 'gameState':
        this.updateGameState(data.players);
        break;
      case 'playerJoined':
        this.addPlayer(data.player);
        break;
      case 'playerLeft':
        this.removePlayer(data.playerId);
        break;
    }
  }
  
  handleInput(key) {
    const movement = { up: 'w', down: 's', left: 'a', right: 'd' };
    if (Object.values(movement).includes(key)) {
      this.ws.send(JSON.stringify({
        type: 'move',
        direction: key
      }));
    }
  }
  
  updateGameState(players) {
    // 更新所有玩家位置
    players.forEach(player => {
      this.players.set(player.id, player);
    });
    this.render();
  }
  
  render() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.players.forEach(player => {
      ctx.fillStyle = player.id === this.myId ? 'blue' : 'red';
      ctx.fillRect(player.x, player.y, 20, 20);
    });
  }
}
```

### 4.6 场景六：实时监控仪表盘

```javascript
// 客户端 - 服务器监控
class MonitorDashboard {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.charts = {};
    
    this.ws.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      this.updateDashboard(metrics);
    };
  }
  
  updateDashboard(metrics) {
    // 更新 CPU 使用率
    this.updateChart('cpu', metrics.cpu);
    document.getElementById('cpu-value').textContent = `${metrics.cpu}%`;
    
    // 更新内存使用率
    this.updateChart('memory', metrics.memory);
    document.getElementById('memory-value').textContent = `${metrics.memory}%`;
    
    // 更新网络流量
    document.getElementById('network-in').textContent = `${metrics.networkIn} MB/s`;
    document.getElementById('network-out').textContent = `${metrics.networkOut} MB/s`;
    
    // 更新请求数
    document.getElementById('requests').textContent = metrics.requestsPerSecond;
    
    // 检查告警
    if (metrics.cpu > 90 || metrics.memory > 90) {
      this.showAlert('系统资源使用率过高！');
    }
  }
  
  updateChart(chartId, value) {
    // 更新图表数据
    if (this.charts[chartId]) {
      this.charts[chartId].data.push(value);
      if (this.charts[chartId].data.length > 60) {
        this.charts[chartId].data.shift();
      }
      this.charts[chartId].update();
    }
  }
  
  showAlert(message) {
    console.warn('告警:', message);
  }
}
```

---

## 五、最佳实践

### 5.1 心跳检测（保持连接）

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.heartbeatInterval = 30000; // 30秒
    this.heartbeatTimer = null;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('连接成功');
      this.startHeartbeat();
    };
    
    this.ws.onclose = () => {
      console.log('连接关闭');
      this.stopHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        console.log('收到心跳响应');
      } else {
        this.handleMessage(data);
      }
    };
  }
  
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  handleMessage(data) {
    console.log('收到消息:', data);
  }
}
```

### 5.2 断线重连

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.messageQueue = []; // 断线期间的消息队列
    
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('连接成功');
      this.reconnectAttempts = 0;
      
      // 发送队列中的消息
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.ws.send(msg);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('连接关闭:', event.code);
      
      // 非正常关闭时尝试重连
      if (event.code !== 1000) {
        this.reconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('连接错误:', error);
    };
  }
  
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`${this.reconnectInterval / 1000}秒后进行第${this.reconnectAttempts}次重连...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      // 连接未就绪，加入队列
      this.messageQueue.push(data);
    }
  }
  
  close() {
    this.ws.close(1000, '正常关闭');
  }
}

// 使用
const ws = new ReconnectingWebSocket('ws://localhost:8080', {
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
});
```

### 5.3 消息协议设计

```javascript
// 统一的消息格式
const MessageTypes = {
  // 系统消息
  PING: 'ping',
  PONG: 'pong',
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAIL: 'auth_fail',
  
  // 业务消息
  CHAT_MESSAGE: 'chat_message',
  USER_JOIN: 'user_join',
  USER_LEAVE: 'user_leave',
  
  // 错误
  ERROR: 'error'
};

// 消息构造器
function createMessage(type, payload = {}) {
  return JSON.stringify({
    type,
    payload,
    timestamp: Date.now(),
    id: generateMessageId()
  });
}

// 消息解析器
function parseMessage(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('消息解析失败:', e);
    return null;
  }
}

// 使用
ws.send(createMessage(MessageTypes.CHAT_MESSAGE, {
  content: 'Hello!',
  roomId: 'room-1'
}));
```

### 5.4 身份认证

```javascript
class AuthenticatedWebSocket {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.authenticated = false;
    this.pendingMessages = [];
    
    this.connect();
  }
  
  connect() {
    // 方式1：通过 URL 参数传递 token
    this.ws = new WebSocket(`${this.url}?token=${this.token}`);
    
    // 方式2：连接后发送认证消息
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth_success') {
        this.authenticated = true;
        // 发送待发送的消息
        this.flushPendingMessages();
      } else if (data.type === 'auth_fail') {
        console.error('认证失败:', data.reason);
        this.ws.close();
      } else {
        this.handleMessage(data);
      }
    };
  }
  
  send(data) {
    if (this.authenticated && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.pendingMessages.push(data);
    }
  }
  
  flushPendingMessages() {
    while (this.pendingMessages.length > 0) {
      const msg = this.pendingMessages.shift();
      this.ws.send(JSON.stringify(msg));
    }
  }
  
  handleMessage(data) {
    console.log('收到消息:', data);
  }
}
```

### 5.5 完整的 WebSocket 封装类

```javascript
class WebSocketManager {
  constructor(options) {
    this.url = options.url;
    this.protocols = options.protocols || [];
    this.reconnect = options.reconnect !== false;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.messageQueue = [];
    
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url, this.protocols);
    
    this.ws.onopen = () => {
      console.log('[WS] 连接成功');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.emit('open');
    };
    
    this.ws.onmessage = (event) => {
      const data = this.parseMessage(event.data);
      if (data) {
        if (data.type === 'pong') return;
        this.emit('message', data);
        this.emit(data.type, data.payload);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('[WS] 连接关闭:', event.code, event.reason);
      this.stopHeartbeat();
      this.emit('close', event);
      
      if (this.reconnect && event.code !== 1000) {
        this.tryReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('[WS] 错误:', error);
      this.emit('error', error);
    };
  }
  
  parseMessage(data) {
    try {
      return JSON.parse(data);
    } catch {
      return { type: 'raw', payload: data };
    }
  }
  
  send(type, payload = {}) {
    const message = JSON.stringify({ type, payload, timestamp: Date.now() });
    
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      this.ws.send(msg);
    }
  }
  
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] 达到最大重连次数');
      this.emit('reconnect_failed');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`[WS] ${this.reconnectInterval / 1000}秒后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => this.connect(), this.reconnectInterval);
  }
  
  // 事件监听
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }
  
  close() {
    this.reconnect = false;
    this.ws.close(1000, '正常关闭');
  }
  
  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

// 使用示例
const ws = new WebSocketManager({
  url: 'wss://api.example.com/socket',
  reconnect: true,
  reconnectInterval: 5000,
  heartbeatInterval: 30000
});

ws.on('open', () => console.log('已连接'));
ws.on('close', () => console.log('已断开'));
ws.on('chat_message', (data) => console.log('聊天消息:', data));

ws.send('chat_message', { content: 'Hello!' });
```

---

## 六、WebSocket vs 其他实时技术

### 6.1 技术对比

| 技术 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| 轮询 | 定时发送请求 | 简单 | 延迟高、浪费资源 | 简单场景 |
| 长轮询 | 服务器保持连接直到有数据 | 实时性较好 | 服务器压力大 | 兼容性要求高 |
| SSE | 服务器单向推送 | 简单、自动重连 | 只能服务器推送 | 通知、新闻 |
| WebSocket | 全双工通信 | 实时、双向、低开销 | 需要服务器支持 | 聊天、游戏、协作 |

### 6.2 SSE vs WebSocket

```javascript
// SSE (Server-Sent Events) - 服务器单向推送
const eventSource = new EventSource('/events');

eventSource.onmessage = (event) => {
  console.log('收到:', event.data);
};

eventSource.onerror = (error) => {
  console.error('SSE 错误:', error);
};

// WebSocket - 双向通信
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  console.log('收到:', event.data);
};

ws.send('客户端也可以发送消息'); // SSE 做不到这点
```

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 服务器 → 客户端 | 双向 |
| 协议 | HTTP | WebSocket |
| 自动重连 | ✅ 内置 | ❌ 需手动实现 |
| 二进制数据 | ❌ 不支持 | ✅ 支持 |
| 浏览器支持 | 较好 | 很好 |
| 适用场景 | 通知、新闻推送 | 聊天、游戏、协作 |

---

## 七、面试常见问题

### Q1: WebSocket 是什么？和 HTTP 有什么区别？

**答：** WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。

区别：
- HTTP 是请求-响应模式，WebSocket 是全双工
- HTTP 是短连接，WebSocket 是长连接
- HTTP 服务器不能主动推送，WebSocket 可以
- WebSocket 头部开销小，适合频繁通信

### Q2: WebSocket 如何建立连接？

**答：** 通过 HTTP 升级机制：
1. 客户端发送带 `Upgrade: websocket` 头的 HTTP 请求
2. 服务器返回 101 状态码表示协议切换
3. 之后使用 WebSocket 协议通信

### Q3: WebSocket 有哪些事件？

**答：** 四个核心事件：
- `onopen` - 连接建立
- `onmessage` - 收到消息
- `onclose` - 连接关闭
- `onerror` - 发生错误

### Q4: 如何保持 WebSocket 连接？

**答：** 心跳机制：
- 客户端定时发送 ping 消息
- 服务器返回 pong 响应
- 超时未收到响应则认为连接断开

### Q5: WebSocket 断线如何处理？

**答：** 实现断线重连：
- 监听 `onclose` 事件
- 非正常关闭时启动重连定时器
- 设置最大重连次数
- 重连成功后发送队列中的消息

### Q6: WebSocket 适用于什么场景？

**答：**
- 实时聊天
- 在线游戏
- 协作编辑
- 实时数据推送（股票、监控）
- 通知系统

---

## 八、总结

### 核心要点

1. **本质**：全双工、持久连接、实时通信
2. **协议**：ws:// 或 wss://（加密）
3. **事件**：open、message、close、error
4. **状态**：CONNECTING(0) → OPEN(1) → CLOSING(2) → CLOSED(3)

### 最佳实践

- ✅ 使用心跳保持连接
- ✅ 实现断线重连
- ✅ 设计统一的消息协议
- ✅ 处理身份认证
- ✅ 生产环境使用 wss://

### 记忆口诀

**"WebSocket 四事件，心跳重连保平安"**

- 四事件：open、message、close、error
- 心跳：定时 ping/pong
- 重连：断线自动重连