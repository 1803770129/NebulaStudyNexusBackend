# 敏感信息安全管理最佳实践

## 🔒 安全问题分析

### .env 文件的安全风险

```
❌ 风险 1：误提交到 Git
   - 开发者忘记添加 .gitignore
   - 提交后即使删除，历史记录仍保留
   - 公开仓库会泄露所有密钥

❌ 风险 2：服务器文件泄露
   - 服务器被入侵，文件被读取
   - 备份文件泄露
   - 日志中打印环境变量

❌ 风险 3：权限管理困难
   - 多人协作时需要共享 .env
   - 无法追踪谁使用了密钥
   - 离职员工仍可能持有密钥

❌ 风险 4：无法动态更新
   - 修改密钥需要重启服务
   - 无法实现密钥轮换
   - 紧急撤销困难
```

---

## ✅ 安全方案对比

| 方案 | 安全性 | 复杂度 | 成本 | 适用场景 |
|------|--------|--------|------|---------|
| **直接 .env** | ⭐ | ⭐ | 免费 | 个人学习项目 |
| **.env + .gitignore** | ⭐⭐ | ⭐ | 免费 | 小型项目 |
| **环境变量注入** | ⭐⭐⭐ | ⭐⭐ | 免费 | 中型项目 |
| **密钥管理服务** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 付费 | 企业级项目 |
| **加密 .env** | ⭐⭐⭐ | ⭐⭐⭐ | 免费 | 中大型项目 |

---

## 方案 1：.env + .gitignore（基础方案）

### 适用场景
- 个人学习项目
- 小型团队项目
- 预算有限

### 实施步骤

#### 1. 确保 .gitignore 配置正确

```bash
# .gitignore
.env
.env.local
.env.*.local
*.env
```

#### 2. 检查是否已提交 .env

```bash
# 检查 Git 历史
git log --all --full-history -- .env

# 如果已提交，从历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（危险操作！）
git push origin --force --all
```

#### 3. 使用 .env.example 作为模板

```bash
# .env.example（可以提交到 Git）
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=username/repo
GITHUB_BRANCH=main

# .env（不提交到 Git）
GITHUB_TOKEN=ghp_real_token_here
GITHUB_REPO=zhangsan/question-images
GITHUB_BRANCH=main
```

#### 4. 服务器部署时手动创建 .env

```bash
# SSH 到服务器
ssh user@server

# 手动创建 .env
nano ~/question-backend/.env
# 粘贴真实配置
```

### 优点
- ✅ 简单易用
- ✅ 零成本
- ✅ 适合小项目

### 缺点
- ❌ 依赖开发者自觉
- ❌ 服务器文件可能泄露
- ❌ 无法审计

---

## 方案 2：环境变量注入（推荐）

### 适用场景
- 中型项目
- Docker 部署
- 需要多环境管理

### 实施步骤

#### 1. 不使用 .env 文件，直接注入环境变量

**Docker Compose 方式：**

```yaml
# docker-compose.yml
services:
  api:
    environment:
      # 从宿主机环境变量读取
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      GITHUB_REPO: ${GITHUB_REPO}
      GITHUB_BRANCH: ${GITHUB_BRANCH}
```

**在服务器上设置环境变量：**

```bash
# 方式 1：临时设置（重启失效）
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
export GITHUB_REPO=username/repo
export GITHUB_BRANCH=main

# 方式 2：永久设置（推荐）
# 编辑 ~/.bashrc 或 ~/.profile
nano ~/.bashrc

# 添加以下内容
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
export GITHUB_REPO=username/repo
export GITHUB_BRANCH=main

# 重新加载
source ~/.bashrc

# 启动服务
docker compose up -d
```

#### 2. 使用 systemd 环境文件（Linux 推荐）

```bash
# 创建环境文件（权限 600）
sudo nano /etc/question-backend.env

# 内容
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_REPO=username/repo
GITHUB_BRANCH=main

# 设置权限（只有 root 可读）
sudo chmod 600 /etc/question-backend.env
sudo chown root:root /etc/question-backend.env
```

**docker-compose.yml 引用：**

```yaml
services:
  api:
    env_file:
      - /etc/question-backend.env
```

### 优点
- ✅ 不会误提交到 Git
- ✅ 可以设置文件权限
- ✅ 支持多环境配置
- ✅ Docker 原生支持

