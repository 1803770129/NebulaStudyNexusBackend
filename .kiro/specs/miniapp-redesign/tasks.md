# Implementation Tasks

## Phase 1: 项目基础架构重构

### Task 1.1: 更新项目配置和依赖
- [x] 更新 `package.json`，升级 uni-app x 到最新版本
- [x] 添加 SCSS 支持依赖
- [x] 添加 fast-check 属性测试依赖
- [x] 配置 Vitest 测试框架
- [x] 更新 `tsconfig.json` 配置路径别名

### Task 1.2: 创建样式系统
- [x] 创建 `src/styles/variables.scss` 定义设计变量（颜色、间距、字体等）
- [x] 创建 `src/styles/mixins.scss` 定义常用混入
- [x] 创建 `src/styles/animations.scss` 定义动画效果
- [x] 创建 `src/styles/theme.scss` 定义主题系统（浅色/深色）

### Task 1.3: 创建类型定义
- [x] 更新 `src/types/question.ts` 定义题目相关类型
- [x] 创建 `src/types/statistics.ts` 定义统计相关类型
- [x] 创建 `src/types/user.ts` 定义用户相关类型
- [x] 创建 `src/types/errors.ts` 定义错误类型

### Task 1.4: 创建工具函数
- [x] 更新 `src/utils/request.ts` 添加请求去重和缓存
- [x] 创建 `src/utils/storage.ts` 封装存储操作
- [x] 创建 `src/utils/cache.ts` 实现缓存管理
- [x] 创建 `src/utils/offline.ts` 实现离线队列
- [x] 创建 `src/utils/statistics.ts` 实现统计计算函数

## Phase 2: 通用组件开发

### Task 2.1: 创建 ProgressRing 环形进度条组件
- [x] 创建 `src/components/common/ProgressRing.vue`
- [x] 实现 SVG 环形进度绘制
- [x] 支持动画效果和自定义颜色
- [x] 支持中心内容插槽

### Task 2.2: 创建 SkeletonLoader 骨架屏组件
- [x] 创建 `src/components/common/SkeletonLoader.vue`
- [x] 实现多种骨架类型（文本、图片、卡片）
- [x] 支持闪烁动画效果

### Task 2.3: 创建 EmptyState 空状态组件
- [x] 创建 `src/components/common/EmptyState.vue`
- [x] 支持自定义图标和文案
- [x] 支持操作按钮插槽

### Task 2.4: 创建 PullRefresh 下拉刷新组件
- [x] 创建 `src/components/common/PullRefresh.vue`
- [x] 实现自定义下拉动画
- [x] 支持刷新状态回调

### Task 2.5: 创建 VirtualList 虚拟滚动组件
- [x] 创建 `src/components/common/VirtualList.vue`
- [x] 实现虚拟滚动逻辑
- [x] 支持动态高度项目

## Phase 3: 题目相关组件开发

### Task 3.1: 创建 RichContent 富文本渲染组件
- [x] 创建 `src/components/question/RichContent.vue`
- [x] 支持 HTML 内容渲染
- [x] 支持图片懒加载
- [ ] 支持 LaTeX 公式渲染（可选）

### Task 3.2: 创建 OptionItem 选项组件
- [x] 创建 `src/components/question/OptionItem.vue`
- [x] 支持单选/多选样式
- [x] 支持选中、正确、错误状态
- [x] 实现状态切换动画

### Task 3.3: 创建 QuestionCard 题目卡片组件
- [x] 创建 `src/components/question/QuestionCard.vue`
- [x] 集成 RichContent 和 OptionItem
- [x] 支持所有题目类型（单选、多选、判断、填空、简答）
- [x] 实现答案提交和反馈显示

### Task 3.4: 创建 AnswerFeedback 答案反馈组件
- [x] 创建 `src/components/question/AnswerFeedback.vue`
- [x] 显示正确/错误状态
- [x] 显示正确答案和解析
- [x] 实现展开动画

### Task 3.5: 创建 QuestionNavigator 题目导航器组件
- [x] 创建 `src/components/question/QuestionNavigator.vue`
- [x] 显示题目网格
- [x] 标记已答、正确、错误状态
- [x] 支持点击跳转

## Phase 4: 统计相关组件开发

### Task 4.1: 创建 StudyCalendar 学习日历组件
- [x] 创建 `src/components/statistics/StudyCalendar.vue`
- [x] 显示周视图日历
- [x] 标记有学习记录的日期
- [x] 显示连续天数

### Task 4.2: 创建 LineChart 折线图组件
- [x] 创建 `src/components/statistics/LineChart.vue`
- [x] 使用 Canvas 绘制折线图
- [x] 支持触摸查看数据点

### Task 4.3: 创建 CategoryAccuracy 分类正确率组件
- [x] 创建 `src/components/statistics/CategoryAccuracy.vue`
- [x] 显示分类列表和正确率进度条
- [x] 标记薄弱分类

## Phase 5: 状态管理重构

### Task 5.1: 重构 User Store
- [x] 更新 `src/stores/user.ts`
- [x] 实现状态持久化
- [x] 添加 token 自动刷新逻辑
- [x] 添加数据同步逻辑

### Task 5.2: 重构 Study Store
- [x] 更新 `src/stores/study.ts`
- [x] 实现学习会话管理
- [x] 实现答题记录管理
- [x] 实现会话统计计算

### Task 5.3: 创建 WrongBook Store
- [x] 创建 `src/stores/wrongBook.ts`
- [x] 实现错题自动收集
- [x] 实现分类分组
- [x] 实现掌握标记逻辑

