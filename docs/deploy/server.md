# Ubuntu 服务器配置指南

## 概述

本指南介绍如何在 VirtualBox 虚拟机中配置 Ubuntu Server，用于部署题目管理系统。

## 虚拟机创建

### 1. 下载 Ubuntu Server

- 访问 https://ubuntu.com/download/server
- 下载 Ubuntu Server 24.04 LTS ISO

### 2. VirtualBox 配置

- 内存：2GB 以上
- 硬盘：20GB 以上
- 网络：桥接模式（可从主机访问）

### 3. 安装 Ubuntu Server

安装时选择：
- 语言：English
- 键盘：根据实际选择
- 网络：DHCP 自动获取
- 存储：使用整个磁盘
- 用户：设置用户名和密码
- SSH：安装 OpenSSH Server

## 基础配置

### 1. 配置国内镜像源

```bash
# 备份原配置
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 使用阿里云镜像
sudo tee /etc/apt/sources.list <<EOF
deb http://mirrors.aliyun.com/ubuntu/ noble main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ noble-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ noble-backports main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ noble-security main restricted universe multiverse
EOF

# 更新包列表
sudo apt update
sudo apt upgrade -y
```

### 2. 删除代理配置（如有问题）

```bash
# 检查是否有代理配置
ls /etc/apt/apt.conf.d/*proxy*

# 删除代理配置
sudo rm -f /etc/apt/apt.conf.d/*proxy*
```

### 3. 获取 IP 地址

```bash
ip addr

# 找到类似 inet 172.20.10.2/24 的地址
# 这是虚拟机的 IP，用于从主机访问
```

## 安装 Docker

### 1. 安装依赖

```bash
sudo apt install -y ca-certificates curl gnupg
```

### 2. 添加 Docker 仓库（使用阿里云）

```bash
# 添加 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 3. 安装 Docker

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 重新登录使生效
exit
# 重新 SSH 连接
```

### 4. 配置 Docker 镜像加速

```bash
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

### 5. 验证安装

```bash
docker --version
docker compose version
docker run hello-world
```

## SSH 连接

### 使用 MobaXterm（推荐）

1. 下载 MobaXterm：https://mobaxterm.mobatek.net/
2. 新建 SSH 会话
3. 输入虚拟机 IP 和用户名
4. 连接

### 使用命令行

```bash
ssh username@172.20.10.2
```

## 文件传输

### 使用 MobaXterm

- 左侧文件浏览器直接拖拽

### 使用 SCP

```bash
# 上传文件
scp -r question-backend user@172.20.10.2:~/

# 下载文件
scp user@172.20.10.2:~/backup.sql ./
```

## 防火墙配置

```bash
# 查看状态
sudo ufw status

# 允许 SSH
sudo ufw allow ssh

# 允许 API 端口
sudo ufw allow 3000

# 允许数据库端口（仅内网）
sudo ufw allow from 172.20.10.0/24 to any port 5432

# 启用防火墙
sudo ufw enable
```

## 系统维护

### 查看资源使用

```bash
# CPU 和内存
htop

# 磁盘空间
df -h

# Docker 资源
docker system df
```

### 清理空间

```bash
# 清理 apt 缓存
sudo apt autoremove -y
sudo apt clean

# 清理 Docker
docker system prune -a
```

### 查看日志

```bash
# 系统日志
sudo journalctl -f

# Docker 日志
docker logs -f question-api
```

## 开机自启

Docker 服务默认开机自启。容器配置了 `restart: unless-stopped`，会在 Docker 启动后自动启动。

```bash
# 确认 Docker 开机自启
sudo systemctl is-enabled docker

# 手动启动容器
cd ~/question-backend
docker compose up -d
```

## 常见问题

### 1. apt update 失败

检查网络和镜像源配置：
```bash
ping mirrors.aliyun.com
cat /etc/apt/sources.list
```

### 2. Docker 拉取镜像失败

检查镜像加速配置：
```bash
cat /etc/docker/daemon.json
sudo systemctl restart docker
```

### 3. 无法从主机访问虚拟机

- 确认 VirtualBox 网络模式为"桥接"
- 检查虚拟机 IP：`ip addr`
- 检查防火墙：`sudo ufw status`
