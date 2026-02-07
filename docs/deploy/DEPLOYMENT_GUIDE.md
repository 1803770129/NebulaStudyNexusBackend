# Ubuntu Server + Docker 部署完整指南

## 第一步：VirtualBox 创建虚拟机

1. 打开 VirtualBox → 点击"新建"

2. 基本设置：
   - 名称：`ubuntu-server`（随意）
   - 类型：Linux
   - 版本：Ubuntu (64-bit)
   - 内存：2048 MB（建议2GB以上）
   - 硬盘：创建虚拟硬盘 → VDI → 动态分配 → 30GB

3. 设置网络（重要！）：
   - 选中虚拟机 → 设置 → 网络
   - 连接方式：**桥接网卡**
   - 界面名称：选择你正在使用的网卡

4. 挂载 ISO：
   - 设置 → 存储 → 控制器:IDE → 点击光盘图标
   - 选择你下载的 `ubuntu-24.04.x-live-server-amd64.iso`

5. 启动虚拟机

---

## 第二步：安装 Ubuntu Server

启动后按提示操作：

1. **语言**：English（推荐，中文可能有显示问题）

2. **键盘**：English (US)

3. **安装类型**：Ubuntu Server

4. **网络**：默认 DHCP 自动获取，记下显示的 IP 地址

5. **代理**：留空，直接回车

6. **镜像地址**：改成国内镜像更快（推荐清华源）
   ```
   https://mirrors.tuna.tsinghua.edu.cn/ubuntu/
   ```
   
   备选镜像：
   - 中科大：`https://mirrors.ustc.edu.cn/ubuntu/`
   - 网易：`https://mirrors.163.com/ubuntu/`
   - 如果都报错，留空用默认源，装完系统后再改
   
   > **镜像地址的作用**：这是 Ubuntu 软件包下载源。系统安装后，使用 `apt install` 安装软件时会从这个地址下载。默认是国外服务器，国内访问很慢。改成国内镜像后，下载速度可以从几十KB/s 提升到几MB/s。安装完系统后也可以修改，但在安装时设置更方便。

7. **磁盘**：Use an entire disk → 确认 → Continue

8. **用户设置**：
   - Your name: `你的名字`
   - Server name: `ubuntu-server`
   - Username: `你的用户名`（记住！）
   - Password: `你的密码`（记住！）

9. **SSH**：✅ 勾选 **Install OpenSSH server**（重要！）

10. **Featured snaps**：不选，直接 Done

11. 等待安装完成 → Reboot Now

---

## 第三步：首次登录配置

重启后用刚才设置的用户名密码登录。

### 3.1 查看 IP 地址
```bash
ip addr
```

**输出示例与解读**：
```
1: lo: <LOOPBACK,UP,LOWER_UP> ...
    inet 127.0.0.1/8 scope host lo        ← 本地回环地址，忽略

2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic enp0s3
         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
         这就是你的 IP 地址！
```

**找 IP 的方法**：
- 忽略 `lo`（127.0.0.1 是本机回环，不能用于外部访问）
- 找 `enp0s3`、`eth0` 或类似名称的网卡
- `inet` 后面的就是 IP，通常是 `192.168.x.x` 或 `10.x.x.x`

**更简单的命令**：
```bash
hostname -I    # 直接输出 IP，不用找
```

> **知识点**：`ip addr` 显示所有网络接口信息。`lo` 是 loopback（回环），用于本机内部通信。`enp0s3` 是实际网卡，名称可能因系统而异。

### 3.2 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

**命令拆解**：
| 部分 | 含义 |
|------|------|
| `sudo` | 以管理员权限执行（Super User DO） |
| `apt` | Ubuntu 的包管理器（Advanced Package Tool） |
| `update` | 更新软件源列表（获取最新软件信息，不安装） |
| `&&` | 前一个命令成功后才执行下一个 |
| `upgrade` | 升级已安装的软件到最新版本 |
| `-y` | 自动确认，不需要手动输入 yes |

> **知识点**：`apt update` 只是刷新软件列表，`apt upgrade` 才是真正安装更新。两个命令通常一起用。


### 3.2.a 使用 MobaXterm 连接虚拟机（推荐）

为了更方便复制粘贴和文件传输，建议使用 SSH 客户端连接。

