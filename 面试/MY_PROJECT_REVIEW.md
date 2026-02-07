# 📋 项目经历复盘 - 面试准备

> 根据你的工作经历，整理每个项目的技术栈、核心知识点和面试官可能问到的问题

---

## 项目总览

| 项目 | 时间 | 技术栈 | 角色 |
|------|------|--------|------|
| 企业官网 | 2025.02-2025.05 | Next.js + TypeScript + Tailwind CSS | 前端开发 |
| 审核后台 | 2020.08-2024.09 | UmiJS + DvaJS + Antd | 前端开发 |
| 配件查询机器人（企微端） | 2022.10-2023.02 | Vue3 + 企业微信 API | 前端负责人 |
| 搜配云小程序 | 2022.06-2022.07 | 原生微信小程序 | 前端负责人 |
| 云店工作台 | 2022.04-2022.06 | UmiJS + DvaJS + Antd | 前端开发 |

---

## 项目一：企业官网（2025.02-2025.05）

### 技术栈
- Next.js（React 框架，支持 SSR/SSG）
- TypeScript
- Tailwind CSS
- Nginx
- Docker

### 项目职责
- 从零搭建项目并进行企业官网开发
- 按照设计稿一比一还原样式
- 采购服务器、完成相关配置并完成官网部署

### 核心知识点

#### 1. Next.js 基础
```javascript
// 页面路由（文件系统路由）
pages/
├── index.js        // /
├── about.js        // /about
└── blog/
    ├── index.js    // /blog
    └── [id].js     // /blog/:id

// App Router（Next.js 13+）
app/
├── page.js         // /
├── about/
│   └── page.js     // /about
└── blog/
    └── [id]/
        └── page.js // /blog/:id
```

#### 2. SSR vs SSG vs CSR
```javascript
// SSR（服务端渲染）- getServerSideProps
// 每次请求时在服务端渲染
export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  return { props: { data } };
}

// SSG（静态生成）- getStaticProps
// 构建时生成静态页面
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  return { props: { data }, revalidate: 60 }; // ISR：60秒后重新生成
}

// 动态路由 + SSG
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  const paths = posts.map(post => ({ params: { id: post.id } }));
  return { paths, fallback: false };
}

// CSR（客户端渲染）
// 使用 useEffect 在客户端获取数据
```

#### 3. Tailwind CSS
```html
<!-- 响应式设计 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 移动端全宽，平板半宽，桌面三分之一 -->
</div>

<!-- Flex 布局 -->
<div class="flex justify-between items-center">
  <span>左侧</span>
  <span>右侧</span>
</div>

<!-- 常用类名 -->
p-4      <!-- padding: 1rem -->
m-4      <!-- margin: 1rem -->
text-lg  <!-- font-size: 1.125rem -->
bg-blue-500  <!-- 背景色 -->
rounded-lg   <!-- 圆角 -->
shadow-md    <!-- 阴影 -->
hover:bg-blue-600  <!-- 悬停效果 -->
```

#### 4. Nginx 配置
```nginx
server {
    listen 80;
    server_name example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

#### 5. Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

### 面试官可能问的问题

```
Q: Next.js 的 SSR 和 SSG 有什么区别？什么场景用哪个？
A: 
- SSR：每次请求时服务端渲染，适合数据频繁变化的页面（如用户个人中心）
- SSG：构建时生成静态页面，适合内容不常变化的页面（如官网、博客）
- ISR：增量静态再生成，结合两者优点，设置 revalidate 时间

Q: 为什么选择 Next.js 而不是纯 React？
A:
- SEO 友好（SSR/SSG）
- 文件系统路由，开发效率高
- 内置图片优化、字体优化
- 零配置，开箱即用

Q: Tailwind CSS 的优缺点？
A:
优点：
- 原子化 CSS，减少样式冲突
- 响应式设计方便
- 打包体积小（PurgeCSS）
- 开发效率高

缺点：
- 类名较长，HTML 可读性降低
- 学习成本
- 复杂样式需要自定义

Q: 如何部署 Next.js 项目？
A:
1. 构建：npm run build
2. Docker 容器化
3. Nginx 反向代理
4. 配置 HTTPS
5. 静态资源 CDN 加速