### 缺点
- ❌ 需要手动管理环境变量
- ❌ 服务器迁移需要重新配置

---

## 方案 3：加密 .env 文件（进阶）

### 适用场景
- 需要提交配置到 Git
- 团队协作项目
- 需要版本控制

### 使用 git-crypt

#### 1. 安装 git-crypt

```bash
# Ubuntu/Debian
sudo apt install git-crypt

# macOS
brew install git-crypt

# Windows (WSL)
sudo apt install git-crypt
```

#### 2. 初始化加密

```bash
cd question-backend

# 初始化 git-crypt
git-crypt init

# 生成密钥
git-crypt export-key ../git-crypt-key
```

#### 3. 配置加密规则

```bash
# 创建 .gitattributes
nano .gitattributes

# 内容
.env filter=git-crypt diff=git-crypt
.env.production filter=git-crypt diff=git-crypt
```

#### 4. 提交加密文件

```bash
git add .env .gitattributes
git commit -m "Add encrypted .env"
git push
```

#### 5. 团队成员解密

```bash
# 获取密钥文件（通过安全渠道）
# 解锁仓库
git-crypt unlock /path/to/git-crypt-key
```

### 优点
- ✅ 可以提交到 Git
- ✅ 支持版本控制
- ✅ 团队协作方便

### 缺点
- ❌ 需要管理密钥文件
- ❌ 学习成本较高

---

## 方案 4：密钥管理服务（企业级）

### 适用场景
- 大型企业项目
- 需要审计和权限管理
- 预算充足

### 选项对比

| 服务 | 免费额度 | 特点 |
|------|---------|------|
| **AWS Secrets Manager** | 30天免费试用 | 自动轮换，审计日志 |
| **HashiCorp Vault** | 开源免费 | 功能强大，自托管 |
| **Azure Key Vault** | 10,000次操作/月 | 与 Azure 集成 |
| **Google Secret Manager** | 10,000次操作/月 | 与 GCP 集成 |

### 示例：使用 HashiCorp Vault（开源）

#### 1. 安装 Vault

```bash
# Docker 方式
docker run -d --name=vault \
  -p 8200:8200 \
  --cap-add=IPC_LOCK \
  vault server -dev
```

#### 2. 存储密钥

```bash
# 设置 Vault 地址
export VAULT_ADDR='http://127.0.0.1:8200'

# 存储密钥
vault kv put secret/github \
  token=ghp_xxxxxxxxxxxx \
  repo=username/repo \
  branch=main
```

#### 3. 后端集成

```bash
npm install node-vault
```

```typescript
// src/config/vault.config.ts
import * as vault from 'node-vault';

export async function getGitHubConfig() {
  const client = vault({
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN,
  });

  const result = await client.read('secret/data/github');
  return result.data.data;
}
```

```typescript
// src/modules/upload/upload.service.ts
import { getGitHubConfig } from '@/config/vault.config';

@Injectable()
export class UploadService {
  private githubConfig: any;

  async onModuleInit() {
    this.githubConfig = await getGitHubConfig();
  }

  async uploadImage(...) {
    const token = this.githubConfig.token;
    // ...
  }
}
```

### 优点
- ✅ 最高安全性
- ✅ 支持密钥轮换
- ✅ 完整审计日志
- ✅ 细粒度权限控制

### 缺点
- ❌ 复杂度高
- ❌ 需要额外基础设施
- ❌ 学习成本高

---

## 方案 5：GitHub Secrets（CI/CD 场景）

### 适用场景
- 使用 GitHub Actions 部署
- 自动化构建

### 实施步骤

#### 1. 在 GitHub 仓库设置 Secrets

1. 仓库 → Settings → Secrets and variables → Actions
2. 点击 **New repository secret**
3. 添加：
   - Name: `GITHUB_TOKEN`
   - Value: `ghp_xxxxxxxxxxxx`

#### 2. 在 GitHub Actions 中使用

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ secrets.GITHUB_REPO }}
        run: |
          ssh user@server "cd ~/app && \
            export GITHUB_TOKEN=$GITHUB_TOKEN && \
            export GITHUB_REPO=$GITHUB_REPO && \
            docker compose up -d"
```

### 优点
- ✅ GitHub 原生支持
- ✅ 不会泄露到日志
- ✅ 免费

### 缺点
- ❌ 仅限 GitHub Actions
- ❌ 需要 CI/CD 流程

---

## 🎯 推荐方案（按项目规模）

### 个人学习项目
```
方案：.env + .gitignore
理由：简单够用，零成本
```

### 小型团队项目（2-5人）
```
方案：环境变量注入 + systemd 环境文件
理由：安全性提升，管理方便
```

### 中型项目（5-20人）
```
方案：加密 .env (git-crypt) + 环境变量注入
理由：支持版本控制，团队协作
```

### 大型企业项目（20+人）
```
方案：HashiCorp Vault 或云服务密钥管理
理由：最高安全性，审计合规
```

---

## 🛡️ 通用安全建议

### 1. Token 权限最小化

```
✅ 只授予必要权限
   - GitHub Token：只勾选 repo
   - 不要使用 admin 权限

✅ 使用细粒度 Token
   - GitHub Fine-grained tokens（推荐）
   - 限制仓库范围
   - 设置过期时间
```

### 2. 定期轮换密钥

```bash
# 每 3-6 个月更换一次
# 1. 生成新 Token
# 2. 更新配置
# 3. 删除旧 Token
# 4. 重启服务
```

### 3. 监控异常访问

```bash
# 查看 GitHub API 使用情况
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/rate_limit

# 检查 Token 权限
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user
```

### 4. 使用 .env.example

```bash
# .env.example（提交到 Git）
GITHUB_TOKEN=your_token_here
GITHUB_REPO=username/repo

# .env（不提交）
GITHUB_TOKEN=ghp_real_token
GITHUB_REPO=zhangsan/images
```

### 5. 服务器文件权限

```bash
# 设置 .env 文件权限
chmod 600 .env
chown root:root .env

# 或者只允许应用用户读取
chown app-user:app-user .env
chmod 400 .env
```

### 6. 不要在日志中打印密钥

```typescript
// ❌ 错误
console.log('Token:', process.env.GITHUB_TOKEN);

// ✅ 正确
console.log('Token:', process.env.GITHUB_TOKEN ? '***' : 'not set');
```

### 7. 使用环境变量验证

```typescript
// src/config/configuration.ts
export default () => {
  const requiredEnvVars = [
    'GITHUB_TOKEN',
    'GITHUB_REPO',
    'GITHUB_BRANCH',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    github: {
      token: process.env.GITHUB_TOKEN,
      repo: process.env.GITHUB_REPO,
      branch: process.env.GITHUB_BRANCH,
    },
  };
};
```

---

## 🚨 应急响应

### Token 泄露处理流程

```
1. 立即撤销 Token
   → GitHub → Settings → Developer settings
   → Personal access tokens → Delete

2. 检查泄露范围
   → 查看 Git 历史
   → 检查日志文件
   → 审查访问记录

3. 生成新 Token
   → 使用更强的权限控制
   → 设置过期时间

4. 更新所有服务
   → 更新 .env 文件
   → 重启服务
   → 通知团队成员

5. 审查影响
   → 检查 GitHub 仓库是否被修改
   → 查看 API 使用记录
   → 评估数据泄露风险
```

---

## 📋 安全检查清单

### 开发阶段
- [ ] .env 已添加到 .gitignore
- [ ] 使用 .env.example 作为模板
- [ ] 不在代码中硬编码密钥
- [ ] 不在日志中打印密钥

### 部署阶段
- [ ] 服务器 .env 文件权限正确（600 或 400）
- [ ] 使用环境变量注入（推荐）
- [ ] 配置文件不可公开访问
- [ ] 定期备份配置（加密）

### 运维阶段
- [ ] 定期轮换密钥（3-6个月）
- [ ] 监控异常访问
- [ ] 审计日志
- [ ] 离职员工撤销权限

---

## 总结

| 安全级别 | 方案 | 适用场景 |
|---------|------|---------|
| ⭐ 基础 | .env + .gitignore | 个人学习 |
| ⭐⭐ 标准 | 环境变量注入 | 小型项目 |
| ⭐⭐⭐ 进阶 | 加密 .env | 团队协作 |
| ⭐⭐⭐⭐⭐ 企业级 | 密钥管理服务 | 大型项目 |

**对于你的项目，我推荐：**

```
开发环境：.env + .gitignore
生产环境：环境变量注入 + systemd 环境文件
```

这样既简单又安全，成本为零！