**下载地址**：https://mobaxterm.mobatek.net/download.html

**选择版本**：
- **Portable edition**（便携版）：解压即用，不用安装，推荐
- **Installer edition**（安装版）：需要安装到系统

**连接步骤**：
1. 打开 MobaXterm → 点击左上角 **Session**
2. 选择 **SSH**
3. 填写连接信息：
   - **Remote host**：虚拟机 IP（如 `192.168.1.105`）
   - **Specify username**：勾选，填你的 Ubuntu 用户名
   - **Port**：22（默认）
4. 点击 **OK** → 输入密码连接

**连接成功后**：
- 左侧自动显示 SFTP 文件浏览器，可以直接拖拽上传下载文件
- 右侧是终端，正常输入命令
- 选中文字自动复制，右键粘贴

---

### 3.2.b 配置国内软件源（重要！）

Ubuntu 24.04 安装时可能会配置错误的代理，导致无法下载软件。按以下步骤修复：

#### 步骤1：检查并清除错误的代理配置

```bash
# 检查是否有代理配置
cat /etc/apt/apt.conf.d/* 2>/dev/null | grep -i proxy
```

如果有输出（类似 `Acquire::http::Proxy ...`），说明有错误的代理配置，需要删除：

```bash
# 查看是哪个文件包含代理配置
grep -l "Proxy" /etc/apt/apt.conf.d/*

# 删除代理配置文件（常见的文件名）
sudo rm -f /etc/apt/apt.conf.d/*proxy*
sudo rm -f /etc/apt/apt.conf.d/90curtin-aptproxy

# 确认删除成功（应该没有输出）
cat /etc/apt/apt.conf.d/* 2>/dev/null | grep -i proxy
```

> **为什么会有这个问题**：Ubuntu 安装时如果填写了镜像地址，系统可能会错误地将其配置为代理服务器，导致所有网络请求都走这个"代理"而失败。

#### 步骤2：配置正确的国内软件源

```bash
# 备份原配置
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

# 编辑软件源配置
sudo nano /etc/apt/sources.list.d/ubuntu.sources
```

删除所有内容（`Ctrl+K` 逐行删除），替换为以下内容：

```
Types: deb
URIs: http://mirrors.aliyun.com/ubuntu/
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: http://mirrors.aliyun.com/ubuntu/
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

按 `Ctrl+O` 保存，`Enter` 确认，`Ctrl+X` 退出。

**配置说明**：
| 字段 | 含义 |
|------|------|
| `Types: deb` | 软件包类型 |
| `URIs` | 镜像地址（阿里云） |
| `Suites` | Ubuntu 版本代号，noble = 24.04 |
| `Components` | 软件分类（main=官方支持，universe=社区维护等） |
| `Signed-By` | GPG 签名验证文件 |

**备选镜像**（如果阿里云不可用）：
- 清华：`http://mirrors.tuna.tsinghua.edu.cn/ubuntu/`
- 中科大：`http://mirrors.ustc.edu.cn/ubuntu/`
- 网易：`http://mirrors.163.com/ubuntu/`

#### 步骤3：更新软件源

```bash
sudo apt update
```

**成功标志**：看到类似以下输出，没有 `Err` 或 `Failed`：
```
Hit:1 http://mirrors.aliyun.com/ubuntu noble InRelease
Get:2 http://mirrors.aliyun.com/ubuntu noble-updates InRelease [126 kB]
...
Reading package lists... Done
```

#### 步骤4：升级系统软件

```bash
sudo apt upgrade -y
```

---

### 3.3 安装 Docker

由于 Docker 官方源在国内访问不稳定，推荐使用阿里云 Docker 镜像安装。

#### 步骤1：安装依赖

```bash
sudo apt install -y ca-certificates curl gnupg
```

**命令解释**：
| 包名 | 作用 |
|------|------|
| `ca-certificates` | SSL 证书，用于 HTTPS 连接 |
| `curl` | 命令行下载工具 |
| `gnupg` | GPG 加密工具，用于验证软件包签名 |

#### 步骤2：添加 Docker GPG 密钥