Q: 官网性能优化做了哪些？
A:
- 图片优化：使用 next/image，自动 WebP 转换
- 字体优化：使用 next/font
- 代码分割：自动按页面分割
- 静态生成：首屏直接返回 HTML
- 缓存策略：静态资源长期缓存
```

---

## 项目二：审核后台（2020.08-2024.09）⭐ 最长项目

### 技术栈
- UmiJS（企业级 React 框架）
- DvaJS（数据流方案）
- Ant Design（UI 组件库）

### 项目职责
- 功能较为复杂的数据管理系统，主要用于操作不同结构的数据并展示
- 封装多个项目通用组件，提升协作开发的效率
- 对于大量的复杂功能进行功能拆分，清理已废弃功能，并形成管理文档

### 核心知识点

#### 1. UmiJS 框架
```javascript
// 约定式路由
src/pages/
├── index.tsx        // /
├── users/
│   ├── index.tsx    // /users
│   └── [id].tsx     // /users/:id
└── 404.tsx          // 404 页面

// 配置式路由 .umirc.ts
export default {
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/users', component: '@/pages/users' },
    {
      path: '/admin',
      component: '@/layouts/AdminLayout',
      routes: [
        { path: '/admin/dashboard', component: '@/pages/admin/dashboard' }
      ]
    }
  ]
};

// 插件配置
export default {
  dva: {},
  antd: {},
  request: {
    dataField: 'data'
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
};
```

#### 2. DvaJS 数据流
```javascript
// models/user.js
export default {
  namespace: 'user',
  
  state: {
    currentUser: null,
    list: [],
    loading: false
  },
  
  // 同步更新 state
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    saveList(state, { payload }) {
      return { ...state, list: payload };
    }
  },
  
  // 异步操作
  effects: {
    *fetchUser({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } });
      const response = yield call(getUserInfo, payload);
      yield put({ type: 'save', payload: { currentUser: response, loading: false } });
    },
    *fetchList({ payload }, { call, put }) {
      const response = yield call(getList, payload);
      yield put({ type: 'saveList', payload: response.list });
    }
  },
  
  // 订阅
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/users') {
          dispatch({ type: 'fetchList' });
        }
      });
    }
  }
};

// 组件中使用
import { connect } from 'dva';

const UserList = ({ user, dispatch, loading }) => {
  useEffect(() => {
    dispatch({ type: 'user/fetchList' });
  }, []);
  
  return (
    <Table 
      dataSource={user.list} 
      loading={loading}
      columns={columns}
    />
  );
};

export default connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetchList']
}))(UserList);

// Hooks 方式（推荐）
import { useSelector, useDispatch } from 'dva';

const UserList = () => {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.user);
  const loading = useSelector(state => state.loading.effects['user/fetchList']);
  
  useEffect(() => {
    dispatch({ type: 'user/fetchList' });
  }, []);
  
  return <Table dataSource={list} loading={loading} />;
};
```

#### 3. Ant Design 组件使用
```jsx
// 表格 + 分页
import { Table, Button, Space, Modal, message } from 'antd';

const UserTable = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '状态', dataIndex: 'status', key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    { title: '操作', key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];
  
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除？',
      content: `确定要删除 ${record.name} 吗？`,
      onOk: async () => {
        await deleteUser(record.id);
        message.success('删除成功');
        fetchData();
      }
    });
  };
  
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys
      }}
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`
      }}
      onChange={handleTableChange}
    />
  );
};

// 表单
import { Form, Input, Select, DatePicker } from 'antd';

const UserForm = ({ initialValues, onSubmit }) => {
  const [form] = Form.useForm();
  
  const handleFinish = (values) => {
    onSubmit(values);
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
      
      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="请选择状态">
          <Select.Option value={1}>启用</Select.Option>
          <Select.Option value={0}>禁用</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form.Item>
    </Form>
  );
};
```

#### 4. 通用组件封装
```jsx
// 二次封装 Table 组件
import { Table } from 'antd';
import { useState, useEffect } from 'react';

const ProTable = ({
  columns,
  request,
  rowKey = 'id',
  defaultPageSize = 10,
  ...restProps
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });
  
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const res = await request({
        page: current,
        pageSize,
        ...params
      });
      setData(res.list);
      setPagination(prev => ({ ...prev, total: res.total }));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);
  
  const handleTableChange = (pag) => {
    setPagination({
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize
    });
  };
  
  return (
    <Table
      rowKey={rowKey}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={handleTableChange}
      {...restProps}
    />
  );
};

export default ProTable;
```

### 面试官可能问的问题

