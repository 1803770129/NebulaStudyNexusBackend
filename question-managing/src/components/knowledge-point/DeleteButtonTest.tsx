/**
 * 删除按钮测试组件
 * 用于调试删除按钮点击无反应的问题
 */

import { Button, Modal, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export function DeleteButtonTest() {
  const handleSimpleClick = () => {
    console.log('简单按钮被点击')
    message.info('简单按钮被点击')
  }

  const handleModalClick = () => {
    console.log('Modal 按钮被点击')
    
    Modal.confirm({
      title: '测试确认对话框',
      content: '这是一个测试对话框，用于验证 Modal.confirm 是否正常工作',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        console.log('确认按钮被点击')
        message.success('确认按钮被点击')
      },
      onCancel: () => {
        console.log('取消按钮被点击')
        message.info('取消按钮被点击')
      },
    })
  }

  const handleAsyncModalClick = () => {
    console.log('异步 Modal 按钮被点击')
    
    Modal.confirm({
      title: '测试异步操作',
      content: '这是一个测试异步操作的对话框',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        console.log('开始异步操作')
        message.info('开始异步操作...')
        
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log('异步操作完成')
        message.success('异步操作完成')
      },
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>删除按钮测试</h2>
      <p>请依次点击以下按钮，并查看浏览器控制台的日志输出</p>
      
      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexDirection: 'column', maxWidth: 400 }}>
        <Button type="primary" onClick={handleSimpleClick}>
          测试 1: 简单按钮点击
        </Button>
        
        <Button type="default" onClick={handleModalClick}>
          测试 2: Modal.confirm 对话框
        </Button>
        
        <Button type="default" onClick={handleAsyncModalClick}>
          测试 3: 异步 Modal.confirm
        </Button>
        
        <Button 
          danger 
          icon={<DeleteOutlined />}
          onClick={handleModalClick}
        >
          测试 4: 危险按钮 + Modal
        </Button>
      </div>
      
      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
        <h3>测试说明：</h3>
        <ol>
          <li>点击"测试 1"应该显示一个消息提示</li>
          <li>点击"测试 2"应该显示一个确认对话框</li>
          <li>点击"测试 3"应该显示一个确认对话框，点击确认后会等待 2 秒</li>
          <li>点击"测试 4"应该显示一个确认对话框（与测试 2 相同）</li>
        </ol>
        <p><strong>如果所有测试都正常工作，说明 Modal 和 Button 组件本身没有问题。</strong></p>
      </div>
    </div>
  )
}

export default DeleteButtonTest