```bash
# 创建 keyrings 目录
sudo mkdir -p /etc/apt/keyrings

# 下载阿里云 Docker GPG 密钥
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `curl -fsSL` | 静默下载，失败时显示错误 |
| `gpg --dearmor` | 将 ASCII 格式的密钥转换为二进制格式 |
| `-o /etc/apt/keyrings/docker.gpg` | 输出到指定文件 |

> **知识点**：GPG 密钥用于验证下载的软件包是否来自官方，防止被篡改。

#### 步骤3：添加 Docker 软件源

```bash
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `echo "..."` | 输出引号内的内容 |
| `deb` | 表示这是一个 Debian/Ubuntu 软件源 |
| `arch=amd64` | 指定 CPU 架构（64位） |
| `signed-by=...` | 指定用于验证的 GPG 密钥 |
| `noble` | Ubuntu 24.04 的版本代号 |
| `stable` | 使用稳定版 Docker |
| `\| sudo tee ...` | 以 root 权限写入文件 |

**确认文件创建成功**：
```bash
cat /etc/apt/sources.list.d/docker.list
```

应该输出：
```
deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu noble stable
```

#### 步骤4：更新软件源并安装 Docker

```bash
# 更新软件源
sudo apt update

# 安装 Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**安装的组件**：
| 包名 | 作用 |
|------|------|
| `docker-ce` | Docker 社区版引擎 |
| `docker-ce-cli` | Docker 命令行工具 |
| `containerd.io` | 容器运行时 |
| `docker-compose-plugin` | Docker Compose 插件 |

#### 步骤5：将当前用户加入 docker 组

```bash
  sudo usermod -aG docker $USER
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `usermod` | 修改用户账户 |
| `-a` | 追加（append），不移除已有的组 |
| `-G` | 指定附加组 |
| `docker` | 组名，Docker 安装时自动创建 |
| `$USER` | 环境变量，代表当前用户名 |

> **为什么需要这步**：默认只有 root 用户能运行 Docker。加入 docker 组后，普通用户也能执行 docker 命令，不用每次都加 sudo。

#### 步骤6：重新登录生效

```bash
exit
```

> **知识点**：用户组的变更需要重新登录才能生效。`exit` 退出当前会话，重新登录后新的组权限才会加载。

---

### 3.4 重新登录后验证
```bash
docker --version        # 查看 Docker 版本
docker compose version  # 查看 Docker Compose 版本
```

> **知识点**：Docker Compose 是 Docker 的编排工具，用于定义和运行多容器应用。新版 Docker 已内置 `docker compose`（注意是空格不是横杠）。

---

### 3.5 配置 Docker 镜像加速器（重要！）

Docker Hub 在国内访问受限，拉取镜像会失败。需要配置国内镜像加速器。

#### 步骤1：创建 Docker 配置文件

```bash
# 创建配置目录
sudo mkdir -p /etc/docker

# 写入镜像加速器配置
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `tee` | 同时输出到屏幕和文件 |
| `<<EOF ... EOF` | Here Document，多行输入 |
| `daemon.json` | Docker 守护进程配置文件 |
| `registry-mirrors` | 镜像仓库加速器地址列表 |

#### 步骤2：重启 Docker 服务

```bash
# 重新加载配置
sudo systemctl daemon-reload

# 重启 Docker
sudo systemctl restart docker
```

**命令解释**：
| 命令 | 含义 |
|------|------|
| `systemctl daemon-reload` | 重新加载 systemd 配置 |
| `systemctl restart docker` | 重启 Docker 服务 |

#### 步骤3：验证配置生效

```bash
docker info | grep -A 5 "Registry Mirrors"
```

应该看到配置的镜像地址。

#### 备选镜像加速器

如果上面的镜像源不可用，可以替换为其他源：

```bash
sudo nano /etc/docker/daemon.json
```

替换内容为：
```json
{
  "registry-mirrors": [
    "https://dockerhub.icu",
    "https://hub.rat.dev",
    "https://docker.rainbond.cc"
  ]
}
```

然后重启 Docker：
```bash
sudo systemctl restart docker
```

> **知识点**：镜像加速器相当于 Docker Hub 的国内缓存代理，从国内服务器下载镜像，速度更快更稳定。

---

## 第四步：从 Windows 连接服务器

在 Windows 上打开 PowerShell 或 CMD：

```powershell
ssh 用户名@192.168.x.x
```

**命令拆解**：
| 部分 | 含义 |
|------|------|
| `ssh` | Secure Shell，安全远程连接协议 |
| `用户名` | 安装 Ubuntu 时设置的用户名 |
| `@` | 分隔符 |
| `192.168.x.x` | 服务器 IP 地址 |

**首次连接**：
```
The authenticity of host '192.168.x.x' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
输入 `yes` 确认，然后输入密码（输入时不显示字符，正常现象）。