```
Q: UmiJS 和 Create React App 有什么区别？
A:
- UmiJS 是企业级框架，CRA 是脚手架
- UmiJS 内置路由、数据流、构建优化
- UmiJS 支持约定式路由
- UmiJS 插件化架构，扩展性强

Q: DvaJS 的数据流是怎样的？
A:
1. 组件 dispatch 一个 action
2. 如果是同步操作，直接走 reducer 更新 state
3. 如果是异步操作，走 effect（Generator 函数）
4. effect 中可以 call 调用 API，put 触发 reducer
5. state 更新后，connect 的组件自动重新渲染

Q: DvaJS 中 effect 和 reducer 的区别？
A:
- reducer：纯函数，同步更新 state
- effect：Generator 函数，处理异步操作（API 请求等）

Q: 如何封装通用组件？
A:
1. 分析业务场景，提取共性
2. 设计合理的 props 接口
3. 提供默认值和类型检查
4. 支持插槽/render props 扩展
5. 编写文档和示例

Q: 项目中遇到的复杂功能如何拆分？
A:
1. 按业务模块拆分
2. 提取公共逻辑到 hooks/utils
3. 组件按职责拆分（容器组件/展示组件）
4. 状态按模块拆分到不同 model

Q: 如何管理大型项目的代码？
A:
1. 目录结构规范化
2. 代码规范（ESLint + Prettier）
3. 组件/函数文档化
4. 定期清理废弃代码
5. Code Review
```

---

## 项目三：配件查询机器人 - 企业微信端（2022.10-2023.02）

### 技术栈
- Vue3
- 企业微信 JS-SDK
- 嵌入式网页开发

### 项目职责
- 实现与企业微信 API 无缝对接，进行项目核心功能开发
- 搭建前端工程项目做出整体架构，根据需求进行技术选型与通用功能封装
- 开发会话侧边栏查询模块，支持查询信息实时推送
- 调研企业微信提供的能力与新功能，整理前端开发在本项目中可能遇到的问题并解决

### 核心知识点

#### 1. 企业微信 JS-SDK 接入
```javascript
// 1. 引入 JS-SDK
<script src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
<script src="https://open.work.weixin.qq.com/wwopen/js/jwxwork-1.0.0.js"></script>

// 2. 获取签名（后端接口）
async function getSignature() {
  const res = await fetch('/api/wework/signature', {
    method: 'POST',
    body: JSON.stringify({ url: window.location.href })
  });
  return res.json();
}

// 3. 配置 JS-SDK
async function initWxConfig() {
  const { corpId, agentId, timestamp, nonceStr, signature } = await getSignature();
  
  wx.config({
    beta: true,
    debug: false,
    appId: corpId,
    timestamp,
    nonceStr,
    signature,
    jsApiList: [
      'sendChatMessage',
      'getContext',
      'getCurExternalContact',
      'getCurExternalChat',
      'openUserProfile'
    ]
  });
  
  // agentConfig 用于调用企业微信特有 API
  wx.agentConfig({
    corpid: corpId,
    agentid: agentId,
    timestamp,
    nonceStr,
    signature,
    jsApiList: ['sendChatMessage'],
    success: () => console.log('agentConfig success'),
    fail: (err) => console.error('agentConfig fail', err)
  });
}

wx.ready(() => {
  console.log('wx ready');
});

wx.error((err) => {
  console.error('wx error', err);
});
```

#### 2. 企业微信常用 API
```javascript
// 获取当前外部联系人
wx.invoke('getCurExternalContact', {}, (res) => {
  if (res.err_msg === 'getCurExternalContact:ok') {
    const userId = res.userId; // 外部联系人 userId
    // 根据 userId 查询客户信息
  }
});

// 获取当前外部群聊
wx.invoke('getCurExternalChat', {}, (res) => {
  if (res.err_msg === 'getCurExternalChat:ok') {
    const chatId = res.chatId;
  }
});

// 发送消息到会话
wx.invoke('sendChatMessage', {
  msgtype: 'text',
  text: {
    content: '您查询的配件信息如下：...'
  }
}, (res) => {
  if (res.err_msg === 'sendChatMessage:ok') {
    console.log('发送成功');
  }
});

// 发送图文消息
wx.invoke('sendChatMessage', {
  msgtype: 'news',
  news: {
    link: 'https://example.com/article',
    title: '配件详情',
    desc: '点击查看配件详细信息',
    imgUrl: 'https://example.com/image.jpg'
  }
});

// 打开用户资料页
wx.invoke('openUserProfile', {
  type: 2, // 1: 企业成员 2: 外部联系人
  userid: 'external_userid'
});
```

