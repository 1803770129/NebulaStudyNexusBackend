/**
 * 应用根组件
 * 
 * 配置全局 Provider 和路由
 */

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, message } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setGlobalErrorHandler, ApiError } from '@/lib/apiClient'

function App() {
  // 初始化全局错误处理器
  useEffect(() => {
    setGlobalErrorHandler((error: ApiError) => {
      // 401 错误不显示提示（由认证逻辑处理）
      if (error.statusCode === 401) {
        return;
      }
      // 显示错误提示
      message.error(error.message || '请求失败，请稍后重试');
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
