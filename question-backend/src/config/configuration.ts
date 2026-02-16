/**
 * 应用配置
 *
 * 使用工厂函数模式，从环境变量读取配置
 * 提供类型安全的配置访问
 */
export default () => ({
  // 应用配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'question_manager',
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'debug',
  // GitHub 图床配置
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
  },

  // CDN 混合降级配置
  cdn: {
    timeout: parseInt(process.env.CDN_TIMEOUT || '5000', 10),
    priority: (process.env.CDN_PRIORITY || 'statically,github,proxy').split(','),
    enabledCDNs: {
      statically: process.env.CDN_ENABLE_STATICALLY !== 'false',
      github: process.env.CDN_ENABLE_GITHUB !== 'false',
      proxy: process.env.CDN_ENABLE_PROXY !== 'false',
    },
    cacheTTL: parseInt(process.env.CDN_CACHE_TTL || '86400000', 10),
    healthCheckInterval: parseInt(process.env.CDN_HEALTH_CHECK_INTERVAL || '60000', 10),
  },

  // 代理服务配置
  proxy: {
    cacheTTL: parseInt(process.env.PROXY_CACHE_TTL || '3600', 10),
    enableCompression: process.env.PROXY_ENABLE_COMPRESSION !== 'false',
    maxCacheSize: parseInt(process.env.PROXY_MAX_CACHE_SIZE || '104857600', 10),
  },

  // 微信小程序配置
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_APP_SECRET || '',
  },
});
