import { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Popconfirm,
  Switch,
  message,
  Modal,
  Form,
} from 'antd'
import { SearchOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { AdminUserRole } from '@/types'
import type { AdminUser } from '@/types'

export function UserManagePage() {
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<AdminUserRole | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [resetUserId, setResetUserId] = useState<string>('')
  const [passwordForm] = Form.useForm<{ newPassword: string }>()

  const { user: currentUser } = useAuth()
  const {
    users,
    total,
    isLoading,
    updateRole,
    isUpdatingRole,
    updateStatus,
    isUpdatingStatus,
    resetPassword,
    isResettingPassword,
    remove,
    isDeleting,
  } = useUsers({ keyword, role, isActive, page, limit })

  const currentUserId = currentUser?.sub

  const handleSearch = () => {
    setPage(1)
  }

  const statusValue = isActive === undefined ? undefined : isActive ? 'active' : 'disabled'

  const handleRoleChange = async (id: string, nextRole: AdminUserRole) => {
    try {
      await updateRole(id, nextRole)
      message.success('角色更新成功')
    } catch {
      message.error('角色更新失败')
    }
  }

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateStatus(id, !currentActive)
      message.success(currentActive ? '用户已禁用' : '用户已启用')
    } catch {
      message.error('状态更新失败')
    }
  }

  const openResetPasswordModal = (id: string) => {
    setResetUserId(id)
    setPasswordModalOpen(true)
    passwordForm.resetFields()
  }

  const handleResetPassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      await resetPassword(resetUserId, values.newPassword)
      message.success('密码重置成功')
      setPasswordModalOpen(false)
      setResetUserId('')
    } catch {
      message.error('密码重置失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      message.success('删除成功')
    } catch {
      message.error('删除失败')
    }
  }

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (value: AdminUserRole, record) => {
        const isSelf = record.id === currentUserId
        return (
          <Select<AdminUserRole>
            value={value}
            style={{ width: 120 }}
            disabled={isSelf || isUpdatingRole}
            onChange={(nextRole) => void handleRoleChange(record.id, nextRole)}
            options={[
              { label: '管理员', value: AdminUserRole.ADMIN },
              { label: '用户', value: AdminUserRole.USER },
            ]}
          />
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (active: boolean) =>
        active ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => {
        const isSelf = record.id === currentUserId
        return (
          <Space>
            <Switch
              checked={record.isActive}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              disabled={isSelf}
              loading={isUpdatingStatus}
              onChange={() => void handleToggleStatus(record.id, record.isActive)}
            />
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              disabled={isSelf}
              loading={isResettingPassword}
              onClick={() => openResetPasswordModal(record.id)}
            >
              重置密码
            </Button>
            <Popconfirm
              title="确定删除该用户吗？"
              description="删除后不可恢复。"
              onConfirm={() => void handleDelete(record.id)}
              okText="删除"
              cancelText="取消"
              disabled={isSelf}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={isSelf}
                loading={isDeleting}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>用户与角色管理</h2>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索用户名或邮箱"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select<AdminUserRole | undefined>
            placeholder="角色"
            value={role}
            onChange={(val) => {
              setRole(val)
              setPage(1)
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '管理员', value: AdminUserRole.ADMIN },
              { label: '用户', value: AdminUserRole.USER },
            ]}
          />
          <Select<string>
            placeholder="状态"
            value={statusValue}
            onChange={(val) => {
              setIsActive(val === 'active' ? true : val === 'disabled' ? false : undefined)
              setPage(1)
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '启用', value: 'active' },
              { label: '禁用', value: 'disabled' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 个用户`,
            onChange: (p, s) => {
              setPage(p)
              setLimit(s)
            },
          }}
        />
      </Card>

      <Modal
        title="重置用户密码"
        open={passwordModalOpen}
        onOk={() => void handleResetPassword()}
        onCancel={() => setPasswordModalOpen(false)}
        confirmLoading={isResettingPassword}
        okText="重置"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少为 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagePage
