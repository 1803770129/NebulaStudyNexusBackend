/**
 * 自定义确认对话框组件
 * 
 * 用于替代 Modal.confirm，解决 React 19 兼容性问题
 */

import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

interface ConfirmDialogProps {
  /** 是否显示对话框 */
  open: boolean
  /** 标题 */
  title: string
  /** 内容 */
  content: React.ReactNode
  /** 确认按钮文本 */
  okText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮类型 */
  okType?: 'primary' | 'danger'
  /** 确认回调 */
  onOk?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
}

/**
 * 确认对话框组件
 * 
 * 使用 Modal 组件实现，兼容 React 19
 */
export function ConfirmDialog({
  open,
  title,
  content,
  okText = '确定',
  cancelText = '取消',
  okType = 'primary',
  onOk,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    if (!onOk) return

    try {
      setLoading(true)
      await onOk()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22 }} />
          <span>{title}</span>
        </div>
      }
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger: okType === 'danger' }}
    >
      {content}
    </Modal>
  )
}

/**
 * 使用确认对话框的 Hook
 * 
 * 提供类似 Modal.confirm 的 API
 */
export function useConfirmDialog() {
  const [config, setConfig] = useState<{
    open: boolean
    title: string
    content: React.ReactNode
    okText?: string
    cancelText?: string
    okType?: 'primary' | 'danger'
    onOk?: () => void | Promise<void>
  }>({
    open: false,
    title: '',
    content: null,
  })

  const confirm = (options: {
    title: string
    content: React.ReactNode
    okText?: string
    cancelText?: string
    okType?: 'primary' | 'danger'
    onOk?: () => void | Promise<void>
  }) => {
    setConfig({
      ...options,
      open: true,
    })
  }

  const handleCancel = () => {
    setConfig(prev => ({ ...prev, open: false }))
  }

  const handleOk = async () => {
    if (config.onOk) {
      await config.onOk()
    }
    setConfig(prev => ({ ...prev, open: false }))
  }

  const dialog = (
    <ConfirmDialog
      open={config.open}
      title={config.title}
      content={config.content}
      okText={config.okText}
      cancelText={config.cancelText}
      okType={config.okType}
      onOk={handleOk}
      onCancel={handleCancel}
    />
  )

  return { confirm, dialog }
}

export default ConfirmDialog
