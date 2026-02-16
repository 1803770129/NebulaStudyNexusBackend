/**
 * 学生管理页面
 *
 * 管理员查看、搜索、启禁用、删除学生
 */

import { useState } from 'react'
import { Card, Table, Tag, Space, Button, Input, Select, Popconfirm, Switch, message } from 'antd'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useStudents } from '@/hooks/useStudents'
import type { Student } from '@/types'
import dayjs from 'dayjs'

export function StudentManagePage() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const {
    students,
    total,
    isLoading,
    updateStatus,
    isUpdatingStatus,
    remove,
    isDeleting,
  } = useStudents({ keyword, isActive, page, limit })

  // 搜索
  const handleSearch = () => {
    setPage(1)
  }

  // 切换状态
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateStatus(id, !currentActive)
      message.success(currentActive ? '已禁用' : '已启用')
    } catch {
      message.error('操作失败')
    }
  }

  // 删除学生
  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      message.success('删除成功')
    } catch {
      message.error('删除失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<Student> = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 150,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string | null) => phone || <span style={{ color: '#999' }}>未绑定</span>,
    },
    {
      title: '微信',
      dataIndex: 'wxOpenid',
      key: 'wxOpenid',
      width: 100,
      render: (openid: string | null) =>
        openid ? (
          <Tag color="green">已绑定</Tag>
        ) : (
          <Tag>未绑定</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean) =>
        active ? <Tag color="success">正常</Tag> : <Tag color="error">已禁用</Tag>,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 170,
      render: (date: string | null) =>
        date ? dayjs(date).format('YYYY-MM-DD HH:mm') : <span style={{ color: '#999' }}>从未登录</span>,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.isActive}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            loading={isUpdatingStatus}
            onChange={() => handleToggleStatus(record.id, record.isActive)}
          />
          <Popconfirm
            title="确定要删除该学生吗？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>学生管理</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索昵称或手机号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="账号状态"
            value={isActive}
            onChange={(val) => {
              setIsActive(val)
              setPage(1)
            }}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '正常', value: true },
              { label: '已禁用', value: false },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Card>

      {/* 学生列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 名学生`,
            onChange: (p, s) => {
              setPage(p)
              setLimit(s)
            },
          }}
        />
      </Card>
    </div>
  )
}

export default StudentManagePage
