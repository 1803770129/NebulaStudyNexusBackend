# 用户管理模块 - 前端开发指南

> 在后端 Step 1-7 全部完成并通过 Swagger 测试后，再开始前端开发  
> 前端项目路径：`question-managing/`

---

## Step 1：新增类型定义

### 修改 `src/types/index.ts`

在文件末尾追加：

```typescript
// ==================== 用户管理类型 ====================

/** 管理员/员工信息 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 学生信息 */
export interface StudentInfo {
  id: string;
  phone: string | null;
  wxOpenid: string | null;
  nickname: string;
  avatar: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 用户筛选参数 */
export interface UserFilters {
  keyword?: string;
  role?: "admin" | "user";
  isActive?: boolean;
  page: number;
  pageSize: number;
}

/** 学生筛选参数 */
export interface StudentFilters {
  keyword?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}
```

---

## Step 2：新建 API Service 层

### 2.1 新建 `src/services/userService.ts`

参照 `src/services/authService.ts` 的模式，使用 `getApiClient()` 封装：

```typescript
import { getApiClient } from "@/lib/apiClient";
import type { UserInfo, UserFilters, PaginatedResponse } from "@/types";

/** 获取用户列表 */
export async function getUsers(
  filters: UserFilters,
): Promise<PaginatedResponse<UserInfo>> {
  const api = getApiClient();
  const params: Record<string, any> = {
    page: filters.page,
    pageSize: filters.pageSize,
  };
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.role) params.role = filters.role;
  if (filters.isActive !== undefined) params.isActive = filters.isActive;

  const response = await api.get<PaginatedResponse<UserInfo>>("/users", {
    params,
  });
  return response;
}

/** 获取用户详情 */
export async function getUserById(id: string): Promise<UserInfo> {
  const api = getApiClient();
  const response = await api.get<{ data: UserInfo }>(`/users/${id}`);
  return response.data;
}

/** 修改角色 */
export async function updateUserRole(
  id: string,
  role: string,
): Promise<UserInfo> {
  const api = getApiClient();
  const response = await api.patch<{ data: UserInfo }>(`/users/${id}/role`, {
    role,
  });
  return response.data;
}

/** 启用/禁用 */
export async function updateUserStatus(
  id: string,
  isActive: boolean,
): Promise<UserInfo> {
  const api = getApiClient();
  const response = await api.patch<{ data: UserInfo }>(`/users/${id}/status`, {
    isActive,
  });
  return response.data;
}

/** 重置密码 */
export async function resetUserPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  const api = getApiClient();
  await api.patch(`/users/${id}/reset-password`, { newPassword });
}

/** 删除用户 */
export async function deleteUser(id: string): Promise<void> {
  const api = getApiClient();
  await api.delete(`/users/${id}`);
}
```

> [!NOTE]
> 注意检查后端响应格式：NestJS 有全局拦截器包装了 `{ statusCode, message, data }` 格式，所以 `response.data` 可能需要额外解构。参照 `authService.ts` 中的处理方式来写。

### 2.2 新建 `src/services/studentService.ts`

```typescript
import { getApiClient } from "@/lib/apiClient";
import type { StudentInfo, StudentFilters, PaginatedResponse } from "@/types";

/** 获取学生列表 */
export async function getStudents(
  filters: StudentFilters,
): Promise<PaginatedResponse<StudentInfo>> {
  const api = getApiClient();
  const params: Record<string, any> = {
    page: filters.page,
    pageSize: filters.pageSize,
  };
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.isActive !== undefined) params.isActive = filters.isActive;

  const response = await api.get<PaginatedResponse<StudentInfo>>("/students", {
    params,
  });
  return response;
}

/** 启用/禁用学生 */
export async function updateStudentStatus(
  id: string,
  isActive: boolean,
): Promise<StudentInfo> {
  const api = getApiClient();
  const response = await api.patch<{ data: StudentInfo }>(
    `/students/${id}/status`,
    { isActive },
  );
  return response.data;
}

/** 删除学生 */
export async function deleteStudent(id: string): Promise<void> {
  const api = getApiClient();
  await api.delete(`/students/${id}`);
}
```

---

## Step 3：新建 Hooks 层

### 3.1 新建 `src/hooks/useUsers.ts`

参照 `src/hooks/useAuth.ts` 的 TanStack Query 模式：

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import * as userService from "@/services/userService";
import type { UserFilters } from "@/types";

const USERS_QUERY_KEY = "users";

/** 用户列表 Hook */
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => userService.getUsers(filters),
  });
}

/** 修改角色 Hook */
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      userService.updateUserRole(id, role),
    onSuccess: () => {
      message.success("角色修改成功");
      qc.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (err: any) => message.error(err.message || "操作失败"),
  });
}

/** 启用/禁用 Hook */
export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUserStatus(id, isActive),
    onSuccess: () => {
      message.success("状态更新成功");
      qc.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (err: any) => message.error(err.message || "操作失败"),
  });
}