> **知识点**：SSH 是远程管理 Linux 服务器的标准方式。首次连接会验证服务器指纹，防止中间人攻击。确认后会保存到 `~/.ssh/known_hosts`。

---

## 第五步：上传项目到服务器


### 使用 Git（在服务器上执行）
```bash
sudo apt install git -y              # 安装 Git
git clone https://github.com/你的仓库地址.git
```

> **知识点**：如果项目托管在 GitHub/GitLab，用 Git 克隆更方便，还能方便后续更新（`git pull`）。

---

## 第六步：配置并启动服务

### 6.1 进入项目目录
```bash
cd ~/question-backend
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `cd` | Change Directory，切换目录 |
| `~` | 当前用户的 home 目录 |

### 6.2 创建环境配置文件
```bash
cp .env.example .env
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `cp` | Copy，复制文件 |
| `.env.example` | 源文件（环境变量模板） |
| `.env` | 目标文件（实际使用的配置） |

> **知识点**：`.env` 文件存储环境变量，包含数据库密码等敏感信息。`.env.example` 是模板，不含真实密码，可以提交到 Git。`.env` 包含真实配置，应该加入 `.gitignore`。

```bash
nano .env
```

**nano 编辑器操作**：
| 快捷键 | 功能 |
|--------|------|
| 方向键 | 移动光标 |
| 直接输入 | 编辑内容 |
| `Ctrl+O` | 保存（Write Out） |
| `Enter` | 确认文件名 |
| `Ctrl+X` | 退出 |
| `Ctrl+K` | 剪切当前行 |
| `Ctrl+U` | 粘贴 |

修改以下内容：
```bash
NODE_ENV=production          # 运行环境：production=生产，development=开发
PORT=3000                    # API 服务端口

# 数据库配置
DB_HOST=postgres             # 数据库主机名（Docker 服务名，不是 localhost！）
DB_PORT=5432                 # PostgreSQL 默认端口
DB_USERNAME=postgres         # 数据库用户名
DB_PASSWORD=YourStrongPassword123!  # 【必改】数据库密码
DB_DATABASE=question_manager # 数据库名

# JWT 配置（用于用户认证）
JWT_SECRET=这里填生成的随机字符串  # 【必改】JWT 签名密钥
JWT_EXPIRES_IN=1h            # Token 有效期：1小时
JWT_REFRESH_EXPIRES_IN=7d    # 刷新 Token 有效期：7天

LOG_LEVEL=info               # 日志级别：debug/info/warn/error
```

> **重要**：`DB_HOST=postgres` 这里用的是 Docker 服务名，不是 `localhost`。因为 API 和数据库都在 Docker 容器里，通过 Docker 内部网络通信。

#### 如何生成 JWT_SECRET

在 Ubuntu 终端执行以下命令生成随机字符串：

```bash
# 方式1：生成 32 位 Base64 字符串
openssl rand -base64 32
# 输出示例：K7xB9mN2pQ4rT6vW8yA1cE3fG5hJ7kL9nO0pQ2rS

# 方式2：生成 64 位十六进制字符串（更安全）
openssl rand -hex 32
# 输出示例：a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

复制生成的字符串，填入 `.env` 文件的 `JWT_SECRET=` 后面。

> **知识点**：JWT_SECRET 是用于签名和验证 JWT Token 的密钥。必须保密，且足够复杂。如果泄露，攻击者可以伪造任意用户的登录凭证。

---

### 6.3 启动服务
```bash
docker compose up -d --build
```

**命令拆解**：
| 部分 | 含义 |
|------|------|
| `docker compose` | Docker Compose 命令 |
| `up` | 创建并启动容器 |
| `-d` | Detached，后台运行（不占用终端） |
| `--build` | 强制重新构建镜像（代码有更新时需要） |

> **知识点**：Docker Compose 根据 `docker-compose.yml` 文件定义的服务，自动创建网络、拉取镜像、构建应用、启动容器。首次运行会比较慢，需要下载基础镜像。

### 6.4 查看状态
```bash
docker compose ps
```
重启后执行：
```bash
```
cd ~/NebulaStudyNexusBackend/question-backend
docker compose up -d
```