#### 3. 会话侧边栏开发
```vue
<!-- SidePanel.vue -->
<template>
  <div class="side-panel">
    <!-- 客户信息 -->
    <div class="customer-info" v-if="customer">
      <img :src="customer.avatar" class="avatar" />
      <div class="info">
        <div class="name">{{ customer.name }}</div>
        <div class="company">{{ customer.corpName }}</div>
      </div>
    </div>
    
    <!-- 查询表单 -->
    <div class="search-form">
      <input 
        v-model="keyword" 
        placeholder="输入配件名称或编号"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">查询</button>
    </div>
    
    <!-- 查询结果 -->
    <div class="result-list">
      <div 
        v-for="item in results" 
        :key="item.id" 
        class="result-item"
        @click="sendToChat(item)"
      >
        <img :src="item.image" class="item-image" />
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-price">¥{{ item.price }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { initWxConfig, getCurExternalContact, sendChatMessage } from '@/utils/wework';
import { searchParts, getCustomerInfo } from '@/api';

const customer = ref(null);
const keyword = ref('');
const results = ref([]);

onMounted(async () => {
  await initWxConfig();
  
  // 获取当前客户信息
  const userId = await getCurExternalContact();
  if (userId) {
    customer.value = await getCustomerInfo(userId);
  }
});

const handleSearch = async () => {
  if (!keyword.value.trim()) return;
  results.value = await searchParts(keyword.value);
};

const sendToChat = async (item) => {
  await sendChatMessage({
    msgtype: 'news',
    news: {
      link: `https://example.com/part/${item.id}`,
      title: item.name,
      desc: `价格：¥${item.price}`,
      imgUrl: item.image
    }
  });
};
</script>
```

#### 4. 实时推送（WebSocket）
```javascript
// websocket.js
class WS {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectCount = 0;
    this.maxReconnect = 5;
    this.listeners = new Map();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectCount = 0;
      this.heartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const listeners = this.listeners.get(data.type) || [];
      listeners.forEach(cb => cb(data.payload));
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error', error);
    };
  }
  
  reconnect() {
    if (this.reconnectCount < this.maxReconnect) {
      this.reconnectCount++;
      setTimeout(() => this.connect(), 3000);
    }
  }
  
  heartbeat() {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }
  
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export default new WS('wss://api.example.com/ws');
```

### 面试官可能问的问题

```
Q: 企业微信 JS-SDK 接入流程是怎样的？
A:
1. 后端获取 access_token
2. 后端生成签名（timestamp、nonceStr、signature）
3. 前端调用 wx.config 配置
4. 调用 wx.agentConfig 配置应用权限
5. wx.ready 后调用具体 API

Q: 企业微信侧边栏和普通 H5 有什么区别？
A:
- 侧边栏运行在企业微信客户端内
- 可以调用企业微信 JS-SDK
- 可以获取当前会话的客户信息
- 可以直接发送消息到会话
- 需要在企业微信后台配置应用

Q: 如何实现实时推送？
A:
- 使用 WebSocket 建立长连接
- 服务端有新数据时推送到客户端
- 客户端监听消息并更新 UI
- 实现心跳机制保持连接
- 断线自动重连

Q: 遇到过哪些企业微信开发的坑？
A:
- 签名问题：URL 必须是当前页面完整 URL
- 调试困难：需要在企业微信客户端内调试
- API 限制：部分 API 需要特定权限
- 版本兼容：不同版本企业微信 API 支持不同

Q: Vue3 项目架构是怎么设计的？
A:
- 使用 Vite 构建
- Composition API 组织代码
- Pinia 状态管理
- 封装企业微信 API 工具函数
- 统一的请求层和错误处理
```

---

## 项目四：搜配云小程序（2022.06-2022.07）

### 技术栈
- 原生微信小程序
- 分包架构

### 项目职责
- 根据产品需求开发与架构小程序全部功能
- 根据业务模块进行分包架构
- 负责封装通用组件与业务组件
- 拆分通用公共方法，提升代码通用性
- 解决问题：iconfont 在该项目开发过程中不可用，找到替代方案并投入使用
- 开启组件按需加载提升小程序性能
- 剔除组件库的使用，自己封装一些常用组件满足 UI 需求

### 核心知识点

#### 1. 小程序项目结构
```
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── pages/              # 页面
│   ├── index/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── search/
├── components/         # 组件
│   ├── search-bar/
│   └── product-card/
├── utils/              # 工具函数
├── api/                # 接口
└── packageA/           # 分包
    └── pages/
