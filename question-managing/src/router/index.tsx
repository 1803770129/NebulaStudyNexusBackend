/**
 * 路由配置
 * 
 * 使用 React Router 7 配置应用路由
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/AuthGuard'

// 懒加载页面组件
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

const LoginPage = lazy(() => import('@/pages/Login'))
const HomePage = lazy(() => import('@/pages/Home'))
const QuestionListPage = lazy(() => import('@/pages/QuestionList'))
const QuestionFormPage = lazy(() => import('@/pages/QuestionForm'))
const CategoryManagePage = lazy(() => import('@/pages/CategoryManage'))
const TagManagePage = lazy(() => import('@/pages/TagManage'))
const KnowledgePointManage = lazy(() => import('@/pages/KnowledgePointManage'))
const StudentManagePage = lazy(() => import('@/pages/StudentManage'))
const UserManagePage = lazy(() => import('@/pages/UserManage'))
const PracticeSessionManagePage = lazy(() => import('@/pages/PracticeSessionManage'))
const ManualGradingManagePage = lazy(() => import('@/pages/ManualGradingManage'))
const ReviewTaskManagePage = lazy(() => import('@/pages/ReviewTaskManage'))
const ExamPaperManagePage = lazy(() => import('@/pages/ExamPaperManage'))
const ExamAttemptManagePage = lazy(() => import('@/pages/ExamAttemptManage'))
const ProfilePage = lazy(() => import('@/pages/Profile'))

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
    <Spin size="large" />
  </div>
)

// 包装懒加载组件
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'questions',
        children: [
          {
            index: true,
            element: withSuspense(QuestionListPage),
          },
          {
            path: 'create',
            element: withSuspense(QuestionFormPage),
          },
          {
            path: 'edit/:id',
            element: withSuspense(QuestionFormPage),
          },
        ],
      },
      {
        path: 'categories',
        element: withSuspense(CategoryManagePage),
      },
      {
        path: 'tags',
        element: withSuspense(TagManagePage),
      },
      {
        path: 'knowledge-points',
        element: withSuspense(KnowledgePointManage),
      },
      {
        path: 'students',
        element: withSuspense(StudentManagePage),
      },
      {
        path: 'users',
        element: withSuspense(UserManagePage),
      },
      {
        path: 'practice-sessions',
        element: withSuspense(PracticeSessionManagePage),
      },
      {
        path: 'grading-tasks',
        element: withSuspense(ManualGradingManagePage),
      },
      {
        path: 'review-tasks',
        element: withSuspense(ReviewTaskManagePage),
      },
      {
        path: 'exam-papers',
        element: withSuspense(ExamPaperManagePage),
      },
      {
        path: 'exam-attempts',
        element: withSuspense(ExamAttemptManagePage),
      },
      {
        path: 'profile',
        element: withSuspense(ProfilePage),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