重启容器
docker compose down
docker compose up -d



**输出示例**：
```
NAME           IMAGE                    STATUS                   PORTS
question-api   question-backend-api     Up 2 minutes             0.0.0.0:3000->3000/tcp
question-db    postgres:15-alpine       Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp
```

| 列 | 含义 |
|----|------|
| NAME | 容器名称 |
| STATUS | 运行状态，`Up` 表示正在运行，`healthy` 表示健康检查通过 |
| PORTS | 端口映射，`0.0.0.0:3000->3000` 表示宿主机 3000 端口映射到容器 3000 端口 |

```bash
docker compose logs -f
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `logs` | 查看容器日志 |
| `-f` | Follow，实时跟踪新日志（类似 `tail -f`） |

按 `Ctrl+C` 退出日志查看。

---

## 第七步：配置防火墙

```bash
sudo ufw allow 22      # 开放 SSH 端口（远程连接用）
sudo ufw allow 3000    # 开放 API 端口（外部访问用）
sudo ufw enable        # 启用防火墙
sudo ufw status        # 查看防火墙状态
```

**命令解释**：
| 命令 | 含义 |
|------|------|
| `ufw` | Uncomplicated Firewall，Ubuntu 的简化防火墙工具 |
| `allow 22` | 允许 22 端口（SSH 默认端口） |
| `allow 3000` | 允许 3000 端口（API 服务端口） |
| `enable` | 启用防火墙 |
| `status` | 查看当前规则 |

> **知识点**：防火墙默认拒绝所有入站连接。必须先开放 SSH 端口（22），否则启用防火墙后会断开连接！

---

## 第八步：验证部署

### 在服务器上测试
```bash
curl http://localhost:3000/api/docs
```

**命令解释**：
| 部分 | 含义 |
|------|------|
| `curl` | 命令行 HTTP 客户端 |
| `localhost` | 本机地址 |
| `/api/health` | 健康检查接口 |

成功返回类似：`{"status":"ok"}` 或 `{"statusCode":200,...}`

### 在 Windows 上测试
```powershell
curl http://192.168.x.x:3000/api/health
```

### 在浏览器访问
```
http://192.168.x.x:3000/api
```

> **知识点**：健康检查接口（health check）是 API 的标准实践，用于监控服务是否正常运行。返回 200 状态码表示服务健康

---

---

## 数据库详解：PostgreSQL 搭建与连接

你的项目使用 PostgreSQL 数据库，通过 Docker Compose 会自动搭建。下面详细说明原理和操作。

### 数据库架构说明

```
┌─────────────────────────────────────────────────────┐
│                   Docker 网络                        │
│                                                     │
│  ┌─────────────┐         ┌─────────────────────┐   │
│  │  postgres   │◄───────►│       api           │   │
│  │  (数据库)    │  内部通信 │   (NestJS后端)      │   │
│  │  端口:5432  │         │   端口:3000         │   │
│  └─────────────┘         └─────────────────────┘   │
│        │                          │                │
└────────┼──────────────────────────┼────────────────┘
         │                          │
         ▼                          ▼
    宿主机:5432               宿主机:3000
    (可选暴露)                 (对外服务)
```

### docker-compose.yml 中的数据库配置解析

```yaml
services:
  # PostgreSQL 数据库服务
  postgres:
    image: postgres:15-alpine          # 使用官方 PostgreSQL 15 镜像
    container_name: question-db        # 容器名称
    environment:
      POSTGRES_USER: postgres          # 数据库用户名
      POSTGRES_PASSWORD: password      # 数据库密码（生产环境必须修改！）
      POSTGRES_DB: question_manager    # 自动创建的数据库名
    ports:
      - "5432:5432"                     # 端口映射 宿主机:容器
    volumes:
      - postgres_data:/var/lib/postgresql/data  # 数据持久化
    healthcheck:                       # 健康检查
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # NestJS 后端服务
  api:
    environment:
      DB_HOST: postgres                # 关键！使用服务名作为主机名
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_DATABASE: question_manager
    depends_on:
      postgres:
        condition: service_healthy     # 等数据库就绪后再启动
