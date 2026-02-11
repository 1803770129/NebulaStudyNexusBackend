# 需求文档：图片 CDN 混合降级方案

## 简介

本功能实现了一个健壮的多 CDN 混合降级机制，用于解决 jsDelivr CDN 连接超时问题。系统当前使用 GitHub + jsDelivr CDN 存储图片，但用户经常遇到 `ERR_CONNECTION_TIMED_OUT` 错误。

混合方案采用三层降级策略：
1. **主 CDN**: Statically CDN（比 jsDelivr 更稳定可靠）
2. **备用 CDN 1**: GitHub Raw（直接从 GitHub 获取）
3. **备用 CDN 2**: 自建代理服务（后端转发，最后保障）

系统将自动在这些 URL 之间切换，确保图片始终能够加载，提供无缝的用户体验。

## 术语表

- **CDN_Service（CDN 服务）**: 提供 URL 并处理降级逻辑的图片分发系统
- **Primary_CDN（主 CDN）**: Statically CDN (https://cdn.statically.io/gh/{repo}@{branch}/{path})
- **Secondary_CDN（备用 CDN）**: GitHub Raw (https://raw.githubusercontent.com/{repo}/{branch}/{path})
- **Proxy_Service（代理服务）**: 后端图片代理接口 (/api/upload/proxy/{filename})
- **Fallback_Chain（降级链）**: 加载图片时尝试的 URL 有序序列 [Statically → GitHub Raw → Proxy]
- **Health_Monitor（健康监控器）**: 检查 CDN 可用性并缓存结果的服务
- **URL_Cache（URL 缓存）**: 持久化存储成功的降级 URL，避免重复失败
- **Image_Loader（图片加载器）**: 处理图片加载和自动重试的前端组件
- **Timeout_Threshold（超时阈值）**: 在尝试下一个 URL 之前等待图片响应的最大时间（默认：5 秒）

## 需求

### 需求 1：三层 CDN 降级机制

**用户故事：** 作为用户，我希望当主 CDN 失败时，图片能自动从备用源加载，这样我就不会看到损坏的图片。

#### 验收标准

1. 当 Primary_CDN (Statically) 在 Timeout_Threshold 内未能加载图片时，CDN_Service 应尝试从 Secondary_CDN (GitHub Raw) 加载
2. 当 Secondary_CDN 在 Timeout_Threshold 内未能加载图片时，CDN_Service 应尝试从 Proxy_Service 加载
3. 当所有降级 URL 都失败时，Image_Loader 应显示占位图片和重试按钮
4. CDN_Service 应能为任何给定的图片文件名生成完整的 Fallback_Chain: [Statically URL, GitHub Raw URL, Proxy URL]
5. 当图片从降级 URL 成功加载时，CDN_Service 应缓存该 URL 以供将来请求使用
6. Fallback_Chain 的顺序应可配置，允许调整 CDN 优先级

### 需求 2：前端图片加载与重试

**用户故事：** 作为用户，我希望前端能自动重试失败的图片，无需手动干预，这样我就能获得无缝的浏览体验。

#### 验收标准

1. 当图片加载失败时，Image_Loader 应自动尝试 Fallback_Chain 中的下一个 URL
2. 当 Image_Loader 正在加载图片时，应显示加载指示器
3. 当 Fallback_Chain 中的所有 URL 都失败时，Image_Loader 应显示错误状态和手动重试选项
4. 当用户点击重试按钮时，Image_Loader 应从 Primary_CDN 重新开始 Fallback_Chain
5. Image_Loader 在重试图片加载时不应阻塞 UI

### 需求 3：URL 缓存管理

**用户故事：** 作为开发者，我希望成功的降级 URL 能被缓存，这样系统就能学习哪个 CDN 效果最好，避免重复失败。

#### 验收标准

1. 当图片从降级 URL 成功加载时，URL_Cache 应存储文件名到成功 URL 的映射
2. 当请求图片 URL 时，CDN_Service 应先检查 URL_Cache，然后再使用 Primary_CDN
3. URL_Cache 应在浏览器 localStorage 中持久化数据以实现前端缓存
4. 当缓存的 URL 加载失败时，CDN_Service 应从 URL_Cache 中移除它并重试完整的 Fallback_Chain
5. URL_Cache 应在 24 小时后使条目过期，以允许临时失败的 CDN 恢复

### 需求 4：CDN 健康监控

**用户故事：** 作为系统管理员，我希望监控 CDN 可用性，这样我就能主动识别和响应 CDN 故障。

#### 验收标准

1. Health_Monitor 应提供一个端点来检查 Primary_CDN 可用性
2. 当调用健康检查端点时，Health_Monitor 应尝试从 Primary_CDN 加载测试图片
3. 当 Primary_CDN 在 Timeout_Threshold 内响应时，Health_Monitor 应返回健康状态
4. 当 Primary_CDN 失败或超时时，Health_Monitor 应返回不健康状态及失败原因
5. Health_Monitor 应缓存健康检查结果 60 秒，以避免过度检查

### 需求 5：后端 URL 生成与代理服务

**用户故事：** 作为开发者，我希望后端在上传图片时提供所有降级 URL，并提供代理服务作为最后保障，这样前端就能立即访问备用方案。

#### 验收标准

1. 当图片上传成功时，CDN_Service 应返回三个 URL：Statically CDN URL、GitHub Raw URL、Proxy URL 和文件名
2. CDN_Service 应提供一个方法来为给定文件名生成所有降级 URL
3. Proxy_Service 应提供 GET /api/upload/proxy/:filename 接口，从 GitHub 获取图片并返回
4. Proxy_Service 应实现响应缓存（使用 HTTP Cache-Control 头），避免重复请求 GitHub
5. Proxy_Service 应处理 GitHub API 限流，返回适当的错误信息
6. CDN_Service 应保持与现有上传响应的向后兼容性（url 字段默认返回 Statically URL）
7. 当客户端请求图片元数据时，CDN_Service 应包含所有可用的降级 URL（urls 数组字段）

### 需求 6：错误处理和日志记录

**用户故事：** 作为开发者，我希望有详细的 CDN 失败日志，这样我就能快速诊断和修复问题。

#### 验收标准

1. 当 CDN URL 加载失败时，系统应记录 URL、错误类型和时间戳
2. 当 Fallback_Chain 耗尽时，系统应记录包含所有尝试 URL 的严重错误
3. Image_Loader 应区分网络错误、超时错误和 HTTP 错误
4. 当 Primary_CDN 失败后降级成功时，系统应记录包含成功降级 URL 的警告
5. 系统应提供错误指标（失败次数、成功率）用于监控

### 需求 7：加载状态和用户反馈

**用户故事：** 作为用户，我希望在图片加载或失败时有清晰的视觉反馈，这样我就能理解正在发生什么。

#### 验收标准

1. 当图片正在加载时，Image_Loader 应显示骨架屏加载器或旋转器
2. 当图片加载暂时失败时，Image_Loader 应显示细微的重试指示器
3. 当所有降级尝试都失败时，Image_Loader 应显示带有错误图标的占位图片
4. Image_Loader 应在错误状态下提供手动重试按钮
5. 当图片在重试后成功加载时，Image_Loader 应平滑过渡从加载到已加载状态

### 需求 8：配置和自定义

**用户故事：** 作为开发者，我希望能配置超时阈值和降级行为，这样我就能针对不同的网络条件进行优化。

#### 验收标准

1. CDN_Service 应允许通过环境变量配置 Timeout_Threshold（默认 5 秒）
2. CDN_Service 应允许通过环境变量配置 CDN 优先级顺序（CDN_PRIORITY=statically,github,proxy）
3. CDN_Service 应允许启用或禁用特定的降级 URL（CDN_ENABLE_STATICALLY=true）
4. CDN_Service 应允许配置 URL_Cache 过期时间（默认 24 小时）
5. CDN_Service 应允许配置 Health_Monitor 检查间隔（默认 60 秒）
6. Proxy_Service 应允许配置缓存时间（PROXY_CACHE_TTL，默认 1 小时）
7. 当提供自定义降级 URL 时，CDN_Service 应将它们附加到 Fallback_Chain

### 需求 9：从 jsDelivr 迁移到 Statically

**用户故事：** 作为开发者，我希望能平滑地从 jsDelivr 迁移到 Statically，不影响现有数据和用户体验。

#### 验收标准

1. CDN_Service 应提供一个迁移脚本，批量更新数据库中的 jsDelivr URL 为 Statically URL
2. 系统应支持同时识别 jsDelivr 和 Statically URL 格式
3. 当检测到旧的 jsDelivr URL 时，Image_Loader 应自动转换为 Statically URL
4. 迁移过程应记录详细日志，包括成功和失败的记录
5. 迁移脚本应支持回滚功能，可以恢复到 jsDelivr URL
6. 迁移完成后，系统应提供验证报告，确认所有 URL 都已正确更新

### 需求 10：性能优化

**用户故事：** 作为用户，我希望图片加载速度快，降级切换无感知，这样我就能获得流畅的浏览体验。

#### 验收标准

1. Image_Loader 应实现预加载机制，提前加载可见区域的图片
2. Image_Loader 应实现懒加载，只加载进入视口的图片
3. Proxy_Service 应实现图片压缩，根据请求参数返回不同尺寸的图片
4. Proxy_Service 应设置适当的 HTTP 缓存头（Cache-Control, ETag），利用浏览器缓存
5. URL_Cache 应使用 IndexedDB 替代 localStorage，支持更大的存储空间
6. 当从缓存的 URL 加载时，Image_Loader 应跳过健康检查，直接使用缓存 URL
7. 系统应提供性能监控指标：平均加载时间、降级率、缓存命中率
