import { useState } from 'react'
import { Button, Card, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router'
import { login } from '@/apis/auth'
import { useProfile } from '@/contexts/profile'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useProfile()
  const [loading, setLoading] = useState(false)

  const onFinish = async ({ name, password }: { name: string; password: string }) => {
    setLoading(true)
    try {
      await login(name, password)
      await refresh()
      message.success('登录成功')
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch {
      // 错误提示由 http 服务层统一弹出
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2c3d 0%, #2b4a6f 100%)',
      }}
    >
      <Card style={{ width: 380 }} styles={{ body: { padding: '40px 32px' } }}>
        <h1 style={{ textAlign: 'center', marginBottom: 32, fontSize: 22 }}>博客管理后台</h1>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="name" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登 录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
