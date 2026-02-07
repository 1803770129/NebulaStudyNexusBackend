# 构建阶段 - 使用 Docker Hub 镜像加速
FROM node:20-alpine AS builder

# 设置 Alpine 镜像源为阿里云
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装 bcrypt 编译所需的依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 设置 npm 镜像和超时配置
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 npm install 代替 npm ci，更容错）
RUN npm install --production=false --legacy-peer-deps

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

# 设置 Alpine 镜像源为阿里云
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装 bcrypt 编译所需的依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 设置 npm 镜像和超时配置
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# 复制依赖文件
COPY package*.json ./

# 只安装生产依赖
RUN npm install --production=true --legacy-peer-deps

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "dist/main"]
