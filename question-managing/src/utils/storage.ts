/**
 * localStorage 工具函数
 * 
 * 封装 localStorage 操作，提供类型安全的存取方法
 * 处理 JSON 序列化/反序列化和异常情况
 */

import { ErrorType, type AppError } from '@/types'

/**
 * 存储错误类
 */
export class StorageError extends Error implements AppError {
  type: ErrorType = ErrorType.STORAGE_ERROR
  field?: string
  details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'StorageError'
    this.details = details
  }
}

/**
 * 从 localStorage 获取数据
 * 
 * @param key - 存储键名
 * @returns 解析后的数据，如果不存在或解析失败返回 null
 * 
 * @example
 * const questions = getItem<Question[]>('questions')
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return null
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Failed to get item from localStorage: ${key}`, error)
    return null
  }
}

/**
 * 向 localStorage 存储数据
 * 
 * @param key - 存储键名
 * @param value - 要存储的数据
 * @throws StorageError 当存储失败时抛出
 * 
 * @example
 * setItem('questions', questions)
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
  } catch (error) {
    // 处理存储配额超限等错误
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        throw new StorageError('存储空间已满，请清理部分数据', {
          originalError: error.message,
        })
      }
      throw new StorageError(`存储失败: ${error.message}`, {
        originalError: error.message,
      })
    }
    throw new StorageError('存储失败: 未知错误')
  }
}

/**
 * 从 localStorage 移除数据
 * 
 * @param key - 存储键名
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove item from localStorage: ${key}`, error)
  }
}

/**
 * 清空所有 localStorage 数据
 */
export function clearAll(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage', error)
  }
}

/**
 * 检查 localStorage 是否可用
 * 
 * @returns 是否可用
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * 获取 localStorage 已使用空间（字节）
 * 
 * @returns 已使用的字节数
 */
export function getStorageUsage(): number {
  let total = 0
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage.getItem(key)?.length ?? 0
    }
  }
  // 每个字符占用 2 字节（UTF-16）
  return total * 2
}
