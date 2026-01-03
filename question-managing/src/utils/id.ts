/**
 * ID 生成工具
 * 
 * 生成唯一标识符，用于新建实体时的 ID 分配
 */

/**
 * 生成唯一 ID
 * 使用时间戳 + 随机数的组合确保唯一性
 * 
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${randomPart}`
}

/**
 * 生成短 ID（用于选项等）
 * 
 * @returns 短 ID 字符串
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8)
}
