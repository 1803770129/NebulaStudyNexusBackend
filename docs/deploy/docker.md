# Docker 部署指南

## 概述

使用 Docker 和 Docker Compose 部署后端服务和数据库。

## 文件说明

### Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

# 设置 Alpine 镜像源（国内加速）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装 bcrypt 编译依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package*.json ./
RUN npm ci

# 构建
COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache python3 make g++

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main"]
```

### docker-compose.yml

```yaml
services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: question-db
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_DATABASE:-question_manager}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # NestJS 后端
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: question-api
    env_file:
      - .env
    environment:
      DB_HOST: postgres
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads  # 持久化上传文件
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### .env 配置

```env
# 数据库
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=question_manager

# JWT
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 应用
PORT=3000
NODE_ENV=development  # 开发环境自动创建表
```

## 部署步骤

### 1. 准备服务器

```bash
# 安装 Docker（Ubuntu）
curl -fsSL https://get.docker.com | sh

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 配置 Docker 镜像加速（国内）
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF

sudo systemctl restart docker
```

### 2. 上传项目

```bash
# 使用 scp 或 SFTP 上传 question-backend 目录
scp -r question-backend user@server:~/
```

### 3. 配置环境变量

```bash
cd ~/question-backend
cp .env.example .env
nano .env  # 编辑配置
```

### 4. 构建并启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 5. 验证部署

```bash
# 检查 API 健康状态
curl http://localhost:3000/api/health

# 检查数据库连接
docker exec -it question-db psql -U postgres -d question_manager -c "\dt"
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重新构建
docker-compose up -d --build

# 查看日志
docker-compose logs -f api
docker-compose logs -f postgres

# 进入容器
docker exec -it question-api sh
docker exec -it question-db psql -U postgres

# 清理未使用的资源
docker system prune -a
```

## 数据备份

```bash
# 备份数据库
docker exec question-db pg_dump -U postgres question_manager > backup.sql

# 恢复数据库
docker exec -i question-db psql -U postgres question_manager < backup.sql

# 备份上传文件
tar -czvf uploads-backup.tar.gz uploads/
```

## 常见问题

### 1. 构建失败：网络问题

```bash
# 检查 Docker 镜像加速配置
cat /etc/docker/daemon.json

# 手动拉取基础镜像
docker pull node:20-alpine
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 确保 .env 中 DB_HOST=postgres（容器名）
```

### 3. 上传的图片丢失

确保 `docker-compose.yml` 中配置了 volume 挂载：

```yaml
volumes:
  - ./uploads:/app/uploads
```

### 4. 表没有自动创建

确保 `.env` 中 `NODE_ENV=development`，TypeORM 的 `synchronize` 只在开发环境生效。

## 生产环境建议

1. **使用强密码**：修改 `DB_PASSWORD` 和 `JWT_SECRET`
2. **配置 HTTPS**：使用 Nginx 反向代理 + Let's Encrypt
3. **定期备份**：设置 cron 任务自动备份数据库
4. **监控日志**：使用 ELK 或其他日志系统
5. **资源限制**：在 docker-compose.yml 中配置内存和 CPU 限制
