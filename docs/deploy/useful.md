# 常用
## 本地修改文件，提交到git再同步到服务器
# 1. 停止服务
docker compose down

# 2. 强制以远程为主（丢弃本地修改）
git fetch origin
git reset --hard origin/main  # 如果是 master 分支就改成 origin/master

# 3. 确认更新成功
git log -1

# 4. 重新构建并启动
docker compose up -d --build

# 5. 查看启动日志
docker compose logs -f api