### Task 5.4: 创建 Favorites Store
- [x] 创建 `src/stores/favorites.ts`
- [x] 实现收藏管理
- [x] 实现分类分组

### Task 5.5: 创建 Statistics Store
- [x] 创建 `src/stores/statistics.ts`
- [x] 实现统计数据计算
- [x] 实现连续天数计算
- [x] 实现薄弱分类识别

### Task 5.6: 创建 Settings Store
- [x] 创建 `src/stores/settings.ts`
- [x] 实现主题设置
- [x] 实现学习目标设置
- [x] 实现提醒设置

## Phase 6: 页面重构 - 首页

### Task 6.1: 重构首页布局
- [x] 更新 `src/pages/index/index.vue`
- [x] 实现顶部问候语区域
- [x] 集成 ProgressRing 显示每日进度
- [x] 实现今日统计卡片

### Task 6.2: 实现首页快速入口
- [x] 添加随机刷题、分类刷题、错题复习入口卡片
- [x] 实现继续学习提示（未完成会话）
- [x] 添加学习日历组件

### Task 6.3: 实现首页推荐区域
- [x] 显示薄弱分类推荐
- [ ] 显示热门分类
- [x] 实现下拉刷新

## Phase 7: 页面重构 - 分类页

### Task 7.1: 重构分类页布局
- [x] 更新 `src/pages/category/index.vue`
- [x] 实现树形分类展示
- [x] 显示每个分类的题目数量和完成进度

### Task 7.2: 实现分类交互
- [x] 实现分类展开/收起
- [x] 实现分类点击进入题目列表
- [x] 添加搜索功能

## Phase 8: 页面重构 - 题目列表页

### Task 8.1: 重构题目列表页
- [x] 更新 `src/pages/question/list.vue`
- [x] 实现筛选栏（难度、类型、状态）
- [x] 实现排序功能
- [x] 集成 VirtualList 虚拟滚动

### Task 8.2: 实现题目卡片列表
- [x] 显示题目预览卡片
- [x] 显示题目类型、难度标签
- [x] 显示完成状态标记

## Phase 9: 页面重构 - 答题页

### Task 9.1: 重构答题页布局
- [x] 更新 `src/pages/question/detail.vue`
- [x] 实现顶部进度条
- [x] 集成 QuestionCard 组件
- [x] 实现底部操作栏

### Task 9.2: 实现答题交互
- [x] 实现滑动切换题目
- [x] 实现题目导航器弹窗
- [x] 实现收藏按钮
- [x] 实现答案提交和反馈

### Task 9.3: 实现答题完成流程
- [x] 实现完成弹窗显示统计
- [x] 实现错题自动收集
- [x] 实现返回或继续选择

## Phase 10: 新增页面 - 错题本

### Task 10.1: 创建错题本页面
- [x] 创建 `src/pages/wrong-book/index.vue`
- [x] 实现分类分组展示
- [x] 显示错题数量和错误次数

### Task 10.2: 实现错题本功能
- [x] 实现错题复习模式
- [x] 实现掌握标记
- [x] 实现批量删除已掌握

## Phase 11: 新增页面 - 收藏页

### Task 11.1: 创建收藏页面
- [x] 创建 `src/pages/favorites/index.vue`
- [x] 实现分类分组展示
- [x] 实现取消收藏功能

### Task 11.2: 实现收藏刷题模式
- [x] 实现收藏题目刷题入口
- [x] 复用答题页逻辑

## Phase 12: 新增页面 - 统计页

### Task 12.1: 创建统计页面
- [x] 创建 `src/pages/statistics/index.vue`
- [x] 显示总体统计数据
- [x] 集成 StudyCalendar 组件

### Task 12.2: 实现统计图表
- [x] 集成 LineChart 显示30天趋势
- [x] 集成 CategoryAccuracy 显示分类正确率
- [x] 显示薄弱分类提示

## Phase 13: 页面重构 - 个人中心

### Task 13.1: 重构个人中心页面
- [x] 更新 `src/pages/user/index.vue`
- [x] 实现用户信息卡片
- [x] 实现统计概览

### Task 13.2: 实现设置功能
- [x] 实现主题切换
- [x] 实现学习目标设置
- [x] 实现清除缓存功能

## Phase 14: 页面配置更新

### Task 14.1: 更新页面配置
- [x] 更新 `src/pages.json` 添加新页面
- [x] 更新 TabBar 配置（首页、刷题、错题本、我的）
- [x] 配置页面导航栏样式

### Task 14.2: 添加 TabBar 图标
- [x] 添加首页图标（active/inactive）
- [x] 添加分类图标
- [x] 添加错题本图标
- [x] 添加我的图标

## Phase 15: 离线支持

### Task 15.1: 实现题目缓存
- [x] 实现浏览题目自动缓存
- [x] 实现缓存容量管理
- [x] 实现智能缓存淘汰

### Task 15.2: 实现离线答题
- [x] 实现离线答案队列
- [x] 实现网络恢复自动同步
- [x] 实现网络状态提示

## Phase 16: 测试

### Task 16.1: 编写属性测试
- [ ] 创建 `tests/property/statistics.pbt.spec.ts` 测试统计计算
- [ ] 创建 `tests/property/filtering.pbt.spec.ts` 测试筛选逻辑
- [ ] 创建 `tests/property/wrongBook.pbt.spec.ts` 测试错题本逻辑

### Task 16.2: 编写单元测试
- [ ] 测试 Store 逻辑
- [ ] 测试工具函数
- [ ] 测试 Composables

### Task 16.3: 编写组件测试
- [ ] 测试 QuestionCard 组件
- [ ] 测试 ProgressRing 组件
- [ ] 测试 OptionItem 组件