```

#### 2. 分包配置
```json
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/search/index",
    "pages/mine/index"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "name": "product",
      "pages": [
        "pages/detail/index",
        "pages/list/index"
      ]
    },
    {
      "root": "packageB",
      "name": "order",
      "pages": [
        "pages/order-list/index",
        "pages/order-detail/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}
```

#### 3. 自定义组件
```javascript
// components/product-card/index.js
Component({
  options: {
    styleIsolation: 'isolated', // 样式隔离
    multipleSlots: true         // 多插槽
  },
  
  properties: {
    product: {
      type: Object,
      value: {}
    },
    showPrice: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
    imageLoaded: false
  },
  
  lifetimes: {
    attached() {
      // 组件挂载
    },
    detached() {
      // 组件卸载
    }
  },
  
  methods: {
    handleTap() {
      this.triggerEvent('tap', { id: this.data.product.id });
    },
    handleImageLoad() {
      this.setData({ imageLoaded: true });
    }
  }
});
```

```html
<!-- components/product-card/index.wxml -->
<view class="product-card" bindtap="handleTap">
  <image 
    class="product-image" 
    src="{{product.image}}" 
    mode="aspectFill"
    lazy-load
    bindload="handleImageLoad"
  />
  <view class="product-info">
    <text class="product-name">{{product.name}}</text>
    <text class="product-price" wx:if="{{showPrice}}">¥{{product.price}}</text>
  </view>
  <slot name="footer"></slot>
</view>
```

#### 4. 页面开发
```javascript
// pages/search/index.js
const app = getApp();
const api = require('../../api/index');

Page({
  data: {
    keyword: '',
    results: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },
  
  onLoad(options) {
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
      this.search();
    }
  },
  
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },
  
  onPullDownRefresh() {
    this.setData({ page: 1, results: [], hasMore: true });
    this.search().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  async search() {
    this.setData({ loading: true });
    try {
      const res = await api.searchProducts({
        keyword: this.data.keyword,
        page: 1,
        pageSize: this.data.pageSize
      });
      this.setData({
        results: res.list,
        hasMore: res.list.length === this.data.pageSize
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  async loadMore() {
    const nextPage = this.data.page + 1;
    this.setData({ loading: true, page: nextPage });
    try {
      const res = await api.searchProducts({
        keyword: this.data.keyword,
        page: nextPage,
        pageSize: this.data.pageSize
      });
      this.setData({
        results: [...this.data.results, ...res.list],
        hasMore: res.list.length === this.data.pageSize
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  handleInput(e) {
    this.setData({ keyword: e.detail.value });
  },
  
  handleSearch() {
    this.setData({ page: 1, results: [], hasMore: true });
    this.search();
  }
});
```

#### 5. 请求封装
```javascript
// utils/request.js
const BASE_URL = 'https://api.example.com';

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '加载中' });
    
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            wx.showToast({ title: res.data.message, icon: 'none' });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token 过期，跳转登录
          wx.navigateTo({ url: '/pages/login/index' });
          reject(res);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

module.exports = { request };
```

#### 6. iconfont 替代方案
```css
/* 方案1：使用图片 */
.icon {
  width: 40rpx;
  height: 40rpx;
  background-size: contain;
}
.icon-search {
  background-image: url('data:image/svg+xml,...');
}

/* 方案2：使用 base64 SVG */
.icon-home {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/%3E%3C/svg%3E");
}

/* 方案3：使用小程序 icon 组件 */
<icon type="success" size="20"/>
<icon type="info" size="20"/>
```

#### 7. 性能优化
```javascript
// 1. 组件按需加载
// page.json
{
  "usingComponents": {
    "product-card": "/components/product-card/index"
  },
  "componentPlaceholder": {
    "product-card": "view"
  }
}

// 2. 减少 setData 数据量
// 错误
this.setData({ list: newList });

// 正确：只更新变化的部分
this.setData({ [`list[${index}].count`]: newCount });

// 3. 图片懒加载
<image lazy-load src="{{item.image}}" />

// 4. 避免频繁 setData
let pendingData = {};
const throttleSetData = () => {
  if (Object.keys(pendingData).length > 0) {
    this.setData(pendingData);
    pendingData = {};
  }
};
setInterval(throttleSetData, 100);

// 5. 使用骨架屏
<view wx:if="{{loading}}" class="skeleton">
  <view class="skeleton-item"></view>
</view>
```

### 面试官可能问的问题

```
Q: 小程序的双线程模型是什么？
A:
- 渲染层：WebView 线程，负责渲染 WXML 和 WXSS
- 逻辑层：JSCore 线程，负责执行 JavaScript
- 两个线程通过 Native 层通信
- 优点：安全、性能隔离
- 缺点：通信有延迟，无法直接操作 DOM

Q: 为什么要分包？分包的限制是什么？
A:
- 原因：小程序有 2MB 大小限制，分包可以扩展到 20MB
- 主包限制：2MB
- 单个分包限制：2MB
- 总大小限制：20MB
- 分包不能引用主包的资源，但可以引用主包的公共代码

Q: setData 的性能问题如何优化？
A:
- 减少 setData 的数据量
- 使用路径更新：`list[0].name`
- 合并多次 setData
- 避免在 setData 中传递大对象
- 使用自定义组件隔离更新范围

Q: 小程序和 H5 的区别？
A:
- 运行环境：小程序在微信客户端，H5 在浏览器
- 开发语言：小程序用 WXML/WXSS，H5 用 HTML/CSS
- API：小程序有微信原生 API，H5 用 Web API
- 性能：小程序有原生组件，性能更好
- 发布：小程序需要审核，H5 直接部署

Q: 如何解决 iconfont 不可用的问题？
A:
- 使用 base64 编码的 SVG
- 使用图片代替
- 使用小程序内置 icon 组件
- 将字体文件转为 base64 内联
```

---

## 项目五：云店工作台（2022.04-2022.06）

### 技术栈
- UmiJS + DvaJS + Ant Design（同审核后台）

### 项目职责
- 负责订单管理、商品管理、售后管理以及地址管理开发
- 封装通用组件如：商品图片上传、Table 二次封装
- 优化代码，提升页面渲染性能
- 通过二次封装解决了组件库样式与 UI 需求样式不一致的问题
- 通过递归调用方式解决了微信支付异步的问题

### 核心知识点

#### 1. 图片上传组件封装
```jsx
// components/ImageUpload/index.jsx
import { Upload, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const ImageUpload = ({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 2, // MB
  accept = 'image/*'
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const beforeUpload = (file) => {
    // 类型检查
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    
    // 大小检查
    const isLtSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtSize) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      return false;
    }
    
    return true;
  };
  
  const handleChange = ({ fileList }) => {
    // 过滤上传成功的文件
    const newFileList = fileList.map(file => {
      if (file.response) {
        return {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: file.response.data.url
        };
      }
      return file;
    });
    onChange?.(newFileList);
  };
  
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };
  
  const handleRemove = (file) => {
    const newFileList = value.filter(item => item.uid !== file.uid);
    onChange?.(newFileList);
  };
  
  return (
    <>
      <Upload
        listType="picture-card"
        fileList={value}
        action="/api/upload"
        accept={accept}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
      >
        {value.length < maxCount && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        )}
      </Upload>
      
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img style={{ width: '100%' }} src={previewImage} alt="预览" />
      </Modal>
    </>
  );
};

export default ImageUpload;

// 使用
<Form.Item name="images" label="商品图片">
  <ImageUpload maxCount={9} maxSize={5} />
</Form.Item>
```

#### 2. Table 二次封装
```jsx
// components/ProTable/index.jsx
import { Table, Card, Form, Row, Col, Button, Space } from 'antd';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const ProTable = forwardRef(({
  columns,
  request,
  rowKey = 'id',
  searchFields = [],
  toolBarRender,
  ...restProps
}, ref) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    reload: () => fetchData(),
    reset: () => {
      form.resetFields();
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchData({ page: 1 });
    }
  }));
  
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const searchValues = form.getFieldsValue();
      const res = await request({
        ...searchValues,
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      });
      setData(res.list);
      setPagination(prev => ({ ...prev, total: res.total }));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);
  
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };
  
  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };
  
  const handleTableChange = (pag) => {
    setPagination({
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize
    });
  };
  
  return (
    <Card>
      {/* 搜索表单 */}
      {searchFields.length > 0 && (
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ width: '100%' }}>
            {searchFields.map(field => (
              <Col key={field.name} span={6}>
                <Form.Item name={field.name} label={field.label}>
                  {field.render()}
                </Form.Item>
              </Col>
            ))}
            <Col>
              <Space>
                <Button type="primary" onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      )}
      
      {/* 工具栏 */}
      {toolBarRender && (
        <div style={{ marginBottom: 16 }}>
          {toolBarRender()}
        </div>
      )}
      
      {/* 表格 */}
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        onChange={handleTableChange}
        {...restProps}
      />
    </Card>
  );
});