/** 重置密码 Hook */
export function useResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      userService.resetUserPassword(id, newPassword),
    onSuccess: () => {
      message.success("密码重置成功");
      qc.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (err: any) => message.error(err.message || "操作失败"),
  });
}

/** 删除用户 Hook */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      message.success("用户已删除");
      qc.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (err: any) => message.error(err.message || "操作失败"),
  });
}
```

### 3.2 新建 `src/hooks/useStudents.ts`

模式同上，调用 `studentService`。导出 `useStudents`、`useUpdateStudentStatus`、`useDeleteStudent`。

---

## Step 4：新建页面

### 4.1 新建 `src/pages/UserManage/index.tsx`

参照 `src/pages/QuestionList/index.tsx` 的结构：

```
页面结构：
├── 顶部标题 "员工管理"
├── 筛选栏
│   ├── Input.Search（关键词搜索）
│   ├── Select（角色筛选：全部/管理员/普通用户）
│   └── Select（状态筛选：全部/启用/禁用）
├── Table
│   ├── 列：用户名、邮箱、角色(Tag)、状态(Badge)、创建时间、操作
│   └── 操作：修改角色按钮、Switch(启用/禁用)、重置密码、删除
└── Pagination
```

关键实现要点：

- 使用 `useState` 管理 `UserFilters` 筛选状态
- 使用 `useUsers(filters)` 获取列表数据
- 修改角色：`Modal` + `Select` 弹窗 → `useUpdateUserRole()`
- 重置密码：`Modal` + `Input.Password` 弹窗 → `useResetUserPassword()`
- 删除：`Modal.confirm` 二次确认 → `useDeleteUser()`
- 启用/禁用：`Switch` + `Popconfirm` → `useUpdateUserStatus()`

> [!IMPORTANT]
> 角色列使用 `Tag` 组件显示，admin 用红色，user 用蓝色。状态列使用 `Badge`，启用绿色，禁用灰色。

### 4.2 新建 `src/pages/StudentManage/index.tsx`

结构同上，但：

- 没有角色列和角色修改
- 没有重置密码功能
- 显示昵称、手机号（脱敏）、登录方式（微信/手机号）、最后登录时间
- 只有启用/禁用和删除操作

---

## Step 5：路由和菜单

### 5.1 修改 `src/router/index.tsx`

```diff
+ const UserManagePage = lazy(() => import('@/pages/UserManage'))
+ const StudentManagePage = lazy(() => import('@/pages/StudentManage'))

  // 在 children 数组中，knowledge-points 路由后面添加：
+ {
+   path: 'users',
+   element: withSuspense(UserManagePage),
+ },
+ {
+   path: 'students',
+   element: withSuspense(StudentManagePage),
+ },
```

### 5.2 修改 `src/components/layout/MainLayout.tsx`

在菜单项数组中新增（现有代码约在第 93 行附近的 `menuItems` 数组）：

```typescript
import { TeamOutlined, UserOutlined } from '@ant-design/icons';

// 在 menuItems 数组末尾添加：
{
  key: '/users',
  icon: <TeamOutlined />,
  label: '员工管理',
},
{
  key: '/students',
  icon: <UserOutlined />,
  label: '学生管理',
},
```

**权限过滤**：根据当前用户角色过滤菜单项。需要在 MainLayout 中获取用户信息：

```typescript
import { useAuth } from "@/hooks/useAuth";

// 在组件内：
const { user } = useAuth();

// 过滤菜单：
const filteredMenuItems = menuItems.filter((item) => {
  if (item.key === "/users" || item.key === "/students") {
    return user?.role === "admin";
  }
  return true;
});

// Sider 中使用 filteredMenuItems 而不是 menuItems
```

---

## Step 6：验证清单

```
□ 管理员登录后侧边栏显示"员工管理"和"学生管理"
□ 普通用户登录后侧边栏不显示这两个菜单
□ 员工管理页面：列表加载正常、筛选生效、分页正常
□ 修改角色弹窗→调接口成功→列表刷新
□ 启用/禁用 Switch→二次确认→状态切换
□ 重置密码弹窗→提交→接口成功
□ 删除→二次确认→列表刷新
□ 学生管理页面：列表加载、筛选、禁用、删除
□ 普通用户直接访问 /users 应无数据或 403
```

---

## 常见问题

### Q: 后端响应格式怎么处理？

检查项目中 `apiClient.ts` 是否有全局拦截器自动解包 `{ data }` 层。如果有则 Service 代码中不需要 `.data` 解构；如果没有则需要。先用 `console.log` 看实际响应。

### Q: Token 中没有 role 怎么判断权限？

当前 `/auth/profile` 返回的是 JWT payload（含 role），`useAuth` 的 `user` 对象中有 `role` 字段。确保 `MainLayout` 中能获取到。

### Q: 手机号脱敏怎么做？

```typescript
const maskPhone = (phone: string) =>
  phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "-";
```
