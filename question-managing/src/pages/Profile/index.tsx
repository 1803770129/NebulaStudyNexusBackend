/**
 * 管理员个人设置页面
 *
 * 包含个人信息编辑和密码修改
 */

import { useEffect } from 'react'
import { Card, Form, Input, Button, Space, message, Descriptions, Spin } from 'antd'
import { useAuth } from '@/hooks/useAuth'

export function ProfilePage() {
  const {
    user,
    isLoadingUser,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
    refreshProfile,
  } = useAuth()

  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // 用户信息加载后填充表单
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        email: (user as any).email || '',
      })
    }
  }, [user, profileForm])

  // 保存个人信息
  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      await updateProfile({ email: values.email })
      await refreshProfile()
      message.success('个人信息更新成功')
    } catch (error: any) {
      if (error?.message) {
        message.error(error.message)
      }
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      passwordForm.resetFields()
      message.success('密码修改成功')
    } catch (error: any) {
      if (error?.message) {
        message.error(error.message)
      }
    }
  }

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>个人设置</h2>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基本信息 */}
        <Card title="基本信息">
          <Descriptions column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="用户名">{user?.username || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">{user?.role || '-'}</Descriptions.Item>
          </Descriptions>

          <Form form={profileForm} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { type: 'email', message: '请输入正确的邮箱格式' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handleSaveProfile} loading={isUpdatingProfile}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 修改密码 */}
        <Card title="修改密码">
          <Form form={passwordForm} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少 6 个字符' },
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次密码输入不一致'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handleChangePassword} loading={isChangingPassword}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  )
}

export default ProfilePage