```

### 连接原理

1. **Docker 内部网络**：Docker Compose 自动创建内部网络，容器间通过服务名通信
2. **DB_HOST: postgres**：这里的 `postgres` 是服务名，不是 `localhost`
3. **depends_on**：确保数据库先启动并健康后，API 才启动

### 数据库操作命令

#### 查看数据库状态
```bash
# 查看容器状态
docker compose ps

# 查看数据库日志
docker compose logs postgres
```

#### 连接数据库
```bash
# 方式1：进入容器内的 psql
docker exec -it question-db psql -U postgres -d question_manager

# 方式2：使用 docker compose
docker compose exec postgres psql -U postgres -d question_manager
```

#### 常用 SQL 命令（进入 psql 后）
```sql
-- 查看所有数据库
\l

-- 切换数据库
\c question_manager

-- 查看所有表
\dt

-- 查看表结构
\d table_name

-- 查询数据
SELECT * FROM users LIMIT 10;

-- 退出
\q
```

#### 数据库备份与恢复
```bash
# 备份数据库
docker exec question-db pg_dump -U postgres question_manager > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20240101.sql | docker exec -i question-db psql -U postgres -d question_manager

# 备份并压缩
docker exec question-db pg_dump -U postgres question_manager | gzip > backup_$(date +%Y%m%d).sql.gz

# 解压并恢复
gunzip -c backup_20240101.sql.gz | docker exec -i question-db psql -U postgres -d question_manager
```

### 生产环境安全配置

#### 1. 修改默认密码
编辑 `.env` 文件：
```bash
DB_PASSWORD=YourVeryStrongPassword@2024!
```

同时修改 `docker-compose.yml` 或使用环境变量：
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ${DB_PASSWORD}
```

#### 2. 不暴露数据库端口到外部
修改 `docker-compose.yml`，移除或注释掉 postgres 的 ports：
```yaml
postgres:
  # ports:
  #   - "5432:5432"    # 注释掉，不对外暴露
```

这样数据库只能在 Docker 内部网络访问，更安全。

#### 3. 如需外部访问数据库（开发调试用）
保留端口映射，但限制防火墙：
```bash
# 只允许特定 IP 访问数据库端口
sudo ufw allow from 你的IP地址 to any port 5432
```

### 使用外部数据库工具连接

如果保留了 5432 端口映射，可以用 Navicat、DBeaver、pgAdmin 等工具连接：

- **Host**: 服务器 IP（如 192.168.1.100）
- **Port**: 5432
- **Database**: question_manager
- **Username**: postgres
- **Password**: 你设置的密码

### 数据持久化说明

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

- 数据存储在 Docker Volume `postgres_data` 中
- 即使容器删除，数据也不会丢失
- 只有执行 `docker volume rm postgres_data` 才会删除数据

#### 查看数据卷
```bash
# 列出所有卷
docker volume ls

# 查看卷详情
docker volume inspect question-backend_postgres_data
```

### 数据库初始化（首次启动）

NestJS + TypeORM 会自动处理：

1. 首次启动时，TypeORM 根据实体自动创建表（如果配置了 `synchronize: true`）
2. 生产环境建议使用 migrations 而不是 synchronize

#### 手动运行迁移（如果有）
```bash
# 进入 api 容器
docker compose exec api sh

# 运行迁移
npm run migration:run
```

### 完整的数据库重置流程

⚠️ 警告：这会删除所有数据！

```bash
# 1. 停止服务
docker compose down

# 2. 删除数据卷
docker volume rm question-backend_postgres_data

# 3. 重新启动（会创建新的空数据库）
docker compose up -d
```

### 排查数据库连接问题

```bash
# 1. 检查数据库容器是否运行
docker compose ps

# 2. 检查数据库日志
docker compose logs postgres

# 3. 测试数据库连接
docker compose exec postgres pg_isready -U postgres

# 4. 检查 API 日志中的数据库连接信息
docker compose logs api | grep -i database

# 5. 进入 API 容器测试连接
docker compose exec api sh
# 在容器内
ping postgres  # 测试网络
```

---

## 常用运维命令

