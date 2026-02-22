import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, message, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setGlobalErrorHandler, ApiError } from '@/lib/apiClient'
import { useUIStore } from '@/stores'

function App() {
  const currentTheme = useUIStore((state) => state.currentTheme)

  useEffect(() => {
    setGlobalErrorHandler((error: ApiError) => {
      if (error.statusCode === 401) {
        return
      }
      message.error(error.message || '请求失败，请稍后重试')
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.body.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm:
            currentTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