export default ProTable;

// 使用
const tableRef = useRef();

<ProTable
  ref={tableRef}
  columns={columns}
  request={getOrderList}
  searchFields={[
    { name: 'orderNo', label: '订单号', render: () => <Input /> },
    { name: 'status', label: '状态', render: () => <Select options={statusOptions} /> }
  ]}
  toolBarRender={() => (
    <Button type="primary" onClick={handleAdd}>新增</Button>
  )}
/>

// 刷新表格
tableRef.current.reload();
```

#### 3. 微信支付异步问题（递归轮询）
```javascript
// 问题：微信支付是异步的，前端需要轮询查询支付结果

// 方案：递归调用 + 超时控制
const checkPaymentStatus = async (orderId, maxRetry = 30, interval = 2000) => {
  let retryCount = 0;
  
  const check = async () => {
    try {
      const res = await queryPaymentStatus(orderId);
      
      if (res.status === 'SUCCESS') {
        // 支付成功
        return { success: true, data: res };
      } else if (res.status === 'FAILED') {
        // 支付失败
        return { success: false, message: '支付失败' };
      } else {
        // 支付中，继续轮询
        retryCount++;
        if (retryCount >= maxRetry) {
          return { success: false, message: '查询超时，请稍后查看订单状态' };
        }
        
        // 递归调用
        await sleep(interval);
        return check();
      }
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetry) {
        return { success: false, message: '查询失败' };
      }
      await sleep(interval);
      return check();
    }
  };
  
  return check();
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 使用
const handlePay = async (orderId) => {
  // 1. 调用支付接口，获取支付参数
  const payParams = await createPayment(orderId);
  
  // 2. 调起微信支付（小程序/H5）
  await wxPay(payParams);
  
  // 3. 轮询查询支付结果
  const result = await checkPaymentStatus(orderId);
  
  if (result.success) {
    message.success('支付成功');
    // 跳转到订单详情
  } else {
    message.error(result.message);
  }
};
```

#### 4. 组件库样式覆盖
```less
// 方案1：使用 :global 覆盖
.customTable {
  :global {
    .ant-table-thead > tr > th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .ant-table-tbody > tr:hover > td {
      background: #e6f7ff;
    }
  }
}