```bash
# 查看服务状态
docker compose ps

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 查看日志
docker compose logs -f api      # API 日志
docker compose logs -f postgres # 数据库日志

# 进入数据库
docker exec -it question-db psql -U postgres -d question_manager

# 备份数据库
docker exec question-db pg_dump -U postgres question_manager > backup_$(date +%Y%m%d).sql

# 更新代码后重新部署
git pull  # 如果用 git
docker compose up -d --build
```

---

## 常见问题

### Q: 无法连接 SSH
- 检查虚拟机网络是否为"桥接模式"
- 检查防火墙：`sudo ufw status`
- 确认 IP 地址正确：`ip addr`

### Q: Docker 命令需要 sudo
```bash
sudo usermod -aG docker $USER
# 然后重新登录
```

### Q: 端口被占用
```bash
sudo netstat -tlnp | grep 3000
```

### Q: 容器启动失败
```bash
docker compose logs
# 查看具体错误信息
```

### Q: bcrypt 编译失败（gyp ERR! find Python）

**错误信息**：
```
npm error gyp ERR! find Python
npm error gyp ERR! find Python Python is not set from command line or npm configuration
npm error gyp ERR! find Python You need to install the latest version of Python.
```

**原因**：`bcrypt` 是一个需要编译的原生模块，Alpine 镜像默认没有 Python 和编译工具。

**解决方案**：修改 Dockerfile，在安装依赖前添加编译工具：

```dockerfile
# 在 FROM node:20-alpine 之后添加
RUN apk add --no-cache python3 make g++
```

完整的 Dockerfile 示例见下方"Dockerfile 详解"章节。

### Q: apt update 报错 Invalid response from proxy

**错误信息**：
```
Invalid response from proxy: HTTP/1.1 400 Bad Request
```

**原因**：Ubuntu 安装时填写的镜像地址被错误配置为代理服务器。

**解决方案**：
```bash
# 查找并删除错误的代理配置
grep -l "Proxy" /etc/apt/apt.conf.d/*
sudo rm -f /etc/apt/apt.conf.d/*proxy*
sudo rm -f /etc/apt/apt.conf.d/90curtin-aptproxy
```

### Q: Docker 拉取镜像失败（connection refused）

**错误信息**：
```
failed to resolve reference "docker.io/library/xxx": dial tcp: connect: connection refused
```

**原因**：Docker Hub 在国内访问受限。

**解决方案**：配置国内镜像加速器，见"3.5 配置 Docker 镜像加速器"章节。

### Q: 数据库表不存在（relation "users" does not exist）

**错误信息**：
```json
{
  "statusCode": 500,
  "message": "relation \"users\" does not exist"
}
```

**原因**：TypeORM 的 `synchronize` 配置只在 `development` 环境启用，但容器内的 `NODE_ENV` 是 `production`。

**排查步骤**：
```bash
# 检查容器内的环境变量
docker compose exec api env | grep NODE_ENV

# 检查 .env 文件
cat .env | grep NODE_ENV
```

**解决方案**：

1. 确保 `docker-compose.yml` 使用 `env_file` 加载 `.env`：
```yaml
api:
  env_file:
    - .env
  environment:
    DB_HOST: postgres  # 只覆盖需要的变量
```

2. 确保 `.env` 中设置：
```
NODE_ENV=development
```

3. 重启服务：
```bash
docker compose down
docker compose up -d
```

> **注意**：`docker-compose.yml` 中直接写的 `environment` 会覆盖 `.env` 文件的值。

### Q: Apipost/Postman 连接被拒绝（ECONNREFUSED）

**错误信息**：
```
connect ECONNREFUSED 172.20.10.2:3000
检测您的系统代理貌似开小差了
```

**排查步骤**：

1. 确认容器正在运行：
```bash
docker compose ps
# 状态应该是 Up，不是 Restarting
```

2. 在服务器上测试：
```bash
curl http://localhost:3000/api/docs
```

3. 检查服务器 IP 是否变化：
```bash
hostname -I
```

**可能原因及解决方案**：

| 原因 | 解决方案 |
|------|----------|
| 容器未启动或正在重启 | `docker compose logs api` 查看错误 |
| IP 地址变了 | 用新 IP 重新连接 |
| Apipost 代理设置问题 | 设置 → 代理 → 关闭代理 |
| Windows 防火墙 | 允许 Apipost 通过防火墙 |
| 容器还在初始化 | 等待 `health: starting` 变成 `healthy` |

