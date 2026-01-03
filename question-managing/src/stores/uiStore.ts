/**
 * UI 状态存储
 * 
 * 使用 Zustand 管理全局 UI 状态
 * 包括侧边栏折叠状态、主题等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/constants'

/**
 * UI 状态接口
 */
interface UIState {
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean
  /** 当前主题 */
  currentTheme: 'light' | 'dark'
}

/**
 * UI 操作接口
 */
interface UIActions {
  /** 切换侧边栏折叠状态 */
  toggleSidebar: () => void
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** 设置主题 */
  setTheme: (theme: 'light' | 'dark') => void
  /** 切换主题 */
  toggleTheme: () => void
}

/**
 * UI Store
 * 
 * 使用 persist 中间件将状态持久化到 localStorage
 */
export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // 初始状态
      sidebarCollapsed: false,
      currentTheme: 'light',

      // 操作方法
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setTheme: (theme) =>
        set({ currentTheme: theme }),

      toggleTheme: () =>
        set((state) => ({
          currentTheme: state.currentTheme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
    }
  )
)