// 方案2：使用 ConfigProvider 主题定制
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 4,
    },
    components: {
      Table: {
        headerBg: '#f5f5f5',
        headerColor: '#333',
      },
      Button: {
        primaryColor: '#fff',
      }
    }
  }}
>
  <App />
</ConfigProvider>

// 方案3：封装组件，内部处理样式
const CustomButton = ({ children, ...props }) => {
  return (
    <Button 
      {...props} 
      style={{ 
        borderRadius: 4,
        ...props.style 
      }}
    >
      {children}
    </Button>
  );
};
```

### 面试官可能问的问题

```
Q: 如何封装一个通用的上传组件？
A:
1. 支持多种配置：最大数量、文件大小、文件类型
2. 上传前校验
3. 上传进度显示
4. 预览和删除功能
5. 支持受控和非受控模式
6. 错误处理和提示

Q: Table 二次封装需要考虑哪些功能？
A:
1. 搜索表单集成
2. 分页处理
3. 加载状态
4. 工具栏
5. 暴露刷新/重置方法
6. 支持自定义列渲染

Q: 如何处理异步支付的结果查询？
A:
- 使用轮询机制
- 设置最大重试次数和间隔时间
- 处理各种状态（成功/失败/进行中）
- 超时处理
- 用户体验优化（loading 状态）

Q: 如何覆盖 Ant Design 的默认样式？
A:
1. 使用 :global 选择器
2. 使用 ConfigProvider 主题定制
3. 封装组件内部处理
4. 使用 CSS Modules 的 composes
5. 提高选择器优先级