### Q: 虚拟机重启后服务不可用

**排查步骤**：

1. 检查 Docker 服务：
```bash
sudo systemctl status docker
```

2. 检查容器状态：
```bash
docker compose ps
```

3. 如果容器没启动：
```bash
cd ~/NebulaStudyNexusBackend/question-backend
docker compose up -d
```

4. 检查 IP 是否变化：
```bash
hostname -I
```

> **提示**：`docker-compose.yml` 配置了 `restart: unless-stopped`，正常情况下容器会自动启动。

---

## 接口测试指南（Apipost/Postman）

### 基础配置

- **Base URL**: `http://服务器IP:3000/api`
- **Content-Type**: `application/json`

### 认证接口

#### 1. 用户注册
```
POST /api/auth/register

Body:
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "123456"
}
```

#### 2. 用户登录
```
POST /api/auth/login

Body:
{
  "username": "admin",
  "password": "123456"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 3. 获取用户信息（需认证）
```
GET /api/auth/profile

Headers:
Authorization: Bearer {accessToken}
```

#### 4. 刷新 Token
```
POST /api/auth/refresh

Body:
{
  "refreshToken": "登录返回的refreshToken"
}
```

### Swagger API 文档

浏览器访问 `http://服务器IP:3000/api/docs` 可查看完整的 API 文档。

---

## Dockerfile 详解

项目使用多阶段构建（Multi-stage Build）来优化镜像大小。

### 完整 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

# 安装 bcrypt 编译所需的依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

# 安装 bcrypt 编译所需的依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --omit=dev

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
```

### Dockerfile 指令详解

| 指令 | 含义 |
|------|------|
| `FROM node:20-alpine AS builder` | 使用 Node.js 20 Alpine 镜像作为构建阶段基础镜像 |
| `RUN apk add --no-cache python3 make g++` | 安装编译原生模块所需的工具（Alpine 用 apk，Ubuntu 用 apt） |
| `WORKDIR /app` | 设置工作目录 |
| `COPY package*.json ./` | 复制 package.json 和 package-lock.json |
| `RUN npm ci` | 根据 lock 文件精确安装依赖（比 npm install 更快更可靠） |
| `COPY . .` | 复制所有源代码 |
| `RUN npm run build` | 编译 TypeScript 代码 |
| `FROM node:20-alpine AS production` | 开始新的生产阶段，镜像更小 |
| `RUN npm ci --omit=dev` | 只安装生产依赖，不安装 devDependencies |
| `COPY --from=builder /app/dist ./dist` | 从构建阶段复制编译后的代码 |
| `ENV NODE_ENV=production` | 设置环境变量 |
| `EXPOSE 3000` | 声明容器监听的端口（文档作用） |
| `HEALTHCHECK` | 定义健康检查命令 |
| `CMD ["node", "dist/main"]` | 容器启动时执行的命令 |

### 多阶段构建的优势

```
┌─────────────────────────────────────────────────────────────┐
│  构建阶段 (builder)                                          │
│  - 包含所有开发依赖                                           │
│  - 包含 TypeScript 源码                                      │
│  - 包含编译工具                                               │
│  - 镜像较大（~500MB+）                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 只复制 dist 目录
┌─────────────────────────────────────────────────────────────┐
│  生产阶段 (production)                                       │
│  - 只有生产依赖                                               │
│  - 只有编译后的 JS 代码                                       │
│  - 镜像更小（~200MB）                                         │
└─────────────────────────────────────────────────────────────┘
```

### Alpine vs 标准镜像

| 镜像 | 大小 | 特点 |
|------|------|------|
| `node:20` | ~1GB | 基于 Debian，包含更多工具 |
| `node:20-alpine` | ~150MB | 基于 Alpine Linux，极简 |
| `node:20-slim` | ~200MB | 精简版 Debian |

Alpine 镜像更小，但使用 `musl` 而不是 `glibc`，某些原生模块需要重新编译。

---

## 设置开机自启

```bash
# Docker 服务开机自启（默认已启用）
sudo systemctl enable docker

# 容器开机自启（docker-compose.yml 中已配置 restart: unless-stopped）
```
