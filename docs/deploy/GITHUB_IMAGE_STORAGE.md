# GitHub + jsDelivr CDN 图片存储方案

## 📋 方案概述

使用 GitHub 仓库存储图片，通过 jsDelivr CDN 加速访问，实现完全免费的图片存储解决方案。

### 优势

- ✅ **完全免费**：无需信用卡，单仓库 100GB 存储
- ✅ **全球 CDN**：jsDelivr 提供全球加速
- ✅ **永久稳定**：GitHub 不会删除你的文件
- ✅ **版本控制**：支持图片历史版本管理
- ✅ **简单易用**：只需 GitHub 账号和 API Token

### 架构图

```
┌─────────────┐
│   前端      │  上传图片
│  (React)    │────────────┐
└─────────────┘            │
                           ▼
                    ┌─────────────┐
                    │  后端 API   │
                    │  (NestJS)   │
                    └──────┬──────┘
                           │ GitHub API
                           ▼
                    ┌─────────────┐
                    │   GitHub    │
                    │  Repository │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  jsDelivr   │
                    │  CDN 加速   │
                    └─────────────┘
```

---

## 第一步：创建 GitHub 图片仓库

### 1.1 创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `question-images`（或其他名称）
   - **Description**: `图片存储仓库`
   - **Public**: ✅ 必须选择公开（jsDelivr 只支持公开仓库）
   - **Initialize**: ✅ 勾选 "Add a README file"
4. 点击 **Create repository**

### 1.2 创建 images 目录

1. 进入刚创建的仓库
2. 点击 **Add file** → **Create new file**
3. 文件名输入：`images/.gitkeep`
4. 点击 **Commit new file**

> **说明**：创建 `images` 目录用于存放图片，`.gitkeep` 是占位文件（Git 不跟踪空目录）

---

## 第二步：生成 GitHub Personal Access Token

### 2.1 创建 Token

1. 点击右上角头像 → **Settings**
2. 左侧菜单最下方 → **Developer settings**
3. 左侧菜单 → **Personal access tokens** → **Tokens (classic)**
4. 点击 **Generate new token** → **Generate new token (classic)**

### 2.2 配置 Token

填写以下信息：

| 字段 | 值 |
|------|-----|
| **Note** | `question-backend-upload`（备注名称） |
| **Expiration** | `No expiration`（永不过期）或自定义 |
| **Select scopes** | ✅ 勾选 `repo`（完整仓库权限） |


### 2.3 保存 Token

1. 点击 **Generate token**
2. **重要**：复制生成的 Token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）
3. ⚠️ **只显示一次**，请妥善保存！

**Token 示例：**
```

```

### 2.4 Token 安全建议

⚠️ **重要安全提示：**

- ❌ **不要**将 Token 提交到 Git
- ❌ **不要**在代码中硬编码 Token
- ❌ **不要**在日志中打印 Token
- ✅ **务必**使用环境变量存储
- ✅ **务必**设置 `.gitignore`
- ✅ **定期**更换 Token（建议 3-6 个月）

**如果 Token 泄露：**
1. 立即到 GitHub → Settings → Developer settings → Personal access tokens
2. 找到对应 Token → Delete
3. 生成新 Token 并更新配置
4. 检查 GitHub 仓库是否被恶意修改

---

## 第三步：后端集成

### 3.1 安装依赖

```bash
cd question-backend
npm install axios
```

> **说明**：`axios` 用于调用 GitHub API

### 3.2 配置环境变量

**⚠️ 安全第一：不要将真实 Token 提交到 Git！**

#### 步骤 1：确保 .gitignore 配置正确

```bash
# 检查 .gitignore 是否包含 .env
cat .gitignore | grep .env

# 如果没有，添加
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.env" >> .gitignore
```

#### 步骤 2：创建 .env 文件

编辑 `.env` 文件，添加：

```bash
# GitHub 图床配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/question-images
GITHUB_BRANCH=main
```

**参数说明：**

| 参数 | 说明 | 示例 |
|------|------|------|
| `GITHUB_TOKEN` | 刚才生成的 Personal Access Token | `ghp_1234...` |
| `GITHUB_REPO` | 仓库路径（用户名/仓库名） | `zhangsan/question-images` |
| `GITHUB_BRANCH` | 分支名称 | `main` 或 `master` |

#### 步骤 3：设置文件权限（Linux/Mac）

```bash
# 设置 .env 文件权限为只有所有者可读写
chmod 600 .env

# 验证权限
ls -la .env
# 应该显示：-rw------- 1 user user
```

### 3.3 更新 .env.example

编辑 `question-backend/.env.example`，添加：

```bash
# GitHub 图床配置
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=username/question-images
GITHUB_BRANCH=main
```

**说明：**
- `.env.example` 是模板文件，**可以提交到 Git**
- 只包含示例值，不包含真实密钥
- 团队成员可以复制此文件创建自己的 `.env`

```bash
# 新成员使用方式
cp .env.example .env
# 然后编辑 .env 填入真实配置
```

### 3.4 更新配置文件

编辑 `src/config/configuration.ts`：

```typescript
export default () => ({
  // ... 现有配置
  
  // GitHub 图床配置
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
  },
});
```

### 3.5 修改 Upload Service

编辑 `src/modules/upload/upload.service.ts`：

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  private readonly githubToken: string;
  private readonly githubRepo: string;
  private readonly githubBranch: string;

  constructor(private readonly configService: ConfigService) {
    this.githubToken = this.configService.get<string>('github.token');
    this.githubRepo = this.configService.get<string>('github.repo');
    this.githubBranch = this.configService.get<string>('github.branch');
  }

  validateImage(file: { mimetype: string; size: number }): boolean {
    return (
      this.allowedMimeTypes.includes(file.mimetype) &&
      file.size <= this.maxFileSize
    );
  }

  getValidationError(file: { mimetype: string; size: number }): string | null {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return `不支持的文件类型: ${file.mimetype}。支持的类型: jpg, png, gif, webp`;
    }
    if (file.size > this.maxFileSize) {
      return `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: 5MB`;
    }
    return null;
  }

  async uploadImage(
    file: Buffer,
    originalname: string,
    mimetype: string,
    size: number,
  ): Promise<UploadResult> {
    // 验证文件
    const validationError = this.getValidationError({ mimetype, size });
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    // 生成唯一文件名
    const ext = path.extname(originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = `images/${filename}`;

    try {
      // 上传到 GitHub
      const response = await axios.put(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          message: `Upload ${filename}`,
          content: file.toString('base64'),
          branch: this.githubBranch,
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 使用 jsDelivr CDN 加速
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${this.githubRepo}@${this.githubBranch}/${filePath}`;

      return {
        url: cdnUrl,
        filename,
        size,
      };
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(
          `GitHub API 错误: ${error.response.data.message}`,
        );
      }
      throw new BadRequestException('图片上传失败');
    }
  }

  // 可选：删除图片
  async deleteImage(filename: string): Promise<void> {
    const filePath = `images/${filename}`;

    try {
      // 获取文件 SHA（删除需要）
      const getResponse = await axios.get(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
          },
        },
      );

      const sha = getResponse.data.sha;

      // 删除文件
      await axios.delete(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          data: {
            message: `Delete ${filename}`,
            sha,
            branch: this.githubBranch,
          },
          headers: {
            Authorization: `token ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      throw new BadRequestException('图片删除失败');
    }
  }

  // 检查图片是否存在
  async imageExists(filename: string): Promise<boolean> {
    const filePath = `images/${filename}`;

    try {
      await axios.get(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
          },
        },
      );
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3.6 更新 Upload Controller

编辑 `src/modules/upload/upload.controller.ts`：

```typescript
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Multer } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '上传图片到 GitHub' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件 (支持 jpg, png, gif, webp，最大 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '文件验证失败' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return this.uploadService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );
  }
}
```

> **注意**：删除了 `GET /upload/images/:filename` 接口，因为图片直接从 CDN 访问

---

## 第四步：Docker 部署配置

### 4.1 更新 docker-compose.yml

编辑 `question-backend/docker-compose.yml`：

```yaml
services:
  api:
    environment:
      # 添加 GitHub 配置（从环境变量读取）
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      GITHUB_REPO: ${GITHUB_REPO}
      GITHUB_BRANCH: ${GITHUB_BRANCH}
    # 不再需要挂载 uploads 目录
    # volumes:
    #   - ./uploads:/app/uploads  # 可以删除或注释
```

### 4.2 配置环境变量（两种方式）

#### 方式 A：使用 .env 文件（开发环境推荐）

在服务器上编辑 `question-backend/.env`：

```bash
# 添加 GitHub 配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/question-images
GITHUB_BRANCH=main
```

**安全提示：**
```bash
# 设置文件权限（重要！）
chmod 600 .env
chown $USER:$USER .env

# 确保 .gitignore 包含 .env
echo ".env" >> .gitignore
```

#### 方式 B：使用系统环境变量（生产环境推荐）

**更安全的方式**，不使用 `.env` 文件：

```bash
# 1. 创建受保护的环境文件
sudo nano /etc/question-backend.env

# 2. 添加配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/question-images
GITHUB_BRANCH=main

# 3. 设置严格权限（只有 root 可读）
sudo chmod 600 /etc/question-backend.env
sudo chown root:root /etc/question-backend.env
```

**更新 docker-compose.yml 引用：**

```yaml
services:
  api:
    env_file:
      - /etc/question-backend.env  # 使用系统环境文件
    # 或者直接从系统环境变量读取
    environment:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      GITHUB_REPO: ${GITHUB_REPO}
      GITHUB_BRANCH: ${GITHUB_BRANCH}
```

**在系统中设置环境变量：**

```bash
# 编辑 ~/.bashrc 或 ~/.profile
nano ~/.bashrc

# 添加以下内容
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export GITHUB_REPO=username/question-images
export GITHUB_BRANCH=main

# 重新加载
source ~/.bashrc

# 验证
echo $GITHUB_TOKEN
```

### 4.3 安全检查清单

部署前请确认：

- [ ] ✅ `.env` 文件已添加到 `.gitignore`
- [ ] ✅ `.env` 文件权限设置为 600 或 400
- [ ] ✅ 不要将 `.env` 提交到 Git
- [ ] ✅ 生产环境使用系统环境变量（推荐）
- [ ] ✅ 定期更换 GitHub Token（3-6个月）

### 4.4 验证配置

```bash
# 检查环境变量是否正确加载
docker compose config

# 应该看到环境变量已被替换（不会显示实际值）
```

---

## 第五步：测试

### 5.1 本地测试

```bash
# 启动开发服务器
npm run start:dev
```

### 5.2 使用 Apipost/Postman 测试

**请求配置：**

```
POST http://localhost:3000/api/upload/image
Headers:
  Authorization: Bearer {your_token}
Body:
  form-data
  file: [选择图片文件]
```

**成功响应示例：**

```json
{
  "url": "https://cdn.jsdelivr.net/gh/username/question-images@main/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 102400
}
```

### 5.3 验证图片访问

直接在浏览器访问返回的 URL：

```
https://cdn.jsdelivr.net/gh/username/question-images@main/images/abc123.jpg
```

应该能看到上传的图片。

---

## 第六步：部署到服务器

### 6.1 更新代码

```bash
# 在服务器上
cd ~/NebulaStudyNexusBackend/question-backend
git pull  # 如果使用 Git
```

### 6.2 重新构建部署

```bash
# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f api
```

### 6.3 测试线上接口

```bash
# 在服务器上测试
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer {token}" \
  -F "file=@test.jpg"
```

---

## 工作原理详解

### 上传流程

```
1. 前端选择图片
   ↓
2. 发送到后端 API (POST /api/upload/image)
   ↓
3. 后端验证文件（类型、大小）
   ↓
4. 生成唯一文件名 (UUID + 扩展名)
   ↓
5. 将图片转为 Base64
   ↓
6. 调用 GitHub API 上传
   PUT https://api.github.com/repos/{user}/{repo}/contents/images/{filename}
   ↓
7. 返回 jsDelivr CDN 地址
   https://cdn.jsdelivr.net/gh/{user}/{repo}@{branch}/images/{filename}
   ↓
8. 前端使用 CDN 地址显示图片
```

### GitHub API 说明

**上传文件：**

```http
PUT /repos/{owner}/{repo}/contents/{path}

Body:
{
  "message": "提交信息",
  "content": "Base64 编码的文件内容",
  "branch": "分支名"
}
```

**删除文件：**

```http
DELETE /repos/{owner}/{repo}/contents/{path}

Body:
{
  "message": "提交信息",
  "sha": "文件的 SHA 值",
  "branch": "分支名"
}
```

### jsDelivr CDN 格式

```
https://cdn.jsdelivr.net/gh/{user}/{repo}@{branch}/{path}
```

**示例：**
```
https://cdn.jsdelivr.net/gh/zhangsan/question-images@main/images/abc123.jpg
```

**优势：**
- 全球 CDN 加速
- 自动缓存
- 支持版本控制（@main, @v1.0.0）

---

## 常见问题

### Q1: GitHub API 限制是多少？

**A:** 
- **未认证**：60 次/小时
- **已认证**（使用 Token）：5000 次/小时
- **单文件大小**：最大 100MB

对于图片上传场景，5000 次/小时完全够用。

### Q2: jsDelivr CDN 有延迟吗？

**A:** 
- 首次访问：可能需要 1-5 分钟缓存
- 后续访问：全球 CDN 加速，速度很快
- 可以在上传后立即访问 GitHub 原始地址：
  ```
  https://raw.githubusercontent.com/{user}/{repo}/{branch}/images/{filename}
  ```

### Q3: 如何查看仓库中的所有图片？

**A:** 
1. 访问 GitHub 仓库
2. 进入 `images` 目录
3. 可以看到所有上传的图片

### Q4: 如何批量删除图片？

**A:** 
可以直接在 GitHub 仓库中删除，或使用 API：

```typescript
// 批量删除
async deleteImages(filenames: string[]): Promise<void> {
  for (const filename of filenames) {
    await this.deleteImage(filename);
  }
}
```

### Q5: 图片会被 GitHub 删除吗？

**A:** 
不会！只要：
- 仓库是公开的
- 不违反 GitHub 使用条款
- 账号正常

图片会永久保存。

### Q6: 如何迁移现有图片？

**A:** 
使用脚本批量上传：

```typescript
// scripts/migrate-to-github.ts
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const GITHUB_TOKEN = 'your_token';
const GITHUB_REPO = 'username/question-images';
const GITHUB_BRANCH = 'main';

async function uploadToGitHub(filename: string, content: Buffer) {
  const filePath = `images/${filename}`;
  
  await axios.put(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      message: `Migrate ${filename}`,
      content: content.toString('base64'),
      branch: GITHUB_BRANCH,
    },
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

async function migrateImages() {
  const imagesDir = path.join(__dirname, '../uploads/images');
  const files = fs.readdirSync(imagesDir);

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const content = fs.readFileSync(filePath);

    try {
      await uploadToGitHub(file, content);
      console.log(`✅ Uploaded: ${file}`);
    } catch (error) {
      console.error(`❌ Failed: ${file}`, error.message);
    }

    // 避免触发 API 限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

migrateImages();
```

运行：
```bash
npx ts-node scripts/migrate-to-github.ts
```

### Q7: 如何优化上传速度？

**A:** 
1. **压缩图片**：使用 sharp 在上传前压缩
2. **并发上传**：前端支持多图上传
3. **进度显示**：使用 axios 的 onUploadProgress

```typescript
// 压缩示例
import * as sharp from 'sharp';

const compressed = await sharp(file)
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Q8: GitHub Token 泄露怎么办？

**A:** 
1. 立即删除泄露的 Token：
   - GitHub → Settings → Developer settings → Personal access tokens
   - 找到对应 Token → Delete
2. 生成新的 Token
3. 更新 `.env` 文件
4. 重启服务

### Q9: 如何监控使用情况？

**A:** 
查看 GitHub API 限制：

```bash
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/rate_limit
```

返回：
```json
{
  "rate": {
    "limit": 5000,
    "remaining": 4999,
    "reset": 1234567890
  }
}
```

---

## 性能优化建议

### 1. 图片压缩

```bash
npm install sharp
```

```typescript
async uploadImage(file: Buffer, ...): Promise<UploadResult> {
  // 压缩图片
  const compressed = await sharp(file)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 上传压缩后的图片
  // ...
}
```

### 2. 添加重试机制

```typescript
async uploadWithRetry(file: Buffer, retries = 3): Promise<UploadResult> {
  for (let i = 0; i < retries; i++) {
    try {
      return await this.uploadImage(file, ...);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. 缓存 CDN URL

在数据库中存储 CDN URL，避免重复上传相同图片：

```typescript
// 计算文件 hash
import * as crypto from 'crypto';

const hash = crypto.createHash('md5').update(file).digest('hex');
// 检查数据库是否已存在该 hash 的图片
```

---

## 安全建议

### 1. Token 安全

- ✅ 使用环境变量存储 Token
- ✅ 不要提交 `.env` 到 Git
- ✅ 定期更换 Token
- ✅ 使用最小权限（只勾选 repo）

### 2. 文件验证

- ✅ 验证文件类型（MIME type）
- ✅ 限制文件大小
- ✅ 检查文件内容（防止恶意文件）
- ✅ 使用 UUID 生成文件名（防止路径遍历）

### 3. 访问控制

- ✅ 上传接口需要认证（JWT）
- ✅ 限制上传频率（防止滥用）
- ✅ 记录上传日志

---

## 成本分析

### GitHub 免费额度

| 项目 | 免费额度 |
|------|---------|
| 仓库存储 | 100GB |
| API 调用 | 5000次/小时 |
| 带宽 | 无限制 |
| 文件大小 | 单文件 100MB |

### jsDelivr CDN

- ✅ 完全免费
- ✅ 无流量限制
- ✅ 全球加速

### 总成本

**$0/月** 🎉

---

## 总结

GitHub + jsDelivr 方案适合：

✅ 个人项目、学习项目  
✅ 中小型网站（< 100GB 图片）  
✅ 对成本敏感的项目  
✅ 需要版本控制的场景  

不适合：

❌ 大型商业项目（建议用专业 CDN）  
❌ 需要极高可用性的场景  
❌ 图片量超过 100GB  

---

## 下一步

1. ✅ 创建 GitHub 仓库
2. ✅ 生成 Personal Access Token
3. ✅ 修改后端代码
4. ✅ 测试上传功能
5. ✅ 部署到服务器
6. ✅ 迁移现有图片（可选）

需要帮助？查看：
- [GitHub API 文档](https://docs.github.com/en/rest)
- [jsDelivr 文档](https://www.jsdelivr.com/documentation)