Q: 电商系统的订单状态流转是怎样的？
A:
待支付 → 已支付/已取消
已支付 → 待发货
待发货 → 已发货
已发货 → 已收货
已收货 → 已完成/申请售后
```

---

## 📊 技术栈汇总与面试重点

### 你掌握的技术栈

| 类别 | 技术 | 熟练度 | 项目应用 |
|------|------|--------|----------|
| React 生态 | UmiJS | ⭐⭐⭐⭐ | 审核后台、云店工作台 |
| React 生态 | DvaJS | ⭐⭐⭐⭐ | 审核后台、云店工作台 |
| React 生态 | Ant Design | ⭐⭐⭐⭐ | 审核后台、云店工作台 |
| React 生态 | Next.js | ⭐⭐⭐ | 企业官网 |
| Vue 生态 | Vue3 | ⭐⭐⭐ | 企微配件查询 |
| 小程序 | 原生微信小程序 | ⭐⭐⭐⭐ | 搜配云小程序 |
| 小程序 | 企业微信 JS-SDK | ⭐⭐⭐ | 企微配件查询 |
| CSS | Tailwind CSS | ⭐⭐⭐ | 企业官网 |
| 部署 | Nginx | ⭐⭐⭐ | 企业官网 |
| 部署 | Docker | ⭐⭐ | 企业官网 |
| 语言 | TypeScript | ⭐⭐⭐ | 企业官网 |

### 面试重点准备

#### 1. 必问的基础知识
```
- JavaScript 基础（闭包、this、原型链、事件循环）
- ES6+ 语法（Promise、async/await、解构、箭头函数）
- CSS 布局（Flex、盒模型、BFC）
- HTTP 基础（状态码、缓存、跨域）
```

#### 2. 框架相关（根据岗位侧重）
```
Vue 岗位重点：
- Vue3 响应式原理（Proxy）
- Composition API
- Vue Router / Pinia
- 生命周期

React 岗位重点：
- React Hooks
- 状态管理（Redux/Dva）
- 虚拟 DOM 和 Diff
- 生命周期
```

#### 3. 你的项目亮点
```
1. 组件封装能力
   - 图片上传组件
   - Table 二次封装
   - 通用业务组件

2. 问题解决能力
   - iconfont 替代方案
   - 微信支付异步轮询
   - 组件库样式定制

3. 架构能力
   - 小程序分包架构
   - 企微项目从零搭建
   - 通用方法抽离

4. 性能优化
   - 小程序按需加载
   - 页面渲染优化
   - setData 优化
```

---

## 🎯 面试话术准备

### 自我介绍（1-2分钟）
```
面试官您好，我叫 XXX，有 X 年前端开发经验。

我的技术栈主要是 React 和 Vue，熟悉 UmiJS、Ant Design、Vue3 等框架和组件库。
也有原生微信小程序和企业微信开发经验。

在之前的工作中，我主要负责后台管理系统和小程序的开发。
比如我做过一个审核后台项目，持续迭代了 4 年，期间封装了很多通用组件，
也积累了不少复杂业务系统的开发经验。

我对前端工程化和组件化开发比较感兴趣，也一直在学习新技术。
希望能有机会加入贵公司，谢谢。
```

### 项目介绍模板
```
【项目名称】：XXX 系统

【项目背景】：
这是一个 XXX 业务的管理系统，主要用于 XXX。

【我的职责】：
- 负责 XXX 模块的开发
- 封装了 XXX 通用组件
- 解决了 XXX 技术难题

【技术亮点】：
- 使用 XXX 技术实现了 XXX 功能
- 通过 XXX 方案优化了 XXX 性能

【项目成果】：
- 提升了 XXX 效率
- 代码复用率提高 XXX%
```

### 常见问题回答

```
Q: 为什么离职？
A: 想寻求更大的发展空间，学习更多技术，接触更多业务场景。

Q: 你的优势是什么？
A: 
- 有丰富的后台系统开发经验
- 组件封装和代码复用能力强
- 学习能力强，能快速上手新技术
- 有小程序和企业微信开发经验

Q: 你的缺点是什么？
A: 有时候过于追求代码质量，可能会影响开发速度。
   但我也在学习如何平衡质量和效率。

Q: 对国网/能源行业有什么了解？
A: 了解到国网是国家电网，是关系国计民生的重要企业。
   前端开发主要是内部管理系统，对稳定性和兼容性要求较高。
   我之前做过类似的后台管理系统，有相关经验。

Q: 期望薪资？
A: 根据岗位要求和我的经验，期望 XXX。
   当然也会考虑公司的整体福利和发展空间。
```

---

## ✅ 面试前最后检查

### 技术准备
- [ ] 复习 JavaScript 基础
- [ ] 复习 Vue3 核心知识（国网岗位要求）
- [ ] 复习 React/UmiJS/DvaJS（你的主要经验）
- [ ] 复习小程序开发知识
- [ ] 准备 2-3 个项目的详细介绍

### 项目准备
- [ ] 审核后台：组件封装、复杂功能拆分
- [ ] 搜配云小程序：分包架构、性能优化、iconfont 问题
- [ ] 企微配件查询：Vue3 架构、企微 API 对接
- [ ] 云店工作台：支付轮询、样式覆盖

### 软技能
- [ ] 自我介绍
- [ ] 离职原因
- [ ] 职业规划
- [ ] 期望薪资

---

祝面试顺利！💪
