# Linux 常用命令速查表

> 针对 Ubuntu Server 部署 Docker 项目的场景

## 文件与目录操作

```bash
# 查看当前目录
pwd

# 列出文件（详细信息）
ls -la

# 切换目录
cd /path/to/dir
cd ..          # 上级目录
cd ~           # 用户主目录

# 创建目录
mkdir mydir
mkdir -p a/b/c  # 递归创建

# 复制
cp file1 file2
cp -r dir1 dir2  # 复制目录

# 移动/重命名
mv old new

# 删除
rm file
rm -rf dir      # 删除目录（谨慎使用！）

# 查看文件内容
cat file        # 全部内容
head -n 20 file # 前20行
tail -n 20 file # 后20行
tail -f file    # 实时查看（看日志用）

# 编辑文件
nano file       # 简单编辑器，Ctrl+O保存，Ctrl+X退出
vim file        # 高级编辑器，按i编辑，Esc后:wq保存退出
```

## 权限管理

```bash
# 查看权限
ls -la

# 修改权限
chmod 755 file      # rwxr-xr-x
chmod +x script.sh  # 添加执行权限

# 修改所有者
chown user:group file
chown -R user:group dir  # 递归
```

## 系统信息

```bash
# 查看系统信息
uname -a

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 信息
lscpu

# 查看运行中的进程
ps aux
top         # 实时监控
htop        # 更好看的监控（需安装）

# 查看端口占用
netstat -tlnp
ss -tlnp
```

## 网络相关

```bash
# 查看 IP 地址
ip addr
hostname -I

# 测试网络连通性
ping google.com

# 测试端口
curl http://localhost:3000
wget http://example.com/file

# 查看防火墙状态
sudo ufw status

# 开放端口
sudo ufw allow 3000
sudo ufw allow 22    # SSH
sudo ufw enable
```

## 软件包管理（Ubuntu/Debian）

```bash
# 更新软件源
sudo apt update

# 升级已安装软件
sudo apt upgrade

# 安装软件
sudo apt install package-name

# 卸载软件
sudo apt remove package-name

# 搜索软件
apt search keyword
```

## 用户管理

```bash
# 切换到 root
sudo su

# 以 root 执行命令
sudo command

# 添加用户
sudo adduser username

# 将用户加入 docker 组
sudo usermod -aG docker username
```

## 服务管理（systemd）

```bash
# 查看服务状态
sudo systemctl status nginx

# 启动/停止/重启服务
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# 开机自启
sudo systemctl enable nginx
sudo systemctl disable nginx
```

## Docker 常用命令

```bash
# 镜像操作
docker images                    # 列出镜像
docker pull nginx               # 拉取镜像
docker rmi image-id             # 删除镜像

# 容器操作
docker ps                       # 运行中的容器
docker ps -a                    # 所有容器
docker start/stop/restart name  # 启停容器
docker rm container-id          # 删除容器
docker logs -f container-name   # 查看日志

# 进入容器
docker exec -it container-name bash
docker exec -it container-name sh  # Alpine 用 sh

# Docker Compose
docker compose up -d            # 后台启动
docker compose down             # 停止并删除
docker compose ps               # 查看状态
docker compose logs -f          # 查看日志
docker compose restart          # 重启
docker compose pull             # 更新镜像
docker compose up -d --build    # 重新构建并启动

# 清理
docker system prune             # 清理无用数据
docker volume prune             # 清理无用卷
```

## 文件传输

```bash
# 从本地上传到服务器
scp file.txt user@server:/path/

# 从服务器下载到本地
scp user@server:/path/file.txt ./

# 上传目录
scp -r mydir user@server:/path/

# 使用 rsync（更高效）
rsync -avz ./project user@server:/path/
```

## 压缩解压

```bash
# tar.gz
tar -czvf archive.tar.gz dir/   # 压缩
tar -xzvf archive.tar.gz        # 解压

# zip
zip -r archive.zip dir/         # 压缩
unzip archive.zip               # 解压
```

## 查找与搜索

```bash
# 查找文件
find /path -name "*.log"
find . -type f -size +100M      # 大于100M的文件

# 搜索文件内容
grep "keyword" file
grep -r "keyword" dir/          # 递归搜索
grep -i "keyword" file          # 忽略大小写
```

## 实用技巧

```bash
# 命令历史
history
!100        # 执行第100条历史命令
!!          # 执行上一条命令

# 管道与重定向
command > file      # 输出到文件（覆盖）
command >> file     # 输出到文件（追加）
command1 | command2 # 管道

# 后台运行
command &
nohup command &     # 退出终端后继续运行

# 快捷键
Ctrl + C    # 终止当前命令
Ctrl + Z    # 暂停当前命令
Ctrl + D    # 退出当前终端
Ctrl + L    # 清屏
Tab         # 自动补全
```

## 项目部署流程示例

```bash
# 1. 连接服务器
ssh user@your-server-ip

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# 重新登录

# 3. 上传项目（在本地执行）
scp -r question-backend user@server:~/

# 4. 启动服务
cd ~/question-backend
cp .env.example .env
nano .env  # 修改配置
docker compose up -d --build

# 5. 查看状态
docker compose ps
docker compose logs -f

# 6. 开放防火墙
sudo ufw allow 3000
sudo ufw allow 5432  # 如需外部访问数据库
```
