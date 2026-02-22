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
      message.success('Role updated')
    } catch {
      message.error('Failed to update role')
    }
  }

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateStatus(id, !currentActive)
      message.success(currentActive ? 'User disabled' : 'User enabled')
    } catch {
      message.error('Failed to update status')
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
      message.success('Password reset successfully')
      setPasswordModalOpen(false)
      setResetUserId('')
    } catch {
      message.error('Failed to reset password')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      message.success('Deleted successfully')
    } catch {
      message.error('Delete failed')
    }
  }

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Role',
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
              { label: 'Admin', value: AdminUserRole.ADMIN },
              { label: 'User', value: AdminUserRole.USER },
            ]}
          />
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (active: boolean) =>
        active ? <Tag color="success">Active</Tag> : <Tag color="error">Disabled</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 280,
      render: (_, record) => {
        const isSelf = record.id === currentUserId
        return (
          <Space>
            <Switch
              checked={record.isActive}
              checkedChildren="Enable"
              unCheckedChildren="Disable"
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
              Reset Password
            </Button>
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={() => void handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
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
                Delete
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
        <h2 style={{ margin: 0 }}>User & Role Management</h2>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search username or email"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select<AdminUserRole | undefined>
            placeholder="Role"
            value={role}
            onChange={(val) => {
              setRole(val)
              setPage(1)
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Admin', value: AdminUserRole.ADMIN },
              { label: 'User', value: AdminUserRole.USER },
            ]}
          />
          <Select<string>
            placeholder="Status"
            value={statusValue}
            onChange={(val) => {
              setIsActive(val === 'active' ? true : val === 'disabled' ? false : undefined)
              setPage(1)
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Disabled', value: 'disabled' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
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
            showTotal: (t) => `Total ${t} users`,
            onChange: (p, s) => {
              setPage(p)
              setLimit(s)
            },
          }}
        />
      </Card>

      <Modal
        title="Reset User Password"
        open={passwordModalOpen}
        onOk={() => void handleResetPassword()}
        onCancel={() => setPasswordModalOpen(false)}
        confirmLoading={isResettingPassword}
        okText="Reset"
        cancelText="Cancel"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagePage
