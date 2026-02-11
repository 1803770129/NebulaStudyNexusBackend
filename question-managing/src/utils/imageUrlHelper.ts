/**
 * 图片 URL 处理工具
 * 
 * 用于处理富文本内容中的图片 URL，确保图片能正确显示
 */

/**
 * 获取 API 基础 URL（去掉 /api 后缀）
 */
export const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api$/, '');
};

/**
 * 将内容中的相对图片路径转换为完整 URL
 * 
 * @param html - HTML 内容
 * @returns 转换后的 HTML 内容
 * 
 * @example
 * // 输入: <img src="/upload/images/xxx.jpg" />
 * // 输出: <img src="http://localhost:3000/upload/images/xxx.jpg" />
 * 
 * // 输入: <img src="/api/upload/images/xxx.jpg" />
 * // 输出: <img src="http://localhost:3000/api/upload/images/xxx.jpg" />
 */
export const convertImageUrls = (html: string): string => {
  if (!html) return html;
  
  const baseUrl = getBaseUrl();
  
  // 处理相对路径的图片
  return html.replace(
    /src=["'](\/(?:api\/)?upload\/images\/[^"']+)["']/g,
    (match, path) => {
      // 如果路径已经包含 /api，直接使用
      // 否则添加 /api 前缀
      const fullPath = path.startsWith('/api') ? path : `/api${path}`;
      return `src="${baseUrl}${fullPath}"`;
    }
  );
};

/**
 * 检查 URL 是否为完整 URL
 */
export const isFullUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * 转换单个图片 URL
 * 
 * @param url - 图片 URL
 * @returns 完整的图片 URL
 */
export const convertSingleImageUrl = (url: string): string => {
  if (!url || isFullUrl(url)) {
    return url;
  }
  
  const baseUrl = getBaseUrl();
  const fullPath = url.startsWith('/api') ? url : `/api${url}`;
  return `${baseUrl}${fullPath}`;
};
